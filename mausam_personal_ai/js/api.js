/* =========================================================
   MAUSAM PERSONALAI
   API LAYER
========================================================= */

const API = {

    async request(endpoint, params = {}) {

        const query = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {

            if (
                value !== undefined &&
                value !== null &&
                value !== ""
            ) {
                query.set(key, value);
            }

        });

        const url =
            query.toString()
                ? `${endpoint}?${query.toString()}`
                : endpoint;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        let data = null;

        try {
            data = await response.json();
        } catch {
            data = null;
        }

        if (!response.ok) {

            let message = `Request failed (${response.status})`;

            if (data?.detail) {

                if (typeof data.detail === "string") {
                    message = data.detail;
                } else {
                    message = JSON.stringify(data.detail);
                }
            }

            throw new Error(message);
        }

        return data;
    },


    /* =====================================================
       STATES
    ===================================================== */

    async getStates() {

        return this.request("/states");
    },


    /* =====================================================
       DISTRICTS
    ===================================================== */

    async getDistricts(state) {

        return this.request("/districts", {
            state
        });
    },


    /* =====================================================
       PROFILES
    ===================================================== */

    async getProfiles() {

        return this.request("/profiles");
    },


    /* =====================================================
       PROFILE
    ===================================================== */

    async getProfile(profile) {

        return this.request("/profile", {
            profile
        });
    },


    /* =====================================================
       PERSONALIZED HOMEPAGE
    ===================================================== */

    async getPersonalizedHomepage(options) {

        return this.request(
            "/personalized-homepage",
            options
        );
    },


    /* =====================================================
       WEATHER
    ===================================================== */

    async getWeather(state, district) {

        return this.request("/weather", {
            state,
            district
        });
    },


    /* =====================================================
       RECOMMENDATIONS
    ===================================================== */

    async getRecommendations(
        state,
        district,
        profile
    ) {

        return this.request(
            "/recommendations",
            {
                state,
                district,
                profile
            }
        );
    },


    /* =====================================================
       DAY PLAN
    ===================================================== */

    async getDayPlan(
        state,
        district,
        profile
    ) {

        return this.request(
            "/day-plan",
            {
                state,
                district,
                profile
            }
        );
    },


    /* =====================================================
       MARINE
    ===================================================== */

    async getMarine(
        state,
        district
    ) {

        return this.request(
            "/marine",
            {
                state,
                district
            }
        );
    },


    /* =====================================================
       BEACH PLAN
    ===================================================== */

    async getBeachPlan(
        state,
        district
    ) {

        return this.request(
            "/beach-plan",
            {
                state,
                district
            }
        );
    },


    /* =====================================================
       TRAVELER PLAN
    ===================================================== */

    async getTravelerPlan(options) {

        return this.request(
            "/traveler-plan",
            options
        );
    },


    /* =====================================================
       HEALTH CHECK
    ===================================================== */

    async health() {

        return this.request("/health");
    }

};