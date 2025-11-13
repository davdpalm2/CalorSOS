// src/services/api.js
import axios from "axios";

// URL base del backend
const API = axios.create({
  baseURL: "http://localhost:8000", // se cambia según despliegue
});

// Interceptor para añadir token JWT automáticamente
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default API;
