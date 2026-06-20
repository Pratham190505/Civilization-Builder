import client from "./client";

// States API
export const getStates = () => {
  return client.get("/states");
};

export const createState = (data) => {
  return client.post("/states", data);
};

export const updateState = (id, data) => {
  return client.put(`/states/${id}`, data);
};

export const deleteState = (id) => {
  return client.delete(`/states/${id}`);
};

// Districts API
export const getDistricts = () => {
  return client.get("/districts");
};

export const createDistrict = (data) => {
  return client.post("/districts", data);
};

export const updateDistrict = (id, data) => {
  return client.put(`/districts/${id}`, data);
};

export const deleteDistrict = (id) => {
  return client.delete(`/districts/${id}`);
};

export const getDistrictCities = (districtId) => {
  return client.get(`/districts/${districtId}/cities`);
};

// Schools API
export const getSchools = (params = {}) => {
  return client.get("/schools", { params });
};

export const createSchool = (data) => {
  const payload = {
    district_id: data.district_id ? parseInt(data.district_id, 10) : undefined,
    school_name: data.school_name || data.name,
    school_code: data.school_code || data.code,
    udise_code: data.udise_code || undefined,
    school_type: data.school_type || undefined,
    affiliation_board: data.affiliation_board || undefined,
    email: data.email || undefined,
    mobile: data.mobile || data.phone || undefined,
    alternate_mobile: data.alternate_mobile || undefined,
    website: data.website || undefined,
    establishment_year: data.establishment_year ? parseInt(data.establishment_year, 10) : undefined,
    logo_url: data.logo_url || undefined,
    city: data.city || undefined,
    taluka: data.taluka || undefined,
    pin_code: data.pin_code || undefined,
    address: data.address || undefined,
    principal_name: data.principal_name || undefined,
    principal_qualification: data.principal_qualification || undefined,
    principal_email: data.principal_email || undefined,
    principal_mobile: data.principal_mobile || undefined,
    admin_name: data.admin_name || undefined,
    admin_email: data.admin_email || undefined,
    admin_mobile: data.admin_mobile || undefined,
    admin_password: data.admin_password || undefined,
    student_count: data.student_count !== undefined && data.student_count !== "" ? parseInt(data.student_count, 10) : undefined,
    boys_count: data.boys_count !== undefined && data.boys_count !== "" ? parseInt(data.boys_count, 10) : undefined,
    girls_count: data.girls_count !== undefined && data.girls_count !== "" ? parseInt(data.girls_count, 10) : undefined,
    teacher_count: data.teacher_count !== undefined && data.teacher_count !== "" ? parseInt(data.teacher_count, 10) : undefined,
    male_teachers_count: data.male_teachers_count !== undefined && data.male_teachers_count !== "" ? parseInt(data.male_teachers_count, 10) : undefined,
    female_teachers_count: data.female_teachers_count !== undefined && data.female_teachers_count !== "" ? parseInt(data.female_teachers_count, 10) : undefined,
    non_teaching_staff_count: data.non_teaching_staff_count !== undefined && data.non_teaching_staff_count !== "" ? parseInt(data.non_teaching_staff_count, 10) : undefined,
    classrooms_count: data.classrooms_count !== undefined && data.classrooms_count !== "" ? parseInt(data.classrooms_count, 10) : undefined,
    labs_count: data.labs_count !== undefined && data.labs_count !== "" ? parseInt(data.labs_count, 10) : undefined,
    computer_labs_count: data.computer_labs_count !== undefined && data.computer_labs_count !== "" ? parseInt(data.computer_labs_count, 10) : undefined,
    library_available: data.library_available ? 1 : 0,
    playground_available: data.playground_available ? 1 : 0,
    smart_classrooms_count: data.smart_classrooms_count !== undefined && data.smart_classrooms_count !== "" ? parseInt(data.smart_classrooms_count, 10) : undefined,
    auditorium_available: data.auditorium_available ? 1 : 0,
    transport_available: data.transport_available ? 1 : 0,
    description: data.description || undefined,
    achievements: data.achievements || undefined,
    facebook_url: data.facebook_url || undefined,
    instagram_url: data.instagram_url || undefined,
    youtube_url: data.youtube_url || undefined,
    notes: data.notes || undefined,
    media_upload_enabled: data.media_upload_enabled !== undefined ? (data.media_upload_enabled ? 1 : 0) : undefined,
  };
  // Clean undefined or empty string properties so Zod optional checks pass
  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined || payload[key] === "") {
      delete payload[key];
    }
  });
  return client.post("/schools", payload);
};

export const updateSchool = (id, data) => {
  const payload = {
    district_id: data.district_id ? parseInt(data.district_id, 10) : undefined,
    school_name: data.school_name || data.name,
    school_code: data.school_code || data.code,
    udise_code: data.udise_code || undefined,
    school_type: data.school_type || undefined,
    affiliation_board: data.affiliation_board || undefined,
    email: data.email || undefined,
    mobile: data.mobile || data.phone || undefined,
    alternate_mobile: data.alternate_mobile || undefined,
    website: data.website || undefined,
    establishment_year: data.establishment_year ? parseInt(data.establishment_year, 10) : undefined,
    logo_url: data.logo_url || undefined,
    city: data.city || undefined,
    taluka: data.taluka || undefined,
    pin_code: data.pin_code || undefined,
    address: data.address || undefined,
    principal_name: data.principal_name || undefined,
    principal_qualification: data.principal_qualification || undefined,
    principal_email: data.principal_email || undefined,
    principal_mobile: data.principal_mobile || undefined,
    student_count: data.student_count !== undefined && data.student_count !== "" ? parseInt(data.student_count, 10) : undefined,
    boys_count: data.boys_count !== undefined && data.boys_count !== "" ? parseInt(data.boys_count, 10) : undefined,
    girls_count: data.girls_count !== undefined && data.girls_count !== "" ? parseInt(data.girls_count, 10) : undefined,
    teacher_count: data.teacher_count !== undefined && data.teacher_count !== "" ? parseInt(data.teacher_count, 10) : undefined,
    male_teachers_count: data.male_teachers_count !== undefined && data.male_teachers_count !== "" ? parseInt(data.male_teachers_count, 10) : undefined,
    female_teachers_count: data.female_teachers_count !== undefined && data.female_teachers_count !== "" ? parseInt(data.female_teachers_count, 10) : undefined,
    non_teaching_staff_count: data.non_teaching_staff_count !== undefined && data.non_teaching_staff_count !== "" ? parseInt(data.non_teaching_staff_count, 10) : undefined,
    classrooms_count: data.classrooms_count !== undefined && data.classrooms_count !== "" ? parseInt(data.classrooms_count, 10) : undefined,
    labs_count: data.labs_count !== undefined && data.labs_count !== "" ? parseInt(data.labs_count, 10) : undefined,
    computer_labs_count: data.computer_labs_count !== undefined && data.computer_labs_count !== "" ? parseInt(data.computer_labs_count, 10) : undefined,
    library_available: data.library_available !== undefined ? (data.library_available ? 1 : 0) : undefined,
    playground_available: data.playground_available !== undefined ? (data.playground_available ? 1 : 0) : undefined,
    smart_classrooms_count: data.smart_classrooms_count !== undefined && data.smart_classrooms_count !== "" ? parseInt(data.smart_classrooms_count, 10) : undefined,
    auditorium_available: data.auditorium_available !== undefined ? (data.auditorium_available ? 1 : 0) : undefined,
    transport_available: data.transport_available !== undefined ? (data.transport_available ? 1 : 0) : undefined,
    description: data.description || undefined,
    achievements: data.achievements || undefined,
    facebook_url: data.facebook_url || undefined,
    instagram_url: data.instagram_url || undefined,
    youtube_url: data.youtube_url || undefined,
    notes: data.notes || undefined,
    media_upload_enabled: data.media_upload_enabled !== undefined ? (data.media_upload_enabled ? 1 : 0) : undefined,
  };
  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined || payload[key] === "") {
      delete payload[key];
    }
  });
  return client.put(`/schools/${id}`, payload);
};

export const deleteSchool = (id) => {
  return client.delete(`/schools/${id}`);
};

export const getSchoolById = (id) => {
  return client.get(`/schools/${id}`);
};

// School Onboarding approvals
export const approveSchool = (id, comments = "") => {
  return client.post(`/schools/${id}/approve`, { comments });
};

export const rejectSchool = (id, comments = "") => {
  return client.post(`/schools/${id}/reject`, { comments });
};
