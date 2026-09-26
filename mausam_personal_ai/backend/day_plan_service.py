def get_period(hour):
    """
    Divide the day into four periods.
    """

    if 5 <= hour < 12:
        return "morning"

    elif 12 <= hour < 17:
        return "afternoon"

    elif 17 <= hour < 21:
        return "evening"

    else:
        return "night"


def get_uv_level(uv):

    if uv is None:
        return "unknown"

    if uv < 3:
        return "low"

    elif uv < 6:
        return "moderate"

    elif uv < 8:
        return "high"

    elif uv < 11:
        return "very_high"

    else:
        return "extreme"


def get_rain_level(rain_probability):

    if rain_probability < 20:
        return "low"

    elif rain_probability < 50:
        return "moderate"

    elif rain_probability < 70:
        return "high"

    else:
        return "very_high"


def get_temperature_level(temperature):

    if temperature >= 35:
        return "hot"

    elif temperature >= 30:
        return "warm"

    elif temperature <= 20:
        return "cool"

    else:
        return "comfortable"


def get_soil_moisture_level(soil_moisture):

    if soil_moisture is None:
        return "unknown"

    if soil_moisture < 0.05:
        return "low"

    elif soil_moisture < 0.10:
        return "moderate"

    else:
        return "adequate"


def get_soil_temperature_level(soil_temperature):

    if soil_temperature is None:
        return "unknown"

    if soil_temperature <= 3:
        return "frost_risk"

    elif soil_temperature <= 10:
        return "cold"

    else:
        return "normal"


def get_period_advice(
    profile,
    period,
    temperature,
    rain_probability,
    uv,
    wind_speed,
    soil_moisture=None,
    soil_temperature=None
):

    advice = []

    # -------------------------
    # FITNESS
    # -------------------------

    if profile == "fitness":

        if rain_probability >= 60:
            advice.append(
                "High chance of rain. Prefer indoor exercise."
            )

        elif temperature >= 35 or uv >= 6:
            advice.append(
                "Avoid intense outdoor exercise during this period."
            )

        elif (
            temperature < 30
            and rain_probability < 30
            and uv < 6
        ):
            advice.append(
                "Good window for outdoor exercise."
            )

        else:
            advice.append(
                "Suitable for light outdoor activity if conditions remain comfortable."
            )

        if wind_speed >= 30:
            advice.append(
                "Strong winds detected. Reduce intense outdoor activity."
            )

    # -------------------------
    # HEALTH
    # -------------------------

    elif profile == "health":

        if temperature >= 35:
            advice.append(
                "Limit prolonged heat exposure and stay hydrated."
            )

        if uv >= 6:
            advice.append(
                "Use sun protection during outdoor exposure."
            )

        if not advice:
            advice.append(
                "Generally comfortable conditions."
            )

    # -------------------------
    # TRAVELER
    # -------------------------

    elif profile == "traveler":

        if rain_probability >= 60:
            advice.append(
                "High chance of rain. Carry rain protection and plan travel accordingly."
            )

        elif rain_probability >= 30:
            advice.append(
                "Rain is possible. Keep rain protection ready."
            )

        else:
            advice.append(
                "Travel conditions are generally manageable."
            )

        if temperature >= 35:
            advice.append(
                "Hot conditions expected. Carry sufficient drinking water."
            )

    # -------------------------
    # FAMILY
    # -------------------------

    elif profile == "family":

        if rain_probability >= 60:
            advice.append(
                "Allow extra time for family and school travel."
            )

        else:
            advice.append(
                "Suitable for regular family activities."
            )

        if temperature >= 35:
            advice.append(
                "Avoid prolonged outdoor exposure during peak heat."
            )

    # -------------------------
    # AGRICULTURE
    # -------------------------

    elif profile == "agriculture":

        # Rainfall
        if rain_probability >= 70:
            advice.append(
                "High rainfall probability. "
                "Consider delaying irrigation and monitor field moisture."
            )

        elif rain_probability >= 40:
            advice.append(
                "Moderate rainfall probability. "
                "Monitor rainfall before irrigation."
            )

        else:
            advice.append(
                "Low rainfall probability. "
                "Check soil moisture before irrigation."
            )

        # Temperature
        if temperature >= 35:
            advice.append(
                "High temperature expected. "
                "Monitor crop stress and soil moisture."
            )

        elif temperature >= 30:
            advice.append(
                "Warm conditions expected. "
                "Monitor crop and soil conditions."
            )

        # Soil moisture
        if soil_moisture is not None:

            if soil_moisture < 0.05:
                advice.append(
                    "Soil moisture is low. "
                    "Check irrigation requirements."
                )

            elif soil_moisture < 0.10:
                advice.append(
                    "Soil moisture is relatively low. "
                    "Monitor field moisture."
                )

            else:
                advice.append(
                    "Soil moisture is currently adequate."
                )

        # Frost
        if soil_temperature is not None:

            if soil_temperature <= 3:
                advice.append(
                    "Low soil temperature detected. "
                    "Monitor for possible frost."
                )

    # -------------------------
    # COMMUTER
    # -------------------------

    elif profile == "commuter":

        if rain_probability >= 60:
            advice.append(
                "High rain chance. Allow additional travel time."
            )

        elif rain_probability >= 30:
            advice.append(
                "Rain is possible. Keep rain protection ready."
            )

        else:
            advice.append(
                "Normal commuting conditions expected."
            )

        if wind_speed >= 30:
            advice.append(
                "Strong winds detected. Travel carefully."
            )

    # -------------------------
    # EVENT
    # -------------------------

    elif profile == "event":

        if rain_probability >= 60:
            advice.append(
                "Prepare a rain contingency plan."
            )

        else:
            advice.append(
                "Outdoor event planning can continue."
            )

        if temperature >= 35:
            advice.append(
                "Provide hydration and shaded areas."
            )

    # -------------------------
    # BEACH
    # -------------------------

    elif profile == "beach":

        if wind_speed >= 30:
            advice.append(
                "Check marine conditions before beach activities."
            )

        if rain_probability >= 60:
            advice.append(
                "Rain is likely. Recheck conditions before visiting."
            )

        if not advice:
            advice.append(
                "Check current marine conditions before water activities."
            )

    return advice


def generate_day_plan(profile, weather_data):

    hourly = weather_data["hourly"]

    times = hourly["time"]
    temperatures = hourly["temperature"]
    rain_probabilities = hourly["rain_probability"]
    uvs = hourly["uv"]

    # Agriculture-specific data
    soil_moisture_values = hourly.get(
        "soil_moisture"
    )

    soil_temperature_values = hourly.get(
        "soil_temperature"
    )

    wind_speed = weather_data["current"]["wind_speed"]

    # Today's date
    today = times[0][:10]

    periods = {
        "morning": [],
        "afternoon": [],
        "evening": [],
        "night": []
    }

    # ---------------------------------
    # Collect only TODAY'S data
    # ---------------------------------

    for i in range(len(times)):

        if not times[i].startswith(today):
            continue

        hour = int(times[i][11:13])

        period = get_period(hour)

        temperature = temperatures[i]
        rain_probability = rain_probabilities[i]
        uv = uvs[i]

        if uv is None:
            uv = 0

        # Soil values
        soil_moisture = None
        soil_temperature = None

        if (
            soil_moisture_values is not None
            and i < len(soil_moisture_values)
        ):
            soil_moisture = soil_moisture_values[i]

        if (
            soil_temperature_values is not None
            and i < len(soil_temperature_values)
        ):
            soil_temperature = soil_temperature_values[i]

        periods[period].append({
            "temperature": temperature,
            "rain_probability": rain_probability,
            "uv": uv,
            "soil_moisture": soil_moisture,
            "soil_temperature": soil_temperature
        })

    # ---------------------------------
    # Create compact summary
    # ---------------------------------

    day_plan = {}

    for period, values in periods.items():

        if not values:
            day_plan[period] = {
                "available": False
            }
            continue

        # Temperature
        temperatures_list = [
            value["temperature"]
            for value in values
        ]

        # Rain
        rain_list = [
            value["rain_probability"]
            for value in values
        ]

        # UV
        uv_list = [
            value["uv"]
            for value in values
        ]

        # Soil moisture
        soil_moisture_list = [
            value["soil_moisture"]
            for value in values
            if value["soil_moisture"] is not None
        ]

        # Soil temperature
        soil_temperature_list = [
            value["soil_temperature"]
            for value in values
            if value["soil_temperature"] is not None
        ]

        min_temperature = min(
            temperatures_list
        )

        max_temperature = max(
            temperatures_list
        )

        max_rain = max(
            rain_list
        )

        max_uv = max(
            uv_list
        )

        # Soil values for agriculture
        if soil_moisture_list:
            min_soil_moisture = min(
                soil_moisture_list
            )

            max_soil_moisture = max(
                soil_moisture_list
            )

            current_soil_moisture = soil_moisture_list[0]

        else:
            min_soil_moisture = None
            max_soil_moisture = None
            current_soil_moisture = None

        if soil_temperature_list:

            min_soil_temperature = min(
                soil_temperature_list
            )

            max_soil_temperature = max(
                soil_temperature_list
            )

            current_soil_temperature = (
                soil_temperature_list[0]
            )

        else:

            min_soil_temperature = None
            max_soil_temperature = None
            current_soil_temperature = None

        # Levels
        temperature_level = get_temperature_level(
            max_temperature
        )

        rain_level = get_rain_level(
            max_rain
        )

        uv_level = get_uv_level(
            max_uv
        )

        # Period advice
        advice = get_period_advice(
            profile,
            period,
            max_temperature,
            max_rain,
            max_uv,
            wind_speed,
            soil_moisture=current_soil_moisture
            if profile == "agriculture"
            else None,
            soil_temperature=current_soil_temperature
            if profile == "agriculture"
            else None
        )

        # ---------------------------------
        # Base period result
        # ---------------------------------

        period_result = {
            "available": True,

            "temperature": {
                "min": round(
                    min_temperature,
                    1
                ),
                "max": round(
                    max_temperature,
                    1
                ),
                "level": temperature_level
            },

            "rain": {
                "probability": max_rain,
                "level": rain_level
            },

            "uv": {
                "index": round(
                    max_uv,
                    1
                ),
                "level": uv_level
            },

            "advice": advice
        }

        # ---------------------------------
        # Agriculture-specific information
        # ---------------------------------

        if profile == "agriculture":

            period_result["soil_moisture"] = {
                "min": (
                    round(
                        min_soil_moisture,
                        3
                    )
                    if min_soil_moisture is not None
                    else None
                ),

                "max": (
                    round(
                        max_soil_moisture,
                        3
                    )
                    if max_soil_moisture is not None
                    else None
                ),

                "level": get_soil_moisture_level(
                    current_soil_moisture
                )
            }

            period_result["soil_temperature"] = {
                "min": (
                    round(
                        min_soil_temperature,
                        1
                    )
                    if min_soil_temperature is not None
                    else None
                ),

                "max": (
                    round(
                        max_soil_temperature,
                        1
                    )
                    if max_soil_temperature is not None
                    else None
                ),

                "level": get_soil_temperature_level(
                    current_soil_temperature
                )
            }

        day_plan[period] = period_result

    return {
        "date": today,
        "profile": profile,
        "plan": day_plan
    }