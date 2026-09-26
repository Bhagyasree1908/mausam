import requests

OPEN_METEO_AIR_QUALITY_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"


def get_air_quality(latitude, longitude):

    params = {
        "latitude": latitude,
        "longitude": longitude,

        "current": ",".join([
            "pm10",
            "pm2_5",
            "carbon_monoxide",
            "nitrogen_dioxide",
            "sulphur_dioxide",
            "ozone",
            "us_aqi"
        ]),

        "hourly": ",".join([
            "pm10",
            "pm2_5",
            "us_aqi"
        ]),

        "timezone": "Asia/Kolkata",
        "forecast_days": 1
    }

    response = requests.get(
        OPEN_METEO_AIR_QUALITY_URL,
        params=params,
        timeout=10
    )

    response.raise_for_status()

    data = response.json()

    return normalize_air_quality(data)


def normalize_air_quality(data):

    current = data["current"]

    aqi = current.get("us_aqi")

    return {
    "current": {
        "pm10": current.get("pm10"),
        "pm2_5": current.get("pm2_5"),
        "carbon_monoxide": current.get("carbon_monoxide"),
        "nitrogen_dioxide": current.get("nitrogen_dioxide"),
        "sulphur_dioxide": current.get("sulphur_dioxide"),
        "ozone": current.get("ozone"),
        "us_aqi": aqi,
        "aqi_level": get_aqi_level(aqi)
    }
}
def get_aqi_level(aqi):

    if aqi is None:
        return "unknown"

    if aqi <= 50:
        return "good"

    elif aqi <= 100:
        return "moderate"

    elif aqi <= 150:
        return "unhealthy_for_sensitive_groups"

    elif aqi <= 200:
        return "unhealthy"

    elif aqi <= 300:
        return "very_unhealthy"

    else:
        return "hazardous"