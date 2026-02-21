#!/usr/bin/env ts-node

/**
 * Logging Migration Verification Script
 * Analyzes codebase and reports on console.log usage
 */

import fs from 'fs';
import path from 'path';

interface ConsoleUsage {
  file: string;
  line: number;
  type: 'console.log' | 'console.error' | 'console.warn' | 'console.info' | 'console.debug';
  content: string;
}

interface VerificationReport {
  totalFiles: number;
  filesWithConsole: number;
  totalConsoleStatements: number;
  byType: Record<string, number>;
  usages: ConsoleUsage[];
}

/**
 * Check if file should be analyzed
 */
function shouldAnalyzeFile(filePath: string): boolean {
  const ext = path.extname(filePath);

  // Only process TypeScript and JavaScript files
  if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
    return false;
  }

  // Skip node_modules
  if (filePath.includes('node_modules')) {
    return false;
  }

  // Skip this script itself
  if (filePath.includes('verify-logging-migration.ts')) {
    return false;
  }

  // Skip migration script
  if (filePath.includes('migrate-logging.ts')) {
    return false;
  }

  // Skip logging library itself
  if (filePath.includes('/logging/')) {
    return false;
  }

  // Include test files (we want to know about them)
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
 * Analyze file for console usage
 */
function analyzeFile(filePath: string): ConsoleUsage[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const usages: ConsoleUsage[] = [];

  const consoleRegex = /console\.(log|error|warn|info|debug)/g;

  lines.forEach((line, index) => {
    const matches = line.match(consoleRegex);

    if (matches) {
      matches.forEach(match => {
        usages.push({
          file: filePath,
          line: index + 1,
          type: match as any,
          content: line.trim()
        });
      });
    }
  });

  return usages;
}

/**
 * Run verification
 */
function runVerification(srcDir: string): VerificationReport {
  console.log(`\n${'='.repeat(80)}`);
  console.log('LOGGING MIGRATION VERIFICATION');
  console.log(`${'='.repeat(80)}\n`);
  console.log(`Source Directory: ${srcDir}\n`);

  const report: VerificationReport = {
    totalFiles: 0,
    filesWithConsole: 0,
    totalConsoleStatements: 0,
    byType: {
      'console.log': 0,
      'console.error': 0,
      'console.warn': 0,
      'console.info': 0,
      'console.debug': 0
    },
    usages: []
  };

  // Get all files
  const allFiles = getAllFiles(srcDir);
  const filesToAnalyze = allFiles.filter(shouldAnalyzeFile);

  console.log(`Analyzing ${filesToAnalyze.length} files...\n`);

  // Analyze each file
  filesToAnalyze.forEach(file => {
    report.totalFiles++;

    const usages = analyzeFile(file);

    if (usages.length > 0) {
      report.filesWithConsole++;
      report.usages.push(...usages);

      usages.forEach(usage => {
        report.totalConsoleStatements++;
        report.byType[usage.type]++;
      });
    }
  });

  return report;
}

/**
 * Generate verification report
 */
function generateVerificationReport(report: VerificationReport, srcDir: string): string {
  let output = '\n';
  output += `${'='.repeat(80)}\n`;
  output += 'VERIFICATION REPORT\n';
  output += `${'='.repeat(80)}\n\n`;

  output += '## Summary\n\n';
  output += `Total Files Analyzed: ${report.totalFiles}\n`;
  output += `Files with console statements: ${report.filesWithConsole}\n`;
  output += `Total console statements: ${report.totalConsoleStatements}\n\n`;

  output += '## Breakdown by Type\n\n';
  Object.entries(report.byType).forEach(([type, count]) => {
    if (count > 0) {
      output += `  ${type}: ${count}\n`;
    }
  });

  output += '\n## Files Requiring Migration\n\n';

  // Group by file
  const fileGroups = new Map<string, ConsoleUsage[]>();
  report.usages.forEach(usage => {
    const existing = fileGroups.get(usage.file) || [];
    existing.push(usage);
    fileGroups.set(usage.file, existing);
  });

  // Sort files by number of console statements (most first)
  const sortedFiles = Array.from(fileGroups.entries())
    .sort((a, b) => b[1].length - a[1].length);

  sortedFiles.forEach(([file, usages]) => {
    const relativePath = path.relative(srcDir, file);
    output += `### ${relativePath} (${usages.length} statements)\n\n`;

    usages.forEach(usage => {
      output += `  Line ${usage.line}: ${usage.type}\n`;
      output += `    ${usage.content}\n\n`;
    });
  });

  output += '\n## Next Steps\n\n';
  output += '1. Review MIGRATION_GUIDE.md for migration instructions\n';
  output += '2. Start with files that have the most console statements\n';
  output += '3. Use the logger import: import { logger } from \'@/lib/logging/logger\';\n';
  output += '4. Replace console.log → logger.info (or appropriate level)\n';
  output += '5. Add context objects with relevant data\n';
  output += '6. Run this script again to verify progress\n\n';

  if (report.totalConsoleStatements === 0) {
    output += '\n';
    output += `${'*'.repeat(80)}\n`;
    output += '✅ MIGRATION COMPLETE!\n';
    output += 'No console statements found. All logging uses structured logger.\n';
    output += `${'*'.repeat(80)}\n`;
  }

  return output;
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const srcDir = args.find(arg => !arg.startsWith('--')) || path.join(process.cwd(), 'src');

  // Validate source directory
  if (!fs.existsSync(srcDir)) {
    console.error(`Error: Source directory does not exist: ${srcDir}`);
    process.exit(1);
  }

  // Run verification
  const report = runVerification(srcDir);

  // Generate and display report
  const reportText = generateVerificationReport(report, srcDir);
  console.log(reportText);

  // Write report to file
  const reportPath = path.join(process.cwd(), `logging-verification-${Date.now()}.txt`);
  fs.writeFileSync(reportPath, reportText, 'utf-8');
  console.log(`\nReport saved to: ${reportPath}`);

  // Exit with code indicating if work is needed
  process.exit(report.totalConsoleStatements > 0 ? 1 : 0);
}

// Run main
main();

export { runVerification, generateVerificationReport };
export type { VerificationReport, ConsoleUsage };
