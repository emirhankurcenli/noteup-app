import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = getAllFiles(srcDir);

// All exported utility functions from securityUtils, fileUtils, money, etc.
const globalUtils = {
  sanitizeSingleLine: '../utils/securityUtils',
  sanitizeNoteContent: '../utils/securityUtils',
  sanitizeFileName: '../utils/securityUtils',
  sanitizeSearchQuery: '../utils/securityUtils',
  sanitizeUserCode: '../utils/securityUtils',
  formatBytes: '../utils/fileUtils',
  formatReminderDate: '../utils/fileUtils',
  getRemainingTimeText: '../utils/fileUtils',
};

const issues = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');

  for (const [fnName, importPath] of Object.entries(globalUtils)) {
    // Check if the function is used in this file
    const regex = new RegExp(`\\b${fnName}\\b`);
    if (regex.test(content)) {
      // Check if it's imported or declared in this file, or passed as hook parameter
      const importRegex = new RegExp(`import\\s+.*\\b${fnName}\\b`);
      const declRegex = new RegExp(`(?:const|function|let|var|export const|export function)\\s+${fnName}\\b`);
      const paramRegex = new RegExp(`(?:function|const\\s+\\w+\\s*=\\s*\\(?\\s*\\{[^}]*\\b${fnName}\\b)`);

      if (!importRegex.test(content) && !declRegex.test(content) && !paramRegex.test(content)) {
        issues.push({
          file: path.relative(srcDir, file),
          missingFn: fnName,
          suggestedImport: importPath
        });
      }
    }
  }
}

console.log('=== MISSING UTILITY IMPORT AUDIT REPORT ===');
if (issues.length === 0) {
  console.log('No missing utility imports found!');
} else {
  console.log(`Found ${issues.length} missing utility imports:\n`);
  issues.forEach(iss => {
    console.log(`[${iss.file}] Uses '${iss.missingFn}' but DOES NOT IMPORT IT! (From: ${iss.suggestedImport})`);
  });
}
