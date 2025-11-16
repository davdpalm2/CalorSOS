from fastapi import APIRouter, HTTPException, Depends, Body
from backend.models.punto_hidratacion_mdls import PuntoHidratacionModel
from backend.app.security.jwt_handler import verificar_token, verificar_rol
from typing import Optional

router = APIRouter(prefix="/puntos_hidratacion", tags=["Puntos de Hidratación"])


# Crear punto (usuario autenticado)
@router.post("/")
def crear_punto(
    nombre: str,
    descripcion: Optional[str] = None,
    latitud: float = None,
    longitud: float = None,
    datos_usuario: dict = Depends(verificar_token),
    estado: str = "activa"
):
    """Permite a un usuario registrar un nuevo punto (estado = activa por defecto)."""

    try:
        estado = "activa"
        validado_por = None

        punto = PuntoHidratacionModel.crear_punto(
            nombre, descripcion, latitud, longitud, estado, validado_por
        )

        return {"status": "success", "data": punto}

    except HTTPException as e:
        raise e


# Listar puntos (público)
@router.get("/")
def listar_puntos(estado: Optional[str] = None):
    """Lista todos los puntos (por defecto solo los activos)."""

    estado_filtrado = estado or "activa"

    return {
        "status": "success",
        "data": PuntoHidratacionModel.listar_puntos(estado_filtrado)
    }


# Obtener punto por ID
@router.get("/{id_punto}")
def obtener_punto(id_punto: str):
    return {
        "status": "success",
        "data": PuntoHidratacionModel.obtener_punto_por_id(id_punto)
    }


# Actualizar punto (solo admin)
@router.put("/{id_punto}")
def actualizar_punto(
    id_punto: str,
    data: dict = Body(...),
    datos_usuario: dict = Depends(verificar_rol(["admin"]))
):
    return {
        "status": "success",
        "data": PuntoHidratacionModel.actualizar_punto(id_punto, data)
    }


# Eliminar punto (solo admin)
@router.delete("/{id_punto}")
def eliminar_punto(
    id_punto: str,
    datos_usuario: dict = Depends(verificar_rol(["admin"]))
):
    return PuntoHidratacionModel.eliminar_punto(id_punto)
