import { setupLoginForm } from "./auth.js?v=20260616-3";
import { requestAPI } from "./api.js?v=20260616-3";

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
   GLOBAL ACTIONS
========================= */
window.handleLogout = function () {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    window.location.hash = "#login";
    window.location.reload();
};

window.submitReport = async function (status) {
    const normalizedStatus = normalizeStatus(status);
    const data = {
        title: document.getElementById("inputTitle").value,
        description: document.getElementById("inputDescription").value,
        location: document.getElementById("inputLocation").value,
        category: document.getElementById("inputCategory").value,
        status: normalizedStatus
    };
    const response = await requestAPI("/api/report/", "POST", data);
    if (response && response.ok) {
        alert(`Laporan berhasil disimpan sebagai ${getStatusLabel(normalizedStatus)}!`);
        window.closeReportModal();
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
   BOOTSTRAP MODAL HELPERS
========================= */
let reportModalInstance = null;

window.openReportModal = function () {
    const modalEl = document.getElementById("reportModal");
    if (!reportModalInstance) {
        reportModalInstance = new bootstrap.Modal(modalEl);
    }
    reportModalInstance.show();
};

window.closeReportModal = function () {
    if (reportModalInstance) reportModalInstance.hide();
};

/* =========================
   PAGINATION (UI-03)
========================= */
window.currentPage = 1;

window.renderPagination = function (count, page) {
    const container = document.getElementById("paginationContainer");
    if (!container) return;

    const pageSize = 10;
    const totalPages = Math.max(Math.ceil(count / pageSize), 1);

    if (totalPages <= 1) {
        container.innerHTML = "";
        return;
    }

    let html = '<ul class="pagination">';
    html += `<li class="page-item ${page <= 1 ? 'disabled' : ''}">
                <button class="page-link" onclick="goToPage(${page - 1})">Sebelumnya</button>
              </li>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<li class="page-item ${i === page ? 'active' : ''}">
                    <button class="page-link" onclick="goToPage(${i})">${i}</button>
                  </li>`;
    }
    html += `<li class="page-item ${page >= totalPages ? 'disabled' : ''}">
                <button class="page-link" onclick="goToPage(${page + 1})">Selanjutnya</button>
              </li>`;
    html += '</ul>';

    container.innerHTML = html;
};

window.goToPage = function (page) {
    if (page < 1) return;
    window.currentPage = page;
    window.fetchAndRenderReports();
};

/* =========================
   DASHBOARD RENDER
========================= */
window.renderDashboard = function (reports) {
    const container = document.getElementById("listContainer");
    if (!container) return;

    container.innerHTML = reports.length > 0 ? reports.map(r => `
        <div class="col">
            <div class="report-card">
                <h6 class="fw-bold">${r.title || 'Tanpa Judul'}</h6>
                <p class="small text-muted mb-1">${r.location || 'Lokasi tidak diketahui'}</p>
                <p class="mb-2">${r.description || '-'}</p>
                <span class="badge ${getStatusBadgeClass(r.status)}">${getStatusLabel(r.status)}</span>
            </div>
        </div>
    `).join('') : '<p class="text-center py-5">Belum ada laporan.</p>';
};

window.loadSummaryStats = async function () {
    try {
        const resp = await requestAPI(`/api/report/?tab=my_reports&page_size=1000`, 'GET');
        if (!resp) return;
        const data = resp.data || {};
        const results = Array.isArray(data) ? data : (data.results || []);

        const statusCounts = results.reduce((counts, report) => {
            const status = normalizeStatus(report.status);
            counts[status] = (counts[status] || 0) + 1;
            return counts;
        }, {});

        const summary = document.getElementById('summaryStats');
        if (!summary) return;

        summary.innerHTML = `
            <span class="badge bg-secondary me-1">${statusCounts.DRAFT || 0} Draft</span>
            <span class="badge bg-warning text-dark me-1">${statusCounts.REPORTED || 0} Reported</span>
            <span class="badge bg-info me-1">${statusCounts.VERIFIED || 0} Verified</span>
            <span class="badge bg-info me-1">${statusCounts.IN_PROGRESS || 0} In Progress</span>
            <span class="badge bg-success">${statusCounts.RESOLVED || 0} Resolved</span>
        `;
    } catch (err) {
        console.error("Gagal memuat statistik:", err);
    }
};

window.fetchAndRenderReports = async function () {
    try {
        const tab = window.currentDashboardTab || 'my_reports';
        const page = window.currentPage || 1;
        const resp = await requestAPI(`/api/report/?tab=${encodeURIComponent(tab)}&page=${page}`, 'GET');
        if (!resp) return;
        const data = resp.data || {};
        const reports = Array.isArray(data) ? data : (data.results || []);
        const count = Array.isArray(data) ? data.length : (data.count ?? reports.length);

        window.renderDashboard(reports);
        window.renderPagination(count, page);
        window.loadSummaryStats();
    } catch (err) { console.error("Gagal memuat:", err); }
};

window.switchDashboardTab = function (tab, btnId) {
    window.currentDashboardTab = tab;
    window.currentPage = 1;
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    const btn = document.getElementById(btnId);
    if (btn) btn.classList.add('active');
    window.fetchAndRenderReports();
};

/* =========================
   ROUTER
========================= */
export function router() {
    const app = document.getElementById("app");
    const hash = window.location.hash || "#login";

    // ---- AUTH GUARD (AUTH-04) ----
    const token = localStorage.getItem("access_token");
    if (!token && hash === "#dashboard") {
        window.location.hash = "#login";
        return;
    }
    if (token && (hash === "#login" || hash === "#register")) {
        window.location.hash = "#dashboard";
        return;
    }

    if (window.reportPollingInterval) clearInterval(window.reportPollingInterval);
    clearStyles();
    app.innerHTML = "";

    if (hash === "#dashboard") {
        window.currentDashboardTab = window.currentDashboardTab || 'my_reports';
        window.currentPage = window.currentPage || 1;

        injectStyle(`
            body { background: #FFFDF5 !important; }
            .dashboard-container { padding: 30px; }
            .report-card { background: white; padding: 20px; border-radius: 15px; border: 1px solid #FFEAA7; margin-bottom: 15px; }
            .nav-link { cursor: pointer; color: #574B14; }
            .nav-link.active { background: #FFD23F !important; color: #574B14 !important; font-weight: bold; }
        `);

        app.innerHTML = `
            <div class="container-fluid dashboard-container">
                <div class="row mb-3">
                    <div class="col-12" id="summaryStats"></div>
                </div>
                <div class="row">
                    <div class="col-lg-3">
                        <button class="btn btn-warning w-100 mb-3 fw-bold" id="btnBukaModal">+ Laporan Baru</button>
                        <div class="nav flex-column nav-pills mb-4">
                            <button class="nav-link active" id="tabSemuaLaporan" onclick="switchDashboardTab('my_reports','tabSemuaLaporan')">Semua Laporan</button>
                            <button class="nav-link" id="tabFeedKota" onclick="switchDashboardTab('feed','tabFeedKota')">Feed Kota</button>
                        </div>
                    </div>
                    <div class="col-lg-9">
                        <div class="row" id="listContainer">Memuat data...</div>
                        <nav aria-label="Navigasi Halaman" class="mt-3">
                            <div id="paginationContainer"></div>
                        </nav>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="reportModal" tabindex="-1" aria-labelledby="reportModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="reportModalLabel">Buat Laporan Baru</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="reportForm" onsubmit="return false;">
                                <input type="text" id="inputTitle" class="form-control mb-2" placeholder="Judul">
                                <select id="inputCategory" class="form-control mb-2">
                                    <option value="Sampah">Sampah</option>
                                    <option value="Infrastruktur">Infrastruktur</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                                <textarea id="inputDescription" class="form-control mb-2" placeholder="Deskripsi"></textarea>
                                <input type="text" id="inputLocation" class="form-control mb-2" placeholder="Lokasi">
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                            <button type="button" class="btn btn-outline-warning" id="btnDraft" onclick="submitReport('DRAFT')">Simpan sebagai Draf</button>
                            <button type="button" class="btn btn-warning" id="btnSubmit" onclick="submitReport('REPORTED')">Kirim Laporan</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btnBukaModal').onclick = () => window.openReportModal();
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
                    <input type="text" id="loginUsername" class="form-control mb-3" placeholder="Username" required>
                    ${hash === '#register' ? '<input type="email" id="email" class="form-control mb-3" placeholder="Email" required>' : ''}
                    <input type="password" id="loginPassword" class="form-control mb-3" placeholder="Password" required>
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
