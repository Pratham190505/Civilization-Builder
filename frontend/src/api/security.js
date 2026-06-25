import client from "./client";

export const getAuditLogs = (page = 1, limit = 20, filters = {}) => {
  return client.get("/security/logs", {
    params: { page, limit, ...filters },
  });
};

export const startImpersonation = (userId) => {
  return client.post("/security/impersonation/start", { userId });
};

export const endImpersonation = (sessionId) => {
  return client.post("/security/impersonation/end", { sessionId });
};

export const getRegionalAdmins = () => {
  return client.get("/security/admins");
};

export const createRegionalAdmin = (data) => {
  return client.post("/security/admins", data);
};

export const updateRegionalAdmin = (id, data) => {
  return client.put(`/security/admins/${id}`, data);
};

export const deleteRegionalAdmin = (id) => {
  return client.delete(`/security/admins/${id}`);
};

export const globalSearch = (q) => {
  return client.get(`/security/search?q=${encodeURIComponent(q)}`);
};

