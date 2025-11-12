from fastapi import APIRouter, HTTPException, Depends, Body
from backend.models.zonas_frescas_mdls import ZonaFrescaModel
from backend.app.security.jwt_handler import verificar_token, verificar_rol
from typing import Optional

router = APIRouter(prefix="/zonas_frescas", tags=["Zonas Frescas"])


# Crear zona fresca (solo usuarios autenticados)
@router.post("/")
def crear_zona(
    nombre: str,
    descripcion: str = None,
    latitud: float = None,
    longitud: float = None,
    tipo: str = "urbana",
    estado: str = "activa",
    datos_usuario: dict = Depends(verificar_token)
):
    """Crea una nueva zona fresca (solo usuarios autenticados)."""
    try:
        validado_por = None
        zona = ZonaFrescaModel.crear_zona(nombre, descripcion, latitud, longitud, tipo, estado, validado_por)
        return {"status": "success", "data": zona}
    except HTTPException as e:
        raise e


# Listar zonas (público)
@router.get("/")
def listar_zonas(estado: Optional[str] = None):
    """Lista todas las zonas frescas (público, con filtro opcional por estado)."""
    return {"status": "success", "data": ZonaFrescaModel.listar_zonas(estado)}


# Obtener zona por ID (público)
@router.get("/{id_zona}")
def obtener_zona(id_zona: str):
    """Obtiene una zona fresca por su ID (público)."""
    return {"status": "success", "data": ZonaFrescaModel.obtener_zona_por_id(id_zona)}


# Actualizar zona (solo admin)
@router.put("/{id_zona}")
def actualizar_zona(
    id_zona: str,
    data: dict = Body(...),
    datos_usuario: dict = Depends(verificar_rol(["admin"]))
):
    """Actualiza una zona fresca (solo administradores)."""
    return {"status": "success", "data": ZonaFrescaModel.actualizar_zona(id_zona, data)}


# Eliminar zona (solo admin)
@router.delete("/{id_zona}")
def eliminar_zona(
    id_zona: str,
    datos_usuario: dict = Depends(verificar_rol(["admin"]))
):
    """Elimina una zona fresca (solo administradores)."""
    return ZonaFrescaModel.eliminar_zona(id_zona)
