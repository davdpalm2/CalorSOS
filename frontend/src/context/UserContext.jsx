import { createContext, useState, useEffect } from "react";
import API from "../services/api.js";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verify = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await API.get("/usuarios/me");
            setUser(res.data);
        } catch {
            localStorage.removeItem("token");
            setToken(null);
        }

        setLoading(false);
        };

        verify();
    }, [token]);

    const login = async (email, password) => {
        const res = await API.post("/auth/login", { email, password });

        const jwt = res.data.token;
        localStorage.setItem("token", jwt);
        setToken(jwt);

        const me = await API.get("/usuarios/me");
        setUser(me.data);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
    };

    return (
        <UserContext.Provider value={{ user, setUser, token, loading, login, logout }}>
            {children}
        </UserContext.Provider>
    );

};
