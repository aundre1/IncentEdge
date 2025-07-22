import { db } from './db';
import { incentives, programUpdates, monitoringSchedule } from '@shared/schema';
import { eq, and, lt, isNull, or } from 'drizzle-orm';
import OpenAI from 'openai';

interface DataUpdate {
  incentiveId: number;
  type: 'deadline' | 'amount' | 'status' | 'availability';
  oldValue: string;
  newValue: string;
  confidence: 'low' | 'medium' | 'high';
  source: string;
}

export class DataMonitoringService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Set up monitoring schedule for verified programs
  async setupMonitoringSchedule() {
    try {
      console.log('Setting up monitoring schedule for verified programs...');
      
      // Get all Level 4-5 programs (high priority monitoring)
      const highPriorityPrograms = await db
        .select()
        .from(incentives)
        .where(and(
          eq(incentives.verificationLevel, 4),
          or(eq(incentives.verificationLevel, 5))
        ));

      const scheduleInserts = [];
      
      for (const program of highPriorityPrograms) {
        // Schedule deadline monitoring (weekly for high priority)
        scheduleInserts.push({
          incentiveId: program.id,
          checkType: 'deadline',
          frequency: 'weekly',
          nextCheck: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          priority: 'high',
          automated: true,
          active: true
        });

        // Schedule amount verification (monthly)
        scheduleInserts.push({
          incentiveId: program.id,
          checkType: 'amount',
          frequency: 'monthly',
          nextCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
          priority: 'medium',
          automated: true,
          active: true
        });

        // Schedule status monitoring (weekly)
        scheduleInserts.push({
          incentiveId: program.id,
          checkType: 'status',
          frequency: 'weekly',
          nextCheck: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          priority: 'high',
          automated: true,
          active: true
        });
      }

      await db.insert(monitoringSchedule).values(scheduleInserts);
      console.log(`Set up monitoring for ${highPriorityPrograms.length} high-priority programs`);
      
    } catch (error) {
      console.error('Error setting up monitoring schedule:', error);
      throw error;
    }
  }

  // Check programs due for monitoring
  async checkDuePrograms() {
    try {
      const dueChecks = await db
        .select({
          id: monitoringSchedule.id,
          incentiveId: monitoringSchedule.incentiveId,
          checkType: monitoringSchedule.checkType,
          priority: monitoringSchedule.priority,
          program: incentives
        })
        .from(monitoringSchedule)
        .innerJoin(incentives, eq(monitoringSchedule.incentiveId, incentives.id))
        .where(and(
          lt(monitoringSchedule.nextCheck, new Date()),
          eq(monitoringSchedule.active, true)
        ))
        .limit(10); // Process 10 at a time

      console.log(`Found ${dueChecks.length} programs due for monitoring`);

      for (const check of dueChecks) {
        await this.performDataCheck(check);
      }

      return dueChecks.length;
    } catch (error) {
      console.error('Error checking due programs:', error);
      throw error;
    }
  }

  // Perform individual data check
  private async performDataCheck(check: any) {
    try {
      console.log(`Checking ${check.checkType} for program: ${check.program.name}`);

      let nextCheckDate: Date;
      const now = new Date();

      // Calculate next check date based on frequency
      switch (check.frequency || 'weekly') {
        case 'daily':
          nextCheckDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
          nextCheckDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          nextCheckDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          nextCheckDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      }

      // Update the schedule for next check
      await db
        .update(monitoringSchedule)
        .set({
          lastCheck: now,
          nextCheck: nextCheckDate
        })
        .where(eq(monitoringSchedule.id, check.id));

      // Update program's last data check
      await db
        .update(incentives)
        .set({
          lastDataCheck: now,
          nextCheckDue: nextCheckDate
        })
        .where(eq(incentives.id, check.incentiveId));

      // If the program has an application URL, we can attempt to verify current data
      if (check.program.applicationUrl && check.checkType === 'status') {
        await this.verifyProgramAvailability(check.program);
      }

    } catch (error) {
      console.error(`Error performing data check for program ${check.incentiveId}:`, error);
    }
  }

  // Verify program availability by checking its URL
  private async verifyProgramAvailability(program: any) {
    try {
      if (!program.applicationUrl) return;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(program.applicationUrl, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const status = response.ok ? 'active' : 'unavailable';
      const confidence = response.ok ? 'medium' : 'high';

      if (program.status !== status) {
        // Record the status change
        await this.recordUpdate({
          incentiveId: program.id,
          type: 'status',
          oldValue: program.status,
          newValue: status,
          confidence,
          source: 'automated_url_check'
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`Could not verify URL for program ${program.id}: ${errorMessage}`);
      // Record as potentially unavailable with low confidence
      await this.recordUpdate({
        incentiveId: program.id,
        type: 'availability',
        oldValue: 'unknown',
        newValue: 'check_failed',
        confidence: 'low',
        source: 'automated_url_check'
      });
    }
  }

  // Record a data update
  async recordUpdate(update: DataUpdate) {
    try {
      await db.insert(programUpdates).values({
        incentiveId: update.incentiveId,
        updateType: update.type,
        oldValue: update.oldValue,
        newValue: update.newValue,
        confidence: update.confidence,
        source: update.source,
        createdAt: new Date(),
        applied: false
      });

      console.log(`Recorded update for program ${update.incentiveId}: ${update.type} changed from ${update.oldValue} to ${update.newValue}`);
    } catch (error) {
      console.error('Error recording update:', error);
    }
  }

  // Get pending updates that need review
  async getPendingUpdates() {
    try {
      const pendingUpdates = await db
        .select({
          update: programUpdates,
          program: incentives
        })
        .from(programUpdates)
        .innerJoin(incentives, eq(programUpdates.incentiveId, incentives.id))
        .where(eq(programUpdates.applied, false))
        .orderBy(programUpdates.createdAt);

      return pendingUpdates;
    } catch (error) {
      console.error('Error getting pending updates:', error);
      return [];
    }
  }

  // Apply approved updates
  async applyUpdate(updateId: number) {
    try {
      const update = await db
        .select()
        .from(programUpdates)
        .where(eq(programUpdates.id, updateId))
        .limit(1);

      if (update.length === 0) {
        throw new Error('Update not found');
      }

      const updateData = update[0];
      const updateFields: any = {};

      // Apply the update based on type
      switch (updateData.updateType) {
        case 'deadline':
          updateFields.deadline = updateData.newValue;
          updateFields.deadlineVerified = true;
          break;
        case 'amount':
          updateFields.amount = updateData.newValue;
          updateFields.amountVerified = true;
          break;
        case 'status':
          updateFields.status = updateData.newValue;
          break;
        case 'availability':
          updateFields.deadlineStatus = updateData.newValue;
          break;
      }

      updateFields.updatedAt = new Date();

      // Apply to incentives table
      await db
        .update(incentives)
        .set(updateFields)
        .where(eq(incentives.id, updateData.incentiveId));

      // Mark update as applied
      await db
        .update(programUpdates)
        .set({ applied: true })
        .where(eq(programUpdates.id, updateId));

      console.log(`Applied update ${updateId} to program ${updateData.incentiveId}`);
    } catch (error) {
      console.error('Error applying update:', error);
      throw error;
    }
  }

  // Analyze deadline patterns and set deadline status
  async analyzeDeadlines() {
    try {
      console.log('Analyzing program deadlines...');
      
      const programs = await db.select().from(incentives);
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

      for (const program of programs) {
        let deadlineStatus = 'unknown';
        
        // Parse deadline text to determine status
        const deadline = program.deadline.toLowerCase();
        
        if (deadline.includes('ongoing') || deadline.includes('continuous') || deadline.includes('rolling')) {
          deadlineStatus = 'ongoing';
        } else if (deadline.includes('expired') || deadline.includes('closed')) {
          deadlineStatus = 'expired';
        } else if (deadline.includes('2024') && new Date().getFullYear() > 2024) {
          deadlineStatus = 'expired';
        } else if (deadline.includes('2025')) {
          // Check if it's within 30 days (expiring soon) or 90 days (active)
          try {
            const dateMatch = deadline.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
            if (dateMatch) {
              const deadlineDate = new Date(parseInt(dateMatch[3]), parseInt(dateMatch[1]) - 1, parseInt(dateMatch[2]));
              if (deadlineDate < now) {
                deadlineStatus = 'expired';
              } else if (deadlineDate < thirtyDaysFromNow) {
                deadlineStatus = 'expiring';
              } else {
                deadlineStatus = 'active';
              }
            } else {
              deadlineStatus = 'active';
            }
          } catch (e) {
            deadlineStatus = 'active';
          }
        } else {
          deadlineStatus = 'active';
        }

        // Update the program if status changed
        if (program.deadlineStatus !== deadlineStatus) {
          await db
            .update(incentives)
            .set({ 
              deadlineStatus,
              lastDataCheck: new Date()
            })
            .where(eq(incentives.id, program.id));
        }
      }

      console.log('Deadline analysis complete');
    } catch (error) {
      console.error('Error analyzing deadlines:', error);
    }
  }
}

export const dataMonitoring = new DataMonitoringService();