import { requestAPI } from "./api.js";

export function setupLoginForm() {
    const form = document.getElementById("loginForm");

    if (!form) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        try {
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            // Mengirim request ke backend Django
            const response = await requestAPI(
                "/api/token/",
                "POST",
                {
                    username,
                    password
                }
            );

            console.log("STATUS:", response.status);

            // Ambil teks mentah dulu untuk keperluan log kamu
            const text = await response.text();
            console.log("RESPONSE:", text);

            // Validasi: Jika respons ternyata HTML (bukan JSON), kita tangkap sebelum di-parse
            if (text.trim().startsWith("<!DOCTYPE")) {
                throw new Error("Backend mengembalikan HTML, bukan JSON. Pastikan endpoint URL atau konfigurasi Accept Header di api.js sudah benar.");
            }

            // Jika aman, baru lakukan parse JSON
            const data = JSON.parse(text);

            if (response.ok) {
                localStorage.setItem(
                    "access_token",
                    data.access
                );

                localStorage.setItem(
                    "refresh_token",
                    data.refresh
                );

                alert("Login berhasil!");
                window.location.hash = "#dashboard";
            } else {
                // Menampilkan pesan error dari backend jika ada (misal: "No active account found")
                const errorMsg = data.detail || "Login gagal!";
                alert(errorMsg);
            }

        } catch (error) {
            console.error("Detail Error:", error);
            alert("Terjadi error, cek Console.");
        }
    });
}