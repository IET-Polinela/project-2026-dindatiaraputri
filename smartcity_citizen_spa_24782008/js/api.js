const DEFAULT_HOST = "103.151.63.71:8011";

// Backend di VPS kampus berjalan di HTTP biasa (belum ada SSL/HTTPS).
// Kita paksa 'http' di sini, TIDAK ikut protokol halaman (yang https di GitHub Pages),
// supaya request tidak salah alamat. Lihat catatan mixed-content di bawah.
const DEFAULT_PROTOCOL = 'http';

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

    // ======================================================
    // INTERCEPTOR 401 (AUTH-05 & AUTH-06)
    // ======================================================
    // Jika token invalid/kadaluarsa, server mengembalikan 401.
    // SPA ini TIDAK memiliki mekanisme auto-refresh token, jadi
    // begitu 401 diterima, sesi langsung dianggap berakhir:
    //   - localStorage dibersihkan total
    //   - user diberi tahu via alert
    //   - user diarahkan kembali ke halaman login
    // ======================================================
    if (response.status === 401) {
        alert('Sesi Anda telah habis atau Anda belum login.');
        localStorage.clear();
        window.location.hash = '#login';
        return null;
    }

    let data = null;
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