const fs = require('fs');
const path = require('path');
const readline = require('readline');

function findTranscripts(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findTranscripts(filePath));
    } else if (file === 'transcript.jsonl') {
      results.push(filePath);
    }
  });
  return results;
}

async function search() {
  const brainDir = 'C:/Users/Rana Ruchi/.gemini/antigravity-ide/brain';
  const files = findTranscripts(brainDir);
  
  for (const filePath of files) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    for await (const line of rl) {
      if (!line) continue;
      try {
        const step = JSON.parse(line);
        if (step.tool_calls) {
          for (const call of step.tool_calls) {
            if (call.name === 'capture_browser_console_logs') {
              console.log(`\n=== File: ${filePath} (Step ${step.step_index}) ===`);
              console.log(JSON.stringify(call.args, null, 2));
            }
          }
        }
        if (step.type === 'TOOL_RESPONSE' && step.tool_name === 'capture_browser_console_logs') {
          console.log(`\n=== Response in: ${filePath} ===`);
          console.log(step.content);
        }
      } catch (err) {
        // ignore
      }
    }
  }
}

search();
