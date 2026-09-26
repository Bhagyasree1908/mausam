from datetime import datetime


# =========================================================
# TRANSPORT VALIDATION
# =========================================================

def validate_transport(transport):

    allowed_transports = [
        "car",
        "bus",
        "train",
        "flight",
        "two_wheeler"
    ]

    if not transport:
        return False

    transport = transport.lower().strip()

    return transport in allowed_transports


# =========================================================
# TRANSPORT DISPLAY NAME
# =========================================================

def get_transport_name(transport):

    names = {
        "car": "Car",
        "bus": "Bus",
        "train": "Train",
        "flight": "Flight",
        "two_wheeler": "Two-wheeler"
    }

    return names.get(
        transport,
        transport.title()
    )


# =========================================================
# DATE + TIME VALIDATION
# =========================================================

def validate_departure_datetime(
    departure_date,
    departure_time
):

    if not departure_date or not departure_time:
        return False

    try:

        datetime.strptime(
            f"{departure_date} {departure_time}",
            "%Y-%m-%d %H:%M"
        )

        return True

    except ValueError:

        return False


# =========================================================
# GET DEPARTURE DATETIME
# =========================================================

def get_departure_datetime(
    departure_date,
    departure_time
):

    if not validate_departure_datetime(
        departure_date,
        departure_time
    ):
        return None

    return datetime.strptime(
        f"{departure_date} {departure_time}",
        "%Y-%m-%d %H:%M"
    )


# =========================================================
# FIND NEAREST HOURLY WEATHER
# =========================================================

def get_departure_weather(
    weather_data,
    departure_date,
    departure_time
):

    departure_datetime = get_departure_datetime(
        departure_date,
        departure_time
    )

    if departure_datetime is None:
        return None

    hourly = weather_data.get(
        "hourly",
        {}
    )

    times = hourly.get(
        "time",
        []
    )

    if not times:
        return None

    nearest_index = None
    smallest_difference = None

    for i, time_value in enumerate(times):

        try:

            weather_datetime = datetime.fromisoformat(
                time_value
            )

        except ValueError:

            continue

        difference = abs(
            (weather_datetime - departure_datetime).total_seconds()
        )

        if (
            smallest_difference is None
            or difference < smallest_difference
        ):

            smallest_difference = difference
            nearest_index = i

    if nearest_index is None:
        return None

    return {
        "time": times[nearest_index],
        "temperature": hourly.get(
            "temperature",
            [None]
        )[nearest_index],
        "rain_probability": hourly.get(
            "rain_probability",
            [None]
        )[nearest_index],
        "precipitation": hourly.get(
            "precipitation",
            [None]
        )[nearest_index],
        "visibility": hourly.get(
            "visibility",
            [None]
        )[nearest_index],
        "uv": hourly.get(
            "uv",
            [None]
        )[nearest_index]
    }


# =========================================================
# TRAVEL ADVICE
# =========================================================

def get_travel_advice(
    transport,
    temperature,
    rain_probability,
    wind_speed,
    visibility
):

    advice = []

    temperature = temperature or 0
    rain_probability = rain_probability or 0
    wind_speed = wind_speed or 0
    visibility = visibility or 99999

    # -----------------------------------------------------
    # GENERAL WEATHER
    # -----------------------------------------------------

    if rain_probability >= 70:

        advice.append(
            "High chance of rain at departure time. Carry rain protection."
        )

    elif rain_probability >= 40:

        advice.append(
            "Rain is possible around departure time. Keep rain protection ready."
        )

    else:

        advice.append(
            "Low rain probability around departure time."
        )

    # -----------------------------------------------------
    # TEMPERATURE
    # -----------------------------------------------------

    if temperature >= 35:

        advice.append(
            "Hot conditions are expected. Carry sufficient drinking water."
        )

    elif temperature >= 30:

        advice.append(
            "Warm conditions are expected. Stay hydrated."
        )

    # -----------------------------------------------------
    # CAR
    # -----------------------------------------------------

    if transport == "car":

        if rain_probability >= 60:

            advice.append(
                "Allow additional road-travel time because of possible rain."
            )

        if visibility < 2000:

            advice.append(
                "Reduced visibility detected. Drive carefully."
            )

        if wind_speed >= 30:

            advice.append(
                "Strong winds detected. Exercise caution while driving."
            )

    # -----------------------------------------------------
    # BUS
    # -----------------------------------------------------

    elif transport == "bus":

        if rain_probability >= 60:

            advice.append(
                "Rain may affect road travel. Allow additional travel time."
            )

        advice.append(
            "Keep essential belongings protected from rain."
        )

    # -----------------------------------------------------
    # TRAIN
    # -----------------------------------------------------

    elif transport == "train":

        if rain_probability >= 60:

            advice.append(
                "Rain is expected around departure. Carry rain protection."
            )

        advice.append(
            "Check train travel status before departure."
        )

    # -----------------------------------------------------
    # FLIGHT
    # -----------------------------------------------------

    elif transport == "flight":

        if rain_probability >= 60:

            advice.append(
                "Rain is expected around departure. Plan for wet conditions."
            )

        advice.append(
            "Check flight status before departure."
        )

    # -----------------------------------------------------
    # TWO WHEELER
    # -----------------------------------------------------

    elif transport == "two_wheeler":

        if rain_probability >= 40:

            advice.append(
                "Rain is possible. Carry suitable rain protection before riding."
            )

        if wind_speed >= 30:

            advice.append(
                "Strong winds detected. Exercise caution while riding."
            )

        if visibility < 2000:

            advice.append(
                "Reduced visibility detected. Ride carefully."
            )

    return advice


# =========================================================
# PACKING SUGGESTIONS
# =========================================================

def get_packing_suggestions(
    temperature,
    rain_probability,
    wind_speed
):

    packing = []

    temperature = temperature or 0
    rain_probability = rain_probability or 0
    wind_speed = wind_speed or 0

    if rain_probability >= 40:

        packing.append(
            "Rain protection"
        )

    if temperature >= 30:

        packing.append(
            "Drinking water"
        )

    if temperature >= 35:

        packing.append(
            "Sun protection"
        )

    if wind_speed >= 30:

        packing.append(
            "Wind-resistant outer layer"
        )

    if not packing:

        packing.append(
            "Basic travel essentials"
        )

    return packing


# =========================================================
# TRAVELER SUMMARY
# =========================================================

def create_traveler_summary(
    destination,
    duration_days,
    transport,
    departure_date=None,
    departure_time=None
):

    return {

        "destination": destination,

        "duration_days": duration_days,

        "transport": get_transport_name(
            transport
        ),

        "departure_date": departure_date,

        "departure_time": departure_time

    }


# =========================================================
# MULTI-DAY TRAVEL PLAN
# =========================================================

def generate_travel_plan(
    weather_data,
    days,
    transport,
    departure_date=None
):

    daily = weather_data["daily"]

    dates = daily["time"]

    max_temperatures = daily["max_temperature"]

    min_temperatures = daily["min_temperature"]

    rain_probabilities = daily["rain_probability"]

    travel_days = []

    days = min(
        days,
        len(dates)
    )

    # -----------------------------------------------------
    # FIND START DATE
    # -----------------------------------------------------

    start_index = 0

    if departure_date:

        for i, date_value in enumerate(dates):

            if date_value == departure_date:

                start_index = i
                break

    # -----------------------------------------------------
    # GENERATE PLAN
    # -----------------------------------------------------

    for day_number in range(days):

        index = start_index + day_number

        if index >= len(dates):
            break

        temperature_max = max_temperatures[index]

        temperature_min = min_temperatures[index]

        rain_probability = rain_probabilities[index]

        day_advice = []

        # -------------------------------------------------
        # RAIN
        # -------------------------------------------------

        if rain_probability >= 70:

            day_advice.append(
                "High chance of rain. Carry rain protection and plan outdoor activities carefully."
            )

        elif rain_probability >= 40:

            day_advice.append(
                "Rain is possible. Keep rain protection ready."
            )

        else:

            day_advice.append(
                "Low chance of rain. Outdoor travel is generally manageable."
            )

        # -------------------------------------------------
        # TEMPERATURE
        # -------------------------------------------------

        if temperature_max >= 35:

            day_advice.append(
                "Hot conditions expected. Carry sufficient drinking water and sun protection."
            )

        elif temperature_max >= 30:

            day_advice.append(
                "Warm conditions expected. Stay hydrated during outdoor activities."
            )

        # -------------------------------------------------
        # TRANSPORT
        # -------------------------------------------------

        if transport == "car":

            if rain_probability >= 60:

                day_advice.append(
                    "Allow additional road-travel time because of possible rain."
                )

        elif transport == "bus":

            if rain_probability >= 60:

                day_advice.append(
                    "Rain may affect road travel. Allow additional travel time."
                )

        elif transport == "train":

            day_advice.append(
                "Check train travel status before departure."
            )

        elif transport == "flight":

            day_advice.append(
                "Check flight status before departure."
            )

        elif transport == "two_wheeler":

            if rain_probability >= 40:

                day_advice.append(
                    "Rain is possible. Consider suitable rain protection before riding."
                )

        travel_days.append({

            "day": day_number + 1,

            "date": dates[index],

            "weather": {

                "temperature": {

                    "min": temperature_min,

                    "max": temperature_max

                },

                "rain_probability": rain_probability

            },

            "advice": day_advice

        })

    return travel_days