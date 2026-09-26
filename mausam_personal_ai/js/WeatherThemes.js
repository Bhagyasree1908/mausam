/* =========================================================
   MAUSAM PERSONAL AI
   Weather + Persona Visual Theme Engine
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       PROFILE CONFIG
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
       WEATHER BACKGROUNDS
    ====================================================== */

    const WEATHER_BACKGROUNDS = {

        clear:
            "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=2200&q=85",

        cloudy:
            "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=2200&q=85",

        rain:
            "https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=2200&q=85",

        storm:
            "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=2200&q=85"

    };


    /* =====================================================
       PROFILE WEATHER BLEND
       
       We keep the persona visual identity while adding
       weather mood through overlays/classes.
    ====================================================== */

    const WEATHER_MODIFIERS = {

        clear: {
            filter:
                "saturate(0.95) brightness(0.62)",

            overlay:
                "clear"
        },

        cloudy: {
            filter:
                "saturate(0.65) brightness(0.46) contrast(1.04)",

            overlay:
                "cloudy"
        },

        rain: {
            filter:
                "saturate(0.45) brightness(0.36) contrast(1.08)",

            overlay:
                "rain"
        },

        storm: {
            filter:
                "saturate(0.25) brightness(0.25) contrast(1.18)",

            overlay:
                "storm"
        }

    };


    /* =====================================================
       HELPERS
    ====================================================== */

    function normalizeProfile(profile) {

        if (!profile) {
            return "health";
        }

        const value =
            String(profile)
                .trim()
                .toLowerCase();

        if (value === "travel") {
            return "traveler";
        }

        if (value === "traveller") {
            return "traveler";
        }

        if (PROFILE_THEMES[value]) {
            return value;
        }

        return "health";
    }


    function normalizeWeather(condition) {

        if (!condition) {
            return "clear";
        }

        const value =
            String(condition)
                .trim()
                .toLowerCase();

        if (
            value.includes("storm") ||
            value.includes("thunder") ||
            value.includes("lightning")
        ) {
            return "storm";
        }

        if (
            value.includes("rain") ||
            value.includes("drizzle") ||
            value.includes("shower") ||
            value.includes("precip")
        ) {
            return "rain";
        }

        if (
            value.includes("cloud") ||
            value.includes("overcast") ||
            value.includes("fog") ||
            value.includes("mist")
        ) {
            return "cloudy";
        }

        if (
            value.includes("clear") ||
            value.includes("sunny") ||
            value.includes("sun")
        ) {
            return "clear";
        }

        return "clear";
    }


    /* =====================================================
       WMO WEATHER CODE
    ====================================================== */

    function weatherCodeToCondition(code) {

        const numericCode =
            Number(code);

        if (Number.isNaN(numericCode)) {
            return "clear";
        }


        /* Clear */

        if (numericCode === 0) {
            return "clear";
        }


        /* Partly cloudy / cloudy */

        if (
            numericCode >= 1 &&
            numericCode <= 3
        ) {
            return "cloudy";
        }


        /* Fog */

        if (
            numericCode === 45 ||
            numericCode === 48
        ) {
            return "cloudy";
        }


        /* Drizzle */

        if (
            numericCode >= 51 &&
            numericCode <= 57
        ) {
            return "rain";
        }


        /* Rain */

        if (
            numericCode >= 61 &&
            numericCode <= 67
        ) {
            return "rain";
        }


        /* Snow */

        if (
            numericCode >= 71 &&
            numericCode <= 77
        ) {
            return "cloudy";
        }


        /* Rain showers */

        if (
            numericCode >= 80 &&
            numericCode <= 82
        ) {
            return "rain";
        }


        /* Snow showers */

        if (
            numericCode === 85 ||
            numericCode === 86
        ) {
            return "cloudy";
        }


        /* Thunderstorm */

        if (
            numericCode >= 95 &&
            numericCode <= 99
        ) {
            return "storm";
        }


        return "clear";
    }


    /* =====================================================
       APPLY PROFILE
    ====================================================== */

    function applyProfileTheme(profile) {

        const normalizedProfile =
            normalizeProfile(profile);

        const theme =
            PROFILE_THEMES[normalizedProfile];


        /* Remove old profile classes */

        Object.keys(PROFILE_THEMES)
            .forEach(function (key) {

                document.body.classList.remove(
                    `profile-${key}`
                );

            });


        /* Add current profile */

        document.body.classList.add(
            `profile-${normalizedProfile}`
        );


        /* Accent variables */

        document.documentElement.style
            .setProperty(
                "--accent",
                theme.accent
            );


        /*
         * The CSS file already contains
         * profile-specific background images.
         *
         * We also directly update the element
         * so JS can control it dynamically.
         */

        const background =
            document.getElementById(
                "weatherBackground"
            );


        if (background) {

            background.style.backgroundImage =
                `url("${theme.background}")`;

        }


        return theme;
    }


    /* =====================================================
       APPLY WEATHER
    ====================================================== */

    function applyWeatherTheme(
        condition,
        profile
    ) {

        const normalizedProfile =
            normalizeProfile(profile);

        const normalizedWeather =
            normalizeWeather(condition);


        const theme =
            PROFILE_THEMES[
                normalizedProfile
            ];

        const weatherModifier =
            WEATHER_MODIFIERS[
                normalizedWeather
            ];


        /* -----------------------------------------------
           Profile class
        ------------------------------------------------ */

        applyProfileTheme(
            normalizedProfile
        );


        /* -----------------------------------------------
           Remove previous weather classes
        ------------------------------------------------ */

        [
            "weather-clear",
            "weather-cloudy",
            "weather-rain",
            "weather-storm"
        ]
        .forEach(function (className) {

            document.body.classList.remove(
                className
            );

        });


        /* -----------------------------------------------
           Add current weather class
        ------------------------------------------------ */

        document.body.classList.add(
            `weather-${normalizedWeather}`
        );


        /* -----------------------------------------------
           Background
           
           Persona image remains primary.
           Weather modifies brightness,
           saturation and overlay.
        ------------------------------------------------ */

        const background =
            document.getElementById(
                "weatherBackground"
            );


        if (background) {

            background.style.backgroundImage =
                `url("${theme.background}")`;

            background.style.filter =
                weatherModifier.filter;

        }


        /* -----------------------------------------------
           CSS custom properties
        ------------------------------------------------ */

        document.documentElement.style
            .setProperty(
                "--accent",
                theme.accent
            );


        return {

            profile:
                normalizedProfile,

            weather:
                normalizedWeather,

            theme:
                theme,

            modifier:
                weatherModifier

        };
    }


    /* =====================================================
       WEATHER CONDITION FROM BACKEND DATA
    ====================================================== */

    function detectWeatherCondition(
        current
    ) {

        if (!current) {
            return "clear";
        }


        /* -----------------------------------------------
           Direct text condition
        ------------------------------------------------ */

        const textCandidates = [

            current.condition,

            current.weather,

            current.description,

            current.summary,

            current.weather_description

        ];


        for (
            let i = 0;
            i < textCandidates.length;
            i++
        ) {

            const value =
                textCandidates[i];

            if (
                value !== undefined &&
                value !== null &&
                String(value).trim() !== ""
            ) {

                return normalizeWeather(
                    value
                );

            }

        }


        /* -----------------------------------------------
           Weather code
        ------------------------------------------------ */

        const codeCandidates = [

            current.weather_code,

            current.weatherCode,

            current.code

        ];


        for (
            let i = 0;
            i < codeCandidates.length;
            i++
        ) {

            const code =
                codeCandidates[i];

            if (
                code !== undefined &&
                code !== null
            ) {

                return weatherCodeToCondition(
                    code
                );

            }

        }


        /* -----------------------------------------------
           Rain / precipitation fallback
        ------------------------------------------------ */

        const precipitation =
            Number(
                current.precipitation ??
                current.rain ??
                0
            );


        if (
            !Number.isNaN(precipitation) &&
            precipitation > 0
        ) {

            return "rain";

        }


        return "clear";
    }


    /* =====================================================
       WEATHER ICON
    ====================================================== */

    function getWeatherIcon(
        condition
    ) {

        const normalized =
            normalizeWeather(
                condition
            );


        switch (normalized) {

            case "storm":
                return "⛈";

            case "rain":
                return "🌧";

            case "cloudy":
                return "☁";

            case "clear":
            default:
                return "☀";

        }

    }


    /* =====================================================
       DAILY WEATHER ICON
    ====================================================== */

    function getDailyWeatherIcon(
        item
    ) {

        if (!item) {
            return "☀";
        }


        const condition =
            item.condition ??
            item.weather ??
            item.description;


        if (condition) {

            return getWeatherIcon(
                condition
            );

        }


        const code =
            item.weather_code ??
            item.weatherCode ??
            item.code;


        if (
            code !== undefined &&
            code !== null
        ) {

            return getWeatherIcon(
                weatherCodeToCondition(code)
            );

        }


        const rain =
            Number(
                item.rain ??
                item.precipitation ??
                0
            );


        if (
            !Number.isNaN(rain) &&
            rain > 0
        ) {

            return "🌧";

        }


        return "☀";
    }


    /* =====================================================
       PROFILE INFO
    ====================================================== */

    function getProfileTheme(
        profile
    ) {

        return PROFILE_THEMES[
            normalizeProfile(profile)
        ];

    }


    /* =====================================================
       EXPORT
       
       Accessible globally from app.js
    ====================================================== */

    window.MausamTheme = {

        profiles:
            PROFILE_THEMES,

        weatherBackgrounds:
            WEATHER_BACKGROUNDS,

        weatherModifiers:
            WEATHER_MODIFIERS,

        normalizeProfile:
            normalizeProfile,

        normalizeWeather:
            normalizeWeather,

        weatherCodeToCondition:
            weatherCodeToCondition,

        detectWeatherCondition:
            detectWeatherCondition,

        getWeatherIcon:
            getWeatherIcon,

        getDailyWeatherIcon:
            getDailyWeatherIcon,

        getProfileTheme:
            getProfileTheme,

        applyProfileTheme:
            applyProfileTheme,

        applyWeatherTheme:
            applyWeatherTheme

    };


    /* =====================================================
       INITIAL THEME
    ====================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            applyProfileTheme(
                "health"
            );

            applyWeatherTheme(
                "clear",
                "health"
            );

        }
    );

})();