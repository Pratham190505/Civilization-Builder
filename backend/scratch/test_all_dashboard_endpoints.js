const path = require('path');
const backendPath = 'c:/Users/Rana Ruchi/OneDrive/Desktop/internship 2.o/final/Civilization-Builder/backend';

async function testAll() {
  try {
    const loginRes = await fetch('http://localhost:5003/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'schooladmin@gds.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    if (!loginData.success) {
      console.log('Login failed.');
      return;
    }
    const token = loginData.data.accessToken;
    const headers = { 'Authorization': `Bearer ${token}` };

    const urls = [
      { name: '1. Analytics', url: 'http://localhost:5003/analytics/school/1' },
      { name: '2. School Rankings', url: 'http://localhost:5003/rankings/school/1' },
      { name: '3. Media List', url: 'http://localhost:5003/media/list' },
      { name: '4. Global Rankings', url: 'http://localhost:5003/rankings' },
      { name: '5. Schools', url: 'http://localhost:5003/schools' },
      { name: '6. Inspection Requests', url: 'http://localhost:5003/inspection/requests' }
    ];

    for (const item of urls) {
      try {
        const res = await fetch(item.url, { headers });
        const text = await res.text();
        console.log(`\n=== ${item.name} ===`);
        console.log(`Status: ${res.status}`);
        try {
          const json = JSON.parse(text);
          console.log(`JSON Success: ${json.success}`);
          if (!json.success) {
            console.log('Response Error:', json);
          }
        } catch {
          console.log('Returned HTML / Non-JSON content:', text.slice(0, 200));
        }
      } catch (err) {
        console.log(`Failed to fetch ${item.name}:`, err.message);
      }
    }

  } catch (err) {
    console.error('Error during run:', err);
  }
}

testAll();
