/**
 * IncentEdge Migration Validation Script
 *
 * Validates SQL migrations for:
 * - Syntax errors
 * - Dependency ordering
 * - Table/column conflicts
 * - Foreign key references
 *
 * Run: npx ts-node supabase/scripts/validate-migrations.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  file: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  tablesCreated: string[];
  tablesDropped: string[];
  typesCreated: string[];
  functionsCreated: string[];
  indexesCreated: number;
  policiesCreated: number;
}

interface DependencyCheck {
  table: string;
  referencedTable: string;
  file: string;
  line: number;
}

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

// SQL patterns for parsing
const PATTERNS = {
  createTable: /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/gi,
  dropTable: /DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?(\w+)/gi,
  createType: /CREATE\s+TYPE\s+(\w+)/gi,
  createFunction: /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(\w+)/gi,
  createIndex: /CREATE\s+(?:UNIQUE\s+)?INDEX/gi,
  createPolicy: /CREATE\s+POLICY/gi,
  foreignKey: /REFERENCES\s+(\w+)\s*\(/gi,
  alterTable: /ALTER\s+TABLE\s+(\w+)/gi,
};

function parseMigrationFile(filePath: string): ValidationResult {
  const fileName = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const result: ValidationResult = {
    file: fileName,
    valid: true,
    errors: [],
    warnings: [],
    tablesCreated: [],
    tablesDropped: [],
    typesCreated: [],
    functionsCreated: [],
    indexesCreated: 0,
    policiesCreated: 0,
  };

  // Extract created tables
  let match;
  while ((match = PATTERNS.createTable.exec(content)) !== null) {
    result.tablesCreated.push(match[1].toLowerCase());
  }
  PATTERNS.createTable.lastIndex = 0;

  // Extract dropped tables
  while ((match = PATTERNS.dropTable.exec(content)) !== null) {
    result.tablesDropped.push(match[1].toLowerCase());
  }
  PATTERNS.dropTable.lastIndex = 0;

  // Extract created types
  while ((match = PATTERNS.createType.exec(content)) !== null) {
    result.typesCreated.push(match[1].toLowerCase());
  }
  PATTERNS.createType.lastIndex = 0;

  // Extract created functions
  while ((match = PATTERNS.createFunction.exec(content)) !== null) {
    result.functionsCreated.push(match[1].toLowerCase());
  }
  PATTERNS.createFunction.lastIndex = 0;

  // Count indexes
  result.indexesCreated = (content.match(PATTERNS.createIndex) || []).length;
  PATTERNS.createIndex.lastIndex = 0;

  // Count policies
  result.policiesCreated = (content.match(PATTERNS.createPolicy) || []).length;
  PATTERNS.createPolicy.lastIndex = 0;

  // Check for common SQL syntax issues
  const syntaxChecks = [
    { pattern: /;\s*;/g, message: 'Double semicolon found' },
    { pattern: /,\s*\)/g, message: 'Trailing comma before closing parenthesis' },
    { pattern: /\(\s*,/g, message: 'Leading comma after opening parenthesis' },
  ];

  for (const check of syntaxChecks) {
    if (check.pattern.test(content)) {
      result.errors.push(check.message);
      result.valid = false;
    }
    check.pattern.lastIndex = 0;
  }

  // Check for unbalanced parentheses in CREATE TABLE statements
  const createTableBlocks = content.match(/CREATE\s+TABLE[\s\S]*?;/gi) || [];
  for (const block of createTableBlocks) {
    const openCount = (block.match(/\(/g) || []).length;
    const closeCount = (block.match(/\)/g) || []).length;
    if (openCount !== closeCount) {
      result.errors.push(`Unbalanced parentheses in CREATE TABLE statement`);
      result.valid = false;
    }
  }

  // Warnings for potential issues
  if (content.includes('CASCADE') && !content.includes('-- ')) {
    result.warnings.push('CASCADE used without apparent comment explaining why');
  }

  if (result.tablesCreated.length === 0 && result.typesCreated.length === 0 &&
      result.functionsCreated.length === 0 && !content.includes('INSERT')) {
    result.warnings.push('Migration creates no tables, types, or functions - may be a no-op');
  }

  return result;
}

function extractForeignKeyDependencies(filePath: string): DependencyCheck[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);
  const lines = content.split('\n');
  const dependencies: DependencyCheck[] = [];

  // Find current table context and foreign key references
  let currentTable = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track current table being created
    const tableMatch = line.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
    if (tableMatch) {
      currentTable = tableMatch[1].toLowerCase();
    }

    // Find foreign key references
    const fkMatch = line.match(/REFERENCES\s+(\w+)\s*\(/i);
    if (fkMatch && currentTable) {
      dependencies.push({
        table: currentTable,
        referencedTable: fkMatch[1].toLowerCase(),
        file: fileName,
        line: i + 1,
      });
    }
  }

  return dependencies;
}

function validateMigrationOrder(results: ValidationResult[]): string[] {
  const errors: string[] = [];
  const availableTables = new Set<string>();

  // Add Supabase built-in tables
  availableTables.add('auth.users');

  // Process migrations in order
  for (const result of results) {
    // Add dropped tables tracking
    for (const table of result.tablesDropped) {
      availableTables.delete(table);
    }

    // Add created tables
    for (const table of result.tablesCreated) {
      availableTables.add(table);
    }
  }

  // Now check dependencies
  const allDependencies: DependencyCheck[] = [];
  const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of migrationFiles) {
    const deps = extractForeignKeyDependencies(path.join(MIGRATIONS_DIR, file));
    allDependencies.push(...deps);
  }

  // Track tables as we process migrations in order
  const tablesAvailable = new Set<string>(['auth.users']);

  for (const file of migrationFiles) {
    const result = results.find(r => r.file === file);
    if (!result) continue;

    // Remove dropped tables
    for (const table of result.tablesDropped) {
      tablesAvailable.delete(table);
    }

    // Check foreign key dependencies for this migration
    const fileDeps = allDependencies.filter(d => d.file === file);
    for (const dep of fileDeps) {
      // Skip self-references and auth.users
      if (dep.referencedTable === dep.table) continue;
      if (dep.referencedTable === 'auth' || dep.referencedTable.startsWith('auth.')) continue;

      // Check if referenced table is available (created in earlier migration or same migration)
      const refInSameMigration = result.tablesCreated.includes(dep.referencedTable);
      const refInEarlierMigration = tablesAvailable.has(dep.referencedTable);

      if (!refInSameMigration && !refInEarlierMigration) {
        errors.push(
          `${file}:${dep.line} - Table '${dep.table}' references '${dep.referencedTable}' which may not exist yet`
        );
      }
    }

    // Add created tables for next migration
    for (const table of result.tablesCreated) {
      tablesAvailable.add(table);
    }
  }

  return errors;
}

function main(): void {
  console.log('\\n========================================');
  console.log('IncentEdge Migration Validation');
  console.log('========================================\\n');

  // Get all migration files
  const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${migrationFiles.length} migration files:\\n`);

  const results: ValidationResult[] = [];

  // Validate each migration
  for (const file of migrationFiles) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const result = parseMigrationFile(filePath);
    results.push(result);

    const status = result.valid ? 'PASS' : 'FAIL';
    const statusIcon = result.valid ? '✓' : '✗';

    console.log(`${statusIcon} ${file}`);
    console.log(`  Tables: ${result.tablesCreated.length} created, ${result.tablesDropped.length} dropped`);
    console.log(`  Types: ${result.typesCreated.length}, Functions: ${result.functionsCreated.length}`);
    console.log(`  Indexes: ${result.indexesCreated}, Policies: ${result.policiesCreated}`);

    if (result.errors.length > 0) {
      console.log(`  Errors:`);
      result.errors.forEach(e => console.log(`    - ${e}`));
    }

    if (result.warnings.length > 0) {
      console.log(`  Warnings:`);
      result.warnings.forEach(w => console.log(`    - ${w}`));
    }

    console.log('');
  }

  // Validate migration order and dependencies
  console.log('\\n--- Dependency Analysis ---\\n');
  const orderErrors = validateMigrationOrder(results);

  if (orderErrors.length > 0) {
    console.log('Dependency Issues Found:');
    orderErrors.forEach(e => console.log(`  ✗ ${e}`));
  } else {
    console.log('✓ All foreign key dependencies are satisfied');
  }

  // Summary
  console.log('\\n========================================');
  console.log('Summary');
  console.log('========================================\\n');

  const totalTables = results.reduce((sum, r) => sum + r.tablesCreated.length, 0);
  const totalTypes = results.reduce((sum, r) => sum + r.typesCreated.length, 0);
  const totalFunctions = results.reduce((sum, r) => sum + r.functionsCreated.length, 0);
  const totalIndexes = results.reduce((sum, r) => sum + r.indexesCreated, 0);
  const totalPolicies = results.reduce((sum, r) => sum + r.policiesCreated, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0) + orderErrors.length;
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

  console.log(`Total Migrations: ${migrationFiles.length}`);
  console.log(`Total Tables: ${totalTables}`);
  console.log(`Total Types: ${totalTypes}`);
  console.log(`Total Functions: ${totalFunctions}`);
  console.log(`Total Indexes: ${totalIndexes}`);
  console.log(`Total RLS Policies: ${totalPolicies}`);
  console.log('');
  console.log(`Errors: ${totalErrors}`);
  console.log(`Warnings: ${totalWarnings}`);

  if (totalErrors === 0) {
    console.log('\\n✓ All migrations validated successfully!');
    console.log('\\nMigration order:');
    migrationFiles.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  } else {
    console.log('\\n✗ Validation failed - fix errors before running migrations');
    process.exit(1);
  }
}

// Run validation
main();
