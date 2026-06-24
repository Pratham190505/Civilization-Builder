import client from "./client";

export const getRankings = () => {
  return client.get("/rankings");
};

export const getRankTiers = () => {
  return client.get("/rankings/tiers");
};

export const getStateRankings = (stateId) => {
  return client.get(`/rankings/state/${stateId}`);
};

export const getSchoolRankings = (schoolId) => {
  return client.get(`/rankings/school/${schoolId}`);
};

export const recalculateRankings = () => {
  return client.post("/rankings/recalculate");
};
