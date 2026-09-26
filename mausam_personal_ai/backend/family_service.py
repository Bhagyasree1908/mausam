# backend/family_service.py


def get_family_safety_level(
    temperature,
    rain_probability,
    visibility
):
    alerts = []

    # -------------------------
    # TEMPERATURE
    # -------------------------

    if temperature >= 40:
        alerts.append({
            "type": "extreme_heat",
            "severity": "critical",
            "message": (
                "Extreme heat detected. Avoid prolonged outdoor "
                "activities with children and elderly family members."
            )
        })

    elif temperature >= 35:
        alerts.append({
            "type": "high_temperature",
            "severity": "high",
            "message": (
                "High temperature detected. Keep family members "
                "hydrated and limit prolonged outdoor exposure."
            )
        })

    elif temperature >= 30:
        alerts.append({
            "type": "warm_weather",
            "severity": "medium",
            "message": (
                "Warm conditions expected. Keep drinking water "
                "available during outdoor activities."
            )
        })

    # -------------------------
    # RAIN
    # -------------------------

    if rain_probability >= 80:
        alerts.append({
            "type": "heavy_rain_probability",
            "severity": "critical",
            "message": (
                "Very high probability of rain. Consider postponing "
                "outdoor family activities."
            )
        })

    elif rain_probability >= 60:
        alerts.append({
            "type": "high_rain_probability",
            "severity": "high",
            "message": (
                "High probability of rain. Keep outdoor family "
                "plans flexible."
            )
        })

    elif rain_probability >= 40:
        alerts.append({
            "type": "rain_probability",
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
                "Very low visibility detected. Avoid unnecessary "
                "travel with family."
            )
        })

    elif visibility < 2000:
        alerts.append({
            "type": "low_visibility",
            "severity": "high",
            "message": (
                "Reduced visibility detected. Exercise caution "
                "during family travel."
            )
        })

    # -------------------------
    # OVERALL SAFETY
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


def generate_family_advice(
    temperature,
    rain_probability,
    visibility
):
    advice = []

    # -------------------------
    # TEMPERATURE
    # -------------------------

    if temperature >= 35:

        advice.append(
            "Hot conditions expected. Keep children hydrated "
            "and limit prolonged outdoor exposure."
        )

    elif temperature >= 30:

        advice.append(
            "Warm conditions expected. Carry drinking water "
            "for outdoor family activities."
        )

    else:

        advice.append(
            "Temperature conditions are relatively comfortable "
            "for family activities."
        )

    # -------------------------
    # RAIN
    # -------------------------

    if rain_probability >= 70:

        advice.append(
            "High chance of rain. Consider indoor activities "
            "or keep outdoor plans flexible."
        )

    elif rain_probability >= 40:

        advice.append(
            "Rain is possible. Carry rain protection."
        )

    else:

        advice.append(
            "Low probability of rain for outdoor family activities."
        )

    # -------------------------
    # VISIBILITY
    # -------------------------

    if visibility < 2000:

        advice.append(
            "Reduced visibility detected. Exercise caution "
            "during family travel."
        )

    else:

        advice.append(
            "Visibility conditions are suitable for normal travel."
        )

    return advice


def generate_family_day_plan(
    weather_data
):

    daily = weather_data["daily"]
    hourly = weather_data["hourly"]

    dates = daily["time"]
    max_temperatures = daily["max_temperature"]
    min_temperatures = daily["min_temperature"]
    rain_probabilities = daily["rain_probability"]

    plan = []

    # First 3 days for family planning
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
                "High chance of rain. Prefer indoor family activities "
                "or keep outdoor plans flexible."
            )

        elif rain_probability >= 40:

            advice.append(
                "Rain is possible. Keep rain protection ready."
            )

        else:

            advice.append(
                "Low chance of rain. Outdoor family activities "
                "can be planned."
            )

        # -------------------------
        # TEMPERATURE
        # -------------------------

        if temperature_max >= 35:

            advice.append(
                "Hot conditions expected. Keep children hydrated "
                "and avoid prolonged afternoon exposure."
            )

        elif temperature_max >= 30:

            advice.append(
                "Warm conditions expected. Carry sufficient water."
            )

        else:

            advice.append(
                "Comfortable temperature conditions expected."
            )

        # -------------------------
        # VISIBILITY
        # -------------------------

        # Use first available visibility value.
        visibility = hourly["visibility"][0]

        if visibility < 2000:

            advice.append(
                "Reduced visibility. Exercise caution during travel."
            )

        else:

            advice.append(
                "Visibility is suitable for normal family travel."
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
            "visibility": visibility,
            "advice": advice
        })

    return plan