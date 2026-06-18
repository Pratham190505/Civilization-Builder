import client from "./client";

export const login = (email, password) => {
  return client.post("/auth/login", { email, password });
};

export const logout = (refreshToken) => {
  return client.post("/auth/logout", { refreshToken });
};

export const getProfile = () => {
  return client.get("/auth/profile");
};

export const updateProfile = (data) => {
  return client.put("/auth/profile", data);
};

export const changePassword = (currentPassword, newPassword) => {
  return client.post("/auth/change-password", { currentPassword, newPassword });
};

