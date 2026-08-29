import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://chatbot-vizr-backend.vercel.app/api",
    withCredentials: true,
});


api.interceptors.request.use(async (config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        config.headers["X-Authorization"] = token;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) localStorage.removeItem("token");
        return Promise.reject(error);
    }
);

export default api;
