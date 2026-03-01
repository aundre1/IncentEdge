#!/usr/bin/env npx ts-node
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

async function checkCompleteness() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  console.log('🔍 Checking import completeness...\n');

  // Fetch all with external_id
  let offset = 0;
  const batchSize = 1000;
  const externalIds = new Set<string>();
  let totalRecords = 0;

  while (true) {
    const { data, error } = await supabase
      .from('incentive_programs')
      .select('external_id')
      .range(offset, offset + batchSize - 1);

    if (error) {
      console.error(`Error at offset ${offset}:`, error);
      break;
    }

    if (!data || data.length === 0) break;

    data.forEach((record: any) => {
      externalIds.add(record.external_id);
    });

    totalRecords += data.length;

    if (data.length < batchSize) break;
    offset += batchSize;
  }

  console.log(`✅ Total records: ${totalRecords}`);
  console.log(`✅ Unique programs: ${externalIds.size}`);

  // Check for all 30,007 original programs (MASTER-000001 to MASTER-030007)
  let missingCount = 0;
  const missingIds = [];

  for (let i = 1; i <= 30007; i++) {
    const expectedId = `MASTER-${String(i).padStart(6, '0')}`;
    if (!externalIds.has(expectedId)) {
      missingCount++;
      if (missingIds.length < 10) {
        missingIds.push(expectedId);
      }
    }
  }

  console.log(`\n📊 Original 30,007 Programs:`);
  console.log(`   ✅ Present: ${30007 - missingCount}`);
  console.log(`   ❌ Missing: ${missingCount}`);

  if (missingIds.length > 0) {
    console.log(`   Sample missing: ${missingIds.join(', ')}`);
  }

  // Check what's extra
  const extraIds = Array.from(externalIds).filter(id => !id.startsWith('MASTER-'));
  console.log(`\n📊 Extra Programs:`);
  console.log(`   Additional records: ${extraIds.length}`);
  if (extraIds.length > 0) {
    console.log(`   Sample: ${extraIds.slice(0, 5).join(', ')}`);
  }
}

checkCompleteness();
