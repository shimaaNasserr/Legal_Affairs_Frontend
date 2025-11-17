import axiosInstance from "../apis/axiosInstance";

export async function listAppeals(params = {}) {
  const res = await axiosInstance.get("appeals/", { params });
  return res.data;
}

export async function getAppeal(id) {
  const res = await axiosInstance.get(`appeals/${id}/`);
  return res.data;
}

export async function createAppeal(formData) {
  const res = await axiosInstance.post("appeals/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
