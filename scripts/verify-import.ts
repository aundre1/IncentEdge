#!/usr/bin/env npx ts-node
/**
 * Verify IncentEdge Import Completed Successfully
 */

import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function verifyImport() {
  console.log('🔍 Verifying IncentEdge Data Import\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // Get all records (no aggregate function)
    const { data: allRecords, error: countError } = await supabase
      .from('incentive_programs')
      .select('id, name, state, confidence_score, tier, external_id')
      .limit(50000);

    if (countError) {
      console.error('❌ Error fetching records:', countError);
      process.exit(1);
    }

    const totalCount = allRecords?.length || 0;

    console.log(`✅ Total Programs Imported: ${totalCount}\n`);

    // Tier distribution
    const tierDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };

    const stateDistribution: { [key: string]: number } = {};
    let urlCount = 0;
    let scoreSum = 0;

    allRecords?.forEach((record: any) => {
      tierDistribution[record.tier]++;
      if (record.state) {
        stateDistribution[record.state] = (stateDistribution[record.state] || 0) + 1;
      }
      scoreSum += record.confidence_score || 0;
    });

    console.log('🎯 Quality Distribution:');
    console.log(`   Tier 1 (Production): ${tierDistribution[1]} programs`);
    console.log(`   Tier 2 (Enrichment): ${tierDistribution[2]} programs`);
    console.log(`   Tier 3 (Research):   ${tierDistribution[3]} programs`);
    console.log(`   Tier 4 (Queue):      ${tierDistribution[4]} programs`);
    console.log(`   Tier 5 (Quarantine): ${tierDistribution[5]} programs`);
    console.log('');

    console.log('📈 Data Quality:');
    console.log(`   Average Confidence: ${totalCount > 0 ? ((scoreSum / totalCount) * 100).toFixed(1) : 0}%`);
    console.log('');

    console.log('🗺️  Top 15 States:');
    const topStates = Object.entries(stateDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15);
    topStates.forEach(([state, count]) => {
      console.log(`   ${state}: ${count} programs`);
    });
    console.log('');

    // Sample records
    console.log('📋 Sample Records:');
    const samples = allRecords?.slice(0, 5) || [];
    samples.forEach((program: any, index: number) => {
      console.log(
        `   ${index + 1}. "${program.name.substring(0, 60)}${program.name.length > 60 ? '...' : ''}" (${program.state}) T${program.tier}`
      );
    });
    console.log('');

    if (totalCount === 30007) {
      console.log('✅ SUCCESS: All 30,007 programs imported successfully!');
    } else if (totalCount >= 29007) {
      console.log(`⚠️  PARTIAL SUCCESS: ${totalCount} programs imported (expected 30,007)`);
    } else {
      console.log(`❌ INCOMPLETE: Only ${totalCount} programs found (expected 30,007)`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyImport();
