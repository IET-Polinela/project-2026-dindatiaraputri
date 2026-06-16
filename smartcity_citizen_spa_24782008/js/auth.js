import { requestAPI } from "./api.js";

export function setupLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const isRegisterPage = window.location.hash === "#register";

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const email = document.getElementById("email")?.value?.trim();

        try {

            // ======================
            // REGISTER
            // ======================
            if (isRegisterPage) {
                const res = await requestAPI(
                    "/api/register/",
                    "POST",
                    { username, email, password }
                );

                if (!res.ok) {
                    const msg =
                        Object.values(res.data || {}).flat?.()?.[0] ||
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
            const res = await requestAPI(
                "/api/token/",
                "POST",
                { username, password }
            );

            if (!res.ok) {
                throw new Error(
                    res.data?.detail || "Login gagal"
                );
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
            alert(error.message);
        }
    });
}