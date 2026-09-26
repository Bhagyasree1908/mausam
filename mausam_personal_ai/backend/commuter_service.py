# backend/commuter_service.py


def get_commuter_safety_level(
    rain_probability,
    visibility,
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
                "Consider postponing non-essential travel."
            )
        })

    elif rain_probability >= 60:
        alerts.append({
            "type": "high_rain",
            "severity": "high",
            "message": (
                "High probability of rain. "
                "Allow extra travel time and use rain protection."
            )
        })

    elif rain_probability >= 40:
        alerts.append({
            "type": "rain_possible",
            "severity": "medium",
            "message": (
                "Rain is possible. Keep rain protection ready."
            )
        })

    # -------------------------
    # VISIBILITY
    # -------------------------

    if visibility < 1000:
        alerts.append({
            "type": "very_low_visibility",
            "severity": "critical",
            "message": (
                "Very low visibility detected. "
                "Travel with extreme caution."
            )
        })

    elif visibility < 2000:
        alerts.append({
            "type": "low_visibility",
            "severity": "high",
            "message": (
                "Reduced visibility detected. "
                "Exercise caution while travelling."
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
                "Avoid unnecessary travel."
            )
        })

    elif wind_speed >= 30:
        alerts.append({
            "type": "strong_wind",
            "severity": "high",
            "message": (
                "Strong winds detected. "
                "Exercise caution while travelling."
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


def generate_commuter_advice(
    rain_probability,
    visibility,
    wind_speed
):

    advice = []

    # -------------------------
    # RAIN
    # -------------------------

    if rain_probability >= 70:

        advice.append(
            "High chance of rain. Allow additional travel time "
            "and keep rain protection ready."
        )

    elif rain_probability >= 40:

        advice.append(
            "Rain is possible. Keep rain protection ready."
        )

    else:

        advice.append(
            "Low probability of rain for the planned travel period."
        )

    # -------------------------
    # VISIBILITY
    # -------------------------

    if visibility < 2000:

        advice.append(
            "Reduced visibility detected. Travel carefully."
        )

    else:

        advice.append(
            "Visibility conditions are suitable for normal travel."
        )

    # -------------------------
    # WIND
    # -------------------------

    if wind_speed >= 30:

        advice.append(
            "Strong winds expected. Exercise caution while travelling."
        )

    elif wind_speed >= 15:

        advice.append(
            "Moderate winds expected during travel."
        )

    else:

        advice.append(
            "Wind conditions are relatively calm."
        )

    return advice


def generate_commuter_day_plan(
    weather_data
):

    daily = weather_data["daily"]
    hourly = weather_data["hourly"]

    dates = daily["time"]
    max_temperatures = daily["max_temperature"]
    min_temperatures = daily["min_temperature"]
    rain_probabilities = daily["rain_probability"]

    plan = []

    # First 3 days
    days = min(3, len(dates))

    # Current visibility and wind
    visibility = hourly["visibility"][0]
    wind_speed = weather_data["current"]["wind_speed"]

    for i in range(days):

        rain_probability = rain_probabilities[i]

        advice = []

        # -------------------------
        # RAIN
        # -------------------------

        if rain_probability >= 70:

            advice.append(
                "High chance of rain. Allow additional travel time."
            )

        elif rain_probability >= 40:

            advice.append(
                "Rain is possible. Keep rain protection ready."
            )

        else:

            advice.append(
                "Low chance of rain for travel."
            )

        # -------------------------
        # VISIBILITY
        # -------------------------

        if visibility < 2000:

            advice.append(
                "Reduced visibility. Exercise caution while travelling."
            )

        else:

            advice.append(
                "Visibility is suitable for normal travel."
            )

        # -------------------------
        # WIND
        # -------------------------

        if wind_speed >= 30:

            advice.append(
                "Strong winds expected. Travel carefully."
            )

        elif wind_speed >= 15:

            advice.append(
                "Moderate winds expected."
            )

        else:

            advice.append(
                "Wind conditions are relatively calm."
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
            "travel_conditions": {
                "visibility": visibility,
                "wind_speed": wind_speed
            },
            "advice": advice
        })

    return plan