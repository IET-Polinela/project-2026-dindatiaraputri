import { setupLoginForm } from "./auth.js?v=20260616-2";
import { requestAPI } from "./api.js?v=20260616-2";

/* =========================
   STYLE HELPERS (DIPERTAHANKAN)
========================= */
function clearStyles() {
    document.querySelectorAll("style[data-route-style]").forEach((style) => style.remove());
}

function injectStyle(cssContent) {
    const style = document.createElement("style");
    style.setAttribute("data-route-style", "true");
    style.innerHTML = cssContent;
    document.head.appendChild(style);
}

/* =========================
   GLOBAL ACTIONS (BARU & DIPERTAHANKAN)
========================= */
window.handleLogout = function () {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.hash = "#login";
    window.location.reload();
};

window.submitReport = async function (status) {
    const normalizedStatus = normalizeStatus(status);
    const data = {
        title: document.getElementById("newTitle").value,
        description: document.getElementById("newDesc").value,
        location: document.getElementById("newLocation").value,
        category: document.getElementById("newCategory").value,
        status: normalizedStatus
    };
    const response = await requestAPI("/api/reports/", "POST", data);
    if (response.ok) {
        alert(`Laporan berhasil disimpan sebagai ${getStatusLabel(normalizedStatus)}!`);
        document.getElementById("reportModal").style.display = "none";
        window.fetchAndRenderReports();
    } else {
        alert("Gagal mengirim laporan. Pastikan Anda sudah login.");
    }
};

const STATUS_LABELS = {
    DRAFT: "Draft",
    REPORTED: "Reported",
    VERIFIED: "Verified",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved"
};

function normalizeStatus(status) {
    if (!status) return "DRAFT";
    const normalized = String(status).trim().toUpperCase().replace(/\s+/g, "_");

    if (normalized === "SUBMITTED") return "REPORTED";
    return normalized;
}

function getStatusLabel(status) {
    const normalized = normalizeStatus(status);
    return STATUS_LABELS[normalized] || status || "Draft";
}

function getStatusBadgeClass(status) {
    const normalized = normalizeStatus(status);
    if (normalized === "RESOLVED") return "bg-success";
    if (normalized === "VERIFIED" || normalized === "IN_PROGRESS") return "bg-info";
    return "bg-warning";
}

/* =========================
   DASHBOARD RENDER (DIPERTAHANKAN)
========================= */
window.renderDashboard = function (reports) {
    const container = document.getElementById("reports-container");
    if (!container) return;

    container.innerHTML = reports.length > 0 ? reports.map(r => `
        <div class="report-card">
            <h6 class="fw-bold">${r.title || 'Tanpa Judul'}</h6>
            <p class="small text-muted mb-1">${r.location || 'Lokasi tidak diketahui'}</p>
            <p class="mb-2">${r.description || '-'}</p>
            <span class="badge ${getStatusBadgeClass(r.status)}">${getStatusLabel(r.status)}</span>
        </div>
    `).join('') : '<p class="text-center py-5">Belum ada laporan.</p>';

    const statusCounts = reports.reduce((counts, report) => {
        const status = normalizeStatus(report.status);
        counts[status] = (counts[status] || 0) + 1;
        return counts;
    }, {});

    document.getElementById('stats-total').innerText = reports.length;
    document.getElementById('stats-draft').innerText = statusCounts.DRAFT || 0;
    document.getElementById('stats-reported').innerText = statusCounts.REPORTED || 0;
    document.getElementById('stats-verified').innerText = statusCounts.VERIFIED || 0;
    document.getElementById('stats-progress').innerText = statusCounts.IN_PROGRESS || 0;
    document.getElementById('stats-resolved').innerText = statusCounts.RESOLVED || 0;
};

window.fetchAndRenderReports = async function () {
    try {
        const tab = window.currentDashboardTab || 'my_reports';
        const resp = await requestAPI(`/api/reports/?tab=${encodeURIComponent(tab)}`, 'GET');
        const data = resp.data || [];
        const reports = Array.isArray(data) ? data : (data.results || []);
        window.renderDashboard(reports);
    } catch (err) { console.error("Gagal memuat:", err); }
};

window.switchDashboardTab = function (tab) {
    window.currentDashboardTab = tab;
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
    window.fetchAndRenderReports();
};

/* =========================
   ROUTER (DIPERTAHANKAN & DITAMBAH)
========================= */
export function router() {
    const app = document.getElementById("app");
    const hash = window.location.hash || "#login";

    if (window.reportPollingInterval) clearInterval(window.reportPollingInterval);
    clearStyles(); 
    app.innerHTML = ""; 

    if (hash === "#dashboard") {
        window.currentDashboardTab = window.currentDashboardTab || 'my_reports';
        injectStyle(`
            body { background: #FFFDF5 !important; }
            .dashboard-container { padding: 30px; }
            .report-card { background: white; padding: 20px; border-radius: 15px; border: 1px solid #FFEAA7; margin-bottom: 15px; }
            .nav-link { cursor: pointer; color: #574B14; }
            .nav-link.active { background: #FFD23F !important; color: #574B14 !important; font-weight: bold; }
        `);

        app.innerHTML = `
            <div class="container-fluid dashboard-container">
                <div class="row">
                    <div class="col-lg-3">
                        <button class="btn btn-warning w-100 mb-3 fw-bold" id="btnOpenModal">+ Laporan Baru</button>
                        <div class="nav flex-column nav-pills mb-4">
                            <button class="nav-link active" id="tab-my_reports" onclick="switchDashboardTab('my_reports')">Semua Laporan</button>
                            <button class="nav-link" id="tab-feed" onclick="switchDashboardTab('feed')">Feed Kota</button>
                        </div>
                        <div class="card p-3 border-warning bg-light mb-3">
                            <h6 class="fw-bold">Statistik Laporan</h6>
                            <p>Total: <b id="stats-total">0</b></p>
                            <p>Draft: <b id="stats-draft">0</b></p>
                            <p>Reported: <b id="stats-reported">0</b></p>
                            <p>Verified: <b id="stats-verified">0</b></p>
                            <p>In Progress: <b id="stats-progress">0</b></p>
                            <p>Resolved: <b id="stats-resolved">0</b></p>
                        </div>
                        <button class="btn btn-outline-danger w-100" onclick="handleLogout()">Logout</button>
                    </div>
                    <div class="col-lg-9" id="reports-container">Memuat data...</div>
                </div>
            </div>

            <div id="reportModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1000;">
                <div style="background:white; margin:5% auto; padding:20px; width:400px; border-radius:15px;">
                    <h4>Tambah Laporan</h4>
                    <input type="text" id="newTitle" class="form-control mb-2" placeholder="Judul">
                    <select id="newCategory" class="form-control mb-2">
                        <option value="Sampah">Sampah</option>
                        <option value="Infrastruktur">Infrastruktur</option>
                        <option value="Lainnya">Lainnya</option>
                    </select>
                    <textarea id="newDesc" class="form-control mb-2" placeholder="Deskripsi"></textarea>
                    <input type="text" id="newLocation" class="form-control mb-2" placeholder="Lokasi">
                    <button class="btn btn-warning w-100" onclick="submitReport('REPORTED')">Kirim Laporan</button>
                    <button class="btn btn-outline-warning w-100 mt-2" onclick="submitReport('DRAFT')">Simpan sebagai Draf</button>
                    <button class="btn btn-secondary w-100 mt-2" onclick="document.getElementById('reportModal').style.display='none'">Batal</button>
                </div>
            </div>
        `;

        document.getElementById('btnOpenModal').onclick = () => document.getElementById('reportModal').style.display = 'block';
        window.fetchAndRenderReports();
        window.reportPollingInterval = setInterval(window.fetchAndRenderReports, 6000);

    } else {
        injectStyle(`
            body { background: #FFFBEA !important; min-height: 100vh; }
            #app { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px !important; position: relative; z-index: 1; }
            .login-card { width: 100%; max-width: 420px; background: white; padding: 30px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            .login-card a { color: #B58200; font-weight: 600; text-decoration: none; }
            .login-card a:hover { text-decoration: underline; }
        `);
        app.innerHTML = `
            <div class="login-card text-center">
                <h3 class="mb-4 text-warning fw-bold">${hash === '#register' ? 'Daftar Akun' : 'Login Warga'}</h3>
                <form id="loginForm">
                    <input type="text" id="username" class="form-control mb-3" placeholder="Username" required>
                    ${hash === '#register' ? '<input type="email" id="email" class="form-control mb-3" placeholder="Email" required>' : ''}
                    <input type="password" id="password" class="form-control mb-3" placeholder="Password" required>
                    <button type="submit" class="btn btn-warning w-100 fw-bold">${hash === '#register' ? 'Daftar' : 'Masuk'}</button>
                </form>
                <p class="mt-3 small">
                    ${hash === '#register' ? 'Sudah punya akun? <a href="#login">Login</a>' : 'Belum punya akun? <a href="#register">Daftar</a>'}
                </p>
            </div>
        `;
        setupLoginForm();
    }
}
