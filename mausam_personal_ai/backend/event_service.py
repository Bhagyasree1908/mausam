# backend/event_service.py


def get_event_safety_level(
    rain_probability,
    temperature,
    humidity,
    wind_speed
):
    alerts = []

    # -------------------------
    # RAIN
    # -------------------------

    if rain_probability >= 80:
        alerts.append({
            "type": "very_high_rain",
            "severity": "critical",
            "message": (
                "Very high probability of rain. "
                "Consider postponing outdoor events or arranging "
                "adequate covered space."
            )
        })

    elif rain_probability >= 60:
        alerts.append({
            "type": "high_rain",
            "severity": "high",
            "message": (
                "High probability of rain. "
                "Keep an indoor or covered backup arrangement ready."
            )
        })

    elif rain_probability >= 40:
        alerts.append({
            "type": "rain_possible",
            "severity": "medium",
            "message": (
                "Rain is possible. "
                "Keep a backup arrangement for outdoor activities."
            )
        })

    # -------------------------
    # TEMPERATURE
    # -------------------------

    if temperature >= 40:
        alerts.append({
            "type": "extreme_heat",
            "severity": "critical",
            "message": (
                "Extreme heat detected. "
                "Avoid prolonged outdoor events."
            )
        })

    elif temperature >= 35:
        alerts.append({
            "type": "high_temperature",
            "severity": "high",
            "message": (
                "High temperature expected. "
                "Provide shade and drinking water for attendees."
            )
        })

    elif temperature >= 30:
        alerts.append({
            "type": "warm_weather",
            "severity": "medium",
            "message": (
                "Warm conditions expected. "
                "Keep drinking water available."
            )
        })

    # -------------------------
    # WIND
    # -------------------------

    if wind_speed >= 45:
        alerts.append({
            "type": "very_strong_wind",
            "severity": "critical",
            "message": (
                "Very strong winds detected. "
                "Avoid temporary outdoor structures."
            )
        })

    elif wind_speed >= 30:
        alerts.append({
            "type": "strong_wind",
            "severity": "high",
            "message": (
                "Strong winds detected. "
                "Secure temporary outdoor structures."
            )
        })

    # -------------------------
    # HUMIDITY
    # -------------------------

    if humidity >= 85:
        alerts.append({
            "type": "high_humidity",
            "severity": "medium",
            "message": (
                "High humidity expected. "
                "Ensure ventilation and drinking water are available."
            )
        })

    # -------------------------
    # OVERALL LEVEL
    # -------------------------

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


def generate_event_advice(
    rain_probability,
    temperature,
    humidity,
    wind_speed
):

    advice = []

    # Rain
    if rain_probability >= 70:

        advice.append(
            "High chance of rain. Keep an indoor or covered "
            "backup arrangement ready."
        )

    elif rain_probability >= 40:

        advice.append(
            "Rain is possible. Keep outdoor plans flexible."
        )

    else:

        advice.append(
            "Low probability of rain for the planned event period."
        )

    # Temperature
    if temperature >= 35:

        advice.append(
            "Hot conditions expected. Provide shade and "
            "sufficient drinking water."
        )

    elif temperature >= 30:

        advice.append(
            "Warm conditions expected. Keep drinking water "
            "available for attendees."
        )

    else:

        advice.append(
            "Temperature conditions are relatively comfortable "
            "for outdoor events."
        )

    # Wind
    if wind_speed >= 30:

        advice.append(
            "Strong winds expected. Secure temporary structures "
            "such as tents, banners and decorations."
        )

    else:

        advice.append(
            "Wind conditions are suitable for normal event arrangements."
        )

    # Humidity
    if humidity >= 85:

        advice.append(
            "High humidity expected. Ensure adequate ventilation."
        )

    return advice


def generate_event_day_plan(weather_data):

    daily = weather_data["daily"]
    current = weather_data["current"]

    dates = daily["time"]
    max_temperatures = daily["max_temperature"]
    min_temperatures = daily["min_temperature"]
    rain_probabilities = daily["rain_probability"]

    humidity = current["humidity"]
    wind_speed = current["wind_speed"]

    plan = []

    # First 3 days
    days = min(3, len(dates))

    for i in range(days):

        temperature_max = max_temperatures[i]
        temperature_min = min_temperatures[i]
        rain_probability = rain_probabilities[i]

        advice = []

        # -------------------------
        # RAIN
        # -------------------------

        if rain_probability >= 70:

            advice.append(
                "High chance of rain. Keep an indoor or covered "
                "backup arrangement ready."
            )

        elif rain_probability >= 40:

            advice.append(
                "Rain is possible. Keep outdoor plans flexible."
            )

        else:

            advice.append(
                "Low chance of rain for the event."
            )

        # -------------------------
        # TEMPERATURE
        # -------------------------

        if temperature_max >= 35:

            advice.append(
                "Hot conditions expected. Provide shade and "
                "drinking water."
            )

        elif temperature_max >= 30:

            advice.append(
                "Warm conditions expected. Keep drinking water available."
            )

        else:

            advice.append(
                "Comfortable temperature conditions expected."
            )

        # -------------------------
        # WIND
        # -------------------------

        if wind_speed >= 30:

            advice.append(
                "Strong winds expected. Secure temporary structures."
            )

        else:

            advice.append(
                "Wind conditions are suitable for normal arrangements."
            )

        plan.append({
            "day": i + 1,
            "date": dates[i],

            "weather": {
                "temperature": {
                    "min": temperature_min,
                    "max": temperature_max
                },
                "rain_probability": rain_probability
            },

            "event_conditions": {
                "humidity": humidity,
                "wind_speed": wind_speed
            },

            "advice": advice
        })

    return plan