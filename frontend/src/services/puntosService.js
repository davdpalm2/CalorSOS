// src/services/puntosService.js
import API from "./api.js";

// Obtener TODOS los puntos de hidratación
const obtenerPuntosHidratacion = async () => {
    const res = await API.get("/puntos_hidratacion/");
    return res.data.data; // Mantengo tu estructura
};

// Obtener punto por ID
const obtenerPuntoPorId = async (id) => {
    const res = await API.get(`/puntos_hidratacion/${id}`);
    return res.data.data;
};

// Actualizar punto (solo admin)
const actualizarPunto = async (id, data) => {
    try {
        const res = await API.put(`/puntos_hidratacion/${id}`, data);
        return res.data.data;
    } catch (error) {
        console.error("Error al actualizar punto de hidratación:", error);
        throw error;
    }
};

// Eliminar punto (solo admin)
const eliminarPunto = async (id) => {
    try {
        const res = await API.delete(`/puntos_hidratacion/${id}`);
        return res.data;
    } catch (error) {
        console.error("Error al eliminar punto de hidratación:", error);
        throw error;
    }
};

// Export default para que funcione el import puntosService
export default {
    obtenerPuntosHidratacion,
    obtenerPuntoPorId,
    actualizarPunto,
    eliminarPunto,
};
