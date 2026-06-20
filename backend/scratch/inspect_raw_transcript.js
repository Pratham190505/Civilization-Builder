const fs = require('fs');
const readline = require('readline');

const path = 'C:/Users/Rana Ruchi/.gemini/antigravity-ide/brain/818e1f18-70e9-4d61-b4d4-87915d82d806/.system_generated/logs/transcript.jsonl';

async function run() {
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const toolNames = new Set();
  const types = new Set();

  for await (const line of rl) {
    if (!line) continue;
    try {
      const step = JSON.parse(line);
      types.add(step.type);
      if (step.tool_calls) {
        step.tool_calls.forEach(c => toolNames.add(c.name));
      }
      if (step.tool_name) {
        toolNames.add(step.tool_name);
      }
    } catch {}
  }

  console.log('Types found:', Array.from(types));
  console.log('Tool names found:', Array.from(toolNames));
}

run();
