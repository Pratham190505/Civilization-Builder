const path = require('path');
const backendPath = 'c:/Users/Rana Ruchi/OneDrive/Desktop/internship 2.o/final/Civilization-Builder/backend';

async function testDistrict() {
  try {
    const loginRes = await fetch('http://localhost:5003/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'schooladmin@gds.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.accessToken;
    const headers = { 'Authorization': `Bearer ${token}` };

    const res1 = await fetch('http://localhost:5003/districts', { headers });
    const data1 = await res1.json();
    console.log('=== DISTRICTS ===');
    console.log(JSON.stringify(data1, null, 2));

    const res2 = await fetch('http://localhost:5003/schools?status=ALL', { headers });
    const data2 = await res2.json();
    console.log('=== SCHOOLS STATUS=ALL ===');
    console.log(JSON.stringify(data2, null, 2));

  } catch (err) {
    console.error(err);
  }
}

testDistrict();
