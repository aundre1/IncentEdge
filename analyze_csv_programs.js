import fs from 'fs';
import csv from 'csv-parser';

// Read and analyze the CSV file to extract legitimate programs
const validPrograms = [];
const duplicates = new Set();
const invalidEntries = [];

console.log('Analyzing CSV data for legitimate government incentive programs...\n');

fs.createReadStream('attached_assets/all_sites_output_1750952439758.csv')
  .pipe(csv())
  .on('data', (row) => {
    const {
      title,
      url,
      funding_amount,
      deadline,
      program_type,
      eligibility,
      source_type,
      language
    } = row;

    // Skip invalid entries
    if (!title || title === 'N/A' || title.includes('.pdf') || title.includes('.ashx')) {
      invalidEntries.push(`Invalid title: ${title}`);
      return;
    }

    // Skip non-English entries (except for legitimate bilingual programs)
    if (language && language !== 'en' && !title.includes('Tax Credit') && !title.includes('Program')) {
      invalidEntries.push(`Non-English: ${title} (${language})`);
      return;
    }

    // Skip duplicates based on title
    const normalizedTitle = title.toLowerCase().trim();
    if (duplicates.has(normalizedTitle)) {
      invalidEntries.push(`Duplicate: ${title}`);
      return;
    }
    duplicates.add(normalizedTitle);

    // Skip entries without meaningful funding information
    if (!funding_amount || funding_amount === 'N/A' || funding_amount === 'Not specified') {
      invalidEntries.push(`No funding info: ${title}`);
      return;
    }

    // Skip generic database listings and navigation pages
    if (title.includes('{{ program.name }}') || 
        title.includes('Summary Tables') ||
        title.includes('Programs') ||
        title.includes('News') ||
        title.includes('Sign in') ||
        url.includes('/maps') ||
        url.includes('/tables') ||
        url.includes('/news')) {
      invalidEntries.push(`Generic page: ${title}`);
      return;
    }

    // Extract valid programs
    const program = {
      title: title.trim(),
      url: url.trim(),
      funding_amount: funding_amount.trim(),
      deadline: deadline ? deadline.trim() : 'Not specified',
      program_type: program_type ? program_type.trim() : 'Unknown',
      eligibility: eligibility ? eligibility.trim() : 'Not specified',
      source_type: source_type ? source_type.trim() : 'Unknown'
    };

    validPrograms.push(program);
  })
  .on('end', () => {
    console.log(`=== ANALYSIS RESULTS ===`);
    console.log(`Total entries processed: ${validPrograms.length + invalidEntries.length}`);
    console.log(`Valid programs found: ${validPrograms.length}`);
    console.log(`Invalid/filtered entries: ${invalidEntries.length}\n`);

    console.log(`=== LEGITIMATE PROGRAMS FOR DATABASE ===\n`);
    
    validPrograms.forEach((program, index) => {
      console.log(`${index + 1}. ${program.title}`);
      console.log(`   Provider: ${getProvider(program.url)}`);
      console.log(`   Type: ${program.program_type}`);
      console.log(`   Amount: ${program.funding_amount}`);
      console.log(`   Deadline: ${program.deadline}`);
      console.log(`   Eligibility: ${program.eligibility.substring(0, 100)}...`);
      console.log(`   URL: ${program.url}`);
      console.log('');
    });

    console.log(`\n=== FILTERED OUT (Examples) ===`);
    invalidEntries.slice(0, 10).forEach(entry => console.log(`- ${entry}`));
    if (invalidEntries.length > 10) {
      console.log(`... and ${invalidEntries.length - 10} more`);
    }
  });

function getProvider(url) {
  if (url.includes('cdfifund.gov')) return 'CDFI Fund';
  if (url.includes('energy.gov')) return 'Department of Energy';
  if (url.includes('dsireusa.org')) return 'DSIRE Database';
  if (url.includes('epa.gov')) return 'EPA';
  if (url.includes('esd.ny.gov')) return 'New York ESD';
  if (url.includes('irs.gov')) return 'IRS';
  if (url.includes('nyserda.ny.gov')) return 'NYSERDA';
  if (url.includes('dol.gov')) return 'Department of Labor';
  return 'Unknown';
}