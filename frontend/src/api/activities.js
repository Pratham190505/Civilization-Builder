import client from "./client";

export const getActivitiesBySchool = (schoolId) => {
  return client.get(`/activities/school/${schoolId}`);
};

export const createActivity = (data) => {
  return client.post("/activities", data);
};

export const updateActivity = (id, data) => {
  return client.put(`/activities/${id}`, data);
};

export const deleteActivity = (id) => {
  return client.delete(`/activities/${id}`);
};

export const createAchievement = (data) => {
  return client.post("/achievements", data);
};

export const uploadAchievementAsset = (id, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return client.post(`/achievements/${id}/assets`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
