from fastapi import APIRouter
from ..supabase_client import supabase

# Crear router
router = APIRouter(prefix="/puntos_hidratacion", tags=["Puntos de Hidratación"])

@router.get("/")
def obtener_puntos():
    # Obtiene todos los puntos de hidratación registrados en la base de datos Supabase.
    response = supabase.table("puntos_hidratacion").select("*").execute()
    return {"data": response.data}
