// src/context/UserContext.jsx
import { createContext, useState, useEffect } from "react";
import API from "../services/api.js";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [loading, setLoading] = useState(true);

    // ----------------------------------------------------
    // Normalizador de perfil desde backend
    // ----------------------------------------------------
    const normalizeUser = (data) => {
        return data?.usuario_actual || data?.data || data || null;
    };

    // ----------------------------------------------------
    // Verificar token al iniciar la app
    // ----------------------------------------------------
    useEffect(() => {
        const verify = async () => {
            if (!token) { 
                setLoading(false); 
                return; 
            }

            try {
                const me = await API.get("/usuarios/perfil");
                const normalized = normalizeUser(me.data);
                setUser(normalized);

            } catch {
                // Token inválido
                localStorage.removeItem("token");
                setToken(null);
                setUser(null);
            }

            setLoading(false);
        };

        verify();
    }, [token]);

    // ----------------------------------------------------
    // LOGIN
    // ----------------------------------------------------
    const login = async (correo, password) => {
        const form = new FormData();
        form.append("correo", correo);
        form.append("password", password);

        const res = await fetch("http://localhost:8000/usuarios/login", {
            method: "POST",
            body: form,
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Credenciales incorrectas");
        }

        const data = await res.json();
        const token = data.access_token;

        // Guardar token
        localStorage.setItem("token", token);
        setToken(token);

        // Obtener perfil real y normalizado
        const me = await API.get("/usuarios/perfil");
        const normalized = normalizeUser(me.data);
        setUser(normalized);

        return normalized;
    };

    // ----------------------------------------------------
    // LOGOUT
    // ----------------------------------------------------
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
    };

    // ----------------------------------------------------
    // ACTUALIZAR PERFIL - USANDO TU SERVICIO API
    // ----------------------------------------------------
    const updateProfile = async (profileData) => {
        try {
            if (!user || !user.id_usuario) {
                throw new Error('Usuario no identificado');
            }

            // Usar tu servicio API en lugar de fetch directo
            const response = await API.put(`/usuarios/${user.id_usuario}`, profileData);
            
            // Actualizar el contexto con los nuevos datos
            setUser(prev => ({
                ...prev,
                ...profileData
            }));

            return response.data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw new Error(error.response?.data?.detail || 'Error al actualizar perfil');
        }
    };

    // ----------------------------------------------------
    // CAMBIAR CONTRASEÑA - USANDO TU SERVICIO API
    // ----------------------------------------------------
    const changePassword = async (currentPassword, newPassword) => {
        try {
            if (!user || !user.id_usuario) {
                throw new Error('Usuario no identificado');
            }

            if (newPassword.length < 6) {
                throw new Error('La contraseña debe tener al menos 6 caracteres');
            }

            // Usar el nuevo endpoint específico para cambiar contraseña
            const response = await API.put(`/usuarios/${user.id_usuario}/cambiar-password`, {
                currentPassword: currentPassword,
                newPassword: newPassword
            });

            return response.data;
        } catch (error) {
            console.error('Error changing password:', error);
            throw new Error(error.response?.data?.detail || 'Error al cambiar contraseña');
        }
    };

    return (
        <UserContext.Provider 
            value={{ 
                user, 
                setUser, 
                token, 
                loading, 
                login, 
                logout,
                updateProfile,
                changePassword
            }}
        >
            {children}
        </UserContext.Provider>
    );
};