import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",  
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token && !config.url.includes("login/") && !config.url.includes("register/")) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


export default axiosInstance;
