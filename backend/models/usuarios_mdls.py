# backend/models/usuario_mdls.py
from backend.database.supabase_config import supabase
from fastapi import HTTPException
from typing import Optional

class UsuarioModel:
    @staticmethod
    def crear_usuario(nombre: str, telefono: Optional[str], correo: str, rol: str = "usuario"):
        try:
            data = {
                "nombre": nombre,
                "telefono": telefono,
                "correo": correo,
                "rol": rol
            }
            response = supabase.table("usuarios").insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al crear usuario: {str(e)}")

    @staticmethod
    def obtener_usuario_por_id(id_usuario: str):
        try:
            response = supabase.table("usuarios").select("*").eq("id_usuario", id_usuario).execute()
            if not response.data:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
            return response.data[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al obtener usuario: {str(e)}")

    @staticmethod
    def listar_usuarios():
        try:
            response = supabase.table("usuarios").select("*").execute()
            return response.data
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al listar usuarios: {str(e)}")

    @staticmethod
    def actualizar_usuario(id_usuario: str, data: dict):
        try:
            response = supabase.table("usuarios").update(data).eq("id_usuario", id_usuario).execute()
            if not response.data:
                raise HTTPException(status_code=404, detail="Usuario no encontrado para actualizar")
            return response.data[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al actualizar usuario: {str(e)}")

    @staticmethod
    def eliminar_usuario(id_usuario: str):
        try:
            response = supabase.table("usuarios").delete().eq("id_usuario", id_usuario).execute()
            return {"message": "Usuario eliminado correctamente"} if response.data else {"message": "No se encontró el usuario"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al eliminar usuario: {str(e)}")
