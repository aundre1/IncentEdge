#!/usr/bin/env ts-node

/**
 * Logging Migration Script
 * Automatically replace console.log statements with structured logging
 */

import fs from 'fs';
import path from 'path';

interface MigrationResult {
  file: string;
  replacements: number;
  type: 'console.log' | 'console.error' | 'console.warn' | 'console.info' | 'console.debug';
}

interface MigrationReport {
  filesProcessed: number;
  filesModified: number;
  totalReplacements: number;
  results: MigrationResult[];
  errors: Array<{ file: string; error: string }>;
}

/**
 * Check if file should be processed
 */
function shouldProcessFile(filePath: string): boolean {
  const ext = path.extname(filePath);

  // Only process TypeScript and JavaScript files
  if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
    return false;
  }

  // Skip node_modules
  if (filePath.includes('node_modules')) {
    return false;
  }

  // Skip this migration script itself
  if (filePath.includes('migrate-logging.ts')) {
    return false;
  }

  // Skip test files (they can use console.log for debugging)
  if (filePath.includes('.test.') || filePath.includes('.spec.')) {
    return false;
  }

  return true;
}

/**
 * Get all files recursively
 */
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);

    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

/**
 * Determine appropriate log level from console method
 */
function getLogLevel(consoleMethod: string): string {
  switch (consoleMethod) {
    case 'console.error':
      return 'logger.error';
    case 'console.warn':
      return 'logger.warn';
    case 'console.info':
      return 'logger.info';
    case 'console.debug':
      return 'logger.debug';
    case 'console.log':
    default:
      return 'logger.info';
  }
}

/**
 * Parse console statement to extract message and context
 */
function parseConsoleStatement(statement: string): { message: string; context: string } {
  // Remove console.log/error/warn/etc and parentheses
  const content = statement
    .replace(/console\.(log|error|warn|info|debug)\s*\(\s*/, '')
    .replace(/\s*\)\s*;?\s*$/, '');

  // Split by comma to separate message from additional args
  const parts = content.split(',').map(s => s.trim());

  if (parts.length === 1) {
    // Simple message only
    return { message: parts[0], context: '' };
  }

  // First part is message, rest is context
  const message = parts[0];
  const contextArgs = parts.slice(1);

  // Build context object
  const contextParts: string[] = [];

  contextArgs.forEach((arg, index) => {
    // Try to determine if it's a variable or expression
    if (arg.match(/^['"`]/)) {
      // It's a string literal - skip or use as additional message
      return;
    }

    // It's likely a variable - use its name as key
    const varName = arg.replace(/[^\w]/g, '');
    contextParts.push(`${varName}: ${arg}`);
  });

  if (contextParts.length > 0) {
    return {
      message,
      context: `{ ${contextParts.join(', ')} }`
    };
  }

  return { message, context: '' };
}

/**
 * Migrate console statements in file
 */
function migrateFile(filePath: string, dryRun: boolean = false): MigrationResult[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const results: MigrationResult[] = [];

  let modifiedContent = content;
  let hasImport = content.includes("from '@/lib/logging/logger'") ||
                  content.includes('from "../lib/logging/logger"') ||
                  content.includes("from './logging/logger'");

  // Track console methods to replace
  const consoleMethods = [
    'console.log',
    'console.error',
    'console.warn',
    'console.info',
    'console.debug'
  ];

  let totalReplacements = 0;

  consoleMethods.forEach(method => {
    // Match console statements (simple regex - may need refinement for complex cases)
    const regex = new RegExp(`${method.replace('.', '\\.')}\\s*\\([^)]*\\)\\s*;?`, 'g');
    const matches = content.match(regex) || [];

    if (matches.length > 0) {
      results.push({
        file: filePath,
        replacements: matches.length,
        type: method as any
      });

      totalReplacements += matches.length;

      // Replace each occurrence
      matches.forEach(match => {
        const logLevel = getLogLevel(method);
        const { message, context } = parseConsoleStatement(match);

        let replacement: string;
        if (context) {
          replacement = `${logLevel}(${message}, ${context});`;
        } else {
          replacement = `${logLevel}(${message});`;
        }

        modifiedContent = modifiedContent.replace(match, replacement);
      });
    }
  });

  // Add import if needed and replacements were made
  if (totalReplacements > 0 && !hasImport) {
    // Determine correct import path based on file location
    const relativePath = path.relative(path.dirname(filePath), path.join(process.cwd(), 'src/lib/logging/logger'));
    const importPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;

    // Add import at the top (after other imports if they exist)
    const importStatement = `import { logger } from '${importPath.replace(/\\/g, '/')}';\n`;

    // Find the position to insert import (after last import or at top)
    const importRegex = /^import .* from .*;$/gm;
    const imports = content.match(importRegex);

    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = modifiedContent.lastIndexOf(lastImport);
      const insertPosition = lastImportIndex + lastImport.length;
      modifiedContent =
        modifiedContent.slice(0, insertPosition) +
        '\n' + importStatement +
        modifiedContent.slice(insertPosition);
    } else {
      // No imports found, add at the very top
      modifiedContent = importStatement + '\n' + modifiedContent;
    }
  }

  // Write modified content if not dry run and changes were made
  if (!dryRun && totalReplacements > 0) {
    fs.writeFileSync(filePath, modifiedContent, 'utf-8');
  }

  return results;
}

/**
 * Run migration
 */
function runMigration(srcDir: string, dryRun: boolean = false): MigrationReport {
  console.log(`\n${'='.repeat(80)}`);
  console.log('LOGGING MIGRATION SCRIPT');
  console.log(`${'='.repeat(80)}\n`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'PRODUCTION'}`);
  console.log(`Source Directory: ${srcDir}\n`);

  const report: MigrationReport = {
    filesProcessed: 0,
    filesModified: 0,
    totalReplacements: 0,
    results: [],
    errors: []
  };

  // Get all files
  const allFiles = getAllFiles(srcDir);
  const filesToProcess = allFiles.filter(shouldProcessFile);

  console.log(`Found ${filesToProcess.length} files to process...\n`);

  // Process each file
  filesToProcess.forEach(file => {
    report.filesProcessed++;

    try {
      const results = migrateFile(file, dryRun);

      if (results.length > 0) {
        report.filesModified++;
        results.forEach(result => {
          report.totalReplacements += result.replacements;
          report.results.push(result);

          console.log(`✓ ${path.relative(srcDir, file)}`);
          console.log(`  Replaced ${result.replacements} ${result.type} statements`);
        });
      }
    } catch (error) {
      report.errors.push({
        file,
        error: error instanceof Error ? error.message : String(error)
      });

      console.error(`✗ ${path.relative(srcDir, file)}: ${error}`);
    }
  });

  return report;
}

/**
 * Generate migration report
 */
function generateReport(report: MigrationReport, dryRun: boolean): string {
  let output = '\n';
  output += `${'='.repeat(80)}\n`;
  output += 'MIGRATION REPORT\n';
  output += `${'='.repeat(80)}\n\n`;

  output += `Files Processed: ${report.filesProcessed}\n`;
  output += `Files Modified: ${report.filesModified}\n`;
  output += `Total Replacements: ${report.totalReplacements}\n`;
  output += `Errors: ${report.errors.length}\n\n`;

  if (report.errors.length > 0) {
    output += 'ERRORS:\n';
    report.errors.forEach(error => {
      output += `  - ${error.file}: ${error.error}\n`;
    });
    output += '\n';
  }

  // Group by file
  const fileGroups = new Map<string, MigrationResult[]>();
  report.results.forEach(result => {
    const existing = fileGroups.get(result.file) || [];
    existing.push(result);
    fileGroups.set(result.file, existing);
  });

  if (fileGroups.size > 0) {
    output += 'FILES MODIFIED:\n\n';
    fileGroups.forEach((results, file) => {
      const total = results.reduce((sum, r) => sum + r.replacements, 0);
      output += `  ${file}\n`;
      results.forEach(r => {
        output += `    - ${r.type}: ${r.replacements} replacements\n`;
      });
      output += `    Total: ${total}\n\n`;
    });
  }

  if (dryRun) {
    output += '\n';
    output += `${'*'.repeat(80)}\n`;
    output += 'DRY RUN MODE - No files were modified\n';
    output += 'Run without --dry-run flag to apply changes\n';
    output += `${'*'.repeat(80)}\n`;
  }

  return output;
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const srcDir = args.find(arg => !arg.startsWith('--')) || path.join(process.cwd(), 'src');

  // Validate source directory
  if (!fs.existsSync(srcDir)) {
    console.error(`Error: Source directory does not exist: ${srcDir}`);
    process.exit(1);
  }

  // Run migration
  const report = runMigration(srcDir, dryRun);

  // Generate and display report
  const reportText = generateReport(report, dryRun);
  console.log(reportText);

  // Write report to file
  const reportPath = path.join(process.cwd(), `migration-report-${Date.now()}.txt`);
  fs.writeFileSync(reportPath, reportText, 'utf-8');
  console.log(`\nReport saved to: ${reportPath}`);

  // Exit with error code if there were errors
  if (report.errors.length > 0) {
    process.exit(1);
  }
}

// Run main if this is the entry point
main();

export { runMigration, generateReport };
export type { MigrationReport };
