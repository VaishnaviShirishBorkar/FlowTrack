import axios from "axios";

const baseURL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
    baseURL,
    withCredentials: true,
});

export default api;
