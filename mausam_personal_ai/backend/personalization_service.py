def personalize_weather(
    profile_data,
    weather_data,
    air_quality_data=None,
    marine_data=None
):

    # ---------------------------------------------------------
    # VALIDATE PROFILE
    # ---------------------------------------------------------

    if profile_data is None:
        return {
            "error": "Invalid profile"
        }


    # ---------------------------------------------------------
    # GET PROFILE + WEATHER DATA
    # ---------------------------------------------------------

    priorities = profile_data["priorities"]

    current = weather_data["current"]

    hourly = weather_data["hourly"]

    daily = weather_data["daily"]


    # ---------------------------------------------------------
    # INITIAL PERSONALIZED RESPONSE
    # ---------------------------------------------------------

    personalized = {
        "profile": profile_data["profile"],
        "profile_name": profile_data["name"],
        "priorities": priorities,
        "current": {},
        "hourly": {},
        "daily": {}
    }


    # ---------------------------------------------------------
    # CURRENT WEATHER
    # ---------------------------------------------------------

    current_mapping = {

        "temperature":
            current.get("temperature"),

        "humidity":
            current.get("humidity"),

        "feels_like":
            current.get("feels_like"),

        "rain":
            current.get("rain"),

        "precipitation":
            current.get("precipitation"),

        "wind_speed":
            current.get("wind_speed"),

        "wind":
            current.get("wind_speed"),

        "wind_direction":
            current.get("wind_direction"),

        "weather_code":
            current.get("weather_code"),

        "uv": (
            hourly["uv"][0]
            if hourly.get("uv")
            else None
        )
    }


    # ---------------------------------------------------------
    # ADD ALL AVAILABLE CURRENT WEATHER VALUES
    # ---------------------------------------------------------

    for key, value in current_mapping.items():

        if value is not None:

            personalized["current"][key] = value


    # ---------------------------------------------------------
    # HOURLY WEATHER
    # ---------------------------------------------------------

    personalized["hourly"] = {

        "time":
            hourly.get("time", []),

        "temperature":
            hourly.get("temperature", []),

        "rain_probability":
            hourly.get("rain_probability", []),

        "precipitation":
            hourly.get("precipitation", []),

        "visibility":
            hourly.get("visibility", []),

        "uv":
            hourly.get("uv", []),

        "soil_moisture":
            hourly.get("soil_moisture", []),

        "soil_temperature":
            hourly.get("soil_temperature", [])

    }


    # ---------------------------------------------------------
    # DAILY WEATHER
    # ---------------------------------------------------------

    personalized["daily"] = {

        "time":
            daily.get("time", []),

        "max_temperature":
            daily.get("max_temperature", []),

        "min_temperature":
            daily.get("min_temperature", []),

        "rain_probability":
            daily.get("rain_probability", []),

        "sunrise":
            daily.get("sunrise", []),

        "sunset":
            daily.get("sunset", []),

        "weather_code":
            daily.get("weather_code", [])

    }


    # ---------------------------------------------------------
    # AIR QUALITY DATA
    # ---------------------------------------------------------

    if (
        profile_data["profile"] == "health"
        and air_quality_data
    ):

        air_current = (
            air_quality_data.get(
                "current",
                {}
            )
        )


        personalized["air_quality"] = {

            "pm10":
                air_current.get("pm10"),

            "pm2_5":
                air_current.get("pm2_5"),

            "carbon_monoxide":
                air_current.get("carbon_monoxide"),

            "nitrogen_dioxide":
                air_current.get("nitrogen_dioxide"),

            "sulphur_dioxide":
                air_current.get("sulphur_dioxide"),

            "ozone":
                air_current.get("ozone"),

            "us_aqi":
                air_current.get("us_aqi"),

            "aqi_level":
                air_current.get("aqi_level")

        }


    # ---------------------------------------------------------
    # MARINE DATA
    # ---------------------------------------------------------

    if (
        profile_data["profile"] == "beach"
        and marine_data
    ):

        marine_current = (
            marine_data.get(
                "current",
                {}
            )
        )


        marine_next_hours = (
            marine_data.get(
                "next_hours",
                []
            )
        )


        personalized["marine"] = {

            "current": {

                "wave_height":
                    marine_current.get(
                        "wave_height"
                    ),

                "wave_direction":
                    marine_current.get(
                        "wave_direction"
                    ),

                "wave_period":
                    marine_current.get(
                        "wave_period"
                    ),

                "wind_wave_height":
                    marine_current.get(
                        "wind_wave_height"
                    ),

                "swell_wave_height":
                    marine_current.get(
                        "swell_wave_height"
                    ),

                "sea_surface_temperature":
                    marine_current.get(
                        "sea_surface_temperature"
                    )

            },


            "next_hours":
                marine_next_hours,


            "tide":
                marine_data.get(
                    "tide",
                    {
                        "available": False,
                        "message":
                            "Tide timings are not provided by the current data source."
                    }
                )
        }


    # ---------------------------------------------------------
    # RETURN FINAL PERSONALIZED DATA
    # ---------------------------------------------------------

    return personalized