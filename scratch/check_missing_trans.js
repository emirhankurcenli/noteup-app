import fs from 'fs';
import path from 'path';

const transFile = fs.readFileSync('src/constants/translations.js', 'utf8');

function walk(dir) {
  let r = [];
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) r = r.concat(walk(p));
    else if (f.endsWith('.jsx') || f.endsWith('.js')) r.push(p);
  });
  return r;
}

const missing = [];
walk('src').forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  const reg = /t\(['"]([a-zA-Z0-9_]+)['"]/g;
  let m;
  while ((m = reg.exec(c)) !== null) {
    const key = m[1];
    if (!transFile.includes(key + ':') && !transFile.includes(key + ' :')) {
      missing.push(key + ' -> ' + f);
    }
  }
});

console.log('Missing translations:', Array.from(new Set(missing)));
