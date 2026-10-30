const { execSync } = require('child_process');
const initialCss = execSync('git show ab34f0b:css/styles.css').toString('utf8');

const regex = /\/\* =+\s*([\s\S]*?)\s*=+ \*\//g;
let m;
while ((m = regex.exec(initialCss)) !== null) {
  const title = m[1].trim().split('\n')[0];
  console.log(`Pos: ${m.index} -> ${title}`);
}

