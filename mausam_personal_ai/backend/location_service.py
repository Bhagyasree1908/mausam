import pandas as pd

LOCATIONS_FILE = "data/locations.csv"


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