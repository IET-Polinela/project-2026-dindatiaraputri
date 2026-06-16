const BASE_URL = "http://103.151.63.71:8011/api";

export async function requestAPI(endpoint, method = "GET", bodyData = null) {
    const token = localStorage.getItem("access_token");
    
    // Langsung gabungkan BASE_URL + endpoint
    const fullUrl = BASE_URL + endpoint;

    const config = {
        method,
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...(token && { "Authorization": `Bearer ${token}` })
        }
    };

    if (bodyData) config.body = JSON.stringify(bodyData);

    try {
        const response = await fetch(fullUrl, config);
        return response;
    } catch (error) {
        console.error("Fetch Error:", error);
        return { ok: false, status: 500 };
    }
}