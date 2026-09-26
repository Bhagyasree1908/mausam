# backend/homepage_service.py


def get_profile_summary(profile_id):
    summaries = {

        "health": {
            "title": "Health Weather",
            "focus": [
                "Air quality",
                "UV exposure",
                "Humidity",
                "Temperature"
            ]
        },

        "fitness": {
            "title": "Outdoor Fitness",
            "focus": [
                "Rain",
                "Wind",
                "UV",
                "Temperature"
            ]
        },

        "beach": {
            "title": "Beach & Surf Conditions",
            "focus": [
                "Wave conditions",
                "Rain",
                "Wind",
                "Sea temperature"
            ]
        },

        "traveler": {
            "title": "Travel Weather",
            "focus": [
                "Forecast",
                "Rain",
                "Temperature",
                "Travel conditions"
            ]
        },

        "family": {
            "title": "Family Weather",
            "focus": [
                "Rain",
                "Temperature",
                "Visibility",
                "Outdoor safety"
            ]
        },

        "agriculture": {
            "title": "Agriculture & Garden",
            "focus": [
                "Rainfall",
                "Soil moisture",
                "Temperature",
                "Frost"
            ]
        },

        "commuter": {
            "title": "Commuter Weather",
            "focus": [
                "Rain",
                "Visibility",
                "Wind",
                "Travel conditions"
            ]
        },

        "event": {
            "title": "Event Planning Weather",
            "focus": [
                "Rain probability",
                "Temperature",
                "Humidity",
                "Wind"
            ]
        }
    }

    return summaries.get(
        profile_id,
        {
            "title": "Personalized Weather",
            "focus": []
        }
    )