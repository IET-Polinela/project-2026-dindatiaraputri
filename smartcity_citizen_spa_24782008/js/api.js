const BASE_URL = "http://127.0.0.1:8000";

export async function requestAPI(endpoint, method = "GET", bodyData = null) {
    const token = localStorage.getItem("access_token");

    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers
    };

    if (bodyData) {
        config.body = JSON.stringify(bodyData);
    }

    // Jika dijalankan di Live Server (port 5500) dan endpoint adalah daftar laporan,
    // paksa gunakan mock lokal agar semua laporan (demo) muncul di UI.
    if (typeof window !== 'undefined' && window.location && window.location.port === '5500' && endpoint && endpoint.startsWith('/api/reports')) {
        try {
            const mockResp = await fetch('/mock_reports.json');
            if (mockResp.ok) {
                const mockData = await mockResp.json().catch(() => ([]));
                return new Response(JSON.stringify(mockData), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        } catch (e) {
            console.warn('Mock direct fetch failed:', e);
        }
        // jika mock gagal, lanjut ke fetch ke backend biasa
    }

    try {
        const response = await fetch(BASE_URL + endpoint, config);

        // Jika permintaan sukses, kembalikan response mentah
        if (response.ok) return response;

        // Jika gagal dan frontend dijalankan di Live Server (:5500),
        // coba fallback ke mock lokal `mock_reports.json` agar demo tetap menampilkan data.
        if (typeof window !== 'undefined' && window.location && window.location.port === '5500') {
            try {
                const mockResp = await fetch('/mock_reports.json');
                if (mockResp.ok) {
                    const mockData = await mockResp.json().catch(() => ({}));
                    return new Response(JSON.stringify(mockData), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            } catch (e) {
                console.warn('Mock fallback failed:', e);
            }
        }

        // Jika tidak ada fallback, kembalikan response asli (status tidak ok)
        return response;
    } catch (error) {
        console.error("Fetch Error:", error);
        // Jika terjadi error jaringan, coba juga fallback ke mock ketika dijalankan di Live Server
        if (typeof window !== 'undefined' && window.location && window.location.port === '5500') {
            try {
                const mockResp = await fetch('/mock_reports.json');
                if (mockResp.ok) {
                    const mockData = await mockResp.json().catch(() => ({}));
                    return new Response(JSON.stringify(mockData), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            } catch (e) {
                console.warn('Mock fallback failed:', e);
            }
        }

        // Kembalikan objek minimal yang meniru Response untuk menghindari crash
        return {
            ok: false,
            status: 500,
            json: async () => ({ detail: "Koneksi ke server gagal" })
        };
    }
}