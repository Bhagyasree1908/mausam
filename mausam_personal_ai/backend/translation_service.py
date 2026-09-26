from functools import lru_cache
from deep_translator import GoogleTranslator


# ============================================================
# SUPPORTED LANGUAGES
# ============================================================

SUPPORTED_LANGUAGES = {
    "en": "English",
    "ta": "Tamil",
    "hi": "Hindi",
    "te": "Telugu",
    "ml": "Malayalam"
}


# ============================================================
# PROTECTED KEYS
# These values must NEVER be translated
# ============================================================

PROTECTED_KEYS = {
    "id",
    "latitude",
    "longitude",

    "temperature",
    "humidity",
    "feels_like",

    "rain",
    "precipitation",
    "wind",
    "wind_speed",
    "wind_direction",

    "weather_code",

    "visibility",
    "uv",

    "pm10",
    "pm2_5",
    "carbon_monoxide",
    "nitrogen_dioxide",
    "sulphur_dioxide",
    "ozone",
    "us_aqi",

    "wave_height",
    "wave_direction",
    "wave_period",
    "wind_wave_height",
    "swell_wave_height",
    "sea_surface_temperature",

    "duration_days",
    "days",

    "time",
    "date",
    "departure_date",
    "departure_time",

    "trip_days",

    "min",
    "max",
    "rain_probability",

    "state",
    "district",
    "destination_state",
    "destination_district"
}


# ============================================================
# LOCATION KEYS
# ============================================================

LOCATION_KEYS = {
    "state",
    "district",
    "destination_state",
    "destination_district"
}


# ============================================================
# LOCAL STATIC TRANSLATIONS
#
# These avoid GoogleTranslator requests for common UI/profile
# and weather words.
# ============================================================

STATIC_TRANSLATIONS = {

    # --------------------------------------------------------
    # PROFILE NAMES
    # --------------------------------------------------------

    "Outdoor Fitness": {
        "ta": "வெளிப்புற உடற்பயிற்சி",
        "hi": "आउटडोर फिटनेस",
        "te": "బయటి ఫిట్‌నెస్",
        "ml": "ഔട്ട്ഡോർ ഫിറ്റ്നസ്"
    },

    "Health-conscious": {
        "ta": "உடல்நல அக்கறையுள்ளவர்",
        "hi": "स्वास्थ्य के प्रति जागरूक",
        "te": "ఆరోగ్యంపై శ్రద్ధ ఉన్నవారు",
        "ml": "ആരോഗ്യ ബോധമുള്ളവർ"
    },

    "Beach & Surfer": {
        "ta": "கடற்கரை மற்றும் சர்ஃபர்",
        "hi": "बीच और सर्फर",
        "te": "బీచ్ మరియు సర్ఫర్",
        "ml": "ബീച്ചും സർഫറും"
    },

    "Traveler": {
        "ta": "பயணி",
        "hi": "यात्री",
        "te": "ప్రయాణికుడు",
        "ml": "യാത്രികൻ"
    },

    "Parents & Families": {
        "ta": "பெற்றோர் மற்றும் குடும்பங்கள்",
        "hi": "माता-पिता और परिवार",
        "te": "తల్లిదండ్రులు మరియు కుటుంబాలు",
        "ml": "മാതാപിതാക്കളും കുടുംബങ്ങളും"
    },

    "Agriculture & Garden": {
        "ta": "விவசாயம் மற்றும் தோட்டம்",
        "hi": "कृषि और बागवानी",
        "te": "వ్యవసాయం మరియు తోట",
        "ml": "കൃഷിയും തോട്ടവും"
    },

    "Commuter": {
        "ta": "தினசரி பயணி",
        "hi": "दैनिक यात्री",
        "te": "రోజువారీ ప్రయాణికుడు",
        "ml": "ദൈനംദിന യാത്രികൻ"
    },

    "Event Planner": {
        "ta": "நிகழ்ச்சி திட்டமிடுபவர்",
        "hi": "कार्यक्रम आयोजक",
        "te": "ఈవెంట్ ప్లానర్",
        "ml": "ഇവന്റ് പ്ലാനർ"
    },


    # --------------------------------------------------------
    # GENERAL WEATHER TERMS
    # --------------------------------------------------------

    "Weather": {
        "ta": "வானிலை",
        "hi": "मौसम",
        "te": "వాతావరణం",
        "ml": "കാലാവസ്ഥ"
    },

    "Weather Forecast": {
        "ta": "வானிலை முன்னறிவிப்பு",
        "hi": "मौसम पूर्वानुमान",
        "te": "వాతావరణ అంచనా",
        "ml": "കാലാവസ്ഥാ പ്രവചനം"
    },

    "Current Weather": {
        "ta": "தற்போதைய வானிலை",
        "hi": "वर्तमान मौसम",
        "te": "ప్రస్తుత వాతావరణం",
        "ml": "നിലവിലെ കാലാവസ്ഥ"
    },

    "Forecast": {
        "ta": "முன்னறிவிப்பு",
        "hi": "पूर्वानुमान",
        "te": "అంచనా",
        "ml": "പ്രവചനം"
    },

    "Temperature": {
        "ta": "வெப்பநிலை",
        "hi": "तापमान",
        "te": "ఉష్ణోగ్రత",
        "ml": "താപനില"
    },

    "Humidity": {
        "ta": "ஈரப்பதம்",
        "hi": "आर्द्रता",
        "te": "తేమ",
        "ml": "ഈർപ്പം"
    },

    "Rain": {
        "ta": "மழை",
        "hi": "बारिश",
        "te": "వర్షం",
        "ml": "മഴ"
    },

    "Rain Probability": {
        "ta": "மழை வாய்ப்பு",
        "hi": "बारिश की संभावना",
        "te": "వర్షం అవకాశం",
        "ml": "മഴയ്ക്കുള്ള സാധ്യത"
    },

    "Wind": {
        "ta": "காற்று",
        "hi": "हवा",
        "te": "గాలి",
        "ml": "കാറ്റ്"
    },

    "Wind Speed": {
        "ta": "காற்றின் வேகம்",
        "hi": "हवा की गति",
        "te": "గాలి వేగం",
        "ml": "കാറ്റിന്റെ വേഗത"
    },

    "Visibility": {
        "ta": "பார்வைத்திறன்",
        "hi": "दृश्यता",
        "te": "దృశ్యమానత",
        "ml": "ദൃശ്യപരത"
    },

    "UV": {
        "ta": "UV அளவு",
        "hi": "UV स्तर",
        "te": "UV స్థాయి",
        "ml": "UV നില"
    },

    "Sunrise": {
        "ta": "சூரிய உதயம்",
        "hi": "सूर्योदय",
        "te": "సూర్యోదయం",
        "ml": "സൂര്യോദയം"
    },

    "Sunset": {
        "ta": "சூரிய அஸ்தமனம்",
        "hi": "सूर्यास्त",
        "te": "సూర్యాస్తమయం",
        "ml": "സൂര്യാസ്തമയം"
    },


    # --------------------------------------------------------
    # HEALTH
    # --------------------------------------------------------

    "Air Quality": {
        "ta": "காற்றின் தரம்",
        "hi": "वायु गुणवत्ता",
        "te": "గాలి నాణ్యత",
        "ml": "വായു ഗുണനിലവാരം"
    },

    "AQI": {
        "ta": "காற்றுத் தரக் குறியீடு",
        "hi": "वायु गुणवत्ता सूचकांक",
        "te": "గాలి నాణ్యత సూచిక",
        "ml": "വായു ഗുണനിലവാര സൂചിക"
    },

    "Good": {
        "ta": "நல்லது",
        "hi": "अच्छा",
        "te": "మంచిది",
        "ml": "നല്ലത്"
    },

    "Moderate": {
        "ta": "மிதமானது",
        "hi": "मध्यम",
        "te": "మితమైనది",
        "ml": "മിതമായത്"
    },

    "Unhealthy": {
        "ta": "ஆரோக்கியத்திற்கு பாதிப்பானது",
        "hi": "अस्वास्थ्यकर",
        "te": "అనారోగ్యకరమైనది",
        "ml": "അനാരോഗ്യകരം"
    },

    "PM2.5": {
        "ta": "PM2.5",
        "hi": "PM2.5",
        "te": "PM2.5",
        "ml": "PM2.5"
    },

    "PM10": {
        "ta": "PM10",
        "hi": "PM10",
        "te": "PM10",
        "ml": "PM10"
    },


    # --------------------------------------------------------
    # MARINE / BEACH
    # --------------------------------------------------------

    "Marine Weather": {
        "ta": "கடல் வானிலை",
        "hi": "समुद्री मौसम",
        "te": "సముద్ర వాతావరణం",
        "ml": "കടൽ കാലാവസ്ഥ"
    },

    "Wave Height": {
        "ta": "அலை உயரம்",
        "hi": "लहर की ऊंचाई",
        "te": "అలల ఎత్తు",
        "ml": "തിരമാല ഉയരം"
    },

    "Wave Direction": {
        "ta": "அலை திசை",
        "hi": "लहर की दिशा",
        "te": "అలల దిశ",
        "ml": "തിരമാല ദിശ"
    },

    "Wave Period": {
        "ta": "அலை கால இடைவெளி",
        "hi": "लहर अवधि",
        "te": "అలల కాల వ్యవధి",
        "ml": "തിരമാല കാലയളവ്"
    },

    "Sea Surface Temperature": {
        "ta": "கடல் மேற்பரப்பு வெப்பநிலை",
        "hi": "समुद्र सतह का तापमान",
        "te": "సముద్ర ఉపరితల ఉష్ణోగ్రత",
        "ml": "കടൽ ഉപരിതല താപനില"
    },

    "Tide": {
        "ta": "அலை ஏற்ற இறக்கம்",
        "hi": "ज्वार-भाटा",
        "te": "ఆటుపోట్లు",
        "ml": "വേലിയേറ്റവും വേലിയിറക്കവും"
    },


    # --------------------------------------------------------
    # SAFETY
    # --------------------------------------------------------

    "Safety": {
        "ta": "பாதுகாப்பு",
        "hi": "सुरक्षा",
        "te": "భద్రత",
        "ml": "സുരക്ഷ"
    },

    "Safety Alert": {
        "ta": "பாதுகாப்பு எச்சரிக்கை",
        "hi": "सुरक्षा चेतावनी",
        "te": "భద్రతా హెచ్చరిక",
        "ml": "സുരക്ഷാ മുന്നറിയിപ്പ്"
    },

    "Normal": {
        "ta": "இயல்பானது",
        "hi": "सामान्य",
        "te": "సాధారణం",
        "ml": "സാധാരണ"
    },

    "High": {
        "ta": "அதிகம்",
        "hi": "उच्च",
        "te": "అధికం",
        "ml": "ഉയർന്നത്"
    },

    "Critical": {
        "ta": "மிகவும் ஆபத்தான நிலை",
        "hi": "गंभीर",
        "te": "తీవ్రమైనది",
        "ml": "ഗുരുതരമായത്"
    },


    # --------------------------------------------------------
    # DAY PLAN
    # --------------------------------------------------------

    "Complete Day Plan": {
        "ta": "முழு நாள் திட்டம்",
        "hi": "पूरे दिन की योजना",
        "te": "పూర్తి రోజు ప్రణాళిక",
        "ml": "പൂർണ്ണ ദിവസത്തെ പദ്ധതി"
    },

    "Morning": {
        "ta": "காலை",
        "hi": "सुबह",
        "te": "ఉదయం",
        "ml": "രാവിലെ"
    },

    "Afternoon": {
        "ta": "மதியம்",
        "hi": "दोपहर",
        "te": "మధ్యాహ్నం",
        "ml": "ഉച്ചയ്ക്ക്"
    },

    "Evening": {
        "ta": "மாலை",
        "hi": "शाम",
        "te": "సాయంత్రం",
        "ml": "വൈകുന്നേരം"
    },

    "Night": {
        "ta": "இரவு",
        "hi": "रात",
        "te": "రాత్రి",
        "ml": "രാത്രി"
    },


    # --------------------------------------------------------
    # TRAVEL
    # --------------------------------------------------------

    "Travel Plan": {
        "ta": "பயணத் திட்டம்",
        "hi": "यात्रा योजना",
        "te": "ప్రయాణ ప్రణాళిక",
        "ml": "യാത്രാ പദ്ധതി"
    },

    "Departure": {
        "ta": "புறப்படும் நேரம்",
        "hi": "प्रस्थान",
        "te": "బయలుదేరే సమయం",
        "ml": "പുറപ്പെടുന്ന സമയം"
    },

    "Departure Weather": {
        "ta": "புறப்படும் நேரத்திற்கான வானிலை",
        "hi": "प्रस्थान समय का मौसम",
        "te": "బయలుదేరే సమయ వాతావరణం",
        "ml": "പുറപ്പെടുന്ന സമയത്തെ കാലാവസ്ഥ"
    },

    "Packing Suggestions": {
        "ta": "பயணப் பொருள் பரிந்துரைகள்",
        "hi": "पैकिंग सुझाव",
        "te": "ప్యాకింగ్ సూచనలు",
        "ml": "പാക്കിംഗ് നിർദ്ദേശങ്ങൾ"
    },

    "Travel Advice": {
        "ta": "பயண ஆலோசனை",
        "hi": "यात्रा सलाह",
        "te": "ప్రయాణ సలహా",
        "ml": "യാത്രാ ഉപദേശം"
    },

    "Car": {
        "ta": "கார்",
        "hi": "कार",
        "te": "కారు",
        "ml": "കാർ"
    },

    "Bus": {
        "ta": "பேருந்து",
        "hi": "बस",
        "te": "బస్సు",
        "ml": "ബസ്"
    },

    "Train": {
        "ta": "ரயில்",
        "hi": "ट्रेन",
        "te": "రైలు",
        "ml": "ട്രെയിൻ"
    },

    "Flight": {
        "ta": "விமானம்",
        "hi": "उड़ान",
        "te": "విమానం",
        "ml": "വിമാനം"
    },

    "Bike": {
        "ta": "இருசக்கர வாகனம்",
        "hi": "बाइक",
        "te": "బైక్",
        "ml": "ബൈക്ക്"
    },

    "Walk": {
        "ta": "நடந்து செல்லுதல்",
        "hi": "पैदल",
        "te": "నడక",
        "ml": "നടത്തം"
    },


    # --------------------------------------------------------
    # COMMON RECOMMENDATION TERMS
    # --------------------------------------------------------

    "Recommendations": {
        "ta": "பரிந்துரைகள்",
        "hi": "सिफारिशें",
        "te": "సిఫార్సులు",
        "ml": "ശുപാർശകൾ"
    },

    "Recommended": {
        "ta": "பரிந்துரைக்கப்படுகிறது",
        "hi": "अनुशंसित",
        "te": "సిఫార్సు చేయబడింది",
        "ml": "ശുപാർശ ചെയ്യുന്നു"
    },

    "Avoid": {
        "ta": "தவிர்க்கவும்",
        "hi": "बचें",
        "te": "తప్పించుకోండి",
        "ml": "ഒഴിവാക്കുക"
    },

    "Caution": {
        "ta": "எச்சரிக்கை",
        "hi": "सावधानी",
        "te": "జాగ్రత్త",
        "ml": "ജാഗ്രത"
    },

    "Safe": {
        "ta": "பாதுகாப்பானது",
        "hi": "सुरक्षित",
        "te": "సురక్షితం",
        "ml": "സുരക്ഷിതം"
    }
}


# ============================================================
# VALIDATE LANGUAGE
# ============================================================

def validate_language(language):

    if language is None:
        return "en"

    language = language.lower().strip()

    if language not in SUPPORTED_LANGUAGES:
        raise ValueError(
            f"Unsupported language: {language}. "
            f"Supported languages: {list(SUPPORTED_LANGUAGES.keys())}"
        )

    return language


# ============================================================
# LOCAL TRANSLATION LOOKUP
# ============================================================

def get_static_translation(text, target_language):

    if not isinstance(text, str):
        return None

    if target_language == "en":
        return text

    text = text.strip()

    if text in STATIC_TRANSLATIONS:

        translations = STATIC_TRANSLATIONS[text]

        if target_language in translations:
            return translations[target_language]

    return None


# ============================================================
# GOOGLE TRANSLATOR FALLBACK
#
# IMPORTANT:
# Static translations are checked FIRST.
# GoogleTranslator is used only when required.
# ============================================================

@lru_cache(maxsize=2000)
def translate_text(text, target_language):

    if not isinstance(text, str):
        return text

    if not text.strip():
        return text

    if target_language == "en":
        return text

    # --------------------------------------------------------
    # 1. LOCAL TRANSLATION FIRST
    # --------------------------------------------------------

    local_translation = get_static_translation(
        text,
        target_language
    )

    if local_translation:
        return local_translation

    # --------------------------------------------------------
    # 2. GOOGLE TRANSLATOR FALLBACK
    # --------------------------------------------------------

    try:

        translated = GoogleTranslator(
            source="auto",
            target=target_language
        ).translate(text)

        if translated:
            return translated

        return text

    except Exception as e:

        print(
            f"Translation fallback failed "
            f"[{target_language}]: {text} -> {repr(e)}"
        )

        # Never break the API because translation failed
        return text


# ============================================================
# TRANSLATE VALUE
# ============================================================

def translate_value(
    value,
    target_language,
    key=None
):

    # --------------------------------------------------------
    # DICTIONARY
    # --------------------------------------------------------

    if isinstance(value, dict):

        translated_dict = {}

        for current_key, current_value in value.items():

            # Keep numerical/API keys untouched
            if current_key in PROTECTED_KEYS:

                translated_dict[current_key] = current_value

            else:

                translated_dict[current_key] = translate_value(
                    current_value,
                    target_language,
                    current_key
                )

        return translated_dict


    # --------------------------------------------------------
    # LIST
    # --------------------------------------------------------

    if isinstance(value, list):

        return [
            translate_value(
                item,
                target_language,
                key
            )
            for item in value
        ]


    # --------------------------------------------------------
    # STRING
    # --------------------------------------------------------

    if isinstance(value, str):

        # Location names should remain as provided
        if key in LOCATION_KEYS:
            return value

        return translate_text(
            value,
            target_language
        )


    # --------------------------------------------------------
    # NUMBERS / BOOLEAN / NONE
    # --------------------------------------------------------

    return value


# ============================================================
# TRANSLATE COMPLETE API RESPONSE
# ============================================================

def translate_response(
    response,
    language="en"
):

    language = validate_language(language)

    # English → no translation required
    if language == "en":
        return response

    try:

        return translate_value(
            response,
            language
        )

    except Exception as e:

        print(
            f"TRANSLATION ERROR [{language}]: "
            f"{repr(e)}"
        )

        # Very important:
        # If translation fails, original English
        # response is returned instead of crashing FastAPI.

        return response