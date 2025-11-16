import API from "./api.js";
import { API_URL } from "./api.js";

export const registerUser = async (data) => {
    const form = new FormData();
    form.append("nombre", data.nombre);
    form.append("correo", data.correo);
    form.append("password", data.password);
    form.append("telefono", "");
    form.append("rol", "usuario");

    const response = await fetch(`${API_URL}/usuarios/register`, {
        method: "POST",
        body: form,
    });

    return response;
};

// Listar todos los usuarios (solo admin)
export const listarUsuarios = async () => {
    try {
        const res = await API.get("/usuarios/");
        return res.data.usuarios;
    } catch (error) {
        console.error("Error al listar usuarios:", error);
        throw error;
    }
};

// Actualizar usuario (solo admin)
export const actualizarUsuario = async (id, data) => {
    try {
        const res = await API.put(`/usuarios/${id}`, data);
        return res.data.usuario;
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        throw error;
    }
};

// Eliminar usuario (solo admin)
export const eliminarUsuario = async (id) => {
    try {
        const res = await API.delete(`/usuarios/${id}`);
        return res.data;
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        throw error;
    }
};
