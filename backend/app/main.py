# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importación de routers desde la carpeta backend/app/routers
from backend.app.routers import (
    usuarios,
    puntos_hidratacion,
    zonas_frescas,
    alertas_calor,
    notificaciones,
    reportes,
    admin,
    clima,
)

app = FastAPI(title="CalorSOS API")

# Configuración de CORS (para permitir acceso desde el frontend o app móvil)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, reemplazar con el dominio del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro de routers
app.include_router(usuarios.router)
app.include_router(puntos_hidratacion.router)
app.include_router(zonas_frescas.router)
app.include_router(alertas_calor.router)
app.include_router(notificaciones.router)
app.include_router(reportes.router)
app.include_router(admin.router)
app.include_router(clima.router)

@app.get("/")
def root():
    return {"message": "API CalorSOS funcionando correctamente"}
