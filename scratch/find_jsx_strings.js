import fs from 'fs';
import path from 'path';

const pagesDir = 'C:/Users/abcd/.gemini/antigravity/scratch/naricare-ai/src';

const targets = ['ollama', 'qwen', 'local ai model', 'localaiprovider', 'gemini', 'demo', 'synthetic demo report', 'synthetic'];

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.tsx') || file.endsWith('.html')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        const lower = line.toLowerCase();
        for (const t of targets) {
          if (lower.includes(t)) {
            console.log(`${fullPath}:${idx + 1}: [${t}] -> ${line.trim()}`);
          }
        }
      });
    }
  }
}

scanDir(pagesDir);
