const fs = require('fs');
const readline = require('readline');

const path = 'C:/Users/Rana Ruchi/.gemini/antigravity-ide/brain/818e1f18-70e9-4d61-b4d4-87915d82d806/.system_generated/logs/transcript.jsonl';

async function run() {
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line) continue;
    try {
      const step = JSON.parse(line);
      if (step.type === 'BROWSER_SUBAGENT') {
        console.log(`\n=== BROWSER SUBAGENT STEP (Index: ${step.step_index}) ===`);
        console.log(JSON.stringify(step, null, 2));
      }
    } catch {}
  }
}

run();
