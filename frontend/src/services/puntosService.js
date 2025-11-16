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

// Export default para que funcione el import puntosService
export default {
    obtenerPuntosHidratacion,
    obtenerPuntoPorId,
};
