const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

const results = [];

function logTest(endpoint, method, requestPayload, responseStatus, responseBody, pass, comments) {
  results.push({
    endpoint: `[${method}] ${endpoint}`,
    request: JSON.stringify(requestPayload, null, 2),
    status: responseStatus,
    response: JSON.stringify(responseBody, null, 2),
    pass: pass ? 'PASS' : 'FAIL',
    comments
  });
  console.log(`${pass ? '✅' : '❌'} [${method}] ${endpoint} - Status ${responseStatus} (${pass ? 'PASS' : 'FAIL'})`);
}

async function runTests() {
  console.log('Starting API Endpoint integration tests against real database...\n');

  let superAdminToken = '';
  let regionalAdminToken = '';
  let schoolAdminToken = '';

  // 1. Authentication Tests
  try {
    const loginPayload = { email: 'superadmin@gds.com', password: 'password123' };
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginPayload)
    });
    const body = await res.json();
    const isOk = res.status === 200 && body.success && body.data.accessToken;
    if (isOk) superAdminToken = body.data.accessToken;
    logTest('/auth/login (Super Admin)', 'POST', loginPayload, res.status, body, isOk, 'Login flow verification');
  } catch (err) {
    logTest('/auth/login (Super Admin)', 'POST', null, 500, { error: err.message }, false, 'Login failed to connect');
  }

  try {
    const loginPayload = { email: 'regionaladmin@gds.com', password: 'password123' };
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginPayload)
    });
    const body = await res.json();
    const isOk = res.status === 200 && body.success && body.data.accessToken;
    if (isOk) regionalAdminToken = body.data.accessToken;
    logTest('/auth/login (Regional Admin)', 'POST', loginPayload, res.status, body, isOk, 'Regional Admin login verification');
  } catch (err) {
    logTest('/auth/login (Regional Admin)', 'POST', null, 500, { error: err.message }, false, 'Login failed to connect');
  }

  try {
    const loginPayload = { email: 'schooladmin@gds.com', password: 'password123' };
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginPayload)
    });
    const body = await res.json();
    const isOk = res.status === 200 && body.success && body.data.accessToken;
    if (isOk) schoolAdminToken = body.data.accessToken;
    logTest('/auth/login (School Admin)', 'POST', loginPayload, res.status, body, isOk, 'School Admin login verification');
  } catch (err) {
    logTest('/auth/login (School Admin)', 'POST', null, 500, { error: err.message }, false, 'Login failed to connect');
  }

  if (!superAdminToken || !regionalAdminToken || !schoolAdminToken) {
    console.error('CRITICAL: Authentication failed. Cannot continue tests.');
    process.exit(1);
  }

  // Test Refresh Token endpoint
  try {
    // Generate refresh request
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@gds.com', password: 'password123' })
    });
    const loginBody = await loginRes.json();
    const refreshToken = loginBody.data.refreshToken;

    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    const body = await res.json();
    logTest('/auth/refresh', 'POST', { refreshToken }, res.status, body, res.status === 200 && body.success, 'Token refresh verification');
  } catch (err) {
    logTest('/auth/refresh', 'POST', null, 500, { error: err.message }, false, 'Token refresh failed');
  }

  // Test Impersonate endpoint
  try {
    const res = await fetch(`${BASE_URL}/security/impersonation/start`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({ userId: 6 }) // Impersonate School Admin (user ID 6)
    });
    const body = await res.json();
    logTest('/security/impersonation/start', 'POST', { userId: 6 }, res.status, body, res.status === 200 && body.success, 'Impersonation session flow');
  } catch (err) {
    logTest('/security/impersonation/start', 'POST', null, 500, { error: err.message }, false, 'Impersonation session failed');
  }

  // 2. States API Tests
  let testStateId = null;
  const randStateSuffix = Math.floor(Math.random() * 90 + 10);
  const statePayload = { name: `State of Test ${randStateSuffix}`, code: `TS${randStateSuffix}` };
  try {
    const res = await fetch(`${BASE_URL}/states`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`
      },
      body: JSON.stringify(statePayload)
    });
    const body = await res.json();
    const isOk = res.status === 201 && body.success;
    if (isOk) testStateId = body.data.id;
    logTest('/states', 'POST', statePayload, res.status, body, isOk, 'Create State');
  } catch (err) {
    logTest('/states', 'POST', null, 500, { error: err.message }, false, 'Create State failed');
  }

  try {
    const res = await fetch(`${BASE_URL}/states`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${superAdminToken}` }
    });
    const body = await res.json();
    logTest('/states', 'GET', null, res.status, body, res.status === 200 && body.success && Array.isArray(body.data), 'Get States list');
  } catch (err) {
    logTest('/states', 'GET', null, 500, { error: err.message }, false, 'Get States list failed');
  }

  if (testStateId) {
    try {
      const updatePayload = { name: `Updated State ${randStateSuffix}`, code: `TU${randStateSuffix}` };
      const res = await fetch(`${BASE_URL}/states/${testStateId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`
        },
        body: JSON.stringify(updatePayload)
      });
      const body = await res.json();
      logTest('/states/:id', 'PUT', updatePayload, res.status, body, res.status === 200 && body.success, 'Update State details');
    } catch (err) {
      logTest('/states/:id', 'PUT', null, 500, { error: err.message }, false, 'Update State details failed');
    }
  }

  // 3. Districts API Tests
  let testDistrictId = null;
  const randDistSuffix = Math.floor(Math.random() * 900 + 100);
  const districtPayload = { state_id: testStateId || 1, name: `District of Test ${randDistSuffix}`, code: `D${randDistSuffix}` };
  try {
    const res = await fetch(`${BASE_URL}/districts`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`
      },
      body: JSON.stringify(districtPayload)
    });
    const body = await res.json();
    const isOk = res.status === 201 && body.success;
    if (isOk) testDistrictId = body.data.id;
    logTest('/districts', 'POST', districtPayload, res.status, body, isOk, 'Create District');
  } catch (err) {
    logTest('/districts', 'POST', null, 500, { error: err.message }, false, 'Create District failed');
  }

  try {
    const res = await fetch(`${BASE_URL}/districts`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${superAdminToken}` }
    });
    const body = await res.json();
    logTest('/districts', 'GET', null, res.status, body, res.status === 200 && body.success && Array.isArray(body.data), 'Get Districts list');
  } catch (err) {
    logTest('/districts', 'GET', null, 500, { error: err.message }, false, 'Get Districts list failed');
  }

  // 4. Schools API Tests (Onboarding Request & Approval)
  let testSchoolId = null;
  const randSchoolSuffix = Math.floor(Math.random() * 9000 + 1000);
  const schoolPayload = {
    district_id: testDistrictId || 1,
    name: `Test Discovery Academy ${randSchoolSuffix}`,
    code: `GDS-TS-${randSchoolSuffix}`,
    address: '123 Discovery Road',
    phone: '9988776655',
    email: `testacademy-${randSchoolSuffix}@gds.com`,
    website: `http://testacademy-${randSchoolSuffix}.gds.com`
  };
  try {
    const res = await fetch(`${BASE_URL}/schools`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`
      },
      body: JSON.stringify(schoolPayload)
    });
    const body = await res.json();
    const isOk = res.status === 201 && body.success;
    if (isOk) testSchoolId = body.data.id;
    logTest('/schools', 'POST', schoolPayload, res.status, body, isOk, 'Register School Onboarding (PENDING)');
  } catch (err) {
    logTest('/schools', 'POST', null, 500, { error: err.message }, false, 'Register School failed');
  }

  if (testSchoolId) {
    try {
      const res = await fetch(`${BASE_URL}/schools/${testSchoolId}/approve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`
        },
        body: JSON.stringify({ comments: 'Onboarding criteria verified and approved.' })
      });
      const body = await res.json();
      logTest('/schools/:id/approve', 'POST', { comments: 'Onboarding approved.' }, res.status, body, res.status === 200 && body.success, 'Approve School Onboarding');
    } catch (err) {
      logTest('/schools/:id/approve', 'POST', null, 500, { error: err.message }, false, 'Approve School failed');
    }
  }

  try {
    const res = await fetch(`${BASE_URL}/schools`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${superAdminToken}` }
    });
    const body = await res.json();
    logTest('/schools', 'GET', null, res.status, body, res.status === 200 && body.success && Array.isArray(body.data), 'Get Schools list');
  } catch (err) {
    logTest('/schools', 'GET', null, 500, { error: err.message }, false, 'Get Schools list failed');
  }

  // 5. Media Upload & Submission Tests
  let testAssetId = null;
  try {
    // Generate simulated Multer file upload
    const formData = new FormData();
    formData.append('school_id', '1'); // Target School ID 1 (Global Discovery School East)
    formData.append('file', new Blob(['fake image buffer data'], { type: 'image/jpeg' }), 'sample-event.jpg');

    const res = await fetch(`${BASE_URL}/media/upload`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${schoolAdminToken}`
      },
      body: formData
    });
    const body = await res.json();
    const isOk = res.status === 201 && body.success;
    if (isOk) testAssetId = body.data.id;
    logTest('/media/upload', 'POST', { school_id: 1, file: 'sample-event.jpg' }, res.status, body, isOk, 'Upload Media Asset via Multer');
  } catch (err) {
    logTest('/media/upload', 'POST', null, 500, { error: err.message }, false, 'Upload Media Asset failed');
  }

  let testSubmissionId = null;
  if (testAssetId) {
    const submitPayload = {
      media_asset_id: testAssetId,
      title: 'Annual Sports Event 2026',
      description: 'GDS East annual sports event highlight media post for review.',
      school_id: 1
    };
    try {
      const res = await fetch(`${BASE_URL}/media/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${schoolAdminToken}`
        },
        body: JSON.stringify(submitPayload)
      });
      const body = await res.json();
      const isOk = res.status === 201 && body.success;
      if (isOk) testSubmissionId = body.data.id;
      logTest('/media/submit', 'POST', submitPayload, res.status, body, isOk, 'Submit Media Submission for Review');
    } catch (err) {
      logTest('/media/submit', 'POST', submitPayload, 500, { error: err.message }, false, 'Submit Media failed');
    }
  }

  if (testSubmissionId) {
    // Regional Review
    const reviewPayload = {
      submission_id: testSubmissionId,
      action: 'APPROVE',
      comments: 'Regional review passed. Post quality fits standard guidelines.'
    };
    try {
      const res = await fetch(`${BASE_URL}/media/review`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${regionalAdminToken}`
        },
        body: JSON.stringify(reviewPayload)
      });
      const body = await res.json();
      logTest('/media/review', 'POST', reviewPayload, res.status, body, res.status === 200 && body.success, 'Regional Admin Review Media Submission');
    } catch (err) {
      logTest('/media/review', 'POST', reviewPayload, 500, { error: err.message }, false, 'Review Media failed');
    }

    // Super Admin Approve
    const approvePayload = {
      submission_id: testSubmissionId,
      comments: 'Final quality is excellent. Ready for publication.'
    };
    try {
      const res = await fetch(`${BASE_URL}/media/approve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`
        },
        body: JSON.stringify(approvePayload)
      });
      const body = await res.json();
      logTest('/media/approve', 'POST', approvePayload, res.status, body, res.status === 200 && body.success, 'Super Admin Final Approve Media');
    } catch (err) {
      logTest('/media/approve', 'POST', approvePayload, 500, { error: err.message }, false, 'Final Approve Media failed');
    }

    // Publish to Platforms
    const publishPayload = {
      submission_id: testSubmissionId,
      platforms: ['FACEBOOK', 'INSTAGRAM']
    };
    try {
      const res = await fetch(`${BASE_URL}/media/publish`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`
        },
        body: JSON.stringify(publishPayload)
      });
      const body = await res.json();
      logTest('/media/publish', 'POST', publishPayload, res.status, body, res.status === 200 && body.success, 'Publish Media to Social Platforms');
    } catch (err) {
      logTest('/media/publish', 'POST', publishPayload, 500, { error: err.message }, false, 'Publish Media failed');
    }
  }

  // 6. Inspection Request, Schedule & Completion (Reports)
  let testInspectionRequestId = null;
  try {
    const reqPayload = {
      school_id: 1,
      comments: 'Requesting periodic inventory and building infrastructure inspection.',
      preferred_date: '2026-07-10'
    };
    const res = await fetch(`${BASE_URL}/inspection/request`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${schoolAdminToken}`
      },
      body: JSON.stringify(reqPayload)
    });
    const body = await res.json();
    const isOk = res.status === 201 && body.success;
    if (isOk) testInspectionRequestId = body.data.id;
    logTest('/inspection/request', 'POST', reqPayload, res.status, body, isOk, 'Request Inspection');
  } catch (err) {
    logTest('/inspection/request', 'POST', null, 500, { error: err.message }, false, 'Request Inspection failed');
  }

  let testReportId = null;
  if (testInspectionRequestId) {
    const schedulePayload = {
      requestId: testInspectionRequestId,
      inspectorId: 5, // Inspector is regional admin user (ID 5)
      scheduleDate: '2026-07-12'
    };
    try {
      const res = await fetch(`${BASE_URL}/inspection/schedule`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`
        },
        body: JSON.stringify(schedulePayload)
      });
      const body = await res.json();
      const isOk = (res.status === 200 || res.status === 201) && body.success;
      if (isOk) testReportId = body.data.id;
      logTest('/inspection/schedule', 'POST', schedulePayload, res.status, body, isOk, 'Schedule Inspection Date and Inspector');
    } catch (err) {
      logTest('/inspection/schedule', 'POST', schedulePayload, 500, { error: err.message }, false, 'Schedule Inspection failed');
    }
  }

  if (testReportId) {
    const completePayload = {
      reportId: testReportId,
      score: 95,
      feedback: 'Excellent infrastructure. All parameters verify fully. Highly functional building assets.'
    };
    try {
      const res = await fetch(`${BASE_URL}/inspection/complete`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`
        },
        body: JSON.stringify(completePayload)
      });
      const body = await res.json();
      logTest('/inspection/complete', 'POST', completePayload, res.status, body, res.status === 200 && body.success, 'Complete Inspection & Auto-Generate PDF Report');
    } catch (err) {
      logTest('/inspection/complete', 'POST', completePayload, 500, { error: err.message }, false, 'Complete Inspection failed');
    }
  }

  try {
    const res = await fetch(`${BASE_URL}/inspection/reports`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${superAdminToken}` }
    });
    const body = await res.json();
    logTest('/inspection/reports', 'GET', null, res.status, body, res.status === 200 && body.success, 'Get generated reports');
  } catch (err) {
    logTest('/inspection/reports', 'GET', null, 500, { error: err.message }, false, 'Get reports failed');
  }

  // 7. Rankings API Tests
  try {
    const res = await fetch(`${BASE_URL}/rankings`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${superAdminToken}` }
    });
    const body = await res.json();
    logTest('/rankings', 'GET', null, res.status, body, res.status === 200 && body.success, 'Get School Rankings list');
  } catch (err) {
    logTest('/rankings', 'GET', null, 500, { error: err.message }, false, 'Get rankings failed');
  }

  try {
    const res = await fetch(`${BASE_URL}/rankings/recalculate`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${superAdminToken}` }
    });
    const body = await res.json();
    logTest('/rankings/recalculate', 'POST', null, res.status, body, res.status === 200 && body.success, 'Trigger Manual Scores & Rankings Recalculation');
  } catch (err) {
    logTest('/rankings/recalculate', 'POST', null, 500, { error: err.message }, false, 'Recalculate rankings failed');
  }

  // 8. Recommendations API Tests
  let testRecId = null;
  try {
    const recPayload = {
      school_id: 1,
      type: 'INVENTORY_RESTORATION',
      description: 'Add sports assets and playground equipment to boost activity scores.',
      priority: 'HIGH'
    };
    const res = await fetch(`${BASE_URL}/recommendations`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`
      },
      body: JSON.stringify(recPayload)
    });
    const body = await res.json();
    const isOk = res.status === 201 && body.success;
    if (isOk) testRecId = body.data.id;
    logTest('/recommendations', 'POST', recPayload, res.status, body, isOk, 'Create School Improvement Recommendation');
  } catch (err) {
    logTest('/recommendations', 'POST', null, 500, { error: err.message }, false, 'Create recommendation failed');
  }

  if (testRecId) {
    try {
      const res = await fetch(`${BASE_URL}/recommendations/${testRecId}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${schoolAdminToken}` }
      });
      const body = await res.json();
      logTest('/recommendations/:id/accept', 'POST', null, res.status, body, res.status === 200 && body.success, 'School Admin Accept Recommendation');
    } catch (err) {
      logTest('/recommendations/:id/accept', 'POST', null, 500, { error: err.message }, false, 'Accept recommendation failed');
    }
  }

  try {
    const res = await fetch(`${BASE_URL}/recommendations/history/1`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${schoolAdminToken}` }
    });
    const body = await res.json();
    logTest('/recommendations/history/:schoolId', 'GET', null, res.status, body, res.status === 200 && body.success, 'Get Recommendation Status History');
  } catch (err) {
    logTest('/recommendations/history/:schoolId', 'GET', null, 500, { error: err.message }, false, 'Get recommendation history failed');
  }

  // 9. Notifications API Tests
  let notificationIds = [];
  try {
    const res = await fetch(`${BASE_URL}/notifications`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${schoolAdminToken}` }
    });
    const body = await res.json();
    if (body.success && Array.isArray(body.data)) {
      notificationIds = body.data.map(n => n.id);
    }
    logTest('/notifications', 'GET', null, res.status, body, res.status === 200 && body.success, 'Get Notifications list');
  } catch (err) {
    logTest('/notifications', 'GET', null, 500, { error: err.message }, false, 'Get notifications failed');
  }

  try {
    const res = await fetch(`${BASE_URL}/notifications/read`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${schoolAdminToken}` 
      },
      body: JSON.stringify({ ids: notificationIds.length > 0 ? notificationIds : [1] })
    });
    const body = await res.json();
    logTest('/notifications/read', 'PATCH', { ids: notificationIds }, res.status, body, res.status === 200 && body.success, 'Mark notifications as Read');
  } catch (err) {
    logTest('/notifications/read', 'PATCH', null, 500, { error: err.message }, false, 'Mark read failed');
  }

  // Save the report file
  const reportData = {
    testTime: new Date().toISOString(),
    totalTests: results.length,
    passed: results.filter(r => r.pass === 'PASS').length,
    failed: results.filter(r => r.pass === 'FAIL').length,
    tests: results
  };

  fs.writeFileSync(
    path.join(__dirname, 'api_test_results.json'),
    JSON.stringify(reportData, null, 2)
  );
  console.log(`\nVerification complete. Passed: ${reportData.passed}/${reportData.totalTests}`);
  console.log('Results saved to scratch/api_test_results.json.');
}

runTests().catch(err => {
  console.error('Fatal test runner crash:', err);
});
