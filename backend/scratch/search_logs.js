const fs = require('fs');
const path = require('path');

const logPath = 'c:/Users/Rana Ruchi/OneDrive/Desktop/internship 2.o/final/Civilization-Builder/backend/logs/combined.log';

function search() {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  const relevantLines = lines.filter(line => {
    if (!line) return false;
    try {
      const log = JSON.parse(line);
      return log.timestamp && log.timestamp >= '2026-06-21 01:08:00';
    } catch {
      return false;
    }
  });

  relevantLines.forEach(line => {
    const log = JSON.parse(line);
    if (log.message.includes('[GET]') || log.message.includes('[POST]') || log.message.includes('[PUT]') || log.message.includes('[DELETE]') || log.message.includes('[PATCH]')) {
      console.log(`${log.timestamp} - ${log.message}`);
    }
  });
}

search();
