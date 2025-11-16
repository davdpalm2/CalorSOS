# backend/app/routers/admin.py
from fastapi import APIRouter, HTTPException, Depends
from backend.models.admin_mdls import AdminModel
from backend.app.security.jwt_handler import verificar_rol

router = APIRouter(prefix="/admin", tags=["Administración"])


@router.put("/validar_reporte/{id_reporte}")
def validar_reporte(id_reporte: str, datos_usuario: dict = Depends(verificar_rol(["admin"]))):
    try:
        admin_id = datos_usuario["id_usuario"]
        resultado = AdminModel.validar_reporte(id_reporte, admin_id)

        tipo_entidad = resultado["tipo"]
        entidad = resultado["entidad_creada"]

        if tipo_entidad == "zona_fresca":
            mensaje = "Reporte validado y zona fresca creada correctamente"
        elif tipo_entidad == "hidratacion":
            mensaje = "Reporte validado y punto de hidratación creado correctamente"
        else:
            mensaje = "Reporte validado correctamente"

        return {
            "status": "success",
            "message": mensaje,
            "data": resultado
        }
    except HTTPException as e:
        raise e

@router.put("/rechazar_reporte/{id_reporte}")
def rechazar_reporte(id_reporte: str, datos_usuario: dict = Depends(verificar_rol(["admin"]))):
    try:
        reporte = AdminModel.rechazar_reporte(id_reporte)
        return {"status": "success", "message": "Reporte rechazado correctamente", "data": reporte}
    except HTTPException as e:
        raise e
