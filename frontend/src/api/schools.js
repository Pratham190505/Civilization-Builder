import client from "./client";

// States API
export const getStates = () => {
  return client.get("/states");
};

const toStatePayload = (data) => ({
  name: (data.name ?? data.state_name ?? "").trim(),
  code: (data.code ?? data.state_code ?? "").trim().toUpperCase(),
  ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
});

export const createState = (data) => {
  return client.post("/states", toStatePayload(data));
};

export const updateState = (id, data) => {
  return client.put(`/states/${id}`, toStatePayload(data));
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

// Schools API
export const getSchools = (params = {}) => {
  return client.get("/schools", { params });
};

export const createSchool = (data) => {
  const payload = {
    district_id: data.district_id,
    name: data.school_name || data.name,
    code: data.school_code || data.code,
    address: data.address || undefined,
    phone: data.mobile || data.phone || undefined,
    email: data.email || undefined,
    website: data.website || undefined,
    udise_code: data.udise_code || undefined,
    principal_name: data.principal_name || undefined,
    student_count: data.student_count !== undefined && data.student_count !== "" ? parseInt(data.student_count, 10) : 0,
    teacher_count: data.teacher_count !== undefined && data.teacher_count !== "" ? parseInt(data.teacher_count, 10) : 0,
    school_admin_email: data.school_admin_email,
    school_admin_password: data.school_admin_password,
    confirm_password: data.confirm_password,
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
    district_id: data.district_id,
    name: data.school_name || data.name,
    code: data.school_code || data.code,
    address: data.address || undefined,
    phone: data.mobile || data.phone || undefined,
    email: data.email || undefined,
    website: data.website || undefined,
    udise_code: data.udise_code || undefined,
    principal_name: data.principal_name || undefined,
    student_count: data.student_count !== undefined && data.student_count !== "" ? parseInt(data.student_count, 10) : undefined,
    teacher_count: data.teacher_count !== undefined && data.teacher_count !== "" ? parseInt(data.teacher_count, 10) : undefined,
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

// School Onboarding approvals
export const approveSchool = (id, comments = "") => {
  return client.post(`/schools/${id}/approve`, { comments });
};

export const rejectSchool = (id, comments = "") => {
  return client.post(`/schools/${id}/reject`, { comments });
};
