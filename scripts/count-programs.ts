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

async function countPrograms() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  let offset = 0;
  let totalCount = 0;
  let batchSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('incentive_programs')
      .select('id', { count: 'exact', head: false })
      .range(offset, offset + batchSize - 1);

    if (error) {
      console.error(`Error fetching batch at offset ${offset}:`, error);
      break;
    }

    if (!data || data.length === 0) {
      break;
    }

    totalCount += data.length;
    console.log(`Fetched batch at offset ${offset}: ${data.length} records (Total: ${totalCount})`);

    if (data.length < batchSize) {
      break;
    }

    offset += batchSize;
  }

  console.log(`\n✅ Total Programs: ${totalCount}`);
}

countPrograms();
