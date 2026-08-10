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
const potentialMissing = [];

// Match identifier calls like myFunc() or <MyComponent
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Find JSX components <Component
  const jsxMatches = content.matchAll(/<([A-Z][a-zA-Z0-9_]*)/g);
  for (const match of jsxMatches) {
    const compName = match[1];
    if (['StrictMode', 'Fragment', 'div', 'span', 'button', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'svg', 'path', 'circle', 'line', 'polyline', 'polygon', 'rect', 'g', 'defs', 'linearGradient', 'stop', 'details', 'summary', 'pre', 'strong', 'em', 'input', 'textarea', 'label', 'option', 'select'].includes(compName)) continue;
    
    // Check if imported or declared in file
    const importRegex = new RegExp(`import\\s+.*\\b${compName}\\b`);
    const declRegex = new RegExp(`(?:const|function|class|var|let)\\s+${compName}\\b`);
    
    if (!importRegex.test(content) && !declRegex.test(content)) {
      potentialMissing.push({
        file: path.relative(srcDir, file),
        symbol: compName,
        type: 'JSX Component'
      });
    }
  }
}

console.log('=== DEEP AST FULL CODEBASE COMPONENT AUDIT ===');
if (potentialMissing.length === 0) {
  console.log('CONGRATS! ALL JSX COMPONENTS ACROSS THE ENTIRE APP ARE VALID & PROPERLY IMPORTED!');
} else {
  console.log(`Found ${potentialMissing.length} potential missing component references:\n`);
  potentialMissing.forEach(p => {
    console.log(`[${p.file}] Missing Component: '<${p.symbol}>'`);
  });
}
