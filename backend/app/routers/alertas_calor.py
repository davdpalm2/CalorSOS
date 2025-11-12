from fastapi import APIRouter, HTTPException, Depends, Body
from typing import Optional
from backend.models.alertas_calor_mdls import AlertaCalorModel
from backend.app.security.jwt_handler import verificar_token, verificar_rol

router = APIRouter(prefix="/alertas_calor", tags=["Alertas de Calor"])


# Crear alerta (solo admin)
@router.post("/")
def crear_alerta(temperatura: float = Body(...), humedad: float = Body(...), indice_uv: float = Body(...),
                  nivel_riesgo: str = Body(...), fuente: str = Body("OpenWeatherMap"),
                  datos_usuario: dict = Depends(verificar_rol(["admin"]))):
    try:
        alerta = AlertaCalorModel.crear_alerta(temperatura, humedad, indice_uv, nivel_riesgo, fuente)
        return {"status": "success", "data": alerta}
    except HTTPException as e:
        raise e

# Listar alertas (público)
@router.get("/")
def listar_alertas():
    return {"status": "success", "data": AlertaCalorModel.listar_alertas()}

# Obtener por id (público)
@router.get("/{id_alerta}")
def obtener_alerta(id_alerta: str):
    return {"status": "success", "data": AlertaCalorModel.obtener_alerta_por_id(id_alerta)}

# Eliminar alerta (solo admin)
@router.delete("/{id_alerta}")
def eliminar_alerta(id_alerta: str, datos_usuario: dict = Depends(verificar_rol(["admin"]))):
    try:
        return AlertaCalorModel.eliminar_alerta(id_alerta)
    except HTTPException as e:
        raise e
