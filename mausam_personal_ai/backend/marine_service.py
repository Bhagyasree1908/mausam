import requests

OPEN_METEO_MARINE_URL = "https://marine-api.open-meteo.com/v1/marine"


def get_marine(latitude, longitude):

    params = {
        "latitude": latitude,
        "longitude": longitude,

        "hourly": ",".join([
            "wave_height",
            "wave_direction",
            "wave_period",
            "wind_wave_height",
            "swell_wave_height",
            "sea_surface_temperature"
        ]),

        "timezone": "Asia/Kolkata",
        "forecast_days": 1
    }

    response = requests.get(
        OPEN_METEO_MARINE_URL,
        params=params,
        timeout=10
    )

    response.raise_for_status()

    data = response.json()

    return normalize_marine(data)


def normalize_marine(data):

    hourly = data["hourly"]

    times = hourly["time"]

    wave_height = hourly.get("wave_height", [])
    wave_direction = hourly.get("wave_direction", [])
    wave_period = hourly.get("wave_period", [])
    wind_wave_height = hourly.get("wind_wave_height", [])
    swell_wave_height = hourly.get("swell_wave_height", [])
    sea_surface_temperature = hourly.get(
        "sea_surface_temperature", []
    )

    # Current / first available marine condition
    current = {
        "wave_height": wave_height[0] if wave_height else None,
        "wave_direction": wave_direction[0] if wave_direction else None,
        "wave_period": wave_period[0] if wave_period else None,
        "wind_wave_height": (
            wind_wave_height[0]
            if wind_wave_height else None
        ),
        "swell_wave_height": (
            swell_wave_height[0]
            if swell_wave_height else None
        ),
        "sea_surface_temperature": (
            sea_surface_temperature[0]
            if sea_surface_temperature else None
        )
    }

    # Only next 6 hours
    next_hours = []

    for i in range(1, min(7, len(times))):

        next_hours.append({
            "time": times[i],
            "wave_height": (
                wave_height[i]
                if i < len(wave_height)
                else None
            ),
            "wave_period": (
                wave_period[i]
                if i < len(wave_period)
                else None
            ),
            "sea_surface_temperature": (
                sea_surface_temperature[i]
                if i < len(sea_surface_temperature)
                else None
            )
        })

    return {
        "current": current,

        "next_hours": next_hours,

        "tide": {
            "available": False,
            "message": (
                "Tide timings are not provided "
                "by the current data source."
            )
        }
    }