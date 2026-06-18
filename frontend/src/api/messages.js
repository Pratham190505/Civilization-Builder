import client from "./client";

export const getChatUsers = () => {
  return client.get("/messages/users");
};

export const getConversations = () => {
  return client.get("/messages/conversations");
};

export const getOrCreateConversation = (recipientId) => {
  return client.post("/messages/conversations", { recipientId });
};

export const getMessages = (conversationId) => {
  return client.get(`/messages/${conversationId}`);
};

export const sendMessage = (conversationId, text) => {
  return client.post("/messages", { conversationId, text });
};
