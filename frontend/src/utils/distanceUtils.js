// frontend/src/utils/distanceUtils.js

/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
 * @param {number} lat1 - Latitud del primer punto
 * @param {number} lon1 - Longitud del primer punto
 * @param {number} lat2 - Latitud del segundo punto
 * @param {number} lon2 - Longitud del segundo punto
 * @returns {number} Distancia en kilómetros
 */
export function calcularDistancia(lat1, lon1, lat2, lon2) {
    // Radio de la Tierra en kilómetros
    const R = 6371;

    // Convertir grados a radianes
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;

    return distancia;
}

/**
 * Convierte grados a radianes
 * @param {number} grados 
 * @returns {number} Radianes
 */
function toRad(grados) {
    return grados * (Math.PI / 180);
}

/**
 * Formatea la distancia para mostrarla al usuario
 * @param {number} distanciaKm - Distancia en kilómetros
 * @returns {string} Distancia formateada (ej: "1.5 km" o "250 m")
 */
export function formatearDistancia(distanciaKm) {
    if (distanciaKm < 1) {
        // Si es menor a 1 km, mostrar en metros
        const metros = Math.round(distanciaKm * 1000);
        return `${metros} m`;
    } else {
        // Si es mayor o igual a 1 km, mostrar en kilómetros
        return `${distanciaKm.toFixed(2)} km`;
    }
}

/**
 * Encuentra el punto más cercano a la ubicación del usuario
 * @param {Object} userLocation - {lat, lng} ubicación del usuario
 * @param {Array} puntos - Array de puntos con latitud y longitud
 * @returns {Object} Punto más cercano con su distancia
 */
export function encontrarPuntoMasCercano(userLocation, puntos) {
    if (!userLocation || !puntos || puntos.length === 0) {
        return null;
    }

    let puntoMasCercano = null;
    let distanciaMinima = Infinity;

    puntos.forEach((punto) => {
        const distancia = calcularDistancia(
            userLocation.lat,
            userLocation.lng,
            punto.latitud,
            punto.longitud
        );

        if (distancia < distanciaMinima) {
            distanciaMinima = distancia;
            puntoMasCercano = {
                ...punto,
                distancia: distancia,
                distanciaFormateada: formatearDistancia(distancia)
            };
        }
    });

    return puntoMasCercano;
}

/**
 * Calcula distancias desde la ubicación del usuario a todos los puntos
 * @param {Object} userLocation - {lat, lng} ubicación del usuario
 * @param {Array} puntos - Array de puntos con latitud y longitud
 * @returns {Array} Puntos ordenados por distancia con información de distancia agregada
 */
export function calcularDistanciasATodosPuntos(userLocation, puntos) {
    if (!userLocation || !puntos || puntos.length === 0) {
        return [];
    }

    const puntosConDistancia = puntos.map((punto) => {
        const distancia = calcularDistancia(
            userLocation.lat,
            userLocation.lng,
            punto.latitud,
            punto.longitud
        );

        return {
            ...punto,
            distancia: distancia,
            distanciaFormateada: formatearDistancia(distancia)
        };
    });

    // Ordenar por distancia (más cercano primero)
    return puntosConDistancia.sort((a, b) => a.distancia - b.distancia);
}

/**
 * Estima el tiempo de caminata en minutos basado en la distancia
 * Asume velocidad promedio de caminata: 5 km/h
 * @param {number} distanciaKm - Distancia en kilómetros
 * @returns {string} Tiempo estimado formateado
 */
export function estimarTiempoCaminata(distanciaKm) {
    const velocidadKmH = 5; // 5 km/h velocidad promedio de caminata
    const tiempoHoras = distanciaKm / velocidadKmH;
    const tiempoMinutos = Math.round(tiempoHoras * 60);

    if (tiempoMinutos < 1) {
        return "Menos de 1 min";
    } else if (tiempoMinutos < 60) {
        return `${tiempoMinutos} min`;
    } else {
        const horas = Math.floor(tiempoMinutos / 60);
        const minutos = tiempoMinutos % 60;
        return minutos > 0 ? `${horas}h ${minutos}min` : `${horas}h`;
    }
}