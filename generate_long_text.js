const fs = require('fs');
const path = require('path');

const lines = parseInt(process.argv[2], 10) || 2000;
const outPath = path.join(process.cwd(), 'long-text-simulator.txt');
const stream = fs.createWriteStream(outPath, { encoding: 'utf8' });

function repeatText(n) {
  const parts = [];
  for (let i = 0; i < n; i++) parts.push('This is example documentation text to provide scrolling content.');
  return parts.join(' ');
}

for (let i = 1; i <= lines; i++) {
  if (i % 50 === 1) {
    stream.write('============================================================\n');
    stream.write(`# MANUAL SECTION ${Math.ceil(i / 50)}\n`);
    stream.write('------------------------------------------------------------\n');
  }

  stream.write(`Line ${i}: ` + repeatText((i % 5) + 1) + '\n');

  if (i % 10 === 0) {
    stream.write('\n');
  }
}

stream.end(() => {
  console.log(`Wrote ${lines} lines to ${outPath}`);
});
