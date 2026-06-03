import { setupLoginForm } from "./auth.js";

export function router() {

    const app = document.getElementById("app");

    const hash = window.location.hash || "#login";

    if (hash === "#dashboard") {

        app.innerHTML = `
            <div class="container mt-4">

                <h2>
                    <i class="bi bi-speedometer2"></i>
                    Dashboard Citizen
                </h2>

                <div class="row mt-3">

                    <div class="col-12 col-lg-3">
                        <div class="card p-3">
                            Menu Kiri
                        </div>
                    </div>

                    <div class="col-12 col-lg-6">
                        <div class="card p-3">
                            Konten Tengah
                        </div>
                    </div>

                    <div class="col-12 col-lg-3">
                        <div class="card p-3">
                            Panel Kanan
                        </div>
                    </div>

                </div>

            </div>
        `;

    } else {

        app.innerHTML = `
            <div class="container mt-5">

                <div class="row justify-content-center">

                    <div class="col-md-4">

                        <div class="card">

                            <div class="card-body">

                                <h3 class="text-center mb-3">
                                    <i class="bi bi-person-circle"></i>
                                    Login
                                </h3>

                                <form id="loginForm">

                                    <input
                                        type="text"
                                        id="username"
                                        class="form-control mb-2"
                                        placeholder="Username">

                                    <input
                                        type="password"
                                        id="password"
                                        class="form-control mb-3"
                                        placeholder="Password">

                                    <button
                                        type="submit"
                                        class="btn btn-primary w-100">
                                        Login
                                    </button>

                                </form>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        `;

        // PENTING
        setupLoginForm();
    }
}