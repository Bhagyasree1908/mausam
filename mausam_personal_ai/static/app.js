/* =========================================================
   MAUSAM PERSONAL AI
   Frontend Application (merged: new design + old content logic)
   Connects to existing FastAPI backend
   Endpoints used: /states /districts /profiles /personalized-homepage
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
        health:      { name: "Health-conscious",    icon: "♥" },
        fitness:     { name: "Outdoor Fitness",      icon: "↗" },
        beach:       { name: "Beach & Surfer",       icon: "◒" },
        traveler:    { name: "Traveler",             icon: "✈" },
        family:      { name: "Parents & Families",   icon: "◎" },
        agriculture: { name: "Agriculture & Garden", icon: "◈" },
        commuter:    { name: "Commuter",             icon: "→" },
        event:       { name: "Event Planner",        icon: "✦" }
    };


    /* =====================================================
       DOM HELPERS
    ====================================================== */

    function $(id) {
        return document.getElementById(id);
    }

    function $all(selector) {
        return Array.from(document.querySelectorAll(selector));
    }


    /* =====================================================
       INITIALIZATION
    ====================================================== */

    document.addEventListener("DOMContentLoaded", initializeApp);

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

            showError(getErrorMessage(error));

        } finally {

            showLoading(false);

        }

    }


    /* =====================================================
       EVENT BINDINGS  (ONE listener per element — no duplicates)
    ====================================================== */

    function bindEvents() {

        const stateSelect = $("stateSelect");
        if (stateSelect) {
            stateSelect.addEventListener("change", handleStateChange);
        }

        const districtSelect = $("districtSelect");
        if (districtSelect) {
            districtSelect.addEventListener("change", function () {
                appState.district = districtSelect.value;
            });
        }

        const destinationStateSelect = $("destinationStateSelect");
        if (destinationStateSelect) {
            destinationStateSelect.addEventListener("change", handleDestinationStateChange);
        }

        const destinationDistrictSelect = $("destinationDistrictSelect");
        if (destinationDistrictSelect) {
            destinationDistrictSelect.addEventListener("change", function () {
                appState.destinationDistrict = destinationDistrictSelect.value;
            });
        }

        $all(".persona-card").forEach(function (button) {
            button.addEventListener("click", function () {
                const profile = button.dataset.profile;
                selectProfile(profile);
            });
        });

        const loadButton = $("loadWeatherButton");
        if (loadButton) {
            loadButton.addEventListener("click", loadPersonalizedWeather);
        }

        const useMyLocationButton = $("useMyLocationButton");
        if (useMyLocationButton) {
            useMyLocationButton.addEventListener("click", useMyLocation);
        }

        const refreshButton = $("refreshButton");
        if (refreshButton) {
            refreshButton.addEventListener("click", function () {
                if (appState.state && appState.district) {
                    loadPersonalizedWeather();
                } else {
                    showError("Select your state and district first.");
                }
            });
        }

        const languageSelect = $("languageSelect");
        if (languageSelect) {
            languageSelect.addEventListener("change", function () {

                appState.language = languageSelect.value;

                // Re-fetch from the backend in the new language so the
                // localized content it returns actually shows up.
                // (No separate translation engine here — the backend
                // is the source of truth for translated text.)
                if (appState.state && appState.district) {
                    loadPersonalizedWeather();
                }

            });
        }

        const transportSelect = $("transportSelect");
        if (transportSelect) {
            transportSelect.addEventListener("change", function () {
                appState.transport = transportSelect.value;
            });
        }

        const daysInput = $("daysInput");
        if (daysInput) {
            daysInput.addEventListener("change", function () {
                appState.days = clamp(Number(daysInput.value), 1, 7);
                daysInput.value = appState.days;
            });
        }

        const departureDateInput = $("departureDateInput");
        if (departureDateInput) {
            departureDateInput.addEventListener("change", function () {
                appState.departureDate = departureDateInput.value;
            });
        }

        const departureTimeInput = $("departureTimeInput");
        if (departureTimeInput) {
            departureTimeInput.addEventListener("change", function () {
                appState.departureTime = departureTimeInput.value;
            });
        }

        const closeErrorButton = $("closeErrorButton");
        if (closeErrorButton) {
            closeErrorButton.addEventListener("click", hideError);
        }

    }


    /* =====================================================
       DEFAULT DATE
    ====================================================== */

    function setDefaultDepartureDate() {

        const input = $("departureDateInput");
        if (!input) { return; }

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const dateString = `${year}-${month}-${day}`;

        input.value = dateString;
        appState.departureDate = dateString;

    }


    /* =====================================================
       PROFILE SELECTION
    ====================================================== */

    function setInitialProfileTheme() {
        selectProfile(appState.profile, false);
    }

    function selectProfile(profile, loadWeather = true) {

        if (!profile || !PROFILE_FALLBACKS[profile]) {
            profile = "health";
        }

        appState.profile = profile;

        $all(".persona-card").forEach(function (button) {
            button.classList.toggle("active", button.dataset.profile === profile);
        });

        // Apply visual profile theme via existing weather-themes.js API
        if (window.MausamTheme && typeof window.MausamTheme.applyProfileTheme === "function") {
            window.MausamTheme.applyProfileTheme(profile);
        }

        const travelerSection = $("travelerSection");
        if (travelerSection) {
            travelerSection.classList.toggle("hidden", profile !== "traveler");
        }

        renderProfileBadge();

        if (loadWeather && appState.state && appState.district) {
            loadPersonalizedWeather();
        }

    }


    /* =====================================================
       LOAD STATES / PROFILES / DESTINATION STATES
    ====================================================== */

    async function loadStates() {

        const response = await apiRequest("/states");
        const states = normalizeStates(response);

        appState.states = states;

        populateSelect($("stateSelect"), states, "Select state");

        return states;

    }

    async function loadProfiles() {

        try {

            const response = await apiRequest("/profiles");
            appState.profiles = normalizeProfiles(response);

        } catch (error) {

            // Profiles are optional in the UI — fallback names already exist.
            appState.profiles = {};

        }

    }

    async function loadDestinationStates() {

        const destinationSelect = $("destinationStateSelect");
        if (!destinationSelect) { return; }

        populateSelect(destinationSelect, appState.states, "Select destination");

    }


    /* =====================================================
       STATE / DISTRICT CHANGE HANDLERS
    ====================================================== */

    async function handleStateChange(event) {

        const state = event.target.value;

        appState.state = state;
        appState.district = "";

        const districtSelect = $("districtSelect");
        if (!districtSelect) { return; }

        districtSelect.innerHTML = `<option value="">Loading districts...</option>`;
        districtSelect.disabled = true;

        if (!state) {
            districtSelect.innerHTML = `<option value="">Select district</option>`;
            return;
        }

        try {

            const response = await apiRequest("/districts", { state: state });
            const districts = normalizeDistricts(response);

            appState.districts = districts;

            populateSelect(districtSelect, districts, "Select district");

        } catch (error) {

            districtSelect.innerHTML = `<option value="">Unable to load districts</option>`;
            showError(getErrorMessage(error));

        }

    }

    async function handleDestinationStateChange(event) {

        const state = event.target.value;

        appState.destinationState = state;
        appState.destinationDistrict = "";

        const districtSelect = $("destinationDistrictSelect");
        if (!districtSelect) { return; }

        districtSelect.innerHTML = `<option value="">Loading districts...</option>`;
        districtSelect.disabled = true;

        if (!state) {
            districtSelect.innerHTML = `<option value="">Select district</option>`;
            return;
        }

        try {

            const response = await apiRequest("/districts", { state: state });
            const districts = normalizeDistricts(response);

            appState.destinationDistricts = districts;

            populateSelect(districtSelect, districts, "Select district");

        } catch (error) {

            districtSelect.innerHTML = `<option value="">Unable to load districts</option>`;
            showError(getErrorMessage(error));

        }

    }


    /* =====================================================
       USE MY LOCATION (geolocation autofill)

       Additive feature: uses the browser's Geolocation API to
       get the user's coordinates, reverse-geocodes them via a
       free, CORS-friendly, no-API-key-needed public service
       (BigDataCloud's client-side reverse geocode endpoint),
       then fuzzy-matches the returned state/locality names
       against the state/district lists already loaded from
       our own backend (/states, /districts) and selects them.

       Manual state/district selection keeps working exactly
       as before — this is purely a shortcut on top of it.
    ====================================================== */

    async function useMyLocation() {

        if (!("geolocation" in navigator)) {
            showError("Geolocation is not supported by this browser.");
            return;
        }

        if (appState.states.length === 0) {
            showError("Please wait for the location list to finish loading, then try again.");
            return;
        }

        const button = $("useMyLocationButton");
        const originalButtonHtml = button ? button.innerHTML : null;

        if (button) {
            button.disabled = true;
            button.innerHTML = "…";
        }

        showLoading(true);
        hideError();

        try {

            const position = await new Promise(function (resolve, reject) {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 12000,
                    maximumAge: 300000
                });
            });

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const place = await reverseGeocode(latitude, longitude);

            if (!place) {
                showError("Couldn't determine your location details. Please select your state and district manually.");
                return;
            }

            const matchedState = fuzzyMatchInList(place.state, appState.states);

            if (!matchedState) {
                showError(`Detected location (${place.state || "unknown state"}) isn't in our supported list. Please select manually.`);
                return;
            }

            const stateSelect = $("stateSelect");
            if (stateSelect) {
                stateSelect.value = matchedState;
                appState.state = matchedState;
            }

            // Reuse the existing state-change flow to load districts
            // for the matched state (same code path as manual selection).
            await handleStateChange({ target: { value: matchedState } });

            const districtCandidates = [place.district, place.locality, place.city].filter(Boolean);
            let matchedDistrict = null;

            for (const candidate of districtCandidates) {
                matchedDistrict = fuzzyMatchInList(candidate, appState.districts);
                if (matchedDistrict) { break; }
            }

            const districtSelect = $("districtSelect");

            if (matchedDistrict && districtSelect) {

                districtSelect.value = matchedDistrict;
                appState.district = matchedDistrict;

                // Location fully resolved — load weather right away,
                // same as clicking "Show my weather" would.
                loadPersonalizedWeather();

            } else {

                showError("State detected. Please pick your exact district from the list.");

            }

        } catch (error) {

            if (error && error.code === 1) {
                showError("Location permission denied. Please select your state and district manually.");
            } else if (error && error.code === 2) {
                showError("Your location is currently unavailable. Please select manually.");
            } else if (error && error.code === 3) {
                showError("Getting your location timed out. Please try again or select manually.");
            } else {
                showError(getErrorMessage(error));
            }

        } finally {

            showLoading(false);

            if (button) {
                button.disabled = false;
                button.innerHTML = originalButtonHtml;
            }

        }

    }


    /* =====================================================
       REVERSE GEOCODE (coords -> state / district-ish names)
    ====================================================== */

    async function reverseGeocode(latitude, longitude) {

        const url =
            `https://api.bigdatacloud.net/data/reverse-geocode-client` +
            `?latitude=${encodeURIComponent(latitude)}` +
            `&longitude=${encodeURIComponent(longitude)}` +
            `&localityLanguage=en`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Reverse geocoding failed with status ${response.status}.`);
        }

        const data = await response.json();

        // Try to pull an India-style "district" out of the admin
        // hierarchy the API returns, when available.
        let districtFromAdmin = null;

        if (Array.isArray(data.localityInfo?.administrative)) {
            const adminMatch = data.localityInfo.administrative.find(function (level) {
                return /district/i.test(level.name || "");
            });
            if (adminMatch) {
                districtFromAdmin = adminMatch.name.replace(/\s*district\s*/i, "").trim();
            }
        }

        return {
            state: data.principalSubdivision || null,
            district: districtFromAdmin,
            city: data.city || null,
            locality: data.locality || null
        };

    }


    /* =====================================================
       FUZZY MATCH A DETECTED NAME AGAINST A KNOWN LIST
    ====================================================== */

    function fuzzyMatchInList(name, list) {

        if (!name || !Array.isArray(list) || list.length === 0) {
            return null;
        }

        const normalize = function (value) {
            return String(value).trim().toLowerCase().replace(/\s+/g, " ");
        };

        const target = normalize(name);

        // Exact match (case-insensitive)
        const exact = list.find(function (item) {
            const itemName = typeof item === "object" ? (item.name || item.label || item.value) : item;
            return normalize(itemName) === target;
        });

        if (exact) {
            return typeof exact === "object" ? (exact.value ?? exact.name) : exact;
        }

        // Substring match in either direction (handles "Coimbatore"
        // vs "Coimbatore District", or minor naming differences).
        const partial = list.find(function (item) {
            const itemName = typeof item === "object" ? (item.name || item.label || item.value) : item;
            const normalizedItem = normalize(itemName);
            return normalizedItem.includes(target) || target.includes(normalizedItem);
        });

        if (partial) {
            return typeof partial === "object" ? (partial.value ?? partial.name) : partial;
        }

        return null;

    }


    /* =====================================================
       POPULATE SELECT
    ====================================================== */

    function populateSelect(select, values, placeholder) {

        if (!select) { return; }

        select.innerHTML = "";

        const placeholderOption = document.createElement("option");
        placeholderOption.value = "";
        placeholderOption.textContent = placeholder;
        select.appendChild(placeholderOption);

        values.forEach(function (item) {

            const option = document.createElement("option");

            if (typeof item === "object" && item !== null) {

                const value = item.value ?? item.id ?? item.name;
                const label = item.label ?? item.name ?? item.value;

                option.value = String(value ?? "");
                option.textContent = String(label ?? value ?? "");

            } else {

                option.value = String(item);
                option.textContent = String(item);

            }

            select.appendChild(option);

        });

        select.disabled = values.length === 0;

    }


    /* =====================================================
       LOAD PERSONALIZED WEATHER
    ====================================================== */

    async function loadPersonalizedWeather() {

        if (!validateLocation()) { return; }

        if (appState.profile === "traveler" && !validateTraveler()) { return; }

        appState.state = $("stateSelect")?.value || appState.state;
        appState.district = $("districtSelect")?.value || appState.district;

        const params = {
            state: appState.state,
            district: appState.district,
            profile: appState.profile,
            language: appState.language
        };

        if (appState.profile === "traveler") {
            params.destination_state = appState.destinationState;
            params.destination_district = appState.destinationDistrict;
            params.transport = appState.transport;
            params.days = appState.days;
            params.departure_date = appState.departureDate;
            params.departure_time = appState.departureTime;
        }

        showLoading(true);
        hideError();

        try {

            const response = await apiRequest("/personalized-homepage", params);

            appState.data = response;

            renderDashboard(response);

            const dashboard = $("dashboard");
            if (dashboard) {
                dashboard.classList.remove("hidden");
            }

            setTimeout(function () {
                dashboard?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);

        } catch (error) {

            showError(getErrorMessage(error));

        } finally {

            showLoading(false);

        }

    }


    /* =====================================================
       VALIDATION
    ====================================================== */

    function validateLocation() {

        const state = $("stateSelect")?.value || appState.state;
        const district = $("districtSelect")?.value || appState.district;

        if (!state) {
            showError("Please select your state.");
            return false;
        }

        if (!district) {
            showError("Please select your district.");
            return false;
        }

        appState.state = state;
        appState.district = district;

        return true;

    }

    function validateTraveler() {

        const destinationState = $("destinationStateSelect")?.value || appState.destinationState;
        const destinationDistrict = $("destinationDistrictSelect")?.value || appState.destinationDistrict;
        const transport = $("transportSelect")?.value || appState.transport;
        const days = clamp(Number($("daysInput")?.value || appState.days), 1, 7);
        const departureDate = $("departureDateInput")?.value || appState.departureDate;
        const departureTime = $("departureTimeInput")?.value || appState.departureTime;

        if (!destinationState) {
            showError("Please select your destination state.");
            return false;
        }

        if (!destinationDistrict) {
            showError("Please select your destination district.");
            return false;
        }

        if (!transport) {
            showError("Please select your transport.");
            return false;
        }

        if (!departureDate) {
            showError("Please select your departure date.");
            return false;
        }

        if (!departureTime) {
            showError("Please select your departure time.");
            return false;
        }

        appState.destinationState = destinationState;
        appState.destinationDistrict = destinationDistrict;
        appState.transport = transport;
        appState.days = days;
        appState.departureDate = departureDate;
        appState.departureTime = departureTime;

        return true;

    }


    /* =====================================================
       RENDER DASHBOARD (top-level orchestration)
    ====================================================== */

    function renderDashboard(data) {

        const normalized = normalizeBackendData(data);

        const condition = window.MausamTheme
            ? window.MausamTheme.detectWeatherCondition(normalized.current)
            : "clear";

        if (window.MausamTheme && typeof window.MausamTheme.applyWeatherTheme === "function") {
            window.MausamTheme.applyWeatherTheme(condition, appState.profile);
        }

        renderLocation(normalized);
        renderCurrentWeather(normalized.current, condition);
        renderWarning(normalized);
        renderHourly(normalized.hourly);
        renderDaily(normalized.daily);
        renderSunTimeline(normalized.daily);
        renderMoonTimeline(normalized.daily, normalized.location);
        renderFocus(normalized);
        renderHealth(normalized.airQuality);
        renderMarine(normalized.marine);
        renderTraveler(normalized.traveler);
        renderRecommendations(normalized);
        renderDayPlan(normalized.dayPlan);
        renderProfileBadge();

    }


    /* =====================================================
       NORMALIZE BACKEND RESPONSE
    ====================================================== */

    function normalizeBackendData(data) {

        const personalized = isObject(data?.personalized) ? data.personalized : {};

        const location = firstObject(
            data?.location,
            personalized?.location,
            findObjectByKey(data, "location")
        ) || {};

        const rawCurrent = firstObject(
            findObjectByKey(data, "current"),
            findObjectByKey(personalized, "current"),
            findObjectByKey(data, "current_weather"),
            findObjectByKey(personalized, "current_weather")
        ) || {};

        // Merge in profile-specific current-weather overrides without letting
        // null/undefined values from the personalized block wipe out real data.
        const personalizedCurrent = firstObject(
            personalized?.current,
            personalized?.current_weather
        ) || {};

        const current = { ...rawCurrent };

        Object.entries(personalizedCurrent).forEach(function ([key, value]) {
            if (value !== undefined && value !== null && value !== "") {
                current[key] = value;
            }
        });

        // Common backend aliases -> canonical field names
        current.temperature = firstValue(current.temperature, current.temperature_2m, current.temp);
        current.feels_like = firstValue(current.feels_like, current.apparent_temperature, current.feelsLike);
        current.humidity = firstValue(current.humidity, current.relative_humidity_2m, current.relative_humidity);
        current.wind_speed = firstValue(current.wind_speed, current.wind_speed_10m, current.windSpeed, current.wind);
        current.rain = firstValue(current.rain, current.rain_amount, current.precipitation);
        current.uv = firstValue(current.uv, current.uv_index, current.uvIndex);
        current.weather_code = firstValue(current.weather_code, current.weathercode, current.code);

        // Try plain array-of-rows first. Many weather backends (Open-Meteo
        // style) instead return an OBJECT of parallel arrays, e.g.
        // { time: [...], temperature: [...], rain_probability: [...] }.
        // normalizeForecastRows() already knows how to zip that shape into
        // per-hour/per-day rows, so fall back to it here instead of
        // leaving hourly/daily as null (which caused the "not available"
        // empty state even when data actually existed).

        const hourly = firstArray(
            findArrayByKey(data, "hourly"),
            findArrayByKey(personalized, "hourly"),
            findArrayByKey(data, "hourly_forecast"),
            findArrayByKey(personalized, "hourly_forecast")
        ) || firstObject(
            findObjectByKey(data, "hourly"),
            findObjectByKey(personalized, "hourly"),
            findObjectByKey(data, "hourly_forecast"),
            findObjectByKey(personalized, "hourly_forecast")
        );

        const daily = firstArray(
            findArrayByKey(data, "daily"),
            findArrayByKey(personalized, "daily"),
            findArrayByKey(data, "daily_forecast"),
            findArrayByKey(personalized, "daily_forecast")
        ) || firstObject(
            findObjectByKey(data, "daily"),
            findObjectByKey(personalized, "daily"),
            findObjectByKey(data, "daily_forecast"),
            findObjectByKey(personalized, "daily_forecast")
        );

        // UV fallback: this backend's "current" block never includes
        // uv_index at all (confirmed from weather_service.py — only the
        // hourly params list has it), so current.uv is always empty at
        // this point. Pull it from the hourly row matching "now" instead
        // of leaving it blank. (Rain is left alone — the backend's
        // current.rain is real data, a 0 there is a genuine "not
        // raining right now" reading, not a missing field.)
        if (current.uv === null || current.uv === undefined || current.uv === "") {

            const hourlyRowsForUv = normalizeForecastRows(hourly);
            const now = new Date();

            const matchedHourRow =
                hourlyRowsForUv.find(function (row) {
                    const rowTime = parseDate(firstValue(row.time, row.datetime, row.date));
                    return rowTime && rowTime >= now;
                }) || hourlyRowsForUv[0];

            if (matchedHourRow) {
                const fallbackUv = getRowNumeric(matchedHourRow, ["uv", "uv_index", "uvIndex"]);
                if (fallbackUv !== null) {
                    current.uv = fallbackUv;
                }
            }

        }

        const airQuality = firstObject(
            data?.air_quality,
            data?.airQuality,
            personalized?.air_quality,
            personalized?.airQuality,
            findObjectByKey(data, "air_quality")
        );

        const marine = firstObject(
            data?.marine,
            personalized?.marine,
            findObjectByKey(data, "marine")
        );

        const traveler = firstObject(
            data?.traveler,
            data?.travel,
            personalized?.traveler,
            personalized?.travel,
            findObjectByKey(data, "traveler")
        );

        const rules = data?.rules ?? personalized?.rules ?? {};
        const safety = data?.safety ?? personalized?.safety ?? {};
        const homepage = data?.homepage ?? personalized?.homepage ?? {};

        const dayPlan =
            data?.day_plan ??
            data?.dayPlan ??
            data?.complete_day_plan ??
            personalized?.day_plan ??
            personalized?.dayPlan ??
            data?.homepage?.day_plan ??
            findArrayByKey(data, "day_plan") ??
            findObjectByKey(data, "day_plan");

        return {
            raw: data,
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

    function renderLocation(normalized) {

        const location = normalized.location || {};

        const name = firstValue(
            location.name, location.location, location.city, location.district, appState.district
        );

        const state = firstValue(location.state, location.state_name, appState.state);
        const district = firstValue(location.district, location.district_name, appState.district);

        setText("locationName", name || district || "Your location");

        const locationMeta = $("locationMeta");
        if (locationMeta) {
            const pieces = [district, state].filter(Boolean);
            locationMeta.textContent = unique(pieces).join(", ");
        }

    }


    /* =====================================================
       CURRENT WEATHER
    ====================================================== */

    function renderCurrentWeather(current, condition) {

        const temperature = getNumericValue(current, ["temperature", "temp", "temperature_c", "temp_c", "temperature_2m"]);
        const feelsLike = getNumericValue(current, ["feels_like", "feelsLike", "apparent_temperature", "apparentTemperature"]);
        const humidity = getNumericValue(current, ["humidity", "relative_humidity", "relative_humidity_2m"]);
        const wind = getNumericValue(current, ["wind_speed", "windSpeed", "wind", "wind_speed_10m"]);
        const uv = getNumericValue(current, ["uv", "uv_index", "uvIndex"]);
        const rain = getNumericValue(current, ["rain", "precipitation", "precipitation_amount"]);

        setText("currentTemperature", formatNumber(temperature));
        setText("feelsLike", formatTemperature(feelsLike));
        setText("humidity", formatPercent(humidity));
        setText("windSpeed", formatWind(wind));
        setText("uvIndex", formatNumber(uv));
        setText("rainAmount", formatRain(rain));
        setText("currentCondition", formatWeatherLabel(condition));

        const icon = window.MausamTheme ? window.MausamTheme.getWeatherIcon(condition) : "☀";
        setText("currentWeatherIcon", icon);

        // "As of" timestamp — prefer whatever time the backend itself
        // attached to this current-weather reading (most accurate,
        // reflects the actual hour the backend used), falling back to
        // the moment the frontend received the response.
        const backendTime = firstValue(current.time, current.datetime, current.observation_time);
        const timestampDate = backendTime ? parseDate(backendTime) : new Date();

        setText(
            "currentWeatherTime",
            timestampDate
                ? `As of ${new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(timestampDate)}`
                : ""
        );

    }


    /* =====================================================
       WARNING / SAFETY
    ====================================================== */

    function renderWarning(normalized) {

        const warningSection = $("warningSection");
        const warningText = $("warningText");

        if (!warningSection || !warningText) { return; }

        const messages = [];

        // Structured safety alerts (array of objects with severity/message)
        const alerts = firstArray(
            normalized.safety?.safety_alerts,
            normalized.safety?.alerts
        );

        if (alerts) {
            alerts.forEach(function (alert) {
                if (isObject(alert)) {
                    const text = alert.message || alert.description || alert.type;
                    if (text) { messages.push(String(text)); }
                } else if (alert) {
                    messages.push(String(alert));
                }
            });
        }

        collectText(normalized.safety, messages, ["warning", "warnings", "alert", "message", "summary"]);
        collectText(normalized.rules, messages, ["warning", "warnings", "alert", "alerts"]);

        if (messages.length === 0 && normalized.raw) {
            collectText(normalized.raw, messages, ["warning", "alert"]);
        }

        const cleanMessages = unique(messages.map(cleanDisplayText).filter(Boolean));

        if (cleanMessages.length === 0) {
            warningSection.classList.add("hidden");
            return;
        }

        warningSection.classList.remove("hidden");
        warningText.textContent = cleanMessages.slice(0, 3).join(" • ");

    }


    /* =====================================================
       HOURLY FORECAST
    ====================================================== */

    function renderHourly(hourly) {

        const container = $("hourlyForecast");
        if (!container) { return; }

        const rows = normalizeForecastRows(hourly);

        // The backend's hourly array covers the whole day starting at
        // midnight (Open-Meteo default), not "from now". Find the first
        // row whose timestamp is at or after the current moment, and
        // take that one plus the next two — i.e. the actual next 3 hours,
        // not whatever happened to be at index 0/1/2.
        const now = new Date();

        let startIndex = rows.findIndex(function (row) {
            const rowTime = parseDate(firstValue(row.time, row.datetime, row.date));
            return rowTime && rowTime >= now;
        });

        if (startIndex === -1) {
            // Nothing in the future (e.g. stale/short forecast) —
            // fall back to the last available rows rather than showing
            // nothing.
            startIndex = Math.max(0, rows.length - 3);
        }

        const selectedRows = rows.slice(startIndex, startIndex + 3);

        if (selectedRows.length === 0) {
            container.innerHTML = emptyState("Hourly forecast is not available from the current backend response.");
            return;
        }

        container.innerHTML = selectedRows.map(renderHourlyCard).join("");

    }

    function renderHourlyCard(item, index) {

        const time = formatForecastTime(firstValue(item.time, item.datetime, item.date));

        const temperature = getRowNumeric(item, ["temperature", "temp", "temperature_c", "temp_c", "temperature_2m"]);
        const rainProbability = getRowNumeric(item, ["rain_probability", "rainProbability", "precipitation_probability", "precipitationProbability"]);
        const precipitation = getRowNumeric(item, ["precipitation", "rain", "precipitation_amount"]);

        const condition = getRowCondition(item);
        const icon = window.MausamTheme ? window.MausamTheme.getWeatherIcon(condition) : "☀";

        return `
            <article class="hour-card">
                <span class="hour-time">${escapeHtml(time || `Hour ${index + 1}`)}</span>
                <div class="hour-icon">${icon}</div>
                <div class="hour-temp">${escapeHtml(formatTemperature(temperature))}</div>
                <div class="hour-meta">
                    <span>Rain: ${escapeHtml(formatPercent(rainProbability))}</span>
                    <span>Precip: ${escapeHtml(formatRain(precipitation))}</span>
                </div>
            </article>
        `;

    }


    /* =====================================================
       DAILY FORECAST
    ====================================================== */

    function renderDaily(daily) {

        const container = $("dailyForecast");
        if (!container) { return; }

        const rows = normalizeForecastRows(daily);
        const selectedRows = rows.slice(0, 7);

        if (selectedRows.length === 0) {
            container.innerHTML = emptyState("7-day forecast is not available from the current backend response.");
            return;
        }

        container.innerHTML = selectedRows.map(renderDailyCard).join("");

    }

    function renderDailyCard(item, index) {

        const date = firstValue(item.time, item.date, item.datetime);
        const dayName = formatDayName(date, index);

        const maxTemperature = getRowNumeric(item, ["max_temperature", "maxTemperature", "temperature_max", "temp_max", "maximum_temperature"]);
        const minTemperature = getRowNumeric(item, ["min_temperature", "minTemperature", "temperature_min", "temp_min", "minimum_temperature"]);
        const rainProbability = getRowNumeric(item, ["rain_probability", "rainProbability", "precipitation_probability"]);

        const icon = window.MausamTheme ? window.MausamTheme.getDailyWeatherIcon(item) : "☀";

        return `
            <article class="day-card">
                <div class="day-name">${escapeHtml(dayName)}</div>
                <div class="day-icon">${icon}</div>
                <div class="day-temp">
                    <span class="day-max">${escapeHtml(formatTemperature(maxTemperature))}</span>
                    <span class="day-min">${escapeHtml(formatTemperature(minTemperature))}</span>
                </div>
                <span class="day-rain">${escapeHtml(formatPercent(rainProbability))} rain</span>
            </article>
        `;

    }


    /* =====================================================
       SUN TIMELINE
    ====================================================== */

    function renderSunTimeline(daily) {

        const rows = normalizeForecastRows(daily);
        const firstDay = rows[0];
        if (!firstDay) { return; }

        const sunrise = firstValue(firstDay.sunrise, firstDay.sunrise_time, firstDay.sunriseTime);
        const sunset = firstValue(firstDay.sunset, firstDay.sunset_time, firstDay.sunsetTime);

        setText("sunriseTime", formatTimeOnly(sunrise));
        setText("sunsetTime", formatTimeOnly(sunset));

        const progress = $("sunrisePosition");
        if (progress && sunrise && sunset) {
            progress.style.width = "100%";
        }

    }


    /* =====================================================
       MOON TIMELINE
    ====================================================== */

    function renderMoonTimeline(daily, location) {

        const rows = normalizeForecastRows(daily);
        const firstDay = rows[0];

        const date = firstValue(firstDay?.time, firstDay?.date, firstDay?.datetime) || getTodayDate();

        let moonrise = firstValue(firstDay?.moonrise, firstDay?.moonrise_time, firstDay?.moonriseTime);
        let moonset = firstValue(firstDay?.moonset, firstDay?.moonset_time, firstDay?.moonsetTime);

        let source = moonrise || moonset ? "backend" : null;

        // The backend (Open-Meteo free tier) doesn't provide moon data at
        // all — only sunrise/sunset. If we have coordinates for this
        // location and the SunCalc library is loaded, compute moonrise/
        // moonset client-side instead of leaving it blank.
        if (!source && window.SunCalc) {

            const latitude = toNumber(firstValue(
                location?.latitude, location?.lat, appState.data?.location?.latitude
            ));

            const longitude = toNumber(firstValue(
                location?.longitude, location?.lng, location?.lon, appState.data?.location?.longitude
            ));

            if (latitude !== null && longitude !== null) {

                try {

                    const referenceDate = parseDate(date) || new Date();
                    const moonTimes = window.SunCalc.getMoonTimes(referenceDate, latitude, longitude);

                    if (moonTimes.rise) {
                        moonrise = moonTimes.rise;
                    }

                    if (moonTimes.set) {
                        moonset = moonTimes.set;
                    }

                    if (moonTimes.alwaysUp) {
                        source = "always-up";
                    } else if (moonTimes.alwaysDown) {
                        source = "always-down";
                    } else if (moonrise || moonset) {
                        source = "computed";
                    }

                } catch (error) {
                    // Leave moonrise/moonset blank rather than breaking the page.
                }

            }

        }

        setText("moonriseTime", moonrise ? formatTimeOnly(moonrise) : (source === "always-down" ? "Below horizon" : "—"));
        setText("moonsetTime", moonset ? formatTimeOnly(moonset) : (source === "always-up" ? "Above all day" : "—"));

        const phase = calculateMoonPhase(date);

        setText("moonPhaseIcon", phase.icon);
        setText("moonPhaseName", phase.name);

        let detail = "Phase calculated from date";
        if (source === "backend") { detail = "Moonrise and moonset from weather data"; }
        else if (source === "computed") { detail = "Moonrise and moonset for your location"; }
        else if (source === "always-up" || source === "always-down") { detail = "Phase calculated from date"; }

        setText("moonPhaseDetail", detail);

    }


    /* =====================================================
       AI FOCUS
    ====================================================== */

    function renderFocus(normalized) {

        const container = $("focusGrid");
        if (!container) { return; }

        const homepage = normalized.homepage;
        const profile = appState.profile;

        const homepageProfile = homepage?.[profile];
        const focus = homepageProfile?.focus ?? homepageProfile?.items ?? homepageProfile?.highlights;

        const focusItems = normalizeTextItems(focus);

        if (focusItems.length > 0) {
            container.innerHTML = focusItems.slice(0, 6).map(function (item, index) {
                return `
                    <article class="focus-card">
                        <span class="focus-number">${String(index + 1).padStart(2, "0")}</span>
                        <h3>${escapeHtml(item.title || "Mausam insight")}</h3>
                        <p>${escapeHtml(item.text || item.description || String(item))}</p>
                    </article>
                `;
            }).join("");
            return;
        }

        const fallback = [];

        collectText(normalized.rules, fallback, ["recommendations", "recommendation", "advice", "tips", "message"]);
        collectText(normalized.personalized, fallback, ["recommendations", "recommendation", "advice", "tips"]);

        const items = unique(fallback.map(cleanDisplayText).filter(Boolean)).slice(0, 6);

        if (items.length === 0) {
            container.innerHTML = emptyState("Personalized insights will appear here.");
            return;
        }

        container.innerHTML = items.map(function (text, index) {
            return `
                <article class="focus-card">
                    <span class="focus-number">${String(index + 1).padStart(2, "0")}</span>
                    <h3>Mausam insight</h3>
                    <p>${escapeHtml(text)}</p>
                </article>
            `;
        }).join("");

    }


    /* =====================================================
       HEALTH / AIR QUALITY PANEL
    ====================================================== */

    function renderHealth(airQuality) {

        const panel = $("healthPanel");
        const content = $("healthContent");
        if (!panel || !content) { return; }

        if (appState.profile !== "health" || !airQuality || !isObject(airQuality)) {
            panel.classList.add("hidden");
            return;
        }

        panel.classList.remove("hidden");

        const source = airQuality.current || airQuality;

        const cards = extractInfoCards(source, [
            ["US AQI", ["us_aqi", "aqi", "air_quality_index", "airQualityIndex"]],
            ["AQI Level", ["aqi_level", "status", "category", "level"]],
            ["PM2.5", ["pm2_5", "pm25", "pm2.5"]],
            ["PM10", ["pm10"]],
            ["Ozone", ["ozone"]],
            ["Nitrogen Dioxide", ["nitrogen_dioxide"]],
            ["Sulphur Dioxide", ["sulphur_dioxide"]],
            ["Carbon Monoxide", ["carbon_monoxide"]],
            ["Health advice", ["advice", "recommendation", "message"]]
        ]);

        content.innerHTML = cards.length > 0
            ? cards.map(renderInfoCard).join("")
            : emptyState("Air-quality details are available, but the response fields were not recognized.");

    }


    /* =====================================================
       MARINE / BEACH PANEL
    ====================================================== */

    function renderMarine(marine) {

        const panel = $("marinePanel");
        const content = $("marineContent");
        if (!panel || !content) { return; }

        if (appState.profile !== "beach" || !marine || !isObject(marine)) {
            panel.classList.add("hidden");
            return;
        }

        panel.classList.remove("hidden");

        const source = marine.current || marine;

        const cards = extractInfoCards(source, [
            ["Wave height", ["wave_height", "waveHeight", "waves"]],
            ["Wave direction", ["wave_direction", "waveDirection"]],
            ["Wave period", ["wave_period", "wavePeriod"]],
            ["Wind wave height", ["wind_wave_height", "windWaveHeight"]],
            ["Swell wave height", ["swell_wave_height", "swellWaveHeight"]],
            ["Sea temperature", ["sea_surface_temperature", "water_temperature", "waterTemperature"]],
            ["Tide", ["tide"]],
            ["Sea condition", ["condition", "status", "sea_condition"]]
        ]);

        // Tide info may live under marine.tide.message — surface it explicitly if present.
        const tideMessage = marine?.tide?.message;
        if (tideMessage && !cards.some(c => c.label === "Tide")) {
            cards.push({ label: "Tide", value: String(tideMessage) });
        }

        content.innerHTML = cards.length > 0
            ? cards.map(renderInfoCard).join("")
            : emptyState("Marine information is available, but the response fields were not recognized.");

    }


    /* =====================================================
       TRAVELER RESULT PANEL
    ====================================================== */

    function renderTraveler(traveler) {

        const panel = $("travelerResultPanel");
        const content = $("travelerContent");
        if (!panel || !content) { return; }

        if (appState.profile !== "traveler") {
            panel.classList.add("hidden");
            return;
        }

        panel.classList.remove("hidden");

        if (!traveler || !isObject(traveler)) {
            content.innerHTML = emptyState("Traveler information was not returned by the backend.");
            return;
        }

        let html = "";

        const summary = traveler.summary;
        if (summary) {
            html += renderInfoCard({ label: "Summary", value: String(summary) });
        }

        const departure = traveler.departure_weather || traveler.departureWeather;
        if (isObject(departure)) {
            const departureCards = extractInfoCards(departure, [
                ["Departure time", ["time"]],
                ["Temperature", ["temperature"]],
                ["Rain probability", ["rain_probability"]],
                ["Precipitation", ["precipitation"]],
                ["Wind", ["wind_speed"]],
                ["Visibility", ["visibility"]],
                ["UV", ["uv"]]
            ]);
            html += departureCards.map(renderInfoCard).join("");
        }

        const departureAdvice = traveler.departure_advice || traveler.departureAdvice;
        if (departureAdvice) {
            html += renderInfoCard({ label: "Departure advice", value: String(departureAdvice) });
        }

        const packing = normalizeTextItems(traveler.packing_suggestions || traveler.packing);
        if (packing.length > 0) {
            html += `
                <article class="info-card">
                    <span>Packing suggestions</span>
                    <strong>${packing.map(p => escapeHtml(p.text || p.title || String(p))).join(", ")}</strong>
                </article>
            `;
        }

        const travelAdvice = normalizeTextItems(traveler.travel_advice || traveler.travelAdvice);
        if (travelAdvice.length > 0) {
            html += `
                <article class="info-card">
                    <span>Travel advice</span>
                    <strong>${travelAdvice.map(t => escapeHtml(t.text || t.title || String(t))).join(", ")}</strong>
                </article>
            `;
        }

        const travelPlan = firstArray(traveler.travel_plan, traveler.travelPlan);
        if (travelPlan && travelPlan.length > 0) {
            html += travelPlan.map(function (day, index) {
                const label = isObject(day) ? (day.date || `Day ${index + 1}`) : `Day ${index + 1}`;
                const body = typeof day === "string" ? day : renderObjectInline(day);
                return `
                    <article class="plan-item">
                        <div class="plan-time">${escapeHtml(label)}</div>
                        <div class="plan-content">${body}</div>
                    </article>
                `;
            }).join("");
        }

        if (!html.trim()) {

            const cards = extractInfoCards(traveler, [
                ["Destination", ["destination", "destination_name"]],
                ["Transport", ["transport", "mode"]],
                ["Travel days", ["days", "trip_days"]],
                ["Departure", ["departure", "departure_time", "departureTime"]],
                ["Travel advice", ["advice", "recommendation", "message", "summary"]]
            ]);

            html = cards.length > 0
                ? cards.map(renderInfoCard).join("")
                : renderObjectAsCards(traveler);

        }

        content.innerHTML = html || emptyState("Traveler information was not returned by the backend.");

    }


    /* =====================================================
       RECOMMENDATIONS
    ====================================================== */

    function renderRecommendations(normalized) {

        const container = $("recommendationsGrid");
        if (!container) { return; }

        const sources = [
            normalized.rules?.recommendations,
            normalized.rules?.recommendation,
            normalized.safety?.recommendations,
            normalized.safety?.recommendation,
            normalized.personalized?.recommendations,
            normalized.personalized?.recommendation,
            normalized.raw?.recommendations,
            normalized.raw?.recommendation,
            normalized.homepage?.recommendations
        ];

        let items = [];

        sources.forEach(function (source) {
            items = items.concat(normalizeTextItems(source));
        });

        items = dedupeObjects(items);

        if (items.length === 0) {

            // Backend sent nothing usable — synthesize a few
            // profile-aware tips from the day plan's own period data
            // instead of leaving this permanently blank.
            items = synthesizeRecommendationsFromDayPlan(normalized.dayPlan);

        }

        if (items.length === 0) {
            container.innerHTML = emptyState("Personalized recommendations will appear here.");
            return;
        }

        container.innerHTML = items.slice(0, 9).map(function (item) {

            const title = item.title || item.name || "Recommendation";
            const text = item.text || item.description || item.message || item.advice || String(item);

            return `
                <article class="recommendation-card">
                    <h3>${escapeHtml(title)}</h3>
                    <p>${escapeHtml(text)}</p>
                </article>
            `;

        }).join("");

    }

    function synthesizeRecommendationsFromDayPlan(dayPlan) {

        if (!dayPlan) { return []; }

        const days = normalizeDayPlanDays(dayPlan);
        if (days.length === 0) { return []; }

        const firstDay = days[0];

        let periods = firstDay.periods || firstDay.plan || firstDay.schedule ||
            firstDay.activities || firstDay.period_plan || firstDay.day_plan;

        if (!periods || typeof periods !== "object") { periods = {}; }

        ["morning", "afternoon", "evening", "night"].forEach(function (period) {
            if (firstDay[period] !== undefined) { periods[period] = firstDay[period]; }
        });

        const results = [];

        Object.entries(periods).forEach(function ([name, value]) {

            if (!isObject(value)) { return; }

            const tip = generateProfileInsight(appState.profile, value);

            if (tip) {
                results.push({
                    title: `${getPeriodIcon(name)} ${prettifyKey(name)}`,
                    text: tip
                });
            }

        });

        return results;

    }


    /* =====================================================
       COMPLETE DAY PLAN
       (Rich, field-aware renderer ported from the old
       script.js logic: supports multiple days, multiple
       periods per day, and every backend field with an
       icon + unit-aware formatting.)
    ====================================================== */

    const PLAN_FIELD_ORDER = [
        "time", "start_time", "end_time",
        "temperature", "temperature_range", "min_temperature", "max_temperature", "feels_like",
        "rain_probability", "precipitation_probability", "precipitation", "rain",
        "uv", "uv_index",
        "wind", "wind_speed", "wind_direction",
        "humidity", "visibility",
        "condition", "weather", "weather_condition",
        "aqi", "us_aqi", "aqi_level", "pm2_5", "pm10",
        "wave_height", "wave_period", "sea_surface_temperature",
        "soil_moisture", "soil_temperature", "tide",
        "advice", "recommendation", "recommendations",
        "activity", "activities",
        "safety", "safety_alert", "reason", "note"
    ];

    function renderDayPlan(dayPlan) {

        const container = $("dayPlan");
        if (!container) { return; }

        if (dayPlan === null || dayPlan === undefined) {
            container.innerHTML = emptyState("Your personalized day plan will appear here.");
            return;
        }

        const days = normalizeDayPlanDays(dayPlan);

        if (days.length === 0) {
            container.innerHTML = emptyState("Your personalized day plan will appear here.");
            return;
        }

        container.innerHTML = days.map(renderDayPlanDay).join("");

    }

    function normalizeDayPlanDays(dayPlan) {

        let days = [];

        if (Array.isArray(dayPlan)) {

            days = dayPlan;

        } else if (isObject(dayPlan)) {

            if (Array.isArray(dayPlan.days)) {
                days = dayPlan.days;
            } else if (Array.isArray(dayPlan.plan)) {
                days = dayPlan.plan;
            } else if (Array.isArray(dayPlan.day_plan)) {
                days = dayPlan.day_plan;
            } else if (Array.isArray(dayPlan.daily_plan)) {
                days = dayPlan.daily_plan;
            } else {

                const keys = Object.keys(dayPlan);
                const dateKeys = keys.filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k));

                if (dateKeys.length > 0) {
                    days = dateKeys.map(date => ({ date: date, plan: dayPlan[date] }));
                } else {
                    days = [dayPlan];
                }

            }

        }

        return days.filter(Boolean);

    }

    function renderDayPlanDay(day, index) {

        const date = firstValue(day.date, day.day, day.date_string, day.time) || `Day ${index + 1}`;

        let periods = day.periods || day.plan || day.schedule || day.activities || day.period_plan || day.day_plan;

        if (!periods || typeof periods !== "object") {
            periods = {};
        }

        ["morning", "afternoon", "evening", "night"].forEach(function (period) {
            if (day[period] !== undefined) {
                periods[period] = day[period];
            }
        });

        if (Object.keys(periods).length === 0) {
            periods = day;
        }

        return `
            <div class="plan-item plan-day-header">
                <div class="plan-time">Day ${index + 1}</div>
                <div class="plan-content">
                    <h3>📅 ${escapeHtml(formatDate(date))}</h3>
                </div>
            </div>
            ${renderDayPlanPeriods(periods)}
        `;

    }

    function renderDayPlanPeriods(periods) {

        if (!periods) {
            return emptyState("No period-wise plan available.");
        }

        if (Array.isArray(periods)) {

            return periods.map(function (period, index) {
                const name = period?.period || period?.name || `Period ${index + 1}`;
                return renderDayPlanPeriod(period, name);
            }).join("");

        }

        if (isObject(periods)) {

            return Object.entries(periods).map(function ([name, value]) {
                return renderDayPlanPeriod(value, name);
            }).join("");

        }

        return `<div class="plan-item"><div class="plan-content"><p>${escapeHtml(periods)}</p></div></div>`;

    }

    function renderDayPlanPeriod(value, name) {

        const icon = getPeriodIcon(name);
        const title = `${icon} ${prettifyKey(name)}`;

        let body = "";

        if (typeof value === "string") {

            body = `<p>${escapeHtml(value)}</p>`;

        } else if (typeof value === "number") {

            body = `<p>${escapeHtml(String(value))}</p>`;

        } else if (isObject(value)) {

            body = renderPeriodFields(value);

        } else if (Array.isArray(value)) {

            body = value.map(v => isObject(v) ? renderObjectInline(v) : `<p>${escapeHtml(v)}</p>`).join("");

        }

        // Profile-aware tip, computed purely from the numeric fields
        // already present in this period (temperature, rain probability,
        // UV) — tailored to whichever persona (health/fitness/beach/...)
        // is currently active, on top of whatever generic advice the
        // backend already sent.
        const profileTip = isObject(value) ? generateProfileInsight(appState.profile, value) : null;

        if (profileTip) {
            body += `
                <div class="plan-field-row plan-profile-tip">
                    <strong>🎯 ${escapeHtml(prettifyKey(appState.profile))} tip:</strong>
                    ${escapeHtml(profileTip)}
                </div>
            `;
        }

        return `
            <article class="plan-item">
                <div class="plan-time">${escapeHtml(prettifyKey(name))}</div>
                <div class="plan-content">
                    <h3>${title}</h3>
                    ${body || "<p>—</p>"}
                </div>
            </article>
        `;

    }


    /* =====================================================
       PROFILE-AWARE INSIGHT GENERATOR

       Purely derived client-side from a period's own numeric
       fields (temperature / rain / uv / wind / soil) — no
       backend change needed. Returns null when there isn't
       enough data to say anything useful, rather than
       guessing.
    ====================================================== */

    function extractPeriodMetrics(period) {

        const temperature = period.temperature;
        const rain = period.rain;
        const uv = period.uv;
        const wind = period.wind;

        return {

            tempMax: toNumber(firstValue(
                isObject(temperature) ? temperature.max : null,
                period.max_temperature, period.temperature_max, !isObject(temperature) ? temperature : null
            )),

            tempMin: toNumber(firstValue(
                isObject(temperature) ? temperature.min : null,
                period.min_temperature, period.temperature_min
            )),

            rainProbability: toNumber(firstValue(
                isObject(rain) ? rain.probability : null,
                period.rain_probability, period.precipitation_probability,
                !isObject(rain) ? rain : null
            )),

            uvIndex: toNumber(firstValue(
                isObject(uv) ? uv.index : null,
                period.uv_index, !isObject(uv) ? uv : null
            )),

            windSpeed: toNumber(firstValue(
                isObject(wind) ? wind.speed : null,
                period.wind_speed
            )),

            soilMoisture: toNumber(period.soil_moisture),

            visibility: toNumber(period.visibility)

        };

    }

    function generateProfileInsight(profile, period) {

        const m = extractPeriodMetrics(period);

        // Not enough data to say anything meaningful.
        if (m.tempMax === null && m.rainProbability === null && m.uvIndex === null) {
            return null;
        }

        const hotHeat = m.tempMax !== null && m.tempMax >= 35;
        const highUv = m.uvIndex !== null && m.uvIndex >= 8;
        const likelyRain = m.rainProbability !== null && m.rainProbability >= 50;
        const someRainChance = m.rainProbability !== null && m.rainProbability >= 25 && m.rainProbability < 50;
        const windy = m.windSpeed !== null && m.windSpeed >= 25;

        switch (profile) {

            case "health":
                if (highUv) { return "High UV right now — wear SPF 50+, sunglasses and limit midday sun exposure."; }
                if (hotHeat) { return "High heat — stay well hydrated and pace outdoor exertion."; }
                if (likelyRain) { return "Rain likely — carry a mask/cover to avoid getting chilled if you're prone to respiratory issues."; }
                return "Comfortable conditions for outdoor wellness activities.";

            case "fitness":
                if (highUv || hotHeat) { return "Too hot / high UV for peak-intensity training — shift your workout to early morning or evening."; }
                if (likelyRain) { return "Rain likely — better window for indoor training today."; }
                return "Good window for an outdoor workout.";

            case "beach":
                if (highUv) { return "Strong UV near water (reflection increases exposure) — reef-safe sunscreen and shade breaks recommended."; }
                if (likelyRain) { return "Rain/storm risk — check local advisories before heading into the water."; }
                return "Good conditions for the beach.";

            case "traveler":
                if (likelyRain) { return "Pack rain gear — showers are likely along your route during this period."; }
                if (highUv) { return "Strong sun expected — keep sunglasses and sunscreen handy at stops."; }
                return "Favorable travel conditions.";

            case "family":
                if (hotHeat || highUv) { return "Very hot / high UV for kids outdoors — plan shaded or indoor activities."; }
                if (likelyRain) { return "Rain likely — good idea to have an indoor backup plan."; }
                return "Pleasant conditions for a family outing.";

            case "agriculture":
                if (likelyRain) { return "Good chance of rain — you can likely hold off on irrigation."; }
                if (m.soilMoisture !== null && m.soilMoisture < 0.2) { return "Soil moisture is low — irrigation may be needed if rain doesn't arrive."; }
                if (hotHeat) { return "High heat stress risk for crops — consider extra watering."; }
                return "Normal field conditions for this period.";

            case "commuter":
                if (likelyRain) { return "Rain likely during this period — allow extra travel time and drive cautiously."; }
                if (someRainChance) { return "Some chance of rain — keep an umbrella handy just in case."; }
                if (m.visibility !== null && m.visibility < 2000) { return "Reduced visibility expected — take extra care on the road."; }
                return "Clear conditions expected for your commute.";

            case "event":
                if (likelyRain) { return "Notable rain risk — have a tent or indoor contingency ready."; }
                if (windy) { return "Windy conditions — secure lightweight decorations/structures."; }
                if (highUv) { return "Strong sun — arrange shaded seating for guests."; }
                return "Good conditions for an outdoor event.";

            default:
                return null;

        }

    }

    function renderPeriodFields(obj) {

        if (!obj || !isObject(obj)) { return ""; }

        let html = "";
        const used = new Set();

        PLAN_FIELD_ORDER.forEach(function (key) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                html += renderPlanDataLine(key, obj[key]);
                used.add(key);
            }
        });

        Object.entries(obj).forEach(function ([key, value]) {
            if (used.has(key) || key === "period" || key === "name") { return; }
            html += renderPlanDataLine(key, value);
        });

        return html;

    }

    function renderPlanDataLine(key, value) {

        if (value === null || value === undefined || value === "") {
            return "";
        }

        const displayValue = (typeof value === "object")
            ? renderObjectInline(value)
            : formatPlanValue(key, value);

        return `
            <div class="plan-field-row">
                <strong>${getFieldIcon(key)} ${escapeHtml(prettifyKey(key))}:</strong>
                ${displayValue}
            </div>
        `;

    }

    function formatPlanValue(key, value) {

        if (typeof value !== "number") {
            return escapeHtml(String(value));
        }

        const lower = String(key).toLowerCase();

        if (lower.includes("temperature")) { return formatNumber(value) + "°C"; }
        if (lower.includes("probability") || lower.includes("humidity")) { return formatNumber(value) + "%"; }
        if (lower === "rain" || lower.includes("precipitation")) { return formatNumber(value) + " mm"; }
        if (lower.includes("wind") && !lower.includes("direction")) { return formatNumber(value) + " km/h"; }
        if (lower.includes("visibility")) { return formatNumber(value) + " m"; }
        if (lower.includes("wave_height")) { return formatNumber(value) + " m"; }
        if (lower.includes("wave_period")) { return formatNumber(value) + " s"; }

        return formatNumber(value);

    }

    function renderObjectInline(obj) {

        if (obj === null || obj === undefined) { return "—"; }

        if (typeof obj !== "object") {
            return escapeHtml(String(obj));
        }

        if (Array.isArray(obj)) {
            return obj.map(item => (typeof item === "object") ? renderObjectInline(item) : escapeHtml(String(item))).join(", ");
        }

        return Object.entries(obj)
            .filter(([, v]) => v !== null && v !== undefined)
            .map(function ([key, value]) {
                const rendered = (typeof value === "object") ? renderObjectInline(value) : escapeHtml(String(value));
                return `<span class="plan-field-inline"><strong>${escapeHtml(prettifyKey(key))}:</strong> ${rendered}</span>`;
            })
            .join(" · ");

    }

    function getPeriodIcon(name) {

        const value = String(name).toLowerCase();

        if (value.includes("morning")) { return "🌅"; }
        if (value.includes("afternoon")) { return "☀️"; }
        if (value.includes("evening")) { return "🌇"; }
        if (value.includes("night")) { return "🌙"; }

        return "🕒";

    }

    function getFieldIcon(key) {

        const value = String(key).toLowerCase();

        if (value.includes("temperature")) { return "🌡️"; }
        if (value.includes("rain") || value.includes("precipitation")) { return "🌧️"; }
        if (value.includes("uv")) { return "☀️"; }
        if (value.includes("wind")) { return "💨"; }
        if (value.includes("humidity")) { return "💧"; }
        if (value.includes("visibility")) { return "👁️"; }
        if (value.includes("soil")) { return "🌱"; }
        if (value.includes("wave") || value.includes("sea")) { return "🌊"; }
        if (value.includes("aqi")) { return "🌫️"; }
        if (value.includes("advice") || value.includes("recommendation")) { return "💡"; }
        if (value.includes("activity")) { return "🏃"; }
        if (value.includes("safety")) { return "⚠️"; }
        if (value.includes("tide")) { return "🌊"; }

        return "•";

    }


    /* =====================================================
       PROFILE BADGE
    ====================================================== */

    function renderProfileBadge() {

        const fallback = PROFILE_FALLBACKS[appState.profile] || PROFILE_FALLBACKS.health;
        const backendProfile = appState.data?.profile_name;

        setText("profileBadgeIcon", fallback.icon);
        setText("profileBadgeName", backendProfile || fallback.name);

    }


    /* =====================================================
       INFO CARDS (health / marine / traveler panels)
    ====================================================== */

    function extractInfoCards(object, definitions) {

        if (!object || !isObject(object)) { return []; }

        return definitions.map(function (definition) {

            const label = definition[0];
            const keys = definition[1];
            const value = getValueByKeys(object, keys);

            if (value === undefined || value === null || value === "") {
                return null;
            }

            return { label: label, value: formatGenericValue(value) };

        }).filter(Boolean);

    }

    function renderInfoCard(card) {
        return `
            <article class="info-card">
                <span>${escapeHtml(card.label)}</span>
                <strong>${escapeHtml(card.value)}</strong>
            </article>
        `;
    }

    function renderObjectAsCards(object) {

        const entries = Object.entries(object)
            .filter(entry => entry[1] !== null && entry[1] !== undefined && typeof entry[1] !== "object")
            .slice(0, 9);

        if (entries.length === 0) {
            return emptyState("No displayable details available.");
        }

        return entries.map(function (entry) {
            return renderInfoCard({ label: prettifyKey(entry[0]), value: formatGenericValue(entry[1]) });
        }).join("");

    }


    /* =====================================================
       FORECAST NORMALIZATION
    ====================================================== */

    function normalizeForecastRows(source) {

        if (!source) { return []; }

        if (Array.isArray(source)) {
            return source.map(item => isObject(item) ? { ...item } : { value: item });
        }

        if (isObject(source)) {

            const keys = Object.keys(source);
            const arrayKeys = keys.filter(key => Array.isArray(source[key]));

            if (arrayKeys.length === 0) {
                return [source];
            }

            let length = 0;
            arrayKeys.forEach(key => { length = Math.max(length, source[key].length); });

            const rows = [];

            for (let index = 0; index < length; index++) {

                const row = {};

                keys.forEach(function (key) {
                    const value = source[key];
                    row[key] = Array.isArray(value) ? value[index] : value;
                });

                rows.push(row);

            }

            return rows;

        }

        return [];

    }


    /* =====================================================
       NORMALIZE STATES / DISTRICTS / PROFILES
    ====================================================== */

    function normalizeStates(response) {

        const source = response?.states ?? response;

        if (Array.isArray(source)) { return source; }
        if (isObject(source)) { return Object.keys(source); }

        return [];

    }

    function normalizeDistricts(response) {

        const source = response?.districts ?? response;

        if (Array.isArray(source)) { return source; }
        if (isObject(source)) { return Object.keys(source); }

        return [];

    }

    function normalizeProfiles(response) {

        const source = response?.profiles ?? response;

        if (Array.isArray(source)) {

            const result = {};

            source.forEach(function (profile) {

                if (typeof profile === "string") {
                    result[profile] = { name: profile };
                    return;
                }

                if (isObject(profile)) {
                    const id = profile.id ?? profile.profile ?? profile.key ?? profile.name;
                    if (id) {
                        result[String(id).toLowerCase()] = profile;
                    }
                }

            });

            return result;

        }

        if (isObject(source)) { return source; }

        return {};

    }


    /* =====================================================
       API REQUEST
    ====================================================== */

    async function apiRequest(path, params = {}) {

        const url = new URL(path, window.location.origin);

        Object.entries(params).forEach(function ([key, value]) {
            if (value !== undefined && value !== null && value !== "") {
                url.searchParams.set(key, String(value));
            }
        });

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: { "Accept": "application/json" }
        });

        let data = null;

        try {
            data = await response.json();
        } catch (error) {
            data = null;
        }

        if (!response.ok) {
            const detail = data?.detail ?? data?.message ?? `Request failed with status ${response.status}.`;
            throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
        }

        return data;

    }


    /* =====================================================
       VALUE HELPERS
    ====================================================== */

    function firstValue(...values) {
        for (const value of values) {
            if (value !== undefined && value !== null && value !== "") {
                return value;
            }
        }
        return null;
    }

    function firstObject(...values) {
        for (const value of values) {
            if (isObject(value)) { return value; }
        }
        return null;
    }

    function firstArray(...values) {
        for (const value of values) {
            if (Array.isArray(value)) { return value; }
        }
        return null;
    }

    function isObject(value) {
        return value !== null && typeof value === "object" && !Array.isArray(value);
    }


    /* =====================================================
       RECURSIVE OBJECT SEARCH
    ====================================================== */

    function findObjectByKey(root, wantedKey) {

        if (!root || typeof root !== "object") { return null; }

        if (Object.prototype.hasOwnProperty.call(root, wantedKey)) {
            const value = root[wantedKey];
            if (isObject(value)) { return value; }
        }

        for (const key of Object.keys(root)) {
            const value = root[key];
            if (value && typeof value === "object") {
                const result = findObjectByKey(value, wantedKey);
                if (result) { return result; }
            }
        }

        return null;

    }

    function findArrayByKey(root, wantedKey) {

        if (!root || typeof root !== "object") { return null; }

        if (Object.prototype.hasOwnProperty.call(root, wantedKey)) {
            const value = root[wantedKey];
            if (Array.isArray(value)) { return value; }
        }

        for (const key of Object.keys(root)) {
            const value = root[key];
            if (value && typeof value === "object") {
                const result = findArrayByKey(value, wantedKey);
                if (result) { return result; }
            }
        }

        return null;

    }


    /* =====================================================
       VALUE BY KEYS
    ====================================================== */

    function getValueByKeys(object, keys) {

        if (!object || typeof object !== "object") { return undefined; }

        for (const key of keys) {
            if (Object.prototype.hasOwnProperty.call(object, key)) {
                const value = object[key];
                if (value !== undefined && value !== null && value !== "") {
                    return value;
                }
            }
        }

        return undefined;

    }


    /* =====================================================
       NUMERIC HELPERS
    ====================================================== */

    function getNumericValue(object, keys) {
        return toNumber(getValueByKeys(object, keys));
    }

    function getRowNumeric(row, keys) {
        return getNumericValue(row, keys);
    }

    function toNumber(value) {

        if (value === undefined || value === null || value === "") { return null; }

        const number = Number(value);

        return Number.isFinite(number) ? number : null;

    }


    /* =====================================================
       WEATHER CONDITION
    ====================================================== */

    function getRowCondition(row) {

        if (!row) { return "clear"; }

        const direct = firstValue(row.condition, row.weather, row.description, row.summary);
        if (direct) { return String(direct); }

        const code = firstValue(row.weather_code, row.weatherCode, row.code, row.weathercode);

        if (code !== null && code !== undefined && window.MausamTheme) {
            return window.MausamTheme.weatherCodeToCondition(code);
        }

        const rain = toNumber(firstValue(row.rain, row.precipitation));
        if (rain !== null && rain > 0) { return "rain"; }

        return "clear";

    }


    /* =====================================================
       FORMATTERS
    ====================================================== */

    function formatNumber(value) {

        if (value === null || value === undefined) { return "—"; }

        const number = toNumber(value);
        if (number === null) { return String(value); }

        return Number.isInteger(number) ? String(number) : number.toFixed(1);

    }

    function formatTemperature(value) {

        if (value === null || value === undefined) { return "—"; }

        const number = toNumber(value);
        if (number === null) { return String(value); }

        return `${formatNumber(number)}°`;

    }

    function formatPercent(value) {

        if (value === null || value === undefined) { return "—"; }

        const number = toNumber(value);
        if (number === null) { return String(value); }

        return `${formatNumber(number)}%`;

    }

    function formatWind(value) {

        if (value === null || value === undefined) { return "—"; }

        const number = toNumber(value);
        if (number === null) { return String(value); }

        return `${formatNumber(number)} km/h`;

    }

    function formatRain(value) {

        if (value === null || value === undefined) { return "—"; }

        const number = toNumber(value);
        if (number === null) { return String(value); }

        return `${formatNumber(number)} mm`;

    }

    function formatForecastTime(value) {

        if (!value) { return ""; }

        const date = parseDate(value);
        if (!date) { return String(value); }

        return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);

    }

    function formatTimeOnly(value) {

        if (!value) { return "—"; }

        if (value instanceof Date) {
            return formatForecastTime(value);
        }

        if (/^\d{1,2}:\d{2}/.test(String(value))) {
            return String(value).slice(0, 5);
        }

        return formatForecastTime(value);

    }

    function formatDayName(value, index) {

        const date = parseDate(value);

        if (!date) {
            return index === 0 ? "Today" : `Day ${index + 1}`;
        }

        if (index === 0) { return "Today"; }

        return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);

    }

    function formatDate(value) {

        if (!value) { return "N/A"; }

        try {

            if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
                const parts = String(value).split("-");
                const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                return date.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
            }

            const date = new Date(value);
            if (Number.isNaN(date.getTime())) { return String(value); }

            return date.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });

        } catch (error) {
            return String(value);
        }

    }

    function parseDate(value) {

        if (!value) { return null; }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) { return null; }

        return date;

    }

    function getTodayDate() {

        const now = new Date();

        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    }


    /* =====================================================
       WEATHER LABEL
    ====================================================== */

    function formatWeatherLabel(condition) {

        if (!condition) { return "Weather"; }

        const value = String(condition).trim().toLowerCase();

        if (value === "clear" || value === "sunny") { return "Clear skies"; }
        if (value === "cloudy") { return "Cloudy"; }
        if (value === "rain") { return "Rainy"; }
        if (value === "storm") { return "Storm conditions"; }

        return String(condition);

    }


    /* =====================================================
       MOON PHASE
    ====================================================== */

    function calculateMoonPhase(dateValue) {

        const date = parseDate(dateValue) || new Date();

        const knownNewMoon = new Date("2000-01-06T18:14:00Z");
        const millisecondsPerDay = 86400000;
        const synodicMonth = 29.530588853;

        const daysSince = (date.getTime() - knownNewMoon.getTime()) / millisecondsPerDay;

        let phase = daysSince % synodicMonth;
        if (phase < 0) { phase += synodicMonth; }

        const fraction = phase / synodicMonth;

        if (fraction < 0.03 || fraction >= 0.97) { return { name: "New Moon", icon: "●" }; }
        if (fraction < 0.22) { return { name: "Waxing Crescent", icon: "☽" }; }
        if (fraction < 0.28) { return { name: "First Quarter", icon: "◐" }; }
        if (fraction < 0.47) { return { name: "Waxing Gibbous", icon: "◕" }; }
        if (fraction < 0.53) { return { name: "Full Moon", icon: "○" }; }
        if (fraction < 0.72) { return { name: "Waning Gibbous", icon: "◑" }; }
        if (fraction < 0.78) { return { name: "Last Quarter", icon: "◒" }; }

        return { name: "Waning Crescent", icon: "☾" };

    }


    /* =====================================================
       NORMALIZE TEXT ITEMS (used by recommendations + focus)
    ====================================================== */

    function normalizeTextItems(source) {

        if (source === undefined || source === null) { return []; }

        if (typeof source === "string" || typeof source === "number") {
            return [{ title: "Mausam insight", text: String(source) }];
        }

        if (Array.isArray(source)) {

            return source.map(function (item) {

                if (typeof item === "string" || typeof item === "number") {
                    return { title: "Mausam insight", text: String(item) };
                }

                if (isObject(item)) { return item; }

                return null;

            }).filter(Boolean);

        }

        if (isObject(source)) {

            return Object.entries(source).map(function ([key, value]) {

                if (typeof value === "string" || typeof value === "number") {
                    return { title: prettifyKey(key), text: String(value) };
                }

                if (isObject(value)) {
                    return {
                        title: value.title || value.name || prettifyKey(key),
                        text: value.text || value.description || value.message || value.advice || JSON.stringify(value)
                    };
                }

                return null;

            }).filter(Boolean);

        }

        return [];

    }


    /* =====================================================
       GENERIC FORMATTING
    ====================================================== */

    function formatGenericValue(value) {

        if (value === null || value === undefined) { return "—"; }
        if (typeof value === "boolean") { return value ? "Yes" : "No"; }
        if (typeof value === "object") { return JSON.stringify(value); }

        return String(value);

    }

    function prettifyKey(key) {

        return String(key)
            .replace(/_/g, " ")
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/\b\w/g, letter => letter.toUpperCase());

    }

    function cleanDisplayText(value) {

        if (value === null || value === undefined) { return ""; }

        if (typeof value === "string") { return value.trim(); }

        if (typeof value === "number" || typeof value === "boolean") { return String(value); }

        if (isObject(value)) {
            return value.message || value.text || value.description || value.advice || value.title || JSON.stringify(value);
        }

        return String(value);

    }


    /* =====================================================
       COLLECT TEXT
    ====================================================== */

    function collectText(object, output, keys) {

        if (!object || typeof object !== "object") { return; }

        keys.forEach(function (key) {

            const value = object[key];

            if (value === undefined || value === null) { return; }

            if (Array.isArray(value)) {
                value.forEach(function (item) {
                    const text = cleanDisplayText(item);
                    if (text) { output.push(text); }
                });
                return;
            }

            const text = cleanDisplayText(value);
            if (text) { output.push(text); }

        });

    }


    /* =====================================================
       DEDUPE
    ====================================================== */

    function unique(array) {
        return [...new Set(array)];
    }

    function dedupeObjects(items) {

        const seen = new Set();
        const result = [];

        items.forEach(function (item) {

            const key = JSON.stringify(item);

            if (!seen.has(key)) {
                seen.add(key);
                result.push(item);
            }

        });

        return result;

    }


    /* =====================================================
       CLAMP
    ====================================================== */

    function clamp(value, min, max) {

        if (Number.isNaN(value)) { return min; }

        return Math.min(Math.max(value, min), max);

    }


    /* =====================================================
       EMPTY STATE
    ====================================================== */

    function emptyState(message) {
        return `<div class="empty-state">${escapeHtml(message)}</div>`;
    }


    /* =====================================================
       ESCAPE HTML
    ====================================================== */

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       SET TEXT
    ====================================================== */

    function setText(id, value) {

        const element = $(id);

        if (element) {
            element.textContent = value ?? "—";
        }

    }


    /* =====================================================
       LOADING
    ====================================================== */

    function showLoading(visible) {

        const overlay = $("loadingOverlay");
        if (!overlay) { return; }

        overlay.classList.toggle("hidden", !visible);

    }


    /* =====================================================
       ERROR
    ====================================================== */

    function showError(message) {

        const toast = $("errorToast");
        const text = $("errorMessage");

        if (!toast) { return; }

        if (text) {
            text.textContent = message || "Something went wrong.";
        }

        toast.classList.remove("hidden");

        clearTimeout(showError.timeout);
        showError.timeout = setTimeout(hideError, 7000);

    }

    function hideError() {

        const toast = $("errorToast");

        if (toast) {
            toast.classList.add("hidden");
        }

    }

    function getErrorMessage(error) {

        if (error instanceof Error) { return error.message; }
        if (typeof error === "string") { return error; }

        return "Unable to load weather data.";

    }

})();