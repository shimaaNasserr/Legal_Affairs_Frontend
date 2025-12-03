import axiosInstance from "../apis/axiosInstance";

export async function listInvestigations(params = {}) {
  const cleaned = Object.fromEntries(
    Object.entries(params || {}).filter(
      ([_, v]) => v !== undefined && v !== null && String(v).trim() !== ""
    )
  );
  const res = await axiosInstance.get("investigations/", { params: cleaned });
  return res.data;
}

export async function getInvestigation(id) {
  const res = await axiosInstance.get(`investigations/${id}/`);
  return res.data;
}

export async function createInvestigation(formData) {
  const res = await axiosInstance.post("investigations/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
