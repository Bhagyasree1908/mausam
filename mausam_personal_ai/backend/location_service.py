import pandas as pd
import requests

LOCATIONS_FILE = "data/locations.csv"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse"


def load_locations():
    return pd.read_csv(LOCATIONS_FILE)


def get_location(state, district):
    df = load_locations()
    result = df[
        (df["state"].str.lower() == state.lower()) &
        (df["district"].str.lower() == district.lower())
    ]

    if result.empty:
        return None

    location = result.iloc[0]

    return {
        "state": location["state"],
        "district": location["district"],
        "latitude": float(location["latitude"]),
        "longitude": float(location["longitude"])
    }


def get_states():
    df = load_locations()
    return sorted(df["state"].unique().tolist())


def get_districts(state):
    df = load_locations()
    result = df[
        df["state"].str.lower() == state.lower()
    ]
    return sorted(result["district"].tolist())


def _first_non_empty(*values):
    for value in values:
        if value is not None and str(value).strip():
            return str(value).strip()
    return None


def reverse_geocode(latitude, longitude):
    """
    Convert GPS coordinates into a human-readable Indian location.

    Nominatim's reverse endpoint returns address components such as
    city/county/state. We normalize those into the fields Mausam needs.
    """

    params = {
        "lat": latitude,
        "lon": longitude,
        "format": "jsonv2",
        "addressdetails": 1,
        "zoom": 10,
        "accept-language": "en"
    }

    headers = {
        "User-Agent": "Mausam-PersonalAI/1.0"
    }

    response = requests.get(
        NOMINATIM_URL,
        params=params,
        headers=headers,
        timeout=10
    )

    response.raise_for_status()
    data = response.json()
    address = data.get("address", {}) or {}

    state = _first_non_empty(
        address.get("state"),
        address.get("state_district")
    )

    district = _first_non_empty(
        address.get("county"),
        address.get("district"),
        address.get("city_district"),
        address.get("city"),
        address.get("town"),
        address.get("municipality"),
        address.get("village")
    )

    city = _first_non_empty(
        address.get("city"),
        address.get("town"),
        address.get("municipality"),
        address.get("village"),
        address.get("suburb")
    )

    return {
        "latitude": float(latitude),
        "longitude": float(longitude),
        "name": city or district or state or "Current Location",
        "city": city,
        "district": district,
        "state": state,
        "country": address.get("country"),
        "country_code": address.get("country_code"),
        "display_name": data.get("display_name")
    }
