// src/services/usuariosService.js

import API from "./api.js";

/**
 * Registra un nuevo usuario en el sistema.
 * userData debe contener: nombre, correo y password (según tu backend).
 */
export const registerUser = async (userData) => {
    try {
        const res = await API.post("/usuarios/register", userData);
        return res; // axios response
    } catch (err) {
        // re-lanzamos el error para que Register.jsx pueda manejarlo
        throw err;
    }
};
