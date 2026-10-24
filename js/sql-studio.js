/**
 * ====================================================================
 * SITUATION SQL STUDIO & DATABASE MANAGEMENT MODULE (js/sql-studio.js)
 * ====================================================================
 * Cung cấp giao diện tương tác truy vấn SQL (SQL Console),
 * xem cấu trúc Schema/ERD, xuất/nhập tệp sao lưu .sql, và quản lý bảng.
 */

const SQLStudio = {
  activeTab: "console",

  // Mở modal SQL Studio
  openModal() {
    const modal = document.getElementById("sqlStudioModal");
    if (!modal) return;
    this.switchTab("console");
    this.refreshStats();
    modal.classList.add("open");
  },

  // Đóng modal
  closeModal() {
    const modal = document.getElementById("sqlStudioModal");
    if (modal) modal.classList.remove("open");
  },

  // Chuyển tab trong SQL Studio
  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll(".sql-studio-tab").forEach(tab => {
      tab.classList.toggle("active", tab.getAttribute("data-tab") === tabId);
    });
    document.querySelectorAll(".sql-studio-panel").forEach(panel => {
      panel.style.display = panel.id === `sql-panel-${tabId}` ? "block" : "none";
    });

    if (tabId === "schema") this.renderSchemaInfo();
    if (tabId === "backup") this.refreshStats();
  },

  // Cập nhật thống kê cơ sở dữ liệu
  async refreshStats() {
    const statEl = document.getElementById("sqlDbStats");
    if (!statEl || !window.SituationDB) return;

    const catCount = window.catalogData ? window.catalogData.length : 0;
    const docCount = window.documentStore ? window.documentStore.length : 0;
    const teacherCount = window.catalogData ? window.catalogData.filter(i => i.originType === "TEACHER_CONTRIBUTED").length : 0;
    
    statEl.innerHTML = `
      <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
        <div>${stIcon('chart', 15)} Tổng bài học: <strong>${catCount}</strong></div>
        <div>${stIcon('teacher', 15)} Bài giáo viên đăng: <strong>${teacherCount}</strong></div>
        <div>${stIcon('doc-file', 15)} Hồ sơ tư liệu: <strong>${docCount}</strong></div>
        <div>${stIcon('database', 15)} Động cơ lưu trữ: <strong>IndexedDB (SituationDB_v2) + ANSI SQL</strong></div>
      </div>
    `;
  },

  // Nạp truy vấn mẫu
  loadSampleQuery(type) {
    const input = document.getElementById("sqlQueryInput");
    if (!input) return;

    const queries = {
      grade10: "SELECT code, lesson, format, topic FROM catalog_items WHERE grade = '10' ORDER BY code ASC;",
      grade11: "SELECT code, lesson, format, focus FROM catalog_items WHERE grade = '11' ORDER BY code ASC;",
      grade12: "SELECT code, lesson, format FROM catalog_items WHERE grade = '12' ORDER BY code ASC;",
      teacher: "SELECT code, lesson, author, school, created_at FROM catalog_items WHERE origin_type = 'TEACHER_CONTRIBUTED';",
      files: "SELECT code, lesson, author, auth_key_used, auth_level, file_name, file_size_kb FROM uploaded_word_files;",
      docs: "SELECT id, code, grade, format, title FROM documents ORDER BY grade ASC;",
      characters: "SELECT item_code, name, role_type, description FROM characters LIMIT 20;",
      count: "SELECT COUNT(*) FROM catalog_items;",
      tables: "SHOW TABLES;"
    };

    input.value = queries[type] || queries.grade10;
    this.executeQuery();
  },

  // Thực thi câu lệnh SQL từ ô nhập liệu
  async executeQuery() {
    const input = document.getElementById("sqlQueryInput");
    const resultBox = document.getElementById("sqlQueryResultBox");
    if (!input || !resultBox || !window.SituationDB) return;

    const sql = input.value.trim();
    if (!sql) {
      resultBox.innerHTML = `<div style="padding:1rem; color:var(--ink-muted);">Vui lòng nhập câu lệnh SQL (hoặc chọn câu truy vấn mẫu ở trên).</div>`;
      return;
    }

    resultBox.innerHTML = `<div style="padding:1rem; color:var(--burgundy);">${stIcon('clock', 15)} Đang thực thi truy vấn SQL trên SituationDB...</div>`;

    const res = await window.SituationDB.querySQL(sql);

    if (res.error) {
      resultBox.innerHTML = `
        <div style="background:#FFEBEE; border:1px solid #EF5350; color:#C62828; padding:1rem; border-radius:3px;">
          <strong>${stIcon('close', 15)} Lỗi thực thi SQL:</strong> ${this.escapeHtml(res.error)}
          <div style="font-size:0.8rem; margin-top:0.4rem; color:var(--ink-muted);">Thời gian xử lý: ${res.timeMs} ms</div>
        </div>
      `;
      return;
    }

    // Render kết quả bảng
    const headerHtml = res.columns.map(c => `<th style="padding:0.6rem 0.8rem; background:var(--burgundy); color:var(--ivory); font-size:0.82rem; text-align:left; border:1px solid var(--border);">${this.escapeHtml(c)}</th>`).join("");
    
    const rowsHtml = res.rows.length > 0
      ? res.rows.map(row => `
          <tr style="border-bottom:1px solid var(--border);">
            ${row.map(val => `<td style="padding:0.5rem 0.8rem; font-size:0.85rem; border:1px solid var(--border);">${this.escapeHtml(val !== null ? String(val) : "NULL")}</td>`).join("")}
          </tr>
        `).join("")
      : `<tr><td colspan="${res.columns.length}" style="text-align:center; padding:1.5rem; color:var(--ink-muted);">Không có dòng dữ liệu nào khớp với điều kiện.</td></tr>`;

    resultBox.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem; font-size:0.82rem; color:var(--ink-muted);">
        <span>${stIcon('check', 14)} Trả về <strong>${res.rowCount}</strong> dòng kết quả</span>
        <span>${stIcon('bolt', 14)} Thời gian thực thi: <strong>${res.timeMs} ms</strong></span>
      </div>
      <div style="overflow-x:auto; max-height:360px; overflow-y:auto; border:1px solid var(--border); background:#fff;">
        <table style="width:100%; border-collapse:collapse;" class="catalog-table">
          <thead><tr>${headerHtml}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    `;
  },

  // Hiển thị cấu trúc Schema & Bảng
  renderSchemaInfo() {
    const box = document.getElementById("sqlSchemaContainer");
    if (!box) return;

    box.innerHTML = `
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:1.25rem;">
        
        <!-- Bảng 1: catalog_items -->
        <div class="detail-box">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:var(--bordeaux); font-size:1.05rem;">${stIcon('scroll', 16)} catalog_items</strong>
            <span class="code-badge">Khóa chính: code</span>
          </div>
          <p style="font-size:0.82rem; color:var(--ink-muted); margin:0.35rem 0 0.65rem;">Lưu trữ các bài học Lịch sử và gợi ý hoạt cảnh hóa chuẩn 5 trường GDPT 2018.</p>
          <ul style="font-size:0.82rem; list-style:none; padding:0; display:flex; flex-direction:column; gap:0.25rem;">
            <li><code>code</code> (VARCHAR 20) — Mã nội dung (VD: 10.04A)</li>
            <li><code>grade</code> (VARCHAR 5) — Khối lớp (10, 11, 12)</li>
            <li><code>topic</code> (VARCHAR 255) — Chủ đề lịch sử</li>
            <li><code>lesson</code> (TEXT) — Tên bài học trong SGK</li>
            <li><code>scenario</code> (TEXT) — Gợi ý tình huống hoạt cảnh</li>
            <li><code>format</code> (VARCHAR 100) — Hình thức sân khấu hóa</li>
            <li><code>focus</code> (TEXT) — Trọng tâm học tập SGK</li>
            <li><code>origin_type</code> (VARCHAR 50) — VERIFIED_ORIGINAL / SGK / TEACHER</li>
            <li><code>author</code> (VARCHAR 100) — Giáo viên / Người biên soạn</li>
            <li><code>created_at</code> (VARCHAR 20) — Ngày tạo</li>
          </ul>
        </div>

        <!-- Bảng 2: characters -->
        <div class="detail-box">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:var(--bordeaux); font-size:1.05rem;">${stIcon('mask', 16)} characters</strong>
            <span class="code-badge">Khóa ngoại: item_code</span>
          </div>
          <p style="font-size:0.82rem; color:var(--ink-muted); margin:0.35rem 0 0.65rem;">Phân vai nhân vật lịch sử và vai đại diện sáng tạo cho từng hoạt cảnh.</p>
          <ul style="font-size:0.82rem; list-style:none; padding:0; display:flex; flex-direction:column; gap:0.25rem;">
            <li><code>id</code> (INTEGER AUTOINCREMENT) — Khóa chính</li>
            <li><code>item_code</code> (VARCHAR 20) — Mã bài học liên kết</li>
            <li><code>name</code> (VARCHAR 100) — Tên nhân vật / vai diễn</li>
            <li><code>role_type</code> (VARCHAR 50) — HISTORICAL_FACT / CREATIVE_REP</li>
            <li><code>description</code> (TEXT) — Gợi ý diễn xuất, lời thoại</li>
          </ul>
        </div>

        <!-- Bảng 3: documents -->
        <div class="detail-box">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:var(--bordeaux); font-size:1.05rem;">${stIcon('doc-file', 16)} documents</strong>
            <span class="code-badge">Khóa chính: id</span>
          </div>
          <p style="font-size:0.82rem; color:var(--ink-muted); margin:0.35rem 0 0.65rem;">Kho văn bản tư liệu lịch sử, hồ sơ trích dẫn phục vụ đối chiếu RAG.</p>
          <ul style="font-size:0.82rem; list-style:none; padding:0; display:flex; flex-direction:column; gap:0.25rem;">
            <li><code>id</code> (VARCHAR 50) — Mã tư liệu (VD: DOC-1004A)</li>
            <li><code>code</code> (VARCHAR 20) — Mã bài học liên kết</li>
            <li><code>grade</code> (VARCHAR 5) — Khối lớp (10, 11, 12)</li>
            <li><code>format</code> (VARCHAR 20) — DOCX, PDF, TXT</li>
            <li><code>title</code> (VARCHAR 255) — Tiêu đề tài liệu</li>
            <li><code>source</code> (TEXT) — Nguồn kiểm chứng</li>
            <li><code>content</code> (TEXT) — Toàn văn nội dung tư liệu</li>
          </ul>
        </div>

        <!-- Bảng 4: chat_messages -->
        <div class="detail-box">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:var(--bordeaux); font-size:1.05rem;">${stIcon('brain', 16)} chat_messages</strong>
            <span class="code-badge">Khóa ngoại: session_id</span>
          </div>
          <p style="font-size:0.82rem; color:var(--ink-muted); margin:0.35rem 0 0.65rem;">Lưu trữ nhật ký hội thoại giữa người dùng và Trợ lý AI Situation.</p>
          <ul style="font-size:0.82rem; list-style:none; padding:0; display:flex; flex-direction:column; gap:0.25rem;">
            <li><code>id</code> (VARCHAR 50) — Mã tin nhắn</li>
            <li><code>session_id</code> (VARCHAR 50) — Mã phiên hội thoại</li>
            <li><code>role</code> (VARCHAR 20) — user / bot</li>
            <li><code>text</code> (TEXT) — Nội dung tin nhắn</li>
            <li><code>citations</code> (TEXT) — Các mã trích dẫn liên kết</li>
            <li><code>created_at</code> (VARCHAR 20) — Thời điểm gửi</li>
          </ul>
        </div>

        <!-- Bảng 5: uploaded_word_files -->
        <div class="detail-box" style="border-left: 4px solid #2E7D32;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:#2E7D32; font-size:1.05rem;">${stIcon('doc-word', 16)} uploaded_word_files</strong>
            <span class="code-badge" style="background:#E8F5E9; color:#1B5E20; border-color:#81C784;">Khóa chính: code</span>
          </div>
          <p style="font-size:0.82rem; color:var(--ink-muted); margin:0.35rem 0 0.65rem;">Lưu trữ tệp kịch bản Word (.docx) do giáo viên tải lên, xác thực bằng 3 cấp mã khóa bảo mật.</p>
          <ul style="font-size:0.82rem; list-style:none; padding:0; display:flex; flex-direction:column; gap:0.25rem;">
            <li><code>code</code> (VARCHAR 20) — Mã bài học (VD: 10.W01)</li>
            <li><code>lesson_title</code> (VARCHAR 255) — Tiêu đề kịch bản</li>
            <li><code>grade</code> (VARCHAR 5) — Khối lớp (10, 11, 12)</li>
            <li><code>author</code> (VARCHAR 100) — Thầy/Cô biên soạn</li>
            <li><code>auth_key_used</code> (VARCHAR 50) — Mã khóa xác thực</li>
            <li><code>auth_level</code> (VARCHAR 100) — Cấp 1, Cấp 2 hoặc Cấp 3</li>
            <li><code>file_name</code> (VARCHAR 255) — Tên tệp Word gốc</li>
            <li><code>file_size</code> (INTEGER) — Dung lượng tệp (bytes)</li>
            <li><code>file_data_base64</code> (LONGTEXT) — Dữ liệu Base64 để tải về</li>
            <li><code>uploaded_at</code> (VARCHAR 20) — Thời điểm tải lên</li>
          </ul>
        </div>

      </div>
    `;
  },

  // Xuất file SQL Backup (.sql)
  exportSqlFile() {
    if (!window.SituationDB) return;
    const sqlText = window.SituationDB.exportSQL();
    const blob = new Blob([sqlText], { type: "application/sql;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    a.href = url;
    a.download = `situation_database_backup_${dateStr}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Xuất file JSON Backup (.json)
  exportJsonFile() {
    if (!window.SituationDB) return;
    const data = {
      catalog: window.SituationDB.catalog,
      documents: window.SituationDB.documents,
      chatSessions: window.SituationDB.chatSessions,
      chatMessages: window.SituationDB.chatMessages,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `situation_database_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Nhập file SQL / JSON
  async handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target.result;
      try {
        if (file.name.endsWith(".json")) {
          const data = JSON.parse(content);
          if (data.catalog && Array.isArray(data.catalog)) {
            for (const item of data.catalog) {
              await window.SituationDB.insertCatalogItem(item);
            }
          }
          if (data.documents && Array.isArray(data.documents)) {
            for (const doc of data.documents) {
              await window.SituationDB.insertDocument(doc);
            }
          }
          alert(`✅ Đã phục hồi thành công dữ liệu từ tệp JSON "${file.name}"!`);
        } else {
          // SQL File
          const res = await window.SituationDB.importSQL(content);
          alert(`✅ Đã nhập thành công ${res.importedItems} bài học và ${res.importedDocs} tài liệu từ tệp SQL "${file.name}"!`);
        }

        // Làm mới giao diện
        if (typeof populateFilterDropdowns === "function") populateFilterDropdowns();
        if (typeof updateHomeCounters === "function") updateHomeCounters();
        if (typeof applyCatalogFilters === "function") applyCatalogFilters();
        if (typeof renderDocuments === "function") renderDocuments();
        if (typeof updateRagCounters === "function") updateRagCounters();
        this.refreshStats();
      } catch (err) {
        alert("❌ Lỗi khi đọc file phục hồi: " + err.message);
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  },

  // Reset database về dữ liệu gốc
  async resetDatabase() {
    if (!confirm("⚠️ Bạn có chắc chắn muốn khôi phục Cơ sở Dữ liệu về trạng thái xuất xưởng mặc định? Toàn bộ bài đăng và tư liệu bổ sung sẽ được cài đặt lại.")) return;
    
    if (window.SituationDB) {
      try {
        localStorage.removeItem("situation_deleted_codes");
        localStorage.removeItem("situation_teacher_posts");
        localStorage.removeItem("situation_teacher_docs");
        localStorage.removeItem("situation_custom_docs");
      } catch(e) {}
      await window.SituationDB.seedInitialData();
      await window.SituationDB.syncFromStorage();

      if (typeof commitDatabaseMutation === "function") {
        commitDatabaseMutation("RESTORE_DEFAULT_DATA", {});
      } else {
        if (typeof populateFilterDropdowns === "function") populateFilterDropdowns();
        if (typeof updateHomeCounters === "function") updateHomeCounters();
        if (typeof applyCatalogFilters === "function") applyCatalogFilters();
        if (typeof renderDocuments === "function") renderDocuments();
        if (typeof updateRagCounters === "function") updateRagCounters();
      }
      this.refreshStats();
      alert("✅ Đã khôi phục cơ sở dữ liệu về mặc định thành công!");
    }
  },

  escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
};

window.SQLStudio = SQLStudio;
if (typeof window !== "undefined") {
  window.openSqlStudio = function() {
    if (window.SQLStudio && typeof window.SQLStudio.openModal === "function") {
      window.SQLStudio.openModal();
    }
  };
  window.closeSqlStudio = function() {
    if (window.SQLStudio && typeof window.SQLStudio.closeModal === "function") {
      window.SQLStudio.closeModal();
    }
  };
}
