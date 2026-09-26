from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.translation_service import translate_response
from typing import Optional
import os

from backend.location_service import (
    get_location,
    get_states,
    get_districts
)

from backend.profile_service import (
    get_profile,
    get_profiles
)

from backend.weather_service import (
    get_weather
)

from backend.air_quality_service import (
    get_air_quality
)

from backend.marine_service import (
    get_marine
)

from backend.personalization_service import (
    personalize_weather
)

from backend.rule_engine import (
    evaluate_rules
)

from backend.safety_service import (
    apply_safety_override
)

from backend.day_plan_service import (
    generate_day_plan
)

from backend.traveler_service import (
    generate_travel_plan,
    get_travel_advice,
    get_packing_suggestions,
    create_traveler_summary,
    get_departure_weather
)


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="Mausam PersonalAI",
    description="Personalized Weather Intelligence Platform",
    version="1.0.0"
)


# =========================================================
# FRONTEND PATH
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

FRONTEND_DIR = os.path.join(
    BASE_DIR,
    "frontend"
)


# =========================================================
# STATIC FILES
# =========================================================

app.mount(
    "/static",
    StaticFiles(directory=FRONTEND_DIR),
    name="static"
)


# =========================================================
# ROOT → FRONTEND
# =========================================================

@app.get("/")
def root():

    return FileResponse(
        os.path.join(
            FRONTEND_DIR,
            "index.html"
        )
    )


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# =========================================================
# WEATHER
# =========================================================

@app.get("/weather")
def weather(
    state: str,
    district: str
):

    location = get_location(
        state,
        district
    )

    if location is None:

        raise HTTPException(
            status_code=404,
            detail="Location not found"
        )

    weather_data = get_weather(
        location["latitude"],
        location["longitude"]
    )

    return {
        "location": location,
        "weather": weather_data
    }


# =========================================================
# STATES
# =========================================================

@app.get("/states")
def states():

    return {
        "states": get_states()
    }


# =========================================================
# DISTRICTS
# =========================================================

@app.get("/districts")
def districts(
    state: str
):

    return {
        "state": state,
        "districts": get_districts(state)
    }


# =========================================================
# LOCATION
# =========================================================

@app.get("/location")
def location(
    state: str,
    district: str
):

    location_data = get_location(
        state,
        district
    )

    if location_data is None:

        raise HTTPException(
            status_code=404,
            detail="Location not found"
        )

    return location_data


# =========================================================
# PROFILES
# =========================================================

@app.get("/profiles")
def profiles():

    return {
        "profiles": get_profiles()
    }


# =========================================================
# SINGLE PROFILE
# =========================================================

@app.get("/profile")
def profile(
    profile: str
):

    profile_data = get_profile(
        profile
    )

    if profile_data is None:

        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    return profile_data


# =========================================================
# PERSONALIZED HOMEPAGE
# =========================================================

@app.get("/personalized-homepage")
def personalized_homepage(

    state: str,
    district: str,
    profile: str,
    language: str = "en",

    destination_state: Optional[str] = None,
    destination_district: Optional[str] = None,
    transport: Optional[str] = None,
    days: Optional[int] = None,

    departure_date: Optional[str] = None,
    departure_time: Optional[str] = None
):

    # =====================================================
    # 1. ORIGIN LOCATION
    # =====================================================

    origin_location = get_location(
        state,
        district
    )

    if origin_location is None:

        raise HTTPException(
            status_code=404,
            detail="Origin location not found"
        )


    # =====================================================
    # 2. PROFILE
    # =====================================================

    profile_data = get_profile(
        profile
    )

    if profile_data is None:

        raise HTTPException(
            status_code=404,
            detail="Invalid profile"
        )


    profile_id = profile.lower().strip()


    # =====================================================
    # 3. ORIGIN WEATHER
    # =====================================================

    weather_data = get_weather(
        origin_location["latitude"],
        origin_location["longitude"]
    )


    # =====================================================
    # 4. AIR QUALITY
    # =====================================================

    air_quality_data = None

    if profile_id == "health":

        air_quality_data = get_air_quality(
            origin_location["latitude"],
            origin_location["longitude"]
        )


    # =====================================================
    # 5. MARINE DATA
    # =====================================================

    marine_data = None

    if profile_id == "beach":

        marine_data = get_marine(
            origin_location["latitude"],
            origin_location["longitude"]
        )


    # =====================================================
    # 6. PERSONALIZATION
    # =====================================================

    personalized_data = personalize_weather(
        profile_data,
        weather_data,
        air_quality_data,
        marine_data
    )


    # =====================================================
    # 7. RULE ENGINE
    # =====================================================

    rule_result = evaluate_rules(
        profile_id,
        weather_data,
        air_quality_data
    )


    # =====================================================
    # 8. SAFETY OVERRIDE
    # =====================================================

    safety_result = apply_safety_override(
        weather_data,
        rule_result["recommendations"]
    )


    # =====================================================
    # 9. COMPLETE DAY PLAN
    # =====================================================

    day_plan = generate_day_plan(
        profile_id,
        weather_data
    )


    # =====================================================
    # 10. HOMEPAGE INFORMATION
    # =====================================================

    homepage_information = {

        "health": {
            "title": "Health Weather",
            "focus": [
                "Air Quality",
                "UV",
                "Humidity",
                "Temperature"
            ]
        },

        "fitness": {
            "title": "Fitness Weather",
            "focus": [
                "Rain",
                "Wind",
                "UV",
                "Sunrise/Sunset"
            ]
        },

        "beach": {
            "title": "Beach Weather",
            "focus": [
                "Waves",
                "Tide",
                "Sea Temperature",
                "Wind"
            ]
        },

        "traveler": {
            "title": "Travel Weather",
            "focus": [
                "Forecast",
                "Rain",
                "Temperature",
                "Travel Conditions",
                "Departure Time"
            ]
        },

        "family": {
            "title": "Family Weather",
            "focus": [
                "Rain",
                "Temperature",
                "Visibility",
                "Warnings"
            ]
        },

        "agriculture": {
            "title": "Agriculture Weather",
            "focus": [
                "Rainfall",
                "Soil Moisture",
                "Temperature",
                "Frost"
            ]
        },

        "commuter": {
            "title": "Commute Weather",
            "focus": [
                "Rain",
                "Visibility",
                "Wind",
                "Warnings"
            ]
        },

        "event": {
            "title": "Event Weather",
            "focus": [
                "Rain Probability",
                "Temperature",
                "Humidity",
                "Wind"
            ]
        }
    }


    homepage = homepage_information.get(
        profile_id,
        {
            "title": "Weather",
            "focus": []
        }
    )


    # =====================================================
    # 11. TRAVELER PROCESSING
    # =====================================================

    traveler_data = None

    if profile_id == "traveler":

        # -------------------------------------------------
        # REQUIRED FIELDS
        # -------------------------------------------------

        if not destination_state:
            raise HTTPException(
                status_code=400,
                detail="Destination state is required for Traveler profile."
            )

        if not destination_district:
            raise HTTPException(
                status_code=400,
                detail="Destination district is required for Traveler profile."
            )

        if not transport:
            raise HTTPException(
                status_code=400,
                detail="Transport mode is required for Traveler profile."
            )

        if days is None:
            raise HTTPException(
                status_code=400,
                detail="Trip days are required for Traveler profile."
            )

        if days < 1 or days > 7:
            raise HTTPException(
                status_code=400,
                detail="Trip days must be between 1 and 7."
            )

        if not departure_date:
            raise HTTPException(
                status_code=400,
                detail="Departure date is required for Traveler profile."
            )

        if not departure_time:
            raise HTTPException(
                status_code=400,
                detail="Departure time is required for Traveler profile."
            )


        # -------------------------------------------------
        # TRANSPORT
        # -------------------------------------------------

        transport = transport.lower().strip()

        # Accept the values used by your HTML
        transport_aliases = {
            "bike": "two_wheeler",
            "two-wheeler": "two_wheeler",
            "two_wheeler": "two_wheeler"
        }

        transport = transport_aliases.get(
            transport,
            transport
        )

        allowed_transport = [
            "car",
            "bus",
            "train",
            "flight",
            "two_wheeler"
        ]

        if transport not in allowed_transport:

            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Invalid transport mode.",
                    "allowed_transport": allowed_transport
                }
            )


        # -------------------------------------------------
        # DESTINATION
        # -------------------------------------------------

        destination_location = get_location(
            destination_state,
            destination_district
        )

        if destination_location is None:

            raise HTTPException(
                status_code=404,
                detail="Destination location not found."
            )


        # -------------------------------------------------
        # DESTINATION WEATHER
        # -------------------------------------------------

        destination_weather = get_weather(
            destination_location["latitude"],
            destination_location["longitude"]
        )


        # -------------------------------------------------
        # DEPARTURE WEATHER
        # -------------------------------------------------

        try:

            departure_weather = get_departure_weather(
                destination_weather,
                departure_date,
                departure_time
            )

        except ValueError as e:

            raise HTTPException(
                status_code=400,
                detail=str(e)
            )


        departure_temperature = departure_weather.get(
            "temperature"
        )

        departure_rain_probability = departure_weather.get(
            "rain_probability"
        )

        departure_wind_speed = departure_weather.get(
            "wind_speed"
        )

        departure_visibility = departure_weather.get(
            "visibility"
        )


        # -------------------------------------------------
        # TRAVEL ADVICE
        # -------------------------------------------------

        travel_advice = get_travel_advice(

            transport,

            departure_temperature,

            departure_rain_probability,

            departure_wind_speed,

            departure_visibility

        )


        # -------------------------------------------------
        # DAILY DATA
        # -------------------------------------------------

        daily = destination_weather["daily"]

        daily_dates = daily["time"]

        daily_temperatures = daily["max_temperature"]

        daily_rain_probabilities = daily[
            "rain_probability"
        ]


        if departure_date not in daily_dates:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Selected departure date is outside "
                    "the available weather forecast range."
                )
            )


        departure_day_index = daily_dates.index(
            departure_date
        )


        available_days = (
            len(daily_dates) -
            departure_day_index
        )


        if days > available_days:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Only {available_days} forecast day(s) "
                    f"are available from the selected "
                    f"departure date."
                )
            )


        # -------------------------------------------------
        # SELECT TRIP DAYS
        # -------------------------------------------------

        selected_max_temperatures = (
            daily_temperatures[
                departure_day_index:
                departure_day_index + days
            ]
        )

        selected_rain_probabilities = (
            daily_rain_probabilities[
                departure_day_index:
                departure_day_index + days
            ]
        )


        # -------------------------------------------------
        # PACKING
        # -------------------------------------------------

        max_temperature = max(
            selected_max_temperatures
        )

        max_rain_probability = max(
            selected_rain_probabilities
        )

        wind_for_packing = (
            departure_wind_speed
            if departure_wind_speed is not None
            else 0
        )

        packing_suggestions = get_packing_suggestions(
            max_temperature,
            max_rain_probability,
            wind_for_packing
        )


        # -------------------------------------------------
        # SUMMARY
        # -------------------------------------------------

        traveler_summary = create_traveler_summary(
            destination_location["district"],
            days,
            transport,
            departure_date,
            departure_time
        )


        # -------------------------------------------------
        # TRAVEL PLAN
        # -------------------------------------------------

        try:

            travel_plan = generate_travel_plan(
                destination_weather,
                days,
                transport,
                departure_date
            )

        except ValueError as e:

            raise HTTPException(
                status_code=400,
                detail=str(e)
            )


        # -------------------------------------------------
        # FINAL TRAVELER DATA
        # -------------------------------------------------

        traveler_data = {

            "status": "success",

            "origin": {
                "state": origin_location["state"],
                "district": origin_location["district"],
                "latitude": origin_location["latitude"],
                "longitude": origin_location["longitude"]
            },

            "destination": {
                "state": destination_location["state"],
                "district": destination_location["district"],
                "latitude": destination_location["latitude"],
                "longitude": destination_location["longitude"]
            },

            "transport": transport,

            "trip_days": days,

            "departure": {
                "date": departure_date,
                "time": departure_time
            },

            "departure_weather": departure_weather,

            "destination_weather": {
                "temperature": departure_temperature,
                "rain_probability": departure_rain_probability,
                "wind_speed": departure_wind_speed,
                "visibility": departure_visibility
            },

            "travel_advice": travel_advice,

            "packing_suggestions": packing_suggestions,

            "summary": traveler_summary,

            "travel_plan": travel_plan
        }


    # =====================================================
    # FINAL RESPONSE
    # =====================================================

        # ========================================================
    # FINAL RESPONSE
    # ========================================================

    response = {
        "profile": profile_id,
        "profile_name": profile_data["name"],
        "location": location,
        "personalized": personalized_data,
        "rules": rule_result,
        "safety": safety_result,
        "day_plan": day_plan,
        "homepage": homepage_information
    }

    if profile_id == "health" and air_quality_data:
        response["air_quality"] = air_quality_data

    if profile_id == "beach" and marine_data:
        response["marine"] = marine_data

    if profile_id == "traveler":
        response["traveler"] = traveler_data

    # ========================================================
    # TRANSLATION
    # ========================================================

    try:
        return translate_response(
            response,
            language
        )
    except Exception as e:
        print("TRANSLATION ERROR:", repr(e))
        return response

# =========================================================
# RECOMMENDATIONS
# =========================================================

@app.get("/recommendations")
def recommendations(
    state: str,
    district: str,
    profile: str
):

    location_data = get_location(
        state,
        district
    )

    if location_data is None:

        raise HTTPException(
            status_code=404,
            detail="Location not found"
        )

    profile_data = get_profile(
        profile
    )

    if profile_data is None:

        raise HTTPException(
            status_code=404,
            detail="Invalid profile"
        )

    weather_data = get_weather(
        location_data["latitude"],
        location_data["longitude"]
    )

    air_quality_data = None

    if profile.lower() == "health":

        air_quality_data = get_air_quality(
            location_data["latitude"],
            location_data["longitude"]
        )

    return evaluate_rules(
        profile,
        weather_data,
        air_quality_data
    )


# =========================================================
# DAY PLAN
# =========================================================

@app.get("/day-plan")
def day_plan(
    state: str,
    district: str,
    profile: str
):

    location_data = get_location(
        state,
        district
    )

    if location_data is None:

        raise HTTPException(
            status_code=404,
            detail="Location not found"
        )

    profile_data = get_profile(
        profile
    )

    if profile_data is None:

        raise HTTPException(
            status_code=404,
            detail="Invalid profile"
        )

    weather_data = get_weather(
        location_data["latitude"],
        location_data["longitude"]
    )

    return generate_day_plan(
        profile,
        weather_data
    )


# =========================================================
# MARINE
# =========================================================

@app.get("/marine")
def marine(
    state: str,
    district: str
):

    location_data = get_location(
        state,
        district
    )

    if location_data is None:

        raise HTTPException(
            status_code=404,
            detail="Location not found"
        )

    marine_data = get_marine(
        location_data["latitude"],
        location_data["longitude"]
    )

    return {
        "location": location_data,
        "marine": marine_data
    }


# =========================================================
# TRAVELER PLAN
# =========================================================

@app.get("/traveler-plan")
def traveler_plan(

    origin_state: str,
    origin_district: str,

    destination_state: str,
    destination_district: str,

    transport: str,
    days: int,

    departure_date: str,
    departure_time: str

):

    origin_location = get_location(
        origin_state,
        origin_district
    )

    if origin_location is None:

        raise HTTPException(
            status_code=404,
            detail="Origin location not found."
        )


    destination_location = get_location(
        destination_state,
        destination_district
    )

    if destination_location is None:

        raise HTTPException(
            status_code=404,
            detail="Destination location not found."
        )


    transport = transport.lower().strip()

    transport_aliases = {
        "bike": "two_wheeler",
        "two-wheeler": "two_wheeler"
    }

    transport = transport_aliases.get(
        transport,
        transport
    )

    allowed_transport = [
        "car",
        "bus",
        "train",
        "flight",
        "two_wheeler"
    ]

    if transport not in allowed_transport:

        raise HTTPException(
            status_code=400,
            detail={
                "message": "Invalid transport mode.",
                "allowed_transport": allowed_transport
            }
        )


    if days < 1 or days > 7:

        raise HTTPException(
            status_code=400,
            detail="Trip days must be between 1 and 7."
        )


    destination_weather = get_weather(
        destination_location["latitude"],
        destination_location["longitude"]
    )


    try:

        departure_weather = get_departure_weather(
            destination_weather,
            departure_date,
            departure_time
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


    travel_advice = get_travel_advice(

        transport,

        departure_weather["temperature"],

        departure_weather["rain_probability"],

        departure_weather["wind_speed"],

        departure_weather["visibility"]

    )


    try:

        plan = generate_travel_plan(
            destination_weather,
            days,
            transport,
            departure_date
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


    return {

        "origin": origin_location,

        "destination": destination_location,

        "transport": transport,

        "days": days,

        "departure": {
            "date": departure_date,
            "time": departure_time
        },

        "departure_weather": departure_weather,

        "travel_advice": travel_advice,

        "plan": plan

    }


# =========================================================
# BEACH PLAN
# =========================================================

@app.get("/beach-plan")
def beach_plan(
    state: str,
    district: str
):

    location_data = get_location(
        state,
        district
    )

    if location_data is None:

        raise HTTPException(
            status_code=404,
            detail="Location not found."
        )

    weather_data = get_weather(
        location_data["latitude"],
        location_data["longitude"]
    )

    marine_data = get_marine(
        location_data["latitude"],
        location_data["longitude"]
    )

    return {

        "location": location_data,

        "weather": weather_data,

        "marine": marine_data

    }


# =========================================================
# FAMILY PLAN
# =========================================================

@app.get("/family-plan")
def family_plan(
    state: str,
    district: str
):

    location_data = get_location(
        state,
        district
    )

    if location_data is None:

        raise HTTPException(
            status_code=404,
            detail="Location not found."
        )

    weather_data = get_weather(
        location_data["latitude"],
        location_data["longitude"]
    )

    recommendations = evaluate_rules(
        "family",
        weather_data,
        None
    )

    day_plan_data = generate_day_plan(
        "family",
        weather_data
    )

    return {

        "location": location_data,

        "recommendations": recommendations,

        "day_plan": day_plan_data

    }


# =========================================================
# COMMUTER PLAN
# =========================================================

@app.get("/commuter-plan")
def commuter_plan(
    state: str,
    district: str
):

    location_data = get_location(
        state,
        district
    )

    if location_data is None:

        raise HTTPException(
            status_code=404,
            detail="Location not found."
        )

    weather_data = get_weather(
        location_data["latitude"],
        location_data["longitude"]
    )

    recommendations = evaluate_rules(
        "commuter",
        weather_data,
        None
    )

    day_plan_data = generate_day_plan(
        "commuter",
        weather_data
    )

    return {

        "location": location_data,

        "recommendations": recommendations,

        "day_plan": day_plan_data

    }


# =========================================================
# EVENT PLAN
# =========================================================

@app.get("/event-plan")
def event_plan(
    state: str,
    district: str
):

    location_data = get_location(
        state,
        district
    )

    if location_data is None:

        raise HTTPException(
            status_code=404,
            detail="Location not found."
        )

    weather_data = get_weather(
        location_data["latitude"],
        location_data["longitude"]
    )

    recommendations = evaluate_rules(
        "event",
        weather_data,
        None
    )

    day_plan_data = generate_day_plan(
        "event",
        weather_data
    )

    return {

        "location": location_data,

        "recommendations": recommendations,

        "day_plan": day_plan_data

    }