const runTest = async () => {
  console.log("Triggering registration request...");
  
  const payload = {
    schoolName: "Test Automation Academy",
    school_name: "Test Automation Academy",
    school_code: "GDS-TA-" + Math.floor(Math.random() * 10000),
    school_type: "Co-Ed",
    affiliation_board: "CBSE",
    email: "testacademy_" + Math.floor(Math.random() * 10000) + "@gds.com",
    mobile: "9876543210",
    alternate_mobile: "9876543211",
    website: "https://testacademy.gds.com",
    establishment_year: 2020,
    logo_url: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=80&fit=crop",
    districtId: 1, // Bengaluru or similar district
    district_id: 1,
    city: "Bengaluru",
    taluka: "Yelahanka",
    pin_code: "560001",
    address: "123 Test Street, Bengaluru, Karnataka",
    principal_name: "Dr. Principal Test",
    principal_email: "principaltest@gds.com",
    principal_mobile: "9876543212",
    principal_qualification: "Ph.D in Education",
    admin_name: "Admin Test",
    admin_email: "admintest_" + Math.floor(Math.random() * 10000) + "@gds.com",
    admin_mobile: "9876543213",
    password: "Password123!",
    admin_password: "Password123!",
    student_count: 200,
    boys_count: 100,
    girls_count: 100,
    teacher_count: 10,
    male_teachers_count: 5,
    female_teachers_count: 5,
    non_teaching_staff_count: 2,
    classrooms_count: 10,
    labs_count: 2,
    computer_labs_count: 1,
    library_available: 1,
    playground_available: 1,
    smart_classrooms_count: 3,
    auditorium_available: 1,
    transport_available: 1,
    description: "A wonderful school for automation tests.",
    achievements: "First place in E2E testing.",
    facebook_url: "https://facebook.com/testacademy",
    instagram_url: "https://instagram.com/testacademy",
    youtube_url: "https://youtube.com/testacademy",
    notes: "Automation test registration run."
  };

  try {
    const response = await fetch("http://127.0.0.1:5003/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log("Response Status:", response.status);
    console.log("Response JSON:", JSON.stringify(result, null, 2));

    if (response.status === 201 && result.success) {
      console.log("✅ ONBOARDING SIGNUP SUCCESSFUL!");
      process.exit(0);
    } else {
      console.error("❌ ONBOARDING SIGNUP FAILED!");
      process.exit(1);
    }
  } catch (err) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }
};

runTest();
