# backend/models/clima_mdls.py
from fastapi import HTTPException
import requests
from datetime import datetime, date, timedelta, timezone
import pytz

class ClimaModel:
    LAT = 10.3910  # Coordenadas fijas de Cartagena
    LON = -75.4794

    @staticmethod
    def obtener_clima(ciudad: str = "Cartagena"):
        """
        Obtiene la información climática actual: temperatura, humedad, sensación térmica,
        condición, UV index, heat_level, hydration_level y thermal_risk.
        """
        try:
            # ==========================
            # 1) OBTENER DATOS CLIMÁTICOS DE OPEN-METEO
            # ==========================
            url = (
                f"https://api.open-meteo.com/v1/forecast?"
                f"latitude={ClimaModel.LAT}&longitude={ClimaModel.LON}&"
                f"hourly=temperature_2m,relativehumidity_2m,apparent_temperature,uv_index,weathercode&"
                f"timezone=America/Bogota"
            )

            response = requests.get(url, timeout=10)
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Error al consultar API climática")

            data = response.json()

            # ==========================
            # 2) HORA ACTUAL EN CARTAGENA
            # ==========================
            tz = pytz.timezone("America/Bogota")
            now = datetime.now(tz)
            hora_actual = now.hour

            # ==========================
            # 3) EXTRAER DATOS HORARIOS
            # ==========================
            temperatura = data["hourly"]["temperature_2m"][hora_actual]
            humedad = data["hourly"]["relativehumidity_2m"][hora_actual]
            feels_like = data["hourly"]["apparent_temperature"][hora_actual]
            uv_index = data["hourly"]["uv_index"][hora_actual]
            weather_code = data["hourly"]["weathercode"][hora_actual]

            # Validación de datos
            temperatura = float(temperatura) if temperatura is not None else 0.0
            humedad = float(humedad) if humedad is not None else 0.0
            feels_like = float(feels_like) if feels_like is not None else temperatura
            uv_index = float(uv_index) if uv_index is not None else 0.0

            # ==========================
            # 4) MAPEO WEATHERCODE -> DESCRIPCIÓN
            # ==========================
            weather_dict = {
                0: "Despejado",
                1: "Principalmente despejado",
                2: "Parcialmente nublado",
                3: "Nublado",
                45: "Niebla",
                48: "Escarcha",
                51: "Lluvia ligera",
                53: "Lluvia moderada",
                55: "Lluvia intensa",
                61: "Lluvia",
                63: "Lluvia intensa",
                65: "Lluvia muy intensa",
                71: "Nieve ligera",
                73: "Nieve moderada",
                75: "Nieve intensa",
                80: "Lluvias dispersas",
                81: "Lluvias continuas",
                82: "Lluvias intensas",
                95: "Tormenta eléctrica",
                99: "Tormenta con granizo"
            }
            condicion = weather_dict.get(weather_code, "Desconocido")

            # ==========================
            # 5) CALCULOS PERSONALIZADOS
            # ==========================
            heat_level = min(100, max(0, (feels_like - 20) * 4))
            hydration_level = round(1 + (humedad / 100) * 3 + (temperatura / 40) * 5)
            hydration_level = min(10, max(1, hydration_level))

            # Usar sensación térmica en lugar de temperatura para mejor precisión en climas tropicales
            wbgt = (0.7 * feels_like) + (0.3 * (humedad / 10))
            if wbgt < 24:
                thermal_risk = 0
            elif wbgt < 27:
                thermal_risk = 1
            elif wbgt < 30:
                thermal_risk = 2
            elif wbgt < 33:
                thermal_risk = 3
            elif wbgt < 36:
                thermal_risk = 4
            else:
                thermal_risk = 5

            # ==========================
            # 6) CONSTRUIR RESPUESTA
            # ==========================
            clima = {
                "ciudad": ciudad,
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

    @staticmethod
    def obtener_historico_sensacion(dias: int = 1):
        """
        Devuelve la sensación térmica horaria de los últimos `dias` días.
        Retorna una lista de dicts: [{"hora": "06:00", "sensacion": 28.5}, ...]
        """
        try:
            end = date.today()
            start = end - timedelta(days=dias)

            url = (
                f"https://archive-api.open-meteo.com/v1/archive?"
                f"latitude={ClimaModel.LAT}&longitude={ClimaModel.LON}&"
                f"start_date={start}&end_date={end}&"
                f"hourly=apparent_temperature&timezone=America/Bogota"
            )

            resp = requests.get(url, timeout=10)
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=resp.status_code,
                    detail="Error al consultar datos históricos del clima"
                )

            data = resp.json()
            horas = data.get("hourly", {}).get("time", [])
            sensaciones = data.get("hourly", {}).get("apparent_temperature", [])

            if not horas or not sensaciones or len(horas) != len(sensaciones):
                raise HTTPException(status_code=500, detail="Datos históricos incompletos")

            historico = [
                {"hora": h.split("T")[1][:5], "sensacion": float(s)}
                for h, s in zip(horas, sensaciones)
            ]

            return historico

        except requests.Timeout:
            raise HTTPException(status_code=504, detail="Timeout al consultar API histórica")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al obtener histórico: {str(e)}")

    @staticmethod
    def obtener_historico_temp_humedad(dias: int = 1):
        """
        Devuelve temperatura y humedad con timestamp completo.
        Para 1 día → últimas 24 horas desde ahora (usando forecast para datos actuales).
        Para >1 día → todo el rango de días (usando archive).
        """
        lat = ClimaModel.LAT
        lon = ClimaModel.LON
        tz = pytz.timezone("America/Bogota")
        now = datetime.now(tz)

        if dias == 1:
            # Para 1 día, usar forecast API con past_days=1 para obtener datos históricos
            url = (
                f"https://api.open-meteo.com/v1/forecast?"
                f"latitude={lat}&longitude={lon}&"
                f"hourly=temperature_2m,relativehumidity_2m&"
                f"past_days=1&timezone=America/Bogota"
            )
        else:
            # Para más días, usar archive API
            end_date = now.date()
            start_date = end_date - timedelta(days=dias)
            url = (
                f"https://archive-api.open-meteo.com/v1/archive?"
                f"latitude={lat}&longitude={lon}&"
                f"start_date={start_date}&end_date={end_date}&"
                f"hourly=temperature_2m,relativehumidity_2m&timezone=America/Bogota"
            )

        resp = requests.get(url, timeout=10)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail="Error al consultar API climática histórica")
        data = resp.json()

        if "error" in data:
            raise HTTPException(status_code=500, detail=data.get("reason", "Error en API climática histórica"))

        times = data["hourly"]["time"]
        temps = data["hourly"]["temperature_2m"]
        hums = data["hourly"]["relativehumidity_2m"]

        if len(times) != len(temps) or len(times) != len(hums):
            raise HTTPException(status_code=500, detail="Datos históricos inconsistentes")

        historico = []
        for t, temp, hum in zip(times, temps, hums):
            dt_obj = datetime.fromisoformat(t)
            historico.append({
                "timestamp": dt_obj.isoformat(),
                "hora": dt_obj.strftime("%H:%M"),
                "fecha": dt_obj.strftime("%m-%d"),
                "temperatura": temp,
                "humedad": hum
            })

        if dias == 1:
            # Filtrar últimas 24 horas desde ahora
            historico = historico[-24:]

        return historico
    
    
    