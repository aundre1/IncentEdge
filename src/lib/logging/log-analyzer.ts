/**
 * Log Analyzer
 * Utilities for searching, aggregating, and analyzing logs
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

export interface LogSearchOptions {
  /** Directory containing log files */
  logDir: string;

  /** Search pattern (regex) */
  pattern?: string;

  /** Log level filter */
  level?: string;

  /** Start date */
  startDate?: Date;

  /** End date */
  endDate?: Date;

  /** User ID filter */
  userId?: string;

  /** Request ID filter */
  requestId?: string;

  /** Maximum results */
  limit?: number;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  [key: string]: any;
}

export interface LogStats {
  totalLogs: number;
  errorCount: number;
  warnCount: number;
  infoCount: number;
  debugCount: number;
  traceCount: number;
  avgDuration?: number;
  uniqueUsers: number;
  uniqueRequests: number;
  topErrors: Array<{ message: string; count: number }>;
  topPaths: Array<{ path: string; count: number }>;
}

/**
 * Parse log file and search for entries
 */
export async function searchLogs(
  options: LogSearchOptions
): Promise<LogEntry[]> {
  const results: LogEntry[] = [];
  const { logDir, pattern, level, startDate, endDate, userId, requestId, limit = 1000 } = options;

  // Get all log files in directory
  const files = fs.readdirSync(logDir)
    .filter(file => file.endsWith('.log'))
    .map(file => path.join(logDir, file));

  for (const file of files) {
    if (results.length >= limit) break;

    const fileStream = fs.createReadStream(file);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    for await (const line of rl) {
      if (results.length >= limit) break;

      try {
        const entry = JSON.parse(line) as LogEntry;

        // Apply filters
        if (level && entry.level !== level) continue;
        if (userId && entry.userId !== userId) continue;
        if (requestId && entry.requestId !== requestId) continue;

        // Date filter
        if (startDate || endDate) {
          const entryDate = new Date(entry.timestamp);
          if (startDate && entryDate < startDate) continue;
          if (endDate && entryDate > endDate) continue;
        }

        // Pattern match
        if (pattern) {
          const regex = new RegExp(pattern, 'i');
          const searchText = JSON.stringify(entry);
          if (!regex.test(searchText)) continue;
        }

        results.push(entry);
      } catch (error) {
        // Skip invalid JSON lines
        continue;
      }
    }
  }

  return results;
}

/**
 * Aggregate log statistics
 */
export async function aggregateLogs(
  options: Omit<LogSearchOptions, 'limit'>
): Promise<LogStats> {
  const logs = await searchLogs({ ...options, limit: Number.MAX_SAFE_INTEGER });

  const stats: LogStats = {
    totalLogs: logs.length,
    errorCount: 0,
    warnCount: 0,
    infoCount: 0,
    debugCount: 0,
    traceCount: 0,
    uniqueUsers: 0,
    uniqueRequests: 0,
    topErrors: [],
    topPaths: []
  };

  const userIds = new Set<string>();
  const requestIds = new Set<string>();
  const errorMessages = new Map<string, number>();
  const paths = new Map<string, number>();
  let totalDuration = 0;
  let durationCount = 0;

  for (const log of logs) {
    // Count by level
    switch (log.level) {
      case 'error':
        stats.errorCount++;
        if (log.message) {
          errorMessages.set(log.message, (errorMessages.get(log.message) || 0) + 1);
        }
        break;
      case 'warn':
        stats.warnCount++;
        break;
      case 'info':
        stats.infoCount++;
        break;
      case 'debug':
        stats.debugCount++;
        break;
      case 'trace':
        stats.traceCount++;
        break;
    }

    // Track unique users and requests
    if (log.userId) userIds.add(log.userId);
    if (log.requestId) requestIds.add(log.requestId);

    // Track paths
    if (log.path) {
      paths.set(log.path, (paths.get(log.path) || 0) + 1);
    }

    // Calculate average duration
    if (log.duration !== undefined) {
      totalDuration += log.duration;
      durationCount++;
    }
  }

  stats.uniqueUsers = userIds.size;
  stats.uniqueRequests = requestIds.size;

  if (durationCount > 0) {
    stats.avgDuration = totalDuration / durationCount;
  }

  // Get top errors
  stats.topErrors = Array.from(errorMessages.entries())
    .map(([message, count]) => ({ message, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Get top paths
  stats.topPaths = Array.from(paths.entries())
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return stats;
}

/**
 * Detect anomalies in logs
 */
export async function detectAnomalies(
  options: Omit<LogSearchOptions, 'limit'>
): Promise<Array<{ type: string; description: string; severity: string }>> {
  const logs = await searchLogs({ ...options, limit: Number.MAX_SAFE_INTEGER });
  const anomalies: Array<{ type: string; description: string; severity: string }> = [];

  // Calculate error rate
  const errorCount = logs.filter(log => log.level === 'error').length;
  const errorRate = logs.length > 0 ? errorCount / logs.length : 0;

  if (errorRate > 0.1) {
    anomalies.push({
      type: 'high_error_rate',
      description: `Error rate is ${(errorRate * 100).toFixed(2)}% (${errorCount}/${logs.length})`,
      severity: 'high'
    });
  }

  // Check for repeated errors
  const errorMessages = new Map<string, number>();
  logs.filter(log => log.level === 'error').forEach(log => {
    if (log.message) {
      errorMessages.set(log.message, (errorMessages.get(log.message) || 0) + 1);
    }
  });

  errorMessages.forEach((count, message) => {
    if (count > 10) {
      anomalies.push({
        type: 'repeated_error',
        description: `Error "${message}" occurred ${count} times`,
        severity: count > 50 ? 'critical' : 'medium'
      });
    }
  });

  // Check for slow requests
  const slowRequests = logs.filter(log => log.duration && log.duration > 5000);
  if (slowRequests.length > 0) {
    anomalies.push({
      type: 'slow_requests',
      description: `${slowRequests.length} requests took longer than 5 seconds`,
      severity: slowRequests.length > 10 ? 'high' : 'medium'
    });
  }

  // Check for security events
  const securityEvents = logs.filter(log =>
    log.category === 'security' && (log.result === 'failure' || log.result === 'blocked')
  );

  if (securityEvents.length > 5) {
    anomalies.push({
      type: 'security_events',
      description: `${securityEvents.length} failed security events detected`,
      severity: 'critical'
    });
  }

  return anomalies;
}

/**
 * Correlate security events
 */
export async function correlateSecurityEvents(
  options: Omit<LogSearchOptions, 'limit'>
): Promise<Array<{ ipAddress: string; events: number; severity: string }>> {
  const logs = await searchLogs({ ...options, limit: Number.MAX_SAFE_INTEGER });

  // Group by IP address
  const ipEvents = new Map<string, number>();

  logs
    .filter(log => log.category === 'security')
    .forEach(log => {
      if (log.ipAddress) {
        ipEvents.set(log.ipAddress, (ipEvents.get(log.ipAddress) || 0) + 1);
      }
    });

  // Find suspicious patterns
  return Array.from(ipEvents.entries())
    .map(([ipAddress, events]) => ({
      ipAddress,
      events,
      severity: events > 10 ? 'high' : events > 5 ? 'medium' : 'low'
    }))
    .filter(item => item.events > 3)
    .sort((a, b) => b.events - a.events);
}

/**
 * Export logs to CSV
 */
export async function exportToCSV(
  logs: LogEntry[],
  outputPath: string
): Promise<void> {
  if (logs.length === 0) {
    throw new Error('No logs to export');
  }

  // Get all unique keys
  const keys = new Set<string>();
  logs.forEach(log => {
    Object.keys(log).forEach(key => keys.add(key));
  });

  // Create CSV header
  const header = Array.from(keys).join(',');

  // Create CSV rows
  const rows = logs.map(log => {
    return Array.from(keys)
      .map(key => {
        const value = log[key];
        if (value === undefined || value === null) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      })
      .join(',');
  });

  // Write to file
  const csv = [header, ...rows].join('\n');
  fs.writeFileSync(outputPath, csv, 'utf-8');
}

/**
 * Generate log report
 */
export async function generateReport(
  options: Omit<LogSearchOptions, 'limit'>
): Promise<string> {
  const stats = await aggregateLogs(options);
  const anomalies = await detectAnomalies(options);

  let report = '# Log Analysis Report\n\n';
  report += `**Generated:** ${new Date().toISOString()}\n\n`;

  report += '## Summary\n\n';
  report += `- **Total Logs:** ${stats.totalLogs}\n`;
  report += `- **Errors:** ${stats.errorCount}\n`;
  report += `- **Warnings:** ${stats.warnCount}\n`;
  report += `- **Info:** ${stats.infoCount}\n`;
  report += `- **Debug:** ${stats.debugCount}\n`;
  report += `- **Unique Users:** ${stats.uniqueUsers}\n`;
  report += `- **Unique Requests:** ${stats.uniqueRequests}\n`;

  if (stats.avgDuration !== undefined) {
    report += `- **Average Duration:** ${stats.avgDuration.toFixed(2)}ms\n`;
  }

  report += '\n## Top Errors\n\n';
  stats.topErrors.forEach((error, index) => {
    report += `${index + 1}. **${error.message}** (${error.count} occurrences)\n`;
  });

  report += '\n## Top Paths\n\n';
  stats.topPaths.forEach((path, index) => {
    report += `${index + 1}. **${path.path}** (${path.count} requests)\n`;
  });

  if (anomalies.length > 0) {
    report += '\n## Anomalies Detected\n\n';
    anomalies.forEach((anomaly, index) => {
      report += `${index + 1}. **[${anomaly.severity.toUpperCase()}]** ${anomaly.type}: ${anomaly.description}\n`;
    });
  }

  return report;
}
