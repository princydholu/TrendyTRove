import axios from "axios";

const API = axios.create({
  baseURL:  "http://localhost/api",  //  leading slash
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("trendytroveToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;