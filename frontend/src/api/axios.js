import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost/api",  // works on all devices via nginx
});

// Automatically adds token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("trendytroveToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;