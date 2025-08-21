// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api", // adjust if your backend is at a different port
  withCredentials: true,
});

export default api;
