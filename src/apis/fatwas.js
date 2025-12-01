import axiosInstance from "./axiosInstance.jsx";

const BASE = "fatwas/";

export const listFatwas = async (params = {}) => {
  const res = await axiosInstance.get(BASE, { params });
  return res.data;
};

export const getFatwa = async (id) => {
  const res = await axiosInstance.get(`${BASE}${id}/`);
  return res.data;
};

export const createFatwa = async (data) => {
  const res = await axiosInstance.post(BASE, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateFatwa = async (id, data) => {
  const res = await axiosInstance.patch(`${BASE}${id}/`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteFatwa = async (id) => {
  const res = await axiosInstance.delete(`${BASE}${id}/`);
  return res.data;
};
