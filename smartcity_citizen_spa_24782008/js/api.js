const BASE_URL = "http://127.0.0.1:8000";

export async function requestAPI(endpoint, method = "GET", bodyData = null) {

    const token = localStorage.getItem("access_token");

    const config = {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json" // 🌟 TAMBAHKAN BARIS INI 🌟
        }
    };

    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }

    if (bodyData) {
        config.body = JSON.stringify(bodyData);
    }

    const response = await fetch(BASE_URL + endpoint, config);

    return response;
}