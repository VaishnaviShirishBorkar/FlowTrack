"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/axios";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in from localStorage on mount
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post("/auth/login", {
                email,
                password,
            });

            // Save user data (including role)
            setUser(res.data.user);
            localStorage.setItem("user", JSON.stringify(res.data.user)); // Persist user

            // Redirect based on role? Or let component handle it.
            // Usually good to return the user so component can decide.
            return res.data.user;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const register = async (name, email, password, role) => {
        try {
            const res = await api.post("/auth/register", {
                name,
                email,
                password,
                role
            });
            // Auto login or redirect to login?
            // Let's assume auto-login if API returns user, or just return success
            return res.data;
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    }

    const logout = async () => {
        try {
            await api.post("/auth/logout");
            setUser(null);
            localStorage.removeItem("user");
            router.push("/login"); // Redirect to login
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
