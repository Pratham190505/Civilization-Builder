import client from "./client";

export const getNationalAnalytics = () => {
  return client.get("/analytics/national");
};

export const getStateAnalytics = (stateId) => {
  return client.get(`/analytics/state/${stateId}`);
};

export const getSchoolAnalytics = (schoolId) => {
  return client.get(`/analytics/school/${schoolId}`);
};
