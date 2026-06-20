import client from "./client";

export const uploadMedia = (schoolId, file) => {
  const formData = new FormData();
  formData.append("school_id", schoolId);
  formData.append("file", file);
  return client.post("/media/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const submitMedia = (data) => {
  return client.post("/media/submit", data);
};

export const reviewMedia = (data) => {
  return client.post("/media/review", data);
};

export const approveMedia = (submissionId, comments = "", is_featured = false) => {
  return client.post("/media/approve", { submission_id: submissionId, comments, is_featured });
};

export const rejectMedia = (submissionId, comments = "") => {
  return client.post("/media/reject", { submission_id: submissionId, comments });
};

export const publishMedia = (submissionId, platforms = ["FACEBOOK", "INSTAGRAM"]) => {
  return client.post("/media/publish", { submission_id: submissionId, platforms });
};

export const getMediaList = () => {
  return client.get("/media/list");
};

export const getMediaDetail = (id) => {
  return client.get(`/media/${id}`);
};
