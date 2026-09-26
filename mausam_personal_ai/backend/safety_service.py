
def apply_safety_override(weather_data, recommendations):

    current = weather_data["current"]
    hourly = weather_data["hourly"]
    daily = weather_data["daily"]

    safety_alerts = []

    temperature = current["temperature"]
    wind = current["wind_speed"]
    humidity = current["humidity"]

    today_rain_probability = daily["rain_probability"][0]

    current_visibility = hourly["visibility"][0]

    # ---------------------------------------
    # EXTREME TEMPERATURE
    # ---------------------------------------

    if temperature >= 40:
        safety_alerts.append({
            "type": "extreme_heat",
            "severity": "critical",
            "message": "Extreme heat conditions detected. Avoid prolonged outdoor exposure."
        })

    elif temperature >= 35:
        safety_alerts.append({
            "type": "high_temperature",
            "severity": "high",
            "message": "High temperature detected. Limit prolonged outdoor activity and stay hydrated."
        })

    # ---------------------------------------
    # HEAVY RAIN POSSIBILITY
    # ---------------------------------------

    if today_rain_probability >= 80:
        safety_alerts.append({
            "type": "heavy_rain",
            "severity": "critical",
            "message": "Very high probability of rain detected. Outdoor plans should be reconsidered."
        })

    elif today_rain_probability >= 60:
        safety_alerts.append({
            "type": "high_rain_probability",
            "severity": "high",
            "message": "High probability of rain detected. Exercise caution with outdoor activities."
        })

    # ---------------------------------------
    # LOW VISIBILITY
    # ---------------------------------------

    if current_visibility < 1000:
        safety_alerts.append({
            "type": "low_visibility",
            "severity": "critical",
            "message": "Very low visibility detected. Travel should be undertaken with extreme caution."
        })

    elif current_visibility < 2000:
        safety_alerts.append({
            "type": "reduced_visibility",
            "severity": "high",
            "message": "Reduced visibility detected. Exercise caution while travelling."
        })

    # ---------------------------------------
    # STRONG WIND
    # ---------------------------------------

    if wind >= 50:
        safety_alerts.append({
            "type": "strong_wind",
            "severity": "critical",
            "message": "Very strong winds detected. Avoid unnecessary outdoor activities."
        })

    elif wind >= 30:
        safety_alerts.append({
            "type": "strong_wind",
            "severity": "high",
            "message": "Strong winds detected. Exercise caution during outdoor activities."
        })

    # ---------------------------------------
    # SAFETY OVERRIDE
    # ---------------------------------------

    critical_alerts = [
        alert for alert in safety_alerts
        if alert["severity"] == "critical"
    ]

    high_alerts = [
        alert for alert in safety_alerts
        if alert["severity"] == "high"
    ]

    if critical_alerts:
        safety_level = "critical"

    elif high_alerts:
        safety_level = "high"

    else:
        safety_level = "normal"

    return {
        "safety_level": safety_level,
        "safety_alerts": safety_alerts,
        "recommendations": recommendations
    }