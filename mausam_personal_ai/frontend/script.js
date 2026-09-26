/* ============================================================
   MAUSAM PERSONAL AI
   COMPLETE FRONTEND SCRIPT
   ============================================================

   DO NOT MODIFY index.html.

   This JavaScript handles:

   1. State selection
   2. District selection
   3. User profile selection
   4. Traveler inputs
   5. Personalized homepage API
   6. Current weather
   7. Hourly weather
   8. Safety alerts
   9. Personalized recommendations
   10. Complete Day Plan
   11. Air Quality
   12. Marine information
   13. Traveler information
   14. Error handling

============================================================ */


/* ============================================================
   1. LOCATION DATA
============================================================ */

const districts = {

    "Tamil Nadu": [
        "Chennai",
        "Coimbatore",
        "Madurai",
        "Salem",
        "Tiruchirappalli",
        "Tirunelveli",
        "Vellore",
        "Erode",
        "Thanjavur",
        "Dindigul"
    ],

    "Kerala": [
        "Thiruvananthapuram",
        "Kochi",
        "Kozhikode"
    ],

    "Karnataka": [
        "Bengaluru",
        "Mysuru"
    ],

    "Maharashtra": [
        "Mumbai",
        "Pune"
    ],

    "Delhi": [
        "New Delhi"
    ],

    "Telangana": [
        "Hyderabad"
    ],

    "Andhra Pradesh": [
        "Vijayawada"
    ]
};


/* ============================================================
   2. PROFILE DATA
============================================================ */

const profileNames = {

    health:
        "Health-conscious",

    fitness:
        "Outdoor Fitness",

    beach:
        "Beach & Surfer",

    traveler:
        "Traveler",

    family:
        "Parents & Families",

    agriculture:
        "Agriculture & Garden",

    commuter:
        "Commuter",

    event:
        "Event Planner"
};


/* ============================================================
   3. BASIC DOM HELPER
============================================================ */

function el(id) {

    return document.getElementById(id);
}


/* ============================================================
   4. SHOW ELEMENT
============================================================ */

function show(id) {

    const element = el(id);

    if (element) {

        element.classList.remove("hidden");
    }
}


/* ============================================================
   5. HIDE ELEMENT
============================================================ */

function hide(id) {

    const element = el(id);

    if (element) {

        element.classList.add("hidden");
    }
}


/* ============================================================
   6. ESCAPE HTML
============================================================ */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ============================================================
   7. SAFE VALUE
============================================================ */

function safeValue(
    value,
    fallback = "N/A"
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return fallback;
    }

    return value;
}


/* ============================================================
   8. CHECK VALID VALUE
============================================================ */

function isValidValue(value) {

    return !(
        value === null ||
        value === undefined ||
        value === ""
    );
}


/* ============================================================
   9. GET FIRST VALID VALUE
============================================================ */

function firstValidValue(...values) {

    for (
        const value of values
    ) {

        if (
            isValidValue(value)
        ) {

            return value;
        }
    }

    return null;
}


/* ============================================================
   10. FORMAT NUMBER
============================================================ */

function formatNumber(
    value,
    suffix = ""
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "N/A";
    }

    const number =
        Number(value);

    if (
        Number.isNaN(number)
    ) {

        return escapeHtml(
            value
        );
    }

    if (
        Number.isInteger(number)
    ) {

        return (
            number +
            suffix
        );
    }

    return (
        number.toFixed(1) +
        suffix
    );
}


/* ============================================================
   11. TITLE CASE
============================================================ */

function titleCase(text) {

    if (!text) {

        return "";
    }

    return String(text)
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .replace(
            /\b\w/g,
            function(char) {

                return char.toUpperCase();

            }
        );
}


/* ============================================================
   12. DATE FORMAT
============================================================ */

function formatDate(
    dateString
) {

    if (!dateString) {

        return "N/A";
    }

    try {

        if (
            /^\d{4}-\d{2}-\d{2}$/.test(
                String(dateString)
            )
        ) {

            const parts =
                String(
                    dateString
                ).split("-");

            const date =
                new Date(
                    Number(parts[0]),
                    Number(parts[1]) - 1,
                    Number(parts[2])
                );

            return date.toLocaleDateString(
                [],
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );
        }

        const date =
            new Date(
                dateString
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(
                dateString
            );
        }

        return date.toLocaleDateString(
            [],
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    } catch (error) {

        return String(
            dateString
        );
    }
}


/* ============================================================
   13. TIME FORMAT
============================================================ */

function formatTime(
    timeString
) {

    if (!timeString) {

        return "N/A";
    }

    try {

        const date =
            new Date(
                timeString
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(
                timeString
            );
        }

        return date.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    } catch (error) {

        return String(
            timeString
        );
    }
}


/* ============================================================
   14. LOAD STATES
============================================================ */

function loadStates() {

    const stateElement =
        el("state");

    if (!stateElement) {

        console.warn(
            "State dropdown not found."
        );

        return;
    }

    const previousValue =
        stateElement.value;

    stateElement.innerHTML =
        `<option value="">Select State</option>`;


    Object.keys(
        districts
    )
    .sort()
    .forEach(
        function(state) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                state;

            option.textContent =
                state;

            stateElement.appendChild(
                option
            );
        }
    );


    if (
        previousValue &&
        districts[previousValue]
    ) {

        stateElement.value =
            previousValue;
    }
}


/* ============================================================
   15. LOAD DESTINATION STATES
============================================================ */

function loadDestinationStates() {

    const element =
        el("destinationState");

    if (!element) {

        return;
    }

    const previousValue =
        element.value;

    element.innerHTML =
        `<option value="">Select State</option>`;


    Object.keys(
        districts
    )
    .sort()
    .forEach(
        function(state) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                state;

            option.textContent =
                state;

            element.appendChild(
                option
            );
        }
    );


    if (
        previousValue &&
        districts[previousValue]
    ) {

        element.value =
            previousValue;
    }
}


/* ============================================================
   16. LOAD DISTRICTS
============================================================ */

function loadDistricts(
    stateId,
    districtId
) {

    const stateElement =
        el(stateId);

    const districtElement =
        el(districtId);


    if (
        !stateElement ||
        !districtElement
    ) {

        return;
    }


    const state =
        stateElement.value;


    districtElement.innerHTML =
        `<option value="">Select District</option>`;


    if (
        !state
    ) {

        return;
    }


    const stateDistricts =
        districts[state] || [];


    stateDistricts.forEach(
        function(district) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                district;

            option.textContent =
                district;

            districtElement.appendChild(
                option
            );
        }
    );
}


/* ============================================================
   17. PROFILE OPTIONS
============================================================ */

function setupProfileOptions() {

    const profileElement =
        el("profile");

    if (!profileElement) {

        return;
    }


    /*
       If HTML already contains the profile options,
       keep them.

       Otherwise create them.
    */

    if (
        profileElement.options.length <= 1
    ) {

        profileElement.innerHTML =
            `<option value="">Select Profile</option>`;


        Object.entries(
            profileNames
        )
        .forEach(
            function([
                id,
                name
            ]) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    id;

                option.textContent =
                    name;

                profileElement.appendChild(
                    option
                );
            }
        );
    }
}


/* ============================================================
   18. TRAVELER SECTION
============================================================ */

function updateTravelerSection() {

    const profileElement =
        el("profile");

    if (!profileElement) {

        return;
    }


    if (
        profileElement.value === "traveler"
    ) {

        show(
            "travelerSection"
        );

    } else {

        hide(
            "travelerSection"
        );
    }
}


/* ============================================================
   19. GET WEATHER OBJECT
============================================================ */

function getWeatherObject(
    data
) {

    if (
        data.weather &&
        typeof data.weather === "object"
    ) {

        return data.weather;
    }


    if (
        data.weather_data &&
        typeof data.weather_data === "object"
    ) {

        return data.weather_data;
    }


    if (
        data.personalized?.weather &&
        typeof data.personalized.weather === "object"
    ) {

        return data.personalized.weather;
    }


    return {};
}


/* ============================================================
   20. GET PERSONALIZED OBJECT
============================================================ */

function getPersonalizedObject(
    data
) {

    if (
        data.personalized &&
        typeof data.personalized === "object"
    ) {

        return data.personalized;
    }


    if (
        data.personalized_data &&
        typeof data.personalized_data === "object"
    ) {

        return data.personalized_data;
    }


    return {};
}


/* ============================================================
   21. GET CURRENT WEATHER
============================================================ */

function getCurrentWeather(
    data
) {

    const weather =
        getWeatherObject(
            data
        );


    const personalized =
        getPersonalizedObject(
            data
        );


    const rawCurrent =
        weather.current ||
        weather.current_weather ||
        data.current ||
        data.current_weather ||
        {};


    const personalizedCurrent =
        personalized.current ||
        personalized.current_weather ||
        {};


    /*
       IMPORTANT:

       Start with raw weather.

       Then add profile-specific values.

       But NULL values from personalized data
       must NOT overwrite real weather values.
    */

    const current = {
        ...rawCurrent
    };


    Object.entries(
        personalizedCurrent
    )
    .forEach(
        function([
            key,
            value
        ]) {

            if (
                isValidValue(value)
            ) {

                current[key] =
                    value;
            }
        }
    );


    /*
       Additional aliases.
    */

    current.temperature =
        firstValidValue(
            current.temperature,
            current.temperature_2m,
            current.temp
        );


    current.feels_like =
        firstValidValue(
            current.feels_like,
            current.apparent_temperature,
            current.feels_like_temperature
        );


    current.humidity =
        firstValidValue(
            current.humidity,
            current.relative_humidity_2m,
            current.relative_humidity
        );


    current.rain =
        firstValidValue(
            current.rain,
            current.rain_amount
        );


    current.precipitation =
        firstValidValue(
            current.precipitation,
            current.precipitation_amount
        );


    current.wind_speed =
        firstValidValue(
            current.wind_speed,
            current.wind_speed_10m,
            current.wind
        );


    current.wind_direction =
        firstValidValue(
            current.wind_direction,
            current.wind_direction_10m
        );


    current.weather_code =
        firstValidValue(
            current.weather_code,
            current.weathercode,
            current.code
        );


    /*
       UV can come from hourly data.
    */

    if (
        !isValidValue(
            current.uv
        )
    ) {

        const hourly =
            personalized.hourly ||
            weather.hourly ||
            {};

        const uv =
            hourly.uv || [];


        const firstUV =
            uv.find(
                function(value) {

                    return isValidValue(
                        value
                    );

                }
            );


        if (
            isValidValue(
                firstUV
            )
        ) {

            current.uv =
                firstUV;
        }
    }


    return current;
}


/* ============================================================
   22. MAIN API CALL
============================================================ */

async function generateHomepage() {

    const state =
        el("state")?.value || "";

    const district =
        el("district")?.value || "";

    const profile =
        el("profile")?.value || "";

    const language =
        el("language")?.value || "en";


    hide("error");

    hide("dashboard");


    /* --------------------------------------------------------
       VALIDATION
    -------------------------------------------------------- */

    if (!state) {

        showError(
            "Please select a state."
        );

        return;
    }


    if (!district) {

        showError(
            "Please select a district."
        );

        return;
    }


    if (!profile) {

        showError(
            "Please select a user profile."
        );

        return;
    }


    /* --------------------------------------------------------
       REQUEST
    -------------------------------------------------------- */

    const params =
        new URLSearchParams();


    params.append(
        "state",
        state
    );


    params.append(
        "district",
        district
    );


    params.append(
        "profile",
        profile
    );


    params.append(
        "language",
        language
    );


    /* --------------------------------------------------------
       TRAVELER PARAMETERS
    -------------------------------------------------------- */

    if (
        profile === "traveler"
    ) {

        const destinationState =
            el("destinationState")?.value || "";

        const destinationDistrict =
            el("destinationDistrict")?.value || "";

        const transport =
            el("transport")?.value || "";

        const days =
            el("days")?.value || "";

        const departureDate =
            el("departureDate")?.value || "";

        const departureTime =
            el("departureTime")?.value || "";


        if (!destinationState) {

            showError(
                "Please select destination state."
            );

            return;
        }


        if (!destinationDistrict) {

            showError(
                "Please select destination district."
            );

            return;
        }


        if (!transport) {

            showError(
                "Please select transport."
            );

            return;
        }


        if (!days) {

            showError(
                "Please select travel days."
            );

            return;
        }


        if (!departureDate) {

            showError(
                "Please select departure date."
            );

            return;
        }


        if (!departureTime) {

            showError(
                "Please select departure time."
            );

            return;
        }


        params.append(
            "destination_state",
            destinationState
        );


        params.append(
            "destination_district",
            destinationDistrict
        );


        params.append(
            "transport",
            transport
        );


        params.append(
            "days",
            days
        );


        params.append(
            "departure_date",
            departureDate
        );


        params.append(
            "departure_time",
            departureTime
        );
    }


    /* --------------------------------------------------------
       LOADING
    -------------------------------------------------------- */

    show("loading");


    const button =
        el("generateButton");


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Loading...";
    }


    /* --------------------------------------------------------
       API REQUEST
    -------------------------------------------------------- */

    try {

        const url =
            `/personalized-homepage?${params.toString()}`;


        console.log(
            "======================================"
        );

        console.log(
            "MAUSAM API REQUEST"
        );

        console.log(
            url
        );

        console.log(
            "======================================"
        );


        const response =
            await fetch(
                url
            );


        const responseText =
            await response.text();


        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        } catch (error) {

            console.error(
                "Backend returned:",
                responseText
            );

            throw new Error(
                "Backend did not return valid JSON."
            );
        }


        if (
            !response.ok
        ) {

            throw new Error(

                data.detail ||

                data.error ||

                data.message ||

                `Server error: ${response.status}`

            );
        }


        console.log(
            "======================================"
        );

        console.log(
            "MAUSAM API RESPONSE"
        );

        console.log(
            data
        );

        console.log(
            "======================================"
        );


        renderDashboard(
            data
        );


        show(
            "dashboard"
        );


        const dashboard =
            el("dashboard");


        if (dashboard) {

            window.scrollTo({

                top:
                    dashboard.offsetTop - 20,

                behavior:
                    "smooth"

            });
        }

    } catch (error) {

        console.error(
            "MAUSAM ERROR:",
            error
        );


        showError(
            error.message ||
            "Unable to load weather data."
        );

    } finally {

        hide(
            "loading"
        );


        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Generate Personalized Weather";
        }
    }
}


/* ============================================================
   23. RENDER DASHBOARD
============================================================ */

function renderDashboard(
    data
) {

    const personalized =
        getPersonalizedObject(
            data
        );


    const weather =
        getWeatherObject(
            data
        );


    const location =
        data.location ||
        data.location_data ||
        {};


    const profile =
        typeof data.profile === "object"
            ? data.profile
            : data.profile_data || {};


    const safety =
        data.safety ||
        data.safety_data ||
        {};


    const rules =
        data.rules ||
        data.rule_result ||
        {};


    /* --------------------------------------------------------
       PROFILE
    -------------------------------------------------------- */

    let profileName =
        profile.name ||
        data.profile_name ||
        personalized.profile_name ||
        "";


    if (!profileName) {

        const profileId =
            typeof data.profile === "string"
                ? data.profile
                : "";

        profileName =
            profileNames[profileId] ||
            titleCase(
                profileId
            ) ||
            "Personalized Weather";
    }


    const profileNameElement =
        el("profileName");


    if (profileNameElement) {

        profileNameElement.textContent =
            profileName;
    }


    /* --------------------------------------------------------
       LOCATION
    -------------------------------------------------------- */

    const state =
        location.state ||
        data.state ||
        "";


    const district =
        location.district ||
        data.district ||
        "";


    const locationElement =
        el("locationName");


    if (locationElement) {

        locationElement.textContent =
            [state, district]
                .filter(
                    Boolean
                )
                .join(", ");
    }


    /* --------------------------------------------------------
       HOMEPAGE
    -------------------------------------------------------- */

    const homepage =
        data.homepage ||
        data.homepage_information ||
        {};


    const homepageTitle =
        el("homepageTitle");


    if (homepageTitle) {

        homepageTitle.textContent =
            homepage.title ||
            personalized.title ||
            profileName;
    }


    const homepageFocus =
        el("homepageFocus");


    if (homepageFocus) {

        homepageFocus.textContent =
            homepage.focus ||
            homepage.description ||
            personalized.focus ||
            "Personalized weather information based on your profile.";
    }


    /* --------------------------------------------------------
       CURRENT WEATHER
    -------------------------------------------------------- */

    const currentWeather =
        getCurrentWeather(
            data
        );


    renderCurrentWeather(
        currentWeather
    );


    /* --------------------------------------------------------
       HOURLY WEATHER
    -------------------------------------------------------- */

    renderHourlyWeather(

        personalized.hourly ||
        weather.hourly ||
        data.hourly ||
        {}

    );


    /* --------------------------------------------------------
       SAFETY
    -------------------------------------------------------- */

    renderSafety(
        safety
    );


    /* --------------------------------------------------------
       RECOMMENDATIONS
    -------------------------------------------------------- */

    renderRecommendations(
        rules,
        safety,
        personalized,
        data
    );


    /* --------------------------------------------------------
       DAY PLAN
    -------------------------------------------------------- */

    const dayPlan =
        data.day_plan ||
        data.dayPlan ||
        data.complete_day_plan ||
        personalized.day_plan ||
        personalized.dayPlan ||
        data.homepage?.day_plan ||
        null;


    renderDayPlan(
        dayPlan
    );


    /* --------------------------------------------------------
       AIR QUALITY
    -------------------------------------------------------- */

    const airQuality =
        data.air_quality ||
        personalized.air_quality ||
        null;


    if (airQuality) {

        renderAirQuality(
            airQuality
        );

        show(
            "airQualitySection"
        );

    } else {

        hide(
            "airQualitySection"
        );
    }


    /* --------------------------------------------------------
       MARINE
    -------------------------------------------------------- */

    const marine =
        data.marine ||
        personalized.marine ||
        null;


    if (marine) {

        renderMarine(
            marine
        );

        show(
            "marineSection"
        );

    } else {

        hide(
            "marineSection"
        );
    }


    /* --------------------------------------------------------
       TRAVEL
    -------------------------------------------------------- */

    const traveler =
        data.traveler ||
        data.travel ||
        data.travel_plan ||
        personalized.traveler ||
        personalized.travel ||
        null;


    if (traveler) {

        renderTravel(
            traveler
        );

        show(
            "travelSection"
        );

    } else {

        hide(
            "travelSection"
        );
    }
}


/* ============================================================
   24. CURRENT WEATHER RENDER
============================================================ */

function renderCurrentWeather(
    current
) {

    const container =
        el("currentWeather");


    if (!container) {

        return;
    }


    container.innerHTML =
        "";


    /*
       IMPORTANT:
       All current weather values are displayed.
    */

    const items = [

        {
            key:
                "temperature",

            label:
                "🌡️ Temperature",

            value:
                current.temperature,

            suffix:
                " °C"
        },

        {
            key:
                "feels_like",

            label:
                "🌡️ Feels Like",

            value:
                current.feels_like,

            suffix:
                " °C"
        },

        {
            key:
                "humidity",

            label:
                "💧 Humidity",

            value:
                current.humidity,

            suffix:
                " %"
        },

        {
            key:
                "rain",

            label:
                "🌧️ Rain",

            value:
                current.rain,

            suffix:
                " mm"
        },

        {
            key:
                "precipitation",

            label:
                "🌧️ Precipitation",

            value:
                current.precipitation,

            suffix:
                " mm"
        },

        {
            key:
                "wind_speed",

            label:
                "💨 Wind Speed",

            value:
                current.wind_speed,

            suffix:
                " km/h"
        },

        {
            key:
                "wind_direction",

            label:
                "🧭 Wind Direction",

            value:
                current.wind_direction,

            suffix:
                "°"
        },

        {
            key:
                "weather_code",

            label:
                "🌤️ Weather Code",

            value:
                current.weather_code,

            suffix:
                ""
        },

        {
            key:
                "uv",

            label:
                "☀️ UV Index",

            value:
                current.uv,

            suffix:
                ""
        }

    ];


    let visibleCount =
        0;


    items.forEach(
        function(item) {

            if (
                isValidValue(
                    item.value
                )
            ) {

                visibleCount++;


                container.innerHTML += `

                    <div class="weather-item">

                        <div class="label">

                            ${item.label}

                        </div>


                        <div class="value">

                            ${formatNumber(
                                item.value,
                                item.suffix
                            )}

                        </div>

                    </div>

                `;
            }

        }
    );


    if (
        visibleCount === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                Current weather data is not available.

            </div>

        `;
    }
}


/* ============================================================
   25. HOURLY WEATHER
============================================================ */

function renderHourlyWeather(
    hourly
) {

    const container =
        el("hourlyWeather");


    if (!container) {

        return;
    }


    container.innerHTML =
        "";


    const times =
        hourly.time || [];


    const temperatures =
        hourly.temperature ||
        hourly.temperature_2m ||
        [];


    const rainProbability =
        hourly.rain_probability ||
        hourly.precipitation_probability ||
        [];


    const precipitation =
        hourly.precipitation ||
        [];


    const visibility =
        hourly.visibility ||
        [];


    const uv =
        hourly.uv ||
        hourly.uv_index ||
        [];


    const wind =
        hourly.wind_speed ||
        hourly.wind_speed_10m ||
        [];


    if (
        !times.length
    ) {

        container.innerHTML = `

            <div class="empty-state">

                Hourly weather data is not available.

            </div>

        `;

        return;
    }


    const count =
        Math.min(
            times.length,
            12
        );


    for (
        let i = 0;
        i < count;
        i++
    ) {

        container.innerHTML += `

            <div class="hour-card">

                <strong>

                    ${escapeHtml(
                        formatTime(
                            times[i]
                        )
                    )}

                </strong>


                <div>

                    🌡️

                    ${formatNumber(
                        temperatures[i],
                        " °C"
                    )}

                </div>


                <div>

                    🌧️ Rain:

                    ${formatNumber(
                        rainProbability[i],
                        " %"
                    )}

                </div>


                <div>

                    💧 Precipitation:

                    ${formatNumber(
                        precipitation[i],
                        " mm"
                    )}

                </div>


                <div>

                    👁️ Visibility:

                    ${formatNumber(
                        visibility[i],
                        " m"
                    )}

                </div>


                <div>

                    ☀️ UV:

                    ${formatNumber(
                        uv[i]
                    )}

                </div>


                <div>

                    💨 Wind:

                    ${formatNumber(
                        wind[i],
                        " km/h"
                    )}

                </div>

            </div>

        `;
    }
}


/* ============================================================
   26. SAFETY
============================================================ */

function renderSafety(
    safety
) {

    const container =
        el("safety");


    if (!container) {

        return;
    }


    container.innerHTML =
        "";


    const alerts =
        safety.safety_alerts ||
        safety.alerts ||
        [];


    const safetyLevel =
        safety.safety_level ||
        "normal";


    if (
        !Array.isArray(alerts) ||
        alerts.length === 0
    ) {

        container.innerHTML = `

            <div class="alert normal">

                ✅ No major safety alerts detected.

            </div>

        `;

        return;
    }


    alerts.forEach(
        function(alert) {

            const severity =
                alert.severity ||
                safetyLevel ||
                "normal";


            container.innerHTML += `

                <div class="alert ${escapeHtml(
                    severity
                )}">

                    <strong>

                        ⚠️

                        ${escapeHtml(
                            titleCase(
                                alert.type ||
                                severity
                            )
                        )}

                    </strong>


                    <div
                        style="
                            margin-top:6px;
                            line-height:1.6;
                        "
                    >

                        ${escapeHtml(
                            alert.message ||
                            alert.description ||
                            "Safety condition detected."
                        )}

                    </div>

                </div>

            `;
        }
    );
}


/* ============================================================
   27. RECOMMENDATIONS
============================================================ */

function renderRecommendations(
    rules,
    safety,
    personalized,
    data
) {

    const container =
        el("recommendations");


    if (!container) {

        return;
    }


    container.innerHTML =
        "";


    const sources = [

        rules?.recommendations,

        rules?.recommendation,

        safety?.recommendations,

        safety?.recommendation,

        personalized?.recommendations,

        personalized?.recommendation,

        data?.recommendations,

        data?.recommendation,

        data?.homepage?.recommendations

    ];


    const recommendations =
        [];


    sources.forEach(
        function(source) {

            if (
                source === null ||
                source === undefined
            ) {

                return;
            }


            if (
                Array.isArray(
                    source
                )
            ) {

                source.forEach(
                    function(item) {

                        recommendations.push(
                            item
                        );
                    }
                );

                return;
            }


            if (
                typeof source === "string"
            ) {

                recommendations.push(
                    source
                );

                return;
            }


            if (
                typeof source === "object"
            ) {

                Object.entries(
                    source
                )
                .forEach(
                    function([
                        key,
                        value
                    ]) {

                        recommendations.push({

                            key:
                                key,

                            value:
                                value

                        });

                    }
                );
            }
        }
    );


    const unique =
        [];


    recommendations.forEach(
        function(item) {

            const stringValue =
                JSON.stringify(
                    item
                );


            const alreadyExists =
                unique.some(
                    function(existing) {

                        return (
                            JSON.stringify(
                                existing
                            ) ===
                            stringValue
                        );

                    }
                );


            if (
                !alreadyExists
            ) {

                unique.push(
                    item
                );
            }
        }
    );


    if (
        unique.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                No personalized recommendations available.

            </div>

        `;

        return;
    }


    unique.forEach(
        function(item) {

            if (
                typeof item === "string"
            ) {

                container.innerHTML += `

                    <div class="recommendation">

                        🎯

                        ${escapeHtml(
                            item
                        )}

                    </div>

                `;

                return;
            }


            if (
                typeof item === "object" &&
                item !== null
            ) {

                const title =
                    item.title ||
                    item.type ||
                    item.category ||
                    item.key ||
                    "Recommendation";


                const message =
                    item.message ||
                    item.description ||
                    item.advice ||
                    item.recommendation ||
                    item.value;


                container.innerHTML += `

                    <div class="recommendation">

                        <strong>

                            🎯

                            ${escapeHtml(
                                titleCase(
                                    title
                                )
                            )}

                        </strong>


                        <div
                            style="
                                margin-top:8px;
                                line-height:1.6;
                            "
                        >

                            ${
                                typeof message === "object"

                                ? renderObjectInline(
                                    message
                                  )

                                : escapeHtml(
                                    safeValue(
                                        message
                                    )
                                  )
                            }

                        </div>

                    </div>

                `;
            }

        }
    );
}


/* ============================================================
   28. COMPLETE DAY PLAN
============================================================ */

function renderDayPlan(
    dayPlan
) {

    const container =
        el("dayPlan");


    if (!container) {

        return;
    }


    container.innerHTML =
        "";


    if (
        dayPlan === null ||
        dayPlan === undefined
    ) {

        container.innerHTML = `

            <div class="empty-state">

                Complete day plan is not available.

            </div>

        `;

        return;
    }


    console.log(
        "DAY PLAN:",
        dayPlan
    );


    let days =
        [];


    /* ARRAY */

    if (
        Array.isArray(
            dayPlan
        )
    ) {

        days =
            dayPlan;
    }


    /* days */

    else if (
        Array.isArray(
            dayPlan.days
        )
    ) {

        days =
            dayPlan.days;
    }


    /* plan */

    else if (
        Array.isArray(
            dayPlan.plan
        )
    ) {

        days =
            dayPlan.plan;
    }


    /* day_plan */

    else if (
        Array.isArray(
            dayPlan.day_plan
        )
    ) {

        days =
            dayPlan.day_plan;
    }


    /* daily_plan */

    else if (
        Array.isArray(
            dayPlan.daily_plan
        )
    ) {

        days =
            dayPlan.daily_plan;
    }


    /* object */

    else if (
        typeof dayPlan === "object"
    ) {

        const keys =
            Object.keys(
                dayPlan
            );


        const dateKeys =
            keys.filter(
                function(key) {

                    return /^\d{4}-\d{2}-\d{2}$/
                        .test(
                            key
                        );

                }
            );


        if (
            dateKeys.length > 0
        ) {

            dateKeys.forEach(
                function(date) {

                    days.push({

                        date:
                            date,

                        plan:
                            dayPlan[date]

                    });

                }
            );

        } else {

            days = [
                dayPlan
            ];
        }
    }


    if (
        days.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                Complete day plan is not available.

            </div>

        `;

        return;
    }


    days.forEach(
        function(
            day,
            index
        ) {

            renderSingleDay(
                container,
                day,
                index
            );

        }
    );
}


/* ============================================================
   29. SINGLE DAY
============================================================ */

function renderSingleDay(
    container,
    day,
    index
) {

    if (
        !day
    ) {

        return;
    }


    const date =
        day.date ||
        day.day ||
        day.date_string ||
        day.time ||
        `Day ${index + 1}`;


    let periods =
        day.periods ||
        day.plan ||
        day.schedule ||
        day.activities ||
        day.period_plan ||
        day.day_plan;


    if (
        !periods ||
        typeof periods !== "object"
    ) {

        periods =
            {};
    }


    /*
       Direct period names.
    */

    [
        "morning",
        "afternoon",
        "evening",
        "night"
    ]
    .forEach(
        function(period) {

            if (
                day[period] !== undefined
            ) {

                periods[period] =
                    day[period];
            }
        }
    );


    if (
        Object.keys(
            periods
        ).length === 0
    ) {

        periods =
            day;
    }


    container.innerHTML += `

        <div class="day-card">

            <h3>

                📅

                ${escapeHtml(
                    formatDate(
                        date
                    )
                )}

            </h3>


            <div class="day-plan-periods">

                ${renderPeriods(
                    periods
                )}

            </div>

        </div>

    `;
}


/* ============================================================
   30. PERIODS
============================================================ */

function renderPeriods(
    periods
) {

    if (
        !periods
    ) {

        return `

            <div class="empty-state">

                No period-wise plan available.

            </div>

        `;
    }


    if (
        Array.isArray(
            periods
        )
    ) {

        return periods
            .map(
                function(
                    period,
                    index
                ) {

                    const name =
                        period?.period ||
                        period?.name ||
                        `Period ${index + 1}`;


                    return renderPeriod(
                        period,
                        name
                    );

                }
            )
            .join("");
    }


    if (
        typeof periods === "object"
    ) {

        return Object.entries(
            periods
        )
        .map(
            function([
                name,
                value
            ]) {

                return renderPeriod(
                    value,
                    name
                );

            }
        )
        .join("");
    }


    return `

        <div class="period">

            ${escapeHtml(
                periods
            )}

        </div>

    `;
}


/* ============================================================
   31. PERIOD
============================================================ */

function renderPeriod(
    value,
    name
) {

    let html = `

        <div class="period">

            <div class="period-title">

                ${getPeriodIcon(
                    name
                )}

                ${escapeHtml(
                    titleCase(
                        name
                    )
                )}

            </div>

    `;


    if (
        typeof value === "string"
    ) {

        html += `

            <div
                style="
                    margin-top:8px;
                    line-height:1.7;
                "
            >

                ${escapeHtml(
                    value
                )}

            </div>

        `;

        html +=
            "</div>";

        return html;
    }


    if (
        typeof value === "number"
    ) {

        html += `

            <div
                style="
                    margin-top:8px;
                "
            >

                ${escapeHtml(
                    value
                )}

            </div>

        `;

        html +=
            "</div>";

        return html;
    }


    if (
        typeof value === "object" &&
        value !== null
    ) {

        html +=
            renderPeriodObject(
                value
            );
    }


    html +=
        "</div>";


    return html;
}


/* ============================================================
   32. PERIOD OBJECT
============================================================ */

function renderPeriodObject(
    obj
) {

    if (
        !obj ||
        typeof obj !== "object"
    ) {

        return "";
    }


    let html =
        "";


    const preferredOrder = [

        "time",

        "start_time",

        "end_time",

        "temperature",

        "temperature_range",

        "min_temperature",

        "max_temperature",

        "feels_like",

        "rain_probability",

        "precipitation_probability",

        "precipitation",

        "rain",

        "uv",

        "uv_index",

        "wind",

        "wind_speed",

        "wind_direction",

        "humidity",

        "visibility",

        "condition",

        "weather",

        "weather_condition",

        "aqi",

        "us_aqi",

        "aqi_level",

        "pm2_5",

        "pm10",

        "wave_height",

        "wave_period",

        "sea_surface_temperature",

        "soil_moisture",

        "soil_temperature",

        "tide",

        "advice",

        "recommendation",

        "recommendations",

        "activity",

        "activities",

        "safety",

        "safety_alert",

        "reason",

        "note"

    ];


    const used =
        new Set();


    preferredOrder.forEach(
        function(key) {

            if (
                Object.prototype.hasOwnProperty.call(
                    obj,
                    key
                )
            ) {

                html +=
                    renderDataLine(
                        key,
                        obj[key]
                    );


                used.add(
                    key
                );
            }
        }
    );


    Object.entries(
        obj
    )
    .forEach(
        function([
            key,
            value
        ]) {

            if (
                used.has(
                    key
                )
            ) {

                return;
            }


            if (
                key === "period" ||
                key === "name"
            ) {

                return;
            }


            html +=
                renderDataLine(
                    key,
                    value
                );
        }
    );


    return html;
}


/* ============================================================
   33. DATA LINE
============================================================ */

function renderDataLine(
    key,
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "";
    }


    let displayValue;


    if (
        typeof value === "object"
    ) {

        displayValue =
            renderObjectInline(
                value
            );

    } else {

        displayValue =
            formatPlanValue(
                key,
                value
            );
    }


    return `

        <div
            style="
                margin:7px 0;
                line-height:1.6;
            "
        >

            <strong>

                ${getFieldIcon(
                    key
                )}

                ${escapeHtml(
                    titleCase(
                        key
                    )
                )}:

            </strong>

            ${displayValue}

        </div>

    `;
}


/* ============================================================
   34. FORMAT PLAN VALUE
============================================================ */

function formatPlanValue(
    key,
    value
) {

    if (
        typeof value !== "number"
    ) {

        return escapeHtml(
            value
        );
    }


    const lower =
        String(
            key
        ).toLowerCase();


    if (
        lower.includes(
            "temperature"
        )
    ) {

        return formatNumber(
            value,
            " °C"
        );
    }


    if (
        lower.includes(
            "probability"
        ) ||
        lower.includes(
            "humidity"
        )
    ) {

        return formatNumber(
            value,
            " %"
        );
    }


    if (
        lower === "rain" ||
        lower.includes(
            "precipitation"
        )
    ) {

        return formatNumber(
            value,
            " mm"
        );
    }


    if (
        lower.includes(
            "wind"
        ) &&
        !lower.includes(
            "direction"
        )
    ) {

        return formatNumber(
            value,
            " km/h"
        );
    }


    if (
        lower.includes(
            "visibility"
        )
    ) {

        return formatNumber(
            value,
            " m"
        );
    }


    if (
        lower.includes(
            "wave_height"
        )
    ) {

        return formatNumber(
            value,
            " m"
        );
    }


    if (
        lower.includes(
            "wave_period"
        )
    ) {

        return formatNumber(
            value,
            " s"
        );
    }


    return formatNumber(
        value
    );
}


/* ============================================================
   35. INLINE OBJECT
============================================================ */

function renderObjectInline(
    obj
) {

    if (
        obj === null ||
        obj === undefined
    ) {

        return "N/A";
    }


    if (
        typeof obj !== "object"
    ) {

        return escapeHtml(
            obj
        );
    }


    if (
        Array.isArray(
            obj
        )
    ) {

        return obj
            .map(
                function(item) {

                    if (
                        typeof item === "object"
                    ) {

                        return renderObjectInline(
                            item
                        );
                    }

                    return escapeHtml(
                        item
                    );

                }
            )
            .join(", ");
    }


    let html =
        "";


    Object.entries(
        obj
    )
    .forEach(
        function([
            key,
            value
        ]) {

            if (
                value === null ||
                value === undefined
            ) {

                return;
            }


            if (
                typeof value === "object"
            ) {

                html += `

                    <div
                        style="
                            margin:4px 0;
                        "
                    >

                        <strong>

                            ${escapeHtml(
                                titleCase(
                                    key
                                )
                            )}:

                        </strong>

                        ${renderObjectInline(
                            value
                        )}

                    </div>

                `;

            } else {

                html += `

                    <div
                        style="
                            margin:4px 0;
                        "
                    >

                        <strong>

                            ${escapeHtml(
                                titleCase(
                                    key
                                )
                            )}:

                        </strong>

                        ${escapeHtml(
                            value
                        )}

                    </div>

                `;
            }
        }
    );


    return html;
}


/* ============================================================
   36. PERIOD ICON
============================================================ */

function getPeriodIcon(
    name
) {

    const value =
        String(
            name
        ).toLowerCase();


    if (
        value.includes(
            "morning"
        )
    ) {

        return "🌅";
    }


    if (
        value.includes(
            "afternoon"
        )
    ) {

        return "☀️";
    }


    if (
        value.includes(
            "evening"
        )
    ) {

        return "🌇";
    }


    if (
        value.includes(
            "night"
        )
    ) {

        return "🌙";
    }


    return "🕒";
}


/* ============================================================
   37. FIELD ICON
============================================================ */

function getFieldIcon(
    key
) {

    const value =
        String(
            key
        ).toLowerCase();


    if (
        value.includes(
            "temperature"
        )
    ) {

        return "🌡️";
    }


    if (
        value.includes(
            "rain"
        ) ||
        value.includes(
            "precipitation"
        )
    ) {

        return "🌧️";
    }


    if (
        value.includes(
            "uv"
        )
    ) {

        return "☀️";
    }


    if (
        value.includes(
            "wind"
        )
    ) {

        return "💨";
    }


    if (
        value.includes(
            "humidity"
        )
    ) {

        return "💧";
    }


    if (
        value.includes(
            "visibility"
        )
    ) {

        return "👁️";
    }


    if (
        value.includes(
            "soil"
        )
    ) {

        return "🌱";
    }


    if (
        value.includes(
            "wave"
        ) ||
        value.includes(
            "sea"
        )
    ) {

        return "🌊";
    }


    if (
        value.includes(
            "aqi"
        )
    ) {

        return "🌫️";
    }


    if (
        value.includes(
            "advice"
        ) ||
        value.includes(
            "recommendation"
        )
    ) {

        return "💡";
    }


    if (
        value.includes(
            "activity"
        )
    ) {

        return "🏃";
    }


    if (
        value.includes(
            "safety"
        )
    ) {

        return "⚠️";
    }


    if (
        value.includes(
            "tide"
        )
    ) {

        return "🌊";
    }


    return "•";
}


/* ============================================================
   38. AIR QUALITY
============================================================ */

function renderAirQuality(
    data
) {

    const container =
        el("airQuality");


    if (!container) {

        return;
    }


    const current =
        data.current ||
        data ||
        {};


    container.innerHTML = `

        <div class="aqi-box">

            <div class="aqi-number">

                AQI:

                ${formatNumber(
                    current.us_aqi
                )}

            </div>


            <div class="aqi-level">

                ${escapeHtml(
                    titleCase(
                        current.aqi_level ||
                        "Unknown"
                    )
                )}

            </div>


            <div class="data-row">

                <span class="data-label">

                    PM2.5

                </span>

                <span class="data-value">

                    ${formatNumber(
                        current.pm2_5
                    )}

                </span>

            </div>


            <div class="data-row">

                <span class="data-label">

                    PM10

                </span>

                <span class="data-value">

                    ${formatNumber(
                        current.pm10
                    )}

                </span>

            </div>


            <div class="data-row">

                <span class="data-label">

                    Ozone

                </span>

                <span class="data-value">

                    ${formatNumber(
                        current.ozone
                    )}

                </span>

            </div>


            <div class="data-row">

                <span class="data-label">

                    Nitrogen Dioxide

                </span>

                <span class="data-value">

                    ${formatNumber(
                        current.nitrogen_dioxide
                    )}

                </span>

            </div>


            <div class="data-row">

                <span class="data-label">

                    Sulphur Dioxide

                </span>

                <span class="data-value">

                    ${formatNumber(
                        current.sulphur_dioxide
                    )}

                </span>

            </div>

        </div>

    `;
}


/* ============================================================
   39. MARINE
============================================================ */

function renderMarine(
    data
) {

    const container =
        el("marine");


    if (!container) {

        return;
    }


    const current =
        data.current ||
        {};


    container.innerHTML = `

        <div class="marine-grid">


            <div class="marine-item">

                <div class="label">

                    🌊 Wave Height

                </div>

                <div class="value">

                    ${formatNumber(
                        current.wave_height,
                        " m"
                    )}

                </div>

            </div>


            <div class="marine-item">

                <div class="label">

                    🧭 Wave Direction

                </div>

                <div class="value">

                    ${formatNumber(
                        current.wave_direction,
                        "°"
                    )}

                </div>

            </div>


            <div class="marine-item">

                <div class="label">

                    ⏱️ Wave Period

                </div>

                <div class="value">

                    ${formatNumber(
                        current.wave_period,
                        " s"
                    )}

                </div>

            </div>


            <div class="marine-item">

                <div class="label">

                    🌊 Wind Wave Height

                </div>

                <div class="value">

                    ${formatNumber(
                        current.wind_wave_height,
                        " m"
                    )}

                </div>

            </div>


            <div class="marine-item">

                <div class="label">

                    🌊 Swell Wave Height

                </div>

                <div class="value">

                    ${formatNumber(
                        current.swell_wave_height,
                        " m"
                    )}

                </div>

            </div>


            <div class="marine-item">

                <div class="label">

                    🌡️ Sea Temperature

                </div>

                <div class="value">

                    ${formatNumber(
                        current.sea_surface_temperature,
                        " °C"
                    )}

                </div>

            </div>

        </div>


        <div
            class="travel-box"
            style="margin-top:15px;"
        >

            <h3>

                🌊 Tide Information

            </h3>


            <p>

                ${escapeHtml(
                    data.tide?.message ||
                    "Tide information is not available."
                )}

            </p>

        </div>

    `;
}


/* ============================================================
   40. TRAVEL
============================================================ */

function renderTravel(
    data
) {

    const container =
        el("travel");


    if (!container) {

        return;
    }


    container.innerHTML =
        "";


    const departure =
        data.departure_weather ||
        data.departureWeather ||
        {};


    const summary =
        data.summary ||
        "";


    const departureAdvice =
        data.departure_advice ||
        data.departureAdvice ||
        "";


    const packing =
        data.packing_suggestions ||
        data.packing ||
        [];


    const travelAdvice =
        data.travel_advice ||
        data.travelAdvice ||
        [];


    const travelPlan =
        data.travel_plan ||
        data.travelPlan ||
        [];


    if (
        summary
    ) {

        container.innerHTML += `

            <div class="travel-box">

                <h3>

                    ✈️ Travel Summary

                </h3>


                <p>

                    ${escapeHtml(
                        summary
                    )}

                </p>

            </div>

        `;
    }


    if (
        Object.keys(
            departure
        ).length
    ) {

        container.innerHTML += `

            <div class="travel-box">

                <h3>

                    🕐 Departure Weather

                </h3>


                <div class="data-row">

                    <span class="data-label">

                        Time

                    </span>

                    <span class="data-value">

                        ${escapeHtml(
                            safeValue(
                                departure.time
                            )
                        )}

                    </span>

                </div>


                <div class="data-row">

                    <span class="data-label">

                        Temperature

                    </span>

                    <span class="data-value">

                        ${formatNumber(
                            departure.temperature,
                            " °C"
                        )}

                    </span>

                </div>


                <div class="data-row">

                    <span class="data-label">

                        Rain Probability

                    </span>

                    <span class="data-value">

                        ${formatNumber(
                            departure.rain_probability,
                            " %"
                        )}

                    </span>

                </div>


                <div class="data-row">

                    <span class="data-label">

                        Precipitation

                    </span>

                    <span class="data-value">

                        ${formatNumber(
                            departure.precipitation,
                            " mm"
                        )}

                    </span>

                </div>


                <div class="data-row">

                    <span class="data-label">

                        Wind

                    </span>

                    <span class="data-value">

                        ${formatNumber(
                            departure.wind_speed,
                            " km/h"
                        )}

                    </span>

                </div>


                <div class="data-row">

                    <span class="data-label">

                        Visibility

                    </span>

                    <span class="data-value">

                        ${formatNumber(
                            departure.visibility,
                            " m"
                        )}

                    </span>

                </div>


                <div class="data-row">

                    <span class="data-label">

                        UV

                    </span>

                    <span class="data-value">

                        ${formatNumber(
                            departure.uv
                        )}

                    </span>

                </div>

            </div>

        `;
    }


    if (
        departureAdvice
    ) {

        container.innerHTML += `

            <div class="travel-box">

                <h3>

                    🚌 Departure Advice

                </h3>


                <p>

                    ${escapeHtml(
                        departureAdvice
                    )}

                </p>

            </div>

        `;
    }


    if (
        Array.isArray(
            packing
        ) &&
        packing.length
    ) {

        container.innerHTML += `

            <div class="travel-box">

                <h3>

                    🎒 Packing Suggestions

                </h3>


                <ul>

                    ${packing
                        .map(
                            function(item) {

                                if (
                                    typeof item === "object"
                                ) {

                                    return `
                                        <li>
                                            ${renderObjectInline(
                                                item
                                            )}
                                        </li>
                                    `;
                                }


                                return `
                                    <li>
                                        ${escapeHtml(
                                            item
                                        )}
                                    </li>
                                `;
                            }
                        )
                        .join("")
                    }

                </ul>

            </div>

        `;
    }


    if (
        Array.isArray(
            travelAdvice
        ) &&
        travelAdvice.length
    ) {

        container.innerHTML += `

            <div class="travel-box">

                <h3>

                    💡 Travel Advice

                </h3>


                <ul>

                    ${travelAdvice
                        .map(
                            function(item) {

                                if (
                                    typeof item === "object"
                                ) {

                                    return `
                                        <li>
                                            ${renderObjectInline(
                                                item
                                            )}
                                        </li>
                                    `;
                                }


                                return `
                                    <li>
                                        ${escapeHtml(
                                            item
                                        )}
                                    </li>
                                `;
                            }
                        )
                        .join("")
                    }

                </ul>

            </div>

        `;
    }


    if (
        Array.isArray(
            travelPlan
        ) &&
        travelPlan.length
    ) {

        container.innerHTML += `

            <div class="travel-box">

                <h3>

                    📅 Travel Plan

                </h3>


                ${travelPlan
                    .map(
                        function(
                            day,
                            index
                        ) {

                            if (
                                typeof day === "string"
                            ) {

                                return `

                                    <div
                                        class="travel-plan-day"
                                    >

                                        <strong>

                                            Day
                                            ${index + 1}

                                        </strong>


                                        <p>

                                            ${escapeHtml(
                                                day
                                            )}

                                        </p>

                                    </div>

                                `;
                            }


                            return `

                                <div
                                    class="travel-plan-day"
                                >

                                    <strong>

                                        ${escapeHtml(
                                            day.date ||
                                            `Day ${index + 1}`
                                        )}

                                    </strong>


                                    <div
                                        style="
                                            margin-top:8px;
                                        "
                                    >

                                        ${renderObjectInline(
                                            day
                                        )}

                                    </div>

                                </div>

                            `;

                        }
                    )
                    .join("")
                }

            </div>

        `;
    }


    if (
        !container.innerHTML.trim()
    ) {

        container.innerHTML = `

            <div class="empty-state">

                Traveler information is not available.

            </div>

        `;
    }
}


/* ============================================================
   41. ERROR DISPLAY
============================================================ */

function showError(
    message
) {

    const errorBox =
        el("error");


    if (!errorBox) {

        console.error(
            message
        );

        return;
    }


    errorBox.textContent =
        message;


    show(
        "error"
    );


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });
}


/* ============================================================
   42. LOCATION EVENTS
============================================================ */

function setupLocationEvents() {

    const state =
        el("state");


    const destinationState =
        el("destinationState");


    if (state) {

        state.addEventListener(
            "change",
            function() {

                loadDistricts(
                    "state",
                    "district"
                );

            }
        );
    }


    if (
        destinationState
    ) {

        destinationState.addEventListener(
            "change",
            function() {

                loadDistricts(
                    "destinationState",
                    "destinationDistrict"
                );

            }
        );
    }
}


/* ============================================================
   43. PROFILE EVENT
============================================================ */

function setupProfileEvents() {

    const profile =
        el("profile");


    if (!profile) {

        return;
    }


    profile.addEventListener(
        "change",
        function() {

            updateTravelerSection();

        }
    );
}


/* ============================================================
   44. INITIALIZATION
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "======================================"
        );

        console.log(
            "MAUSAM PERSONAL AI"
        );

        console.log(
            "Frontend initializing..."
        );

        console.log(
            "======================================"
        );


        /* LOAD STATES */

        loadStates();


        /* LOAD DESTINATION STATES */

        loadDestinationStates();


        /* PROFILE */

        setupProfileOptions();


        /* EVENTS */

        setupLocationEvents();

        setupProfileEvents();


        /* INITIAL DISTRICTS */

        if (
            el("state")?.value
        ) {

            loadDistricts(
                "state",
                "district"
            );
        }


        if (
            el("destinationState")?.value
        ) {

            loadDistricts(
                "destinationState",
                "destinationDistrict"
            );
        }


        /* TRAVELER */

        updateTravelerSection();


        console.log(
            "Frontend loaded successfully."
        );
    }
);


/* ============================================================
   45. GLOBAL FUNCTIONS
============================================================ */

window.generateHomepage =
    generateHomepage;

window.loadDistricts =
    loadDistricts;

window.updateTravelerSection =
    updateTravelerSection;

window.renderDayPlan =
    renderDayPlan;

window.renderRecommendations =
    renderRecommendations;


/* ============================================================
   END
============================================================ */