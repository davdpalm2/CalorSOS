from fastapi import APIRouter, HTTPException
from ..supabase_client import supabase

router = APIRouter(prefix="/admin", tags=["Administración"])

@router.put("/validar_reporte/{id_reporte}")
def validar_reporte(id_reporte: int):
    
    # Permite al administrador validar o aprobar un reporte comunitario.
    try:
        response = supabase.table("reportes").update({"estado": "validado"}).eq("id", id_reporte).execute()
        return {"message": "Reporte validado correctamente", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al validar reporte: {str(e)}")
