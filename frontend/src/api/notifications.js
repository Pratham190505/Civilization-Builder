import client from "./client";

export const getNotifications = () => {
  return client.get("/notifications");
};

export const markNotificationsAsRead = (ids = []) => {
  return client.patch("/notifications/read", { ids });
};
