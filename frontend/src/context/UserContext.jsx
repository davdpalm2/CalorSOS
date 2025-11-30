// Inicio UserContext.jsx

// frontend/src/context/UserContext.jsx

// Contexto para gestionar el estado del usuario

// Importaciones de React
import { createContext, useState, useEffect } from "react";

// Importación del servicio API
import API from "../services/api.js";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [loading, setLoading] = useState(true);

    // Estado global para configuraciones de usuario
    const [userSettings, setUserSettings] = useState({
        theme: 'dark',
        temperatureUnit: 'C',
        notifications: { sound: true, vibration: true },
        map: { type: 'street', defaultZoom: 13 }
    });

    // Normalizador de perfil desde backend
    const normalizeUser = (data) => {
        return data?.usuario_actual || data?.data || data || null;
    };

    // Verificar token al iniciar la app
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

    // Cargar configuraciones de usuario al iniciar (por usuario)
    useEffect(() => {
        if (user && user.id_usuario) {
            const userKey = `userSettings_${user.id_usuario}`;
            const savedSettings = localStorage.getItem(userKey);
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                setUserSettings(parsed);
                // Aplicar tema
                applyTheme(parsed.theme);
            }
        }
    }, [user]);

    // Aplicar tema global
    const applyTheme = (theme) => {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    };

    // Función de login
    const login = async (correo, password) => {
        const form = new FormData();
        form.append("correo", correo);
        form.append("password", password);

        const res = await fetch("https://calorsos-app.onrender.com/usuarios/login", {
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

        // Usuario con rol admin --> Panel Admin
        // Usuario normal --> home page
        if (normalized.rol === "admin") {
                navigate("/admin");
            } else {
                navigate("/");
            }
        
        return normalized;
    };

    // Función de logout
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
    };

    // Actualizar perfil usando el servicio API
    const updateProfile = async (profileData) => {
        try {
        if (!user || !user.id_usuario) {
            throw new Error('Usuario no identificado');
        }

        // Usar el servicio API en lugar de fetch directo
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

    // Cambiar contraseña usando el servicio API
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
            changePassword,
            userSettings,
            setUserSettings
        }}
        >
        {children}
        </UserContext.Provider>
    );
};

// Fin UserContext.jsx
