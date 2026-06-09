import { setupLoginForm } from "./auth.js";

export function router() {
  const app = document.getElementById("app");
  const hash = window.location.hash || "#login";

  if (hash === "#dashboard") {
    app.innerHTML = `
      <style>
        /* === PERUBAHAN TEMA: FULL KUNING SOFT & SUNFLOWER === */
        
        /* Topbar Kuning Gradasi Lembut */
        .topbar {
          background: linear-gradient(90deg, #FFF9E6, #FFEAA7) !important;
          color: #574B14 !important;
          padding: 14px 24px;
          border-radius: 16px;
          margin-bottom: 24px;
          box-shadow: 0 6px 18px rgba(230, 180, 80, 0.15);
        }
        .topbar .brand { 
          color: #574B14 !important; 
          font-weight: 700; 
          font-size: 1.25rem;
        }
        .topbar .user-info {
          color: #574B14;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .topbar .btn-logout {
          background: rgba(87, 75, 20, 0.08) !important;
          color: #574B14 !important;
          border: 1px solid rgba(87, 75, 20, 0.15) !important;
          border-radius: 12px;
          font-weight: 500;
          padding: 4px 14px;
          transition: all 0.2s;
        }
        .topbar .btn-logout:hover {
          background: rgba(87, 75, 20, 0.18) !important;
        }

        /* Layout Grid 3 Kolom */
        .dashboard-row { display: flex; gap: 24px; align-items: flex-start; }
        .col-left { width: 260px; } 
        .col-center { flex: 1 1 auto; } 
        .col-right { width: 300px; }

        @media (max-width: 992px) { 
          .dashboard-row { flex-direction: column; } 
          .col-left, .col-right { width: 100%; } 
        }

        /* Styling Cards Aesthetic Soft Yellow */
        .sidebar-card, .stats-card, .modal-content {
          background-color: #ffffff !important;
          border: 2px solid #FFEAA7 !important;
          border-radius: 24px !important;
          box-shadow: 0 10px 25px rgba(230, 180, 80, 0.12) !important;
          padding: 20px;
        }

        .center-card {
          border-radius: 24px !important;
          padding: 24px !important;
          background: #FFFDF6 !important;
          border: 2px dashed #FFEAA7 !important;
          box-shadow: 0 10px 25px rgba(230, 180, 80, 0.08) !important;
          margin-bottom: 20px;
        }

        /* Tombol Utama (Warna Kuning Madu Cerah) */
        .btn-laporan-baru, .btn-primary, #btnSubmit {
          background-color: #FFD23F !important;
          color: #574B14 !important;
          border: none !important;
          border-radius: 12px !important;
          font-weight: 600 !important;
          padding: 12px 20px !important;
          box-shadow: 0 4px 12px rgba(255, 210, 63, 0.3) !important;
          transition: all 0.3s ease !important;
        }
        .btn-laporan-baru:hover, .btn-primary:hover, #btnSubmit:hover {
          background-color: #E6B822 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 15px rgba(255, 210, 63, 0.4) !important;
        }

        /* Navigasi Menu Samping */
        .nav-pills .nav-link {
          color: #7A691A !important;
          background-color: transparent;
          transition: all 0.3s ease;
          border: 2px solid transparent !important;
          border-radius: 12px !important;
          margin-bottom: 6px;
        }
        .nav-pills .nav-link.active {
          background-color: #FFF9E6 !important;
          color: #574B14 !important;
          border-color: #FFD23F !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(255, 210, 63, 0.15) !important;
        }
        .nav-pills .nav-link:hover:not(.active) {
          background-color: #FFFDF6 !important;
        }

        /* Box Panel Statistik */
        .stat-box { 
          background: #FFFDF6; 
          border-radius: 14px; 
          padding: 14px 18px; 
          margin-bottom: 12px; 
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid #FFEAA7;
        }
        .stat-box strong { color: #574B14; font-weight: 600; }
        .stat-count { font-size: 1.3rem; font-weight: 700; }
        #stats-draft { color: #E6B822; } /* Kuning Tua */
        #stats-diproses { color: #D4A373; } /* Cokelat Pastel */
        #stats-selesai { color: #198754; } /* Tetap Hijau untuk penanda selesai */

        /* Pagination Kuning */
        .pagination .page-link {
          color: #574B14 !important;
          background-color: #ffffff;
          border: 1px solid #FFEAA7;
        }
        .pagination .page-item.active .page-link {
          background-color: #FFD23F !important;
          border-color: #FFD23F !important;
          color: #574B14 !important;
        }
      </style>

      <div class="topbar d-flex justify-content-between align-items-center">
        <div class="brand"><i class="bi bi-sun-fill text-warning me-1"></i> Smart City Portal</div>
        <div class="user-info">
          <button id="btnLogout" class="btn btn-logout btn-sm">Keluar</button>
        </div>
      </div>

      <div class="dashboard-row">
        
        <div class="col-left">
          <div class="card sidebar-card shadow-sm">
            <button type="button" class="btn btn-laporan-baru w-100 mb-3 fw-bold" data-bs-toggle="modal" data-bs-target="#reportModal">
              <i class="bi bi-plus-circle-fill me-2"></i> Laporan Baru
            </button>
            <div class="nav flex-column nav-pills" role="tablist">
              <button class="nav-link active text-start py-2 px-3 mb-2" id="tab-myreport" onclick="switchDashboardTab('my_reports')">
                <i class="bi bi-journal-text me-2"></i> Laporan Saya
              </button>
              <button class="nav-link text-start py-2 px-3 mb-2" id="tab-feed" onclick="switchDashboardTab('feed')">
                <i class="bi bi-globe me-2"></i> Feed Kota
              </button>
            </div>
          </div>
        </div>

        <div class="col-center">
          <div class="center-card shadow-sm text-center">
            <div class="d-flex align-items-center justify-content-center gap-2 mb-2">
              <i class="bi bi-shield-check fs-3" style="color: #574B14;"></i>
              <h3 class="m-0" style="color: #574B14 !important;">Autentikasi Berhasil Terhubung!</h3>
            </div>
            <p class="small m-0" style="color: #7A691A;">Seluruh fitur pelaporan kini siap digunakan.</p>
          </div>

          <div id="reports-container" class="d-flex flex-column gap-3"></div>

          <div class="d-flex justify-content-center mt-4">
            <nav><ul class="pagination m-0" id="pagination-container"></ul></nav>
          </div>
        </div>

        <div class="col-right">
          <div class="card stats-card shadow-sm">
            <h5 class="fw-bold mb-3" style="color: #574B14 !important;"><i class="bi bi-bar-chart-fill me-2"></i>Statistik</h5>
            <div class="stat-box"><strong>Draft:</strong><div id="stats-draft" class="stat-count">9</div></div>
            <div class="stat-box"><strong>Diproses:</strong><div id="stats-diproses" class="stat-count">0</div></div>
            <div class="stat-box"><strong>Selesai:</strong><div id="stats-selesai" class="stat-count">0</div></div>
          </div>
        </div>

      </div>

      <div class="modal fade" id="reportModal" tabindex="-1" aria-labelledby="reportModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header border-0" style="background: #FFEAA7; border-top-left-radius:22px; border-top-right-radius:22px;">
              <h5 class="modal-title fw-bold" id="reportModalLabel" style="color: #574B14 !important;"><i class="bi bi-pencil-square me-2"></i>Buat Laporan Baru</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4" style="background-color: #ffffff; border-bottom-left-radius:22px; border-bottom-right-radius:22px;">
              <form id="reportForm">
                <div class="mb-3">
                  <label for="inputTitle" class="form-label fw-bold small" style="color: #7A691A;">Judul Laporan</label>
                  <input type="text" class="form-control" id="inputTitle" placeholder="Masukkan judul isu..." required>
                </div>
                <div class="mb-3">
                  <label for="inputCategory" class="form-label fw-bold small" style="color: #7A691A;">Kategori</label>
                  <select class="form-select" id="inputCategory" required>
                    <option value="" disabled selected>Pilih Kategori...</option>
                    <option value="Infrastruktur">Infrastruktur</option>
                    <option value="Kebersihan">Kebersihan</option>
                    <option value="Keamanan">Keamanan</option>
                    <option value="Fasilitas Publik">Fasilitas Publik</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="inputLocation" class="form-label fw-bold small" style="color: #7A691A;">Lokasi</label>
                  <input type="text" class="form-control" id="inputLocation" placeholder="Lokasi kejadian..." required>
                </div>
                <div class="mb-3">
                  <label for="inputDescription" class="form-label fw-bold small" style="color: #7A691A;">Deskripsi Laporan</label>
                  <textarea class="form-control" id="inputDescription" rows="3" placeholder="Jelaskan detail masalah..." required></textarea>
                </div>
                <div class="d-flex justify-content-between mt-4">
                  <button type="button" class="btn btn-outline-secondary fw-bold px-4" id="btnDraft" style="border-radius:12px; color:#574B14; border-color:#FFEAA7;">Simpan Draft</button>
                  <button type="submit" class="btn btn-primary fw-bold px-4" id="btnSubmit">Ajukan <i class="bi bi-send-fill ms-1"></i></button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    // Trigger data UI
    if (typeof window.initDashboardUI === "function") {
      window.initDashboardUI();
    } else {
      setTimeout(() => { if (typeof window.initDashboardUI === "function") window.initDashboardUI(); }, 50);
    }

  } else {
    // --- LOGIN PAGE TEMA KUNING ---
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
    if (demoBtn) demoBtn.addEventListener("click", () => {
      localStorage.setItem("access_token", "demo-token");
      window.location.hash = "#dashboard";
    });
  }
}