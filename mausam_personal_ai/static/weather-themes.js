/* =========================================================
   MAUSAM PERSONAL AI
   Weather / Profile Theme System
   Exposes window.MausamTheme, consumed by app.js
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       PROFILE THEME DATA
    ====================================================== */

    const PROFILE_THEMES = {

        health: {
            name: "Health",
            icon: "♥",
            accent: "#6ee7b7",

            background:
                "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=2200&q=85",

            description:
                "Wellness, air quality and healthy outdoor decisions."
        },

        fitness: {
            name: "Fitness",
            icon: "↗",
            accent: "#facc15",

            background:
                "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=2200&q=85",

            description:
                "Outdoor workouts and activity planning."
        },

        beach: {
            name: "Beach",
            icon: "◒",
            accent: "#67e8f9",

            background:
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=85",

            description:
                "Ocean conditions, marine weather and beach safety."
        },

        traveler: {
            name: "Traveler",
            icon: "✈",
            accent: "#c4b5fd",

            background:
                "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2200&q=85",

            description:
                "Journey planning and travel weather intelligence."
        },

        family: {
            name: "Family",
            icon: "◎",
            accent: "#fb923c",

            background:
                "https://images.unsplash.com/photo-1504150558240-0b4fd8946624?auto=format&fit=crop&w=2200&q=85",

            description:
                "Family outings and safe activity planning."
        },

        agriculture: {
            name: "Agriculture",
            icon: "◈",
            accent: "#a3e635",

            background:
                "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2200&q=85",

            description:
                "Farm conditions, rainfall and crop-related weather."
        },

        commuter: {
            name: "Commuter",
            icon: "→",
            accent: "#60a5fa",

            background:
                "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=2200&q=85",

            description:
                "Daily road and commute weather intelligence."
        },

        event: {
            name: "Event",
            icon: "✦",
            accent: "#f472b6",

            background:
                "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=2200&q=85",

            description:
                "Outdoor event weather and safety planning."
        }

    };


    /* =====================================================
       WEATHER CONDITION ICONS
    ====================================================== */

    const CONDITION_ICONS = {
        clear: "☀",
        cloudy: "☁",
        rain: "🌧",
        storm: "⛈"
    };


    /* =====================================================
       APPLY PROFILE THEME
       Toggles body.profile-<id>, which style.css already
       uses to control --accent and .weather-background's
       background-image (see "PERSONA BACKGROUND MOODS" and
       "PROFILE MOODS" sections of style.css).
    ====================================================== */

    function applyProfileTheme(profile) {

        if (!profile || !PROFILE_THEMES[profile]) {
            profile = "health";
        }

        const body = document.body;

        // Remove any previously applied profile-* class.
        Array.from(body.classList)
            .filter(function (className) {
                return className.indexOf("profile-") === 0;
            })
            .forEach(function (className) {
                body.classList.remove(className);
            });

        body.classList.add("profile-" + profile);

    }


    /* =====================================================
       APPLY WEATHER THEME
       Toggles body.weather-<condition>, which style.css
       already uses to control the background filter/overlay
       mood (see "WEATHER MOOD STATES" section of style.css).

       IMPORTANT: this does NOT touch background-image or any
       inline style, so it never overrides the profile-based
       background set by applyProfileTheme() above. The two
       class sets are independent and both stay applied to
       <body> at the same time (e.g. "profile-beach
       weather-clear").
    ====================================================== */

    function applyWeatherTheme(condition, profile) {

        const body = document.body;

        const validConditions = ["clear", "cloudy", "rain", "storm"];
        const normalizedCondition = validConditions.includes(condition)
            ? condition
            : "clear";

        Array.from(body.classList)
            .filter(function (className) {
                return className.indexOf("weather-") === 0;
            })
            .forEach(function (className) {
                body.classList.remove(className);
            });

        body.classList.add("weather-" + normalizedCondition);

        // Re-assert the profile class too, in case this is ever
        // called before applyProfileTheme (defensive, keeps the
        // background image correct either way).
        if (profile && PROFILE_THEMES[profile]) {
            applyProfileTheme(profile);
        }

    }


    /* =====================================================
       DETECT WEATHER CONDITION FROM BACKEND CURRENT WEATHER
    ====================================================== */

    function detectWeatherCondition(current) {

        if (!current || typeof current !== "object") {
            return "clear";
        }

        // Prefer an explicit weather code if the backend gave one.
        const code = current.weather_code ?? current.weathercode ?? current.code;

        if (code !== undefined && code !== null && code !== "") {
            return weatherCodeToCondition(code);
        }

        // Fall back to a plain-text condition/description field.
        const label = current.condition || current.weather || current.description;

        if (label) {
            const normalized = String(label).trim().toLowerCase();

            if (normalized.includes("storm") || normalized.includes("thunder")) {
                return "storm";
            }

            if (normalized.includes("rain") || normalized.includes("shower") || normalized.includes("drizzle")) {
                return "rain";
            }

            if (normalized.includes("cloud") || normalized.includes("overcast")) {
                return "cloudy";
            }

            if (normalized.includes("clear") || normalized.includes("sun")) {
                return "clear";
            }
        }

        // Fall back to rain amount if nothing else is available.
        const rain = Number(current.rain ?? current.precipitation);

        if (Number.isFinite(rain) && rain > 0) {
            return "rain";
        }

        return "clear";

    }


    /* =====================================================
       WMO WEATHER CODE -> CONDITION
       (Open-Meteo / WMO standard weather codes)
    ====================================================== */

    function weatherCodeToCondition(code) {

        const numericCode = Number(code);

        if (!Number.isFinite(numericCode)) {
            return "clear";
        }

        // 0        : Clear sky
        // 1-3      : Mainly clear, partly cloudy, overcast
        // 45,48    : Fog
        // 51-57    : Drizzle
        // 61-67    : Rain
        // 71-77    : Snow
        // 80-82    : Rain showers
        // 85,86    : Snow showers
        // 95-99    : Thunderstorm

        if (numericCode === 0) { return "clear"; }
        if (numericCode >= 1 && numericCode <= 3) { return "cloudy"; }
        if (numericCode === 45 || numericCode === 48) { return "cloudy"; }
        if (numericCode >= 51 && numericCode <= 67) { return "rain"; }
        if (numericCode >= 71 && numericCode <= 77) { return "rain"; }
        if (numericCode >= 80 && numericCode <= 82) { return "rain"; }
        if (numericCode === 85 || numericCode === 86) { return "rain"; }
        if (numericCode >= 95 && numericCode <= 99) { return "storm"; }

        return "clear";

    }


    /* =====================================================
       WEATHER ICON FOR A GIVEN CONDITION
    ====================================================== */

    function getWeatherIcon(condition) {

        return CONDITION_ICONS[condition] || CONDITION_ICONS.clear;

    }


    /* =====================================================
       DAILY FORECAST ICON
       Accepts a single forecast-row object (as produced by
       app.js's normalizeForecastRows) and picks an icon using
       whatever fields are available on it.
    ====================================================== */

    function getDailyWeatherIcon(item) {

        if (!item || typeof item !== "object") {
            return getWeatherIcon("clear");
        }

        const code = item.weather_code ?? item.weathercode ?? item.code;

        if (code !== undefined && code !== null && code !== "") {
            return getWeatherIcon(weatherCodeToCondition(code));
        }

        const label = item.condition || item.weather || item.description;

        if (label) {
            return getWeatherIcon(detectWeatherCondition({ condition: label }));
        }

        const rainProbability = Number(
            item.rain_probability ?? item.precipitation_probability
        );

        if (Number.isFinite(rainProbability) && rainProbability >= 50) {
            return getWeatherIcon("rain");
        }

        return getWeatherIcon("clear");

    }


    /* =====================================================
       EXPOSE PUBLIC API
    ====================================================== */

    window.MausamTheme = {
        PROFILE_THEMES: PROFILE_THEMES,
        applyProfileTheme: applyProfileTheme,
        applyWeatherTheme: applyWeatherTheme,
        detectWeatherCondition: detectWeatherCondition,
        weatherCodeToCondition: weatherCodeToCondition,
        getWeatherIcon: getWeatherIcon,
        getDailyWeatherIcon: getDailyWeatherIcon
    };

})();