from fastapi import FastAPI
from .routers import puntos_hidratacion, zonas_frescas, reportes, admin, clima

app = FastAPI(title="CalorSOS API")

# Incluir routers
app.include_router(puntos_hidratacion.router)
app.include_router(zonas_frescas.router)
app.include_router(reportes.router)
app.include_router(admin.router)
app.include_router(clima.router)

@app.get("/")
def root():
    return {"message": "API CalorSOS funcionando correctamente"}