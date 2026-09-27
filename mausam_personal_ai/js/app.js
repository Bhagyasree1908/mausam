/* =========================================================
   MAUSAM PERSONAL AI
   Frontend Application
   Connects to existing FastAPI backend
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       APPLICATION STATE
    ====================================================== */

    const appState = {

        profile: "health",

        state: "",

        district: "",

        destinationState: "",

        destinationDistrict: "",

        transport: "car",

        days: 3,

        departureDate: "",

        departureTime: "08:00",

        language: "en",

        data: null,

        states: [],

        districts: [],

        destinationDistricts: [],

        profiles: {},

        initialized: false

    };


    /* =====================================================
       PROFILE FALLBACK DATA
    ====================================================== */

    const PROFILE_FALLBACKS = {

        health: {
            name: "Health",
            icon: "♥"
        },

        fitness: {
            name: "Fitness",
            icon: "↗"
        },

        beach: {
            name: "Beach",
            icon: "◒"
        },

        traveler: {
            name: "Traveler",
            icon: "✈"
        },

        family: {
            name: "Family",
            icon: "◎"
        },

        agriculture: {
            name: "Agriculture",
            icon: "◈"
        },

        commuter: {
            name: "Commuter",
            icon: "→"
        },

        event: {
            name: "Event",
            icon: "✦"
        }

    };


    /* =====================================================
       DOM HELPERS
    ====================================================== */

    function $(id) {

        return document.getElementById(id);

    }


    function $all(selector) {

        return Array.from(
            document.querySelectorAll(selector)
        );

    }


    /* =====================================================
       INITIALIZATION
    ====================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        initializeApp
    );


    async function initializeApp() {

        setDefaultDepartureDate();

        bindEvents();

        setInitialProfileTheme();

        showLoading(true);

        try {

            await loadStates();

            await loadProfiles();

            await loadDestinationStates();

            appState.initialized = true;

        } catch (error) {

            showError(
                getErrorMessage(error)
            );

        } finally {

            showLoading(false);

        }

    }


    /* =====================================================
       EVENT BINDINGS
    ====================================================== */

    function bindEvents() {


        /* -----------------------------------------------
           Main state
        ------------------------------------------------ */

        const stateSelect =
            $("stateSelect");

        if (stateSelect) {

            stateSelect.addEventListener(
                "change",
                handleStateChange
            );

        }


        /* -----------------------------------------------
           Main district
        ------------------------------------------------ */

        const districtSelect =
            $("districtSelect");

        if (districtSelect) {

            districtSelect.addEventListener(
                "change",
                function () {

                    appState.district =
                        districtSelect.value;

                }
            );

        }


        /* -----------------------------------------------
           Destination state
        ------------------------------------------------ */

        const destinationStateSelect =
            $("destinationStateSelect");

        if (destinationStateSelect) {

            destinationStateSelect.addEventListener(
                "change",
                handleDestinationStateChange
            );

        }


        /* -----------------------------------------------
           Destination district
        ------------------------------------------------ */

        const destinationDistrictSelect =
            $("destinationDistrictSelect");

        if (destinationDistrictSelect) {

            destinationDistrictSelect.addEventListener(
                "change",
                function () {

                    appState.destinationDistrict =
                        destinationDistrictSelect.value;

                }
            );

        }


        /* -----------------------------------------------
           Persona
        ------------------------------------------------ */

        $all(".persona-card")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const profile =
                            button.dataset.profile;

                        selectProfile(profile);

                    }
                );

            });


        /* -----------------------------------------------
           Load weather
        ------------------------------------------------ */

        const loadButton =
            $("loadWeatherButton");

        if (loadButton) {

            loadButton.addEventListener(
                "click",
                loadPersonalizedWeather
            );

        }


        /* -----------------------------------------------
           Refresh
        ------------------------------------------------ */

        const refreshButton =
            $("refreshButton");

        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                function () {

                    if (
                        appState.state &&
                        appState.district
                    ) {

                        loadPersonalizedWeather();

                    } else {

                        showError(
                            "Select your state and district first."
                        );

                    }

                }
            );

        }


        /* -----------------------------------------------
           Language
        ------------------------------------------------ */

        const languageSelect =
            $("languageSelect");

        if (languageSelect) {

            languageSelect.addEventListener(
                "change",
                function () {

                    appState.language =
                        languageSelect.value;

                }
            );

        }


        /* -----------------------------------------------
           Traveler values
        ------------------------------------------------ */

        const transportSelect =
            $("transportSelect");

        if (transportSelect) {

            transportSelect.addEventListener(
                "change",
                function () {

                    appState.transport =
                        transportSelect.value;

                }
            );

        }


        const daysInput =
            $("daysInput");

        if (daysInput) {

            daysInput.addEventListener(
                "change",
                function () {

                    appState.days =
                        clamp(
                            Number(daysInput.value),
                            1,
                            7
                        );

                    daysInput.value =
                        appState.days;

                }
            );

        }


        const departureDateInput =
            $("departureDateInput");

        if (departureDateInput) {

            departureDateInput.addEventListener(
                "change",
                function () {

                    appState.departureDate =
                        departureDateInput.value;

                }
            );

        }


        const departureTimeInput =
            $("departureTimeInput");

        if (departureTimeInput) {

            departureTimeInput.addEventListener(
                "change",
                function () {

                    appState.departureTime =
                        departureTimeInput.value;

                }
            );

        }


        /* -----------------------------------------------
           Close error
        ------------------------------------------------ */

        const closeErrorButton =
            $("closeErrorButton");

        if (closeErrorButton) {

            closeErrorButton.addEventListener(
                "click",
                hideError
            );

        }

    }


    /* =====================================================
       DEFAULT DATE
    ====================================================== */

    function setDefaultDepartureDate() {

        const input =
            $("departureDateInput");

        if (!input) {
            return;
        }


        const now =
            new Date();


        const year =
            now.getFullYear();

        const month =
            String(
                now.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                now.getDate()
            ).padStart(2, "0");


        const dateString =
            `${year}-${month}-${day}`;


        input.value =
            dateString;

        appState.departureDate =
            dateString;

    }


    /* =====================================================
       PROFILE
    ====================================================== */

    function setInitialProfileTheme() {

        selectProfile(
            appState.profile,
            false
        );

    }


    function selectProfile(
        profile,
        loadWeather = true
    ) {

        if (
            !profile ||
            !PROFILE_FALLBACKS[profile]
        ) {

            profile = "health";

        }


        appState.profile =
            profile;


        /* -----------------------------------------------
           Update active button
        ------------------------------------------------ */

        $all(".persona-card")
            .forEach(function (button) {

                button.classList.toggle(
                    "active",
                    button.dataset.profile === profile
                );

            });


        /* -----------------------------------------------
           Apply visual profile theme
        ------------------------------------------------ */

        if (
            window.MausamTheme &&
            typeof window.MausamTheme.applyProfileTheme ===
                "function"
        ) {

            window.MausamTheme.applyProfileTheme(
                profile
            );

        }


        /* -----------------------------------------------
           Traveler panel
        ------------------------------------------------ */

        const travelerSection =
            $("travelerSection");

        if (travelerSection) {

            travelerSection.classList.toggle(
                "hidden",
                profile !== "traveler"
            );

        }


        /* -----------------------------------------------
           If location is already selected,
           immediately reload personalized data.
        ------------------------------------------------ */

        if (
            loadWeather &&
            appState.state &&
            appState.district
        ) {

            loadPersonalizedWeather();

        }

    }


    /* =====================================================
       LOAD STATES
    ====================================================== */

    async function loadStates() {

        const response =
            await apiRequest(
                "/states"
            );


        const states =
            normalizeStates(
                response
            );


        appState.states =
            states;


        populateSelect(
            $("stateSelect"),
            states,
            "Select state"
        );


        return states;

    }


    /* =====================================================
       LOAD PROFILES
    ====================================================== */

    async function loadProfiles() {

        try {

            const response =
                await apiRequest(
                    "/profiles"
                );


            appState.profiles =
                normalizeProfiles(
                    response
                );

        } catch (error) {

            /*
             * Profiles are optional for UI because
             * we already have fallback profile names.
             *
             * Don't block the whole application.
             */

            appState.profiles = {};

        }

    }


    /* =====================================================
       DESTINATION STATES
    ====================================================== */

    async function loadDestinationStates() {

        const destinationSelect =
            $("destinationStateSelect");

        if (!destinationSelect) {
            return;
        }


        populateSelect(
            destinationSelect,
            appState.states,
            "Select destination"
        );

    }


    /* =====================================================
       MAIN STATE CHANGE
    ====================================================== */

    async function handleStateChange(event) {

        const state =
            event.target.value;


        appState.state =
            state;

        appState.district =
            "";


        const districtSelect =
            $("districtSelect");


        if (!districtSelect) {
            return;
        }


        districtSelect.innerHTML =
            `<option value="">Loading districts...</option>`;

        districtSelect.disabled =
            true;


        if (!state) {

            districtSelect.innerHTML =
                `<option value="">Select district</option>`;

            return;

        }


        try {

            const response =
                await apiRequest(
                    "/districts",
                    {
                        state: state
                    }
                );


            const districts =
                normalizeDistricts(
                    response
                );


            appState.districts =
                districts;


            populateSelect(
                districtSelect,
                districts,
                "Select district"
            );


        } catch (error) {

            districtSelect.innerHTML =
                `<option value="">Unable to load districts</option>`;

            showError(
                getErrorMessage(error)
            );

        }

    }


    /* =====================================================
       DESTINATION STATE CHANGE
    ====================================================== */

    async function handleDestinationStateChange(
        event
    ) {

        const state =
            event.target.value;


        appState.destinationState =
            state;

        appState.destinationDistrict =
            "";


        const districtSelect =
            $("destinationDistrictSelect");


        if (!districtSelect) {
            return;
        }


        districtSelect.innerHTML =
            `<option value="">Loading districts...</option>`;

        districtSelect.disabled =
            true;


        if (!state) {

            districtSelect.innerHTML =
                `<option value="">Select district</option>`;

            return;

        }


        try {

            const response =
                await apiRequest(
                    "/districts",
                    {
                        state: state
                    }
                );


            const districts =
                normalizeDistricts(
                    response
                );


            appState.destinationDistricts =
                districts;


            populateSelect(
                districtSelect,
                districts,
                "Select district"
            );


        } catch (error) {

            districtSelect.innerHTML =
                `<option value="">Unable to load districts</option>`;

            showError(
                getErrorMessage(error)
            );

        }

    }


    /* =====================================================
       POPULATE SELECT
    ====================================================== */

    function populateSelect(
        select,
        values,
        placeholder
    ) {

        if (!select) {
            return;
        }


        select.innerHTML = "";


        const placeholderOption =
            document.createElement("option");

        placeholderOption.value =
            "";

        placeholderOption.textContent =
            placeholder;

        select.appendChild(
            placeholderOption
        );


        values.forEach(function (item) {

            const option =
                document.createElement("option");


            if (
                typeof item === "object" &&
                item !== null
            ) {

                const value =
                    item.value ??
                    item.id ??
                    item.name;

                const label =
                    item.label ??
                    item.name ??
                    item.value;

                option.value =
                    String(value ?? "");

                option.textContent =
                    String(label ?? value ?? "");

            } else {

                option.value =
                    String(item);

                option.textContent =
                    String(item);

            }


            select.appendChild(
                option
            );

        });


        select.disabled =
            values.length === 0;

    }


    /* =====================================================
       LOAD PERSONALIZED WEATHER
    ====================================================== */

    async function loadPersonalizedWeather() {

        if (!validateLocation()) {
            return;
        }


        if (
            appState.profile === "traveler" &&
            !validateTraveler()
        ) {
            return;
        }


        appState.state =
            $("stateSelect")?.value ||
            appState.state;

        appState.district =
            $("districtSelect")?.value ||
            appState.district;


        const params = {

            state:
                appState.state,

            district:
                appState.district,

            profile:
                appState.profile,

            language:
                appState.language

        };


        /* -----------------------------------------------
           Traveler-specific parameters
        ------------------------------------------------ */

        if (
            appState.profile === "traveler"
        ) {

            params.destination_state =
                appState.destinationState;

            params.destination_district =
                appState.destinationDistrict;

            params.transport =
                appState.transport;

            params.days =
                appState.days;

            params.departure_date =
                appState.departureDate;

            params.departure_time =
                appState.departureTime;

        }


        showLoading(true);

        hideError();


        try {

            const response =
                await apiRequest(
                    "/personalized-homepage",
                    params
                );


            appState.data =
                response;


            renderDashboard(
                response
            );


            const dashboard =
                $("dashboard");


            if (dashboard) {

                dashboard.classList.remove(
                    "hidden"
                );

            }


            /*
             * Scroll gently to dashboard
             */

            setTimeout(
                function () {

                    dashboard?.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                },
                100
            );


        } catch (error) {

            showError(
                getErrorMessage(error)
            );

        } finally {

            showLoading(false);

        }

    }


    /* =====================================================
       VALIDATION
    ====================================================== */

    function validateLocation() {

        const state =
            $("stateSelect")?.value ||
            appState.state;

        const district =
            $("districtSelect")?.value ||
            appState.district;


        if (!state) {

            showError(
                "Please select your state."
            );

            return false;

        }


        if (!district) {

            showError(
                "Please select your district."
            );

            return false;

        }


        appState.state =
            state;

        appState.district =
            district;


        return true;

    }


    function validateTraveler() {

        const destinationState =
            $("destinationStateSelect")?.value ||
            appState.destinationState;

        const destinationDistrict =
            $("destinationDistrictSelect")?.value ||
            appState.destinationDistrict;

        const transport =
            $("transportSelect")?.value ||
            appState.transport;

        const days =
            clamp(
                Number(
                    $("daysInput")?.value ||
                    appState.days
                ),
                1,
                7
            );

        const departureDate =
            $("departureDateInput")?.value ||
            appState.departureDate;

        const departureTime =
            $("departureTimeInput")?.value ||
            appState.departureTime;


        if (!destinationState) {

            showError(
                "Please select your destination state."
            );

            return false;

        }


        if (!destinationDistrict) {

            showError(
                "Please select your destination district."
            );

            return false;

        }


        if (!transport) {

            showError(
                "Please select your transport."
            );

            return false;

        }


        if (!departureDate) {

            showError(
                "Please select your departure date."
            );

            return false;

        }


        if (!departureTime) {

            showError(
                "Please select your departure time."
            );

            return false;

        }


        appState.destinationState =
            destinationState;

        appState.destinationDistrict =
            destinationDistrict;

        appState.transport =
            transport;

        appState.days =
            days;

        appState.departureDate =
            departureDate;

        appState.departureTime =
            departureTime;


        return true;

    }


    /* =====================================================
       RENDER DASHBOARD
    ====================================================== */

    function renderDashboard(
        data
    ) {

        const normalized =
            normalizeBackendData(
                data
            );


        /* -----------------------------------------------
           Theme
        ------------------------------------------------ */

        const condition =
            window.MausamTheme
                ? window.MausamTheme.detectWeatherCondition(
                    normalized.current
                )
                : "clear";


        if (
            window.MausamTheme &&
            typeof window.MausamTheme.applyWeatherTheme ===
                "function"
        ) {

            window.MausamTheme.applyWeatherTheme(
                condition,
                appState.profile
            );

        }


        /* -----------------------------------------------
           Basic
        ------------------------------------------------ */

        renderLocation(
            normalized
        );

        renderCurrentWeather(
            normalized.current,
            condition
        );

        renderWarning(
            normalized
        );

        renderHourly(
            normalized.hourly
        );

        renderDaily(
            normalized.daily
        );

        renderSunTimeline(
            normalized.daily
        );

        renderMoonTimeline(
            normalized.daily
        );

        renderFocus(
            normalized
        );

        renderHealth(
            normalized.airQuality
        );

        renderMarine(
            normalized.marine
        );

        renderTraveler(
            normalized.traveler
        );

        renderRecommendations(
            normalized
        );

        renderDayPlan(
            normalized.dayPlan
        );

        renderProfileBadge();

    }


    /* =====================================================
       NORMALIZE BACKEND RESPONSE
    ====================================================== */

    function normalizeBackendData(
        data
    ) {

        const personalized =
            isObject(
                data?.personalized
            )
                ? data.personalized
                : {};


        const location =
            firstObject(
                data?.location,
                personalized?.location,
                findObjectByKey(
                    data,
                    "location"
                )
            ) || {};


        const current =
            firstObject(

                findObjectByKey(
                    data,
                    "current"
                ),

                findObjectByKey(
                    personalized,
                    "current"
                ),

                findObjectByKey(
                    data,
                    "current_weather"
                ),

                findObjectByKey(
                    personalized,
                    "current_weather"
                )

            ) || {};


        const hourly =
            firstArray(

                findArrayByKey(
                    data,
                    "hourly"
                ),

                findArrayByKey(
                    personalized,
                    "hourly"
                ),

                findArrayByKey(
                    data,
                    "hourly_forecast"
                ),

                findArrayByKey(
                    personalized,
                    "hourly_forecast"
                )

            );


        const daily =
            firstArray(

                findArrayByKey(
                    data,
                    "daily"
                ),

                findArrayByKey(
                    personalized,
                    "daily"
                ),

                findArrayByKey(
                    data,
                    "daily_forecast"
                ),

                findArrayByKey(
                    personalized,
                    "daily_forecast"
                )

            );


        const airQuality =
            firstObject(

                data?.air_quality,

                data?.airQuality,

                personalized?.air_quality,

                personalized?.airQuality,

                findObjectByKey(
                    data,
                    "air_quality"
                )

            );


        const marine =
            firstObject(

                data?.marine,

                personalized?.marine,

                findObjectByKey(
                    data,
                    "marine"
                )

            );


        const traveler =
            firstObject(

                data?.traveler,

                personalized?.traveler,

                findObjectByKey(
                    data,
                    "traveler"
                )

            );


        const rules =
            data?.rules ??
            personalized?.rules ??
            {};


        const safety =
            data?.safety ??
            personalized?.safety ??
            {};


        const homepage =
            data?.homepage ??
            personalized?.homepage ??
            {};


        const dayPlan =
            data?.day_plan ??
            data?.dayPlan ??
            personalized?.day_plan ??
            personalized?.dayPlan ??
            findArrayByKey(
                data,
                "day_plan"
            ) ??
            findObjectByKey(
                data,
                "day_plan"
            );


        return {

            raw:
                data,

            personalized,

            location,

            current,

            hourly,

            daily,

            airQuality,

            marine,

            traveler,

            rules,

            safety,

            homepage,

            dayPlan

        };

    }


    /* =====================================================
       LOCATION
    ====================================================== */

    function renderLocation(
        normalized
    ) {

        const location =
            normalized.location ||
            {};


        const name =
            firstValue(

                location.name,

                location.location,

                location.city,

                location.district,

                appState.district

            );


        const state =
            firstValue(

                location.state,

                location.state_name,

                appState.state

            );


        const district =
            firstValue(

                location.district,

                location.district_name,

                appState.district

            );


        const locationName =
            $("locationName");


        if (locationName) {

            locationName.textContent =
                name ||
                district ||
                "Your location";

        }


        const locationMeta =
            $("locationMeta");


        if (locationMeta) {

            const pieces =
                [district, state]
                    .filter(Boolean);


            locationMeta.textContent =
                unique(
                    pieces
                ).join(", ");

        }

    }


    /* =====================================================
       CURRENT WEATHER
    ====================================================== */

    function renderCurrentWeather(
        current,
        condition
    ) {

        const temperature =
            getNumericValue(
                current,
                [
                    "temperature",
                    "temp",
                    "temperature_c",
                    "temp_c"
                ]
            );


        const feelsLike =
            getNumericValue(
                current,
                [
                    "feels_like",
                    "feelsLike",
                    "apparent_temperature",
                    "apparentTemperature"
                ]
            );


        const humidity =
            getNumericValue(
                current,
                [
                    "humidity",
                    "relative_humidity"
                ]
            );


        const wind =
            getNumericValue(
                current,
                [
                    "wind_speed",
                    "windSpeed",
                    "wind"
                ]
            );


        const uv =
            getNumericValue(
                current,
                [
                    "uv",
                    "uv_index",
                    "uvIndex"
                ]
            );


        const rain =
            getNumericValue(
                current,
                [
                    "rain",
                    "precipitation",
                    "precipitation_amount"
                ]
            );


        setText(
            "currentTemperature",
            formatNumber(
                temperature
            )
        );


        setText(
            "feelsLike",
            formatTemperature(
                feelsLike
            )
        );


        setText(
            "humidity",
            formatPercent(
                humidity
            )
        );


        setText(
            "windSpeed",
            formatWind(
                wind
            )
        );


        setText(
            "uvIndex",
            formatNumber(
                uv
            )
        );


        setText(
            "rainAmount",
            formatRain(
                rain
            )
        );


        setText(
            "currentCondition",
            formatWeatherLabel(
                condition
            )
        );


        const icon =
            window.MausamTheme
                ? window.MausamTheme.getWeatherIcon(
                    condition
                )
                : "☀";


        setText(
            "currentWeatherIcon",
            icon
        );

    }


    /* =====================================================
       WARNING
    ====================================================== */

    function renderWarning(
        normalized
    ) {

        const warningSection =
            $("warningSection");

        const warningText =
            $("warningText");


        if (
            !warningSection ||
            !warningText
        ) {
            return;
        }


        const messages = [];


        /* Safety */

        collectText(
            normalized.safety,
            messages,
            [
                "warning",
                "warnings",
                "alert",
                "alerts",
                "message",
                "summary"
            ]
        );


        /* Rules */

        collectText(
            normalized.rules,
            messages,
            [
                "warning",
                "warnings",
                "alert",
                "alerts"
            ]
        );


        /* Raw */

        if (
            messages.length === 0 &&
            normalized.raw
        ) {

            collectText(
                normalized.raw,
                messages,
                [
                    "warning",
                    "alert"
                ]
            );

        }


        const cleanMessages =
            unique(
                messages
                    .map(
                        cleanDisplayText
                    )
                    .filter(Boolean)
            );


        if (
            cleanMessages.length === 0
        ) {

            warningSection.classList.add(
                "hidden"
            );

            return;

        }


        warningSection.classList.remove(
            "hidden"
        );


        warningText.textContent =
            cleanMessages
                .slice(0, 3)
                .join(" • ");

    }


    /* =====================================================
       HOURLY FORECAST
    ====================================================== */

    function renderHourly(
        hourly
    ) {

        const container =
            $("hourlyForecast");


        if (!container) {
            return;
        }


        const rows =
            normalizeForecastRows(
                hourly
            );


        const selectedRows =
            rows.slice(0, 3);


        if (
            selectedRows.length === 0
        ) {

            container.innerHTML =
                emptyState(
                    "Hourly forecast is not available from the current backend response."
                );

            return;

        }


        container.innerHTML =
            selectedRows
                .map(
                    renderHourlyCard
                )
                .join("");

    }


    function renderHourlyCard(
        item,
        index
    ) {

        const time =
            formatForecastTime(
                firstValue(
                    item.time,
                    item.datetime,
                    item.date
                )
            );


        const temperature =
            getRowNumeric(
                item,
                [
                    "temperature",
                    "temp",
                    "temperature_c",
                    "temp_c"
                ]
            );


        const rainProbability =
            getRowNumeric(
                item,
                [
                    "rain_probability",
                    "rainProbability",
                    "precipitation_probability",
                    "precipitationProbability"
                ]
            );


        const precipitation =
            getRowNumeric(
                item,
                [
                    "precipitation",
                    "rain",
                    "precipitation_amount"
                ]
            );


        const condition =
            getRowCondition(
                item
            );


        const icon =
            window.MausamTheme
                ? window.MausamTheme.getWeatherIcon(
                    condition
                )
                : "☀";


        return `
            <article class="hour-card">

                <span class="hour-time">
                    ${escapeHtml(
                        time ||
                        `Hour ${index + 1}`
                    )}
                </span>

                <div class="hour-icon">
                    ${icon}
                </div>

                <div class="hour-temp">
                    ${escapeHtml(
                        formatTemperature(
                            temperature
                        )
                    )}
                </div>

                <div class="hour-meta">

                    <span>
                        Rain:
                        ${escapeHtml(
                            formatPercent(
                                rainProbability
                            )
                        )}
                    </span>

                    <span>
                        Precip:
                        ${escapeHtml(
                            formatRain(
                                precipitation
                            )
                        )}
                    </span>

                </div>

            </article>
        `;

    }


    /* =====================================================
       DAILY FORECAST
    ====================================================== */

    function renderDaily(
        daily
    ) {

        const container =
            $("dailyForecast");


        if (!container) {
            return;
        }


        const rows =
            normalizeForecastRows(
                daily
            );


        const selectedRows =
            rows.slice(0, 7);


        if (
            selectedRows.length === 0
        ) {

            container.innerHTML =
                emptyState(
                    "7-day forecast is not available from the current backend response."
                );

            return;

        }


        container.innerHTML =
            selectedRows
                .map(
                    renderDailyCard
                )
                .join("");

    }


    function renderDailyCard(
        item,
        index
    ) {

        const date =
            firstValue(
                item.time,
                item.date,
                item.datetime
            );


        const dayName =
            formatDayName(
                date,
                index
            );


        const maxTemperature =
            getRowNumeric(
                item,
                [
                    "max_temperature",
                    "maxTemperature",
                    "temperature_max",
                    "temp_max",
                    "maximum_temperature"
                ]
            );


        const minTemperature =
            getRowNumeric(
                item,
                [
                    "min_temperature",
                    "minTemperature",
                    "temperature_min",
                    "temp_min",
                    "minimum_temperature"
                ]
            );


        const rainProbability =
            getRowNumeric(
                item,
                [
                    "rain_probability",
                    "rainProbability",
                    "precipitation_probability"
                ]
            );


        const icon =
            window.MausamTheme
                ? window.MausamTheme.getDailyWeatherIcon(
                    item
                )
                : "☀";


        return `
            <article class="day-card">

                <div class="day-name">
                    ${escapeHtml(
                        dayName
                    )}
                </div>

                <div class="day-icon">
                    ${icon}
                </div>

                <div class="day-temp">

                    <span class="day-max">
                        ${escapeHtml(
                            formatTemperature(
                                maxTemperature
                            )
                        )}
                    </span>

                    <span class="day-min">
                        ${escapeHtml(
                            formatTemperature(
                                minTemperature
                            )
                        )}
                    </span>

                </div>

                <span class="day-rain">
                    ${escapeHtml(
                        formatPercent(
                            rainProbability
                        )
                    )} rain
                </span>

            </article>
        `;

    }


    /* =====================================================
       SUN TIMELINE
    ====================================================== */

    function renderSunTimeline(
        daily
    ) {

        const rows =
            normalizeForecastRows(
                daily
            );


        const firstDay =
            rows[0];


        if (!firstDay) {
            return;
        }


        const sunrise =
            firstValue(
                firstDay.sunrise,
                firstDay.sunrise_time,
                firstDay.sunriseTime
            );


        const sunset =
            firstValue(
                firstDay.sunset,
                firstDay.sunset_time,
                firstDay.sunsetTime
            );


        setText(
            "sunriseTime",
            formatTimeOnly(
                sunrise
            )
        );


        setText(
            "sunsetTime",
            formatTimeOnly(
                sunset
            )
        );


        const progress =
            $("sunrisePosition");


        if (
            progress &&
            sunrise &&
            sunset
        ) {

            progress.style.width =
                "100%";

        }

    }


    /* =====================================================
       MOON TIMELINE
    ====================================================== */

    function renderMoonTimeline(
        daily
    ) {

        const rows =
            normalizeForecastRows(
                daily
            );


        const firstDay =
            rows[0];


        const date =
            firstValue(
                firstDay?.time,
                firstDay?.date,
                firstDay?.datetime
            ) ||
            getTodayDate();


        const moonrise =
            firstValue(
                firstDay?.moonrise,
                firstDay?.moonrise_time,
                firstDay?.moonriseTime
            );


        const moonset =
            firstValue(
                firstDay?.moonset,
                firstDay?.moonset_time,
                firstDay?.moonsetTime
            );


        setText(
            "moonriseTime",
            moonrise
                ? formatTimeOnly(moonrise)
                : "—"
        );


        setText(
            "moonsetTime",
            moonset
                ? formatTimeOnly(moonset)
                : "—"
        );


        const phase =
            calculateMoonPhase(
                date
            );


        setText(
            "moonPhaseIcon",
            phase.icon
        );


        setText(
            "moonPhaseName",
            phase.name
        );


        setText(
            "moonPhaseDetail",
            moonrise || moonset
                ? "Moonrise and moonset from weather data"
                : "Phase calculated from date"
        );

    }


    /* =====================================================
       FOCUS
    ====================================================== */

    function renderFocus(
        normalized
    ) {

        const container =
            $("focusGrid");


        if (!container) {
            return;
        }


        const homepage =
            normalized.homepage;


        const profile =
            appState.profile;


        const homepageProfile =
            homepage?.[profile];


        const focus =
            homepageProfile?.focus ??
            homepageProfile?.items ??
            homepageProfile?.highlights;


        const focusItems =
            normalizeTextItems(
                focus
            );


        if (
            focusItems.length > 0
        ) {

            container.innerHTML =
                focusItems
                    .slice(0, 6)
                    .map(
                        function (item, index) {

                            return `
                                <article class="focus-card">

                                    <span class="focus-number">
                                        ${String(
                                            index + 1
                                        ).padStart(
                                            2,
                                            "0"
                                        )}
                                    </span>

                                    <h3>
                                        ${escapeHtml(
                                            item.title ||
                                            "Mausam insight"
                                        )}
                                    </h3>

                                    <p>
                                        ${escapeHtml(
                                            item.text ||
                                            item.description ||
                                            String(item)
                                        )}
                                    </p>

                                </article>
                            `;

                        }
                    )
                    .join("");

            return;

        }


        /* -----------------------------------------------
           Fallback using personalized/rules
        ------------------------------------------------ */

        const fallback =
            [];


        collectText(
            normalized.rules,
            fallback,
            [
                "recommendations",
                "recommendation",
                "advice",
                "tips",
                "message"
            ]
        );


        collectText(
            normalized.personalized,
            fallback,
            [
                "recommendations",
                "recommendation",
                "advice",
                "tips"
            ]
        );


        const items =
            unique(
                fallback
                    .map(
                        cleanDisplayText
                    )
                    .filter(Boolean)
            )
            .slice(0, 6);


        if (
            items.length === 0
        ) {

            container.innerHTML =
                emptyState(
                    "Personalized insights will appear here."
                );

            return;

        }


        container.innerHTML =
            items
                .map(
                    function (text, index) {

                        return `
                            <article class="focus-card">

                                <span class="focus-number">
                                    ${String(
                                        index + 1
                                    ).padStart(
                                        2,
                                        "0"
                                    )}
                                </span>

                                <h3>
                                    Mausam insight
                                </h3>

                                <p>
                                    ${escapeHtml(
                                        text
                                    )}
                                </p>

                            </article>
                        `;

                    }
                )
                .join("");

    }


    /* =====================================================
       HEALTH / AIR QUALITY
    ====================================================== */

    function renderHealth(
        airQuality
    ) {

        const panel =
            $("healthPanel");

        const content =
            $("healthContent");


        if (
            !panel ||
            !content
        ) {
            return;
        }


        if (
            !airQuality ||
            !isObject(airQuality)
        ) {

            panel.classList.add(
                "hidden"
            );

            return;

        }


        panel.classList.remove(
            "hidden"
        );


        const cards =
            extractInfoCards(
                airQuality,
                [
                    [
                        "AQI",
                        [
                            "aqi",
                            "air_quality_index",
                            "airQualityIndex"
                        ]
                    ],
                    [
                        "PM2.5",
                        [
                            "pm2_5",
                            "pm25",
                            "pm2.5"
                        ]
                    ],
                    [
                        "PM10",
                        [
                            "pm10"
                        ]
                    ],
                    [
                        "Status",
                        [
                            "status",
                            "category",
                            "level"
                        ]
                    ],
                    [
                        "Health advice",
                        [
                            "advice",
                            "recommendation",
                            "message"
                        ]
                    ]
                ]
            );


        content.innerHTML =
            cards.length > 0
                ? cards
                    .map(
                        renderInfoCard
                    )
                    .join("")
                : emptyState(
                    "Air-quality details are available, but the response fields were not recognized."
                );

    }


    /* =====================================================
       MARINE
    ====================================================== */

    function renderMarine(
        marine
    ) {

        const panel =
            $("marinePanel");

        const content =
            $("marineContent");


        if (
            !panel ||
            !content
        ) {
            return;
        }


        if (
            !marine ||
            !isObject(marine)
        ) {

            panel.classList.add(
                "hidden"
            );

            return;

        }


        panel.classList.remove(
            "hidden"
        );


        const cards =
            extractInfoCards(
                marine,
                [
                    [
                        "Wave height",
                        [
                            "wave_height",
                            "waveHeight",
                            "waves"
                        ]
                    ],
                    [
                        "Wave direction",
                        [
                            "wave_direction",
                            "waveDirection"
                        ]
                    ],
                    [
                        "Water temperature",
                        [
                            "water_temperature",
                            "waterTemperature",
                            "sea_temperature"
                        ]
                    ],
                    [
                        "Wind",
                        [
                            "wind_speed",
                            "windSpeed"
                        ]
                    ],
                    [
                        "Sea condition",
                        [
                            "condition",
                            "status",
                            "sea_condition"
                        ]
                    ]
                ]
            );


        content.innerHTML =
            cards.length > 0
                ? cards
                    .map(
                        renderInfoCard
                    )
                    .join("")
                : emptyState(
                    "Marine information is available, but the response fields were not recognized."
                );

    }


    /* =====================================================
       TRAVELER
    ====================================================== */

    function renderTraveler(
        traveler
    ) {

        const panel =
            $("travelerResultPanel");

        const content =
            $("travelerContent");


        if (
            !panel ||
            !content
        ) {
            return;
        }


        if (
            appState.profile !== "traveler"
        ) {

            panel.classList.add(
                "hidden"
            );

            return;

        }


        panel.classList.remove(
            "hidden"
        );


        if (
            !traveler ||
            !isObject(traveler)
        ) {

            content.innerHTML =
                emptyState(
                    "Traveler information was not returned by the backend."
                );

            return;

        }


        const cards =
            extractInfoCards(
                traveler,
                [
                    [
                        "Destination",
                        [
                            "destination",
                            "destination_name"
                        ]
                    ],
                    [
                        "Transport",
                        [
                            "transport",
                            "mode"
                        ]
                    ],
                    [
                        "Travel days",
                        [
                            "days",
                            "trip_days"
                        ]
                    ],
                    [
                        "Departure",
                        [
                            "departure",
                            "departure_time",
                            "departureTime"
                        ]
                    ],
                    [
                        "Travel advice",
                        [
                            "advice",
                            "recommendation",
                            "message",
                            "summary"
                        ]
                    ]
                ]
            );


        content.innerHTML =
            cards.length > 0
                ? cards
                    .map(
                        renderInfoCard
                    )
                    .join("")
                : renderObjectAsCards(
                    traveler
                );

    }


    /* =====================================================
       RECOMMENDATIONS
    ====================================================== */

    function renderRecommendations(
        normalized
    ) {

        const container =
            $("recommendationsGrid");


        if (!container) {
            return;
        }


        const sources = [

            normalized.rules?.recommendations,

            normalized.rules?.recommendation,

            normalized.rules?.advice,

            normalized.personalized?.recommendations,

            normalized.personalized?.recommendation,

            normalized.raw?.recommendations

        ];


        let items = [];


        sources.forEach(
            function (source) {

                items =
                    items.concat(
                        normalizeTextItems(
                            source
                        )
                    );

            }
        );


        items =
            dedupeObjects(
                items
            );


        if (
            items.length === 0
        ) {

            container.innerHTML =
                emptyState(
                    "Personalized recommendations will appear here."
                );

            return;

        }


        container.innerHTML =
            items
                .slice(0, 9)
                .map(
                    function (item) {

                        const title =
                            item.title ||
                            item.name ||
                            "Recommendation";


                        const text =
                            item.text ||
                            item.description ||
                            item.message ||
                            item.advice ||
                            String(item);


                        return `
                            <article class="recommendation-card">

                                <h3>
                                    ${escapeHtml(
                                        title
                                    )}
                                </h3>

                                <p>
                                    ${escapeHtml(
                                        text
                                    )}
                                </p>

                            </article>
                        `;

                    }
                )
                .join("");

    }


    /* =====================================================
       DAY PLAN
    ====================================================== */

    function renderDayPlan(
        dayPlan
    ) {

        const container =
            $("dayPlan");


        if (!container) {
            return;
        }


        const items =
            normalizePlanItems(
                dayPlan
            );


        if (
            items.length === 0
        ) {

            container.innerHTML =
                emptyState(
                    "Your personalized day plan will appear here."
                );

            return;

        }


        container.innerHTML =
            items
                .slice(0, 12)
                .map(
                    function (item) {

                        return `
                            <article class="plan-item">

                                <div class="plan-time">
                                    ${escapeHtml(
                                        item.time ||
                                        item.period ||
                                        ""
                                    )}
                                </div>

                                <div class="plan-content">

                                    <h3>
                                        ${escapeHtml(
                                            item.title ||
                                            item.activity ||
                                            "Weather-aware plan"
                                        )}
                                    </h3>

                                    <p>
                                        ${escapeHtml(
                                            item.description ||
                                            item.text ||
                                            item.advice ||
                                            ""
                                        )}
                                    </p>

                                </div>

                            </article>
                        `;

                    }
                )
                .join("");

    }


    /* =====================================================
       PROFILE BADGE
    ====================================================== */

    function renderProfileBadge() {

        const fallback =
            PROFILE_FALLBACKS[
                appState.profile
            ] ||
            PROFILE_FALLBACKS.health;


        const backendProfile =
            appState.data?.profile_name;


        setText(
            "profileBadgeIcon",
            fallback.icon
        );


        setText(
            "profileBadgeName",
            backendProfile ||
            fallback.name
        );

    }


    /* =====================================================
       INFO CARDS
    ====================================================== */

    function extractInfoCards(
        object,
        definitions
    ) {

        if (
            !object ||
            !isObject(object)
        ) {

            return [];

        }


        return definitions
            .map(
                function (definition) {

                    const label =
                        definition[0];

                    const keys =
                        definition[1];


                    const value =
                        getValueByKeys(
                            object,
                            keys
                        );


                    if (
                        value === undefined ||
                        value === null ||
                        value === ""
                    ) {

                        return null;

                    }


                    return {

                        label:
                            label,

                        value:
                            formatGenericValue(
                                value
                            )

                    };

                }
            )
            .filter(Boolean);

    }


    function renderInfoCard(
        card
    ) {

        return `
            <article class="info-card">

                <span>
                    ${escapeHtml(
                        card.label
                    )}
                </span>

                <strong>
                    ${escapeHtml(
                        card.value
                    )}
                </strong>

            </article>
        `;

    }


    function renderObjectAsCards(
        object
    ) {

        const entries =
            Object.entries(
                object
            )
            .filter(
                function (entry) {

                    return (
                        entry[1] !== null &&
                        entry[1] !== undefined &&
                        typeof entry[1] !== "object"
                    );

                }
            )
            .slice(0, 9);


        if (
            entries.length === 0
        ) {

            return emptyState(
                "No displayable details available."
            );

        }


        return entries
            .map(
                function (entry) {

                    return renderInfoCard({

                        label:
                            prettifyKey(
                                entry[0]
                            ),

                        value:
                            formatGenericValue(
                                entry[1]
                            )

                    });

                }
            )
            .join("");

    }


    /* =====================================================
       FORECAST NORMALIZATION
    ====================================================== */

    function normalizeForecastRows(
        source
    ) {

        if (
            !source
        ) {

            return [];

        }


        /* -----------------------------------------------
           Array of objects
        ------------------------------------------------ */

        if (
            Array.isArray(source)
        ) {

            return source
                .map(
                    function (item) {

                        if (
                            isObject(item)
                        ) {

                            return {
                                ...item
                            };

                        }

                        return {
                            value: item
                        };

                    }
                );

        }


        /* -----------------------------------------------
           Object containing arrays
        ------------------------------------------------ */

        if (
            isObject(source)
        ) {

            const keys =
                Object.keys(
                    source
                );


            const arrayKeys =
                keys.filter(
                    function (key) {

                        return Array.isArray(
                            source[key]
                        );

                    }
                );


            if (
                arrayKeys.length === 0
            ) {

                return [source];

            }


            let length = 0;


            arrayKeys.forEach(
                function (key) {

                    length =
                        Math.max(
                            length,
                            source[key].length
                        );

                }
            );


            const rows =
                [];


            for (
                let index = 0;
                index < length;
                index++
            ) {

                const row = {};


                keys.forEach(
                    function (key) {

                        const value =
                            source[key];


                        if (
                            Array.isArray(value)
                        ) {

                            row[key] =
                                value[index];

                        } else {

                            row[key] =
                                value;

                        }

                    }
                );


                rows.push(
                    row
                );

            }


            return rows;

        }


        return [];

    }


    /* =====================================================
       NORMALIZE STATES
    ====================================================== */

    function normalizeStates(
        response
    ) {

        const source =
            response?.states ??
            response;


        if (
            Array.isArray(source)
        ) {

            return source;

        }


        if (
            isObject(source)
        ) {

            return Object.keys(
                source
            );

        }


        return [];

    }


    /* =====================================================
       NORMALIZE DISTRICTS
    ====================================================== */

    function normalizeDistricts(
        response
    ) {

        const source =
            response?.districts ??
            response;


        if (
            Array.isArray(source)
        ) {

            return source;

        }


        if (
            isObject(source)
        ) {

            return Object.keys(
                source
            );

        }


        return [];

    }


    /* =====================================================
       NORMALIZE PROFILES
    ====================================================== */

    function normalizeProfiles(
        response
    ) {

        const source =
            response?.profiles ??
            response;


        if (
            Array.isArray(source)
        ) {

            const result = {};


            source.forEach(
                function (profile) {

                    if (
                        typeof profile === "string"
                    ) {

                        result[profile] = {
                            name:
                                profile
                        };

                        return;

                    }


                    if (
                        isObject(profile)
                    ) {

                        const id =
                            profile.id ??
                            profile.profile ??
                            profile.key ??
                            profile.name;


                        if (id) {

                            result[
                                String(id).toLowerCase()
                            ] =
                                profile;

                        }

                    }

                }
            );


            return result;

        }


        if (
            isObject(source)
        ) {

            return source;

        }


        return {};

    }


    /* =====================================================
       API REQUEST
    ====================================================== */

    async function apiRequest(
        path,
        params = {}
    ) {

        const url =
            new URL(
                path,
                window.location.origin
            );


        Object.entries(
            params
        )
        .forEach(
            function ([key, value]) {

                if (
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                ) {

                    url.searchParams.set(
                        key,
                        String(value)
                    );

                }

            }
        );


        const response =
            await fetch(
                url.toString(),
                {
                    method: "GET",
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        let data = null;


        try {

            data =
                await response.json();

        } catch (error) {

            data = null;

        }


        if (
            !response.ok
        ) {

            const detail =
                data?.detail ??
                data?.message ??
                `Request failed with status ${response.status}.`;


            throw new Error(
                typeof detail === "string"
                    ? detail
                    : JSON.stringify(detail)
            );

        }


        return data;

    }


    /* =====================================================
       VALUE HELPERS
    ====================================================== */

    function firstValue(
        ...values
    ) {

        for (
            const value of values
        ) {

            if (
                value !== undefined &&
                value !== null &&
                value !== ""
            ) {

                return value;

            }

        }


        return null;

    }


    function firstObject(
        ...values
    ) {

        for (
            const value of values
        ) {

            if (
                isObject(value)
            ) {

                return value;

            }

        }


        return null;

    }


    function firstArray(
        ...values
    ) {

        for (
            const value of values
        ) {

            if (
                Array.isArray(value)
            ) {

                return value;

            }

        }


        return null;

    }


    function isObject(
        value
    ) {

        return (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value)
        );

    }


    /* =====================================================
       RECURSIVE OBJECT SEARCH
    ====================================================== */

    function findObjectByKey(
        root,
        wantedKey
    ) {

        if (
            !root ||
            typeof root !== "object"
        ) {

            return null;

        }


        if (
            Object.prototype.hasOwnProperty.call(
                root,
                wantedKey
            )
        ) {

            const value =
                root[wantedKey];


            if (
                isObject(value)
            ) {

                return value;

            }

        }


        for (
            const key of Object.keys(root)
        ) {

            const value =
                root[key];


            if (
                value &&
                typeof value === "object"
            ) {

                const result =
                    findObjectByKey(
                        value,
                        wantedKey
                    );


                if (result) {
                    return result;
                }

            }

        }


        return null;

    }


    function findArrayByKey(
        root,
        wantedKey
    ) {

        if (
            !root ||
            typeof root !== "object"
        ) {

            return null;

        }


        if (
            Object.prototype.hasOwnProperty.call(
                root,
                wantedKey
            )
        ) {

            const value =
                root[wantedKey];


            if (
                Array.isArray(value)
            ) {

                return value;

            }

        }


        for (
            const key of Object.keys(root)
        ) {

            const value =
                root[key];


            if (
                value &&
                typeof value === "object"
            ) {

                const result =
                    findArrayByKey(
                        value,
                        wantedKey
                    );


                if (result) {
                    return result;
                }

            }

        }


        return null;

    }


    /* =====================================================
       VALUE BY KEYS
    ====================================================== */

    function getValueByKeys(
        object,
        keys
    ) {

        if (
            !object ||
            typeof object !== "object"
        ) {

            return undefined;

        }


        for (
            const key of keys
        ) {

            if (
                Object.prototype.hasOwnProperty.call(
                    object,
                    key
                )
            ) {

                const value =
                    object[key];


                if (
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                ) {

                    return value;

                }

            }

        }


        return undefined;

    }


    /* =====================================================
       NUMERIC HELPERS
    ====================================================== */

    function getNumericValue(
        object,
        keys
    ) {

        const value =
            getValueByKeys(
                object,
                keys
            );


        return toNumber(
            value
        );

    }


    function getRowNumeric(
        row,
        keys
    ) {

        return getNumericValue(
            row,
            keys
        );

    }


    function toNumber(
        value
    ) {

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {

            return null;

        }


        const number =
            Number(value);


        return Number.isFinite(number)
            ? number
            : null;

    }


    /* =====================================================
       WEATHER CONDITION
    ====================================================== */

    function getRowCondition(
        row
    ) {

        if (!row) {
            return "clear";
        }


        const direct =
            firstValue(

                row.condition,

                row.weather,

                row.description,

                row.summary

            );


        if (direct) {

            return String(
                direct
            );

        }


        const code =
            firstValue(

                row.weather_code,

                row.weatherCode,

                row.code

            );


        if (
            code !== null &&
            code !== undefined &&
            window.MausamTheme
        ) {

            return window.MausamTheme
                .weatherCodeToCondition(
                    code
                );

        }


        const rain =
            toNumber(
                firstValue(
                    row.rain,
                    row.precipitation
                )
            );


        if (
            rain !== null &&
            rain > 0
        ) {

            return "rain";

        }


        return "clear";

    }


    /* =====================================================
       FORMATTERS
    ====================================================== */

    function formatNumber(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "—";

        }


        const number =
            toNumber(
                value
            );


        if (
            number === null
        ) {

            return String(
                value
            );

        }


        return Number.isInteger(number)
            ? String(number)
            : number.toFixed(1);

    }


    function formatTemperature(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "—";

        }


        const number =
            toNumber(
                value
            );


        if (
            number === null
        ) {

            return String(
                value
            );

        }


        return `${formatNumber(number)}°`;

    }


    function formatPercent(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "—";

        }


        const number =
            toNumber(
                value
            );


        if (
            number === null
        ) {

            return String(
                value
            );

        }


        return `${formatNumber(number)}%`;

    }


    function formatWind(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "—";

        }


        const number =
            toNumber(
                value
            );


        if (
            number === null
        ) {

            return String(
                value
            );

        }


        return `${formatNumber(number)} km/h`;

    }


    function formatRain(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "—";

        }


        const number =
            toNumber(
                value
            );


        if (
            number === null
        ) {

            return String(
                value
            );

        }


        return `${formatNumber(number)} mm`;

    }


    function formatForecastTime(
        value
    ) {

        if (!value) {
            return "";
        }


        const date =
            parseDate(
                value
            );


        if (
            !date
        ) {

            return String(
                value
            );

        }


        return new Intl.DateTimeFormat(
            undefined,
            {
                hour: "numeric",
                minute: "2-digit"
            }
        ).format(
            date
        );

    }


    function formatTimeOnly(
        value
    ) {

        if (!value) {
            return "—";
        }


        /*
         * If backend gives a simple "06:15",
         * don't parse it as a date.
         */

        if (
            /^\d{1,2}:\d{2}/.test(
                String(value)
            )
        ) {

            return String(value)
                .slice(0, 5);

        }


        return formatForecastTime(
            value
        );

    }


    function formatDayName(
        value,
        index
    ) {

        const date =
            parseDate(
                value
            );


        if (!date) {

            return index === 0
                ? "Today"
                : `Day ${index + 1}`;

        }


        if (
            index === 0
        ) {

            return "Today";

        }


        return new Intl.DateTimeFormat(
            undefined,
            {
                weekday: "short"
            }
        ).format(
            date
        );

    }


    function parseDate(
        value
    ) {

        if (
            !value
        ) {

            return null;

        }


        const date =
            new Date(
                value
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return null;

        }


        return date;

    }


    function getTodayDate() {

        const now =
            new Date();


        return (
            `${now.getFullYear()}-` +
            `${String(
                now.getMonth() + 1
            ).padStart(2, "0")}-` +
            `${String(
                now.getDate()
            ).padStart(2, "0")}`
        );

    }


    /* =====================================================
       WEATHER LABEL
    ====================================================== */

    function formatWeatherLabel(
        condition
    ) {

        if (!condition) {
            return "Weather";
        }


        const value =
            String(
                condition
            )
            .trim()
            .toLowerCase();


        if (
            value === "clear" ||
            value === "sunny"
        ) {

            return "Clear skies";

        }


        if (
            value === "cloudy"
        ) {

            return "Cloudy";

        }


        if (
            value === "rain"
        ) {

            return "Rainy";

        }


        if (
            value === "storm"
        ) {

            return "Storm conditions";

        }


        return String(
            condition
        );

    }


    /* =====================================================
       MOON PHASE
    ====================================================== */

    function calculateMoonPhase(
        dateValue
    ) {

        const date =
            parseDate(
                dateValue
            ) ||
            new Date();


        /*
         * Approximate lunar phase calculation.
         * This is only used for visual moon phase,
         * not as backend weather data.
         */

        const knownNewMoon =
            new Date(
                "2000-01-06T18:14:00Z"
            );


        const millisecondsPerDay =
            86400000;


        const synodicMonth =
            29.530588853;


        const daysSince =
            (
                date.getTime() -
                knownNewMoon.getTime()
            ) /
            millisecondsPerDay;


        let phase =
            daysSince %
            synodicMonth;


        if (
            phase < 0
        ) {

            phase +=
                synodicMonth;

        }


        const fraction =
            phase /
            synodicMonth;


        if (
            fraction < 0.03 ||
            fraction >= 0.97
        ) {

            return {
                name: "New Moon",
                icon: "●"
            };

        }


        if (
            fraction < 0.22
        ) {

            return {
                name: "Waxing Crescent",
                icon: "☽"
            };

        }


        if (
            fraction < 0.28
        ) {

            return {
                name: "First Quarter",
                icon: "◐"
            };

        }


        if (
            fraction < 0.47
        ) {

            return {
                name: "Waxing Gibbous",
                icon: "◕"
            };

        }


        if (
            fraction < 0.53
        ) {

            return {
                name: "Full Moon",
                icon: "○"
            };

        }


        if (
            fraction < 0.72
        ) {

            return {
                name: "Waning Gibbous",
                icon: "◑"
            };

        }


        if (
            fraction < 0.78
        ) {

            return {
                name: "Last Quarter",
                icon: "◒"
            };

        }


        return {
            name: "Waning Crescent",
            icon: "☾"
        };

    }


    /* =====================================================
       NORMALIZE TEXT ITEMS
    ====================================================== */

    function normalizeTextItems(
        source
    ) {

        if (
            source === undefined ||
            source === null
        ) {

            return [];

        }


        if (
            typeof source === "string" ||
            typeof source === "number"
        ) {

            return [
                {
                    title:
                        "Mausam insight",

                    text:
                        String(source)
                }
            ];

        }


        if (
            Array.isArray(source)
        ) {

            return source
                .map(
                    function (item) {

                        if (
                            typeof item === "string" ||
                            typeof item === "number"
                        ) {

                            return {
                                title:
                                    "Mausam insight",

                                text:
                                    String(item)
                            };

                        }


                        if (
                            isObject(item)
                        ) {

                            return item;

                        }


                        return null;

                    }
                )
                .filter(Boolean);

        }


        if (
            isObject(source)
        ) {

            return Object.entries(
                source
            )
            .map(
                function ([key, value]) {

                    if (
                        typeof value === "string" ||
                        typeof value === "number"
                    ) {

                        return {

                            title:
                                prettifyKey(key),

                            text:
                                String(value)

                        };

                    }


                    if (
                        isObject(value)
                    ) {

                        return {

                            title:
                                value.title ||
                                value.name ||
                                prettifyKey(key),

                            text:
                                value.text ||
                                value.description ||
                                value.message ||
                                value.advice ||
                                JSON.stringify(value)

                        };

                    }


                    return null;

                }
            )
            .filter(Boolean);

        }


        return [];

    }


    /* =====================================================
       PLAN ITEMS
    ====================================================== */

    function normalizePlanItems(
        source
    ) {

        if (
            !source
        ) {

            return [];

        }


        if (
            Array.isArray(source)
        ) {

            return source
                .map(
                    function (item) {

                        if (
                            typeof item === "string"
                        ) {

                            return {
                                time: "",
                                title: "Plan",
                                description: item
                            };

                        }


                        if (
                            isObject(item)
                        ) {

                            return item;

                        }


                        return null;

                    }
                )
                .filter(Boolean);

        }


        if (
            isObject(source)
        ) {

            const items =
                [];


            Object.entries(
                source
            )
            .forEach(
                function ([key, value]) {

                    if (
                        Array.isArray(value)
                    ) {

                        value.forEach(
                            function (item) {

                                if (
                                    isObject(item)
                                ) {

                                    items.push({
                                        time:
                                            item.time ||
                                            key,

                                        ...item

                                    });

                                } else {

                                    items.push({

                                        time:
                                            key,

                                        title:
                                            "Plan",

                                        description:
                                            String(item)

                                    });

                                }

                            }
                        );

                        return;

                    }


                    if (
                        isObject(value)
                    ) {

                        items.push({

                            time:
                                value.time ||
                                key,

                            ...value

                        });

                        return;

                    }


                    if (
                        value !== null &&
                        value !== undefined
                    ) {

                        items.push({

                            time:
                                key,

                            title:
                                "Plan",

                            description:
                                String(value)

                        });

                    }

                }
            );


            return items;

        }


        return [];

    }


    /* =====================================================
       GENERIC FORMATTING
    ====================================================== */

    function formatGenericValue(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "—";

        }


        if (
            typeof value === "boolean"
        ) {

            return value
                ? "Yes"
                : "No";

        }


        if (
            typeof value === "object"
        ) {

            return JSON.stringify(
                value
            );

        }


        return String(
            value
        );

    }


    function prettifyKey(
        key
    ) {

        return String(
            key
        )
        .replace(
            /_/g,
            " "
        )
        .replace(
            /([a-z])([A-Z])/g,
            "$1 $2"
        )
        .replace(
            /\b\w/g,
            function (letter) {
                return letter.toUpperCase();
            }
        );

    }


    function cleanDisplayText(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }


        if (
            typeof value === "string"
        ) {

            return value.trim();

        }


        if (
            typeof value === "number" ||
            typeof value === "boolean"
        ) {

            return String(value);

        }


        if (
            isObject(value)
        ) {

            return (
                value.message ||
                value.text ||
                value.description ||
                value.advice ||
                value.title ||
                JSON.stringify(value)
            );

        }


        return String(value);

    }


    /* =====================================================
       COLLECT TEXT
    ====================================================== */

    function collectText(
        object,
        output,
        keys
    ) {

        if (
            !object ||
            typeof object !== "object"
        ) {

            return;

        }


        keys.forEach(
            function (key) {

                const value =
                    object[key];


                if (
                    value === undefined ||
                    value === null
                ) {

                    return;

                }


                if (
                    Array.isArray(value)
                ) {

                    value.forEach(
                        function (item) {

                            const text =
                                cleanDisplayText(
                                    item
                                );


                            if (text) {

                                output.push(
                                    text
                                );

                            }

                        }
                    );

                    return;

                }


                const text =
                    cleanDisplayText(
                        value
                    );


                if (text) {

                    output.push(
                        text
                    );

                }

            }
        );

    }


    /* =====================================================
       DEDUPE
    ====================================================== */

    function unique(
        array
    ) {

        return [
            ...new Set(
                array
            )
        ];

    }


    function dedupeObjects(
        items
    ) {

        const seen =
            new Set();

        const result =
            [];


        items.forEach(
            function (item) {

                const key =
                    JSON.stringify(
                        item
                    );


                if (
                    !seen.has(key)
                ) {

                    seen.add(key);

                    result.push(
                        item
                    );

                }

            }
        );


        return result;

    }


    /* =====================================================
       CLAMP
    ====================================================== */

    function clamp(
        value,
        min,
        max
    ) {

        if (
            Number.isNaN(value)
        ) {

            return min;

        }


        return Math.min(
            Math.max(
                value,
                min
            ),
            max
        );

    }


    /* =====================================================
       EMPTY STATE
    ====================================================== */

    function emptyState(
        message
    ) {

        return `
            <div class="empty-state">
                ${escapeHtml(
                    message
                )}
            </div>
        `;

    }


    /* =====================================================
       ESCAPE HTML
    ====================================================== */

    function escapeHtml(
        value
    ) {

        return String(
            value ?? ""
        )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

    }


    /* =====================================================
       SET TEXT
    ====================================================== */

    function setText(
        id,
        value
    ) {

        const element =
            $(id);


        if (
            element
        ) {

            element.textContent =
                value ??
                "—";

        }

    }


    /* =====================================================
       LOADING
    ====================================================== */

    function showLoading(
        visible
    ) {

        const overlay =
            $("loadingOverlay");


        if (!overlay) {
            return;
        }


        overlay.classList.toggle(
            "hidden",
            !visible
        );

    }


    /* =====================================================
       ERROR
    ====================================================== */

    function showError(
        message
    ) {

        const toast =
            $("errorToast");

        const text =
            $("errorMessage");


        if (!toast) {
            return;
        }


        if (text) {

            text.textContent =
                message ||
                "Something went wrong.";

        }


        toast.classList.remove(
            "hidden"
        );


        clearTimeout(
            showError.timeout
        );


        showError.timeout =
            setTimeout(
                hideError,
                7000
            );

    }


    function hideError() {

        const toast =
            $("errorToast");


        if (toast) {

            toast.classList.add(
                "hidden"
            );

        }

    }


    function getErrorMessage(
        error
    ) {

        if (
            error instanceof Error
        ) {

            return error.message;

        }


        if (
            typeof error === "string"
        ) {

            return error;

        }


        return "Unable to load weather data.";

    }


})();