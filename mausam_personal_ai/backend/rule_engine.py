def evaluate_rules(profile, weather_data, air_quality_data=None):

    current = weather_data["current"]
    hourly = weather_data["hourly"]
    daily = weather_data["daily"]

    aqi = None

    if air_quality_data:
        aqi = air_quality_data["current"].get("us_aqi")

    recommendations = []

    temperature = current["temperature"]
    rain = current["rain"]
    wind = current["wind_speed"]

    today_rain_probability = daily["rain_probability"][0]
    today_max_temperature = daily["max_temperature"][0]

    current_uv = hourly["uv"][0]

    # =========================================================
    # FITNESS
    # =========================================================

    if profile == "fitness":

        if today_rain_probability >= 60:
            recommendations.append({
                "type": "rain",
                "severity": "high",
                "message": "High chance of rain today. Consider indoor exercise or a safer outdoor time."
            })

        elif today_rain_probability >= 30:
            recommendations.append({
                "type": "rain",
                "severity": "medium",
                "message": "There is a possibility of rain today. Keep rain protection ready."
            })

        if today_max_temperature >= 35:
            recommendations.append({
                "type": "temperature",
                "severity": "high",
                "message": "High temperature expected. Prefer early morning or evening workouts."
            })

        elif today_max_temperature >= 30:
            recommendations.append({
                "type": "temperature",
                "severity": "medium",
                "message": "Warm conditions expected. Stay hydrated during outdoor activity."
            })

        if current_uv >= 6:
            recommendations.append({
                "type": "uv",
                "severity": "high",
                "message": "UV level is high. Avoid prolonged direct sunlight."
            })

        if wind >= 30:
            recommendations.append({
                "type": "wind",
                "severity": "medium",
                "message": "Strong winds detected. Reduce intense outdoor activity."
            })

    # =========================================================
    # HEALTH
    # =========================================================

    elif profile == "health":

        if aqi is not None:

            if aqi > 150:
                recommendations.append({
                    "type": "aqi",
                    "severity": "high",
                    "message": "Poor air quality detected. Sensitive individuals should avoid prolonged outdoor exposure."
                })

            elif aqi > 100:
                recommendations.append({
                    "type": "aqi",
                    "severity": "medium",
                    "message": "Air quality may affect sensitive individuals. Consider reducing prolonged outdoor exposure."
                })

            elif aqi > 50:
                recommendations.append({
                    "type": "aqi",
                    "severity": "low",
                    "message": "Moderate air quality detected. Sensitive individuals should monitor their comfort during prolonged outdoor activity."
                })

        if current_uv >= 6:
            recommendations.append({
                "type": "uv",
                "severity": "high",
                "message": "High UV conditions. Sun protection is recommended."
            })

        if temperature >= 35:
            recommendations.append({
                "type": "temperature",
                "severity": "high",
                "message": "High temperature detected. Avoid prolonged heat exposure."
            })

        if current["humidity"] >= 80:
            recommendations.append({
                "type": "humidity",
                "severity": "medium",
                "message": "High humidity detected. Stay hydrated and remain comfortable."
            })

    # =========================================================
    # TRAVELER
    # =========================================================

    elif profile == "traveler":

        if today_rain_probability >= 60:
            recommendations.append({
                "type": "rain",
                "severity": "high",
                "message": "High chance of rain. Carry rain protection and plan accordingly."
            })

        if today_max_temperature >= 35:
            recommendations.append({
                "type": "temperature",
                "severity": "medium",
                "message": "Hot conditions expected. Carry sufficient water."
            })

    # =========================================================
    # FAMILY
    # =========================================================

    elif profile == "family":

        if today_rain_probability >= 60:
            recommendations.append({
                "type": "rain",
                "severity": "high",
                "message": "High chance of rain. Plan school and family travel accordingly."
            })

        if today_rain_probability >= 30:
            recommendations.append({
                "type": "rain",
                "severity": "medium",
                "message": "Possible rain today. Keep rain protection ready."
            })

    # =========================================================
    # AGRICULTURE
    # =========================================================

    elif profile == "agriculture":

        # -----------------------------------------------------
        # 1. UPCOMING RAINFALL
        # -----------------------------------------------------

        rain_probabilities = daily["rain_probability"]

        max_rain_probability = max(rain_probabilities)

        max_rain_day_index = rain_probabilities.index(
            max_rain_probability
        )

        max_rain_day = daily["time"][max_rain_day_index]

        if max_rain_probability >= 60:

            recommendations.append({
                "type": "rainfall",
                "severity": "high",
                "message": (
                    f"High rainfall probability of "
                    f"{max_rain_probability}% is expected on "
                    f"{max_rain_day}. "
                    "Plan irrigation accordingly."
                )
            })

        elif max_rain_probability >= 30:

            recommendations.append({
                "type": "rainfall",
                "severity": "medium",
                "message": (
                    f"Rainfall probability may reach "
                    f"{max_rain_probability}% on "
                    f"{max_rain_day}. "
                    "Monitor rainfall before irrigation."
                )
            })

        # -----------------------------------------------------
        # 2. TEMPERATURE
        # -----------------------------------------------------

        if today_max_temperature >= 35:

            recommendations.append({
                "type": "temperature",
                "severity": "high",
                "message": (
                    "High temperature expected. "
                    "Monitor soil moisture and crop conditions."
                )
            })

        elif today_max_temperature >= 30:

            recommendations.append({
                "type": "temperature",
                "severity": "medium",
                "message": (
                    "Warm conditions expected. "
                    "Monitor crop and soil conditions."
                )
            })

        # -----------------------------------------------------
        # 3. SOIL MOISTURE
        # -----------------------------------------------------

        soil_moisture_values = hourly.get(
            "soil_moisture",
            []
        )

        if soil_moisture_values:

            current_soil_moisture = soil_moisture_values[0]

            if current_soil_moisture < 0.05:

                recommendations.append({
                    "type": "soil_moisture",
                    "severity": "high",
                    "message": (
                        "Low soil moisture condition detected. "
                        "Check irrigation requirements."
                    )
                })

            elif current_soil_moisture < 0.10:

                recommendations.append({
                    "type": "soil_moisture",
                    "severity": "medium",
                    "message": (
                        "Soil moisture is relatively low. "
                        "Monitor field moisture before irrigation."
                    )
                })

        # -----------------------------------------------------
        # 4. FROST
        # -----------------------------------------------------

        soil_temperature_values = hourly.get(
            "soil_temperature",
            []
        )

        if soil_temperature_values:

            current_soil_temperature = soil_temperature_values[0]

            if current_soil_temperature <= 0:

                recommendations.append({
                    "type": "frost",
                    "severity": "critical",
                    "message": (
                        "Very low soil temperature detected. "
                        "Frost risk should be monitored."
                    )
                })

            elif current_soil_temperature <= 3:

                recommendations.append({
                    "type": "frost",
                    "severity": "high",
                    "message": (
                        "Low soil temperature detected. "
                        "Monitor for possible frost conditions."
                    )
                })

    # =========================================================
    # COMMUTER
    # =========================================================

    elif profile == "commuter":

        if today_rain_probability >= 60:
            recommendations.append({
                "type": "rain",
                "severity": "high",
                "message": "High chance of rain. Allow additional travel time."
            })

        if today_rain_probability >= 30:
            recommendations.append({
                "type": "rain",
                "severity": "medium",
                "message": "Rain is possible. Keep rain protection ready."
            })

        current_visibility = hourly["visibility"][0]

        if current_visibility < 2000:
            recommendations.append({
                "type": "visibility",
                "severity": "high",
                "message": "Low visibility detected. Travel carefully."
            })

        if wind >= 30:
            recommendations.append({
                "type": "wind",
                "severity": "medium",
                "message": "Strong winds detected. Exercise caution while travelling."
            })

    # =========================================================
    # EVENT
    # =========================================================

    elif profile == "event":

        if today_rain_probability >= 60:
            recommendations.append({
                "type": "rain",
                "severity": "high",
                "message": "High chance of rain. Prepare a rain contingency plan."
            })

        if today_max_temperature >= 35:
            recommendations.append({
                "type": "temperature",
                "severity": "medium",
                "message": "Hot conditions expected. Provide hydration and shaded areas."
            })

    # =========================================================
    # BEACH
    # =========================================================

    elif profile == "beach":

        if wind >= 30:
            recommendations.append({
                "type": "wind",
                "severity": "high",
                "message": "Strong winds detected. Check marine conditions before beach activities."
            })

        if today_rain_probability >= 60:
            recommendations.append({
                "type": "rain",
                "severity": "medium",
                "message": "High chance of rain. Consider checking conditions before visiting the beach."
            })

    # =========================================================
    # FINAL RESULT
    # =========================================================

    return {
        "profile": profile,
        "recommendations": recommendations
    }