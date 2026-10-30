const fs = require('fs');
const readline = require('readline');

const fileStream = fs.createReadStream('C:/Users/sande/.gemini/antigravity/brain/73cfaf60-6f37-4fc0-8356-6c857fa2bbe8/.system_generated/logs/transcript_full.jsonl');
const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

let found = false;
rl.on('line', (line) => {
  if (found) return;
  try {
    const obj = JSON.parse(line);
    if (obj.content && typeof obj.content === 'string' && obj.content.includes('REAL-WORLD SPECIALIST REFERRAL WORKFLOW')) {
      found = true;
      fs.writeFileSync('scratch/full_request_spec.md', obj.content, 'utf8');
      console.log('Saved full request spec to scratch/full_request_spec.md. Length:', obj.content.length);
    }
  } catch (e) {}
});
