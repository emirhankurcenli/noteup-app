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
const report = [];

const deletedSymbols = [
  'AddFolderModal',
  'FolderModal',
  'FolderShareModal',
  'MoveNoteModal',
  'SelectFriendsShareFolderModal',
  'FolderSidebar',
  'useFolderOperations',
  'showFolderModal',
  'setShowFolderModal',
  'newFolderName',
  'setNewFolderName',
  'newFolderColor',
  'setNewFolderColor',
  'selectedFolderId',
  'setSelectedFolderId',
  'activeMenuFolderId',
  'setActiveMenuFolderId',
  'activeShareFolderId',
  'setActiveShareFolderId',
  'handleCreateFolder',
  'handleDeleteFolder',
  'handleShareFolder',
  'handleMoveNoteToFolder',
  'FOLDER_COLORS',
  'folders',
  'setFolders'
];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Ignore comments
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

    for (const sym of deletedSymbols) {
      // Check if symbol is used in actual code (not inside strings or comments)
      const regex = new RegExp(`\\b${sym}\\b`);
      if (regex.test(line)) {
        // Exclude clean storage keys or translations object keys if valid
        if (file.endsWith('translations.js') || file.endsWith('storageKeys.js')) continue;
        report.push({
          file: path.relative(srcDir, file),
          line: idx + 1,
          symbol: sym,
          code: line.trim()
        });
      }
    }
  });
}

console.log('=== UNDEFINED / DELETED SYMBOLS AUDIT REPORT ===');
console.log(`Found ${report.length} potential residual references:\n`);
report.forEach(r => {
  console.log(`[${r.file}:${r.line}] Symbol: '${r.symbol}' -> ${r.code}`);
});
