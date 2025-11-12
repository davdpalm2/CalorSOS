from fastapi import APIRouter, HTTPException, Depends
from backend.models.admin_mdls import AdminModel
from backend.app.security.jwt_handler import verificar_rol

router = APIRouter(prefix="/admin", tags=["Administración"])


@router.put("/validar_reporte/{id_reporte}")
def validar_reporte(id_reporte: str, datos_usuario: dict = Depends(verificar_rol(["admin"]))):
    try:
        reporte = AdminModel.validar_reporte(id_reporte)
        return {"status": "success", "message": "Reporte validado correctamente", "data": reporte}
    except HTTPException as e:
        raise e

@router.put("/rechazar_reporte/{id_reporte}")
def rechazar_reporte(id_reporte: str, datos_usuario: dict = Depends(verificar_rol(["admin"]))):
    try:
        reporte = AdminModel.rechazar_reporte(id_reporte)
        return {"status": "success", "message": "Reporte rechazado correctamente", "data": reporte}
    except HTTPException as e:
        raise e
