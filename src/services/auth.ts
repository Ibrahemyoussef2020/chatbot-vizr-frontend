import api from "@/api";

export const loginUser = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
};

export const signupUser = async (
    name: string,
    email: string,
    password: string
) => {
    const res = await api.post("/auth/register", { name, email, password });
    return res.data;
};

export const logoutUser = async () => {
    const res = await api.post("/auth/logout");
    return res.data;
};

export const checkAuthStatus = async () => {
    const res = await api.get("/auth/auth-status");
    return res.data;
};