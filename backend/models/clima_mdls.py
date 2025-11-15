# backend/models/clima_mdls.py
from dotenv import load_dotenv
import requests
import os
from fastapi import HTTPException

load_dotenv(dotenv_path="calorsos.env")

OPENWEATHER_API_KEY = os.getenv("KEY")

class ClimaModel:
    @staticmethod
    def obtener_clima(ciudad: str = "Cartagena"):
        if not OPENWEATHER_API_KEY:
            raise HTTPException(status_code=500, detail="Falta API Key")

        try:
            # ================
            # 1) CLIMA BÁSICO
            # ================
            url = (
                f"https://api.openweathermap.org/data/2.5/weather?"
                f"q={ciudad}&appid={OPENWEATHER_API_KEY}&units=metric&lang=es"
            )

            response = requests.get(url, timeout=10)
            data = response.json()

            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=data.get("message"))

            # Coordenadas obtenidas del clima basado en la ciudad
            lat = data["coord"]["lat"]
            lon = data["coord"]["lon"]

            temperatura = data["main"]["temp"]
            humedad = data["main"]["humidity"]
            feels_like = data["main"]["feels_like"]
            condicion = data["weather"][0]["description"]

            # ==========================
            # 2) OBTENER ÍNDICE UV (OneCall API)
            # ==========================
            uv_url = (
                f"https://api.openweathermap.org/data/3.0/onecall?"
                f"lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
            )

            uv_response = requests.get(uv_url, timeout=10)
            uv_data = uv_response.json()

            uv_index = uv_data.get("current", {}).get("uvi", 0)

            # ==========================
            # 3) CALCULOS PERSONALIZADOS
            # ==========================

            # Nivel de calor 0–100
            heat_level = min(100, max(0, (feels_like - 20) * 4))

            # Hidratación sugerida 1–10
            hydration_level = round(1 + (humedad / 100) * 3 + (temperatura / 40) * 5)
            hydration_level = min(10, max(1, hydration_level))

            # Riesgo térmico 0–5 (WBGT aproximado)
            wbgt = (0.7 * temperatura) + (0.3 * (humedad / 10))

            if wbgt < 22:
                thermal_risk = 0
            elif wbgt < 25:
                thermal_risk = 1
            elif wbgt < 28:
                thermal_risk = 2
            elif wbgt < 31:
                thermal_risk = 3
            elif wbgt < 35:
                thermal_risk = 4
            else:
                thermal_risk = 5

            # ==========================
            # 4) CONSTRUIR RESPUESTA
            # ==========================
            clima = {
                "ciudad": data.get("name"),
                "temperatura": temperatura,
                "humedad": humedad,
                "sensacion_termica": feels_like,
                "condicion": condicion,
                "uv_index": uv_index,
                "heat_level": heat_level,
                "hydration_level": hydration_level,
                "thermal_risk": thermal_risk,
            }

            return clima

        except requests.Timeout:
            raise HTTPException(status_code=504, detail="Timeout al consultar API climática")

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al obtener clima: {str(e)}")
