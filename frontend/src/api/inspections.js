import client from "./client";

export const requestInspection = (data) => {
  return client.post("/inspection/request", data);
};

export const scheduleInspection = (data) => {
  return client.post("/inspection/schedule", data);
};

export const completeInspection = (data) => {
  return client.post("/inspection/complete", data);
};

export const getInspectionReports = () => {
  return client.get("/inspection/reports");
};

export const getInspectionRequests = () => {
  return client.get("/inspection/requests");
};
