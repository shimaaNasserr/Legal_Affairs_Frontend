import axiosInstance from "./axiosInstance.jsx";

export const listContracts = async (params = {}) => {
  const { contract_type, general_number, date_from, date_to, page } = params;
  const res = await axiosInstance.get("contracts/", {
    params: { contract_type, general_number, date_from, date_to, page },
  });
  return res.data;
};

export const getContract = async (id) => {
  const res = await axiosInstance.get(`contracts/${id}/`);
  return res.data;
};

export const createContract = async (formData) => {
  const res = await axiosInstance.post("contracts/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateContract = async (id, formData) => {
  const res = await axiosInstance.put(`contracts/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteContract = async (id) => {
  const res = await axiosInstance.delete(`contracts/${id}/`);
  return res.data;
};
