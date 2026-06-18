import client from "./client";

export const createRecommendation = (data) => {
  return client.post("/recommendations", data);
};

export const acceptRecommendation = (id) => {
  return client.post(`/recommendations/${id}/accept`);
};

export const rejectRecommendation = (id) => {
  return client.post(`/recommendations/${id}/reject`);
};

export const getRecommendationHistory = (schoolId) => {
  return client.get(`/recommendations/history/${schoolId}`);
};
