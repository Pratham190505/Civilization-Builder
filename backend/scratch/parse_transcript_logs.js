const fs = require('fs');
const readline = require('readline');

const transcriptPath = 'C:/Users/Rana Ruchi/.gemini/antigravity-ide/brain/818e1f18-70e9-4d61-b4d4-87915d82d806/.system_generated/logs/transcript.jsonl';

async function parse() {
  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line) continue;
    const step = JSON.parse(line);
    
    // Look for tool calls to capture_browser_console_logs
    if (step.tool_calls) {
      for (const call of step.tool_calls) {
        if (call.name === 'capture_browser_console_logs') {
          console.log(`\n=== Console Logs captured at step ${step.step_index} ===`);
          console.log(JSON.stringify(call.args, null, 2));
        }
      }
    }
    
    // Look for responses containing console logs
    if (step.type === 'TOOL_RESPONSE' && step.content && step.content.includes('console')) {
      console.log(`\n=== Tool Response at step ${step.step_index} ===`);
      console.log(step.content);
    }
  }
}

parse();
