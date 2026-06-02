const BASE_URL = 'http://127.0.0.1:8000';

async function requestAPI(endpoint, method = 'GET', bodyData = null) {

    const token = localStorage.getItem('access_token');

    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers
    };

    if (bodyData) {
        config.body = JSON.stringify(bodyData);
    }

    const response = await fetch(BASE_URL + endpoint, config);

    return response;
}