import { requestAPI } from "./api.js";

export function setupLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        try {
            const isRegisterPage = window.location.hash === "#register";
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value;
            const email = document.getElementById("email")?.value.trim();

            if (isRegisterPage) {
                const response = await requestAPI(
                    "/api/register/",
                    "POST",
                    { username, email, password }
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const firstError = Object.values(errorData).flat()[0];
                    throw new Error(firstError || "Registrasi gagal. Coba username/email lain.");
                }

                alert("Registrasi berhasil! Silakan login.");
                window.location.hash = "#login";
                return;
            }

            // Memanggil path lengkap sesuai urls.py (api/token/)
            const response = await requestAPI(
                "/api/token/", 
                "POST",
                { username, password }
            );

            // Cek jika response tidak sukses
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || "Login gagal, periksa username/password.");
            }

            const data = await response.json();
            localStorage.setItem("access_token", data.access);
            localStorage.setItem("refresh_token", data.refresh);

            alert("Login berhasil!");
            window.location.hash = "#dashboard";

        } catch (error) {
            console.error("Detail Error:", error);
            alert(error.message);
        }
    });
}
