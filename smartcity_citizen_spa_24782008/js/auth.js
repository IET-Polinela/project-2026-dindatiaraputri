import { requestAPI } from "./api.js?v=20260616-2";

export function setupLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const isRegisterPage = window.location.hash === "#register";
        const username = document.getElementById("username")?.value?.trim();
        const password = document.getElementById("password")?.value;
        const email = document.getElementById("email")?.value?.trim();

        try {
            // Panggil API dengan struktur yang konsisten
            const res = await requestAPI(
                isRegisterPage ? "/api/register/" : "/api/token/",
                "POST",
                isRegisterPage ? { username, email, password } : { username, password }
            );

            // PERBAIKAN: Cek apakah res ada dan valid sebelum mengakses properti
            if (!res) {
                throw new Error("Gagal terhubung ke server. Pastikan koneksi aman (HTTPS).");
            }

            // ======================
            // REGISTER
            // ======================
            if (isRegisterPage) {
                if (!res.ok) {
                    const msg =
                        (res.data && typeof res.data === 'object' ? Object.values(res.data).flat()?.[0] : null) ||
                        res.data?.detail ||
                        "Registrasi gagal";
                    throw new Error(msg);
                }
                alert("Registrasi berhasil!");
                window.location.hash = "#login";
                return;
            }

            // ======================
            // LOGIN
            // ======================
            if (!res.ok) {
                throw new Error(res.data?.detail || "Login gagal");
            }

            if (!res.data?.access || !res.data?.refresh) {
                throw new Error("Token tidak valid dari server");
            }

            localStorage.setItem("access_token", res.data.access);
            localStorage.setItem("refresh_token", res.data.refresh);

            alert("Login berhasil!");
            window.location.hash = "#dashboard";

        } catch (error) {
            console.error("AUTH ERROR:", error);
            // Menampilkan pesan error ke user agar tidak bingung
            alert(error.message || "Terjadi kesalahan yang tidak diketahui.");
        }
    });
}