# backend/app/main.py

# Importaciones necesarias para la aplicación FastAPI
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importar routers desde la carpeta de routers
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

# Importaciones necesarias para el scheduler de alertas automáticas
from apscheduler.schedulers.background import BackgroundScheduler
from backend.models.clima_mdls import ClimaModel
from backend.models.alertas_calor_mdls import AlertaCalorModel
from backend.models.notificaciones_mdls import NotificacionModel

# Crear instancia de la aplicación FastAPI
app = FastAPI(title="CalorSOS API")

# ------------------------ SCHEDULER DE ALERTAS AUTOMÁTICAS ------------------------

scheduler = BackgroundScheduler()

def tarea_alerta_automatica():
    """
    Tarea automática que consulta el clima, evalúa si debe generarse una alerta,
    crea la alerta en la base de datos y genera notificaciones globales.
    """
    try:
        clima = ClimaModel.obtener_clima("Cartagena")
        nivel = ClimaModel.evaluar_alerta_climatica(clima)
        clima["nivel_alerta"] = nivel

        # Crear alerta basada en clima
        alerta = AlertaCalorModel.crear_alerta_desde_clima(clima)

        # Mensaje de notificación
        mensaje = (
            f"⚠️ ALERTA DE CALOR {nivel.upper()} — "
            f"Temp: {clima['temperatura']}°C, UV: {clima['uv_index']}"
        )

        # Enviar notificaciones globales
        NotificacionModel.crear_notificaciones_globales(mensaje)

        print("Alerta y notificaciones generadas automáticamente.")

    except Exception as e:
        print(f"Error en tarea automática de alerta: {e}")

# Ejecutar la tarea de alertas cada 30 minutos
scheduler.add_job(tarea_alerta_automatica, "interval", minutes=10)
scheduler.start()

# -----------------------------------------------------------------------------------

# Configurar middleware CORS para permitir acceso desde frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://calorsos.onrender.com",  # frontend producción
        "http://localhost:4173",          # frontend local
        "http://localhost:5173",          # Vite usa ambos según setup
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173",
        "https://calorsos-frontend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar todos los routers en la aplicación
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
    """
    Endpoint raíz que confirma que la API está funcionando.
    Retorna un mensaje de estado.
    """
    return {"message": "API CalorSOS funcionando correctamente"}
