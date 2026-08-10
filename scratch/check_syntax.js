import fs from 'fs';

const content = fs.readFileSync('src/App.jsx', 'utf8');

let braces = 0;
let parens = 0;
let brackets = 0;
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  for (let j = 0; j < line.length; j++) {
    let char = line[j];
    if (char === '{') braces++;
    if (char === '}') braces--;
    if (char === '(') parens++;
    if (char === ')') parens--;
    if (char === '[') brackets++;
    if (char === ']') brackets--;
  }
  if (braces < 0) {
    console.log(`Unmatched } at line ${i + 1}: braces count is ${braces}`);
    braces = 0; // reset to avoid spam
  }
  if (parens < 0) {
    console.log(`Unmatched ) at line ${i + 1}: parens count is ${parens}`);
    parens = 0;
  }
}

console.log(`Final counts: braces=${braces}, parens=${parens}, brackets=${brackets}`);
