import { setupLoginForm } from "./auth.js";
import { requestAPI } from "./api.js";

let editingReportId = null;
let currentTab = 'all'; // Default tab menampilkan gabungan sesuai instruksi
let currentPage = 1;
let globalModalInstance = null;

export function router() {
  const app = document.getElementById("app");
  const hash = window.location.hash || "#login";

  if (hash === "#dashboard") {
    app.innerHTML = `
      <style>
        /* === TEMA: FULL KUNING SOFT & SUNFLOWER === */
        .topbar {
          background: linear-gradient(90deg, #FFF9E6, #FFEAA7) !important;
          color: #574B14 !important;
          padding: 14px 24px;
          border-radius: 16px;
          margin-bottom: 24px;
          box-shadow: 0 6px 18px rgba(230, 180, 80, 0.15);
        }
        .topbar .brand { font-weight: 700; font-size: 1.25rem; color: #574B14 !important; }
        .topbar .user-info { color: #574B14; font-size: 0.95rem; display: flex; align-items: center; gap: 15px; }
        .topbar .btn-logout { background: rgba(87, 75, 20, 0.08) !important; color: #574B14 !important; border: 1px solid rgba(87, 75, 20, 0.15) !important; border-radius: 12px; padding: 4px 14px; }

        .dashboard-row { display: flex; gap: 24px; align-items: flex-start; }
        .col-left { width: 260px; } 
        .col-center { flex: 1 1 auto; } 
        .col-right { width: 300px; }

        @media (max-width: 992px) { .dashboard-row { flex-direction: column; } .col-left, .col-right { width: 100%; } }

        .sidebar-card, .stats-card, .modal-content { background-color: #ffffff !important; border: 2px solid #FFEAA7 !important; border-radius: 24px !important; box-shadow: 0 10px 25px rgba(230, 180, 80, 0.12) !important; padding: 20px; }
        .center-card { border-radius: 24px !important; padding: 24px !important; background: #FFFDF6 !important; border: 2px dashed #FFEAA7 !important; margin-bottom: 20px; }
        .report-item-card { background: #ffffff; border: 2px solid #FFEAA7; border-radius: 18px; padding: 20px; }

        .btn-laporan-baru, .btn-primary { background-color: #FFD23F !important; color: #574B14 !important; border: none !important; border-radius: 12px !important; font-weight: 600 !important; padding: 12px 20px !important; box-shadow: 0 4px 12px rgba(255, 210, 63, 0.3) !important; }
        .btn-laporan-baru:hover, .btn-primary:hover { background-color: #E6B822 !important; }

        .nav-pills .nav-link { color: #7A691A !important; background-color: transparent; border: 2px solid transparent !important; border-radius: 12px !important; margin-bottom: 6px; }
        .nav-pills .nav-link.active { background-color: #FFF9E6 !important; color: #574B14 !important; border-color: #FFD23F !important; font-weight: 600 !important; }

        .stat-box { background: #FFFDF6; border-radius: 14px; padding: 14px 18px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #FFEAA7; }
        .stat-count { font-size: 1.3rem; font-weight: 700; }
        
        .pagination .page-link { color: #574B14 !important; border: 1px solid #FFEAA7; }
        .pagination .page-item.active .page-link { background-color: #FFD23F !important; border-color: #FFD23F !important; }
      </style>

      <div class="topbar d-flex justify-content-between align-items-center">
        <div class="brand"><i class="bi bi-sun-fill text-warning me-1"></i> Citizen Portal</div>
        <div class="user-info">
          <button id="btnLogout" class="btn btn-logout btn-sm">Keluar</button>
        </div>
      </div>

      <div class="dashboard-row">
        <div class="col-left">
          <div class="card sidebar-card shadow-sm">
            <button type="button" id="btnTriggerModalBaru" class="btn btn-laporan-baru w-100 mb-3 fw-bold">
              <i class="bi bi-plus-circle-fill me-2"></i> Laporan Baru
            </button>
            <div class="nav flex-column nav-pills" role="tablist">
              <button class="nav-link active text-start py-2 px-3 mb-2" id="tab-allreport">
                <i class="bi bi-collection-fill me-2"></i> Semua Laporan
              </button>
              <button class="nav-link text-start py-2 px-3 mb-2" id="tab-myreport">
                <i class="bi bi-journal-text me-2"></i> Laporan Saya
              </button>
              <button class="nav-link text-start py-2 px-3 mb-2" id="tab-feed">
                <i class="bi bi-globe me-2"></i> Feed Kota
              </button>
            </div>
          </div>
        </div>

        <div class="col-center">
          <div class="center-card shadow-sm text-center">
            <h4 class="m-0" style="color: #574B14;"><i class="bi bi-shield-check text-success me-2"></i>Data Connected</h4>
            <p class="text-muted small m-0 mt-1">Sinkronisasi Real-Time DRF API Berhasil.</p>
          </div>

          <div id="reports-container" class="d-flex flex-column gap-3">
            <div class="text-center p-4"><div class="spinner-border text-warning" role="status"></div></div>
          </div>

          <div class="d-flex justify-content-center mt-4">
            <nav><ul class="pagination m-0" id="pagination-container"></ul></nav>
          </div>
        </div>

        <div class="col-right">
          <div class="card stats-card shadow-sm">
            <h5 class="fw-bold mb-3" style="color: #574B14 !important;"><i class="bi bi-bar-chart-fill me-2"></i>Statistik Saya</h5>
            <div class="stat-box"><strong>Draft:</strong><div id="stats-draft" class="stat-count" style="color: #FFB020;">0</div></div>
            <div class="stat-box"><strong>Verified:</strong><div id="stats-diproses" class="stat-count" style="color: #0d6efd;">0</div></div>
            <div class="stat-box"><strong>Resolved:</strong><div id="stats-selesai" class="stat-count" style="color: #198754;">0</div></div>
          </div>
        </div>
      </div>

      <div class="modal fade" id="reportModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header border-0" style="background: #FFEAA7;">
              <h5 class="modal-title fw-bold" id="modalTitleText" style="color: #574B14 !important;">Buat Laporan Baru</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
              <form id="reportForm">
                <div class="mb-3">
                  <label class="form-label fw-bold small">Judul Laporan</label>
                  <input type="text" class="form-control" id="inputTitle" required>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-bold small">Kategori</label>
                  <select class="form-select" id="inputCategory" required>
                    <option value="" disabled selected>Pilih Kategori...</option>
                    <option value="Infrastruktur">Infrastruktur</option>
                    <option value="Kebersihan">Kebersihan</option>
                    <option value="Keamanan">Keamanan</option>
                    <option value="Fasilitas Publik">Fasilitas Publik</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-bold small">Lokasi</label>
                  <input type="text" class="form-control" id="inputLocation" required>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-bold small">Deskripsi Laporan</label>
                  <textarea class="form-control" id="inputDescription" rows="3" required></textarea>
                </div>
                <div class="d-flex justify-content-between mt-4">
                  <button type="button" class="btn btn-outline-secondary fw-bold" id="btnDraftAction">Simpan Draft</button>
                  <button type="button" class="btn btn-primary fw-bold" id="btnSubmitAction">Ajukan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    initDashboardLogic();
  } else {
    // --- LOGIN PAGE ---
    app.innerHTML = `
      <div class="container mt-5">
        <div class="row justify-content-center">
          <div class="col-md-4">
            <div class="card p-3">
              <div class="card-body">
                <h3 class="text-center mb-4" style="color: #574B14;"><i class="bi bi-sun-fill text-warning"></i> Login Portal</h3>
                <form id="loginForm">
                  <input type="text" id="username" class="form-control mb-2" placeholder="Username" required>
                  <input type="password" id="password" class="form-control mb-3" placeholder="Password" required>
                  <button type="submit" class="btn btn-primary w-100 mb-2">Login</button>
                  <button type="button" id="demoLoginBtn" class="btn btn-outline-secondary w-100" style="border-radius:12px; color:#574B14; border-color:#FFEAA7;">Masuk (Demo)</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    setupLoginForm();
    
    const demoBtn = document.getElementById("demoLoginBtn");
    if (demoBtn) {
      demoBtn.addEventListener("click", () => {
        localStorage.setItem("access_token", "demo-token");
        window.location.hash = "#dashboard";
      });
    }
  }
}

function initDashboardLogic() {
  globalModalInstance = new bootstrap.Modal(document.getElementById('reportModal'));

  document.getElementById("tab-allreport").addEventListener("click", (e) => switchTab('all', e.currentTarget));
  document.getElementById("tab-myreport").addEventListener("click", (e) => switchTab('my_reports', e.currentTarget));
  document.getElementById("tab-feed").addEventListener("click", (e) => switchTab('feed', e.currentTarget));

  document.getElementById("btnTriggerModalBaru").addEventListener("click", () => {
    editingReportId = null;
    document.getElementById("reportForm").reset();
    document.getElementById("modalTitleText").innerText = "Buat Laporan Baru";
    globalModalInstance.show();
  });

  document.getElementById("btnLogout").addEventListener("click", () => {
    localStorage.removeItem("access_token");
    window.location.hash = "#login";
  });

  document.getElementById("btnDraftAction").addEventListener("click", () => saveReportHandler("DRAFT", globalModalInstance));
  document.getElementById("btnSubmitAction").addEventListener("click", () => saveReportHandler("VERIFIED", globalModalInstance));

  loadDashboardData(currentTab, currentPage);
}

function switchTab(tabName, element) {
  currentTab = tabName;
  currentPage = 1;
  document.querySelectorAll(".nav-pills .nav-link").forEach(btn => btn.classList.remove("active"));
  element.classList.add("active");
  loadDashboardData(currentTab, currentPage);
}

// 🌟 INSTRUKSI LAB 3: Mengambil list data terpaginasi & memicu update UI
async function loadDashboardData(tab, page) {
  const container = document.getElementById("reports-container");

  try {
    const queryUrl = (tab === 'all') ? `/api/reports/?page=${page}` : `/api/reports/?tab=${tab}&page=${page}`;
    const response = await requestAPI(queryUrl, "GET");

    if (!response.ok) throw new Error("Gagal mengambil data");
    const data = await response.json();

    const actualReports = data.results ? data.results : data;

    renderList(actualReports);       
    renderPagination(data.count || actualReports.length);   
    loadSummaryStats(); // Memanggil rekap statistik di sidebar             

  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
}

function renderList(reports) {
  const container = document.getElementById("reports-container");
  if (!reports || reports.length === 0) {
    container.innerHTML = `<div class="text-center text-muted p-4">Tidak ada laporan yang tersedia.</div>`;
    return;
  }

  container.innerHTML = reports.map(item => {
    let pct = 25, color = "bg-warning", textStatus = "Draft";
    const currentStatus = item.status ? item.status.toUpperCase() : "DRAFT";

    if (currentStatus === "VERIFIED" || currentStatus === "DIPROSES") { 
      pct = 65; color = "bg-primary"; textStatus = "Verified"; 
    } else if (currentStatus === "RESOLVED" || currentStatus === "SELESAI") { 
      pct = 100; color = "bg-success"; textStatus = "Resolved"; 
    }

    // 🌟 KETENTUAN BISNIS LAB: Tombol edit hanya muncul jika status DRAFT dan milik sendiri (is_owner)
    const editBtn = (currentStatus === "DRAFT" && item.is_owner) 
      ? `<button class="btn btn-sm btn-outline-warning btn-edit-draft" data-id="${item.id}">
           <i class="bi bi-pencil-fill"></i> Edit Draft
         </button>` 
      : '';

    return `
      <div class="card report-item-card shadow-sm">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h5 class="fw-bold m-0 text-dark">${item.title || "Tanpa Judul"}</h5>
            <span class="badge bg-light text-secondary border mt-1">${item.category || "Umum"}</span>
          </div>
          <span class="small text-muted"><i class="bi bi-geo-alt-fill text-danger"></i> ${item.location || "Lokasi umum"}</span>
        </div>
        <p class="text-secondary small mb-3">${item.description || "Tidak ada deskripsi."}</p>
        
        <div class="d-flex align-items-center gap-3">
          <div class="progress flex-grow-1" style="height: 10px; border-radius: 20px;">
            <div class="progress-bar progress-bar-striped progress-bar-animated ${color}" role="progressbar" style="width: ${pct}%"></div>
          </div>
          <span class="badge ${color} text-white fw-bold">${textStatus}</span>
          ${editBtn}
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll(".btn-edit-draft").forEach(btn => {
    btn.addEventListener("click", () => editDraft(btn.getAttribute("data-id")));
  });
}

// 🌟 INSTRUKSI LAB 4: Mekanisme Bypass Paginasi khusus rekap statistik
async function loadSummaryStats() {
  try {
    const response = await requestAPI(`/api/reports/?tab=my_reports&page_size=1000`, "GET");
    if (!response.ok) return;
    const data = await response.json();
    const allItems = data.results || data || [];

    const totalDraft = allItems.filter(r => r.status && r.status.toUpperCase() === "DRAFT").length;
    const totalDiproses = allItems.filter(r => r.status && (r.status.toUpperCase() === "DIPROSES" || r.status.toUpperCase() === "VERIFIED")).length;
    const totalSelesai = allItems.filter(r => r.status && (r.status.toUpperCase() === "SELESAI" || r.status.toUpperCase() === "RESOLVED")).length;

    document.getElementById("stats-draft").innerText = totalDraft;
    document.getElementById("stats-diproses").innerText = totalDiproses;
    document.getElementById("stats-selesai").innerText = totalSelesai;
  } catch (e) {
    console.error("Gagal menghitung statistik summary:", e);
  }
}

function renderPagination(totalCount) {
  const container = document.getElementById("pagination-container");
  const totalPages = Math.ceil(totalCount / 10);
  container.innerHTML = "";

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
    li.innerHTML = `<button class="page-link fw-bold">${i}</button>`;
    li.addEventListener("click", () => {
      currentPage = i;
      loadDashboardData(currentTab, currentPage);
    });
    container.appendChild(li);
  }
}

// 🌟 INSTRUKSI LAB 5: Menangani pengisian otomatis form modal saat mode edit draft
async function editDraft(id) {
  try {
    const response = await requestAPI(`/api/reports/${id}/`, "GET");
    if (!response.ok) throw new Error("Gagal mengambil detail draft");
    const item = await response.json();

    document.getElementById("inputTitle").value = item.title;
    document.getElementById("inputCategory").value = item.category;
    document.getElementById("inputLocation").value = item.location;
    document.getElementById("inputDescription").value = item.description;
    
    editingReportId = id;
    document.getElementById("modalTitleText").innerText = "Edit Laporan Draft";
    globalModalInstance.show();
  } catch (err) {
    alert(err.message);
  }
}

async function saveReportHandler(targetStatus, modalInstance) {
  const payload = {
    title: document.getElementById("inputTitle").value,
    category: document.getElementById("inputCategory").value,
    location: document.getElementById("inputLocation").value,
    description: document.getElementById("inputDescription").value,
    status: targetStatus
  };

  if(!payload.title || !payload.category || !payload.location || !payload.description) {
     alert("Harap lengkapi semua field formulir!");
     return;
  }

  // Menentukan POST (baru) atau PUT (edit draf lama) sesuai instruksi lab 5
  const endpoint = editingReportId ? `/api/reports/${editingReportId}/` : `/api/reports/`;
  const method = editingReportId ? "PUT" : "POST";

  try {
    const response = await requestAPI(endpoint, method, payload);

    if (response.status === 201 || response.status === 200) {
      modalInstance.hide(); 
      document.getElementById("reportForm").reset(); 
      editingReportId = null; 
      loadDashboardData(currentTab, currentPage); // Refresh data lokal tanpa reload halaman
    } else {
      const errData = await response.json();
      alert("Gagal memproses laporan: " + JSON.stringify(errData));
    }
  } catch (err) {
    alert("Koneksi gagal: " + err.message);
  }
}

router();
window.addEventListener("hashchange", router);