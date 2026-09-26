# backend/beach_service.py


def get_wave_level(wave_height):
    if wave_height is None:
        return "unknown"

    if wave_height < 0.5:
        return "low"
    elif wave_height < 1.5:
        return "moderate"
    elif wave_height < 2.5:
        return "high"
    else:
        return "very_high"


def get_wind_level(wind_speed):
    if wind_speed is None:
        return "unknown"

    if wind_speed < 15:
        return "low"
    elif wind_speed < 30:
        return "moderate"
    elif wind_speed < 45:
        return "high"
    else:
        return "very_high"


def get_beach_safety_level(
    wave_height,
    wind_speed,
    rain_probability
):
    alerts = []

    # Wave safety
    if wave_height is not None:

        if wave_height >= 2.5:
            alerts.append({
                "type": "very_high_waves",
                "severity": "critical",
                "message": "Very high waves detected. Avoid entering the sea."
            })

        elif wave_height >= 1.5:
            alerts.append({
                "type": "high_waves",
                "severity": "high",
                "message": "High waves detected. Exercise extreme caution near the sea."
            })

        elif wave_height >= 1.0:
            alerts.append({
                "type": "moderate_waves",
                "severity": "medium",
                "message": "Moderate waves detected. Follow local beach safety guidance."
            })

    # Wind safety
    if wind_speed is not None:

        if wind_speed >= 45:
            alerts.append({
                "type": "very_strong_wind",
                "severity": "critical",
                "message": "Very strong winds detected. Avoid water activities."
            })

        elif wind_speed >= 30:
            alerts.append({
                "type": "strong_wind",
                "severity": "high",
                "message": "Strong winds detected. Exercise caution during water activities."
            })

    # Rain
    if rain_probability is not None:

        if rain_probability >= 80:
            alerts.append({
                "type": "heavy_rain_probability",
                "severity": "high",
                "message": "Very high probability of rain. Consider postponing beach activities."
            })

        elif rain_probability >= 60:
            alerts.append({
                "type": "rain_probability",
                "severity": "medium",
                "message": "Rain is likely. Keep beach activities flexible."
            })

    # Overall level
    if any(
        alert["severity"] == "critical"
        for alert in alerts
    ):
        level = "critical"

    elif any(
        alert["severity"] == "high"
        for alert in alerts
    ):
        level = "high"

    elif any(
        alert["severity"] == "medium"
        for alert in alerts
    ):
        level = "medium"

    else:
        level = "normal"

    return {
        "level": level,
        "alerts": alerts
    }


def create_beach_summary(
    marine_data,
    rain_probability
):

    current = marine_data["current"]

    wave_height = current["wave_height"]
    wave_period = current["wave_period"]
    swell_height = current["swell_wave_height"]
    water_temperature = current["sea_surface_temperature"]

    return {
        "wave": {
            "height": wave_height,
            "height_level": get_wave_level(wave_height),
            "period": wave_period
        },
        "swell": {
            "height": swell_height
        },
        "water_temperature": water_temperature,
        "rain_probability": rain_probability
    }


def generate_beach_advice(
    marine_data,
    weather_data
):

    current = marine_data["current"]

    wave_height = current["wave_height"]
    wave_period = current["wave_period"]
    water_temperature = current["sea_surface_temperature"]

    wind_speed = weather_data["current"]["wind_speed"]

    rain_probability = (
        weather_data["daily"]
        ["rain_probability"][0]
    )

    advice = []

    # -------------------------
    # WAVES
    # -------------------------

    if wave_height is not None:

        if wave_height >= 2.5:
            advice.append(
                "Very high waves expected. Avoid entering the sea."
            )

        elif wave_height >= 1.5:
            advice.append(
                "High waves expected. Avoid risky water activities."
            )

        elif wave_height >= 1.0:
            advice.append(
                "Moderate waves expected. Follow beach safety guidance."
            )

        else:
            advice.append(
                "Wave conditions are relatively calm."
            )

    # -------------------------
    # WIND
    # -------------------------

    if wind_speed >= 30:

        advice.append(
            "Strong winds expected. Exercise caution during water activities."
        )

    elif wind_speed >= 15:

        advice.append(
            "Moderate winds expected near the beach."
        )

    # -------------------------
    # RAIN
    # -------------------------

    if rain_probability >= 70:

        advice.append(
            "High chance of rain. Consider postponing beach activities."
        )

    elif rain_probability >= 40:

        advice.append(
            "Rain is possible. Keep beach activities flexible."
        )

    else:

        advice.append(
            "Low probability of rain for the planned period."
        )

    # -------------------------
    # WATER TEMPERATURE
    # -------------------------

    if water_temperature is not None:

        if water_temperature >= 30:

            advice.append(
                "Sea surface temperature is warm."
            )

        elif water_temperature <= 22:

            advice.append(
                "Sea surface temperature is relatively cool."
            )

    return advice


def generate_beach_day_plan(
    marine_data,
    weather_data
):

    current = marine_data["current"]

    wave_height = current["wave_height"]
    wave_period = current["wave_period"]
    water_temperature = current["sea_surface_temperature"]

    daily = weather_data["daily"]

    dates = daily["time"]
    max_temperatures = daily["max_temperature"]
    min_temperatures = daily["min_temperature"]
    rain_probabilities = daily["rain_probability"]

    plan = []

    days = min(3, len(dates))

    for i in range(days):

        rain_probability = rain_probabilities[i]

        day_advice = []

        # Rain
        if rain_probability >= 70:
            day_advice.append(
                "High chance of rain. Consider postponing beach activities."
            )

        elif rain_probability >= 40:
            day_advice.append(
                "Rain is possible. Keep beach plans flexible."
            )

        else:
            day_advice.append(
                "Low chance of rain."
            )

        # Temperature
        if max_temperatures[i] >= 35:
            day_advice.append(
                "Hot conditions expected. Stay hydrated and use sun protection."
            )

        elif max_temperatures[i] >= 30:
            day_advice.append(
                "Warm conditions expected. Stay hydrated."
            )

        # Wave
        if wave_height is not None:

            if wave_height >= 2.5:
                day_advice.append(
                    "Very high waves. Avoid entering the sea."
                )

            elif wave_height >= 1.5:
                day_advice.append(
                    "High waves. Avoid risky water activities."
                )

            elif wave_height >= 1.0:
                day_advice.append(
                    "Moderate waves. Follow local beach safety guidance."
                )

            else:
                day_advice.append(
                    "Relatively calm wave conditions."
                )

        # Wind
        if weather_data["current"]["wind_speed"] >= 30:
            day_advice.append(
                "Strong winds expected. Exercise caution near the sea."
            )

        plan.append({
            "day": i + 1,
            "date": dates[i],
            "weather": {
                "temperature": {
                    "min": min_temperatures[i],
                    "max": max_temperatures[i]
                },
                "rain_probability": rain_probability
            },
            "marine": {
                "wave_height": wave_height,
                "wave_period": wave_period,
                "water_temperature": water_temperature
            },
            "advice": day_advice
        })

    return plan