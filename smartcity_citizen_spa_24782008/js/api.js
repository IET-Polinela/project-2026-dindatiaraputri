// api.js

const BASE_URL = "http://103.151.63.71:8011";

export async function requestAPI(endpoint, method = "GET", bodyData = null) {
    const token = localStorage.getItem("access_token");

    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers,
    };

    if (bodyData) {
        options.body = JSON.stringify(bodyData);
    }

    try {
        console.log("Request URL:", BASE_URL + endpoint);

        const response = await fetch(BASE_URL + endpoint, options);

        let data = null;

        try {
            data = await response.json();
        } catch (err) {
            console.warn("Response is not JSON", err);
        }

        return {
            ok: response.ok,
            status: response.status,
            data: data,
        };
    } catch (err) {
        console.error("Network error:", err);

        return {
            ok: false,
            status: 0,
            data: null,
            error: err.message,
        };
    }
}