import pandas as pd


PROFILES_FILE = "data/profiles.csv"


# =========================================================
# LOAD PROFILES
# =========================================================

def load_profiles():

    return pd.read_csv(PROFILES_FILE)


# =========================================================
# GET SINGLE PROFILE
# =========================================================

def get_profile(profile_id):

    df = load_profiles()

    result = df[
        df["profile"].str.lower() == profile_id.lower()
    ]

    if result.empty:
        return None

    profile = result.iloc[0]

    priorities = []

    for column in [
        "priority_1",
        "priority_2",
        "priority_3",
        "priority_4"
    ]:

        value = profile[column]

        if pd.notna(value):
            priorities.append(value)

    return {

        "profile": profile["profile"],

        "name": profile["name"],

        "priorities": priorities

    }


# =========================================================
# GET ALL PROFILES
# =========================================================

def get_profiles():

    df = load_profiles()

    profiles = []

    for _, row in df.iterrows():

        profiles.append({

            "id": row["profile"],

            "name": row["name"]

        })

    return profiles