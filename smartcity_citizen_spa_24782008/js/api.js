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

    const response = await fetch(BASE_URL + endpoint, options);

    // 🔥 AMBIL JSON DI SINI SEKALIAN (BIAR AMAN)
    let data = null;

    try {
        data = await response.json();
    } catch (e) {
        data = null;
    }

    return {
        ok: response.ok,
        status: response.status,
        data: data
    };
}