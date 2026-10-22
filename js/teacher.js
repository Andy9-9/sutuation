/**
 * ====================================================================
 * SITUATION TEACHER AUTH, POSTING & FILE MANAGEMENT (js/teacher.js)
 * ====================================================================
 * Module xác thực mã khóa giáo viên (3 cấp độ), quản lý bài đăng,
 * tải lên file Word/PDF, xuất tài liệu và chấm bài học sinh.
 */

const TEACHER_AUTH_KEYS = {
            // Key 1: Cơ bản (6 ký tự)
            "SU2026": {
                level: "Cấp 1 - Cơ bản",
                role: "Giáo viên Bộ môn Lịch sử",
                color: "#2E7D32",
                bg: "#E8F5E9"
            },
            // Key 2: Nâng cao (12 ký tự)
            "GV-HIST-2026": {
                level: "Cấp 2 - Nâng cao",
                role: "Tổ trưởng Chuyên môn",
                color: "#E65100",
                bg: "#FFF3E0"
            },
            // Key 3: Chuyên gia (30 ký tự)
            "SECURE#2026$GV-HIST@SITUATION": {
                level: "Cấp 3 - Chuyên gia",
                role: "Ban Giám Hiệu / Quản trị viên",
                color: "#7D1018",
                bg: "#FFEBEE"
            }
        };

        // Trạng thái phiên xác thực giáo viên
        var isTeacherAuthenticated = false;
        var sessionTeacherKey = "";
        var pendingEditPostCode = "";

        function getTeacherAuthState() {
            const auth = (typeof window !== "undefined" && window.isTeacherAuthenticated !== undefined) ? window.isTeacherAuthenticated : isTeacherAuthenticated;
            const key = (typeof window !== "undefined" && window.sessionTeacherKey !== undefined) ? window.sessionTeacherKey : sessionTeacherKey;
            return {
                isAuthenticated: auth,
                key: key,
                role: (key && TEACHER_AUTH_KEYS[key]) ? TEACHER_AUTH_KEYS[key].role : null,
                level: (key && TEACHER_AUTH_KEYS[key]) ? TEACHER_AUTH_KEYS[key].level : null
            };
        }
        if (typeof window !== "undefined") {
            window.isTeacherAuthenticated = isTeacherAuthenticated;
            window.sessionTeacherKey = sessionTeacherKey;
            window.getTeacherAuthState = getTeacherAuthState;
        }

        try {
            const savedSessionKey = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("situation_teacher_session_key") : null;
            if (savedSessionKey && TEACHER_AUTH_KEYS[savedSessionKey]) {
                isTeacherAuthenticated = true;
                sessionTeacherKey = savedSessionKey;
                if (typeof window !== "undefined") {
                    window.isTeacherAuthenticated = true;
                    window.sessionTeacherKey = savedSessionKey;
                }
            }
        } catch (e) { }

        // ==========================================
        // CỔNG XÁC THỰC MÃ KHÓA (TEACHER AUTH GATE)
        // ==========================================
        function openTeacherAuthGate(codeToEdit = "") {
            pendingEditPostCode = codeToEdit || "";
            // Nếu đã xác thực trong phiên làm việc thì vào thẳng không gian đăng bài
            if (isTeacherAuthenticated && sessionTeacherKey && TEACHER_AUTH_KEYS[sessionTeacherKey]) {
                openTeacherPostModal(pendingEditPostCode);
                return;
            }

            const gateModal = document.getElementById("teacherAuthGateModal");
            const gateInput = document.getElementById("gateAuthKeyInput");
            const gateFeedback = document.getElementById("gateKeyFeedback");
            const btnToggle = document.getElementById("btnToggleGateKeyVisibility");

            if (gateInput) {
                gateInput.value = "";
                gateInput.type = "password";
                gateInput.style.borderColor = "var(--gold)";
                gateInput.style.background = "#fff";
            }
            if (btnToggle) {
                btnToggle.textContent = "👁️";
            }
            if (gateFeedback) {
                gateFeedback.innerHTML = `<span style="color:var(--ink-muted);">Khu vực bảo mật dành cho Giáo viên. Vui lòng nhập mã khóa để tiếp tục.</span>`;
            }
            if (gateModal) {
                gateModal.classList.add("open");
                setTimeout(() => { if (gateInput) gateInput.focus(); }, 150);
            }
        }

        function closeTeacherAuthGate() {
            const gateModal = document.getElementById("teacherAuthGateModal");
            if (gateModal) gateModal.classList.remove("open");
            pendingEditPostCode = "";
        }

        function toggleGateKeyVisibility() {
            const input = document.getElementById("gateAuthKeyInput");
            const btn = document.getElementById("btnToggleGateKeyVisibility");
            if (!input) return;
            if (input.type === "password") {
                input.type = "text";
                if (btn) btn.textContent = "🔒";
            } else {
                input.type = "password";
                if (btn) btn.textContent = "👁️";
            }
        }

        function fillGateKey(key) {
            // Hàm ẩn bảo mật - không điền mã tự động công khai
        }

        function checkGateKeyInput() {
            const input = document.getElementById("gateAuthKeyInput");
            const feedback = document.getElementById("gateKeyFeedback");
            if (!input || !feedback) return false;

            const val = input.value.trim();
            if (!val) {
                feedback.innerHTML = `<span style="color:var(--ink-muted);">Khu vực bảo mật dành cho Giáo viên. Vui lòng nhập mã khóa để tiếp tục.</span>`;
                input.style.borderColor = "var(--gold)";
                input.style.background = "#fff";
                return false;
            }
            // Khi đang nhập, không hé lộ thông tin mã
            input.style.borderColor = "var(--gold)";
            input.style.background = "#fff";
            return true;
        }

        function submitTeacherAuthGate() {
            const input = document.getElementById("gateAuthKeyInput");
            const feedback = document.getElementById("gateKeyFeedback");
            const val = input ? input.value.trim() : "";
            const match = TEACHER_AUTH_KEYS[val];

            if (!match) {
                if (feedback) {
                    feedback.innerHTML = `<span style="color:#C62828; font-weight:700;">❌ Mã khóa bảo mật không chính xác. Vui lòng thử lại!</span>`;
                }
                if (input) {
                    input.focus();
                    input.style.borderColor = "#C62828";
                    input.style.background = "#FFF5F5";
                }
                alert("⛔ MÃ KHÓA KHÔNG HỢP LỆ!\n\nMã khóa bảo mật không đúng. Vui lòng kiểm tra lại hoặc liên hệ quản trị viên.");
                return;
            }

            // Xác thực thành công cho phiên hiện tại
            isTeacherAuthenticated = true;
            sessionTeacherKey = val;
            if (typeof window !== "undefined") {
                window.isTeacherAuthenticated = true;
                window.sessionTeacherKey = val;
            }
            try {
                if (typeof sessionStorage !== "undefined") {
                    sessionStorage.setItem("situation_teacher_session_key", val);
                }
            } catch (e) { }

            closeTeacherAuthGate();
            openTeacherPostModal(pendingEditPostCode);
        }

        function lockTeacherSession() {
            if (confirm("Thầy/Cô có chắc chắn muốn khóa phiên làm việc giáo viên? Lần truy cập tiếp theo sẽ cần nhập lại mã khóa.")) {
                isTeacherAuthenticated = false;
                sessionTeacherKey = "";
                if (typeof window !== "undefined") {
                    window.isTeacherAuthenticated = false;
                    window.sessionTeacherKey = "";
                }
                try {
                    if (typeof sessionStorage !== "undefined") {
                        sessionStorage.removeItem("situation_teacher_session_key");
                    }
                } catch (e) { }
                pendingEditPostCode = "";
                closeTeacherPostModal();
                alert("🔒 Đã khóa phiên làm việc giáo viên thành công.");
            }
        }

        // Các hàm tương thích ngược
        function fillTeacherKey(key) {
            fillGateKey(key);
        }
        function checkTeacherKeyInput() {
            return checkGateKeyInput();
        }

        // ==========================================
        // XỬ LÝ TẢI LÊN FILE & KÉO THẢ TỆP
        // ==========================================
        function processUploadedFile(file) {
            if (!file) return;

            const validExts = [".docx", ".doc", ".txt", ".pdf"];
            const ext = file.name.slice((file.name.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();

            const reader = new FileReader();
            reader.onload = function (e) {
                const base64Data = e.target.result;
                const fileBase64Input = document.getElementById("teacherFileBase64");
                const fileNameInput = document.getElementById("teacherFileName");
                const fileSizeInput = document.getElementById("teacherFileSize");
                const fileTypeInput = document.getElementById("teacherFileType");

                if (fileBase64Input) fileBase64Input.value = base64Data;
                if (fileNameInput) fileNameInput.value = file.name;
                if (fileSizeInput) fileSizeInput.value = file.size;
                if (fileTypeInput) fileTypeInput.value = file.type || "application/octet-stream";

                // Cập nhật giao diện thẻ file
                const promptEl = document.getElementById("teacherUploadPrompt");
                const selectedInfoEl = document.getElementById("teacherFileSelectedInfo");
                const displayFileNameEl = document.getElementById("teacherDisplayFileName");
                const displayFileSizeEl = document.getElementById("teacherDisplayFileSize");

                if (promptEl) promptEl.style.display = "none";
                if (selectedInfoEl) selectedInfoEl.style.display = "block";
                if (displayFileNameEl) displayFileNameEl.textContent = file.name;
                const sizeKb = Math.round(file.size / 1024);
                if (displayFileSizeEl) displayFileSizeEl.textContent = `${sizeKb} KB • Định dạng ${ext.toUpperCase()}`;

                // Tự gợi ý tên bài nếu người dùng chưa nhập
                const titleInput = document.getElementById("teacherTitle");
                if (titleInput && !titleInput.value.trim()) {
                    const suggestedTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
                    titleInput.value = suggestedTitle;
                }
            };
            reader.readAsDataURL(file);
        }

        function handleTeacherFileSelect(event) {
            const file = event.target.files && event.target.files[0];
            processUploadedFile(file);
        }

        function handleTeacherDragOver(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            const dropZone = document.getElementById("teacherDropZone");
            if (dropZone) {
                dropZone.style.borderColor = "var(--burgundy)";
                dropZone.style.background = "#fff8e1";
                dropZone.style.transform = "scale(1.01)";
            }
        }

        function handleTeacherDragLeave(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            const dropZone = document.getElementById("teacherDropZone");
            if (dropZone) {
                dropZone.style.borderColor = "var(--gold)";
                dropZone.style.background = "var(--ivory)";
                dropZone.style.transform = "none";
            }
        }

        function handleTeacherDrop(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            const dropZone = document.getElementById("teacherDropZone");
            if (dropZone) {
                dropZone.style.borderColor = "var(--gold)";
                dropZone.style.background = "var(--ivory)";
                dropZone.style.transform = "none";
            }
            const dt = event && event.dataTransfer;
            if (dt && dt.files && dt.files.length > 0) {
                processUploadedFile(dt.files[0]);
            }
        }

        function clearTeacherSelectedFile() {
            const fileInput = document.getElementById("teacherWordFileInput");
            if (fileInput) fileInput.value = "";
            const fileBase64Input = document.getElementById("teacherFileBase64");
            const fileNameInput = document.getElementById("teacherFileName");
            const fileSizeInput = document.getElementById("teacherFileSize");
            const fileTypeInput = document.getElementById("teacherFileType");

            if (fileBase64Input) fileBase64Input.value = "";
            if (fileNameInput) fileNameInput.value = "";
            if (fileSizeInput) fileSizeInput.value = "";
            if (fileTypeInput) fileTypeInput.value = "";

            const promptEl = document.getElementById("teacherUploadPrompt");
            const selectedInfoEl = document.getElementById("teacherFileSelectedInfo");
            if (promptEl) promptEl.style.display = "block";
            if (selectedInfoEl) selectedInfoEl.style.display = "none";
        }

        // ==========================================
        // BẬT / TẮT CHUYỂN ĐỘNG TRỐNG ĐỒNG ĐÔNG SƠN
        // ==========================================
        function toggleDrumRotation() {
            const wrapper = document.getElementById("dongsonDrumWrapper");
            const badge = document.getElementById("drumPlayStateBadge");
            const dot = document.getElementById("drumCaptionDot");
            if (!wrapper) return;
            const isPaused = wrapper.classList.toggle("paused");
            if (badge) badge.textContent = isPaused ? "(Tạm dừng ⏸)" : "(Đang quay ↻)";
            if (dot) dot.style.background = isPaused ? "#FFB300" : "#00E676";

            // Tạm dừng cả chuyển động chim lạc để tiết kiệm 100% GPU cho máy cấu hình yếu
            document.querySelectorAll(".soaring-chim-lac").forEach(el => {
                el.style.animationPlayState = isPaused ? "paused" : "running";
            });
            const aura = document.querySelector(".drum-aura-glow");
            if (aura) aura.style.animationPlayState = isPaused ? "paused" : "running";
        }

        // ==========================================
        // HỖ TRỢ XÁC ĐỊNH BÀI HỌC TỪ OBJECT HOẶC MÃ BÀI (CODE)
        // ==========================================
        function resolveLessonItem(itemOrCode) {
            if (!itemOrCode) return null;
            if (typeof itemOrCode === "object") return itemOrCode;
            if (typeof itemOrCode === "string") {
                if (typeof catalogData !== "undefined" && Array.isArray(catalogData)) {
                    const found = catalogData.find(i => i.code === itemOrCode);
                    if (found) return found;
                }
                if (typeof teacherPosts !== "undefined" && Array.isArray(teacherPosts)) {
                    const found = teacherPosts.find(i => i.code === itemOrCode);
                    if (found) return found;
                }
            }
            return null;
        }

        // ==========================================
        // XUẤT VÀ TẢI TỆP MICROSOFT WORD (.DOC) ĐẦY ĐỦ CHO TẤT CẢ BÀI HỌC
        // ==========================================
        function generateAndDownloadWordDocument(itemOrCode) {
            const item = resolveLessonItem(itemOrCode);
            if (!item) return;

            let fileData = item.fileData;
            let fileName = item.fileName;
            if (!fileData) {
                const doc = documentStore.find(d => d.code === item.code);
                if (doc && doc.fileData) {
                    fileData = doc.fileData;
                    fileName = doc.fileName;
                }
            }
            if (fileData && (fileName || "").toLowerCase().endsWith(".doc")) {
                const a = document.createElement("a");
                a.href = fileData;
                a.download = fileName || `KichBan_${item.code}.doc`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                return;
            }

            const examCode = getPostExamCode(item);
            const safeExam = examCode.replace(/[^A-Za-z0-9_-]/g, "");
            const outDocFileName = `KichBan_${item.code}_${safeExam || 'MD'}.doc`;

            const charsRows = (item.characters && item.characters.length > 0)
                ? item.characters.map((c, idx) => {
                    const isFact = c.type === "HISTORICAL_FACT";
                    const typeLabel = isFact ? "Nhân vật lịch sử xác thực" : "Vai đại diện / Gợi ý sáng tạo";
                    const typeColor = isFact ? "#1B5E20" : "#4A148C";
                    const typeBg = isFact ? "#E8F5E9" : "#F3E5F5";
                    return `
              <tr>
                <td style="text-align: center; font-weight: bold; width: 40px; border: 1px solid #777; padding: 8px;">${idx + 1}</td>
                <td style="font-weight: bold; color: #800020; width: 170px; border: 1px solid #777; padding: 8px;">${escapeHtml(c.name)}</td>
                <td style="width: 200px; border: 1px solid #777; padding: 8px;"><span style="background: ${typeBg}; color: ${typeColor}; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 10pt;">${typeLabel}</span></td>
                <td style="border: 1px solid #777; padding: 8px;">${escapeHtml(c.desc)}</td>
              </tr>
            `;
                }).join("")
                : `<tr><td colspan="4" style="font-style: italic; border: 1px solid #777; padding: 8px;">Giáo viên và học sinh linh hoạt xây dựng các vai đại diện phù hợp với bối cảnh và tình huống kịch bản.</td></tr>`;

            const linkedDocs = documentStore.filter(d => d.code === item.code);
            const docsHtml = linkedDocs.length > 0
                ? `<ul>${linkedDocs.map(d => `<li><strong>[${escapeHtml(d.format)}]</strong> ${escapeHtml(d.title)} (Nguồn: ${escapeHtml(d.source || 'Lưu trữ')})</li>`).join("")}</ul>`
                : `<p style="font-style: italic; color: #555;">Tham khảo thêm các chuyên đề và hồ sơ tư liệu trong Thư viện Lịch sử THPT Situation.</p>`;

            const originTitle = item.originType === "TEACHER_CONTRIBUTED"
                ? `Biên soạn đóng góp bởi Giáo viên: ${escapeHtml(item.author || 'Thầy/Cô')} (${escapeHtml(item.school || 'THPT')})`
                : (item.originType === "VERIFIED_ORIGINAL" ? "Dữ liệu gốc đã xác thực kiểm chứng" : "Khung chương trình chuẩn SGK GDPT 2018");

            const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>Kịch bản Sân khấu hóa: ${escapeHtml(item.lesson)}</title>
  <style>
    body {
      font-family: 'Times New Roman', serif;
      font-size: 13pt;
      line-height: 1.5;
      color: #1a1a1a;
      margin: 2.5cm 2cm;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      border: none;
      margin-bottom: 25px;
    }
    .header-table td {
      border: none;
      vertical-align: top;
      padding: 0;
    }
    .doc-title {
      font-size: 18pt;
      font-weight: bold;
      color: #800020;
      text-align: center;
      margin-top: 20px;
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-subtitle {
      font-size: 13pt;
      font-weight: bold;
      color: #B8860B;
      text-align: center;
      margin-bottom: 25px;
      font-style: italic;
    }
    .meta-box {
      background-color: #faf7f2;
      border: 1.5px solid #dcd3c5;
      border-left: 6px solid #800020;
      padding: 14px 18px;
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 14pt;
      font-weight: bold;
      color: #800020;
      border-bottom: 1.5px solid #800020;
      padding-bottom: 4px;
      margin-top: 24px;
      margin-bottom: 12px;
      text-transform: uppercase;
    }
    .scenario-box {
      background-color: #f5f8f5;
      border: 1px solid #c8e6c9;
      border-left: 5px solid #2E7D32;
      padding: 14px 18px;
      font-size: 13pt;
      font-weight: 500;
      color: #1B5E20;
      margin-bottom: 20px;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      margin-bottom: 20px;
    }
    table.data-table th {
      background-color: #f0e6d6;
      color: #5d101d;
      font-weight: bold;
      border: 1px solid #777;
      padding: 8px 10px;
      text-align: left;
    }
    table.data-table td {
      border: 1px solid #aaa;
      padding: 8px 10px;
      vertical-align: top;
      font-size: 12pt;
    }
    .guidance-list {
      margin-top: 8px;
      padding-left: 24px;
    }
    .guidance-list li {
      margin-bottom: 6px;
    }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td style="text-align: center; width: 45%;">
        <strong>BỘ GIÁO DỤC VÀ ĐÀO TẠO</strong><br/>
        <strong>CHƯƠNG TRÌNH GDPT 2018 — MÔN LỊCH SỬ</strong><br/>
        -------------------
      </td>
      <td style="text-align: center; width: 55%;">
        <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/>
        <strong>Độc lập – Tự do – Hạnh phúc</strong><br/>
        *******************
      </td>
    </tr>
  </table>

  <div class="doc-title">HỒ SƠ KỊCH BẢN CHUYỂN THỂ SÂN KHẤU HÓA LỊCH SỬ</div>
  <div class="doc-subtitle">Nền tảng Tra cứu & Hoạt cảnh Lịch sử THPT Situation</div>

  <div class="meta-box">
    <table style="width: 100%; border: none; border-collapse: collapse;">
      <tr>
        <td style="border: none; padding: 4px 8px; width: 50%;"><strong>📌 Mã bài học:</strong> <span style="color: #800020; font-weight: bold;">${escapeHtml(item.code)}</span></td>
        <td style="border: none; padding: 4px 8px; width: 50%;"><strong>🏷️ Mã đề chuẩn hóa:</strong> <span style="color: #BF360C; font-weight: bold;">${escapeHtml(examCode)}</span></td>
      </tr>
      <tr>
        <td style="border: none; padding: 4px 8px;"><strong>🎓 Khối lớp:</strong> Lớp ${escapeHtml(item.grade)} THPT</td>
        <td style="border: none; padding: 4px 8px;"><strong>📚 Chủ đề:</strong> ${escapeHtml(item.topic || 'Lịch sử THPT')}</td>
      </tr>
      <tr>
        <td style="border: none; padding: 4px 8px;"><strong>🎭 Hình thức sân khấu hóa:</strong> <span style="font-weight: bold; color: #1B5E20;">${escapeHtml(item.format)}</span></td>
        <td style="border: none; padding: 4px 8px;"><strong>🏛️ Thuộc tính nguồn:</strong> ${originTitle}</td>
      </tr>
      <tr>
        <td colspan="2" style="border: none; padding: 4px 8px;"><strong>📖 Bài học SGK:</strong> <span style="font-size: 14pt; font-weight: bold; color: #800020;">${escapeHtml(item.lesson)}</span></td>
      </tr>
    </table>
  </div>

  <div class="section-title">I. Ý TƯỞNG & TÌNH HUỐNG SÂN KHẤU HÓA (SCENARIO)</div>
  <div class="scenario-box">
    ${escapeHtml(item.scenario)}
  </div>

  <div class="section-title">II. BẢNG PHÂN VAI & ĐẶC TẢ NHÂN VẬT (CHARACTERS & ROLES)</div>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 40px; text-align: center;">STT</th>
        <th style="width: 180px;">Tên nhân vật / Vai diễn</th>
        <th style="width: 200px;">Phân loại nhân vật</th>
        <th>Mô tả tâm lý, vai trò & gợi ý diễn xuất</th>
      </tr>
    </thead>
    <tbody>
      ${charsRows}
    </tbody>
  </table>

  <div class="section-title">III. TRỌNG TÂM KIẾN THỨC CẦN ĐẠT (SGK GDPT 2018)</div>
  <p style="font-size: 13pt; text-align: justify; background: #fffcf8; border-left: 4px solid #C5A46D; padding: 10px 14px;">
    ${escapeHtml(item.focus)}
  </p>

  <div class="section-title">IV. BỐI CẢNH LỊCH SỬ XÁC THỰC (HISTORICAL CONTEXT)</div>
  <p style="font-size: 13pt; text-align: justify; line-height: 1.6;">
    ${escapeHtml(item.context || 'Bối cảnh lịch sử bám sát chương trình Giáo dục phổ thông 2018 môn Lịch sử THPT.')}
  </p>

  <div class="section-title">V. HỒ SƠ TƯ LIỆU SỐ HÓA & NGUỒN SỬ LIỆU KIỂM CHỨNG</div>
  <div style="margin-bottom: 12px;">
    <strong>1. Hồ sơ tư liệu liên kết:</strong>
    ${docsHtml}
  </div>
  <div>
    <strong>2. Nguồn tài liệu kiểm chứng:</strong>
    <p style="font-style: italic; color: #333; margin-top: 4px;">
      ${escapeHtml(item.sources || 'Sách giáo khoa Lịch sử 10, 11, 12 (Chương trình GDPT 2018) và các công trình sử học Việt Nam.')}
    </p>
  </div>

  <div class="section-title">VI. HƯỚNG DẪN SƯ PHẠM DÀN DỰNG & TỔ CHỨC HOẠT ĐỘNG</div>
  <ul class="guidance-list">
    <li><strong>Thời lượng dự kiến:</strong> Từ 5 đến 10 phút/hoạt cảnh trong các tiết học nội khóa, hoặc 15–25 phút trong các buổi sinh hoạt ngoại khóa / chuyên đề trải nghiệm.</li>
    <li><strong>Nguyên tắc tôn trọng lịch sử:</strong> Các dữ kiện thời gian, địa danh, nhân vật lịch sử cốt lõi (${item.characters ? item.characters.filter(c => c.type === 'HISTORICAL_FACT').map(c => c.name).join(', ') : 'nhân vật có thật'}) phải chính xác tuyệt đối, không hư cấu làm sai lệch bản chất lịch sử.</li>
    <li><strong>Không gian sáng tạo:</strong> Học sinh được khuyến khích sáng tạo các vai đại diện quần chúng nhân dân để khắc họa rõ nét đời sống xã hội, tâm tư tình cảm của con người trong thời đại lịch sử tương ứng.</li>
    <li><strong>Đạo cụ & Trang phục:</strong> Tận dụng vật dụng học tập đơn giản, trang phục phù hợp với thời kỳ lịch sử, chú trọng biểu cảm gương mặt và ngôn ngữ đàm thoại giàu cảm xúc.</li>
  </ul>

  <table style="width: 100%; border: none; margin-top: 40px;">
    <tr>
      <td style="border: none; width: 50%; text-align: center; vertical-align: top;">
        <em>Ngày xuất bản: ${new Date().toLocaleDateString('vi-VN')}</em><br/>
        <strong>HỆ THỐNG NỀN TẢNG SITUATION</strong><br/>
        <span style="font-size: 10pt; color: #666;">Kho tri thức Sân khấu hóa Lịch sử THPT</span>
      </td>
      <td style="border: none; width: 50%; text-align: center; vertical-align: top;">
        <em>Xác thực dữ liệu</em><br/>
        <strong>TỔ CHUYÊN MÔN LỊCH SỬ THPT</strong><br/>
        <span style="font-size: 10pt; color: #666;">(Ký, đóng dấu số hóa)</span>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

            try {
                const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = outDocFileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            } catch (err) {
                console.error("Lỗi tạo file Word:", err);
                alert("Có lỗi khi tạo tệp Word: " + err.message);
            }
        }

        // ==========================================
        // QUẢN LÝ TÙY CHỌN ĐỊNH DẠNG TẢI VỀ (DOWNLOAD FORMAT CONTROLLER)
        // ==========================================
        let currentDownloadTarget = null;

        function downloadBlob(blob, fileName) {
            try {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            } catch (err) {
                console.error("Lỗi khi tải tệp:", err);
                alert("Có lỗi khi tạo hoặc tải tệp: " + err.message);
            }
        }

        function dataUrlToBlob(dataUrl) {
            if (!dataUrl || typeof dataUrl !== "string") return null;
            if (!dataUrl.startsWith("data:")) return null;
            try {
                const parts = dataUrl.split(',');
                if (parts.length < 2) return null;
                const mimeMatch = parts[0].match(/:(.*?);/);
                const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
                const b64 = (parts[1] || "").replace(/[\r\n\s]/g, "");
                if (!b64 || b64.includes("...")) return null;
                let bytes;
                if (typeof Buffer !== "undefined") {
                    const buf = Buffer.from(b64, "base64");
                    bytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
                } else {
                    const binary = atob(b64);
                    const len = binary.length;
                    bytes = new Uint8Array(len);
                    for (let i = 0; i < len; i++) {
                        bytes[i] = binary.charCodeAt(i);
                    }
                }
                return new Blob([bytes], { type: mime });
            } catch (e) {
                console.warn("Lỗi chuyển đổi dataUrl sang Blob:", e);
                return null;
            }
        }

        function downloadDataUrl(dataUrl, fileName) {
            if (!dataUrl) return;
            try {
                const blob = dataUrlToBlob(dataUrl);
                if (blob) {
                    downloadBlob(blob, fileName);
                    return;
                }
            } catch (e) {
                console.warn("Fallback direct data url download:", e);
            }
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        let currentActivePreviewBlobUrl = null;

        function openCurrentPreviewInNewTab() {
            if (currentActivePreviewBlobUrl && typeof window !== "undefined") {
                window.open(currentActivePreviewBlobUrl, "_blank");
            }
        }

        function toggleDetailInlinePreview(show, code = "") {
            const previewBox = document.getElementById("detailFileInlinePreview");
            const previewTitle = document.getElementById("detailPreviewTitle");
            const previewContent = document.getElementById("detailPreviewContent");
            if (!previewBox || !previewContent) return;

            if (!show) {
                previewBox.style.display = "none";
                previewContent.innerHTML = "";
                if (currentActivePreviewBlobUrl) {
                    try { URL.revokeObjectURL(currentActivePreviewBlobUrl); } catch(e) {}
                    currentActivePreviewBlobUrl = null;
                }
                return;
            }

            const item = catalogData.find(i => i.code === code);
            if (!item) return;

            let fileData = item.fileData;
            let fileName = item.fileName;
            if (!fileData) {
                const doc = documentStore.find(d => d.code === item.code);
                if (doc && doc.fileData) {
                    fileData = doc.fileData;
                    fileName = doc.fileName;
                }
            }

            const examCode = getPostExamCode(item);

            // NẾU CHƯA CÓ FILE NHỊ PHÂN TẢI LÊN:
            // Hiển thị ngay khung đọc Kịch bản & Phân vai Reader Mode trực tiếp trên web (0 lỗi alert)
            if (!fileData) {
                if (previewTitle) {
                    previewTitle.innerHTML = `<span>📖</span> Đọc Kịch bản Hoạt cảnh: <strong>${escapeHtml(item.lesson)}</strong> (${escapeHtml(item.code)})`;
                }
                previewContent.innerHTML = `
                    <div style="background: #fff; border: 1.5px solid var(--border); border-left: 4px solid var(--burgundy); border-radius: 6px; padding: 1.25rem; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
                            <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                                <span style="font-family: monospace; font-weight: 700; background: #FFF3E0; color: #BF360C; border: 1px solid #FFE0B2; padding: 0.12rem 0.45rem; border-radius: 3px; font-size: 0.8rem;">🏷️ Mã đề: ${escapeHtml(examCode)}</span>
                                <span style="font-family: monospace; font-weight: 700; background: var(--burgundy); color: #fff; padding: 0.12rem 0.45rem; border-radius: 3px; font-size: 0.8rem;">${escapeHtml(item.code)}</span>
                                <span style="font-size: 0.8rem; background: var(--ivory); border: 1px solid var(--gold); color: var(--burgundy); padding: 0.12rem 0.45rem; border-radius: 3px; font-weight: 600;">Khối ${escapeHtml(item.grade)}</span>
                            </div>
                            <div style="display: flex; gap: 0.4rem;">
                                <button type="button" class="btn-primary" style="font-size: 0.8rem; padding: 0.35rem 0.85rem; background: #2E7D32; border-color: #1B5E20;" onclick="downloadTeacherWordFile('${escapeHtml(item.code)}')">
                                    ⬇️ Tải tệp Word (.docx, .doc)
                                </button>
                            </div>
                        </div>
                        <h4 style="color: var(--burgundy); font-family: var(--font-serif); font-size: 1.2rem; margin: 0 0 0.5rem 0;">${escapeHtml(item.lesson)}</h4>
                        <div style="font-size: 0.88rem; color: var(--ink-muted); margin-bottom: 0.85rem;">
                            <strong>Trọng tâm học tập:</strong> ${escapeHtml(item.focus)}
                        </div>
                        <div style="background: var(--ivory); border: 1px solid var(--border); border-radius: 4px; padding: 1rem; margin-bottom: 0.85rem;">
                            <div style="font-size: 0.8rem; font-weight: 700; color: var(--burgundy); text-transform: uppercase; margin-bottom: 0.4rem;">📜 Ý tưởng & Kịch bản Hoạt cảnh:</div>
                            <div style="font-size: 0.96rem; color: #1B0E07; line-height: 1.7; white-space: pre-wrap;">${escapeHtml(item.scenario)}</div>
                        </div>
                        ${(item.characters && item.characters.length > 0) ? `
                        <div style="font-size: 0.88rem; background: #FAF9F5; border: 1px dashed var(--border); border-radius: 4px; padding: 0.75rem 1rem;">
                            <div style="font-weight: 700; color: var(--burgundy); margin-bottom: 0.4rem;">🎭 Gợi ý Phân vai Nhân vật:</div>
                            <ul style="margin: 0; padding-left: 1.25rem; line-height: 1.55;">
                                ${item.characters.map(c => `<li style="margin-bottom: 0.3rem;"><strong>${escapeHtml(c.name)}</strong>: ${escapeHtml(c.desc)}</li>`).join("")}
                            </ul>
                        </div>` : ''}
                    </div>
                `;
                previewBox.style.display = "block";
                try { previewBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch(e) {}
                return;
            }

            const ext = (fileName || "").slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
            const blob = dataUrlToBlob(fileData);
            if (currentActivePreviewBlobUrl) {
                try { URL.revokeObjectURL(currentActivePreviewBlobUrl); } catch(e) {}
                currentActivePreviewBlobUrl = null;
            }
            if (blob && typeof URL !== "undefined" && URL.createObjectURL) {
                currentActivePreviewBlobUrl = URL.createObjectURL(blob);
            }

            if (previewTitle) {
                previewTitle.innerHTML = `<span>👁️</span> Xem trước tệp đính kèm: <strong>${escapeHtml(fileName || 'Tài liệu')}</strong> <span class="format-tag" style="font-size:0.75rem; margin-left:0.4rem;">${ext.toUpperCase()}</span>`;
            }

            if (ext === "pdf") {
                const srcUrl = currentActivePreviewBlobUrl || fileData;
                previewContent.innerHTML = `
                    <div style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #1B5E20; background: #F1F8E9; padding: 6px 12px; border-radius: 4px; flex-wrap: wrap; gap: 0.4rem;">
                        <span>📄 Tài liệu PDF nguyên bản: <strong>${escapeHtml(fileName)}</strong> (${Math.round((item.fileSize || 0) / 1024)} KB)</span>
                        <div style="display: flex; gap: 0.4rem;">
                            <a href="${srcUrl}" target="_blank" class="btn-secondary" style="font-size: 0.78rem; padding: 0.2rem 0.6rem; text-decoration: none;">↗️ Mở tab riêng</a>
                            <button type="button" class="btn-primary" style="font-size: 0.78rem; padding: 0.2rem 0.7rem; background: #2E7D32; border-color: #1B5E20;" onclick="exportLessonOriginalFile(catalogData.find(i=>i.code==='${escapeHtml(item.code)}'))">⬇️ Tải tệp</button>
                        </div>
                    </div>
                    <iframe src="${srcUrl}" style="width: 100%; height: 560px; border: 1.5px solid #C8E6C9; border-radius: 4px; background: #fdfdfd;" title="Xem trước PDF"></iframe>
                `;
            } else if (ext === "txt") {
                let plainText = "";
                try {
                    const b64 = fileData.split(',')[1] || "";
                    plainText = decodeURIComponent(escape(atob(b64)));
                } catch(e) {
                    try { plainText = atob(fileData.split(',')[1] || ""); } catch(e2) { plainText = item.scenario || item.focus || ""; }
                }
                previewContent.innerHTML = `
                    <div style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #333; background: #fafafa; padding: 6px 12px; border: 1px solid #ddd; border-radius: 4px;">
                        <span>📝 Tệp văn bản thuần Text: <strong>${escapeHtml(fileName)}</strong></span>
                        <button type="button" class="btn-primary" style="font-size: 0.78rem; padding: 0.2rem 0.7rem; background: #2E7D32; border-color: #1B5E20;" onclick="exportLessonOriginalFile(catalogData.find(i=>i.code==='${escapeHtml(item.code)}'))">⬇️ Tải tệp</button>
                    </div>
                    <pre style="max-height: 500px; overflow-y: auto; white-space: pre-wrap; font-family: 'Consolas', 'Courier New', monospace; font-size: 0.92rem; line-height: 1.65; background: #fff; border: 1px solid #ccc; padding: 14px; border-radius: 4px;">${escapeHtml(plainText)}</pre>
                `;
            } else {
                // Word .docx / .doc
                previewContent.innerHTML = `
                    <div style="padding: 1.5rem; background: #F9FBE7; border: 1.5px solid #DCE775; border-radius: 6px; margin-bottom: 0.85rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem;">
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <span style="font-size: 2.5rem;">📘</span>
                                <div>
                                    <h4 style="color: #33691E; font-size: 1.12rem; margin: 0 0 0.25rem 0;">Tệp Microsoft Word: ${escapeHtml(fileName)}</h4>
                                    <div style="font-size: 0.82rem; color: #558B2F;">Dung lượng: ${item.fileSize ? Math.round(item.fileSize / 1024) + ' KB' : 'Đã nạp'} • Định dạng: Word (.${ext})</div>
                                </div>
                            </div>
                            <button type="button" class="btn-primary" style="background: #2E7D32; border-color: #1B5E20; font-weight: 700; padding: 0.5rem 1.25rem; font-size: 0.86rem;" onclick="exportLessonOriginalFile(catalogData.find(i=>i.code==='${escapeHtml(item.code)}'))">
                                ⬇️ Tải tệp ${escapeHtml(fileName)} về máy
                            </button>
                        </div>
                        <div style="background: #fff; border: 1px solid #DCE775; border-radius: 4px; padding: 1rem;">
                            <div style="font-size: 0.8rem; font-weight: 700; color: #33691E; text-transform: uppercase; margin-bottom: 0.4rem;">📜 Trích lược Kịch bản & Lời thoại:</div>
                            <div style="font-size: 0.95rem; color: #1B0E07; line-height: 1.7; white-space: pre-wrap;">${escapeHtml(item.scenario)}</div>
                        </div>
                    </div>
                `;
            }

            previewBox.style.display = "block";
            try {
                previewBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } catch(e) {}
        }

        function viewUploadedItemFile(code) {
            toggleDetailInlinePreview(true, code);
        }

        // --- CÁC HÀM XUẤT CHO BÀI HỌC KỊCH BẢN (CATALOG) ---
        function exportLessonAsDocx(itemOrCode) {
            const item = resolveLessonItem(itemOrCode);
            if (!item) return;
            let fileData = item.fileData;
            let fileName = item.fileName;
            if (!fileData) {
                const doc = documentStore.find(d => d.code === item.code);
                if (doc && doc.fileData) {
                    fileData = doc.fileData;
                    fileName = doc.fileName;
                }
            }
            if (fileData && (fileName || "").toLowerCase().endsWith(".docx")) {
                const a = document.createElement("a");
                a.href = fileData;
                a.download = fileName || `KichBan_${item.code}.docx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                return;
            }

            const examCode = getPostExamCode(item);
            const safeExam = examCode.replace(/[^A-Za-z0-9_-]/g, "");
            const docxFileName = `KichBan_${item.code}_${safeExam || 'MD'}.docx`;
            const printableHtml = buildLessonPrintableHtml(item);
            const blob = new Blob(['\ufeff', printableHtml], {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8'
            });
            downloadBlob(blob, docxFileName);
        }

        function buildLessonPrintableHtml(item) {
            const examCode = getPostExamCode(item);
            const charsRows = (item.characters && item.characters.length > 0)
                ? item.characters.map((c, idx) => {
                    const isFact = c.type === "HISTORICAL_FACT";
                    const typeLabel = isFact ? "Nhân vật lịch sử xác thực" : "Vai đại diện / Gợi ý sáng tạo";
                    return `
            <tr>
              <td style="text-align: center; font-weight: bold; width: 40px; border: 1px solid #777; padding: 6px;">${idx + 1}</td>
              <td style="font-weight: bold; color: #800020; width: 170px; border: 1px solid #777; padding: 6px;">${escapeHtml(c.name)}</td>
              <td style="width: 180px; border: 1px solid #777; padding: 6px; font-weight: 600; font-size: 10pt;">${typeLabel}</td>
              <td style="border: 1px solid #777; padding: 6px;">${escapeHtml(c.desc)}</td>
            </tr>`;
                }).join("")
                : `<tr><td colspan="4" style="font-style: italic; border: 1px solid #777; padding: 8px;">Giáo viên và học sinh linh hoạt xây dựng các vai đại diện phù hợp.</td></tr>`;

            return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>Bản in Kịch bản: ${escapeHtml(item.lesson)}</title>
  <style>
    @page { size: A4 portrait; margin: 18mm 15mm 18mm 15mm; }
    body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #111; margin: 0; padding: 0; background: #fff; }
    .no-print { display: flex; justify-content: space-between; align-items: center; background: #faf7f2; border: 1px solid #dcd3c5; padding: 10px 18px; margin-bottom: 20px; border-radius: 6px; }
    @media print { .no-print { display: none !important; } body { margin: 0; padding: 0; } }
    .header-tbl { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    .header-tbl td { vertical-align: top; border: none; padding: 0; }
    .doc-title { text-align: center; font-size: 16pt; font-weight: bold; color: #800020; text-transform: uppercase; margin-top: 10px; margin-bottom: 4px; }
    .doc-subtitle { text-align: center; font-size: 11pt; font-style: italic; color: #555; margin-bottom: 18px; }
    .meta-box { background: #faf7f2; border: 1px solid #bbb; border-left: 4px solid #800020; padding: 10px 14px; margin-bottom: 18px; }
    .sec-h { font-size: 12.5pt; font-weight: bold; color: #800020; border-bottom: 1px solid #800020; padding-bottom: 3px; margin-top: 18px; margin-bottom: 8px; text-transform: uppercase; }
    .scenario-box { background: #f9fbf9; border: 1px solid #c8e6c9; border-left: 4px solid #2E7D32; padding: 10px 14px; margin-bottom: 15px; font-size: 12pt; }
    table.data-table { width: 100%; border-collapse: collapse; margin-top: 6px; margin-bottom: 15px; }
    table.data-table th { background: #f0e6d6; color: #5d101d; font-weight: bold; border: 1px solid #777; padding: 6px; text-align: left; }
  </style>
</head>
<body>
  <div class="no-print">
    <div>
      <strong style="color: #800020; font-size: 13pt;">📑 Bản In Sư Phạm / Lưu PDF (A4)</strong>
      <span style="font-size: 10pt; color: #555; margin-left: 10px;">(Chọn "Save as PDF" trong hộp thoại in để lưu file PDF)</span>
    </div>
    <div style="display: flex; gap: 8px;">
      <button onclick="window.print()" style="background: #800020; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;">🖨️ In / Lưu PDF ngay</button>
      <button onclick="window.close()" style="background: #fff; border: 1px solid #ccc; padding: 8px 14px; border-radius: 4px; cursor: pointer;">Đóng</button>
    </div>
  </div>

  <table class="header-tbl">
    <tr>
      <td style="text-align: center; width: 45%;">
        <strong>BỘ GIÁO DỤC VÀ ĐÀO TẠO</strong><br/>
        <strong>CHƯƠNG TRÌNH GDPT 2018 — MÔN LỊCH SỬ</strong><br/>
        -------------------
      </td>
      <td style="text-align: center; width: 55%;">
        <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/>
        <strong>Độc lập – Tự do – Hạnh phúc</strong><br/>
        *******************
      </td>
    </tr>
  </table>

  <div class="doc-title">HỒ SƠ KỊCH BẢN CHUYỂN THỂ SÂN KHẤU HÓA LỊCH SỬ</div>
  <div class="doc-subtitle">Nền tảng Tra cứu & Hoạt cảnh Lịch sử THPT Situation</div>

  <div class="meta-box">
    <table style="width: 100%; border-collapse: collapse; border: none;">
      <tr>
        <td style="border: none; padding: 3px 6px; width: 50%;"><strong>📌 Mã bài học:</strong> <span style="color: #800020; font-weight: bold;">${escapeHtml(item.code)}</span></td>
        <td style="border: none; padding: 3px 6px; width: 50%;"><strong>🏷️ Mã đề chuẩn hóa:</strong> <span style="color: #BF360C; font-weight: bold;">${escapeHtml(examCode)}</span></td>
      </tr>
      <tr>
        <td style="border: none; padding: 3px 6px;"><strong>🎓 Khối lớp:</strong> Lớp ${escapeHtml(item.grade)} THPT</td>
        <td style="border: none; padding: 3px 6px;"><strong>📚 Chủ đề:</strong> ${escapeHtml(item.topic || 'Lịch sử THPT')}</td>
      </tr>
      <tr>
        <td style="border: none; padding: 3px 6px;"><strong>🎭 Thể loại hoạt cảnh:</strong> ${escapeHtml(item.format)}</td>
        <td style="border: none; padding: 3px 6px;"><strong>📖 Bài học SGK:</strong> ${escapeHtml(item.lesson)}</td>
      </tr>
    </table>
  </div>

  <div class="sec-h">1. Bối cảnh lịch sử xác thực</div>
  <p>${escapeHtml(item.context || "Bám sát Sách giáo khoa Lịch sử THPT.")}</p>

  <div class="sec-h">2. Trọng tâm kiến thức cần truyền tải</div>
  <p><strong>${escapeHtml(item.focus)}</strong></p>

  <div class="sec-h">3. Tình huống và ý tưởng kịch bản</div>
  <div class="scenario-box">
    ${escapeHtml(item.scenario)}
  </div>

  <div class="sec-h">4. Bảng phân vai nhân vật & gợi ý đạo cụ</div>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 40px; text-align: center;">STT</th>
        <th style="width: 170px;">Tên nhân vật / Vai diễn</th>
        <th style="width: 180px;">Tính chất vai</th>
        <th>Mô tả đặc điểm & gợi ý diễn xuất</th>
      </tr>
    </thead>
    <tbody>
      ${charsRows}
    </tbody>
  </table>

  <div class="sec-h">5. Nguồn tư liệu & căn cứ đối chiếu</div>
  <p style="font-size: 11pt;">${escapeHtml(item.sources || "Sách giáo khoa Lịch sử THPT (Chương trình GDPT 2018).")}</p>

  <table style="width: 100%; border: none; margin-top: 35px;">
    <tr>
      <td style="width: 50%; border: none; text-align: center; vertical-align: top;">
        <br/>
        <strong>GIÁO VIÊN BỘ MÔN / NHÓM HỌC SINH</strong><br/>
        <span style="font-size: 10pt; color: #555;">(Ký và ghi rõ họ tên)</span>
      </td>
      <td style="width: 50%; border: none; text-align: center; vertical-align: top;">
        <em>Hà Nội, ngày .... tháng .... năm 2026</em><br/>
        <strong>TỔ CHUYÊN MÔN LỊCH SỬ THPT SITUATION</strong><br/>
        <span style="font-size: 10pt; color: #555;">(Xác thực hồ sơ số hóa)</span>
      </td>
    </tr>
  </table>
</body>
</html>`;
        }

        function printLessonPdfDocument(itemOrCode) {
            const item = resolveLessonItem(itemOrCode);
            if (!item) return;

            let fileData = item.fileData;
            let fileName = item.fileName;
            if (!fileData) {
                const doc = documentStore.find(d => d.code === item.code);
                if (doc && doc.fileData) {
                    fileData = doc.fileData;
                    fileName = doc.fileName;
                }
            }
            // Nếu bài học có tệp PDF tải lên (vd: 1.pdf), tải trực tiếp tệp PDF gốc đó
            if (fileData && (fileName || "").toLowerCase().endsWith(".pdf")) {
                const a = document.createElement("a");
                a.href = fileData;
                a.download = fileName || `KichBan_${item.code}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                return;
            }

            const examCode = getPostExamCode(item);
            const printableHtml = buildLessonPrintableHtml(item);
            if (typeof window !== "undefined" && window.open) {
                const printWin = window.open("", "_blank", "width=960,height=800");
                if (printWin) {
                    printWin.document.open();
                    printWin.document.write(printableHtml);
                    printWin.document.close();
                    printWin.focus();
                    setTimeout(() => {
                        try { printWin.print(); } catch (e) { console.warn("Print trigger error:", e); }
                    }, 450);
                    return;
                }
            }
            const blob = new Blob(['\ufeff', printableHtml], { type: 'text/html;charset=utf-8' });
            downloadBlob(blob, `KichBan_${item.code}_${examCode.replace(/[^A-Za-z0-9_-]/g, "")}_BanInPDF.html`);
            alert("Đã tạo tệp bản in! Quý Thầy/Cô mở tệp và chọn 'In / Lưu dưới dạng PDF' (Print / Save as PDF).");
        }

        function buildLessonPlainText(item) {
            const examCode = getPostExamCode(item);
            const charsText = (item.characters && item.characters.length > 0)
                ? item.characters.map((c, idx) => {
                    const isFact = c.type === "HISTORICAL_FACT";
                    const tag = isFact ? "[Nhân vật lịch sử]" : "[Gợi ý sáng tạo]";
                    return `  ${idx + 1}. ${c.name} ${tag}\n     - Đặc điểm: ${c.desc}`;
                }).join("\n\n")
                : "  (Giáo viên và học sinh linh hoạt xây dựng các vai đại diện phù hợp)";

            return `================================================================================
BỘ GIÁO DỤC VÀ ĐÀO TẠO — HỆ THỐNG TRA CỨU TƯ LIỆU LỊCH SỬ THPT SITUATION
HỒ SƠ KỊCH BẢN CHUYỂN THỂ SÂN KHẤU HÓA LỊCH SỬ (CHƯƠNG TRÌNH GDPT 2018)
================================================================================

📌 MÃ BÀI HỌC   : ${item.code}
🏷️ MÃ ĐỀ THI    : ${examCode}
🎓 KHỐI LỚP     : Lớp ${item.grade} THPT
📚 CHỦ ĐỀ       : ${item.topic || 'Lịch sử THPT'}
📖 BÀI HỌC SGK  : ${item.lesson}
🎭 THỂ LOẠI     : ${item.format}
🔍 NGUỒN CĂN CỨ : ${item.sources || 'Sách giáo khoa Lịch sử THPT (GDPT 2018)'}

--------------------------------------------------------------------------------
1. BỐI CẢNH LỊCH SỬ (DỮ KIỆN SGK)
--------------------------------------------------------------------------------
${item.context || 'Bám sát nội dung Sách giáo khoa Lịch sử THPT.'}

--------------------------------------------------------------------------------
2. TRỌNG TÂM KIẾN THỨC CẦN TRUYỀN TẢI
--------------------------------------------------------------------------------
${item.focus}

--------------------------------------------------------------------------------
3. TÌNH HUỐNG VÀ Ý TƯỞNG SÂN KHẤU HÓA
--------------------------------------------------------------------------------
${item.scenario}

--------------------------------------------------------------------------------
4. BẢNG PHÂN VAI NHÂN VẬT & GỢI Ý ĐẠO CỤ
--------------------------------------------------------------------------------
${charsText}

--------------------------------------------------------------------------------
5. HƯỚNG DẪN SƯ PHẠM VÀ DÀN DỰNG HOẠT CẢNH
--------------------------------------------------------------------------------
- Khởi động: Cho học sinh giới thiệu nhanh bối cảnh thời gian, không gian.
- Diễn xuất: Nhấn mạnh sự tự nhiên, chân thật, tránh cường điệu hóa sai lệch dữ kiện.
- Tổng kết: Giáo viên chốt lại bài học lịch sử, ý nghĩa thời đại và rút ra bài học kinh nghiệm.

================================================================================
XÁC THỰC SỐ HÓA: TỔ CHUYÊN MÔN LỊCH SỬ THPT SITUATION (NĂM HỌC 2025 - 2026)
================================================================================
`;
        }

        function exportLessonAsPlainText(itemOrCode) {
            const item = resolveLessonItem(itemOrCode);
            if (!item) return;

            let fileData = item.fileData;
            let fileName = item.fileName;
            if (!fileData) {
                const doc = documentStore.find(d => d.code === item.code);
                if (doc && doc.fileData) {
                    fileData = doc.fileData;
                    fileName = doc.fileName;
                }
            }
            if (fileData && (fileName || "").toLowerCase().endsWith(".txt")) {
                const a = document.createElement("a");
                a.href = fileData;
                a.download = fileName || `KichBan_${item.code}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                return;
            }

            const examCode = getPostExamCode(item);
            const safeExam = examCode.replace(/[^A-Za-z0-9_-]/g, "");
            const outFileName = `KichBan_${item.code}_${safeExam || 'MD'}.txt`;
            const textContent = buildLessonPlainText(item);
            const blob = new Blob(['\ufeff', textContent], { type: 'text/plain;charset=utf-8' });
            downloadBlob(blob, outFileName);
        }

        function buildLessonStandaloneWebHtml(item) {
            const examCode = getPostExamCode(item);
            const charsRows = (item.characters && item.characters.length > 0)
                ? item.characters.map((c, idx) => {
                    const isFact = c.type === "HISTORICAL_FACT";
                    const badgeClass = isFact ? "badge-fact" : "badge-creative";
                    const badgeText = isFact ? "✓ Nhân vật lịch sử" : "🎭 Gợi ý sáng tạo";
                    return `
            <div style="background: #fff; border: 1px solid #dcd3c5; border-radius: 6px; padding: 12px 16px; margin-bottom: 10px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <strong style="color: #800020; font-size: 1.05rem;">${idx + 1}. ${escapeHtml(c.name)}</strong>
                <span class="${badgeClass}">${badgeText}</span>
              </div>
              <p style="margin: 0; font-size: 0.9rem; color: #444; line-height: 1.5;">${escapeHtml(c.desc)}</p>
            </div>`;
                }).join("")
                : `<p style="font-style: italic; color: #666;">Giáo viên và học sinh linh hoạt phân công vai diễn phù hợp.</p>`;

            return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(item.lesson)} — Kịch bản Sân khấu hóa Lịch sử</title>
  <style>
    :root {
      --burgundy: #800020;
      --gold: #C9B037;
      --ivory: #FDFBF7;
      --ivory-dark: #F5EFEB;
      --ink: #1C1A17;
      --border: #DCD3C5;
    }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background-color: var(--ivory); color: var(--ink); line-height: 1.6; margin: 0; padding: 20px; }
    .container { max-width: 900px; margin: 0 auto; background: #ffffff; border: 2px solid var(--gold); border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); overflow: hidden; }
    .header { background: var(--burgundy); color: var(--ivory); padding: 24px 30px; border-bottom: 3px solid var(--gold); }
    .header h1 { margin: 8px 0 0 0; font-size: 1.5rem; font-family: 'Georgia', serif; }
    .body-content { padding: 25px 30px; }
    .meta-bar { background: var(--ivory-dark); border: 1px solid var(--border); border-left: 5px solid var(--burgundy); padding: 14px 18px; border-radius: 4px; margin-bottom: 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 0.92rem; }
    .card-sec { background: #ffffff; border: 1px solid var(--border); border-radius: 6px; padding: 18px 22px; margin-bottom: 20px; }
    .card-sec h3 { margin: 0 0 10px 0; color: var(--burgundy); font-size: 1.15rem; border-bottom: 1.5px solid var(--border); padding-bottom: 6px; font-family: 'Georgia', serif; }
    .scenario-quote { background: #E8F5E9; border-left: 4px solid #2E7D32; padding: 14px 18px; font-size: 1rem; color: #1B5E20; border-radius: 4px; margin: 10px 0; }
    .badge-fact { background: #E8F5E9; color: #1B5E20; border: 1px solid #81C784; font-size: 0.72rem; font-weight: bold; padding: 2px 8px; border-radius: 3px; }
    .badge-creative { background: #F3E5F5; color: #4A148C; border: 1px solid #CE93D8; font-size: 0.72rem; font-weight: bold; padding: 2px 8px; border-radius: 3px; }
    .footer-bar { background: #faf7f2; border-top: 1px solid var(--border); padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #666; }
    @media print { body { padding: 0; background: #fff; } .container { border: none; box-shadow: none; max-width: 100%; } .footer-bar button { display: none; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <span style="background:var(--gold); color:var(--burgundy); padding:3px 10px; border-radius:4px; font-weight:bold; font-size:0.85rem;">Mã bài: ${escapeHtml(item.code)}</span>
        <span style="background:#FFF3E0; color:#BF360C; padding:3px 10px; border-radius:4px; font-weight:bold; font-size:0.85rem;">Mã đề: ${escapeHtml(examCode)}</span>
        <span style="font-size:0.9rem; color:#f0e6d6;">GDPT 2018 • Khối ${escapeHtml(item.grade)}</span>
      </div>
      <h1>${escapeHtml(item.lesson)}</h1>
      <div style="font-size:0.88rem; color:#f0e6d6; margin-top:4px;">Chủ đề: ${escapeHtml(item.topic || 'Lịch sử THPT')} • Thể loại: ${escapeHtml(item.format)}</div>
    </div>

    <div class="body-content">
      <div class="meta-bar">
        <div><strong>📌 Khối lớp:</strong> Lớp ${escapeHtml(item.grade)} THPT</div>
        <div><strong>🎭 Hình thức:</strong> ${escapeHtml(item.format)}</div>
        <div><strong>🏷️ Mã chuẩn hóa:</strong> ${escapeHtml(examCode)}</div>
        <div><strong>🔍 Nguồn:</strong> ${escapeHtml(item.sources || 'SGK Lịch sử THPT')}</div>
      </div>

      <div class="card-sec">
        <h3>1. Bối cảnh lịch sử xác thực</h3>
        <p>${escapeHtml(item.context || "Bám sát Sách giáo khoa Lịch sử THPT.")}</p>
      </div>

      <div class="card-sec">
        <h3>2. Trọng tâm kiến thức cần truyền tải</h3>
        <p><strong>${escapeHtml(item.focus)}</strong></p>
      </div>

      <div class="card-sec">
        <h3>3. Tình huống & ý tưởng sân khấu hóa</h3>
        <div class="scenario-quote">${escapeHtml(item.scenario)}</div>
      </div>

      <div class="card-sec">
        <h3>4. Bảng phân vai & gợi ý diễn xuất</h3>
        ${charsRows}
      </div>
    </div>

    <div class="footer-bar">
      <div>Hệ thống Tra cứu & Hoạt cảnh Lịch sử THPT Situation (2026)</div>
      <button onclick="window.print()" style="background:var(--burgundy); color:#fff; border:none; padding:8px 16px; border-radius:4px; cursor:pointer; font-weight:600;">🖨️ In trang này</button>
    </div>
  </div>
</body>
</html>`;
        }

        function exportLessonAsStandaloneHtml(itemOrCode) {
            const item = resolveLessonItem(itemOrCode);
            if (!item) return;
            const examCode = getPostExamCode(item);
            const safeExam = examCode.replace(/[^A-Za-z0-9_-]/g, "");
            const fileName = `KichBan_${item.code}_${safeExam || 'MD'}.html`;
            const htmlContent = buildLessonStandaloneWebHtml(item);
            const blob = new Blob(['\ufeff', htmlContent], { type: 'text/html;charset=utf-8' });
            downloadBlob(blob, fileName);
        }

        function exportLessonOriginalFile(itemOrCode) {
            const item = resolveLessonItem(itemOrCode);
            if (!item) return;
            let fileData = item.fileData;
            let fileName = item.fileName;
            if (!fileData) {
                const doc = (typeof documentStore !== "undefined" ? documentStore : []).find(d => d.code === item.code);
                if (doc && doc.fileData) {
                    fileData = doc.fileData;
                    fileName = doc.fileName;
                }
            }
            if (fileData) {
                downloadDataUrl(fileData, fileName || `KichBan_${item.code}`);
            } else {
                exportLessonAsDocx(item);
            }
        }

        function exportLessonToFormat(itemOrCode, format) {
            const item = resolveLessonItem(itemOrCode);
            if (!item) return;
            const fmt = (format || 'docx').toLowerCase();
            switch (fmt) {
                case 'doc':
                    generateAndDownloadWordDocument(item);
                    break;
                case 'docx':
                    exportLessonAsDocx(item);
                    break;
                case 'pdf':
                    printLessonPdfDocument(item);
                    break;
                case 'txt':
                    exportLessonAsPlainText(item);
                    break;
                case 'html':
                    exportLessonAsStandaloneHtml(item);
                    break;
                case 'original':
                    exportLessonOriginalFile(item);
                    break;
                default:
                    exportLessonAsDocx(item);
            }
        }

        function downloadDirectItem(itemOrCode) {
            const item = resolveLessonItem(itemOrCode);
            if (!item) return;
            let fileData = item.fileData;
            if (!fileData && typeof documentStore !== "undefined") {
                const doc = documentStore.find(d => d.code === item.code);
                if (doc && doc.fileData) fileData = doc.fileData;
            }
            if (fileData) {
                exportLessonOriginalFile(item);
            } else {
                exportLessonAsDocx(item);
            }
        }

        // --- CÁC HÀM XUẤT CHO HỒ SƠ TƯ LIỆU (DOCUMENT STORE) ---
        function buildDocStoreWordHtml(doc) {
            return `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${escapeHtml(doc.title)}</title>
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.6; margin: 2.5cm 2cm; color: #1a1a1a; }
    h1 { font-size: 17pt; color: #800020; text-align: center; text-transform: uppercase; margin-bottom: 5px; }
    .meta { background: #faf7f2; border: 1.5px solid #dcd3c5; border-left: 5px solid #800020; padding: 12px 16px; margin: 20px 0; }
    .content-box { white-space: pre-wrap; font-size: 12pt; background: #fff; border: 1px solid #ccc; padding: 15px; margin-top: 15px; }
  </style>
</head>
<body>
  <div style="text-align: center; font-weight: bold; margin-bottom: 20px;">
    BỘ GIÁO DỤC VÀ ĐÀO TẠO — HỆ THỐNG TRA CỨU TƯ LIỆU LỊCH SỬ THPT SITUATION
  </div>
  <h1>${escapeHtml(doc.title)}</h1>
  <div class="meta">
    <p><strong>Mã hồ sơ:</strong> ${escapeHtml(doc.id)} | <strong>Mã bài học liên kết:</strong> ${escapeHtml(doc.code || 'Chung')}</p>
    <p><strong>Khối lớp:</strong> Lớp ${escapeHtml(doc.grade)} | <strong>Thể loại tư liệu:</strong> ${escapeHtml(doc.format)}</p>
    <p><strong>Nguồn kiểm chứng:</strong> ${escapeHtml(doc.source)} | <strong>Cập nhật:</strong> ${escapeHtml(doc.updatedAt)}</p>
  </div>
  <div class="content-box">
${escapeHtml(doc.content)}
  </div>
</body>
</html>`;
        }

        function buildDocStorePrintableHtml(doc) {
            return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(doc.title)} — Hồ sơ tư liệu Lịch sử</title>
  <style>
    @page { size: A4 portrait; margin: 20mm 15mm; }
    body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; margin: 0; padding: 20px; color: #111; }
    .no-print { display: flex; justify-content: space-between; align-items: center; background: #faf7f2; border: 1px solid #dcd3c5; padding: 10px 16px; margin-bottom: 20px; border-radius: 6px; }
    @media print { .no-print { display: none !important; } body { padding: 0; } }
    h1 { font-size: 16pt; color: #800020; text-align: center; text-transform: uppercase; margin: 15px 0 5px 0; }
    .meta { background: #faf7f2; border: 1px solid #ccc; border-left: 4px solid #800020; padding: 10px 14px; margin: 15px 0; font-size: 11pt; }
    .content-box { white-space: pre-wrap; font-size: 11.5pt; background: #fff; border: 1px solid #ddd; padding: 16px; line-height: 1.7; }
  </style>
</head>
<body>
  <div class="no-print">
    <strong style="color: #800020; font-size: 13pt;">📑 Bản in Hồ sơ tư liệu (A4)</strong>
    <div>
      <button onclick="window.print()" style="background: #800020; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;">🖨️ In / Lưu PDF</button>
      <button onclick="window.close()" style="background: #fff; border: 1px solid #ccc; padding: 8px 14px; border-radius: 4px; cursor: pointer; margin-left: 8px;">Đóng</button>
    </div>
  </div>
  <div style="text-align: center; font-weight: bold; font-size: 11pt;">
    BỘ GIÁO DỤC VÀ ĐÀO TẠO — HỆ THỐNG TRA CỨU TƯ LIỆU LỊCH SỬ THPT SITUATION
  </div>
  <h1>${escapeHtml(doc.title)}</h1>
  <div class="meta">
    <p style="margin: 2px 0;"><strong>Mã hồ sơ:</strong> ${escapeHtml(doc.id)} | <strong>Mã bài học liên kết:</strong> ${escapeHtml(doc.code || 'Chung')}</p>
    <p style="margin: 2px 0;"><strong>Khối lớp:</strong> Lớp ${escapeHtml(doc.grade)} | <strong>Thể loại tư liệu:</strong> ${escapeHtml(doc.format)}</p>
    <p style="margin: 2px 0;"><strong>Nguồn kiểm chứng:</strong> ${escapeHtml(doc.source)} | <strong>Cập nhật:</strong> ${escapeHtml(doc.updatedAt)}</p>
  </div>
  <div class="content-box">
${escapeHtml(doc.content)}
  </div>
</body>
</html>`;
        }

        function exportDocStoreAsDoc(doc) {
            if (!doc) return;
            if (doc.fileData && (doc.fileName || "").toLowerCase().endsWith(".doc")) {
                exportDocStoreOriginalFile(doc);
                return;
            }
            const docHtml = buildDocStoreWordHtml(doc);
            const blob = new Blob(['\ufeff', docHtml], { type: "application/msword;charset=utf-8" });
            downloadBlob(blob, `${doc.id}_${doc.code || "TuLieu"}.doc`);
        }

        function exportDocStoreAsDocx(doc) {
            if (!doc) return;
            if (doc.fileData && (doc.fileName || "").toLowerCase().endsWith(".docx")) {
                exportDocStoreOriginalFile(doc);
                return;
            }
            const docHtml = buildDocStoreWordHtml(doc);
            const blob = new Blob(['\ufeff', docHtml], {
                type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8"
            });
            downloadBlob(blob, `${doc.id}_${doc.code || "TuLieu"}.docx`);
        }

        function printDocStorePdfDocument(doc) {
            if (!doc) return;
            if (doc.fileData && (doc.fileName || "").toLowerCase().endsWith(".pdf")) {
                exportDocStoreOriginalFile(doc);
                return;
            }
            const printableHtml = buildDocStorePrintableHtml(doc);
            if (typeof window !== "undefined" && window.open) {
                const printWin = window.open("", "_blank", "width=920,height=800");
                if (printWin) {
                    printWin.document.open();
                    printWin.document.write(printableHtml);
                    printWin.document.close();
                    printWin.focus();
                    setTimeout(() => {
                        try { printWin.print(); } catch (e) { console.warn("Print trigger error:", e); }
                    }, 450);
                    return;
                }
            }
            const blob = new Blob(['\ufeff', printableHtml], { type: 'text/html;charset=utf-8' });
            downloadBlob(blob, `${doc.id}_${doc.code || "TuLieu"}_BanInPDF.html`);
            alert("Đã tạo tệp bản in! Quý Thầy/Cô mở tệp và chọn 'In / Lưu dưới dạng PDF' (Print / Save as PDF).");
        }

        function exportDocStoreAsPlainText(doc) {
            if (!doc) return;
            if (doc.fileData && (doc.fileName || "").toLowerCase().endsWith(".txt")) {
                exportDocStoreOriginalFile(doc);
                return;
            }
            const textContent = `================================================================================
BỘ GIÁO DỤC VÀ ĐÀO TẠO — HỆ THỐNG TRA CỨU TƯ LIỆU LỊCH SỬ THPT SITUATION
HỒ SƠ TƯ LIỆU SỐ HÓA
================================================================================

📌 MÃ HỒ SƠ     : ${doc.id}
🏷️ MÃ BÀI HỌC   : ${doc.code || 'Chung'}
🎓 KHỐI LỚP     : Lớp ${doc.grade} THPT
📑 THỂ LOẠI     : ${doc.format}
📖 TIÊU ĐỀ      : ${doc.title}
🔍 NGUỒN CĂN CỨ : ${doc.source || 'Lưu trữ Lịch sử'}
⏱️ CẬP NHẬT     : ${doc.updatedAt || '2026'}

--------------------------------------------------------------------------------
NỘI DUNG TƯ LIỆU LỊCH SỬ
--------------------------------------------------------------------------------
${doc.content}

================================================================================
XÁC THỰC SỐ HÓA: TỔ CHUYÊN MÔN LỊCH SỬ THPT SITUATION (2026)
================================================================================
`;
            const blob = new Blob(['\ufeff', textContent], { type: 'text/plain;charset=utf-8' });
            downloadBlob(blob, `${doc.id}_${doc.code || "TuLieu"}.txt`);
        }

        function exportDocStoreAsStandaloneHtml(doc) {
            if (!doc) return;
            const printableHtml = buildDocStorePrintableHtml(doc);
            const blob = new Blob(['\ufeff', printableHtml], { type: 'text/html;charset=utf-8' });
            downloadBlob(blob, `${doc.id}_${doc.code || "TuLieu"}.html`);
        }

        function exportDocStoreOriginalFile(doc) {
            if (!doc) return;
            let fileData = doc.fileData;
            let fileName = doc.fileName;
            if (!fileData && doc.code) {
                const post = (typeof catalogData !== 'undefined' ? catalogData : []).find(p => p.code === doc.code);
                if (post && post.fileData) {
                    fileData = post.fileData;
                    fileName = fileName || post.fileName;
                }
            }
            if (fileData) {
                downloadDataUrl(fileData, fileName || `${doc.id}_${doc.code || "Situation"}.docx`);
            } else {
                exportDocStoreAsDocx(doc);
            }
        }

        // ==========================================
        // ĐIỀU PHỐI HỘP THOẠI HỎI ĐỊNH DẠNG TẢI VỀ
        // ==========================================
        function openDownloadFormatModal(codeOrItem) {
            let item = (typeof codeOrItem === "object" && codeOrItem !== null) ? codeOrItem : catalogData.find(i => i.code === codeOrItem);
            if (!item && window.SituationDB && window.SituationDB.catalog) {
                item = window.SituationDB.catalog.find(i => i.code === codeOrItem);
            }

            if (!item) {
                alert("Không tìm thấy thông tin bài học mã: " + codeOrItem);
                return;
            }

            currentDownloadTarget = { type: "catalog", item: item };

            const examCode = getPostExamCode(item);
            const modalTitle = document.getElementById("downloadModalTitle");
            const codeEl = document.getElementById("downloadModalCode");
            const examCodeEl = document.getElementById("downloadModalExamCode");
            const formatEl = document.getElementById("downloadModalFormat");
            const lessonEl = document.getElementById("downloadModalLesson");
            const topicEl = document.getElementById("downloadModalTopic");

            if (modalTitle) modalTitle.textContent = "TÙY CHỌN ĐỊNH DẠNG TẢI VỀ KỊCH BẢN";
            if (codeEl) codeEl.textContent = item.code;
            if (examCodeEl) examCodeEl.textContent = examCode;
            if (formatEl) formatEl.textContent = item.format;
            if (lessonEl) lessonEl.textContent = item.lesson;
            if (topicEl) topicEl.textContent = `Khối ${item.grade} • Chủ đề: ${item.topic || 'Lịch sử THPT'}`;

            // Kiểm tra tệp đính kèm nguyên bản
            let fileData = item.fileData;
            let fileName = item.fileName;
            if (!fileData) {
                const doc = documentStore.find(d => d.code === item.code);
                if (doc && doc.fileData) {
                    fileData = doc.fileData;
                    fileName = doc.fileName;
                }
            }

            const origCard = document.getElementById("downloadCardOriginal");
            const origNameEl = document.getElementById("downloadOriginalFileName");
            if (origCard) {
                if (fileData) {
                    origCard.style.display = "flex";
                    if (origNameEl) origNameEl.textContent = `Tệp nguyên bản: ${fileName || ('KichBan_' + item.code + '.docx')}`;
                } else {
                    origCard.style.display = "none";
                }
            }

            // Cập nhật Banner Tệp Gốc Đã Tải Lên
            const bannerEl = document.getElementById("downloadUploadedFileBanner");
            const bannerNameEl = document.getElementById("downloadUploadedFileName");
            const bannerBadgeEl = document.getElementById("downloadUploadedFileBadge");
            const bannerIconEl = document.getElementById("downloadUploadedFileIcon");
            const bannerDescEl = document.getElementById("downloadUploadedFileDesc");
            const bannerBtnTextEl = document.getElementById("downloadUploadedFileBtnText");

            if (bannerEl) {
                if (fileData && fileName) {
                    bannerEl.style.display = "flex";
                    if (bannerNameEl) bannerNameEl.textContent = fileName;
                    const ext = (fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2) || "FILE").toUpperCase();
                    if (bannerBadgeEl) bannerBadgeEl.textContent = ext;
                    if (bannerIconEl) {
                        if (ext === "PDF") bannerIconEl.textContent = "📑";
                        else if (ext === "DOCX" || ext === "DOC") bannerIconEl.textContent = "📘";
                        else if (ext === "TXT") bannerIconEl.textContent = "📝";
                        else bannerIconEl.textContent = "📄";
                    }
                    if (bannerDescEl) {
                        bannerDescEl.textContent = `Tải về đúng tệp nguyên bản định dạng .${ext} bạn đã tải lên hệ thống (${fileName}).`;
                    }
                    if (bannerBtnTextEl) {
                        bannerBtnTextEl.textContent = `⬇️ TẢI VỀ ${fileName} NGAY`;
                    }
                } else {
                    bannerEl.style.display = "none";
                }
            }

            const modal = document.getElementById("downloadFormatModal");
            if (modal) modal.classList.add("open");
        }

        function openDocDownloadFormatModal(docId) {
            const doc = documentStore.find(d => d.id === docId);
            if (!doc) {
                alert("Không tìm thấy hồ sơ tư liệu: " + docId);
                return;
            }

            currentDownloadTarget = { type: "document", doc: doc };

            const modalTitle = document.getElementById("downloadModalTitle");
            const codeEl = document.getElementById("downloadModalCode");
            const examCodeEl = document.getElementById("downloadModalExamCode");
            const formatEl = document.getElementById("downloadModalFormat");
            const lessonEl = document.getElementById("downloadModalLesson");
            const topicEl = document.getElementById("downloadModalTopic");

            if (modalTitle) modalTitle.textContent = "TÙY CHỌN ĐỊNH DẠNG TẢI VỀ HỒ SƠ TƯ LIỆU";
            if (codeEl) codeEl.textContent = doc.id;
            if (examCodeEl) examCodeEl.textContent = doc.code || 'CHUNG';
            if (formatEl) formatEl.textContent = doc.format;
            if (lessonEl) lessonEl.textContent = doc.title;
            if (topicEl) topicEl.textContent = `Khối ${doc.grade} • Nguồn: ${doc.source || 'Lưu trữ Lịch sử'}`;

            let effectiveFileData = doc.fileData;
            let effectiveFileName = doc.fileName;
            if (!effectiveFileData && doc.code) {
                const linkedPost = (typeof catalogData !== 'undefined' ? catalogData : []).find(p => p.code === doc.code);
                if (linkedPost && linkedPost.fileData) {
                    effectiveFileData = linkedPost.fileData;
                    effectiveFileName = effectiveFileName || linkedPost.fileName;
                }
            }

            const origCard = document.getElementById("downloadCardOriginal");
            const origNameEl = document.getElementById("downloadOriginalFileName");
            if (origCard) {
                if (effectiveFileData) {
                    origCard.style.display = "flex";
                    if (origNameEl) origNameEl.textContent = `Tệp nguyên bản: ${effectiveFileName || (doc.id + '.docx')}`;
                } else {
                    origCard.style.display = "none";
                }
            }

            // Cập nhật Banner Tệp Gốc Đã Tải Lên cho Hồ sơ tư liệu
            const bannerEl = document.getElementById("downloadUploadedFileBanner");
            const bannerNameEl = document.getElementById("downloadUploadedFileName");
            const bannerBadgeEl = document.getElementById("downloadUploadedFileBadge");
            const bannerIconEl = document.getElementById("downloadUploadedFileIcon");
            const bannerDescEl = document.getElementById("downloadUploadedFileDesc");
            const bannerBtnTextEl = document.getElementById("downloadUploadedFileBtnText");

            if (bannerEl) {
                if (effectiveFileData && effectiveFileName) {
                    bannerEl.style.display = "flex";
                    if (bannerNameEl) bannerNameEl.textContent = effectiveFileName;
                    const ext = (effectiveFileName.slice((effectiveFileName.lastIndexOf(".") - 1 >>> 0) + 2) || "FILE").toUpperCase();
                    if (bannerBadgeEl) bannerBadgeEl.textContent = ext;
                    if (bannerIconEl) {
                        if (ext === "PDF") bannerIconEl.textContent = "📑";
                        else if (ext === "DOCX" || ext === "DOC") bannerIconEl.textContent = "📘";
                        else if (ext === "TXT") bannerIconEl.textContent = "📝";
                        else bannerIconEl.textContent = "📄";
                    }
                    if (bannerDescEl) {
                        bannerDescEl.textContent = `Tải về đúng tệp nguyên bản định dạng .${ext} bạn đã tải lên hệ thống (${doc.fileName}).`;
                    }
                    if (bannerBtnTextEl) {
                        bannerBtnTextEl.textContent = `⬇️ TẢI VỀ ${doc.fileName} NGAY`;
                    }
                } else {
                    bannerEl.style.display = "none";
                }
            }

            const modal = document.getElementById("downloadFormatModal");
            if (modal) modal.classList.add("open");
        }

        function closeDownloadFormatModal() {
            const modal = document.getElementById("downloadFormatModal");
            if (modal) modal.classList.remove("open");
        }

        // Khi bấm tải về tại bất kỳ đâu trong hệ thống (Catalog, Chi tiết, Quản lý):
        // Hỏi Thầy/Cô và các bạn muốn tải về bằng gì thì sẽ tải về định dạng đó!
        function downloadTeacherWordFile(code) {
            openDownloadFormatModal(code);
        }

        function previewCurrentDownloadTargetFile() {
            if (!currentDownloadTarget) {
                closeDownloadFormatModal();
                return;
            }
            const target = currentDownloadTarget;
            closeDownloadFormatModal();
            if (target.type === "catalog") {
                openDetailModal(target.item.code);
                viewUploadedItemFile(target.item.code);
            } else if (target.type === "document") {
                previewDocument(target.doc.id);
            }
        }

        function executeDownloadSelectedFormat(format) {
            if (!currentDownloadTarget) {
                closeDownloadFormatModal();
                return;
            }

            const target = currentDownloadTarget;
            closeDownloadFormatModal();

            if (target.type === "catalog") {
                const item = target.item;
                switch (format) {
                    case "doc":
                        generateAndDownloadWordDocument(item);
                        break;
                    case "docx":
                        exportLessonAsDocx(item);
                        break;
                    case "pdf":
                        printLessonPdfDocument(item);
                        break;
                    case "txt":
                        exportLessonAsPlainText(item);
                        break;
                    case "html":
                        exportLessonAsStandaloneHtml(item);
                        break;
                    case "original":
                        exportLessonOriginalFile(item);
                        break;
                    default:
                        generateAndDownloadWordDocument(item);
                }
            } else if (target.type === "document") {
                const doc = target.doc;
                switch (format) {
                    case "doc":
                        exportDocStoreAsDoc(doc);
                        break;
                    case "docx":
                        exportDocStoreAsDocx(doc);
                        break;
                    case "pdf":
                        printDocStorePdfDocument(doc);
                        break;
                    case "txt":
                        exportDocStoreAsPlainText(doc);
                        break;
                    case "html":
                        exportDocStoreAsStandaloneHtml(doc);
                        break;
                    case "original":
                        exportDocStoreOriginalFile(doc);
                        break;
                    default:
                        exportDocStoreAsDoc(doc);
                }
            }
        }

        // ==========================================
        // CHUYỂN ĐỔI TAB TRONG MODAL GIÁO VIÊN
        // ==========================================
        function switchTeacherModalTab(tabName) {
            const uploadTab = document.getElementById("teacherTabUpload");
            const manageTab = document.getElementById("teacherTabManage");
            const subsTab = document.getElementById("teacherTabSubmissions");
            const btnUpload = document.getElementById("tabBtnTeacherUpload");
            const btnManage = document.getElementById("tabBtnTeacherManage");
            const btnSubs = document.getElementById("tabBtnTeacherSubmissions");

            if (uploadTab) uploadTab.style.display = "none";
            if (manageTab) manageTab.style.display = "none";
            if (subsTab) subsTab.style.display = "none";
            if (btnUpload) btnUpload.classList.remove("active");
            if (btnManage) btnManage.classList.remove("active");
            if (btnSubs) btnSubs.classList.remove("active");

            if (tabName === "manage") {
                if (manageTab) manageTab.style.display = "block";
                if (btnManage) btnManage.classList.add("active");
                renderTeacherPostsManageList();
            } else if (tabName === "submissions") {
                if (subsTab) subsTab.style.display = "block";
                if (btnSubs) btnSubs.classList.add("active");
                renderTeacherSubmissionsList();
            } else {
                if (uploadTab) uploadTab.style.display = "block";
                if (btnUpload) btnUpload.classList.add("active");
            }
        }

        function updateTeacherPostCountBadge() {
            const badge = document.getElementById("teacherPostCountBadge");
            if (badge) {
                badge.textContent = catalogData.length;
            }
        }

        // ==========================================
        // QUẢN LÝ MÃ ĐỀ (EXAM CODE) CHO BÀI ĐĂNG
        // ==========================================
        function autoGenerateTeacherExamCode() {
            const grade = document.getElementById("teacherGrade") ? document.getElementById("teacherGrade").value : "11";
            const existing = catalogData.filter(i => i.grade === grade);
            const nextNum = existing.length + 1;
            const generated = `MD-${grade}.${String(nextNum).padStart(2, "0")}`;
            const input = document.getElementById("teacherExamCode");
            if (input) {
                input.value = generated;
                if (typeof input.focus === "function") {
                    input.focus();
                }
            }
            return generated;
        }

        function onTeacherGradeChange() {
            const input = document.getElementById("teacherExamCode");
            const editCode = document.getElementById("teacherEditCode") ? document.getElementById("teacherEditCode").value.trim() : "";
            if (!editCode && input && (!input.value.trim() || input.value.trim().startsWith("MD-"))) {
                autoGenerateTeacherExamCode();
            }
        }

        function getPostExamCode(item) {
            if (!item) return "";
            if (item.examCode && item.examCode.trim()) return item.examCode.trim();
            const clean = (item.code || "").replace(/[^0-9A-Z]/gi, "");
            return `MD-${clean || (item.grade ? item.grade + '.01' : 'SU')}`;
        }

        // ==========================================
        // QUẢN LÝ CHỌN & XÓA HÀNG LOẠT (BATCH DELETE)
        // ==========================================
        let selectedManagePostCodes = new Set();

        function toggleSelectAllManagePosts(isChecked) {
            const checkboxes = document.querySelectorAll(".manage-post-checkbox");
            checkboxes.forEach(cb => {
                cb.checked = isChecked;
                if (isChecked) {
                    selectedManagePostCodes.add(cb.value);
                } else {
                    selectedManagePostCodes.delete(cb.value);
                }
            });
            updateManageSelectionUI();
        }

        function toggleManagePostSelection(code, isChecked) {
            if (isChecked) {
                selectedManagePostCodes.add(code);
            } else {
                selectedManagePostCodes.delete(code);
            }
            updateManageSelectionUI();
        }

        function updateManageSelectionUI() {
            const countSpan = document.getElementById("manageSelectedCount");
            const btnBatchDelete = document.getElementById("btnBatchDeleteManagePosts");
            const badgeBatchCount = document.getElementById("badgeBatchDeleteCount");
            const selectAllCb = document.getElementById("manageSelectAllCheckbox");

            const checkboxes = document.querySelectorAll(".manage-post-checkbox");
            const totalVisible = checkboxes.length;
            const count = selectedManagePostCodes.size;

            if (countSpan) countSpan.textContent = count;
            if (badgeBatchCount) badgeBatchCount.textContent = count;
            if (btnBatchDelete) {
                btnBatchDelete.style.display = count > 0 ? "inline-flex" : "none";
            }

            if (selectAllCb) {
                selectAllCb.checked = totalVisible > 0 && count === totalVisible;
                selectAllCb.indeterminate = count > 0 && count < totalVisible;
            }
        }

        // Bộ nhớ đệm hỗ trợ HOÀN TÁC (Undo) & Trạng thái vừa lưu
        let _lastDeletedTeacherItem = null;
        let _lastDeletedTeacherBatch = null;
        let _lastSavedPostCode = null;
        let _lastSavedTimer = null;

        function notifyTeacher({ title, message, badge = "🔔", code = "", actionText = "", onAction = null, duration = 6000, fallbackAlert = "" }) {
            const container = (typeof document !== "undefined" && document.getElementById) ? document.getElementById("situationToastContainer") : null;
            const canToast = Boolean(container && typeof container.appendChild === "function" && ((typeof showSituationToast === "function") || (typeof window !== "undefined" && typeof window.showSituationToast === "function")));
            if (canToast) {
                const toastFn = (typeof showSituationToast === "function") ? showSituationToast : window.showSituationToast;
                toastFn({ title, message, badge, code, actionText, onAction, duration });
            } else if (typeof alert === "function") {
                alert(fallbackAlert || `${title}\n\n${message}`);
            }
        }

        function deleteSelectedManagePosts() {
            if (!isTeacherAuthenticated) {
                notifyTeacher({
                    title: "⚠️ BẢO MẬT GIÁO VIÊN",
                    message: "Vui lòng nhập mã khóa giáo viên trước khi thực hiện thao tác xóa bài.",
                    badge: "🔒",
                    fallbackAlert: "⚠️ BẢO MẬT: Vui lòng nhập mã khóa giáo viên trước khi thực hiện thao tác xóa bài."
                });
                openTeacherAuthGate();
                return;
            }

            const codesToDelete = Array.from(selectedManagePostCodes);
            if (codesToDelete.length === 0) {
                notifyTeacher({
                    title: "⚠️ CHƯA CHỌN BÀI",
                    message: "Vui lòng chọn ít nhất 1 bài để xóa.",
                    badge: "⚠️",
                    fallbackAlert: "Vui lòng chọn ít nhất 1 bài để xóa."
                });
                return;
            }

            if (!confirm(`⚠️ XÁC NHẬN XÓA HÀNG LOẠT:\n\nThầy/Cô có chắc chắn muốn xóa ${codesToDelete.length} bài đăng đã chọn cùng các tệp Word đính kèm khỏi Cơ sở dữ liệu SQL không?\n\n(Hành động này sẽ xóa dữ liệu vĩnh viễn khỏi CSDL SQL và đồng bộ tức thì tới tất cả các máy)`)) {
                return;
            }

            // Lưu trữ dữ liệu batch để hỗ trợ hoàn tác
            const deletedPosts = catalogData.filter(i => codesToDelete.includes(i.code));
            const deletedDocs = documentStore.filter(d => codesToDelete.includes(d.code) || codesToDelete.some(c => d.id === `DOC-${c.replace(/[^A-Z0-9]/gi, "")}`));
            _lastDeletedTeacherBatch = {
                posts: JSON.parse(JSON.stringify(deletedPosts)),
                docs: JSON.parse(JSON.stringify(deletedDocs))
            };

            // Hiệu ứng mờ dần mượt mà trên DOM trước khi xóa
            codesToDelete.forEach(code => {
                const rowEl = document.querySelector(`[data-manage-code="${code}"]`);
                if (rowEl) {
                    rowEl.style.transition = "all 0.25s ease-out";
                    rowEl.style.opacity = "0";
                    rowEl.style.transform = "translateX(25px)";
                }
            });

            commitDatabaseMutation('TEACHER_POSTS_BULK_DELETED', { codes: codesToDelete });
            selectedManagePostCodes.clear();

            notifyTeacher({
                title: "🗑️ ĐÃ XÓA HÀNG LOẠT",
                message: `Đã xóa thành công ${codesToDelete.length} bài đăng khỏi CSDL SQL và đồng bộ toàn hệ thống.`,
                badge: "🗑️",
                actionText: "↩️ Hoàn tác",
                onAction: undoLastBatchDeletedPosts,
                duration: 8000,
                fallbackAlert: `✅ Đã xóa thành công ${codesToDelete.length} bài đăng khỏi CSDL SQL và đồng bộ toàn hệ thống.`
            });
        }

        function undoLastBatchDeletedPosts() {
            if (!_lastDeletedTeacherBatch || !_lastDeletedTeacherBatch.posts || _lastDeletedTeacherBatch.posts.length === 0) return;
            const batch = _lastDeletedTeacherBatch;
            _lastDeletedTeacherBatch = null;

            batch.posts.forEach(p => removeDeletedCode(p.code));

            batch.posts.forEach(post => {
                const doc = batch.docs.find(d => d.code === post.code || d.id === `DOC-${post.code.replace(/[^A-Z0-9]/gi, "")}`) || null;
                commitDatabaseMutation('TEACHER_POST_SAVED', {
                    post,
                    doc,
                    author: post.author,
                    lesson: post.lesson,
                    code: post.code
                });
            });

            notifyTeacher({
                title: "↩️ ĐÃ HOÀN TÁC TOÀN BỘ!",
                message: `Đã khôi phục lại ${batch.posts.length} bài đăng vào CSDL SQL.`,
                badge: "✅",
                duration: 5000,
                fallbackAlert: `✅ Đã khôi phục lại ${batch.posts.length} bài đăng.`
            });
            renderTeacherPostsManageList();
        }

        function deleteCurrentFilteredGradePosts() {
            if (!isTeacherAuthenticated) {
                notifyTeacher({
                    title: "⚠️ BẢO MẬT GIÁO VIÊN",
                    message: "Vui lòng nhập mã khóa giáo viên trước khi thực hiện thao tác xóa bài.",
                    badge: "🔒",
                    fallbackAlert: "⚠️ BẢO MẬT: Vui lòng nhập mã khóa giáo viên trước khi thực hiện thao tác xóa bài."
                });
                openTeacherAuthGate();
                return;
            }
            const gradeFilter = document.getElementById("manageGradeFilter")?.value || "ALL";
            if (gradeFilter === "ALL") {
                notifyTeacher({
                    title: "⚠️ CHỌN KHỐI LỚP",
                    message: "Vui lòng chọn 1 Khối lớp cụ thể (Khối 10, 11 hoặc 12) trong bộ lọc trước khi thực hiện xóa.",
                    badge: "⚠️",
                    fallbackAlert: "Vui lòng chọn 1 Khối lớp cụ thể (Khối 10, 11 hoặc 12) trong bộ lọc trước khi thực hiện xóa."
                });
                return;
            }
            const gradeItems = catalogData.filter(i => i.grade === gradeFilter);
            if (gradeItems.length === 0) {
                notifyTeacher({
                    title: "ℹ️ KHÔNG CÓ BÀI",
                    message: `Hiện không còn bài học nào thuộc Khối ${gradeFilter} để xóa.`,
                    badge: "ℹ️",
                    fallbackAlert: `Hiện không còn bài học nào thuộc Khối ${gradeFilter} để xóa.`
                });
                return;
            }
            const codes = gradeItems.map(i => i.code);
            if (!confirm(`⚠️ XÁC NHẬN XÓA TOÀN BỘ KHỐI ${gradeFilter}:\n\nThầy/Cô có chắc chắn muốn xóa TOÀN BỘ ${codes.length} bài học thuộc Khối ${gradeFilter} cùng các tệp đính kèm khỏi CSDL không?\n\n(Hành động này sẽ xóa dữ liệu vĩnh viễn và đồng bộ tức thì 100% trên toàn bộ các Tab, màn hình và thiết bị)`)) {
                return;
            }

            // Hiệu ứng mờ dần
            codes.forEach(code => {
                const rowEl = document.querySelector(`[data-manage-code="${code}"]`);
                if (rowEl) {
                    rowEl.style.transition = "all 0.25s ease-out";
                    rowEl.style.opacity = "0";
                    rowEl.style.transform = "translateX(25px)";
                }
            });

            commitDatabaseMutation('TEACHER_POSTS_BULK_DELETED', { codes });
            selectedManagePostCodes.clear();

            notifyTeacher({
                title: `🗑️ ĐÃ XÓA SẠCH KHỐI ${gradeFilter}`,
                message: `Đã xóa ${codes.length} bài học Khối ${gradeFilter} khỏi CSDL và đồng bộ toàn hệ thống.`,
                badge: "🗑️",
                duration: 5000,
                fallbackAlert: `✅ ĐÃ XÓA TOÀN BỘ ${codes.length} BÀI HỌC CỦA KHỐI ${gradeFilter}!\n\nDữ liệu đã được gỡ bỏ và đồng bộ y hệt nhau 100% trên toàn bộ hệ thống.`
            });
        }

        // ==========================================
        // RENDER DANH SÁCH BÀI, LỌC, SẮP XẾP & QUẢN LÝ / XÓA (TAB 2)
        // ==========================================
        function renderTeacherPostsManageList() {
            const container = document.getElementById("teacherPostsManageList");
            updateTeacherPostCountBadge();
            if (!container) return;

            const query = (document.getElementById("manageSearchInput")?.value || "").trim().toLowerCase();
            const originFilter = document.getElementById("manageOriginFilter")?.value || "ALL";
            const gradeFilter = document.getElementById("manageGradeFilter")?.value || "ALL";
            const sortOrder = document.getElementById("manageSortOrder")?.value || "newest";

            // 1. Lọc dữ liệu theo từ khóa, nguồn bài và khối lớp
            let items = catalogData.filter(item => {
                if (originFilter === "TEACHER" && item.originType !== "TEACHER_CONTRIBUTED") return false;
                if (originFilter === "SYSTEM" && item.originType === "TEACHER_CONTRIBUTED") return false;
                if (gradeFilter !== "ALL" && item.grade !== gradeFilter) return false;

                if (query) {
                    const examCode = getPostExamCode(item).toLowerCase();
                    const code = (item.code || "").toLowerCase();
                    const lesson = (item.lesson || "").toLowerCase();
                    const author = (item.author || "").toLowerCase();
                    const school = (item.school || "").toLowerCase();
                    const scenario = (item.scenario || "").toLowerCase();
                    const fileName = (item.fileName || "").toLowerCase();
                    const match = examCode.includes(query) || code.includes(query) || lesson.includes(query) || author.includes(query) || school.includes(query) || scenario.includes(query) || fileName.includes(query);
                    if (!match) return false;
                }
                return true;
            });

            // 2. Sắp xếp dữ liệu theo tùy chọn của giáo viên
            items.sort((a, b) => {
                const examA = getPostExamCode(a);
                const examB = getPostExamCode(b);
                if (sortOrder === "newest") {
                    if (a.originType === "TEACHER_CONTRIBUTED" && b.originType !== "TEACHER_CONTRIBUTED") return -1;
                    if (b.originType === "TEACHER_CONTRIBUTED" && a.originType !== "TEACHER_CONTRIBUTED") return 1;
                    return (b.createdAt || "").localeCompare(a.createdAt || "") || (b.code || "").localeCompare(a.code || "");
                }
                if (sortOrder === "oldest") {
                    if (a.originType === "TEACHER_CONTRIBUTED" && b.originType !== "TEACHER_CONTRIBUTED") return 1;
                    if (b.originType === "TEACHER_CONTRIBUTED" && a.originType !== "TEACHER_CONTRIBUTED") return -1;
                    return (a.createdAt || "").localeCompare(b.createdAt || "") || (a.code || "").localeCompare(b.code || "");
                }
                if (sortOrder === "examCodeAsc") {
                    return examA.localeCompare(examB, undefined, { numeric: true, sensitivity: 'base' });
                }
                if (sortOrder === "examCodeDesc") {
                    return examB.localeCompare(examA, undefined, { numeric: true, sensitivity: 'base' });
                }
                if (sortOrder === "codeAsc") {
                    return (a.code || "").localeCompare(b.code || "", undefined, { numeric: true });
                }
                if (sortOrder === "codeDesc") {
                    return (b.code || "").localeCompare(a.code || "", undefined, { numeric: true });
                }
                if (sortOrder === "titleAsc") {
                    return (a.lesson || "").localeCompare(b.lesson || "");
                }
                if (sortOrder === "gradeAsc") {
                    return parseInt(a.grade, 10) - parseInt(b.grade, 10);
                }
                if (sortOrder === "gradeDesc") {
                    return parseInt(b.grade, 10) - parseInt(a.grade, 10);
                }
                if (sortOrder === "hasWord") {
                    const hasWordA = Boolean(a.fileData || a.fileName);
                    const hasWordB = Boolean(b.fileData || b.fileName);
                    if (hasWordA && !hasWordB) return -1;
                    if (!hasWordA && hasWordB) return 1;
                    return 0;
                }
                return 0;
            });

            const displayCountSpan = document.getElementById("manageDisplayCount");
            if (displayCountSpan) displayCountSpan.textContent = items.length;

            // Cập nhật nút xóa nhanh toàn bộ khối đang lọc
            const btnDeleteGrade = document.getElementById("btnDeleteCurrentFilteredGrade");
            const labelDeleteGrade = document.getElementById("labelDeleteCurrentFilteredGrade");
            if (btnDeleteGrade && labelDeleteGrade) {
                if (gradeFilter !== "ALL") {
                    const gradeItemsCount = catalogData.filter(i => i.grade === gradeFilter).length;
                    if (gradeItemsCount > 0) {
                        labelDeleteGrade.textContent = `${gradeFilter} (${gradeItemsCount} bài)`;
                        btnDeleteGrade.style.display = "inline-flex";
                    } else {
                        btnDeleteGrade.style.display = "none";
                    }
                } else {
                    btnDeleteGrade.style.display = "none";
                }
            }

            if (items.length === 0) {
                container.innerHTML = `
          <div style="text-align: center; padding: 2.5rem 1rem; background: var(--ivory); border: 1px dashed var(--border); border-radius: 4px;">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📂</div>
            <h4 style="color: var(--burgundy); margin-bottom: 0.35rem; font-family: var(--font-serif); font-size: 1.15rem;">Không tìm thấy bài viết nào phù hợp</h4>
            <p style="font-size: 0.85rem; color: var(--ink-muted); max-width: 440px; margin: 0 auto 1.25rem; line-height: 1.5;">
              Hãy thử thay đổi từ khóa tìm kiếm, bộ lọc nguồn hoặc chọn khối lớp khác.
            </p>
            <button class="btn-primary" type="button" onclick="document.getElementById('manageSearchInput').value=''; document.getElementById('manageOriginFilter').value='ALL'; document.getElementById('manageGradeFilter').value='ALL'; renderTeacherPostsManageList();">Đặt lại bộ lọc</button>
          </div>
        `;
                updateManageSelectionUI();
                return;
            }

            container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${items.map(post => {
                const sizeKb = post.fileSize ? Math.round(post.fileSize / 1024) : 0;
                const hasFile = Boolean(post.fileData || post.fileName);
                const examCode = getPostExamCode(post);
                const isTeacher = post.originType === "TEACHER_CONTRIBUTED";
                const isChecked = selectedManagePostCodes.has(post.code);
                const isJustSaved = Boolean(_lastSavedPostCode && post.code === _lastSavedPostCode);

                return `
              <div data-manage-code="${escapeHtml(post.code)}" style="background: #fff; border: 1px solid ${isJustSaved ? '#2E7D32' : 'var(--border)'}; border-left: 4px solid ${isTeacher ? 'var(--bordeaux)' : 'var(--gold)'}; padding: 0.85rem 1rem; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; gap: 0.85rem; flex-wrap: wrap; box-shadow: ${isJustSaved ? '0 0 12px rgba(46,125,50,0.25)' : '0 1px 3px rgba(0,0,0,0.04)'}; transition: all 0.25s ease;">
                <div style="display: flex; align-items: flex-start; gap: 0.75rem; flex: 1; min-width: 260px;">
                  <div style="padding-top: 0.25rem;">
                    <input type="checkbox" class="manage-post-checkbox" value="${escapeHtml(post.code)}" ${isChecked ? 'checked' : ''} onchange="toggleManagePostSelection('${escapeHtml(post.code)}', this.checked)" style="transform: scale(1.15); cursor: pointer;" />
                  </div>
                  <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 0.45rem; margin-bottom: 0.3rem; flex-wrap: wrap;">
                      ${isJustSaved ? `<span style="font-size: 0.74rem; background: #E8F5E9; border: 1px solid #A5D6A7; color: #1B5E20; padding: 0.1rem 0.45rem; border-radius: 3px; font-weight: 700;">✨ Vừa lưu</span>` : ''}
                      <span style="font-family: monospace; font-weight: 700; background: #FFF3E0; border: 1px solid #FFE0B2; color: #BF360C; padding: 0.12rem 0.5rem; border-radius: 3px; font-size: 0.82rem;">🏷️ Mã đề: ${escapeHtml(examCode)}</span>
                      <span style="font-family: monospace; font-weight: 700; background: var(--burgundy); color: #fff; padding: 0.12rem 0.45rem; border-radius: 3px; font-size: 0.78rem;">${escapeHtml(post.code)}</span>
                      <span style="font-size: 0.76rem; background: var(--ivory); border: 1px solid var(--gold); color: var(--burgundy); padding: 0.12rem 0.45rem; border-radius: 3px; font-weight: 600;">Khối ${escapeHtml(post.grade)}</span>
                      ${isTeacher
                        ? `<span style="font-size: 0.74rem; background: #E8F5E9; border: 1px solid #C8E6C9; color: #2E7D32; padding: 0.1rem 0.45rem; border-radius: 3px; font-weight: 600;">✍️ Giáo viên đăng</span>`
                        : `<span style="font-size: 0.74rem; background: #EDE7F6; border: 1px solid #D1C4E9; color: #512DA8; padding: 0.1rem 0.45rem; border-radius: 3px; font-weight: 600;">🏛️ Hệ thống</span>`
                    }
                      ${post.createdAt ? `<span style="font-size: 0.75rem; color: var(--ink-muted);">📅 ${escapeHtml(post.createdAt)}</span>` : ""}
                    </div>
                    <h4 style="margin: 0.2rem 0 0.35rem 0; font-size: 1.02rem; color: var(--burgundy); font-family: var(--font-serif);">${escapeHtml(post.lesson)}</h4>
                    <div style="font-size: 0.82rem; color: var(--ink-muted); display: flex; gap: 0.85rem; flex-wrap: wrap;">
                      <span>👤 ${isTeacher ? `Biên soạn: <strong style="color:var(--ink);">${escapeHtml(post.author || 'Giáo viên')}</strong> (${escapeHtml(post.school || 'THPT')})` : `Nguồn: <strong>${escapeHtml(post.sources || 'SGK Lịch sử')}</strong>`}</span>
                      <span>📄 Tệp đính kèm: ${hasFile ? `<strong style="color: #2E7D32;">${escapeHtml(post.fileName || 'KichBan')}</strong> ${sizeKb ? `(${sizeKb} KB)` : ''}` : '<span style="color: #2E7D32; font-weight: 600;">Sẵn sàng xuất các định dạng</span>'}</span>
                    </div>
                  </div>
                </div>

                <div style="display: flex; gap: 0.45rem; align-items: center; flex-wrap: wrap;">
                  <button type="button" class="btn-secondary" style="font-size: 0.78rem; padding: 0.35rem 0.65rem; color: #0D47A1; border-color: #90CAF9; background: #E3F2FD; font-weight: 600;" onclick="openDetailModal('${escapeHtml(post.code)}', true)">
                    👁️ Xem
                  </button>
                  ${hasFile
                    ? `<button type="button" class="btn-secondary" style="font-size: 0.78rem; padding: 0.35rem 0.65rem; color: #1B5E20; border-color: #81C784; background: #E8F5E9; font-weight: 700;" onclick="exportLessonOriginalFile(catalogData.find(i=>i.code==='${escapeHtml(post.code)}'))" title="Tải đúng tệp đã tải lên (${escapeHtml(post.fileName || 'tệp gốc')})">
                        ⬇️ Tải ${escapeHtml(post.fileName || 'tệp')}
                       </button>
                       <button type="button" class="btn-secondary" style="font-size: 0.78rem; padding: 0.35rem 0.5rem; color: var(--ink-muted);" onclick="downloadTeacherWordFile('${escapeHtml(post.code)}')" title="Tùy chọn xuất định dạng khác">
                        ⚙️ Đổi dạng
                       </button>`
                    : `<button type="button" class="btn-secondary" style="font-size: 0.78rem; padding: 0.35rem 0.65rem; color: #1B5E20; border-color: #81C784; background: #E8F5E9; font-weight: 600;" onclick="downloadTeacherWordFile('${escapeHtml(post.code)}')">
                        ⬇️ Tải về
                       </button>`
                  }
                  <button type="button" class="btn-secondary" style="font-size: 0.78rem; padding: 0.35rem 0.65rem; color: var(--burgundy); border-color: var(--gold); font-weight: 600;" onclick="openTeacherPostModal('${escapeHtml(post.code)}')">
                    ✏️ Sửa
                  </button>
                  <button type="button" class="btn-secondary" style="font-size: 0.78rem; padding: 0.35rem 0.65rem; color: #C62828; border-color: #E57373; background: #FFF5F5; font-weight: 700;" onclick="deleteTeacherPost('${escapeHtml(post.code)}')">
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            `;
            }).join("")}
        </div>
      `;

            updateManageSelectionUI();
        }

        // ==========================================
        // MỞ / ĐÓNG & LÀM MỚI FORM ĐĂNG BÀI GIÁO VIÊN
        // ==========================================
        function resetTeacherPostForm() {
            const form = document.getElementById("teacherPostForm");
            if (form && typeof form.reset === "function") {
                form.reset();
            }
            clearTeacherSelectedFile();

            const editCodeEl = document.getElementById("teacherEditCode");
            if (editCodeEl) editCodeEl.value = "";

            const headingEl = document.getElementById("teacherModalHeading");
            if (headingEl) headingEl.textContent = "✍️ Tải lên Kịch bản & File Word Hoạt cảnh";

            const btnDeleteCurrent = document.getElementById("btnDeleteCurrentEdit");
            if (btnDeleteCurrent) btnDeleteCurrent.style.display = "none";

            // Tự động điền lại tên Thầy/Cô và Trường học từ phiên lưu gần nhất
            try {
                const savedAuthor = localStorage.getItem("situation_last_teacher_author") || "";
                const savedSchool = localStorage.getItem("situation_last_teacher_school") || "";
                const authorInput = document.getElementById("teacherAuthor");
                const schoolInput = document.getElementById("teacherSchool");
                if (savedAuthor && authorInput && !authorInput.value.trim()) {
                    authorInput.value = savedAuthor;
                }
                if (savedSchool && schoolInput && !schoolInput.value.trim()) {
                    schoolInput.value = savedSchool;
                }
            } catch (e) { }

            autoGenerateTeacherExamCode();
        }

        function openTeacherPostModal(codeToEdit = "") {
            // Bắt buộc phải qua bước nhập mã khóa bảo mật
            if (!isTeacherAuthenticated || !sessionTeacherKey || !TEACHER_AUTH_KEYS[sessionTeacherKey]) {
                openTeacherAuthGate(codeToEdit);
                return;
            }

            const activeKeyInfo = TEACHER_AUTH_KEYS[sessionTeacherKey];
            const headerBadge = document.getElementById("teacherAuthHeaderBadge");
            if (headerBadge) {
                headerBadge.innerHTML = `🔑 Phiên làm việc Giáo viên • Quyền: <strong>${escapeHtml(activeKeyInfo.role)}</strong>`;
                headerBadge.style.color = activeKeyInfo.color;
                headerBadge.style.background = activeKeyInfo.bg;
                headerBadge.style.borderColor = activeKeyInfo.color;
            }

            const authKeyInput = document.getElementById("teacherAuthKey");
            if (authKeyInput) authKeyInput.value = sessionTeacherKey;

            const btnDeleteCurrent = document.getElementById("btnDeleteCurrentEdit");

            if (codeToEdit) {
                const item = catalogData.find(i => i.code === codeToEdit);
                if (item) {
                    document.getElementById("teacherModalHeading").textContent = "✏️ Cập nhật Kịch bản Word: " + item.code;
                    document.getElementById("teacherEditCode").value = item.code;
                    document.getElementById("teacherGrade").value = item.grade || "10";
                    document.getElementById("teacherTitle").value = item.lesson || "";
                    document.getElementById("teacherExamCode").value = item.examCode || getPostExamCode(item);
                    document.getElementById("teacherAuthor").value = item.author || "";
                    document.getElementById("teacherSchool").value = item.school || "";
                    document.getElementById("teacherSummary").value = item.scenario || item.focus || "";

                    if (item.fileName && item.fileData) {
                        document.getElementById("teacherFileBase64").value = item.fileData;
                        document.getElementById("teacherFileName").value = item.fileName;
                        document.getElementById("teacherFileSize").value = item.fileSize || 0;
                        document.getElementById("teacherFileType").value = item.fileType || "";
                        document.getElementById("teacherUploadPrompt").style.display = "none";
                        document.getElementById("teacherFileSelectedInfo").style.display = "block";
                        document.getElementById("teacherDisplayFileName").textContent = item.fileName;
                        document.getElementById("teacherDisplayFileSize").textContent = `${Math.round((item.fileSize || 0) / 1024)} KB • Đã lưu trong SQL`;
                    } else {
                        clearTeacherSelectedFile();
                    }

                    if (btnDeleteCurrent) btnDeleteCurrent.style.display = "inline-flex";

                    switchTeacherModalTab("upload");
                    document.getElementById("teacherPostModal").classList.add("open");
                    return;
                }
            }

            resetTeacherPostForm();
            if (btnDeleteCurrent) btnDeleteCurrent.style.display = "none";

            switchTeacherModalTab("upload");
            updateTeacherPostCountBadge();
            document.getElementById("teacherPostModal").classList.add("open");
        }

        function closeTeacherPostModal() {
            document.getElementById("teacherPostModal").classList.remove("open");
        }

        // ==========================================
        // LƯU BÀI ĐĂNG GIÁO VIÊN VÀO SQL
        // ==========================================
        function saveTeacherPost() {
            // 1. Kiểm tra xác thực phiên & mã khóa
            const authKey = (typeof window !== "undefined" && window.sessionTeacherKey) ? window.sessionTeacherKey : (sessionTeacherKey || (document.getElementById("teacherAuthKey") ? document.getElementById("teacherAuthKey").value.trim() : ""));
            const keyInfo = TEACHER_AUTH_KEYS[authKey];
            if (!keyInfo) {
                notifyTeacher({
                    title: "⛔ BẢO MẬT GIÁO VIÊN",
                    message: "Chưa xác thực mã khóa giáo viên! Vui lòng đăng nhập lại qua Cổng xác thực mã khóa.",
                    badge: "🔒",
                    fallbackAlert: "⛔ BẢO MẬT: Chưa xác thực mã khóa giáo viên!\n\nVui lòng đăng nhập lại qua Cổng xác thực mã khóa."
                });
                openTeacherAuthGate();
                return;
            }

            // 2. Thu thập dữ liệu form tinh gọn
            const editCode = document.getElementById("teacherEditCode").value.trim();
            const title = document.getElementById("teacherTitle").value.trim();
            const grade = document.getElementById("teacherGrade").value;
            const examCode = document.getElementById("teacherExamCode").value.trim() || autoGenerateTeacherExamCode();
            const author = document.getElementById("teacherAuthor").value.trim();
            const school = document.getElementById("teacherSchool").value.trim();
            const summary = document.getElementById("teacherSummary").value.trim();

            const fileBase64 = document.getElementById("teacherFileBase64").value;
            const fileName = document.getElementById("teacherFileName").value;
            const fileSize = parseInt(document.getElementById("teacherFileSize").value, 10) || 0;
            const fileType = document.getElementById("teacherFileType").value || "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

            if (!title || !author) {
                notifyTeacher({
                    title: "⚠️ THIẾU THÔNG TIN",
                    message: "Vui lòng điền tên bài học / chủ đề và tên Thầy/Cô biên soạn (*).",
                    badge: "⚠️",
                    fallbackAlert: "Vui lòng điền tên bài học / chủ đề và tên Thầy/Cô biên soạn (*)."
                });
                return;
            }

            // Ghi nhớ Tác giả và Trường để tự động điền lần sau
            try {
                if (author) localStorage.setItem("situation_last_teacher_author", author);
                if (school) localStorage.setItem("situation_last_teacher_school", school);
            } catch (e) { }

            // Hiệu ứng trạng thái nút đang lưu
            const submitBtn = document.getElementById("btnSubmitTeacherPost");
            let originalBtnHtml = "";
            if (submitBtn) {
                originalBtnHtml = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = "⏳ Đang lưu vào CSDL SQL...";
            }

            // 3. Tự sinh mã định danh nếu là bài đăng mới
            let code = editCode;
            if (!code) {
                const gradeItems = catalogData.filter(i => i.grade === grade && i.code.includes(".W"));
                let nextIndex = 1;
                gradeItems.forEach(i => {
                    const m = i.code.match(/\.W(\d+)/i);
                    if (m) {
                        const num = parseInt(m[1], 10);
                        if (num >= nextIndex) nextIndex = num + 1;
                    }
                });
                code = `${grade}.W${String(nextIndex).padStart(2, "0")}`;
            }

            const docId = `DOC-${code.replace(/[^A-Z0-9]/gi, "")}`;

            const fileExt = fileName ? fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase() : "";
            let postFormat = "Kịch bản Word";
            let docFormat = "DOCX";
            if (fileExt === "pdf") {
                postFormat = "Tài liệu PDF";
                docFormat = "PDF";
            } else if (fileExt === "doc") {
                postFormat = "Kịch bản Word (.doc)";
                docFormat = "DOC";
            } else if (fileExt === "docx") {
                postFormat = "Kịch bản Word (.docx)";
                docFormat = "DOCX";
            } else if (fileExt === "txt") {
                postFormat = "Văn bản Text (.txt)";
                docFormat = "TXT";
            }

            // 4. Tạo đối tượng bài đăng danh mục
            const postData = {
                code,
                grade,
                examCode: examCode,
                topic: `Kịch bản Hoạt cảnh Khối ${grade}`,
                lesson: title,
                scenario: summary || `Kịch bản hoạt cảnh chi tiết trong tệp đính kèm: ${fileName || 'Bản Word'}`,
                format: postFormat,
                focus: `Kịch bản (Mã đề: ${examCode}) do Thầy/Cô ${author} biên soạn, lưu trữ tệp ${fileExt ? fileExt.toUpperCase() : 'tài liệu'} (${fileName || 'nguyên bản'}) trong CSDL phục vụ giảng dạy.`,
                originType: "TEACHER_CONTRIBUTED",
                author,
                school: school || "Giáo viên Lịch sử THPT",
                createdAt: new Date().toISOString().slice(0, 10),
                authKeyUsed: authKey,
                authLevel: keyInfo.level,
                authRole: keyInfo.role,
                fileName: fileName || (fileBase64 ? `${code}_KichBan.${fileExt || 'docx'}` : ""),
                fileSize: fileSize,
                fileType: fileType,
                fileData: fileBase64,
                characters: [
                    { name: "Nhân vật trong kịch bản", type: "CREATIVE_REP", desc: `Xem chi tiết lời thoại và phân vai trong tệp đính kèm: ${fileName || 'Kịch bản'}` }
                ],
                relatedDocs: [docId],
                sources: `Biên soạn bởi Thầy/Cô ${author} (${school || "Giáo viên THPT"}) - Mã đề: ${examCode} - Xác thực quyền: ${keyInfo.role}`
            };

            // 5. Tạo đối tượng tài liệu lưu trữ & nạp vào RAG
            const docData = {
                id: docId,
                title: fileExt === "pdf" ? `Hồ sơ tài liệu PDF (${code}): ${title}` : `Hồ sơ kịch bản (${code}): ${title}`,
                code: code,
                grade: grade,
                examCode: examCode,
                format: docFormat,
                updatedAt: new Date().toISOString().slice(0, 10),
                source: `Biên soạn: ${author} (${school || "THPT"}) - Mã đề: ${examCode} - Mã xác thực: ${authKey}`,
                fileName: fileName,
                fileSize: fileSize,
                fileData: fileBase64,
                content: `MÃ BÀI HỌC: ${code}\nMÃ ĐỀ: ${examCode}\nTIÊU ĐỀ: ${title}\nKHỐI LỚP: ${grade}\nNGƯỜI BIÊN SOẠN: ${author} (${school || "Giáo viên Lịch sử THPT"})\nQUYỀN XÁC THỰC: ${keyInfo.level} (${keyInfo.role})\nTỆP ĐÍNH KÈM: ${fileName || "Không có tệp"} ${fileSize ? `(${Math.round(fileSize / 1024)} KB • ${fileExt.toUpperCase()})` : ""}\n\nTÓM TẮT & HƯỚNG DẪN HOẠT CẢNH:\n${summary || "Kịch bản chi tiết được lưu trữ trong tệp đính kèm. Giáo viên và học sinh có thể tải trực tiếp về máy tính từ CSDL."}`
            };

            // 6. Lưu trữ CSDL & Đồng bộ toàn diện 100% qua commitDatabaseMutation
            commitDatabaseMutation('TEACHER_POST_SAVED', {
                post: postData,
                doc: docData,
                author: postData.author,
                lesson: postData.lesson,
                code: postData.code
            });

            // Khôi phục trạng thái nút lưu
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml || "🚀 Tải lên & Lưu vào CSDL SQL";
            }

            // Ghi nhận mã vừa lưu để làm nổi bật trong danh sách
            _lastSavedPostCode = code;
            if (_lastSavedTimer) clearTimeout(_lastSavedTimer);
            _lastSavedTimer = setTimeout(() => { _lastSavedPostCode = null; }, 6000);

            // Thông báo lưu thành công không chặn luồng UI
            notifyTeacher({
                title: "🎉 ĐÃ LƯU BÀI ĐĂNG THÀNH CÔNG!",
                message: `Đã lưu "${code} (Mã đề: ${examCode}) - ${title}" (${fileName || postFormat}) vào CSDL SQL và đồng bộ tức thì.`,
                badge: "✍️",
                code: code,
                actionText: "👁️ Xem bài ngay",
                duration: 6000,
                fallbackAlert: `🎉 ĐÃ LƯU BÀI ĐĂNG THÀNH CÔNG!\n\n• Mã bài: ${code}\n• Mã đề: ${examCode}\n• Tiêu đề: ${title}\n• Giáo viên: ${author}\n• Định dạng: ${postFormat}\n• Tệp đính kèm: ${fileName || "Đã lưu trữ"}\n\nDữ liệu và tệp đã được lưu bền vững vào CSDL và đồng bộ tới toàn bộ hệ thống.`
            });

            // Reset form chuẩn bị bài mới
            resetTeacherPostForm();

            // Chuyển sang Tab 2: Quản lý bài đã đăng để giáo viên thấy ngay bài viết vừa lưu ở đầu bảng
            switchTeacherModalTab("manage");
        }

        // ==========================================
        // TÍNH NĂNG XÓA BÀI ĐĂNG GIÁO VIÊN
        // ==========================================
        function deleteCurrentEditingPost() {
            const code = document.getElementById("teacherEditCode") ? document.getElementById("teacherEditCode").value.trim() : "";
            if (!code) {
                notifyTeacher({
                    title: "⚠️ KHÔNG TÌM THẤY BÀI",
                    message: "Không tìm thấy mã bài đăng hiện tại để xóa.",
                    badge: "⚠️",
                    fallbackAlert: "Không tìm thấy mã bài đăng hiện tại để xóa."
                });
                return;
            }
            deleteTeacherPost(code);
        }

        // ==========================================
        // QUẢN LÝ DANH SÁCH MÃ ĐÃ XÓA (PERSISTENCE)
        // ==========================================
        function getDeletedCodes() {
            try {
                const list = JSON.parse(localStorage.getItem("situation_deleted_codes") || "[]");
                return Array.isArray(list) ? list : [];
            } catch (e) {
                return [];
            }
        }

        function addDeletedCode(code) {
            if (!code) return;
            try {
                const list = getDeletedCodes();
                if (!list.includes(code)) {
                    list.push(code);
                    localStorage.setItem("situation_deleted_codes", JSON.stringify(list));
                }
            } catch (e) { }
        }

        function addDeletedCodes(codes) {
            if (!Array.isArray(codes) || codes.length === 0) return;
            try {
                const list = getDeletedCodes();
                let changed = false;
                codes.forEach(code => {
                    if (code && !list.includes(code)) {
                        list.push(code);
                        changed = true;
                    }
                });
                if (changed) {
                    localStorage.setItem("situation_deleted_codes", JSON.stringify(list));
                }
            } catch (e) { }
        }

        function removeDeletedCode(code) {
            if (!code) return;
            try {
                const list = getDeletedCodes().filter(c => c !== code);
                localStorage.setItem("situation_deleted_codes", JSON.stringify(list));
            } catch (e) { }
        }

        function restoreDefaultData() {
            if (!isTeacherAuthenticated) {
                notifyTeacher({
                    title: "⚠️ BẢO MẬT GIÁO VIÊN",
                    message: "Vui lòng nhập mã khóa giáo viên trước khi khôi phục dữ liệu.",
                    badge: "🔒",
                    fallbackAlert: "⚠️ BẢO MẬT: Vui lòng nhập mã khóa giáo viên trước khi khôi phục dữ liệu."
                });
                openTeacherAuthGate();
                return;
            }

            if (!confirm("Thầy/Cô có chắc chắn muốn khôi phục lại toàn bộ 42 bài học chuẩn SGK và các hồ sơ tư liệu mặc định ban đầu đã từng bị xóa không?\n\n(Hệ thống sẽ dọn sạch danh sách mã đã xóa và khôi phục CSDL SQL trên toàn bộ các máy)")) {
                return;
            }

            commitDatabaseMutation('RESTORE_DEFAULT_DATA', {});

            notifyTeacher({
                title: "🔄 ĐÃ KHÔI PHỤC CSDL MẶC ĐỊNH",
                message: "Toàn bộ 42 bài học chuẩn SGK và tư liệu mặc định đã được khôi phục 100% trên toàn bộ hệ thống.",
                badge: "✅",
                duration: 5000,
                fallbackAlert: "✅ Đã khôi phục thành công toàn bộ 42 bài học và tư liệu mặc định! Dữ liệu đã đồng bộ 100% trên toàn bộ hệ thống."
            });
        }

        function deleteTeacherPost(code) {
            if (!isTeacherAuthenticated) {
                notifyTeacher({
                    title: "⚠️ BẢO MẬT GIÁO VIÊN",
                    message: "Vui lòng nhập mã khóa giáo viên trước khi thực hiện xóa bài.",
                    badge: "🔒",
                    fallbackAlert: "⚠️ BẢO MẬT: Vui lòng nhập mã khóa giáo viên trước khi thực hiện xóa bài."
                });
                openTeacherAuthGate();
                return;
            }

            const item = catalogData.find(i => i.code === code) || (window.SituationDB ? window.SituationDB.catalog.find(i => i.code === code) : null);
            const title = item ? item.lesson : code;
            const examCode = item ? getPostExamCode(item) : "";

            if (!confirm(`⚠️ XÁC NHẬN XÓA BÀI ĐĂNG:\n\nThầy/Cô có chắc chắn muốn xóa bài:\n"${code} (Mã đề: ${examCode}) - ${title}"\ncùng tệp Word đính kèm khỏi Cơ sở dữ liệu SQL không?\n\n(Hành động này sẽ xóa dữ liệu vĩnh viễn khỏi CSDL SQL và hệ thống)`)) {
                return;
            }

            // Lưu trữ bài vừa xóa để hỗ trợ HOÀN TÁC (Undo)
            if (item) {
                const relatedDoc = documentStore.find(d => d.code === code || d.id === `DOC-${code.replace(/[^A-Z0-9]/gi, "")}`);
                _lastDeletedTeacherItem = {
                    post: JSON.parse(JSON.stringify(item)),
                    doc: relatedDoc ? JSON.parse(JSON.stringify(relatedDoc)) : null
                };
            }

            // Hiệu ứng mờ dần mượt mà trên DOM trước khi xóa
            const rowEl = document.querySelector(`[data-manage-code="${code}"]`);
            if (rowEl) {
                rowEl.style.transition = "all 0.25s ease-out";
                rowEl.style.opacity = "0";
                rowEl.style.transform = "translateX(25px)";
            }

            // Thực hiện biến đổi dữ liệu & đồng bộ toàn diện 100%
            commitDatabaseMutation('TEACHER_POST_DELETED', { code });

            // Reset form nếu bài đang sửa vừa bị xóa
            const editCode = document.getElementById("teacherEditCode") ? document.getElementById("teacherEditCode").value.trim() : "";
            if (editCode === code) {
                resetTeacherPostForm();
                switchTeacherModalTab("manage");
            }

            notifyTeacher({
                title: "🗑️ ĐÃ XÓA BÀI ĐĂNG",
                message: `Đã xóa bài "${code} (Mã đề: ${examCode}) - ${title}".`,
                badge: "🗑️",
                actionText: "↩️ Hoàn tác",
                onAction: undoLastDeletedPost,
                duration: 8000,
                fallbackAlert: `✅ Đã xóa thành công bài đăng "${code}" (Mã đề: ${examCode}) và tệp Word khỏi CSDL SQL.`
            });
        }

        function undoLastDeletedPost() {
            if (!_lastDeletedTeacherItem || !_lastDeletedTeacherItem.post) {
                notifyTeacher({
                    title: "ℹ️ KHÔNG THỂ HOÀN TÁC",
                    message: "Không tìm thấy dữ liệu bài đăng vừa xóa để khôi phục.",
                    badge: "ℹ️",
                    duration: 3000
                });
                return;
            }
            const postToRestore = _lastDeletedTeacherItem.post;
            const docToRestore = _lastDeletedTeacherItem.doc;
            _lastDeletedTeacherItem = null;

            removeDeletedCode(postToRestore.code);

            commitDatabaseMutation('TEACHER_POST_SAVED', {
                post: postToRestore,
                doc: docToRestore,
                author: postToRestore.author,
                lesson: postToRestore.lesson,
                code: postToRestore.code
            });

            _lastSavedPostCode = postToRestore.code;

            notifyTeacher({
                title: "↩️ ĐÃ KHÔI PHỤC BÀI ĐĂNG!",
                message: `Đã hoàn tác khôi phục bài "${postToRestore.code} - ${postToRestore.lesson}".`,
                badge: "✅",
                code: postToRestore.code,
                actionText: "👁️ Xem bài ngay",
                duration: 5000,
                fallbackAlert: `✅ Đã khôi phục bài "${postToRestore.code} - ${postToRestore.lesson}".`
            });
            renderTeacherPostsManageList();
        }

        function saveTeacherPostsToStorage() { 
            try {
                const teacherPosts = catalogData.filter(i => i.originType === "TEACHER_CONTRIBUTED");
                localStorage.setItem("situation_teacher_posts", JSON.stringify(teacherPosts));

                const teacherDocs = documentStore.filter(d => teacherPosts.some(p => p.code === d.code));
                localStorage.setItem("situation_teacher_docs", JSON.stringify(teacherDocs));

                // Lưu trữ cả các tài liệu tự thêm ngoài SGK
                const customDocs = documentStore.filter(d => !teacherDocs.some(td => td.id === d.id) && !d.id.startsWith("DOC-10") && !d.id.startsWith("DOC-11") && !d.id.startsWith("DOC-12"));
                localStorage.setItem("situation_custom_docs", JSON.stringify(customDocs));
            } catch (e) {
                console.warn("Lỗi lưu trữ bài đăng vào localStorage:", e);
            }
        }

        function loadSavedTeacherPosts() {
            try {
                // Luôn khôi phục từ tập dữ liệu chuẩn SGK gốc ban đầu trước khi phủ lớp dữ liệu giáo viên & lọc bài đã xóa
                const seedCatalog = (typeof window !== "undefined" && window.INITIAL_CATALOG_DATA) ? window.INITIAL_CATALOG_DATA : (typeof INITIAL_CATALOG_DATA !== "undefined" ? INITIAL_CATALOG_DATA : null);
                if (seedCatalog && Array.isArray(seedCatalog)) {
                    catalogData = JSON.parse(JSON.stringify(seedCatalog));
                }
                const seedDocs = (typeof window !== "undefined" && window.INITIAL_DOCUMENTS_DATA) ? window.INITIAL_DOCUMENTS_DATA : (typeof INITIAL_DOCUMENTS_DATA !== "undefined" ? INITIAL_DOCUMENTS_DATA : null);
                if (seedDocs && Array.isArray(seedDocs)) {
                    documentStore = JSON.parse(JSON.stringify(seedDocs));
                }

                // Lọc bỏ tất cả bài và tài liệu nằm trong danh sách đã xóa
                const deletedCodes = getDeletedCodes();
                if (deletedCodes.length > 0) {
                    catalogData = catalogData.filter(i => !deletedCodes.includes(i.code));
                    documentStore = documentStore.filter(d => !deletedCodes.includes(d.code) && !deletedCodes.some(dc => d.id === `DOC-${dc.replace(/[^A-Z0-9]/gi, "")}`));
                }

                const savedPostsJson = localStorage.getItem("situation_teacher_posts");
                if (savedPostsJson) {
                    const savedPosts = JSON.parse(savedPostsJson);
                    if (Array.isArray(savedPosts)) {
                        savedPosts.forEach(post => {
                            if (!deletedCodes.includes(post.code)) {
                                const idx = catalogData.findIndex(i => i.code === post.code);
                                if (idx >= 0) catalogData[idx] = post;
                                else catalogData.unshift(post);
                            }
                        });
                    }
                }

                const savedDocsJson = localStorage.getItem("situation_teacher_docs");
                if (savedDocsJson) {
                    const savedDocs = JSON.parse(savedDocsJson);
                    if (Array.isArray(savedDocs)) {
                        savedDocs.forEach(doc => {
                            const isDocDeleted = deletedCodes.includes(doc.code) || deletedCodes.some(dc => doc.id === `DOC-${dc.replace(/[^A-Z0-9]/gi, "")}`);
                            if (!isDocDeleted) {
                                const idx = documentStore.findIndex(d => d.id === doc.id);
                                if (idx >= 0) documentStore[idx] = doc;
                                else documentStore.unshift(doc);
                            }
                        });
                    }
                }

                const savedCustomDocsJson = localStorage.getItem("situation_custom_docs");
                if (savedCustomDocsJson) {
                    const savedCustom = JSON.parse(savedCustomDocsJson);
                    if (Array.isArray(savedCustom)) {
                        savedCustom.forEach(doc => {
                            const isDocDeleted = deletedCodes.includes(doc.code) || deletedCodes.some(dc => doc.id === `DOC-${dc.replace(/[^A-Z0-9]/gi, "")}`);
                            if (!isDocDeleted) {
                                const idx = documentStore.findIndex(d => d.id === doc.id);
                                if (idx >= 0) documentStore[idx] = doc;
                                else documentStore.unshift(doc);
                            }
                        });
                    }
                }

                if (typeof window !== "undefined") {
                    window.catalogData = catalogData;
                    window.documentStore = documentStore;
                }
                updateTeacherPostCountBadge();
            } catch (e) {
                console.warn("Lỗi đọc bài đăng từ localStorage:", e);
            }
        }

        

        function updateTeacherSubmissionsCountBadge() {
            const badge = document.getElementById("teacherSubmissionsCountBadge");
            if (badge && typeof studentSubmissions !== "undefined") {
                badge.textContent = studentSubmissions.length;
            }
        }

        function renderTeacherSubmissionsList() {
            const container = document.getElementById("teacherSubmissionsListContainer");
            updateTeacherSubmissionsCountBadge();
            if (!container || typeof studentSubmissions === "undefined") return;

            const filterStatus = document.getElementById("teacherSubmissionFilter")?.value || "ALL";
            let subs = [...studentSubmissions];
            if (filterStatus === "PENDING") {
                subs = subs.filter(s => s.status !== "GRADED");
            } else if (filterStatus === "GRADED") {
                subs = subs.filter(s => s.status === "GRADED");
            }

            if (subs.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 2.5rem 1rem; background: var(--ivory); border: 1px dashed var(--border); border-radius: 4px;">
                        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📬</div>
                        <h4 style="color: var(--burgundy); margin-bottom: 0.35rem; font-family: var(--font-serif); font-size: 1.15rem;">Chưa có bài nộp nào từ Học sinh</h4>
                        <p style="font-size: 0.85rem; color: var(--ink-muted); max-width: 440px; margin: 0 auto; line-height: 1.5;">
                            Khi học sinh mở các bài học kịch bản và gửi bài phân vai, toàn bộ bài nộp sẽ xuất hiện tại đây theo thời gian thực để Thầy/Cô chấm điểm.
                        </p>
                    </div>
                `;
                return;
            }

            container.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                    ${subs.map(sub => `
                        <div style="background: #fff; border: 1px solid var(--border); border-left: 4px solid ${sub.status === 'GRADED' ? '#2E7D32' : '#FF9800'}; padding: 0.85rem 1rem; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem; flex-wrap: wrap; gap: 0.5rem;">
                                <div>
                                    <div style="display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap; margin-bottom: 0.25rem;">
                                        <span style="font-family: monospace; font-weight: 700; background: var(--burgundy); color: #fff; padding: 0.1rem 0.4rem; border-radius: 3px; font-size: 0.76rem;">${escapeHtml(sub.postCode)}</span>
                                        <strong style="color: var(--burgundy); font-size: 1rem;">${escapeHtml(sub.lessonTitle || sub.postCode)}</strong>
                                        <span style="font-size: 0.76rem; background: #EDE7F6; color: #512DA8; padding: 0.1rem 0.45rem; border-radius: 3px; font-weight: 600;">Vai: ${escapeHtml(sub.roleName)}</span>
                                    </div>
                                    <div style="font-size: 0.85rem; color: #333;">
                                        👤 Học sinh / Nhóm: <strong>${escapeHtml(sub.studentName)}</strong>
                                        <span style="font-size: 0.78rem; color: var(--ink-muted); margin-left: 0.5rem;">📅 Nộp lúc: ${escapeHtml(sub.submittedAt)}</span>
                                    </div>
                                </div>
                                <div>
                                    ${sub.status === 'GRADED'
                                        ? `<span style="font-size: 0.8rem; background: #E8F5E9; color: #2E7D32; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 3px;">✅ Đã chấm: ${escapeHtml(sub.teacherGrade)}</span>`
                                        : `<span style="font-size: 0.8rem; background: #FFF3E0; color: #E65100; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 3px;">⏳ Chờ chấm điểm</span>`
                                    }
                                </div>
                            </div>

                            <div style="background: var(--ivory); border: 1px solid var(--border); border-radius: 3px; padding: 0.65rem 0.85rem; font-size: 0.88rem; color: #1a1a1a; margin-bottom: 0.65rem; white-space: pre-wrap; max-height: 140px; overflow-y: auto;">
                                ${escapeHtml(sub.content)}
                            </div>

                            <div style="background: #F9FBE7; border: 1px dashed #C0CA33; border-radius: 4px; padding: 0.65rem 0.85rem;">
                                <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin-bottom: 0.45rem;">
                                    <label style="font-weight: 700; font-size: 0.82rem; color: #33691E;">Nhập điểm:</label>
                                    <input type="text" id="gradeInput_${sub.id}" value="${escapeHtml(sub.teacherGrade || '')}" placeholder="VD: 9.5 / 10" style="width: 110px; padding: 0.25rem 0.5rem; font-size: 0.85rem; border: 1px solid #C0CA33; border-radius: 3px;">
                                </div>
                                <div style="margin-bottom: 0.45rem;">
                                    <textarea id="feedbackInput_${sub.id}" rows="2" placeholder="Nhận xét của Giáo viên..." style="width: 100%; box-sizing: border-box; font-size: 0.84rem; padding: 0.35rem 0.5rem; border: 1px solid #C0CA33; border-radius: 3px; font-family: inherit;">${escapeHtml(sub.teacherFeedback || '')}</textarea>
                                </div>
                                <div style="display: flex; justify-content: flex-end;">
                                    <button type="button" class="btn-primary" style="background: #33691E; border-color: #1B5E20; font-size: 0.82rem; padding: 0.3rem 0.85rem; cursor: pointer;" onclick="submitTeacherFeedback('${sub.id}')">
                                        💾 Lưu Điểm & Nhận xét (Đồng bộ tức thì)
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join("")}
                </div>
            `;
        }

        function submitTeacherFeedback(subId) {
            const sub = (typeof studentSubmissions !== "undefined") ? studentSubmissions.find(s => s.id === subId) : null;
            if (!sub) return;

            const gradeInput = document.getElementById(`gradeInput_${subId}`);
            const fbInput = document.getElementById(`feedbackInput_${subId}`);

            const grade = gradeInput ? gradeInput.value.trim() : "";
            const feedback = fbInput ? fbInput.value.trim() : "";

            if (!grade) {
                alert("Vui lòng nhập điểm số cho bài làm của học sinh.");
                return;
            }

            sub.teacherGrade = grade;
            sub.teacherFeedback = feedback;
            sub.status = "GRADED";
            sub.feedbackAt = new Date().toLocaleString("vi-VN");
            sub.feedbackAuthor = (TEACHER_AUTH_KEYS[sessionTeacherKey]?.role) || "Giáo viên Bộ môn Lịch sử";

            if (typeof commitDatabaseMutation === 'function') {
                commitDatabaseMutation("TEACHER_FEEDBACK_SAVED", sub);
            }

            alert(`✅ ĐÃ LƯU VÀ PHẢN HỒI BÀI LÀM!\n\n• Học sinh / Nhóm: ${sub.studentName}\n• Điểm: ${grade}\n\nĐiểm số và lời phê đã được gửi trực tiếp tới máy của Học sinh theo thời gian thực.`);
            renderTeacherSubmissionsList();
        }

        function toggleSelectManagePost(code, isChecked) {
            toggleManagePostSelection(code, isChecked);
        }

        function deleteSelectedTeacherPosts() {
            deleteSelectedManagePosts();
        }

        function saveTeacherDocsToStorage() {
            saveTeacherPostsToStorage();
        }

if (typeof window !== "undefined") {
    window.TEACHER_AUTH_KEYS = TEACHER_AUTH_KEYS;
    window.isTeacherAuthenticated = isTeacherAuthenticated;
    window.sessionTeacherKey = sessionTeacherKey;
    window.getTeacherAuthState = getTeacherAuthState;
    window.openTeacherAuthGate = openTeacherAuthGate;
    window.closeTeacherAuthGate = closeTeacherAuthGate;
    window.toggleGateKeyVisibility = toggleGateKeyVisibility;
    window.checkGateKeyInput = checkGateKeyInput;
    window.submitTeacherAuthGate = submitTeacherAuthGate;
    window.lockTeacherSession = lockTeacherSession;
    window.fillTeacherKey = fillTeacherKey;
    window.checkTeacherKeyInput = checkTeacherKeyInput;
    window.processUploadedFile = processUploadedFile;
    window.handleTeacherFileSelect = handleTeacherFileSelect;
    window.handleTeacherDragOver = handleTeacherDragOver;
    window.handleTeacherDragLeave = handleTeacherDragLeave;
    window.handleTeacherDrop = handleTeacherDrop;
    window.clearTeacherSelectedFile = clearTeacherSelectedFile;
    window.generateAndDownloadWordDocument = generateAndDownloadWordDocument;
    window.resolveLessonItem = resolveLessonItem;
    window.exportLessonToFormat = exportLessonToFormat;
    window.downloadDirectItem = downloadDirectItem;
    window.exportLessonOriginalFile = exportLessonOriginalFile;
    window.downloadTeacherWordFile = downloadTeacherWordFile;
    window.executeDownloadSelectedFormat = executeDownloadSelectedFormat;
    window.previewCurrentDownloadTargetFile = previewCurrentDownloadTargetFile;
    window.openDownloadFormatModal = openDownloadFormatModal;
    window.closeDownloadFormatModal = closeDownloadFormatModal;
    window.exportLessonAsDocx = exportLessonAsDocx;
    window.exportLessonAsPlainText = exportLessonAsPlainText;
    window.exportLessonAsStandaloneHtml = exportLessonAsStandaloneHtml;
    window.printLessonPdfDocument = printLessonPdfDocument;
    window.exportDocStoreAsDoc = exportDocStoreAsDoc;
    window.exportDocStoreAsDocx = exportDocStoreAsDocx;
    window.printDocStorePdfDocument = printDocStorePdfDocument;
    window.exportDocStoreAsPlainText = exportDocStoreAsPlainText;
    window.exportDocStoreAsStandaloneHtml = exportDocStoreAsStandaloneHtml;
    window.exportDocStoreOriginalFile = exportDocStoreOriginalFile;
    window.openTeacherPostModal = openTeacherPostModal;
    window.closeTeacherPostModal = closeTeacherPostModal;
    window.switchTeacherModalTab = switchTeacherModalTab;
    window.autoGenerateTeacherExamCode = autoGenerateTeacherExamCode;
    window.saveTeacherPost = saveTeacherPost;
    window.deleteTeacherPost = deleteTeacherPost;
    window.deleteCurrentFilteredGradePosts = deleteCurrentFilteredGradePosts;
    window.renderTeacherPostsManageList = renderTeacherPostsManageList;
    window.toggleSelectAllManagePosts = toggleSelectAllManagePosts;
    window.toggleManagePostSelection = toggleManagePostSelection;
    window.toggleSelectManagePost = toggleSelectManagePost;
    window.deleteSelectedManagePosts = deleteSelectedManagePosts;
    window.deleteSelectedTeacherPosts = deleteSelectedTeacherPosts;
    window.renderTeacherSubmissionsList = renderTeacherSubmissionsList;
    window.submitTeacherFeedback = submitTeacherFeedback;
    window.loadSavedTeacherPosts = loadSavedTeacherPosts;
    window.saveTeacherPostsToStorage = saveTeacherPostsToStorage;
    window.saveTeacherDocsToStorage = saveTeacherDocsToStorage;
    window.updateTeacherPostCountBadge = updateTeacherPostCountBadge;
    window.updateTeacherSubmissionsCountBadge = updateTeacherSubmissionsCountBadge;
    window.toggleDrumRotation = toggleDrumRotation;
    window.toggleDetailInlinePreview = toggleDetailInlinePreview;
    window.viewUploadedItemFile = viewUploadedItemFile;
    window.onTeacherGradeChange = onTeacherGradeChange;
    window.deleteCurrentEditingPost = deleteCurrentEditingPost;
    window.restoreDefaultData = restoreDefaultData;
    window.resetTeacherPostForm = resetTeacherPostForm;
    window.undoLastDeletedPost = undoLastDeletedPost;
    window.undoLastBatchDeletedPosts = undoLastBatchDeletedPosts;
    window.notifyTeacher = notifyTeacher;
    window.openDocDownloadFormatModal = openDocDownloadFormatModal;
    window.getPostExamCode = getPostExamCode;
    window.fillGateKey = fillGateKey;
}
