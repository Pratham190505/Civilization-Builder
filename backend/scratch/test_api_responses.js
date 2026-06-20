const path = require('path');
const backendPath = 'c:/Users/Rana Ruchi/OneDrive/Desktop/internship 2.o/final/Civilization-Builder/backend';

async function testApi() {
  try {
    // 1. Log in
    const loginRes = await fetch('http://localhost:5003/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'schooladmin@gds.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    console.log('=== LOGIN RESPONSE ===');
    console.log(JSON.stringify(loginData, null, 2));

    if (!loginData.success) {
      console.log('Login failed.');
      return;
    }
    const token = loginData.data.accessToken;

    // 2. Fetch Profile
    const profileRes = await fetch('http://localhost:5003/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const profileData = await profileRes.json();
    console.log('\n=== PROFILE RESPONSE ===');
    console.log(JSON.stringify(profileData, null, 2));

    // 3. Fetch Schools
    const schoolsRes = await fetch('http://localhost:5003/schools', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const schoolsData = await schoolsRes.json();
    console.log('\n=== SCHOOLS RESPONSE ===');
    console.log(JSON.stringify(schoolsData, null, 2));

    // 4. Fetch Analytics
    const schoolId = profileData.data.scope.schoolId;
    const analyticsRes = await fetch(`http://localhost:5003/analytics/school/${schoolId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const analyticsData = await analyticsRes.json();
    console.log('\n=== ANALYTICS RESPONSE ===');
    console.log(JSON.stringify(analyticsData, null, 2));

  } catch (err) {
    console.error('Error testing API:', err);
  }
}

testApi();
