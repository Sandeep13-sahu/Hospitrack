const fs = require('fs');
const readline = require('readline');

const fileStream = fs.createReadStream('C:/Users/sande/.gemini/antigravity/brain/73cfaf60-6f37-4fc0-8356-6c857fa2bbe8/.system_generated/logs/transcript.jsonl');
const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

rl.on('line', (line) => {
  try {
    const obj = JSON.parse(line);
    if (obj.content && typeof obj.content === 'string' && obj.content.includes('REAL-WORLD SPECIALIST REFERRAL WORKFLOW')) {
      console.log('=== FOUND REQUEST ===');
      console.log(obj.content.slice(0, 3000));
    }
  } catch (e) {}
});

