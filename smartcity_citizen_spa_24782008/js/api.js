const DEFAULT_HOST = "103.151.63.71:8011";

const DEFAULT_PROTOCOL = (typeof window !== 'undefined' && window.location && window.location.protocol)
    ? window.location.protocol.replace(':', '')
    : 'http';

if (typeof window !== 'undefined' && typeof window.DEFAULT_PROTOCOL === 'undefined') {
    window.DEFAULT_PROTOCOL = DEFAULT_PROTOCOL;
}

const BASE_URL = `${DEFAULT_PROTOCOL}://${DEFAULT_HOST}`;

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

    let response;
    try {
        response = await fetch(BASE_URL + endpoint, options);
    } catch (err) {
        console.error("Network error when fetching", err);
        return {
            ok: false,
            status: 0,
            data: null,
            error: err.message || 'Network error'
        };
    }

    // 🔥 AMBIL JSON DI SINI SEKALIAN (BIAR AMAN)
    let data = null;

    // Debug: log objek response untuk deteksi masalah seperti `response.json is not a function`
    try {
        console.debug("[requestAPI] fetch response:", response);
        console.debug("[requestAPI] response instanceof Response:", (typeof Response !== 'undefined') ? (response instanceof Response) : 'Response not available');
    } catch (dbgErr) {
        console.debug('[requestAPI] debug err', dbgErr);
    }

    try {
        data = await response.json();
    } catch (e) {
        console.warn("[requestAPI] failed to parse JSON from response", e);
        data = null;
    }

    return {
        ok: response.ok,
        status: response.status,
        data: data
    };
}