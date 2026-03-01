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

async function checkDuplicates() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  console.log('🔍 Checking for duplicate external_id values...\n');

  // Fetch all with external_id
  let offset = 0;
  const batchSize = 1000;
  const externalIds = new Map<string, number>();
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
      externalIds.set(record.external_id, (externalIds.get(record.external_id) || 0) + 1);
    });

    totalRecords += data.length;
    console.log(`Processed ${totalRecords} records...`);

    if (data.length < batchSize) break;
    offset += batchSize;
  }

  const duplicates = Array.from(externalIds.entries()).filter(([_, count]) => count > 1);

  console.log(`\n✅ Total records: ${totalRecords}`);
  console.log(`✅ Unique external_ids: ${externalIds.size}`);
  console.log(`❌ Duplicate external_ids: ${duplicates.length}`);

  if (duplicates.length > 0) {
    console.log('\nFirst 20 duplicates:');
    duplicates.slice(0, 20).forEach(([id, count]) => {
      console.log(`   ${id}: ${count} copies`);
    });
  }
}

checkDuplicates();
