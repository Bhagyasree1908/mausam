import requests

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


def get_weather(latitude, longitude):

    params = {
        "latitude": latitude,
        "longitude": longitude,

        "current": ",".join([
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "precipitation",
            "rain",
            "weather_code",
            "wind_speed_10m",
            "wind_direction_10m"
        ]),

        "hourly": ",".join([
    "temperature_2m",
    "precipitation_probability",
    "precipitation",
    "visibility",
    "uv_index",
    "soil_moisture_0_to_7cm",
    "soil_temperature_0cm"
]),

        "daily": ",".join([
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_probability_max",
            "sunrise",
            "sunset"
        ]),

        "timezone": "Asia/Kolkata",
        "forecast_days": 7
    }

    response = requests.get(
        OPEN_METEO_URL,
        params=params,
        timeout=10
    )

    response.raise_for_status()

    raw_data = response.json()

    return normalize_weather(raw_data)


def normalize_weather(data):

    current = data["current"]
    hourly = data["hourly"]
    daily = data["daily"]

    return {
        "current": {
            "temperature": current["temperature_2m"],
            "humidity": current["relative_humidity_2m"],
            "feels_like": current["apparent_temperature"],
            "rain": current["rain"],
            "precipitation": current["precipitation"],
            "wind_speed": current["wind_speed_10m"],
            "wind_direction": current["wind_direction_10m"],
            "weather_code": current["weather_code"]
        },

       "hourly": {
    "time": hourly["time"],
    "temperature": hourly["temperature_2m"],
    "rain_probability": hourly["precipitation_probability"],
    "precipitation": hourly["precipitation"],
    "visibility": hourly["visibility"],
    "uv": hourly["uv_index"],

    "soil_moisture": hourly.get(
        "soil_moisture_0_to_7cm"
    ),

    "soil_temperature": hourly.get(
        "soil_temperature_0cm"
    )
},

        "daily": {
            "time": daily["time"],
            "max_temperature": daily["temperature_2m_max"],
            "min_temperature": daily["temperature_2m_min"],
            "rain_probability": daily["precipitation_probability_max"],
            "sunrise": daily["sunrise"],
            "sunset": daily["sunset"],
            "weather_code": daily["weather_code"]
        }
    }