/**
 * ====================================================================
 * SITUATION APPLICATION UI, NAVIGATION & RAG CHATBOT (js/app.js)
 * ====================================================================
 * Điều hướng trang (switchPage), hiển thị danh mục, bộ lọc,
 * hộp thoại chi tiết, phân vai học sinh, kho tài liệu và Chatbot AI.
 */

function resolveToastBadgeIcon(badge, type = "info") {
            const b = String(badge || "").trim();
            if (b.includes("<svg")) return b;
            const badgeMap = {
                "✅": "check",
                "⚠️": "warning",
                "🔔": "sparkle",
                "☆": "star",
                "⭐": "star",
                "👨‍🏫": "teacher",
                "🗑️": "trash",
                "ℹ️": "info",
                "📁": "folder",
                "📚": "book",
                "🎓": "cap",
                "🏆": "crown",
                "🔄": "refresh",
                "🏫": "temple",
                "✍️": "quill",
                "❌": "close",
                "🔒": "lock",
                "⛔": "lock"
            };
            const iconName = badgeMap[b] || (type === "success" ? "check" : (type === "warning" || type === "error" ? "warning" : "sparkle"));
            return typeof stIcon === "function" ? stIcon(iconName, 24) : b;
        }

        function renderTextWithCustomIcons(text, size = 14) {
            if (!text) return "";
            let safe = escapeHtml(text);
            if (typeof stIcon !== "function") return safe;
            const map = {
                "↩️": stIcon("undo", size),
                "👁️": stIcon("eye", size),
                "👁": stIcon("eye", size),
                "⬇️": stIcon("download", size),
                "⬇": stIcon("download", size),
                "🔔": stIcon("sparkle", size),
                "🗑️": stIcon("trash", size),
                "🗑": stIcon("trash", size),
                "📁": stIcon("folder", size),
                "📬": stIcon("inbox", size),
                "⭐": stIcon("star", size),
                "☆": stIcon("star", size),
                "🔄": stIcon("refresh", size),
                "🌐": stIcon("globe", size),
                "📦": stIcon("database", size),
                "🎉": stIcon("sparkle", size),
                "⚠️": stIcon("warning", size),
                "⛔": stIcon("lock", size),
                "❌": stIcon("close", size),
                "ℹ️": stIcon("info", size),
                "📝": stIcon("quill", size),
                "📖": stIcon("book", size),
                "👑": stIcon("crown", size)
            };
            for (const [emo, svg] of Object.entries(map)) {
                if (safe.includes(emo)) {
                    safe = safe.split(emo).join(svg);
                }
            }
            return safe;
        }

function showSituationToast(optionsOrMsg, type = "info") {
            let title, message, badge, code, actionText, onAction, duration = 8000;
            if (typeof optionsOrMsg === "string") {
                message = optionsOrMsg;
                if (type === "success") {
                    title = "Thao tác thành công";
                    badge = "✅";
                } else if (type === "warning" || type === "error") {
                    title = "Cảnh báo hệ thống";
                    badge = "⚠️";
                } else {
                    title = "Thông báo hệ thống";
                    badge = "🔔";
                }
                duration = 4500;
            } else if (optionsOrMsg && typeof optionsOrMsg === "object") {
                ({ title, message, badge, code, actionText, onAction, duration = 8000 } = optionsOrMsg);
            } else {
                return;
            }

            const container = document.getElementById("situationToastContainer");
            if (!container || typeof container.appendChild !== "function") return;

            const toastId = "toast_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
            const toastEl = document.createElement("div");
            toastEl.id = toastId;
            toastEl.className = "situation-toast";

            const badgeSvg = resolveToastBadgeIcon(badge, type);
            const closeSvg = typeof stIcon === "function" ? stIcon("close", 15) : "✕";

            toastEl.innerHTML = `
                <div style="color: var(--gold-light); flex-shrink: 0; line-height: 1; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; background: rgba(212,175,55,0.14); border: 1px solid rgba(212,175,55,0.35); border-radius: 8px;">${badgeSvg}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 700; color: var(--gold-light); font-size: 0.95rem; margin-bottom: 0.2rem; display: flex; align-items: center; justify-content: space-between;">
                        <span style="display: inline-flex; align-items: center; gap: 0.35rem;">${renderTextWithCustomIcons(title || 'Thông báo mới', 15)}</span>
                    </div>
                    <div style="font-size: 0.85rem; color: #E0E0E0; line-height: 1.45; margin-bottom: 0.55rem;">
                        ${renderTextWithCustomIcons(message || '', 14)}
                    </div>
                    ${actionText ? `
                        <button type="button" class="btn-primary" style="background: var(--gold); color: #1B0E07; font-size: 0.78rem; font-weight: 800; padding: 0.25rem 0.75rem; border-color: #FFF; cursor: pointer;" id="toastActionBtn_${toastId}">
                            ${renderTextWithCustomIcons(actionText, 14)}
                        </button>
                    ` : ''}
                </div>
                <button type="button" style="background: transparent; border: none; color: #AAA; font-size: 1.1rem; cursor: pointer; padding: 0 0.2rem; line-height: 1;" onclick="dismissSituationToast('${toastId}')" title="Đóng">${closeSvg}</button>
            `;

            container.appendChild(toastEl);

            if (actionText) {
                const btn = document.getElementById(`toastActionBtn_${toastId}`);
                if (btn) {
                    const handleAction = () => {
                        dismissSituationToast(toastId);
                        if (typeof onAction === "function") {
                            onAction();
                        } else if (code) {
                            openDetailModal(code, true);
                        }
                    };
                    if (typeof btn.addEventListener === "function") {
                        btn.addEventListener("click", handleAction);
                    } else {
                        btn.onclick = handleAction;
                    }
                }
            }

            if (duration > 0) {
                setTimeout(() => dismissSituationToast(toastId), duration);
            }
        }

        function dismissSituationToast(toastId) {
            const el = document.getElementById(toastId);
            if (!el) return;
            el.style.animation = "toastFadeOut 0.3s forwards";
            setTimeout(() => { if (el && el.parentNode) el.parentNode.removeChild(el); }, 300);
        }

        // --- TƯƠNG TÁC HỌC SINH: PHÂN VAI & NỘP KỊCH BẢN ---
        function getSubmissionsForPost(postCode) {
            return studentSubmissions.filter(s => s.postCode === postCode);
        }

        function renderStudentInteractionHub(item) {
            const isBookmarked = isItemBookmarked(item.code);
            const submissions = getSubmissionsForPost(item.code);

            const charsOptions = (item.characters && item.characters.length > 0)
                ? item.characters.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)} (${c.type === 'HISTORICAL_FACT' ? 'Lịch sử' : 'Sáng tạo'})</option>`).join("")
                : `<option value="Vai kịch bản">Nhân vật kịch bản</option>`;

            let pastSubmissionsHtml = "";
            if (submissions.length > 0) {
                pastSubmissionsHtml = `
                    <div style="margin-top: 1rem; border-top: 1px dashed var(--border); padding-top: 0.85rem;">
                        <h5 style="margin: 0 0 0.5rem 0; color: #33691E; font-size: 0.9rem;">${stIcon('scroll', 15)} Danh sách kịch bản phân vai các nhóm đã nộp cho bài này (${submissions.length}):</h5>
                        <div style="display: flex; flex-direction: column; gap: 0.65rem;">
                            ${submissions.map(sub => `
                                <div style="background: #fff; border: 1px solid var(--border); border-radius: 4px; padding: 0.75rem 0.95rem; border-left: 4px solid ${sub.status === 'GRADED' ? '#2E7D32' : '#FF9800'};">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; flex-wrap: wrap; gap: 0.4rem;">
                                        <div>
                                            <strong style="color: var(--burgundy); font-size: 0.92rem;">${stIcon('cap', 14)} ${escapeHtml(sub.studentName)}</strong>
                                            <span style="font-size: 0.8rem; background: #EDE7F6; color: #512DA8; padding: 0.1rem 0.45rem; border-radius: 3px; margin-left: 0.35rem;">Vai: ${escapeHtml(sub.roleName)}</span>
                                        </div>
                                        <div>
                                            ${sub.status === 'GRADED'
                                                ? `<span style="font-size: 0.78rem; background: #E8F5E9; color: #2E7D32; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 3px;">${stIcon('check', 13)} Thầy/Cô đã chấm: ${escapeHtml(sub.teacherGrade)}</span>`
                                                : `<span style="font-size: 0.78rem; background: #FFF3E0; color: #E65100; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 3px;">${stIcon('clock', 13)} Chờ Thầy/Cô nhận xét</span>`
                                            }
                                            <span style="font-size: 0.75rem; color: var(--ink-muted); margin-left: 0.4rem;">${stIcon('clock', 12)} ${escapeHtml(sub.submittedAt)}</span>
                                        </div>
                                    </div>
                                    <div style="font-size: 0.86rem; color: #333; line-height: 1.5; white-space: pre-wrap; background: #FAFAFA; border: 1px solid #EEE; padding: 0.5rem 0.75rem; border-radius: 3px; margin-bottom: 0.4rem;">${escapeHtml(sub.content)}</div>
                                    ${sub.teacherFeedback ? `
                                        <div style="background: #F1F8E9; border-left: 3px solid #689F38; padding: 0.5rem 0.75rem; border-radius: 3px; font-size: 0.84rem; color: #1B5E20; margin-top: 0.4rem;">
                                            <strong>${stIcon('quill', 14)} Lời phê của Thầy/Cô (${escapeHtml(sub.feedbackAuthor || item.author || "Giáo viên")}):</strong> ${escapeHtml(sub.teacherFeedback)}
                                            ${sub.feedbackAt ? `<div style="font-size: 0.74rem; color: #558B2F; margin-top: 0.15rem;">Ngày nhận xét: ${escapeHtml(sub.feedbackAt)}</div>` : ''}
                                        </div>
                                    ` : ''}
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `;
            }

            return `
        <div class="detail-box" style="margin-bottom: 1.25rem; background: #F9FBE7; border: 1.5px solid #C0CA33; border-left: 5px solid #689F38;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;">
            <h4 style="margin: 0; color: #33691E; font-size: 1.05rem; display: flex; align-items: center; gap: 0.4rem;">
              ${stIcon('mask', 18)} Không gian Tương tác Học sinh: Đăng ký Phân vai & Nộp Kịch bản nhóm
            </h4>
            <button type="button" class="btn-secondary" id="btnBookmarkItem_${item.code}" style="font-size: 0.8rem; padding: 0.25rem 0.65rem; border-color: #C0CA33; color: #33691E; background: #fff;" onclick="toggleStudentBookmark('${item.code}')">
              ${isBookmarked ? `${stIcon('star', 14)} Đã lưu vào Góc học tập` : `${stIcon('star', 14)} Lưu vào Góc học tập`}
            </button>
          </div>
          <p style="font-size: 0.85rem; color: #558B2F; margin-bottom: 0.85rem; line-height: 1.5;">
            Bài học này do <strong>${escapeHtml(item.author || "Giáo viên Lịch sử THPT")}</strong> biên soạn. Các nhóm học sinh hãy chọn phân vai, viết lời thoại sáng tạo và gửi trực tiếp cho Thầy/Cô. Bài nộp sẽ xuất hiện ngay tức thì trên Bàn làm việc của Thầy/Cô để chấm điểm và gửi lời phê!
          </p>

          <form id="studentWorkForm_${item.code}" onsubmit="event.preventDefault(); submitStudentWork('${item.code}');" style="background: #fff; border: 1px solid #DCE775; padding: 0.85rem 1rem; border-radius: 4px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.65rem;">
              <div class="field-group">
                <label style="font-size: 0.82rem; font-weight: 700; color: #33691E;">1. Chọn Vai diễn bạn muốn đảm nhận:</label>
                <select id="studentSubmissionRole_${item.code}" class="select-control" style="font-size: 0.85rem; padding: 0.4rem 0.65rem;">
                  ${charsOptions}
                </select>
              </div>
              <div class="field-group">
                <label style="font-size: 0.82rem; font-weight: 700; color: #33691E;">2. Tên Học sinh hoặc Nhóm (*):</label>
                <input type="text" id="studentSubmissionName_${item.code}" class="input-control" placeholder="VD: Nhóm 1 - Lớp 11A2 (Tuấn, Linh, Thảo)" required style="font-size: 0.85rem; padding: 0.4rem 0.65rem;" />
              </div>
            </div>
            <div class="field-group" style="margin-bottom: 0.75rem;">
              <label style="font-size: 0.82rem; font-weight: 700; color: #33691E;">3. Lời thoại phân cảnh hoặc Nội dung kịch bản sáng tạo của nhóm (*):</label>
              <textarea id="studentSubmissionContent_${item.code}" class="input-control" rows="3" placeholder="Nhập lời thoại diễn tập, ý tưởng phân cảnh sân khấu hóa hoặc câu hỏi gửi Thầy/Cô..." required style="font-size: 0.85rem; padding: 0.5rem 0.65rem;"></textarea>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 0.5rem; align-items: center;">
              <button type="submit" class="btn-primary" style="background: #2E7D32; border-color: #1B5E20; font-weight: 700; font-size: 0.85rem; padding: 0.45rem 1.15rem; cursor: pointer;">
                ${stIcon('upload', 15)} Gửi Kịch bản / Bài làm cho Giáo viên
              </button>
            </div>
          </form>

          ${pastSubmissionsHtml}
        </div>
            `;
        }

        function submitStudentWork(postCode) {
            const roleEl = document.getElementById(`studentSubmissionRole_${postCode}`);
            const nameEl = document.getElementById(`studentSubmissionName_${postCode}`);
            const contentEl = document.getElementById(`studentSubmissionContent_${postCode}`);

            if (!nameEl || !contentEl) return;
            const studentName = nameEl.value.trim();
            const content = contentEl.value.trim();
            const roleName = roleEl ? roleEl.value : "Nhân vật kịch bản";

            if (!studentName || !content) {
                alert("Vui lòng điền đầy đủ Tên Học sinh / Tên Nhóm và Lời thoại kịch bản (*).");
                return;
            }

            const item = catalogData.find(i => i.code === postCode) || {};
            const submission = {
                id: "SUB-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6),
                postCode: postCode,
                lessonTitle: item.lesson || postCode,
                studentName: studentName,
                roleName: roleName,
                content: content,
                submittedAt: new Date().toLocaleString("vi-VN"),
                status: "PENDING",
                teacherGrade: "",
                teacherFeedback: "",
                feedbackAt: "",
                feedbackAuthor: ""
            };

            commitDatabaseMutation("STUDENT_SUBMISSION_CREATED", submission);

            alert(`🎉 NỘP KỊCH BẢN THÀNH CÔNG!\n\n• Nhóm / Học sinh: ${studentName}\n• Vai diễn: ${roleName}\n• Bài học: ${item.lesson || postCode}\n\nBài làm của bạn đã được chuyển thẳng tới Bàn làm việc của Thầy/Cô theo thời gian thực!`);

            // Làm mới lại khối tương tác trong modal chi tiết
            openDetailModal(postCode);
        }

        // --- GIÁO VIÊN: QUẢN LÝ BÀI NỘP & CHẤM ĐIỂM ---
        function updateTeacherSubmissionsCountBadge() {
            const badge = document.getElementById("teacherSubmissionsCountBadge");
            if (badge) {
                badge.textContent = studentSubmissions.length;
            }
        }

        function renderTeacherSubmissionsList() {
            const container = document.getElementById("teacherSubmissionsListContainer");
            updateTeacherSubmissionsCountBadge();
            if (!container) return;

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
                        <div style="color: var(--gold-dark); margin-bottom: 0.5rem;">${stIcon('inbox', 40)}</div>
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
                                        ${stIcon('cap', 14)} Học sinh / Nhóm: <strong>${escapeHtml(sub.studentName)}</strong>
                                        <span style="font-size: 0.78rem; color: var(--ink-muted); margin-left: 0.5rem;">${stIcon('clock', 13)} Nộp lúc: ${escapeHtml(sub.submittedAt)}</span>
                                    </div>
                                </div>
                                <div>
                                    ${sub.status === 'GRADED'
                                        ? `<span style="font-size: 0.8rem; background: #E8F5E9; color: #2E7D32; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 3px;">${stIcon('check', 13)} Đã chấm: ${escapeHtml(sub.teacherGrade)}</span>`
                                        : `<span style="font-size: 0.8rem; background: #FFF3E0; color: #E65100; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 3px;">${stIcon('clock', 13)} Chờ chấm điểm</span>`
                                    }
                                </div>
                            </div>

                            <div style="background: #FAFAFA; border: 1px solid #EEE; padding: 0.65rem 0.85rem; border-radius: 4px; font-size: 0.88rem; line-height: 1.55; white-space: pre-wrap; margin-bottom: 0.65rem;">
                                ${escapeHtml(sub.content)}
                            </div>

                            ${sub.teacherFeedback ? `
                                <div style="background: #F1F8E9; border-left: 3px solid #689F38; padding: 0.5rem 0.75rem; border-radius: 3px; font-size: 0.85rem; color: #1B5E20; margin-bottom: 0.65rem;">
                                    <strong>${stIcon('quill', 14)} Nhận xét của Thầy/Cô:</strong> ${escapeHtml(sub.teacherFeedback)} (Điểm: <strong>${escapeHtml(sub.teacherGrade)}</strong>)
                                </div>
                            ` : ''}

                            <div id="gradeFormBox_${sub.id}" style="display: none; background: #FDF4E7; border: 1px solid var(--gold); border-radius: 4px; padding: 0.75rem; margin-top: 0.5rem;">
                                <div style="display: grid; grid-template-columns: 120px 1fr; gap: 0.65rem; margin-bottom: 0.5rem;">
                                    <div>
                                        <label style="font-size: 0.78rem; font-weight: 700; color: var(--burgundy);">Điểm số (*):</label>
                                        <input type="text" id="gradeInput_${sub.id}" class="input-control" value="${escapeHtml(sub.teacherGrade || '10/10')}" style="font-size: 0.85rem; padding: 0.35rem 0.5rem;" />
                                    </div>
                                    <div>
                                        <label style="font-size: 0.78rem; font-weight: 700; color: var(--burgundy);">Lời phê sư phạm (*):</label>
                                        <input type="text" id="feedbackInput_${sub.id}" class="input-control" placeholder="Nhập nhận xét động viên, góp ý kịch bản..." value="${escapeHtml(sub.teacherFeedback || 'Kịch bản rất sáng tạo, thể hiện đúng tinh thần lịch sử!')}" style="font-size: 0.85rem; padding: 0.35rem 0.5rem;" />
                                    </div>
                                </div>
                                <div style="display: flex; justify-content: flex-end; gap: 0.45rem;">
                                    <button type="button" class="btn-primary" style="font-size: 0.8rem; padding: 0.35rem 0.85rem; background: #2E7D32; border-color: #1B5E20;" onclick="submitTeacherFeedback('${sub.id}')">
                                        ${stIcon('check', 14)} Lưu & Gửi cho Học sinh
                                    </button>
                                    <button type="button" class="btn-secondary" style="font-size: 0.8rem; padding: 0.35rem 0.65rem;" onclick="document.getElementById('gradeFormBox_${sub.id}').style.display='none'">
                                        Hủy
                                    </button>
                                </div>
                            </div>

                            <div style="display: flex; justify-content: flex-end; gap: 0.45rem; margin-top: 0.35rem;">
                                <button type="button" class="btn-secondary" style="font-size: 0.78rem; padding: 0.3rem 0.65rem; color: #1B5E20; border-color: #81C784;" onclick="document.getElementById('gradeFormBox_${sub.id}').style.display='block'">
                                    ${sub.status === 'GRADED' ? `${stIcon('quill', 13)} Sửa điểm & Lời phê` : `${stIcon('quill', 13)} Chấm điểm & Nhận xét`}
                                </button>
                                <button type="button" class="btn-secondary" style="font-size: 0.78rem; padding: 0.3rem 0.55rem; color: var(--burgundy);" onclick="openDetailModal('${sub.postCode}')">
                                    ${stIcon('eye', 13)} Mở bài học
                                </button>
                            </div>
                        </div>
                    `).join("")}
                </div>
            `;
        }

        function submitTeacherFeedback(subId) {
            const sub = studentSubmissions.find(s => s.id === subId);
            if (!sub) return;

            const gradeInput = document.getElementById(`gradeInput_${subId}`);
            const feedbackInput = document.getElementById(`feedbackInput_${subId}`);

            const grade = gradeInput ? gradeInput.value.trim() : "10/10";
            const feedback = feedbackInput ? feedbackInput.value.trim() : "Kịch bản xuất sắc!";

            sub.teacherGrade = grade;
            sub.teacherFeedback = feedback;
            sub.feedbackAt = new Date().toLocaleString("vi-VN");
            sub.feedbackAuthor = (typeof sessionTeacherKey !== "undefined" && sessionTeacherKey) ? "Giáo viên Lịch sử" : "Thầy/Cô";
            sub.status = "GRADED";

            commitDatabaseMutation("TEACHER_FEEDBACK_SAVED", sub);
            renderTeacherSubmissionsList();

            alert(`✅ ĐÃ LƯU & GỬI NHẬN XÉT THÀNH CÔNG!\n\n• Học sinh: ${sub.studentName}\n• Điểm: ${grade}\n• Lời phê: ${feedback}\n\nKết quả đã được gửi tức thì về màn hình bài học của học sinh và đồng bộ toàn hệ thống.`);
        }

        // --- BOOKMARKS ---
        function toggleStudentBookmark(code) {
            if (studentBookmarks.has(code)) {
                studentBookmarks.delete(code);
                showSituationToast({
                    title: "☆ Đã bỏ lưu bài học",
                    message: `Đã xóa bài mã ${code} khỏi Góc học tập của em.`,
                    badge: "☆",
                    duration: 3000
                });
            } else {
                studentBookmarks.add(code);
                showSituationToast({
                    title: "⭐ Đã lưu vào Góc học tập!",
                    message: `Bài mã ${code} đã được lưu vào danh sách yêu thích của em.`,
                    badge: "⭐",
                    code: code,
                    duration: 4000
                });
            }
            try {
                localStorage.setItem("situation_student_bookmarks", JSON.stringify([...studentBookmarks]));
            } catch (e) { }

            const btn = document.getElementById(`btnBookmarkItem_${code}`);
            if (btn) {
                btn.innerHTML = studentBookmarks.has(code) ? `${stIcon('star', 14)} Đã lưu vào Góc học tập` : `${stIcon('star', 14)} Lưu vào Góc học tập`;
            }
            applyCatalogFilters();
        }

        function isItemBookmarked(code) {
            return Boolean(studentBookmarks && studentBookmarks.has(code));
        }

        // --- MODAL MÔ PHỎNG LIÊN THÔNG GV ↔ HS ---
        function openSyncSimulatorModal() {
            const m = document.getElementById("syncSimulatorModal");
            if (m) m.classList.add("open");
            const input = document.getElementById("syncServerUrlInput");
            if (input && typeof syncServerUrl !== "undefined") {
                input.value = syncServerUrl;
            }
            if (typeof fetchServerNetworkInfo === "function") {
                fetchServerNetworkInfo();
            }
            if (typeof updateSyncAuditDisplay === "function") {
                updateSyncAuditDisplay();
            }
            if (typeof updateSyncStatusDisplay === "function") {
                updateSyncStatusDisplay();
            }
        }

        function closeSyncSimulatorModal() {
            const m = document.getElementById("syncSimulatorModal");
            if (m) m.classList.remove("open");
        }

        function openNewStudentTab() {
            if (typeof window !== "undefined") {
                window.open(window.location.href, "_blank");
            }
        }

        function runInteractiveSyncDemo() {
            closeSyncSimulatorModal();

            const demoCode = "11.W99";
            const demoExamCode = "MD-11.1427";
            const demoTitle = "Hoạt cảnh: Chiến thắng Chi Lăng - Xương Giang (Năm 1427)";
            const demoAuthor = "Thầy Nguyễn Hữu An";
            const demoSchool = "THPT Chuyên Lê Hồng Phong";
            const demoSummary = "Kịch bản hào hùng tái hiện trận địa mai phục núi Chi Lăng, chém Liễu Thăng và cuộc đối thoại nghị hòa giữ thể diện cho đại quân Minh.";

            const demoPost = {
                code: demoCode,
                grade: "11",
                examCode: demoExamCode,
                topic: "Kịch bản Khởi nghĩa Lam Sơn",
                lesson: demoTitle,
                scenario: demoSummary,
                format: "Kịch bản Word (.docx)",
                focus: `Kịch bản do Thầy ${demoAuthor} (${demoSchool}) biên soạn, tái hiện tài mưu lược quân sự của Lê Lợi và Nguyễn Trãi.`,
                originType: "TEACHER_CONTRIBUTED",
                author: demoAuthor,
                school: demoSchool,
                createdAt: new Date().toISOString().slice(0, 10),
                fileName: "KichBan_ChiLang_XuongGiang_1427.docx",
                fileSize: 450560,
                fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                characters: [
                    { name: "Bình Định vương Lê Lợi", type: "HISTORICAL_FACT", desc: "Thủ lĩnh khởi nghĩa Lam Sơn, chủ trương đánh vào lòng người, lấy đại nghĩa thắng hung tàn." },
                    { name: "Quân sư Nguyễn Trãi", type: "HISTORICAL_FACT", desc: "Tác giả Bình Ngô đại cáo: soạn thư dụ hàng Vương Thông, phân tích thời thế." },
                    { name: "Tướng quân Trần Lựu", type: "HISTORICAL_FACT", desc: "Tướng tiên phong giả vờ thua nhử Liễu Thăng vào ải Chi Lăng hiểm trở." }
                ],
                relatedDocs: [`DOC-${demoCode}`],
                sources: `Biên soạn: ${demoAuthor} (${demoSchool}) - Mã đề: ${demoExamCode}`
            };

            const demoDoc = {
                id: `DOC-${demoCode}`,
                title: `Hồ sơ kịch bản (${demoCode}): ${demoTitle}`,
                code: demoCode,
                grade: "11",
                examCode: demoExamCode,
                format: "DOCX",
                updatedAt: new Date().toISOString().slice(0, 10),
                source: `Biên soạn: ${demoAuthor} (${demoSchool})`,
                fileName: demoPost.fileName,
                fileSize: demoPost.fileSize,
                content: `KỊCH BẢN CHI LĂNG - XƯƠNG GIANG 1427\nNgười biên soạn: ${demoAuthor}\nTrường: ${demoSchool}\n...`
            };

            commitDatabaseMutation('TEACHER_POST_SAVED', {
                post: demoPost,
                doc: demoDoc,
                author: demoAuthor,
                lesson: demoTitle,
                code: demoCode
            });

            showSituationToast({
                title: "🔔 BÀI HỌC MỚI TỪ THẦY/CÔ!",
                message: `${demoAuthor} (${demoSchool}) vừa đăng kịch bản mới: "${demoTitle}".`,
                badge: "👨‍🏫",
                code: demoCode,
                actionText: "👁️ Xem bài ngay",
                onAction: () => openDetailModal(demoCode)
            });

            setTimeout(() => {
                switchPage('catalog');
                openDetailModal(demoCode);
            }, 600);
        }

        // 5. KHỞI TẠO HỆ THỐNG
        window.addEventListener("DOMContentLoaded", async () => {
            initSituationRealtimeSync();
            // Khởi tạo hệ quản trị cơ sở dữ liệu SituationDB
            if (window.SituationDB) {
                try {
                    await window.SituationDB.init();
                } catch (err) {
                    console.warn("Lỗi khởi động SituationDB:", err);
                }
            }
            loadSavedTeacherPosts();
            try {
                const savedBgMode = typeof localStorage !== "undefined" ? localStorage.getItem("situation_dongson_bg_mode") : null;
                if (savedBgMode && typeof setDongSonBgMode === "function") {
                    setDongSonBgMode(savedBgMode);
                }
            } catch (e) {}
            updateApiStatusDisplay();
            populateFilterDropdowns();
            updateHomeCounters();
            applyCatalogFilters();
            renderDocuments();
            renderChatSessions();
            renderActiveChat();
            updateRagCounters();
            updateRoleBadgeUI();
            if (typeof render15ShowcaseCards === "function") {
                render15ShowcaseCards("10");
            }

            // Fix lỗi: Đóng modal khi click ra ngoài vùng nền mờ (Backdrop)
            document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
                backdrop.addEventListener("click", e => {
                    if (e.target === backdrop) {
                        backdrop.classList.remove("open");
                    }
                });
            });

            // Fix lỗi: Đóng modal khi nhấn phím Escape (ESC) & Phím tắt Ctrl+K / Cmd+K tìm kiếm nhanh
            window.addEventListener("keydown", e => {
                if (e.key === "Escape") {
                    document.querySelectorAll(".modal-backdrop.open").forEach(m => m.classList.remove("open"));
                }
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                    e.preventDefault();
                    const homeSec = document.getElementById("page-home");
                    if (homeSec && homeSec.classList.contains("active")) {
                        const heroInput = document.getElementById("vipHeroSearchInput");
                        if (heroInput) { heroInput.focus(); return; }
                    }
                    switchPage("catalog");
                    const sInput = document.getElementById("searchInput");
                    if (sInput) sInput.focus();
                }
            });

            // Hiển thị nút cuộn lên đầu trang Hoàng Gia khi cuộn xuống
            window.addEventListener("scroll", () => {
                const topBtn = document.getElementById("vipBackToTopBtn");
                if (topBtn && topBtn.classList) {
                    if (window.scrollY > 280) {
                        topBtn.classList.add("visible");
                    } else {
                        topBtn.classList.remove("visible");
                    }
                }
            }, { passive: true });
        });

        function executeVipHeroSearch() {
            const heroInput = document.getElementById("vipHeroSearchInput");
            const query = heroInput ? (heroInput.value || "").trim() : "";
            switchPage("catalog");
            selectGradeTab("ALL");
            const catalogSearch = document.getElementById("searchInput");
            if (catalogSearch) {
                catalogSearch.value = query;
                applyCatalogFilters();
                if (!query) catalogSearch.focus();
            }
        }

        function switchPage(pageId) {
            document.querySelectorAll(".page-section").forEach(sec => sec.classList.remove("active"));
            document.getElementById(`page-${pageId}`).classList.add("active");

            document.querySelectorAll(".nav-btn").forEach(btn => {
                btn.classList.toggle("active", btn.getAttribute("data-nav") === pageId);
            });
            window.scrollTo({ top: 0, behavior: "smooth" });
        }

        function openGradeCatalog(grade) {
            switchPage("catalog");
            selectGradeTab(grade);
        }

        // ==========================================
        // HỆ THỐNG PHÂN QUYỀN & BẢO MẬT MẬT KHẨU (RBAC)
        // ==========================================
        var securityFailedAttempts = 0;
        var securityLockoutTimerInterval = null;

        function updateRoleBadgeUI() {
            const badge = document.getElementById("adminToggleBtn");
            if (!badge) return;

            const currentAdmin = (typeof window !== "undefined" && window.isAdmin) || (typeof isAdmin !== "undefined" && isAdmin);
            const currentTeacher = (typeof window !== "undefined" && window.isTeacherAuthenticated) || (typeof isTeacherAuthenticated !== "undefined" && isTeacherAuthenticated);

            if (currentAdmin) {
                badge.textContent = "Quyền: Quản trị viên (Admin)";
                badge.style.backgroundColor = "#7D1018";
                badge.style.color = "#fff";
                badge.style.borderColor = "#FFD54F";
                badge.style.boxShadow = "0 0 10px rgba(197, 164, 109, 0.4)";
                badge.title = "Đang nắm Quyền Quản trị viên (Admin). Nhấn để mở Trung tâm Phân quyền & Khóa phiên.";
            } else if (currentTeacher) {
                badge.textContent = "Quyền: Giáo viên (Teacher)";
                badge.style.backgroundColor = "rgba(46, 125, 50, 0.25)";
                badge.style.color = "#E8F5E9";
                badge.style.borderColor = "#81C784";
                badge.style.boxShadow = "0 0 8px rgba(76, 175, 80, 0.35)";
                badge.title = "Đang ở Quyền Giáo viên. Nhấn để mở Trung tâm Phân quyền & Khóa phiên.";
            } else {
                badge.textContent = "Quyền: Học sinh / Giáo viên";
                badge.style.backgroundColor = "rgba(197, 164, 109, 0.15)";
                badge.style.color = "var(--gold-light)";
                badge.style.borderColor = "var(--gold)";
                badge.style.boxShadow = "none";
                badge.title = "Quyền hiện tại: Học sinh. Nhấn để xác thực nâng quyền Giáo viên hoặc Quản trị viên.";
            }
        }

        function handleRoleBadgeClick(e) {
            if (e) {
                if (typeof e.preventDefault === "function") e.preventDefault();
                if (typeof e.stopPropagation === "function") e.stopPropagation();
            }
            openSecurityRoleModal();
        }

        function openSecurityRoleModal() {
            const modal = document.getElementById("securityRoleModal");
            if (!modal) return;

            modal.classList.add("open");
            modal.style.display = "flex";

            // Cập nhật trạng thái quyền hiện tại
            const currentAdmin = (typeof window !== "undefined" && window.isAdmin) || (typeof isAdmin !== "undefined" && isAdmin);
            const currentTeacher = (typeof window !== "undefined" && window.isTeacherAuthenticated) || (typeof isTeacherAuthenticated !== "undefined" && isTeacherAuthenticated);
            const titleEl = document.getElementById("roleCurrentStatusTitle");
            const descEl = document.getElementById("roleCurrentStatusDesc");
            const lockContainer = document.getElementById("roleQuickLockContainer");

            if (titleEl && descEl) {
                if (currentAdmin) {
                    titleEl.innerHTML = `<span style="color:#7D1018; display:inline-flex; align-items:center; gap:0.4rem;">${typeof stIcon === 'function' ? stIcon('shield', 18) : '🛡️'} 👑 Quản trị viên (Admin Mode) - Toàn quyền</span>`;
                    descEl.textContent = "Bạn đang nắm quyền quản trị tối cao: thêm, sửa, xóa kịch bản, chạy SQL Studio, khôi phục CSDL.";
                    if (lockContainer) lockContainer.style.display = "block";
                } else if (currentTeacher) {
                    const roleName = (typeof TEACHER_AUTH_KEYS !== "undefined" && window.sessionTeacherKey && TEACHER_AUTH_KEYS[window.sessionTeacherKey]) ? TEACHER_AUTH_KEYS[window.sessionTeacherKey].role : "Giáo viên Bộ môn Lịch sử";
                    titleEl.innerHTML = `<span style="color:#2E7D32; display:inline-flex; align-items:center; gap:0.4rem;">${typeof stIcon === 'function' ? stIcon('key', 18) : '🔑'} 👨‍🏫 Giáo viên (${roleName})</span>`;
                    descEl.textContent = "Đã xác thực quyền Giáo viên: được phép đăng bài, tải file Word/PDF, chấm điểm và quản lý kịch bản cá nhân.";
                    if (lockContainer) lockContainer.style.display = "block";
                } else {
                    titleEl.innerHTML = `<span style="color:#1565C0; display:inline-flex; align-items:center; gap:0.4rem;">${typeof stIcon === 'function' ? stIcon('book', 18) : '🎓'} 🎓 Học sinh (Student Mode)</span>`;
                    descEl.textContent = "Chế độ xem tài liệu, đọc kịch bản, làm bài tập và hỏi đáp AI. Không được sửa hay xóa CSDL.";
                    if (lockContainer) lockContainer.style.display = "none";
                }
            }

            // Kiểm tra trạng thái khóa brute-force
            checkSecurityLockoutStatus();

            // Hiển thị trạng thái mật khẩu
            const feedback = document.getElementById("roleAuthFeedback");
            if (feedback) {
                let hasCustom = false;
                try {
                    hasCustom = !!(typeof localStorage !== "undefined" && localStorage.getItem("situation_custom_admin_password"));
                } catch(e){}
                feedback.innerHTML = hasCustom 
                    ? `<span style="color:#2E7D32; font-weight:600;">✓ Đang áp dụng Mật khẩu Quản trị riêng & các Mã khóa phân quyền</span>`
                    : `Hỗ trợ mật khẩu riêng đã tạo hoặc mã khóa phân quyền chính thức.`;
            }

            const input = document.getElementById("roleAuthPasswordInput");
            if (input) {
                input.value = "";
                input.style.borderColor = "var(--gold)";
                input.style.background = "#fff";
                setTimeout(() => {
                    if (!isSecurityLockedOut()) input.focus();
                }, 150);
            }
        }

        function closeSecurityRoleModal() {
            const modal = document.getElementById("securityRoleModal");
            if (modal) {
                modal.classList.remove("open");
                modal.style.display = "none";
            }
            if (securityLockoutTimerInterval) {
                clearInterval(securityLockoutTimerInterval);
                securityLockoutTimerInterval = null;
            }
        }

        function isSecurityLockedOut() {
            try {
                if (typeof sessionStorage !== "undefined") {
                    const until = parseInt(sessionStorage.getItem("situation_security_lockout_until") || "0", 10);
                    return Date.now() < until;
                }
            } catch(e){}
            return false;
        }

        function checkSecurityLockoutStatus() {
            const notice = document.getElementById("roleAuthLockoutNotice");
            const secondsEl = document.getElementById("roleLockoutSeconds");
            const input = document.getElementById("roleAuthPasswordInput");
            const btn = document.getElementById("btnSubmitRoleAuth");
            const counterEl = document.getElementById("roleBruteForceCounter");

            let lockoutUntil = 0;
            try {
                if (typeof sessionStorage !== "undefined") {
                    lockoutUntil = parseInt(sessionStorage.getItem("situation_security_lockout_until") || "0", 10);
                }
            } catch(e){}

            const now = Date.now();
            if (lockoutUntil > now) {
                const remainingSec = Math.ceil((lockoutUntil - now) / 1000);
                if (notice) notice.style.display = "block";
                if (secondsEl) secondsEl.textContent = remainingSec;
                if (input) { input.disabled = true; input.style.background = "#F5F5F5"; }
                if (btn) btn.disabled = true;
                if (counterEl) counterEl.innerHTML = `<span style="color:#C62828; font-weight:700;">Đang khóa (${remainingSec}s)</span>`;

                if (!securityLockoutTimerInterval) {
                    securityLockoutTimerInterval = setInterval(() => {
                        checkSecurityLockoutStatus();
                    }, 1000);
                }
            } else {
                if (securityLockoutTimerInterval) {
                    clearInterval(securityLockoutTimerInterval);
                    securityLockoutTimerInterval = null;
                }
                if (notice) notice.style.display = "none";
                if (input) { input.disabled = false; input.style.background = "#fff"; }
                if (btn) btn.disabled = false;
                try {
                    if (typeof sessionStorage !== "undefined") {
                        sessionStorage.removeItem("situation_security_lockout_until");
                    }
                } catch(e){}
                const attemptsLeft = 5 - securityFailedAttempts;
                if (counterEl) {
                    counterEl.innerHTML = attemptsLeft < 5
                        ? `<span style="color:#E65100; font-weight:700;">Còn ${attemptsLeft}/5 lần thử</span>`
                        : `Còn 5 lần thử`;
                }
            }
        }

        function onRoleSelectionChanged(role) {
            const cardAdmin = document.getElementById("roleCardAdmin");
            const cardTeacher = document.getElementById("roleCardTeacher");
            const label = document.getElementById("roleAuthInputLabel");

            if (role === "admin") {
                if (cardAdmin) {
                    cardAdmin.style.borderColor = "var(--gold)";
                    cardAdmin.style.background = "rgba(197, 164, 109, 0.08)";
                }
                if (cardTeacher) {
                    cardTeacher.style.borderColor = "#E0E0E0";
                    cardTeacher.style.background = "#fff";
                }
                if (label) label.textContent = "Mật khẩu Quản trị viên / Mã Master (*)";
            } else {
                if (cardTeacher) {
                    cardTeacher.style.borderColor = "#81C784";
                    cardTeacher.style.background = "rgba(46, 125, 50, 0.08)";
                }
                if (cardAdmin) {
                    cardAdmin.style.borderColor = "#E0E0E0";
                    cardAdmin.style.background = "#fff";
                }
                if (label) label.textContent = "Mã khóa Giáo viên / Mật khẩu Quản trị (*)";
            }
        }

        function toggleRolePasswordVisibility() {
            const input = document.getElementById("roleAuthPasswordInput");
            if (!input) return;
            input.type = input.type === "password" ? "text" : "password";
        }

        function submitRoleAuthPassword() {
            if (isSecurityLockedOut()) {
                if (typeof showSituationToast === "function") {
                    showSituationToast("⛔ Cổng xác thực đang tạm khóa. Vui lòng đợi hết thời gian chờ!", "error");
                }
                return;
            }

            const input = document.getElementById("roleAuthPasswordInput");
            const feedback = document.getElementById("roleAuthFeedback");
            const val = input ? input.value.trim() : "";

            if (!val) {
                if (feedback) feedback.innerHTML = `<span style="color:#C62828; font-weight:700;">Vui lòng nhập mật khẩu hoặc mã khóa!</span>`;
                if (input) input.focus();
                return;
            }

            let targetRole = "admin";
            const selectedRadio = document.querySelector('input[name="targetRoleSelection"]:checked');
            if (selectedRadio) targetRole = selectedRadio.value;

            let customPassword = null;
            try {
                if (typeof localStorage !== "undefined") {
                    customPassword = localStorage.getItem("situation_custom_admin_password");
                }
            } catch(e){}

            const isCustomMatch = customPassword && (val === customPassword);
            let isKeyValid = false;
            let assignedTeacherKey = "SU2026";

            if (targetRole === "admin") {
                if (isCustomMatch || val === "SU2026" || val === "SECURE#2026$GV-HIST@SITUATION") {
                    isKeyValid = true;
                    assignedTeacherKey = "SECURE#2026$GV-HIST@SITUATION";
                }
            } else {
                if (isCustomMatch || (typeof TEACHER_AUTH_KEYS !== "undefined" && TEACHER_AUTH_KEYS[val])) {
                    isKeyValid = true;
                    assignedTeacherKey = (typeof TEACHER_AUTH_KEYS !== "undefined" && TEACHER_AUTH_KEYS[val]) ? val : "SU2026";
                }
            }

            if (isKeyValid) {
                securityFailedAttempts = 0;
                try {
                    if (typeof sessionStorage !== "undefined") {
                        sessionStorage.removeItem("situation_security_lockout_until");
                    }
                } catch(e){}

                if (targetRole === "admin") {
                    isAdmin = true;
                    if (typeof window !== "undefined") {
                        window.isAdmin = true;
                        window.isTeacherAuthenticated = true;
                        window.sessionTeacherKey = assignedTeacherKey;
                        try {
                            if (typeof sessionStorage !== "undefined") {
                                sessionStorage.setItem("situation_teacher_session_key", assignedTeacherKey);
                            }
                        } catch(e){}
                    }
                    if (typeof isTeacherAuthenticated !== "undefined") isTeacherAuthenticated = true;
                    if (typeof sessionTeacherKey !== "undefined") sessionTeacherKey = assignedTeacherKey;

                    updateRoleBadgeUI();
                    renderDocuments();
                    closeSecurityRoleModal();
                    if (typeof showSituationToast === "function") {
                        showSituationToast("👑 Đã xác thực thành công Quyền Quản trị viên (Admin)! Bạn có toàn quyền quản lý.", "success");
                    }
                } else {
                    isAdmin = false;
                    if (typeof window !== "undefined") {
                        window.isAdmin = false;
                        window.isTeacherAuthenticated = true;
                        window.sessionTeacherKey = assignedTeacherKey;
                        try {
                            if (typeof sessionStorage !== "undefined") {
                                sessionStorage.setItem("situation_teacher_session_key", assignedTeacherKey);
                            }
                        } catch(e){}
                    }
                    if (typeof isTeacherAuthenticated !== "undefined") isTeacherAuthenticated = true;
                    if (typeof sessionTeacherKey !== "undefined") sessionTeacherKey = assignedTeacherKey;

                    updateRoleBadgeUI();
                    renderDocuments();
                    closeSecurityRoleModal();
                    if (typeof showSituationToast === "function") {
                        showSituationToast("👨‍🏫 Đã xác thực thành công Quyền Giáo viên!", "success");
                    }
                }
            } else {
                securityFailedAttempts++;
                if (securityFailedAttempts >= 5) {
                    const lockoutUntil = Date.now() + 60000;
                    try {
                        if (typeof sessionStorage !== "undefined") {
                            sessionStorage.setItem("situation_security_lockout_until", lockoutUntil.toString());
                        }
                    } catch(e){}
                    checkSecurityLockoutStatus();
                    if (typeof showSituationToast === "function") {
                        showSituationToast("⛔ Nhập sai 5 lần! Cổng xác thực tạm khóa 60 giây để phòng thủ brute-force.", "error");
                    }
                } else {
                    const left = 5 - securityFailedAttempts;
                    if (feedback) {
                        feedback.innerHTML = `<span style="color:#C62828; font-weight:700;">❌ Mật khẩu hoặc mã khóa không chính xác! Còn ${left} lần thử.</span>`;
                    }
                    if (input) {
                        input.style.borderColor = "#C62828";
                        input.style.background = "#FFF5F5";
                        input.focus();
                        input.select();
                    }
                    checkSecurityLockoutStatus();
                    if (typeof showSituationToast === "function") {
                        showSituationToast(`Mật khẩu không đúng! Còn ${left} lần thử.`, "warning");
                    }
                }
            }
        }

        function lockAndLogoutSession() {
            isAdmin = false;
            if (typeof window !== "undefined") {
                window.isAdmin = false;
                window.isTeacherAuthenticated = false;
                window.sessionTeacherKey = "";
                try {
                    if (typeof sessionStorage !== "undefined") {
                        sessionStorage.removeItem("situation_teacher_session_key");
                    }
                } catch(e){}
            }
            if (typeof isTeacherAuthenticated !== "undefined") isTeacherAuthenticated = false;
            if (typeof sessionTeacherKey !== "undefined") sessionTeacherKey = "";

            updateRoleBadgeUI();
            renderDocuments();
            closeSecurityRoleModal();
            if (typeof showSituationToast === "function") {
                showSituationToast("🔒 Đã khóa phiên và chuyển về chế độ Học sinh an toàn.", "info");
            }
        }

        function toggleCustomPasswordSection() {
            const body = document.getElementById("customPasswordSettingsBody");
            const icon = document.getElementById("customPasswordToggleIcon");
            if (!body) return;
            if (body.style.display === "none" || !body.style.display) {
                body.style.display = "block";
                if (icon) icon.textContent = "▲ Thu gọn";
            } else {
                body.style.display = "none";
                if (icon) icon.textContent = "▼ Mở rộng";
            }
        }

        function evaluatePasswordStrength(pwd) {
            const label = document.getElementById("pwdStrengthLabel");
            const bar = document.getElementById("pwdStrengthBar");
            const rLength = document.getElementById("pwdRuleLength");
            const rCase = document.getElementById("pwdRuleCase");
            const rNumber = document.getElementById("pwdRuleNumber");
            const rSpecial = document.getElementById("pwdRuleSpecial");

            if (!pwd) {
                if (label) { label.textContent = "Chưa nhập"; label.style.color = "#9E9E9E"; }
                if (bar) { bar.style.width = "0%"; bar.style.background = "#E53935"; }
                if (rLength) { rLength.textContent = "○ Ít nhất 6 ký tự"; rLength.style.color = "var(--ink-muted)"; }
                if (rCase) { rCase.textContent = "○ Chữ hoa & chữ thường"; rCase.style.color = "var(--ink-muted)"; }
                if (rNumber) { rNumber.textContent = "○ Có chữ số (0-9)"; rNumber.style.color = "var(--ink-muted)"; }
                if (rSpecial) { rSpecial.textContent = "○ Ký tự đặc biệt (!@#$)"; rSpecial.style.color = "var(--ink-muted)"; }
                return 0;
            }

            const hasLength = pwd.length >= 6;
            const hasCase = /[a-z]/.test(pwd) && /[A-Z]/.test(pwd);
            const hasNumber = /[0-9]/.test(pwd);
            const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

            if (rLength) {
                rLength.textContent = hasLength ? "✓ Ít nhất 6 ký tự" : "○ Ít nhất 6 ký tự";
                rLength.style.color = hasLength ? "#2E7D32" : "#C62828";
                rLength.style.fontWeight = hasLength ? "700" : "normal";
            }
            if (rCase) {
                rCase.textContent = hasCase ? "✓ Chữ hoa & thường" : "○ Chữ hoa & thường";
                rCase.style.color = hasCase ? "#2E7D32" : "var(--ink-muted)";
                rCase.style.fontWeight = hasCase ? "700" : "normal";
            }
            if (rNumber) {
                rNumber.textContent = hasNumber ? "✓ Có chữ số (0-9)" : "○ Có chữ số (0-9)";
                rNumber.style.color = hasNumber ? "#2E7D32" : "var(--ink-muted)";
                rNumber.style.fontWeight = hasNumber ? "700" : "normal";
            }
            if (rSpecial) {
                rSpecial.textContent = hasSpecial ? "✓ Ký tự đặc biệt" : "○ Ký tự đặc biệt";
                rSpecial.style.color = hasSpecial ? "#2E7D32" : "var(--ink-muted)";
                rSpecial.style.fontWeight = hasSpecial ? "700" : "normal";
            }

            let score = 0;
            if (hasLength) score++;
            if (hasCase) score++;
            if (hasNumber) score++;
            if (hasSpecial) score++;

            if (score <= 1) {
                if (label) { label.textContent = "Yếu"; label.style.color = "#E53935"; }
                if (bar) { bar.style.width = "25%"; bar.style.background = "#E53935"; }
            } else if (score === 2) {
                if (label) { label.textContent = "Trung bình"; label.style.color = "#FB8C00"; }
                if (bar) { bar.style.width = "50%"; bar.style.background = "#FB8C00"; }
            } else if (score === 3) {
                if (label) { label.textContent = "Tốt"; label.style.color = "#1E88E5"; }
                if (bar) { bar.style.width = "75%"; bar.style.background = "#1E88E5"; }
            } else {
                if (label) { label.textContent = "Rất mạnh (Tối ưu)"; label.style.color = "#43A047"; }
                if (bar) { bar.style.width = "100%"; bar.style.background = "#43A047"; }
            }
            return score;
        }

        function saveCustomAdminPassword() {
            const inputNew = document.getElementById("inputNewCustomPassword");
            const inputConfirm = document.getElementById("inputConfirmCustomPassword");
            const feedback = document.getElementById("customPasswordFeedback");

            const newPass = inputNew ? inputNew.value.trim() : "";
            const confirmPass = inputConfirm ? inputConfirm.value.trim() : "";

            if (!newPass) {
                if (feedback) feedback.innerHTML = `<span style="color:#C62828;">Vui lòng nhập mật khẩu mới!</span>`;
                if (inputNew) inputNew.focus();
                return;
            }
            if (newPass.length < 6) {
                if (feedback) feedback.innerHTML = `<span style="color:#C62828;">Mật khẩu phải có độ dài tối thiểu 6 ký tự!</span>`;
                if (inputNew) inputNew.focus();
                return;
            }
            if (newPass !== confirmPass) {
                if (feedback) feedback.innerHTML = `<span style="color:#C62828;">Mật khẩu xác nhận không khớp! Vui lòng nhập lại.</span>`;
                if (inputConfirm) { inputConfirm.focus(); inputConfirm.select(); }
                return;
            }

            try {
                if (typeof localStorage !== "undefined") {
                    localStorage.setItem("situation_custom_admin_password", newPass);
                }
                if (feedback) feedback.innerHTML = `<span style="color:#2E7D32; font-weight:700;">✓ Đã lưu Mật khẩu Quản trị riêng thành công!</span>`;
                if (inputNew) inputNew.value = "";
                if (inputConfirm) inputConfirm.value = "";
                if (typeof showSituationToast === "function") {
                    showSituationToast("🔐 Đã thiết lập Mật khẩu Quản trị riêng cho hệ thống thành công!", "success");
                }
            } catch(e) {
                if (feedback) feedback.innerHTML = `<span style="color:#C62828;">Lỗi khi lưu mật khẩu: ${e.message}</span>`;
            }
        }

        function resetCustomAdminPassword() {
            if (confirm("Khôi phục về mật khẩu mặc định của hệ thống? Mật khẩu quản trị riêng sẽ bị xóa.")) {
                try {
                    if (typeof localStorage !== "undefined") {
                        localStorage.removeItem("situation_custom_admin_password");
                    }
                } catch(e){}
                const feedback = document.getElementById("customPasswordFeedback");
                if (feedback) feedback.innerHTML = `<span style="color:#1565C0;">Đã khôi phục về các mã khóa phân quyền mặc định.</span>`;
                if (typeof showSituationToast === "function") {
                    showSituationToast("↺ Đã khôi phục về mã khóa mặc định ban đầu.", "info");
                }
            }
        }

        function toggleAdminMode(forceToggle) {
            if (typeof forceToggle === "boolean") {
                isAdmin = forceToggle;
            } else {
                isAdmin = !isAdmin;
            }
            
            if (isAdmin) {
                // Đồng bộ quyền Quản trị viên cấp cao nhất vào phiên Giáo viên
                if (typeof window !== "undefined") {
                    window.isAdmin = true;
                    window.isTeacherAuthenticated = true;
                    window.sessionTeacherKey = "SECURE#2026$GV-HIST@SITUATION";
                    try {
                        if (typeof sessionStorage !== "undefined") {
                            sessionStorage.setItem("situation_teacher_session_key", "SECURE#2026$GV-HIST@SITUATION");
                        }
                    } catch (e) { }
                }
                if (typeof isTeacherAuthenticated !== "undefined") isTeacherAuthenticated = true;
                if (typeof sessionTeacherKey !== "undefined") sessionTeacherKey = "SECURE#2026$GV-HIST@SITUATION";

                if (typeof showSituationToast === "function") {
                    showSituationToast("👑 Đã kích hoạt Quyền Quản trị viên (Admin)! Bạn có toàn quyền đăng bài và quản lý.", "success");
                }
            } else {
                if (typeof window !== "undefined") {
                    window.isAdmin = false;
                }
                if (typeof showSituationToast === "function") {
                    showSituationToast("Đã chuyển về chế độ Học sinh / Giáo viên thông thường.", "info");
                }
            }
            updateRoleBadgeUI();
            renderDocuments();
        }

        // ==========================================
        // TÍNH TOÁN & KIỂM KÊ SỐ LIỆU THẬT CSDL
        // ==========================================
        function calculateRealMetrics() {
            const totalLessons = catalogData.length;
            const g10 = catalogData.filter(i => i.grade === "10").length;
            const g11 = catalogData.filter(i => i.grade === "11").length;
            const g12 = catalogData.filter(i => i.grade === "12").length;
            const totalDocs = (typeof documentStore !== 'undefined') ? documentStore.length : 14;

            let totalCharacterRoles = 0;
            const uniqueCharacters = new Set();
            let historicalFactCount = 0;
            let creativeCount = 0;
            const allCharactersList = [];

            catalogData.forEach(item => {
                if (Array.isArray(item.characters)) {
                    item.characters.forEach(c => {
                        totalCharacterRoles++;
                        if (c.name) {
                            uniqueCharacters.add(c.name.trim());
                            allCharactersList.push({
                                name: c.name.trim(),
                                type: c.type || "CREATIVE_REPRESENTATIVE",
                                desc: c.desc || "",
                                lessonCode: item.code,
                                examCode: getPostExamCode(item),
                                lessonTitle: item.lesson,
                                grade: item.grade
                            });
                        }
                        if (c.type === "HISTORICAL_FACT") historicalFactCount++;
                        else creativeCount++;
                    });
                }
            });

            const topicsSet = new Set(catalogData.map(i => i.topic).filter(Boolean));
            const formatsSet = new Set(catalogData.map(i => i.format).filter(Boolean));

            const formatCounts = {};
            catalogData.forEach(d => {
                formatCounts[d.format] = (formatCounts[d.format] || 0) + 1;
            });

            const docFormatCounts = {};
            if (typeof documentStore !== 'undefined') {
                documentStore.forEach(d => {
                    docFormatCounts[d.format] = (docFormatCounts[d.format] || 0) + 1;
                });
            }

            const examCodeCount = catalogData.filter(i => i.examCode).length;
            const examCodeRate = totalLessons > 0 ? Math.round((examCodeCount / totalLessons) * 100) : 100;

            return {
                totalLessons,
                g10,
                g11,
                g12,
                totalDocs,
                totalCharacterRoles,
                uniqueCharCount: uniqueCharacters.size,
                historicalFactCount,
                creativeCount,
                totalTopics: topicsSet.size,
                totalFormats: formatsSet.size,
                formatCounts,
                docFormatCounts,
                examCodeCount,
                examCodeRate,
                allCharactersList
            };
        }

        // Đếm số mượt mà (Count-Up Animation)
        function animateCountUp(el, targetNumber, suffix = "") {
            if (!el) return;
            const currentStr = el.getAttribute("data-current-val") || el.textContent.replace(/[^0-9]/g, "");
            const startNumber = parseInt(currentStr, 10) || 0;
            if (startNumber === targetNumber) {
                el.textContent = targetNumber + suffix;
                return;
            }
            const duration = 650;
            const startTime = performance.now();

            function update(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(startNumber + (targetNumber - startNumber) * ease);
                el.textContent = current + suffix;
                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    el.textContent = targetNumber + suffix;
                    el.setAttribute("data-current-val", targetNumber);
                }
            }
            requestAnimationFrame(update);
        }

        function updateGradeTabBadges(animated = false) {
            const metrics = calculateRealMetrics();
            const allBadge = document.getElementById("grade-badge-all");
            if (allBadge) allBadge.textContent = metrics.totalLessons;
            ["10", "11", "12"].forEach(g => {
                const count = catalogData.filter(i => i.grade === g).length;
                const el = document.getElementById(`grade-badge-${g}`);
                if (el) el.textContent = count;
            });

            const heroLessons = document.getElementById("heroMetricTotalLessons");
            const heroGrades = document.getElementById("heroMetricTotalGrades");
            const heroDocs = document.getElementById("heroMetricTotalDocs");
            const heroCharacters = document.getElementById("heroMetricTotalCharacters");
            const heroExamCodes = document.getElementById("heroMetricExamCodeRate");
            const heroTopics = document.getElementById("heroMetricTotalTopics");

            if (animated) {
                if (heroLessons) animateCountUp(heroLessons, metrics.totalLessons);
                if (heroGrades) animateCountUp(heroGrades, 3);
                if (heroDocs) animateCountUp(heroDocs, metrics.totalDocs);
                if (heroCharacters) animateCountUp(heroCharacters, metrics.totalCharacterRoles);
                if (heroExamCodes) animateCountUp(heroExamCodes, metrics.examCodeRate, "%");
                if (heroTopics) animateCountUp(heroTopics, metrics.totalTopics);
            } else {
                if (heroLessons) heroLessons.textContent = metrics.totalLessons;
                if (heroGrades) heroGrades.textContent = "3";
                if (heroDocs) heroDocs.textContent = metrics.totalDocs;
                if (heroCharacters) heroCharacters.textContent = metrics.totalCharacterRoles;
                if (heroExamCodes) heroExamCodes.textContent = metrics.examCodeRate + "%";
                if (heroTopics) heroTopics.textContent = metrics.totalTopics;
            }
        }

        function updateHomeCounters(animated = false) {
            ["10", "11", "12"].forEach(g => {
                const count = catalogData.filter(item => item.grade === g).length;
                const el = document.getElementById(`home-count-${g}`);
                if (el) el.textContent = `${count} bài học chuẩn`;
            });
            updateGradeTabBadges(animated);
            updateTeacherPostCountBadge();
        }

        // ==========================================
        // BẢNG KIỂM KÊ & KIỂM ĐỊNH SỐ LIỆU THẬT CSDL
        // ==========================================
        let currentInventoryCharFilter = 'ALL';
        let currentInventorySearchQuery = '';

        function openRealDataInventoryModal() {
            const modal = document.getElementById("realDataInventoryModal");
            if (!modal) return;
            modal.classList.add("open");
            renderRealDataInventoryModal();
        }

        function closeRealDataInventoryModal() {
            const modal = document.getElementById("realDataInventoryModal");
            if (modal) modal.classList.remove("open");
        }

        function filterInventoryCharacters(type) {
            currentInventoryCharFilter = type;
            renderRealDataInventoryModal();
        }

        function searchInventoryCharacters(val) {
            currentInventorySearchQuery = (val || "").trim().toLowerCase();
            renderRealDataInventoryModal();
        }

        function renderRealDataInventoryModal() {
            const container = document.getElementById("realDataInventoryContent");
            if (!container) return;

            const m = calculateRealMetrics();
            const now = new Date().toLocaleString("vi-VN");

            // Filter characters
            let filteredChars = m.allCharactersList.filter(c => {
                if (currentInventoryCharFilter === "FACT" && c.type !== "HISTORICAL_FACT") return false;
                if (currentInventoryCharFilter === "CREATIVE" && c.type === "HISTORICAL_FACT") return false;
                if (currentInventorySearchQuery) {
                    const match = c.name.toLowerCase().includes(currentInventorySearchQuery) ||
                        c.desc.toLowerCase().includes(currentInventorySearchQuery) ||
                        c.lessonCode.toLowerCase().includes(currentInventorySearchQuery) ||
                        c.examCode.toLowerCase().includes(currentInventorySearchQuery) ||
                        c.lessonTitle.toLowerCase().includes(currentInventorySearchQuery);
                    if (!match) return false;
                }
                return true;
            });

            // Format distribution HTML
            const formatRowsHtml = Object.entries(m.formatCounts).map(([fmt, cnt]) => {
                const pct = Math.round((cnt / m.totalLessons) * 100);
                return `
                  <div style="margin-bottom: 0.65rem;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.2rem;">
                      <strong style="color: var(--burgundy);">${escapeHtml(fmt)}</strong>
                      <span><strong>${cnt}</strong> bài (${pct}%)</span>
                    </div>
                    <div style="height: 7px; background: #EFEBE4; border-radius: 4px; overflow: hidden;">
                      <div style="height: 100%; width: ${pct}%; background: linear-gradient(90deg, var(--bordeaux), var(--gold)); border-radius: 4px;"></div>
                    </div>
                  </div>
                `;
            }).join("");

            // Character Cards HTML
            const charsListHtml = filteredChars.length > 0
                ? filteredChars.map(c => {
                    const isFact = c.type === "HISTORICAL_FACT";
                    const badge = isFact
                        ? `<span class="badge-fact">${stIcon('check', 12)} Chính sử</span>`
                        : `<span class="badge-creative">${stIcon('mask', 12)} Kịch bản hóa</span>`;
                    const avatar = isFact ? stIcon('scroll', 20) : stIcon('mask', 20);
                    return `
                      <div class="character-dossier-card">
                        <div class="character-avatar-badge" style="color: var(--burgundy);">${avatar}</div>
                        <div style="flex: 1;">
                          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.2rem; flex-wrap: wrap; gap: 0.25rem;">
                            <strong style="color: var(--burgundy); font-size: 0.95rem;">${escapeHtml(c.name)}</strong>
                            ${badge}
                          </div>
                          <div style="font-size: 0.76rem; color: var(--gold-dark); font-weight: 700; margin-bottom: 0.25rem;">
                            Khối ${escapeHtml(c.grade)} • Mã ${escapeHtml(c.lessonCode)} (${escapeHtml(c.examCode)})
                          </div>
                          <p style="font-size: 0.82rem; color: var(--ink-muted); margin: 0; line-height: 1.45;">${escapeHtml(c.desc)}</p>
                        </div>
                      </div>
                    `;
                }).join("")
                : `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; background: var(--ivory); border-radius: 6px; color: var(--ink-muted);">Không tìm thấy nhân vật nào khớp với từ khóa tìm kiếm.</div>`;

            container.innerHTML = `
                <!-- THẺ THÔNG TIN XÁC THỰC -->
                <div style="background: linear-gradient(135deg, #FFF9E6, #FFF3D6); border: 1.5px solid var(--gold); border-radius: 8px; padding: 1rem 1.25rem; margin-bottom: 1.35rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
                  <div>
                    <div style="font-size: 0.75rem; font-weight: 800; color: #8D6E14; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${stIcon('check', 13)} KẾT QUẢ KIỂM ĐỊNH TOÀN DIỆN THỜI GIAN THỰC
                    </div>
                    <strong style="color: var(--burgundy); font-size: 1.05rem;">Dữ liệu CSDL Sử Tuation chuẩn hóa GDPT 2018</strong>
                    <div style="font-size: 0.8rem; color: var(--ink-muted); margin-top: 0.15rem;">Thời điểm kiểm kê: ${escapeHtml(now)} • Cơ chế: Đồng bộ tự động 100%</div>
                  </div>
                  <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button type="button" class="btn-primary" style="font-size: 0.82rem; padding: 0.45rem 0.95rem; background: var(--bordeaux);" onclick="exportRealDataInventoryReport('txt')">
                      ${stIcon('download', 14)} Xuất Báo cáo (.TXT)
                    </button>
                    <button type="button" class="btn-secondary" style="font-size: 0.82rem; padding: 0.45rem 0.95rem;" onclick="exportRealDataInventoryReport('json')">
                      ${stIcon('database', 14)} Xuất JSON CSDL
                    </button>
                  </div>
                </div>

                <!-- 6 THẺ CHỈ SỐ THỐNG KÊ THẬT -->
                <div class="inventory-summary-grid">
                  <div class="inventory-summary-card">
                    <div style="color: var(--bordeaux); margin-bottom: 0.2rem;">${stIcon('book', 28)}</div>
                    <div class="inventory-summary-num">${m.totalLessons}</div>
                    <div class="inventory-summary-label">Bài học chuẩn SGK</div>
                    <div style="font-size: 0.75rem; color: var(--bordeaux); margin-top: 0.25rem; font-weight: 600;">K10: ${m.g10} | K11: ${m.g11} | K12: ${m.g12}</div>
                  </div>
                  <div class="inventory-summary-card">
                    <div style="color: var(--bordeaux); margin-bottom: 0.2rem;">${stIcon('tag', 28)}</div>
                    <div class="inventory-summary-num">${m.examCodeCount}</div>
                    <div class="inventory-summary-label">Mã đề chuẩn (MD-xx)</div>
                    <div style="font-size: 0.75rem; color: #1B5E20; margin-top: 0.25rem; font-weight: 700;">Tỷ lệ đạt chuẩn: ${m.examCodeRate}%</div>
                  </div>
                  <div class="inventory-summary-card">
                    <div style="color: var(--bordeaux); margin-bottom: 0.2rem;">${stIcon('folder', 28)}</div>
                    <div class="inventory-summary-num">${m.totalDocs}</div>
                    <div class="inventory-summary-label">Hồ sơ tư liệu số hóa</div>
                    <div style="font-size: 0.75rem; color: var(--gold-dark); margin-top: 0.25rem; font-weight: 600;">DOCX (${m.docFormatCounts.DOCX || 0}) • PDF (${m.docFormatCounts.PDF || 0}) • TXT (${m.docFormatCounts.TXT || 0})</div>
                  </div>
                  <div class="inventory-summary-card">
                    <div style="color: var(--bordeaux); margin-bottom: 0.2rem;">${stIcon('mask', 28)}</div>
                    <div class="inventory-summary-num">${m.totalCharacterRoles}</div>
                    <div class="inventory-summary-label">Nhân vật & Vai diễn</div>
                    <div style="font-size: 0.75rem; color: var(--burgundy); margin-top: 0.25rem; font-weight: 600;">${m.historicalFactCount} Chính sử • ${m.creativeCount} Kịch bản</div>
                  </div>
                  <div class="inventory-summary-card">
                    <div style="color: var(--bordeaux); margin-bottom: 0.2rem;">${stIcon('scroll', 28)}</div>
                    <div class="inventory-summary-num">${m.totalTopics}</div>
                    <div class="inventory-summary-label">Chủ đề SGK chuyên sâu</div>
                    <div style="font-size: 0.75rem; color: var(--ink-muted); margin-top: 0.25rem;">Bao quát toàn bộ chương trình</div>
                  </div>
                  <div class="inventory-summary-card">
                    <div style="color: var(--bordeaux); margin-bottom: 0.2rem;">${stIcon('sparkle', 28)}</div>
                    <div class="inventory-summary-num">${m.totalFormats}</div>
                    <div class="inventory-summary-label">Hình thức hoạt cảnh</div>
                    <div style="font-size: 0.75rem; color: var(--ink-muted); margin-top: 0.25rem;">Đối thoại, tiểu phẩm, tư liệu...</div>
                  </div>
                </div>

                <!-- KHỐI PHÂN BỔ HÌNH THỨC SÂN KHẤU HÓA -->
                <div style="background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 1.25rem; margin-bottom: 1.35rem; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
                  <h4 style="font-family: var(--font-serif); font-size: 1.15rem; color: var(--burgundy); margin: 0 0 0.85rem 0; border-bottom: 1px solid var(--ivory-dark); padding-bottom: 0.4rem;">
                    ${stIcon('sparkle', 18)} Phân Bổ 5 Hình Thức Sân Khấu Hóa Sư Phạm
                  </h4>
                  ${formatRowsHtml}
                </div>

                <!-- KHỐI KIỂM KÊ 88 NHÂN VẬT & VAI DIỄN LỊCH SỬ -->
                <div style="background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; flex-wrap: wrap; gap: 0.65rem; border-bottom: 1px solid var(--ivory-dark); padding-bottom: 0.6rem;">
                    <div>
                      <h4 style="font-family: var(--font-serif); font-size: 1.2rem; color: var(--burgundy); margin: 0;">
                        ${stIcon('mask', 18)} Danh Mục ${m.totalCharacterRoles} Vai Diễn & Nhân Vật Lịch Sử Lập Hồ Sơ
                      </h4>
                      <div style="font-size: 0.82rem; color: var(--ink-muted);">Phân định minh bạch giữa tư liệu chính sử đã kiểm chứng và vai đại diện kịch bản hóa.</div>
                    </div>
                    <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                      <button type="button" class="btn-secondary" style="font-size: 0.78rem; padding: 0.3rem 0.7rem; ${currentInventoryCharFilter === 'ALL' ? 'background: var(--bordeaux); color: #fff; border-color: var(--bordeaux);' : ''}" onclick="filterInventoryCharacters('ALL')">
                        Tất cả (${m.totalCharacterRoles})
                      </button>
                      <button type="button" class="btn-secondary" style="font-size: 0.78rem; padding: 0.3rem 0.7rem; ${currentInventoryCharFilter === 'FACT' ? 'background: #1B5E20; color: #fff; border-color: #1B5E20;' : ''}" onclick="filterInventoryCharacters('FACT')">
                        ${stIcon('check', 13)} Chính sử (${m.historicalFactCount})
                      </button>
                      <button type="button" class="btn-secondary" style="font-size: 0.78rem; padding: 0.3rem 0.7rem; ${currentInventoryCharFilter === 'CREATIVE' ? 'background: #7C5313; color: #fff; border-color: #7C5313;' : ''}" onclick="filterInventoryCharacters('CREATIVE')">
                        ${stIcon('mask', 13)} Kịch bản hóa (${m.creativeCount})
                      </button>
                    </div>
                  </div>

                  <!-- Thanh tìm kiếm nhân vật -->
                  <div style="margin-bottom: 0.85rem;">
                    <input type="text" class="input-control" value="${escapeHtml(currentInventorySearchQuery)}" placeholder="Tìm nhanh tên nhân vật, vai diễn, mã bài (VD: Tư Mã Thiên, Hồ Quý Ly, Quang Trung, sông Nile, 10.04A...)" oninput="searchInventoryCharacters(this.value)" style="padding: 0.55rem 0.85rem; font-size: 0.88rem;" />
                  </div>

                  <!-- Lưới thẻ nhân vật -->
                  <div class="character-dossier-grid" style="max-height: 380px; overflow-y: auto; padding-right: 0.3rem;">
                    ${charsListHtml}
                  </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;">
                  <button type="button" class="btn-secondary" onclick="closeRealDataInventoryModal()">Đóng cửa sổ kiểm kê</button>
                </div>
            `;
        }

        // Xuất báo cáo kiểm kê dữ liệu
        function exportRealDataInventoryReport(format = 'txt') {
            const m = calculateRealMetrics();
            const now = new Date().toLocaleString("vi-VN");

            if (format === 'json') {
                const reportObj = {
                    title: "Báo cáo Kiểm kê Dữ liệu CSDL Sử Tuation",
                    version: "2.6",
                    generatedAt: now,
                    summary: {
                        totalLessons: m.totalLessons,
                        gradeDistribution: { grade10: m.g10, grade11: m.g11, grade12: m.g12 },
                        totalExamCodes: m.examCodeCount,
                        examCodeStandardRate: m.examCodeRate + "%",
                        totalDocuments: m.totalDocs,
                        documentFormats: m.docFormatCounts,
                        totalCharacterRoles: m.totalCharacterRoles,
                        historicalFactRoles: m.historicalFactCount,
                        creativeRepresentativeRoles: m.creativeCount,
                        uniqueHistoricalFiguresCount: m.uniqueCharCount,
                        totalTopics: m.totalTopics,
                        totalFormats: m.totalFormats,
                        formatDistribution: m.formatCounts
                    },
                    characters: m.allCharactersList,
                    catalog: catalogData.map(i => ({
                        code: i.code,
                        examCode: getPostExamCode(i),
                        grade: i.grade,
                        lesson: i.lesson,
                        topic: i.topic,
                        format: i.format,
                        characterCount: (i.characters || []).length
                    }))
                };
                const blob = new Blob([JSON.stringify(reportObj, null, 2)], { type: "application/json;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `SuTuation_BaoCaoKiemKe_${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
                if (typeof showSituationToast === "function") {
                    showSituationToast("Đã xuất tệp Báo cáo Kiểm kê JSON thành công!", "success");
                }
                return;
            }

            // Text format
            let reportText = `=================================================================\n`;
            reportText += `       BÁO CÁO KIỂM KÊ & KIỂM ĐỊNH SỐ LIỆU THẬT CSDL SỬ TUATION\n`;
            reportText += `       NỀN TẢNG TRA CỨU & HOẠT CẢNH HÓA LỊCH SỬ THPT (GDPT 2018)\n`;
            reportText += `=================================================================\n\n`;
            reportText += `Thời điểm kiểm kê: ${now}\n`;
            reportText += `Phiên bản hệ thống: 2.6 (Đồng bộ thời gian thực 100%)\n\n`;

            reportText += `1. TỔNG QUAN CHỈ SỐ CSDL:\n`;
            reportText += `   - Tổng số bài học chuẩn SGK: ${m.totalLessons} bài\n`;
            reportText += `     • Khối 10: ${m.g10} bài\n`;
            reportText += `     • Khối 11: ${m.g11} bài\n`;
            reportText += `     • Khối 12: ${m.g12} bài\n`;
            reportText += `   - Số bài có mã đề thi chuẩn (MD-xx): ${m.examCodeCount}/${m.totalLessons} bài (Tỷ lệ: ${m.examCodeRate}%)\n`;
            reportText += `   - Tổng số hồ sơ tư liệu số hóa: ${m.totalDocs} hồ sơ\n`;
            Object.entries(m.docFormatCounts).forEach(([fmt, cnt]) => {
                reportText += `     • Định dạng ${fmt}: ${cnt} hồ sơ\n`;
            });
            reportText += `   - Tổng số vai diễn & nhân vật lịch sử: ${m.totalCharacterRoles} vai diễn\n`;
            reportText += `     • Nhân vật chính sử xác thực: ${m.historicalFactCount} nhân vật\n`;
            reportText += `     • Vai diễn đại diện / kịch bản: ${m.creativeCount} vai diễn\n`;
            reportText += `   - Số chủ đề lịch sử chuyên sâu: ${m.totalTopics} chủ đề\n`;
            reportText += `   - Số hình thức sân khấu hóa: ${m.totalFormats} hình thức\n\n`;

            reportText += `2. PHÂN BỔ 5 HÌNH THỨC SÂN KHẤU HÓA:\n`;
            Object.entries(m.formatCounts).forEach(([fmt, cnt]) => {
                const pct = Math.round((cnt / m.totalLessons) * 100);
                reportText += `   - ${fmt}: ${cnt} bài (${pct}%)\n`;
            });
            reportText += `\n3. DANH SÁCH CHI TIẾT ${m.totalCharacterRoles} VAI DIỄN & NHÂN VẬT LỊCH SỬ:\n`;
            m.allCharactersList.forEach((c, idx) => {
                const typeStr = c.type === 'HISTORICAL_FACT' ? '[CHÍNH SỬ]' : '[KỊCH BẢN]';
                reportText += `   ${idx + 1}. ${c.name} ${typeStr} (Bài ${c.lessonCode} - ${c.examCode} Khối ${c.grade})\n`;
                reportText += `      Mô tả: ${c.desc}\n`;
            });

            reportText += `\n=================================================================\n`;
            reportText += `Bản quyền © 2026 Sử Tuation Platform. Xác thực dữ liệu chuẩn 100%.\n`;

            const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `SuTuation_BaoCaoKiemKe_${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
            if (typeof showSituationToast === "function") {
                showSituationToast("Đã xuất tệp Báo cáo Kiểm kê (.TXT) thành công!", "success");
            }
        }

        // 6. CHỨC NĂNG TRANG 2: DANH MỤC LỊCH SỬ & TRA CỨU
        function populateFilterDropdowns() {
            const formatSelect = document.getElementById("formatFilter");
            const topicSelect = document.getElementById("topicFilter");
            if (!formatSelect || !topicSelect) return;

            const formats = [...new Set(catalogData.map(i => i.format))];
            const topics = [...new Set(catalogData.map(i => i.topic))];

            formatSelect.innerHTML = `<option value="ALL">Tất cả hình thức (${formats.length})</option>` +
                formats.map(f => `<option value="${f}">${f}</option>`).join("");

            topicSelect.innerHTML = `<option value="ALL">Tất cả chủ đề (${topics.length})</option>` +
                topics.map(t => `<option value="${t}">${t}</option>`).join("");
        }

        function selectGradeTab(grade) {
            currentGradeTab = grade;
            document.querySelectorAll(".grade-tab").forEach(tab => {
                tab.classList.toggle("active", tab.getAttribute("data-grade") === grade);
            });

            const orient = GRADE_ORIENTATIONS[grade] || GRADE_ORIENTATIONS["ALL"];
            const orientTitleEl = document.getElementById("orientationTitle");
            const orientDescEl = document.getElementById("orientationDesc");
            if (orientTitleEl) orientTitleEl.textContent = orient.title;
            if (orientDescEl) orientDescEl.textContent = orient.desc;

            currentPage = 1;
            applyCatalogFilters();
        }

        function applyCatalogFilters() {
            const query = (document.getElementById("searchInput")?.value || "").trim().toLowerCase();
            const format = document.getElementById("formatFilter")?.value || "ALL";
            const topic = document.getElementById("topicFilter")?.value || "ALL";
            const sortOrder = document.getElementById("sortOrder")?.value || "ASC";
            const teacherOnly = document.getElementById("teacherOnlyFilter")?.checked || false;
            const official15El = document.getElementById("official15Filter");
            const official15Only = official15El ? official15El.checked : false;

            filteredCatalog = catalogData.filter(item => {
                const matchGrade = currentGradeTab === "ALL" || item.grade === currentGradeTab;
                const matchFormat = format === "ALL" || item.format === format;
                const matchTopic = topic === "ALL" || item.topic === topic;
                const matchTeacher = !teacherOnly || item.originType === "TEACHER_CONTRIBUTED";
                const matchOfficial15 = !official15Only || ((typeof getOfficial15Script === "function" && getOfficial15Script(item.code) !== null) || Boolean(item.scriptData));
                const searchable = `${item.code} ${item.lesson} ${item.scenario} ${item.format} ${item.focus} ${item.topic} ${item.author || ""} ${item.context || ""}`.toLowerCase();
                const matchQuery = !query || searchable.includes(query);
                return matchGrade && matchFormat && matchTopic && matchTeacher && matchQuery;
            });

            filteredCatalog.sort((a, b) => {
                return sortOrder === "ASC"
                    ? a.code.localeCompare(b.code, "vi", { numeric: true })
                    : b.code.localeCompare(a.code, "vi", { numeric: true });
            });

            renderCatalogView();
        }

        let catalogFilterDebounceTimer = null;
        function debouncedApplyCatalogFilters() {
            if (catalogFilterDebounceTimer) clearTimeout(catalogFilterDebounceTimer);
            catalogFilterDebounceTimer = setTimeout(() => {
                applyCatalogFilters();
            }, 120);
        }

        function resetCatalogFilters() {
            const sInput = document.getElementById("searchInput");
            const fFilter = document.getElementById("formatFilter");
            const tFilter = document.getElementById("topicFilter");
            const sOrder = document.getElementById("sortOrder");
            const tOnly = document.getElementById("teacherOnlyFilter");
            if (sInput) sInput.value = "";
            if (fFilter) fFilter.value = "ALL";
            if (tFilter) tFilter.value = "ALL";
            if (sOrder) sOrder.value = "ASC";
            if (tOnly) tOnly.checked = false;
            const o15Only = document.getElementById("official15Filter");
            if (o15Only) o15Only.checked = false;
            selectGradeTab("ALL");
        }

        function renderCatalogView() {
            const tbody = document.getElementById("catalogTableBody");
            const mobileContainer = document.getElementById("mobileCatalogCards");
            const emptyState = document.getElementById("catalogEmptyState");
            const resultCountText = document.getElementById("resultCountText");
            const pagInfo = document.getElementById("paginationInfo");
            const pagBtns = document.getElementById("paginationButtons");

            if (resultCountText) resultCountText.textContent = filteredCatalog.length;

            if (filteredCatalog.length === 0) {
                if (tbody) tbody.innerHTML = "";
                if (mobileContainer) mobileContainer.innerHTML = "";
                if (emptyState) emptyState.style.display = "block";
                if (pagInfo) pagInfo.textContent = "0 kết quả";
                if (pagBtns) pagBtns.innerHTML = "";
                return;
            }

            if (emptyState) emptyState.style.display = "none";
            const totalPages = Math.ceil(filteredCatalog.length / ITEMS_PER_PAGE);
            if (currentPage > totalPages) currentPage = 1;

            const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
            const pageItems = filteredCatalog.slice(startIdx, startIdx + ITEMS_PER_PAGE);

            // Render Desktop Table (Đủ 5 trường thông tin bắt buộc)
            tbody.innerHTML = pageItems.map(item => {
                const examCode = getPostExamCode(item);
                let originBadge = `<div class="source-origin-tag origin-sgk">${stIcon('book', 13)} Khung chương trình SGK</div>`;
                if (item.originType === "VERIFIED_ORIGINAL") {
                    originBadge = `<div class="source-origin-tag origin-verified">${stIcon('check', 13)} Dữ liệu gốc xác thực</div>`;
                } else if (item.originType === "TEACHER_CONTRIBUTED") {
                    originBadge = `<div class="source-origin-tag origin-teacher">${stIcon('teacher', 13)} Biên soạn: ${escapeHtml(item.author || "Giáo viên")}${item.school ? ` (${escapeHtml(item.school)})` : ""}</div> <span class="badge-pulse" title="Bài mới từ Giáo viên được kết nối trực tiếp">${stIcon('sparkle', 12)} MỚI TỪ GV</span>`;
                }

                return `
          <tr onclick="openDetailModal('${item.code}')">
            <td>
              <div style="display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap;">
                <span class="code-badge">${escapeHtml(item.code)}</span>
                <span style="font-family: monospace; font-size: 0.74rem; background: #FFF3E0; color: #BF360C; border: 1px solid #FFE0B2; padding: 0.1rem 0.35rem; border-radius: 3px; font-weight: 700;" title="Mã đề">${stIcon('tag', 12)} ${escapeHtml(examCode)}</span>
              </div>
              <div style="font-size: 0.74rem; color: var(--ink-muted); margin-top: 0.3rem;">Khối ${escapeHtml(item.grade)}</div>
            </td>
            <td>
              <strong style="color: var(--burgundy);">${escapeHtml(item.lesson)}</strong>
              <div>${originBadge}</div>
            </td>
            <td>${escapeHtml(item.scenario)}</td>
            <td>
              <span class="format-tag">${escapeHtml(item.format)}</span>
              <div style="margin-top: 0.35rem;">
                <button type="button" class="btn-primary" style="padding: 0.2rem 0.55rem; font-size: 0.76rem; background: #2E7D32; border-color: #1B5E20; display: inline-flex; align-items: center; gap: 0.25rem; font-weight: 700; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.12);" onclick="event.stopPropagation(); downloadTeacherWordFile('${item.code}')" title="Tải về kịch bản/tài liệu bài học">
                  ${stIcon('download', 13)} Tải về
                </button>
              </div>
            </td>
            <td>${escapeHtml(item.focus)}</td>
          </tr>
        `;
            }).join("");

            // Render Mobile Cards
            mobileContainer.innerHTML = pageItems.map(item => {
                const examCode = getPostExamCode(item);
                const teacherBadgeMobile = item.originType === "TEACHER_CONTRIBUTED"
                    ? `<div class="source-origin-tag origin-teacher" style="margin-bottom:0.4rem;">${stIcon('teacher', 13)} Biên soạn: ${escapeHtml(item.author || "Giáo viên")}</div>`
                    : "";
                return `
        <div class="mobile-card" onclick="openDetailModal('${item.code}')">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.35rem;">
            <div style="display: flex; align-items: center; gap: 0.35rem;">
              <span class="code-badge">${escapeHtml(item.code)} (Khối ${escapeHtml(item.grade)})</span>
              <span style="font-family: monospace; font-size: 0.74rem; background: #FFF3E0; color: #BF360C; border: 1px solid #FFE0B2; padding: 0.1rem 0.35rem; border-radius: 3px; font-weight: 700;">${stIcon('tag', 12)} ${escapeHtml(examCode)}</span>
            </div>
            <span class="format-tag">${escapeHtml(item.format)}</span>
          </div>
          ${teacherBadgeMobile}
          <div class="mobile-card-row">
            <span class="mobile-card-label">Bài học trong SGK</span>
            <strong>${escapeHtml(item.lesson)}</strong>
          </div>
          <div class="mobile-card-row">
            <span class="mobile-card-label">Gợi ý hoạt cảnh & tình huống</span>
            ${escapeHtml(item.scenario)}
          </div>
          <div class="mobile-card-row">
            <span class="mobile-card-label">Trọng tâm học tập</span>
            ${escapeHtml(item.focus)}
          </div>
          <div style="margin-top: 0.65rem; padding-top: 0.5rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; gap: 0.4rem;">
            <button type="button" class="btn-secondary" style="padding: 0.3rem 0.65rem; font-size: 0.78rem; font-weight: 600;" onclick="event.stopPropagation(); openDetailModal('${item.code}')">${stIcon('eye', 13)} Chi tiết</button>
            <button type="button" class="btn-primary" style="padding: 0.3rem 0.75rem; font-size: 0.8rem; background: #2E7D32; border-color: #1B5E20; font-weight: 700; display: inline-flex; align-items: center; gap: 0.25rem;" onclick="event.stopPropagation(); downloadTeacherWordFile('${item.code}')">${stIcon('download', 13)} Tải về máy</button>
          </div>
        </div>
      `;
            }).join("");

            // Render Pagination
            document.getElementById("paginationInfo").textContent =
                `Trang ${currentPage} / ${totalPages} (Tổng ${filteredCatalog.length} mục)`;

            let pagHtml = "";
            for (let p = 1; p <= totalPages; p++) {
                pagHtml += `<button class="${p === currentPage ? 'btn-primary' : 'btn-secondary'}" style="padding: 0.35rem 0.75rem;" onclick="goToCatalogPage(${p})">${p}</button>`;
            }
            document.getElementById("paginationButtons").innerHTML = pagHtml;
        }

        function goToCatalogPage(p) {
            currentPage = p;
            renderCatalogView();
        }


        // ====================================================================
        // 15 HOẠT CẢNH LỊCH SỬ CHUẨN SƯ PHẠM (CHƯƠNG TRÌNH GDPT 2018)
        // REHEARSAL TELEPROMPTER, ROLE ASSIGNMENTS & PEDAGOGICAL 3-PART DOSSIER
        // ====================================================================

        function getScriptRoleAssignments(code) {
            try {
                const raw = localStorage.getItem("situation_script_roles_" + code);
                return raw ? JSON.parse(raw) : {};
            } catch (e) {
                return {};
            }
        }

        function autoSaveScriptRoleAssignment(code, charIndex, studentName) {
            try {
                const saved = getScriptRoleAssignments(code);
                saved[charIndex] = studentName;
                localStorage.setItem("situation_script_roles_" + code, JSON.stringify(saved));
            } catch (e) {
                console.error("Lỗi tự lưu vai diễn:", e);
            }
        }

        function saveScriptRoleAssignments(code) {
            showNonBlockingToast("Đã lưu bảng phân vai học sinh thành công!", "success");
        }

        function toggleTeleprompter(code) {
            const container = document.getElementById("scriptDialogueContainer_" + code);
            const btn = document.getElementById("btnToggleTeleprompter_" + code);
            if (!container) return;
            const isTele = container.classList.toggle("teleprompter-mode");
            if (btn) {
                btn.innerHTML = isTele
                    ? `${stIcon('close', 13)} 🗣️ Tắt chế độ Teleprompter`
                    : `${stIcon('eye', 13)} 🗣️ Chế độ Teleprompter phóng to`;
            }
        }

        function toggleAnswerHints(code) {
            const safeCode = code.replace(/[^A-Za-z0-9]/g, "");
            const hints = document.querySelectorAll(".answer-hint-" + safeCode);
            const btn = document.getElementById("btnToggleHints_" + code);
            let isHidden = true;
            hints.forEach(el => {
                if (el.style.display === "none" || !el.style.display) {
                    el.style.display = "block";
                    isHidden = false;
                } else {
                    el.style.display = "none";
                    isHidden = true;
                }
            });
            if (btn) {
                btn.innerHTML = isHidden
                    ? `${stIcon('eye', 13)} Hiện Gợi ý trả lời đối chiếu`
                    : `${stIcon('close', 13)} Ẩn Gợi ý trả lời đối chiếu`;
            }
        }

        function highlightScriptRole(code, roleName) {
            const safeCode = code.replace(/[^A-Za-z0-9]/g, "");
            const turns = document.querySelectorAll(".script-turn-" + safeCode);
            turns.forEach(row => {
                const speaker = row.getAttribute("data-speaker") || "";
                if (!roleName || roleName === "ALL") {
                    row.style.background = "";
                    row.style.outline = "";
                } else if (speaker.toLowerCase().includes(roleName.toLowerCase())) {
                    row.style.background = "#FFF9C4";
                    row.style.outline = "2px solid #D4AF37";
                } else {
                    row.style.background = "";
                    row.style.outline = "";
                }
            });
        }

        function openRehearsalGuideModal() {
            const modal = document.getElementById("rehearsalGuideModal");
            if (modal) modal.classList.add("open");
        }

        function closeRehearsalGuideModal() {
            const modal = document.getElementById("rehearsalGuideModal");
            if (modal) modal.classList.remove("open");
        }

        function switch15ShowcaseTab(grade) {
            ["10", "11", "12"].forEach(g => {
                const btn = document.getElementById("tabBtn15_" + g);
                if (btn) {
                    if (g === grade) btn.classList.add("active");
                    else btn.classList.remove("active");
                }
            });
            render15ShowcaseCards(grade);
        }

        function render15ShowcaseCards(grade = "10") {
            const container = document.getElementById("official15CardsContainer");
            if (!container) return;
            if (typeof get15ScriptsByGrade !== "function") return;

            const scripts = get15ScriptsByGrade(grade);
            if (!scripts || scripts.length === 0) {
                container.innerHTML = `<p style="color: var(--ink-muted);">Đang nạp kịch bản chuẩn Khối ${grade}...</p>`;
                return;
            }

            container.innerHTML = scripts.map(s => {
                const examCode = s.examCode || ("MD-" + s.code);
                return `
                    <div class="official-script-card">
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.45rem; flex-wrap: wrap; gap: 0.35rem;">
                                <div style="display: flex; align-items: center; gap: 0.4rem;">
                                    <span class="code-badge" style="background: var(--gold); color: var(--burgundy); font-weight: 700;">${escapeHtml(s.code)}</span>
                                    <span style="font-family: monospace; font-size: 0.72rem; background: #FFF3E0; color: #BF360C; border: 1px solid #FFE0B2; padding: 0.1rem 0.35rem; border-radius: 3px; font-weight: 700;">${stIcon('tag', 11)} ${escapeHtml(examCode)}</span>
                                </div>
                                <span class="format-tag" style="background: #EDE7F6; color: #512DA8; border-color: #D1C4E9; font-size: 0.75rem;">${escapeHtml(s.format || "Hoạt cảnh")}</span>
                            </div>

                            <h3 style="font-family: var(--font-serif); font-size: 1.15rem; color: var(--bordeaux); margin: 0 0 0.35rem 0; line-height: 1.35;">
                                ${escapeHtml(s.title)}
                            </h3>

                            <p style="font-size: 0.82rem; color: #555; margin: 0 0 0.5rem 0; line-height: 1.45;">
                                <strong>${escapeHtml(s.lesson)}</strong>
                            </p>

                            <p style="font-size: 0.85rem; color: var(--ink-muted); margin: 0 0 0.75rem 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                ${escapeHtml(s.scenario)}
                            </p>

                            <div style="display: flex; gap: 0.65rem; flex-wrap: wrap; font-size: 0.78rem; color: #666; margin-bottom: 0.85rem; padding: 0.4rem 0.6rem; background: #FAF9F5; border-radius: 4px; border: 1px dashed rgba(212,175,55,0.3);">
                                <span>⏱️ ${escapeHtml(s.duration || "3–5 phút")}</span>
                                <span>🎭 ${s.scenesCount || 3} Cảnh</span>
                                <span>👥 ${s.rolesCount || 5} Vai</span>
                            </div>
                        </div>

                        <div style="display: flex; gap: 0.45rem; justify-content: space-between; align-items: center; border-top: 1px solid var(--ivory-dark); padding-top: 0.75rem; margin-top: 0.5rem;">
                            <button type="button" class="btn-primary" onclick="openDetailModal('${s.code}')" style="flex: 1; padding: 0.4rem 0.65rem; font-size: 0.82rem; font-weight: 700; background: var(--bordeaux); border-color: #5D101D; display: inline-flex; align-items: center; justify-content: center; gap: 0.3rem;">
                                ${stIcon('eye', 13)} Xem Kịch Bản
                            </button>
                            <button type="button" class="btn-secondary" onclick="downloadTeacherWordFile('${s.code}')" style="padding: 0.4rem 0.65rem; font-size: 0.82rem; font-weight: 700; color: #2E7D32; border-color: #81C784; background: #E8F5E9; display: inline-flex; align-items: center; gap: 0.25rem;" title="Tải file Word (.docx, .doc)">
                                ${stIcon('download', 13)} Tải Word
                            </button>
                        </div>
                    </div>
                `;
            }).join("");
        }

        function openCatalogWithOfficial15() {
            switchPage("catalog");
            const oFilter = document.getElementById("official15Filter");
            if (oFilter) {
                oFilter.checked = true;
            }
            applyCatalogFilters();
        }

        function render15ScriptDossierHtml(script, item) {
            const code = item.code;
            const safeCode = code.replace(/[^A-Za-z0-9]/g, "");
            const savedRoles = getScriptRoleAssignments(code);

            // Characters in Part A
            const partAChars = (script.partA && (script.partA.roles || script.partA.characters)) ? (script.partA.roles || script.partA.characters) : [];
            const rolesRows = partAChars.map((c, idx) => {
                const rName = c.name || c.role || "Nhân vật";
                const rDesc = c.desc || c.prep || "Đọc các lượt của vai; đánh dấu chỗ vào lời.";
                const isFact = c.type === "HISTORICAL_FACT" || (!rName.includes("dẫn") && !rName.includes("Kỹ thuật"));
                const studentVal = savedRoles[idx] || c.studentName || "";
                const roleTypeBadge = isFact
                    ? `<span class="badge-fact" style="font-size: 0.74rem;">${stIcon('check', 11)} Lịch sử</span>`
                    : `<span class="badge-creative" style="font-size: 0.74rem;">${stIcon('mask', 11)} Sáng tạo</span>`;
                return `
                    <tr>
                        <td style="text-align: center; font-weight: 700; width: 40px; color: var(--bordeaux);">${idx + 1}</td>
                        <td style="width: 170px;">
                            <strong style="color: var(--burgundy);">${escapeHtml(rName)}</strong>
                            <div style="margin-top: 0.2rem;">${roleTypeBadge}</div>
                        </td>
                        <td style="font-size: 0.86rem; color: #444; line-height: 1.45;">
                            ${escapeHtml(rDesc)}
                        </td>
                        <td style="width: 220px;">
                            <input type="text" class="input-control" id="roleStudent_${safeCode}_${idx}" value="${escapeHtml(studentVal)}" placeholder="Nhập tên HS / Nhóm..." onchange="autoSaveScriptRoleAssignment('${code}', ${idx}, this.value)" style="font-size: 0.85rem; padding: 0.35rem 0.6rem; border: 1.5px solid #C5A46D;" />
                        </td>
                    </tr>
                `;
            }).join("");

            const roleFilterOptions = [`<option value="ALL">-- Tất cả các vai diễn (${partAChars.length}) --</option>`].concat(
                partAChars.map(c => {
                    const rName = c.name || c.role || "Nhân vật";
                    return `<option value="${escapeHtml(rName)}">${escapeHtml(rName)}</option>`;
                })
            ).join("");

            // Scenes in Part B
            const scenes = (script.partB && script.partB.scenes) ? script.partB.scenes : [];
            const scenesHtml = scenes.map((sc, sIdx) => {
                const turnsHtml = sc.turns.map(t => {
                    const isNonSpoken = t.turn === "—" || t.dialogue.includes("Không đọc thành lời");
                    const speakerColor = isNonSpoken ? "#666" : "var(--burgundy)";
                    return `
                        <tr class="script-dialogue-turn script-turn-${safeCode}" data-speaker="${escapeHtml(t.character)}">
                            <td style="text-align: center; font-weight: 700; width: 50px; color: #8D6E14; font-size: 0.9rem;">
                                ${escapeHtml(t.turn)}
                            </td>
                            <td style="width: 160px; font-weight: 700; color: ${speakerColor};" class="script-dialogue-speaker">
                                ${escapeHtml(t.character)}
                            </td>
                            <td style="line-height: 1.6; font-size: 0.92rem; color: ${isNonSpoken ? '#666' : '#222'}; font-style: ${isNonSpoken ? 'italic' : 'normal'};">
                                ${escapeHtml(t.dialogue)}
                            </td>
                            <td style="width: 220px; font-size: 0.84rem; color: #2E7D32; line-height: 1.45; background: rgba(46,125,50,0.03);" class="script-dialogue-action">
                                ${t.actionCue ? `${stIcon('check', 12)} ${escapeHtml(t.actionCue)}` : '—'}
                            </td>
                        </tr>
                    `;
                }).join("");

                return `
                    <div style="margin-bottom: 1.35rem; background: #fff; border: 1px solid rgba(212,175,55,0.35); border-radius: 6px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
                        <div style="background: linear-gradient(135deg, #FFF8E1 0%, #FFF3E0 100%); padding: 0.65rem 1rem; border-bottom: 1.5px solid #FFE082; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                            <strong style="color: var(--bordeaux); font-size: 0.98rem; font-family: var(--font-serif);">${escapeHtml(sc.sceneName)}</strong>
                            <span style="font-size: 0.78rem; font-weight: 700; color: #8D6E14; background: #fff; padding: 0.15rem 0.5rem; border-radius: 3px; border: 1px solid #FFE082;">${sc.turns.length} lượt thoại / động tác</span>
                        </div>
                        <div style="overflow-x: auto;">
                            <table class="data-table" style="margin: 0; width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background: #FAF7F2; font-size: 0.82rem; color: #5D101D;">
                                        <th style="width: 50px; text-align: center; border: 1px solid #E0D5C1; padding: 6px;">Lượt</th>
                                        <th style="width: 160px; border: 1px solid #E0D5C1; padding: 6px;">Nhân vật</th>
                                        <th style="border: 1px solid #E0D5C1; padding: 6px;">Lời thoại kịch bản gốc</th>
                                        <th style="width: 220px; border: 1px solid #E0D5C1; padding: 6px;">Thao tác gợi ý (Dàn dựng)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${turnsHtml}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            }).join("");

            // Part C Questions
            const qaItems = (script.partC && script.partC.qa) ? script.partC.qa : [];
            const qaHtml = qaItems.map((q, qIdx) => `
                <div style="background: #fff; border: 1px solid #E0E0E0; border-left: 4px solid var(--bordeaux); border-radius: 4px; padding: 0.85rem 1rem; margin-bottom: 0.75rem;">
                    <div style="font-weight: 700; color: var(--bordeaux); font-size: 0.92rem; margin-bottom: 0.35rem;">
                        Câu hỏi ${qIdx + 1}: ${escapeHtml(q.question)}
                    </div>
                    <div class="answer-hint-${safeCode}" style="display: none; background: #F1F8E9; border: 1px dashed #81C784; padding: 0.5rem 0.75rem; border-radius: 4px; font-size: 0.85rem; color: #1B5E20; margin-top: 0.4rem; line-height: 1.5;">
                        <strong>${stIcon('check', 13)} Gợi ý đối chiếu trả lời:</strong> ${escapeHtml(q.answerHint)}
                    </div>
                </div>
            `).join("");

            return `
                <div style="background: linear-gradient(135deg, rgba(253,246,234,0.95), rgba(255,253,248,0.98)); border: 1.5px solid rgba(212,175,55,0.4); border-left: 6px solid #800020; border-radius: 6px; padding: 1rem 1.25rem; margin-bottom: 1.25rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <span style="font-size: 0.76rem; font-weight: 800; background: #800020; color: #FFF; padding: 0.2rem 0.6rem; border-radius: 3px; letter-spacing: 0.5px;">BỘ TÀI LIỆU CHUẨN SƯ PHẠM GDPT 2018</span>
                            <span style="font-size: 0.8rem; font-weight: 700; color: #8D6E14; background: #FFF8E1; padding: 0.2rem 0.55rem; border-radius: 3px; border: 1px solid #FFE082;">Hoạt cảnh dạng bảng 3 Phần</span>
                        </div>
                        <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
                            <button type="button" class="btn-secondary" onclick="openRehearsalGuideModal()" style="font-size: 0.8rem; padding: 0.25rem 0.65rem; border-color: #D4AF37; color: #800020; background: #FFF9E6; font-weight: 700;">
                                ${stIcon('scroll', 13)} 📖 5 Bước tập hoạt cảnh
                            </button>
                            <button type="button" class="btn-secondary" id="btnToggleTeleprompter_${code}" onclick="toggleTeleprompter('${code}')" style="font-size: 0.8rem; padding: 0.25rem 0.65rem; border-color: #2E7D32; color: #1B5E20; background: #E8F5E9; font-weight: 700;">
                                ${stIcon('eye', 13)} 🗣️ Chế độ Teleprompter phóng to
                            </button>
                        </div>
                    </div>
                    <div style="font-size: 0.95rem; color: #4E342E; font-weight: 600; line-height: 1.5;">
                        ${escapeHtml(script.scenario || item.scenario)}
                    </div>
                    <div style="margin-top: 0.5rem; display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.82rem; color: #795548;">
                        <span><strong>⏱️ Thời lượng:</strong> ${escapeHtml(script.duration || '3–5 phút')}</span>
                        <span><strong>🎭 Cấu trúc:</strong> ${script.scenesCount || 3} Cảnh</span>
                        <span><strong>👥 Số vai:</strong> ${script.rolesCount || 5} vai diễn</span>
                        <span><strong>📚 Nguồn kiểm chứng:</strong> ${escapeHtml(script.sources || item.sources || 'GDPT 2018')}</span>
                    </div>
                </div>

                <!-- PHẦN A: BẢNG CHUẨN BỊ & PHÂN CÔNG VAI DIỄN -->
                <div class="detail-box" style="margin-bottom: 1.25rem; border-left: 5px solid #800020; background: #FFFDF9;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; border-bottom: 1.5px solid #E0D5C1; padding-bottom: 0.5rem; margin-bottom: 0.85rem;">
                        <h4 style="margin: 0; color: #800020; font-size: 1.12rem; font-family: var(--font-serif); display: flex; align-items: center; gap: 0.4rem;">
                            ${stIcon('quill', 18)} PHẦN A: BẢNG CHUẨN BỊ & PHÂN CÔNG VAI DIỄN
                        </h4>
                        <button type="button" class="btn-primary" onclick="saveScriptRoleAssignments('${code}')" style="font-size: 0.8rem; padding: 0.25rem 0.75rem; background: #800020; border-color: #5D101D; font-weight: 700;">
                            ${stIcon('check', 13)} 💾 Lưu phân vai lớp
                        </button>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div style="background: #fff; border: 1px solid #E0D5C1; padding: 0.75rem 0.95rem; border-radius: 4px;">
                            <div style="font-size: 0.78rem; font-weight: 800; color: #800020; text-transform: uppercase; margin-bottom: 0.25rem;">1. Bối cảnh lịch sử</div>
                            <div style="font-size: 0.88rem; color: #333; line-height: 1.5;">${escapeHtml(script.context || item.context)}</div>
                        </div>
                        <div style="background: #fff; border: 1px solid #E0D5C1; padding: 0.75rem 0.95rem; border-radius: 4px;">
                            <div style="font-size: 0.78rem; font-weight: 800; color: #800020; text-transform: uppercase; margin-bottom: 0.25rem;">2. Trọng tâm học tập</div>
                            <div style="font-size: 0.88rem; color: #333; line-height: 1.5;"><strong>${escapeHtml(script.focus || item.focus)}</strong></div>
                        </div>
                    </div>

                    <div style="background: #FFF8E1; border: 1px solid #FFE082; border-radius: 4px; padding: 0.75rem 1rem; margin-bottom: 1rem;">
                        <div style="font-size: 0.82rem; font-weight: 800; color: #8D6E14; text-transform: uppercase; margin-bottom: 0.45rem;">
                            Bảng kiểm tra sẵn sàng trước khi diễn tập (Checklist):
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.5rem; font-size: 0.84rem; color: #5D4037;">
                            <label style="display: flex; align-items: center; gap: 0.35rem; cursor: pointer;">
                                <input type="checkbox" checked /> 1. Nắm chắc bối cảnh & thông điệp
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.35rem; cursor: pointer;">
                                <input type="checkbox" checked /> 2. Đã phân vai đầy đủ học sinh
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.35rem; cursor: pointer;">
                                <input type="checkbox" checked /> 3. Chuẩn bị đạo cụ / thẻ trực quan
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.35rem; cursor: pointer;">
                                <input type="checkbox" checked /> 4. Đã đọc khớp lượt chuyển cảnh
                            </label>
                        </div>
                    </div>

                    <div style="overflow-x: auto; background: #fff; border: 1px solid #E0D5C1; border-radius: 4px;">
                        <table class="data-table" style="margin: 0; width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #FAF7F2; font-size: 0.84rem; color: #5D101D;">
                                    <th style="width: 40px; text-align: center; border: 1px solid #E0D5C1; padding: 8px;">STT</th>
                                    <th style="width: 170px; border: 1px solid #E0D5C1; padding: 8px;">Tên vai / Nhân vật</th>
                                    <th style="border: 1px solid #E0D5C1; padding: 8px;">Đặc điểm vai & Gợi ý diễn xuất</th>
                                    <th style="width: 220px; border: 1px solid #E0D5C1; padding: 8px;">Học sinh / Nhóm nhận vai (Tự lưu)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rolesRows}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- PHẦN B: BẢNG DIỄN THEO LƯỢT (KỊCH BẢN 3 CẢNH) -->
                <div class="detail-box" style="margin-bottom: 1.25rem; border-left: 5px solid #D4AF37; background: #FFFDF9;" id="scriptDialogueContainer_${code}">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; border-bottom: 1.5px solid #E0D5C1; padding-bottom: 0.5rem; margin-bottom: 0.85rem;">
                        <div>
                            <h4 style="margin: 0; color: #8D6E14; font-size: 1.12rem; font-family: var(--font-serif); display: flex; align-items: center; gap: 0.4rem;">
                                ${stIcon('mask', 18)} PHẦN B: BẢNG DIỄN THEO LƯỢT (TOÀN VĂN KỊCH BẢN GỐC)
                            </h4>
                            <span style="font-size: 0.8rem; color: #777;">Gồm ${scenes.length} cảnh liên hoàn • Bấm giờ 3–5 phút • Đạo cụ thẻ mô phỏng</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap;">
                            <label style="font-size: 0.82rem; font-weight: 700; color: #8D6E14;">Lọc vai của tôi:</label>
                            <select class="select-control" style="font-size: 0.82rem; padding: 0.25rem 0.5rem;" onchange="highlightScriptRole('${code}', this.value)">
                                ${roleFilterOptions}
                            </select>
                        </div>
                    </div>

                    ${scenesHtml}
                </div>

                <!-- PHẦN C: PHẦN KẾT, CÂU HỎI KHÁN GIẢ & GỢI Ý ĐỐI CHIẾU -->
                <div class="detail-box" style="margin-bottom: 1.25rem; border-left: 5px solid #2E7D32; background: #FFFDF9;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; border-bottom: 1.5px solid #E0D5C1; padding-bottom: 0.5rem; margin-bottom: 0.85rem;">
                        <h4 style="margin: 0; color: #2E7D32; font-size: 1.12rem; font-family: var(--font-serif); display: flex; align-items: center; gap: 0.4rem;">
                            ${stIcon('brain', 18)} PHẦN C: PHẦN KẾT, CÂU HỎI KHÁN GIẢ & GỢI Ý ĐỐI CHIẾU
                        </h4>
                        <button type="button" class="btn-secondary" id="btnToggleHints_${code}" onclick="toggleAnswerHints('${code}')" style="font-size: 0.8rem; padding: 0.25rem 0.65rem; border-color: #81C784; color: #2E7D32; background: #E8F5E9; font-weight: 700;">
                            ${stIcon('eye', 13)} Hiện Gợi ý trả lời đối chiếu
                        </button>
                    </div>

                    <div style="margin-bottom: 1rem;">
                        <div style="font-size: 0.84rem; font-weight: 700; color: #2E7D32; text-transform: uppercase; margin-bottom: 0.5rem;">
                            1. Câu hỏi dành cho khán giả sau hoạt cảnh (${qaItems.length} câu):
                        </div>
                        ${qaHtml}
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div style="background: #fff; border: 1px solid #E0D5C1; padding: 0.75rem 0.95rem; border-radius: 4px;">
                            <div style="font-size: 0.78rem; font-weight: 800; color: #C62828; text-transform: uppercase; margin-bottom: 0.25rem;">
                                ⚠️ Lưu ý nội dung & ranh giới diễn xuất:
                            </div>
                            <div style="font-size: 0.86rem; color: #444; line-height: 1.5;">
                                ${escapeHtml(script.partC && script.partC.contentNotes ? script.partC.contentNotes : 'Phân biệt rõ dữ kiện lịch sử có căn cứ và chi tiết kịch bản hư cấu sáng tạo.')}
                            </div>
                        </div>
                        <div style="background: #fff; border: 1px solid #E0D5C1; padding: 0.75rem 0.95rem; border-radius: 4px;">
                            <div style="font-size: 0.78rem; font-weight: 800; color: #1565C0; text-transform: uppercase; margin-bottom: 0.25rem;">
                                📚 Nguồn tra cứu & tài liệu đối chiếu:
                            </div>
                            <div style="font-size: 0.86rem; color: #444; line-height: 1.5;">
                                ${escapeHtml(script.partC && script.partC.sourceRef ? script.partC.sourceRef : script.sources)}
                            </div>
                        </div>
                    </div>

                    <div style="background: #FAFAFA; border: 1px solid #DDD; padding: 0.75rem 0.95rem; border-radius: 4px; font-size: 0.86rem; line-height: 1.5; color: #333;">
                        <div><strong>📖 Hướng dẫn tập:</strong> ${escapeHtml(script.partC && script.partC.rehearsalGuide ? script.partC.rehearsalGuide : 'Đọc phân vai một lượt, thống nhất nhịp chuyển cảnh rồi diễn thử có bấm giờ.')}</div>
                        <div style="margin-top: 0.35rem;"><strong>🎯 Nhiệm vụ nối tiếp:</strong> ${escapeHtml(script.partC && script.partC.nextTask ? script.partC.nextTask : 'Điền phiếu phản hồi đối chiếu dữ kiện lịch sử.')}</div>
                    </div>
                </div>
            `;
        }

        // 7. TRANG CHI TIẾT NỘI DUNG LỊCH SỬ
        function openDetailModal(code, autoPreview = false) {
            const item = catalogData.find(i => i.code === code);
            if (!item) return;

            const examCode = getPostExamCode(item);
            document.getElementById("detailCode").textContent = `Mã bài: ${item.code} • Mã đề: ${examCode} • Khối ${item.grade}`;
            document.getElementById("detailFormat").textContent = item.format;
            document.getElementById("detailLesson").textContent = item.lesson;

            const teacherAuthorHtml = item.originType === "TEACHER_CONTRIBUTED"
                ? `<div style="margin-bottom: 1rem; padding: 0.65rem 0.95rem; background: #FDF4E7; border-left: 4px solid var(--gold); border-radius: 2px; font-size: 0.9rem; color: var(--burgundy);">
             <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
               <div>
                 <strong>${stIcon('teacher', 15)} Biên soạn bởi:</strong> ${escapeHtml(item.author || "Giáo viên Lịch sử THPT")} ${item.school ? `— <em>${escapeHtml(item.school)}</em>` : ""}
                 ${item.createdAt ? `<span style="font-size:0.78rem; color:var(--ink-muted); margin-left:0.5rem;">(Ngày đăng: ${escapeHtml(item.createdAt)})</span>` : ""}
               </div>
               ${item.authLevel ? `<span style="font-size:0.78rem; font-weight:700; color:#2E7D32; background:#E8F5E9; padding:0.2rem 0.6rem; border-radius:3px;">${stIcon('key', 13)} Xác thực: ${escapeHtml(item.authLevel)}</span>` : ""}
             </div>
           </div>`
                : "";

            // Khối tải file kịch bản đa định dạng (hỗ trợ 100% tất cả các bài học trên nền tảng)
            const hasUploadedFile = Boolean(item.fileName || item.fileData || item.fileUrl);
            const uploadedFileName = item.fileName || "";
            const uploadedExt = uploadedFileName ? (uploadedFileName.slice((uploadedFileName.lastIndexOf(".") - 1 >>> 0) + 2) || "FILE").toUpperCase() : "";

            const wordDownloadBanner = hasUploadedFile
                ? `
        <div style="background: #E8F5E9; border: 1.5px solid #81C784; border-radius: 6px; padding: 0.85rem 1.15rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; box-shadow: 0 2px 6px rgba(46,125,50,0.08);">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="color: #1B5E20;">${uploadedExt === 'PDF' ? stIcon('doc-pdf', 30) : (uploadedExt === 'TXT' ? stIcon('doc-txt', 30) : stIcon('doc-word', 30))}</span>
            <div>
              <div style="font-size: 0.75rem; font-weight: 700; color: #1B5E20; text-transform: uppercase;">
                ${stIcon('star', 13)} TỆP ĐÃ TẢI LÊN: ${escapeHtml(uploadedFileName)} (${uploadedExt})
              </div>
              <strong style="color: #1B5E20; font-size: 0.98rem;">Tải về đúng định dạng đã tải lên: ${escapeHtml(uploadedFileName)}</strong>
              <div style="font-size: 0.8rem; color: #2E7D32;">Dung lượng: ${item.fileSize ? Math.round(item.fileSize / 1024) + ' KB' : 'Đã nạp'} • Tải ngay tệp gốc hoặc chuyển đổi sang DOCX, DOC, PDF, TXT, HTML</div>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
            <button class="btn-primary" data-label="👁️ Xem tệp ${escapeHtml(uploadedFileName)}" style="background: #1B5E20; border-color: #0D3810; font-weight: 800; padding: 0.55rem 1.15rem; font-size: 0.88rem; cursor: pointer;" onclick="viewUploadedItemFile('${item.code}')">
              ${stIcon('eye', 15)} Xem tệp ${escapeHtml(uploadedFileName)}
            </button>
            <button class="btn-primary" data-label="⬇️ Tải tệp ${escapeHtml(uploadedFileName)}" style="background: #2E7D32; border-color: #1B5E20; font-weight: 800; padding: 0.55rem 1.15rem; font-size: 0.88rem; cursor: pointer;" onclick="exportLessonOriginalFile(catalogData.find(i=>i.code==='${item.code}'))">
              ${stIcon('download', 15)} Tải tệp ${escapeHtml(uploadedFileName)}
            </button>
            <button class="btn-secondary" style="border-color: #81C784; color: #1B5E20; font-weight: 600; padding: 0.55rem 0.85rem; font-size: 0.84rem; cursor: pointer; background: #fff;" onclick="downloadTeacherWordFile('${item.code}')">
              ${stIcon('folder', 14)} Định dạng khác...
            </button>
          </div>
        </div>`
                : `
        <div style="background: #E8F5E9; border: 1.5px solid #81C784; border-radius: 6px; padding: 0.85rem 1.15rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; box-shadow: 0 2px 6px rgba(46,125,50,0.08);">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="color: #1B5E20;">${stIcon('download', 30)}</span>
            <div>
              <strong style="color: #1B5E20; font-size: 0.98rem;">Hồ sơ Kịch bản chuyển thể Sân khấu hóa — Mã: ${escapeHtml(item.code)}</strong>
              <div style="font-size: 0.8rem; color: #2E7D32;">Tự động xuất trọn bộ Kịch bản, Bảng phân vai & Hướng dẫn sư phạm chuẩn: Word (.docx, .doc), PDF, Text, HTML</div>
            </div>
          </div>
          <button class="btn-primary" style="background: #2E7D32; border-color: #1B5E20; font-weight: 700; padding: 0.5rem 1.25rem; font-size: 0.88rem; cursor: pointer;" onclick="downloadTeacherWordFile('${item.code}')">
            ${stIcon('download', 15)} Tùy chọn tải về máy
          </button>
        </div>`;

            const teacherActionsHtml = `
        <button class="btn-secondary" style="border-color:var(--gold); color:var(--burgundy); font-weight:600;" onclick="if(!isTeacherAuthenticated){ alert('Vui lòng nhập mã khóa giáo viên trước khi sửa bài.'); openTeacherAuthGate('${item.code}'); } else { closeDetailModal(); openTeacherPostModal('${item.code}'); }">${stIcon('quill', 14)} Sửa bài này</button>
        <button class="btn-secondary" style="border-color:#E57373; color:#C62828; font-weight:600;" onclick="if(!isTeacherAuthenticated){ alert('Vui lòng nhập mã khóa giáo viên trước khi xóa bài.'); openTeacherAuthGate('${item.code}'); } else { deleteTeacherPost('${item.code}'); }">${stIcon('trash', 14)} Xóa bài này</button>
      `;

            const charsHtml = (item.characters && item.characters.length > 0)
                ? `<div class="character-dossier-grid">` + item.characters.map(c => {
                    const isFact = c.type === "HISTORICAL_FACT";
                    const badge = isFact
                        ? `<span class="badge-fact">${stIcon('check', 12)} Chính sử xác thực</span>`
                        : `<span class="badge-creative">${stIcon('mask', 12)} Vai kịch bản hóa</span>`;
                    const avatar = isFact ? stIcon('scroll', 20) : stIcon('mask', 20);
                    return `
                      <div class="character-dossier-card">
                        <div class="character-avatar-badge" style="color: var(--burgundy);">${avatar}</div>
                        <div style="flex: 1;">
                          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.25rem; flex-wrap: wrap; gap: 0.25rem;">
                            <strong style="color: var(--burgundy); font-size: 0.95rem;">${escapeHtml(c.name)}</strong>
                            ${badge}
                          </div>
                          <p style="font-size: 0.84rem; color: var(--ink-muted); margin: 0; line-height: 1.5;">${escapeHtml(c.desc)}</p>
                        </div>
                      </div>
                    `;
                }).join("") + `</div>`
                : `<p style="font-size: 0.86rem; color: var(--ink-muted); padding: 0.75rem; background: var(--ivory); border-radius: 4px;">Giáo viên và học sinh có thể xây dựng các vai đại diện phù hợp với tình huống: <em>${escapeHtml(item.scenario)}</em></p>`;

            const linkedDocs = documentStore.filter(d => d.code === item.code);
            const docsHtml = linkedDocs.length > 0
                ? linkedDocs.map(d => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:0.5rem; border:1px solid var(--border); background:var(--ivory); margin-bottom:0.4rem;">
               <span><strong>[${escapeHtml(d.format)}]</strong> ${escapeHtml(d.title)}</span>
              <div style="display:flex; gap:0.4rem;">
                <button class="btn-primary" style="padding: 0.25rem 0.6rem; font-size:0.78rem; background:#2E7D32; border-color:#1B5E20;" onclick="downloadDocument('${d.id}')">${stIcon('download', 13)} Tải về</button>
                <button class="btn-secondary" style="padding: 0.25rem 0.6rem; font-size:0.78rem;" onclick="closeDetailModal(); previewDocument('${d.id}')">Xem tài liệu</button>
              </div>
            </div>
          `).join("")
                : `<p style="font-size: 0.86rem; color: var(--ink-muted);">Chưa có tệp hồ sơ đính kèm riêng cho mã này. Có thể bổ sung tại trang Kho tài liệu.</p>`;

            document.getElementById("detailModalBody").innerHTML = `
        ${teacherAuthorHtml}
        ${wordDownloadBanner}
        <div id="detailFileInlinePreview" style="display: none; margin-bottom: 1.25rem; background: #FAF9F5; border: 1.5px solid var(--border); border-radius: 6px; padding: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem;">
            <h4 id="detailPreviewTitle" style="margin: 0; color: var(--burgundy); font-size: 1rem; display: flex; align-items: center; gap: 0.4rem;">
              ${stIcon('eye', 16)} Xem trước tệp đính kèm
            </h4>
            <button type="button" class="btn-secondary" style="padding: 0.2rem 0.6rem; font-size: 0.8rem;" onclick="toggleDetailInlinePreview(false)">${stIcon('close', 13)} Đóng xem</button>
          </div>
          <div id="detailPreviewContent"></div>
        </div>
        ${(() => {
          const script15 = (typeof getOfficial15Script === "function" ? getOfficial15Script(item.code) : null) || item.scriptData;
          if (script15) {
            return `
              ${render15ScriptDossierHtml(script15, item)}
              ${renderStudentInteractionHub(item)}
              <div class="detail-grid" style="margin-top: 1rem;">
                <div class="detail-box">
                  <h4>Tư liệu lịch sử liên quan</h4>
                  ${docsHtml}
                </div>
                <div class="detail-box">
                  <h4>Nguồn tham khảo kiểm chứng</h4>
                  <p style="font-size: 0.88rem;">${escapeHtml(script15.sources || item.sources || "Sách giáo khoa Lịch sử THPT (Chương trình GDPT 2018).")}</p>
                </div>
              </div>
            `;
          } else {
            return `
              <div class="detail-grid">
                <div class="detail-box">
                  <h4>1. Bối cảnh lịch sử <span class="badge-fact">Dữ kiện SGK</span></h4>
                  <p>${escapeHtml(item.context || "Bối cảnh lịch sử bám sát nội dung bài học trong Sách giáo khoa Lịch sử THPT.")}</p>
                </div>
                <div class="detail-box">
                  <h4>2. Trọng tâm kiến thức cần truyền tải</h4>
                  <p><strong>${escapeHtml(item.focus)}</strong></p>
                  <p style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--ink-muted);">
                    Chủ đề: ${escapeHtml(item.topic)} | Hình thức thể hiện: <strong>${escapeHtml(item.format)}</strong>
                  </p>
                </div>
              </div>

              <div class="detail-box" style="margin-bottom: 1.25rem; border-left: 4px solid var(--bordeaux);">
                <h4>3. Ý tưởng và tình huống sân khấu hóa</h4>
                <p style="font-size: 1rem; font-weight: 500; color: var(--burgundy);">${escapeHtml(item.scenario)}</p>
              </div>

              <div class="detail-box" style="margin-bottom: 1.25rem;">
                <h4>4. Các nhân vật hoặc vai diễn có thể sử dụng (${item.characters ? item.characters.length : 0} vai diễn)</h4>
                ${charsHtml}
              </div>

              ${renderStudentInteractionHub(item)}

              <div class="detail-grid">
                <div class="detail-box">
                  <h4>5. Tư liệu lịch sử liên quan</h4>
                  ${docsHtml}
                </div>
                <div class="detail-box">
                  <h4>6. Nguồn tham khảo kiểm chứng</h4>
                  <p style="font-size: 0.88rem;">${escapeHtml(item.sources || "Sách giáo khoa Lịch sử THPT (Chương trình GDPT 2018).")}</p>
                </div>
              </div>
            `;
          }
        })()}

        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-top: 1rem;">
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            ${teacherActionsHtml}
          </div>
          <div style="display: flex; gap: 0.65rem; flex-wrap: wrap;">
            <button class="btn-secondary" style="background: #E8F5E9; color: #1B5E20; border-color: #81C784; font-weight: 700;" onclick="${hasUploadedFile ? `exportLessonOriginalFile(catalogData.find(i=>i.code==='${item.code}'))` : `downloadTeacherWordFile('${item.code}')`}">
              ${stIcon('download', 14)} ${hasUploadedFile ? `Tải tệp ${escapeHtml(uploadedFileName)}` : 'Tải Kịch bản về máy'}
            </button>
            <button class="btn-secondary" onclick="closeDetailModal()">Đóng</button>
            <button class="btn-primary" onclick="askAiAboutItem('${item.code}')">${stIcon('brain', 15)} Khai thác mục ${item.code} cùng Chatbot AI →</button>
          </div>
        </div>
      `;

            document.getElementById("detailModal").classList.add("open");
            if (autoPreview) {
                setTimeout(() => {
                    if (typeof viewUploadedItemFile === "function") {
                        viewUploadedItemFile(code);
                    }
                }, 60);
            }
        }

        function closeDetailModal() {
            document.getElementById("detailModal").classList.remove("open");
            toggleDetailInlinePreview(false);
        }

        function askAiAboutItem(code) {
            closeDetailModal();
            switchPage("chatbot");
            quickAsk(`Hãy phân tích chi tiết mã nội dung ${code}, giải thích trọng tâm học tập và gợi ý dàn ý hoạt cảnh dựa trên dữ kiện đã kiểm chứng.`);
        }

        // 8. NHẬP / CẬP NHẬT DANH MỤC HÀNG LOẠT (CSV / TSV / JSON)
        function openImportModal() {
            document.getElementById("importModal").classList.add("open");
        }

        function closeImportModal() {
            document.getElementById("importModal").classList.remove("open");
        }

        function processBulkImport() {
            const raw = document.getElementById("bulkImportText").value.trim();
            const replaceAll = document.getElementById("replaceCatalogCheck").checked;
            if (!raw) {
                alert("Vui lòng dán dữ liệu danh mục trước khi lưu.");
                return;
            }

            let newEntries = [];
            try {
                if (raw.startsWith("[")) {
                    newEntries = JSON.parse(raw);
                } else {
                    const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);
                    lines.forEach(line => {
                        const sep = line.includes("\t") ? "\t" : ";";
                        const parts = line.split(sep).map(s => s.trim());
                        if (parts.length >= 5) {
                            const [code, lesson, scenario, format, focus] = parts;
                            const gradeMatch = code.match(/^(10|11|12)/);
                            const grade = gradeMatch ? gradeMatch[1] : "10";
                            newEntries.push({
                                code,
                                grade,
                                topic: `Chủ đề Khối ${grade}`,
                                lesson,
                                scenario,
                                format,
                                focus,
                                originType: "VERIFIED_ORIGINAL",
                                context: `Dữ liệu gốc do người quản trị nạp cho bài học: ${lesson}`,
                                characters: [],
                                relatedDocs: [],
                                sources: `Danh mục gốc Situation (${code})`
                            });
                        }
                    });
                }
            } catch (err) {
                alert("Lỗi định dạng dữ liệu: " + err.message);
                return;
            }

            if (newEntries.length === 0) {
                alert("Không nhận diện được dòng dữ liệu hợp lệ. Hãy đảm bảo đủ 5 trường phân cách bởi dấu ';' hoặc phím Tab.");
                return;
            }

            if (replaceAll) {
                catalogData = newEntries;
            } else {
                newEntries.forEach(entry => {
                    const idx = catalogData.findIndex(i => i.code === entry.code);
                    if (idx >= 0) catalogData[idx] = entry;
                    else catalogData.push(entry);
                });
            }

            populateFilterDropdowns();
            updateHomeCounters();
            updateRagCounters();
            updateRoleBadgeUI();
            applyCatalogFilters();
            closeImportModal();
            alert(`Đã cập nhật thành công ${newEntries.length} mục nội dung vào Danh mục Lịch sử và Kho tri thức RAG!`);
        }

        // ==========================================
        // ==========================================
        // 3 MÃ KHÓA BẢO MẬT ĐĂNG BÀI CHO GIÁO VIÊN (TUYỆT ĐỐI BẢO MẬT)
        // Chỉ có đúng 3 mã khóa hợp lệ theo 3 cấp độ
        // ==========================================
        

// 9. TRANG 4: KHO TÀI LIỆU
        function renderDocuments() {
            const query = (document.getElementById("docSearchInput")?.value || "").trim().toLowerCase();
            const grade = document.getElementById("docGradeFilter")?.value || "ALL";
            const format = document.getElementById("docTypeFilter")?.value || "ALL";

            const filtered = documentStore.filter(doc => {
                const matchGrade = grade === "ALL" || doc.grade === grade;
                const matchFormat = format === "ALL" || doc.format === format;
                const searchable = `${doc.title} ${doc.code} ${doc.source} ${doc.content}`.toLowerCase();
                const matchQuery = !query || searchable.includes(query);
                return matchGrade && matchFormat && matchQuery;
            });

            const container = document.getElementById("docGridContainer");
            if (!container) return;
            if (filtered.length === 0) {
                container.innerHTML = `<div style="grid-column: 1/-1; background:#fff; padding:2rem; text-align:center; border:1px solid var(--border);">Không tìm thấy tài liệu phù hợp.</div>`;
                return;
            }

            container.innerHTML = filtered.map(doc => `
        <div class="doc-card">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span class="doc-type-badge">${escapeHtml(doc.format)}</span>
              <span class="code-badge">Khối ${escapeHtml(doc.grade)} • Mã ${escapeHtml(doc.code || "Chung")}</span>
            </div>
            <h3 style="font-family: var(--font-serif); font-size: 1.2rem; color: var(--burgundy); margin-bottom: 0.4rem;">
              ${escapeHtml(doc.title)}
            </h3>
            <p style="font-size: 0.82rem; color: var(--ink-muted); margin-bottom: 0.5rem;">
              <strong>Nguồn:</strong> ${escapeHtml(doc.source)}<br/>
              <strong>Cập nhật:</strong> ${escapeHtml(doc.updatedAt)}
            </p>
            <p style="font-size: 0.85rem; color: var(--ink); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
              ${escapeHtml(doc.content)}
            </p>
          </div>
          <div style="display: flex; gap: 0.45rem; flex-wrap: wrap; padding-top: 0.65rem; border-top: 1px solid var(--border);">
            <button class="btn-secondary" style="padding: 0.35rem 0.7rem; font-size: 0.8rem;" onclick="previewDocument('${doc.id}')">${stIcon('eye', 14)} Xem trước</button>
            <button class="btn-secondary" style="padding: 0.35rem 0.7rem; font-size: 0.8rem; background: #E8F5E9; color: #1B5E20; border-color: #81C784; font-weight: 600;" onclick="downloadDocument('${doc.id}')">${stIcon('download', 14)} Tải về</button>
            ${isAdmin ? `<button class="btn-secondary" style="padding: 0.35rem 0.7rem; font-size: 0.8rem; color: var(--bordeaux);" onclick="deleteDocument('${doc.id}')">${stIcon('trash', 14)} Xóa</button>` : ""}
          </div>
        </div>
      `).join("");
        }

        function resetDocFilters() {
            document.getElementById("docSearchInput").value = "";
            document.getElementById("docGradeFilter").value = "ALL";
            document.getElementById("docTypeFilter").value = "ALL";
            renderDocuments();
        }

        function previewDocument(docId) {
            const doc = documentStore.find(d => d.id === docId);
            if (!doc) return;
            document.getElementById("previewDocFormat").textContent = `${doc.format} • Khối ${doc.grade} • Mã ${doc.code}`;
            document.getElementById("previewDocTitle").textContent = doc.title;

            let fileData = doc.fileData;
            let fileName = doc.fileName || "";
            if (!fileData && doc.code) {
                const post = (typeof catalogData !== 'undefined' ? catalogData : []).find(p => p.code === doc.code);
                if (post && post.fileData) {
                    fileData = post.fileData;
                    fileName = fileName || post.fileName || "";
                }
            }

            const hasOriginalFile = Boolean(fileData);
            const ext = (fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2) || "FILE").toLowerCase();

            let fileViewerHtml = "";
            if (hasOriginalFile) {
                if (ext === "pdf") {
                    const blob = dataUrlToBlob(fileData);
                    let pdfUrl = fileData;
                    if (blob && typeof URL !== "undefined" && URL.createObjectURL) {
                        if (currentActivePreviewBlobUrl) {
                            try { URL.revokeObjectURL(currentActivePreviewBlobUrl); } catch(e) {}
                        }
                        currentActivePreviewBlobUrl = URL.createObjectURL(blob);
                        pdfUrl = currentActivePreviewBlobUrl;
                    }
                    fileViewerHtml = `
                        <div style="background: #E8F5E9; border: 1.5px solid #81C784; border-radius: 6px; padding: 0.75rem 1rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                            <div>
                                <span style="font-weight: 700; color: #1B5E20;">${stIcon('doc-pdf', 16)} Tệp PDF nguyên bản: ${escapeHtml(fileName)}</span>
                                <div style="font-size: 0.8rem; color: #2E7D32;">Tài liệu lưu trữ trực tiếp trong CSDL SQL/IndexedDB</div>
                            </div>
                            <div style="display:flex; gap:0.5rem; align-items:center;">
                                <a href="${pdfUrl}" target="_blank" class="btn-secondary" style="font-size: 0.8rem; padding: 0.35rem 0.75rem; text-decoration: none; border-color: #81C784; color: #1B5E20; background: #fff;">${stIcon('window', 14)} Mở tab riêng</a>
                                <button type="button" class="btn-primary" style="background:#2E7D32; border-color:#1B5E20; font-size: 0.8rem; padding: 0.35rem 0.85rem;" onclick="exportDocStoreOriginalFile(documentStore.find(d=>d.id==='${doc.id}'))">${stIcon('download', 14)} Tải tệp ${escapeHtml(fileName)}</button>
                            </div>
                        </div>
                        <iframe src="${pdfUrl}" style="width: 100%; height: 520px; border: 1.5px solid #C8E6C9; border-radius: 4px; margin-bottom: 1rem;" title="Xem trước PDF"></iframe>
                    `;
                } else if (ext === "txt") {
                    let plainText = "";
                    try {
                        const b64 = (doc.fileData.split(',')[1] || "").replace(/[\r\n\s]/g, "");
                        if (typeof Buffer !== "undefined") {
                            plainText = Buffer.from(b64, "base64").toString("utf8");
                        } else {
                            plainText = decodeURIComponent(escape(atob(b64)));
                        }
                    } catch(e) {
                        try { plainText = atob(doc.fileData.split(',')[1] || ""); } catch(e2) { plainText = doc.content || ""; }
                    }
                    fileViewerHtml = `
                        <div style="background: #F1F8E9; border: 1px solid #C8E6C9; border-radius: 4px; padding: 0.6rem 0.9rem; margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 600; color: #1B5E20;">${stIcon('doc-txt', 16)} Văn bản thuần: ${escapeHtml(fileName)}</span>
                            <button type="button" class="btn-primary" style="background:#2E7D32; border-color:#1B5E20; font-size: 0.8rem; padding: 0.25rem 0.7rem;" onclick="exportDocStoreOriginalFile(documentStore.find(d=>d.id==='${doc.id}'))">${stIcon('download', 14)} Tải tệp ${escapeHtml(fileName)}</button>
                        </div>
                        <pre style="max-height: 480px; overflow-y: auto; white-space: pre-wrap; font-family: 'Consolas', 'Courier New', monospace; font-size: 0.92rem; line-height: 1.65; background: #fff; border: 1px solid var(--border); padding: 1.25rem; border-radius: 4px; margin-bottom: 1rem;">${escapeHtml(plainText)}</pre>
                    `;
                } else {
                    fileViewerHtml = `
                        <div style="background: #E8F5E9; border: 1.5px solid #81C784; border-radius: 6px; padding: 0.85rem 1.15rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
                            <div>
                                <span style="font-weight: 700; color: #1B5E20; font-size: 0.95rem;">${stIcon('doc-word', 16)} Tệp Word nguyên bản: ${escapeHtml(fileName)}</span>
                                <div style="font-size: 0.8rem; color: #2E7D32;">Tệp Microsoft Word lưu trữ đầy đủ trong hệ thống. Tải về để mở chỉnh sửa trên Word/Docs.</div>
                            </div>
                            <button type="button" class="btn-primary" style="background:#2E7D32; border-color:#1B5E20; font-size: 0.85rem; padding: 0.45rem 1rem;" onclick="exportDocStoreOriginalFile(documentStore.find(d=>d.id==='${doc.id}'))">${stIcon('download', 14)} Tải tệp ${escapeHtml(fileName)}</button>
                        </div>
                    `;
                }
            }

            document.getElementById("previewDocBody").innerHTML = `
        <div style="margin-bottom: 0.85rem; font-size: 0.85rem; color: var(--ink-muted);">
          <strong>Nguồn kiểm chứng:</strong> ${escapeHtml(doc.source)} | <strong>Ngày cập nhật:</strong> ${escapeHtml(doc.updatedAt)}
        </div>
        ${fileViewerHtml}
        ${(!hasOriginalFile || (ext !== 'pdf' && ext !== 'txt')) ? `
        <div style="background: var(--ivory); border: 1px solid var(--border); padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
          <h5 style="margin: 0 0 0.5rem 0; color: var(--burgundy); font-size: 0.95rem;">Nội dung trích yếu:</h5>
          <pre style="white-space: pre-wrap; font-family: var(--font-sans); background: #fff; border: 1px solid var(--border); padding: 1.25rem; font-size: 0.9rem; line-height: 1.65; max-height: 400px; overflow-y: auto;">${escapeHtml(doc.content)}</pre>
        </div>` : ''}
        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap;">
          ${hasOriginalFile ? `
          <button class="btn-primary" style="background:#2E7D32; border-color:#1B5E20; font-weight:700;" onclick="exportDocStoreOriginalFile(documentStore.find(d=>d.id==='${doc.id}'))">${stIcon('download', 14)} Tải tệp ${escapeHtml(fileName)}</button>
          <button class="btn-secondary" style="border-color:#81C784; color:#1B5E20;" onclick="downloadDocument('${doc.id}')">${stIcon('folder', 14)} Định dạng khác...</button>
          ` : `
          <button class="btn-primary" style="background:#2E7D32; border-color:#1B5E20;" onclick="downloadDocument('${doc.id}')">${stIcon('download', 14)} Tùy chọn tải về</button>
          `}
          <button class="btn-secondary" onclick="closeDocPreviewModal()">Đóng</button>
        </div>
      `;
            document.getElementById("docPreviewModal").classList.add("open");
        }

        function closeDocPreviewModal() {
            document.getElementById("docPreviewModal").classList.remove("open");
            if (currentActivePreviewBlobUrl) {
                try { URL.revokeObjectURL(currentActivePreviewBlobUrl); } catch(e) {}
                currentActivePreviewBlobUrl = null;
            }
        }

        function downloadDocument(docId) {
            // Khi nhấn nút tải hồ sơ tư liệu, mở hộp thoại hỏi Thầy/Cô và các bạn muốn tải về bằng định dạng nào
            openDocDownloadFormatModal(docId);
        }

        function openAddDocModal() {
            document.getElementById("addDocModal").classList.add("open");
        }

        function closeAddDocModal() {
            document.getElementById("addDocModal").classList.remove("open");
        }

        function readDocFileInput(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = e => {
                document.getElementById("newDocContent").value = e.target.result;
                if (!document.getElementById("newDocTitle").value) {
                    document.getElementById("newDocTitle").value = file.name;
                }
            };
            reader.readAsText(file);
            event.target.value = "";
        }

        function saveNewDocument() {
            const title = document.getElementById("newDocTitle").value.trim();
            const code = document.getElementById("newDocCode").value.trim() || "CHUNG";
            const grade = document.getElementById("newDocGrade").value;
            const format = document.getElementById("newDocFormat").value;
            const source = document.getElementById("newDocSource").value.trim() || "Tài liệu bổ sung của Giáo viên/Quản trị viên";
            const content = document.getElementById("newDocContent").value.trim();

            if (!title || !content) {
                alert("Vui lòng nhập đầy đủ Tiêu đề và Nội dung tài liệu.");
                return;
            }

            const newDoc = {
                id: "DOC-" + Date.now().toString().slice(-5),
                title,
                code,
                grade,
                format,
                updatedAt: new Date().toISOString().slice(0, 10),
                source,
                content
            };

            commitDatabaseMutation('DOCUMENT_SAVED', { doc: newDoc });
            closeAddDocModal();
            alert("Đã nạp tài liệu vào Kho, đồng bộ toàn hệ thống và lập chỉ mục cho Chatbot AI!");
        }

        function deleteDocument(docId) {
            if (!confirm("Bạn có chắc muốn xóa tài liệu này khỏi Kho kiến thức?")) return;
            commitDatabaseMutation('DOCUMENT_DELETED', { docId });
        }

        // 10. TRANG 3: CHATBOT AI SITUATION & CƠ CHẾ TRUY XUẤT RAG THỰC TẾ
        function updateRagCounters() {
            const elCat = document.getElementById("ragCatalogCount");
            const elDoc = document.getElementById("ragDocCount");
            if (elCat) elCat.textContent = catalogData.length;
            if (elDoc) elDoc.textContent = documentStore.length;
        }

        function createNewChatSession() {
            const newId = "sess-" + Date.now();
            chatSessions.unshift({
                id: newId,
                title: `Phiên tra cứu #${chatSessions.length + 1}`,
                messages: [
                    {
                        role: "bot",
                        text: "Đã khởi tạo phiên trò chuyện mới. Dữ liệu giữa các phiên được tách biệt độc lập. Hãy nhập mã bài học (VD: `10.04A`), tên sự kiện hoặc đính kèm tài liệu để bắt đầu.",
                        citations: []
                    }
                ]
            });
            activeSessionId = newId;
            renderChatSessions();
            renderActiveChat();
        }

        function selectChatSession(id) {
            activeSessionId = id;
            renderChatSessions();
            renderActiveChat();
        }

        function renderChatSessions() {
            const container = document.getElementById("chatSessionList");
            if (!container) return;
            container.innerHTML = chatSessions.map(s => `
        <div class="session-item ${s.id === activeSessionId ? 'active' : ''}" onclick="selectChatSession('${s.id}')">
          <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(s.title)}</span>
          <span style="font-size:0.72rem; color:var(--ink-muted);">${s.messages.length} tin</span>
        </div>
      `).join("");
        }

        function renderActiveChat() {
            const sess = chatSessions.find(s => s.id === activeSessionId);
            if (!sess) return;
            const titleEl = document.getElementById("activeSessionTitle");
            if (titleEl) titleEl.textContent = sess.title;

            const box = document.getElementById("chatMessagesBox");
            if (box) {
                box.innerHTML = sess.messages.map(m => {
                    const citeHtml = (m.citations && m.citations.length > 0)
                        ? `<div class="msg-citations">Nguồn đối chiếu: ${m.citations.map(c => `<span class="citation-chip" onclick="inspectCitation('${c}')">${escapeHtml(c)}</span>`).join("")}</div>`
                        : "";
                    return `
          <div class="msg-bubble ${m.role === 'user' ? 'msg-user' : 'msg-bot'}">
            <div>${formatMarkdown(m.text)}</div>
            ${citeHtml}
          </div>
        `;
                }).join("");
                box.scrollTop = box.scrollHeight;
            }
        }

        function quickAsk(promptText) {
            const input = document.getElementById("chatInput");
            if (input) input.value = promptText;
            sendChatMessage();
        }

        function handleChatFileAttachment(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = e => {
                const content = e.target.result;
                const newDocId = "DOC-UPLOAD-" + Date.now().toString().slice(-4);
                documentStore.unshift({
                    id: newDocId,
                    title: `Tài liệu đính kèm phiên chat: ${file.name}`,
                    code: "CHAT-DOC",
                    grade: "10",
                    format: "TXT",
                    updatedAt: new Date().toISOString().slice(0, 10),
                    source: `Người dùng tải lên trực tiếp (${file.name})`,
                    content
                });
                updateRagCounters();
            updateRoleBadgeUI();
                renderDocuments();
                quickAsk(`Tôi vừa đính kèm tài liệu "${file.name}" (Mã ${newDocId}). Hãy tóm tắt nội dung chính và các dữ kiện lịch sử có trong tài liệu này.`);
            };
            reader.readAsText(file);
            event.target.value = "";
        }

        // THUẬT TOÁN TRUY XUẤT RAG (HYBRID KEYWORD + FIELD WEIGHTING)
        function retrieveKnowledge(query) {
            const cleanQ = query.toLowerCase();
            const tokens = cleanQ.split(/[\s,.;:?!"'()]+/).filter(t => t.length >= 2);

            const scoredCatalog = catalogData.map(item => {
                let score = 0;
                const codeLower = item.code.toLowerCase();
                if (cleanQ.includes(codeLower)) score += 35;

                const hay = `${item.code} ${item.lesson} ${item.scenario} ${item.format} ${item.focus} ${item.topic} ${item.context || ""}`.toLowerCase();
                tokens.forEach(tk => {
                    if (hay.includes(tk)) score += 3;
                    if (item.lesson.toLowerCase().includes(tk)) score += 2;
                    if (item.scenario.toLowerCase().includes(tk)) score += 2;
                    if (item.format.toLowerCase().includes(tk)) score += 2;
                });
                return { type: "CATALOG", id: item.code, score, data: item };
            }).filter(r => r.score > 4);

            const scoredDocs = documentStore.map(doc => {
                let score = 0;
                if (cleanQ.includes(doc.id.toLowerCase()) || (doc.code && cleanQ.includes(doc.code.toLowerCase()))) score += 30;
                const hay = `${doc.title} ${doc.code} ${doc.source} ${doc.content}`.toLowerCase();
                tokens.forEach(tk => {
                    if (hay.includes(tk)) score += 3;
                });
                return { type: "DOCUMENT", id: doc.id, score, data: doc };
            }).filter(r => r.score > 4);

            const combined = [...scoredCatalog, ...scoredDocs].sort((a, b) => b.score - a.score);
            return combined.slice(0, 4);
        }

        async function sendChatMessage() {
            const input = document.getElementById("chatInput");
            const text = input.value.trim();
            if (!text) return;

            const sess = chatSessions.find(s => s.id === activeSessionId);
            sess.messages.push({ role: "user", text });
            if (sess.messages.length === 2) {
                sess.title = text.slice(0, 28) + (text.length > 28 ? "..." : "");
            }
            input.value = "";
            renderChatSessions();
            renderActiveChat();

            // 1. Truy xuất RAG từ Danh mục & Kho tài liệu
            const hits = retrieveKnowledge(text);
            renderRightPanelCitations(hits);

            // 2. Nếu không tìm thấy căn cứ trong Kho kiến thức
            if (hits.length === 0) {
                sess.messages.push({
                    role: "bot",
                    text: "**Thông báo từ Kho kiến thức Situation:**\nHiện tại, Danh mục nội dung lịch sử (Khối 10, 11, 12) và Kho tài liệu chưa có đủ căn cứ hoặc tài liệu khớp với truy vấn của bạn.\n\nTheo nguyên tắc kiểm chứng nghiêm ngặt, hệ thống **không tự suy diễn hoặc bịa đặt thông tin lịch sử ngoài kho tư liệu**. Bạn có thể:\n- Thử tìm kiếm bằng mã bài học (VD: `10.04A`, `11.08A`, `11.09A`, `12.08A`) hoặc hình thức (`Hoạt cảnh đời sống`, `Sân khấu tư liệu`, `Mô phỏng nghị sự`).\n- Bổ sung tài liệu mới vào **Kho tài liệu** hoặc đính kèm tệp trực tiếp ở ô chat.",
                    citations: []
                });
                renderActiveChat();
                return;
            }

            const citationIds = hits.map(h => h.id);

            // 3. Nếu người dùng đã cấu hình Gemini API Key thực tế -> Gọi API kèm ngữ cảnh RAG
            if (geminiApiKey) {
                try {
                    const contextText = hits.map(h => {
                        if (h.type === "CATALOG") {
                            const c = h.data;
                            return `[MỤC DANH MỤC ${c.code}] Bài học: ${c.lesson} | Gợi ý hoạt cảnh: ${c.scenario} | Hình thức: ${c.format} | Trọng tâm: ${c.focus} | Bối cảnh: ${c.context} | Nguồn: ${c.sources}`;
                        } else {
                            const d = h.data;
                            return `[TÀI LIỆU ${d.id} - Mã ${d.code}] Tiêu đề: ${d.title} | Nguồn: ${d.source} | Nội dung: ${d.content}`;
                        }
                    }).join("\n\n");

                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(geminiApiKey)}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{
                                    text: `Bạn là Trợ lý AI của nền tảng lịch sử Situation. Chỉ sử dụng ngữ cảnh được cung cấp dưới đây để trả lời câu hỏi. Phân biệt rõ [DỮ KIỆN LỊCH SỬ XÁC THỰC] và [GỢI Ý SÁNG TẠO HOẠT CẢNH]. Tuyệt đối không tự bịa nguồn dẫn.\n\nNGỮ CẢNH KHO KIẾN THỨC:\n${contextText}\n\nCÂU HỎI CỦA NGƯỜI DÙNG: ${text}`
                                }]
                            }]
                        })
                    });
                    const data = await response.json();
                    const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (aiReply) {
                        sess.messages.push({ role: "bot", text: aiReply, citations: citationIds });
                        renderActiveChat();
                        return;
                    }
                } catch (err) {
                    console.warn("Lỗi kết nối Gemini API, chuyển về chế độ Local RAG:", err);
                }
            }

            // 4. Chế độ Local Extractive RAG (Tổng hợp chính xác từ dữ liệu truy xuất được)
            let replyParts = [`Dựa trên kết quả truy xuất từ **Kho kiến thức Situation** (${hits.length} nguồn khớp nhất), dưới đây là thông tin đối chiếu chính xác:`];

            hits.forEach(h => {
                if (h.type === "CATALOG") {
                    const c = h.data;
                    replyParts.push(
                        `\n### 📌 Mã nội dung: \`${c.code}\` (Khối ${c.grade})\n` +
                        `- **Bài học SGK:** ${c.lesson}\n` +
                        `- **Gợi ý hoạt cảnh & tình huống:** ${c.scenario}\n` +
                        `- **Hình thức phù hợp:** ${c.format}\n` +
                        `- **Trọng tâm học tập:** ${c.focus}\n` +
                        `- **[Dữ kiện lịch sử]:** ${c.context || "Bám sát nội dung SGK."}\n` +
                        `- **[Gợi ý triển khai vai diễn]:** ${(c.characters && c.characters.length > 0) ? c.characters.map(ch => `${ch.name} (${ch.type === 'HISTORICAL_FACT' ? 'Nhân vật lịch sử' : 'Vai đại diện sáng tạo'})`).join(", ") : "Xây dựng các vai đại diện nghề nghiệp/tầng lớp xã hội đúng bối cảnh bài học."}`
                    );
                } else {
                    const d = h.data;
                    replyParts.push(
                        `\n### 📄 Tài liệu đối chiếu: \`${d.id}\` — ${d.title}\n` +
                        `- **Nguồn kiểm chứng:** ${d.source}\n` +
                        `- **Trích xuất nội dung:** ${d.content.slice(0, 360)}${d.content.length > 360 ? "..." : ""}`
                    );
                }
            });

            sess.messages.push({
                role: "bot",
                text: replyParts.join("\n"),
                citations: citationIds
            });
            renderActiveChat();
        }

        function renderRightPanelCitations(hits) {
            const container = document.getElementById("activeCitationsContainer");
            if (!container) return;
            if (!hits || hits.length === 0) {
                container.innerHTML = `<div class="ref-card">Không tìm thấy tài liệu đối chiếu nào trong Kho kiến thức cho câu hỏi vừa rồi.</div>`;
                return;
            }

            container.innerHTML = hits.map(h => {
                if (h.type === "CATALOG") {
                    const c = h.data;
                    return `
            <div class="ref-card">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="code-badge">${escapeHtml(c.code)}</span>
                <span style="font-size:0.72rem; color:var(--ink-muted);">Độ khớp: ${h.score}đ</span>
              </div>
              <strong style="display:block; margin-top:0.35rem; color:var(--burgundy);">${escapeHtml(c.lesson)}</strong>
              <p style="margin-top:0.25rem; color:var(--ink-muted);">${escapeHtml(c.scenario)}</p>
              <button class="btn-secondary" style="margin-top:0.5rem; padding:0.25rem 0.55rem; font-size:0.75rem; width:100%;" onclick="openDetailModal('${c.code}')">Mở trang chi tiết ${escapeHtml(c.code)}</button>
            </div>
          `;
                } else {
                    const d = h.data;
                    return `
            <div class="ref-card">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="doc-type-badge">${escapeHtml(d.format)}</span>
                <span style="font-size:0.72rem; color:var(--ink-muted);">Mã: ${escapeHtml(d.id)}</span>
              </div>
              <strong style="display:block; margin-top:0.35rem; color:var(--burgundy);">${escapeHtml(d.title)}</strong>
              <p style="margin-top:0.25rem; color:var(--ink-muted);">Nguồn: ${escapeHtml(d.source)}</p>
              <button class="btn-secondary" style="margin-top:0.5rem; padding:0.25rem 0.55rem; font-size:0.75rem; width:100%;" onclick="previewDocument('${d.id}')">Xem tài liệu gốc</button>
            </div>
          `;
                }
            }).join("");
        }

        function inspectCitation(id) {
            const cat = catalogData.find(c => c.code === id);
            if (cat) {
                openDetailModal(cat.code);
                return;
            }
            const doc = documentStore.find(d => d.id === id);
            if (doc) {
                previewDocument(doc.id);
            }
        }

        // 11. CẤU HÌNH API AI
        function openApiConfigModal() {
            document.getElementById("geminiApiKeyInput").value = geminiApiKey;
            document.getElementById("apiConfigModal").classList.add("open");
        }

        function closeApiConfigModal() {
            document.getElementById("apiConfigModal").classList.remove("open");
        }

        function saveApiKey() {
            geminiApiKey = document.getElementById("geminiApiKeyInput").value.trim();
            try {
                if (geminiApiKey) {
                    localStorage.setItem("situation_gemini_api_key", geminiApiKey);
                } else {
                    localStorage.removeItem("situation_gemini_api_key");
                }
            } catch (e) { }
            updateApiStatusDisplay();
            closeApiConfigModal();
        }

        function clearApiKey() {
            document.getElementById("geminiApiKeyInput").value = "";
            saveApiKey();
        }

        function updateApiStatusDisplay() {
            const pill = document.getElementById("apiStatusPill");
            if (!pill) return;
            if (geminiApiKey) {
                pill.textContent = "Chế độ: Đã kết nối Gemini API + RAG Situation";
                pill.classList.add("connected");
            } else {
                pill.textContent = "Chế độ: Truy xuất RAG Nội bộ (Chưa cấu hình API ngoài)";
                pill.classList.remove("connected");
            }
        }

        // TIỆN ÍCH ĐỊNH DẠNG AN TOÀN
        function escapeHtml(str) {
            if (!str) return "";
            return String(str)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;");
        }

        function formatMarkdown(text) {
            let safe = escapeHtml(text);
            safe = safe.replace(/^### (.*)$/gm, '<h4 style="color:var(--burgundy); margin: 0.6rem 0 0.25rem; font-family:var(--font-serif); font-size:1.1rem;">$1</h4>');
            safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            safe = safe.replace(/`(.*?)`/g, '<code style="background:var(--ivory); padding:0.1rem 0.35rem; border:1px solid var(--border); color:var(--bordeaux); font-weight:700;">$1</code>');
            safe = safe.replace(/\n/g, '<br/>');
            return safe;
        }
    

if (typeof window !== "undefined") {
    // Notifications / Toasts
    window.showSituationToast = showSituationToast;
    window.dismissSituationToast = dismissSituationToast;

    // Student Interaction & Roleplay Submissions
    window.getSubmissionsForPost = getSubmissionsForPost;
    window.renderStudentInteractionHub = renderStudentInteractionHub;
    window.submitStudentWork = submitStudentWork;
    window.submitRoleplayScript = submitStudentWork;
    window.toggleStudentBookmark = toggleStudentBookmark;
    window.isItemBookmarked = isItemBookmarked;

    // Navigation & Page Switching
    window.switchPage = switchPage;
    window.openGradeCatalog = openGradeCatalog;
    window.toggleAdminMode = toggleAdminMode;
    window.selectGradeTab = selectGradeTab;
    window.filterByGrade = selectGradeTab;

    // Enhanced Role & Password Security (RBAC)
    window.handleRoleBadgeClick = handleRoleBadgeClick;
    window.openSecurityRoleModal = openSecurityRoleModal;
    window.closeSecurityRoleModal = closeSecurityRoleModal;
    window.onRoleSelectionChanged = onRoleSelectionChanged;
    window.toggleRolePasswordVisibility = toggleRolePasswordVisibility;
    window.submitRoleAuthPassword = submitRoleAuthPassword;
    window.lockAndLogoutSession = lockAndLogoutSession;
    window.toggleCustomPasswordSection = toggleCustomPasswordSection;
    window.evaluatePasswordStrength = evaluatePasswordStrength;
    window.saveCustomAdminPassword = saveCustomAdminPassword;
    window.resetCustomAdminPassword = resetCustomAdminPassword;
    window.updateRoleBadgeUI = updateRoleBadgeUI;

    // Catalog & Filtering & Pagination
    window.applyCatalogFilters = applyCatalogFilters;
    window.debouncedApplyCatalogFilters = debouncedApplyCatalogFilters;
    window.resetCatalogFilters = resetCatalogFilters;
    window.renderCatalogView = renderCatalogView;
    window.renderCatalogTable = renderCatalogView;
    window.renderCatalogCards = renderCatalogView;
    window.goToCatalogPage = goToCatalogPage;
    window.changePage = goToCatalogPage;

    // Item Detail Modal
    window.openDetailModal = openDetailModal;
    window.closeDetailModal = closeDetailModal;
    window.askAiAboutItem = askAiAboutItem;

    // Bulk Import Modal
    window.openImportModal = openImportModal;
    window.closeImportModal = closeImportModal;
    window.processBulkImport = processBulkImport;

    // Knowledge Store / Documents
    window.renderDocuments = renderDocuments;
    window.resetDocFilters = resetDocFilters;
    window.previewDocument = previewDocument;
    window.closeDocPreviewModal = closeDocPreviewModal;
    window.downloadDocument = downloadDocument;
    window.openAddDocModal = openAddDocModal;
    window.closeAddDocModal = closeAddDocModal;
    window.openDocUploadModal = openAddDocModal;
    window.closeDocUploadModal = closeAddDocModal;
    window.readDocFileInput = readDocFileInput;
    window.saveNewDocument = saveNewDocument;
    window.saveCustomDocument = saveNewDocument;
    window.deleteDocument = deleteDocument;

    // Realtime Sync Simulator Modal
    window.openSyncSimulatorModal = openSyncSimulatorModal;
    window.closeSyncSimulatorModal = closeSyncSimulatorModal;
    window.openNewStudentTab = openNewStudentTab;
    window.runInteractiveSyncDemo = runInteractiveSyncDemo;

    // Chatbot AI & RAG
    window.updateRagCounters = updateRagCounters;
    window.createNewChatSession = createNewChatSession;
    window.selectChatSession = selectChatSession;
    window.renderChatSessions = renderChatSessions;
    window.renderActiveChat = renderActiveChat;
    window.quickAsk = quickAsk;
    window.handleChatFileAttachment = handleChatFileAttachment;
    window.retrieveKnowledge = retrieveKnowledge;
    window.sendChatMessage = sendChatMessage;
    window.renderRightPanelCitations = renderRightPanelCitations;
    window.inspectCitation = inspectCitation;

    // API Config Modal
    window.openApiConfigModal = openApiConfigModal;
    window.closeApiConfigModal = closeApiConfigModal;
    window.saveApiKey = saveApiKey;
    window.clearApiKey = clearApiKey;
    window.updateApiStatusDisplay = updateApiStatusDisplay;

    // Teacher Submissions management
    window.updateTeacherSubmissionsCountBadge = updateTeacherSubmissionsCountBadge;
    window.renderTeacherSubmissionsList = renderTeacherSubmissionsList;
    window.submitTeacherFeedback = submitTeacherFeedback;

    // Counters & UI updates
    window.updateHomeCounters = updateHomeCounters;
    window.updateGradeTabBadges = updateGradeTabBadges;
    window.populateFilterDropdowns = populateFilterDropdowns;

    // Real Data Inventory & Metrics Audit
    window.calculateRealMetrics = calculateRealMetrics;
    window.animateCountUp = animateCountUp;
    window.openRealDataInventoryModal = openRealDataInventoryModal;
    window.closeRealDataInventoryModal = closeRealDataInventoryModal;
    window.filterInventoryCharacters = filterInventoryCharacters;
    window.searchInventoryCharacters = searchInventoryCharacters;
    window.renderRealDataInventoryModal = renderRealDataInventoryModal;
    window.exportRealDataInventoryReport = exportRealDataInventoryReport;

    // Formatting utilities
    window.escapeHtml = escapeHtml;
    window.formatMarkdown = formatMarkdown;

    // 15 Hoạt cảnh Chuẩn Sư phạm
    window.getScriptRoleAssignments = getScriptRoleAssignments;
    window.autoSaveScriptRoleAssignment = autoSaveScriptRoleAssignment;
    window.saveScriptRoleAssignments = saveScriptRoleAssignments;
    window.toggleTeleprompter = toggleTeleprompter;
    window.toggleAnswerHints = toggleAnswerHints;
    window.highlightScriptRole = highlightScriptRole;
    window.openRehearsalGuideModal = openRehearsalGuideModal;
    window.closeRehearsalGuideModal = closeRehearsalGuideModal;
    window.render15ShowcaseCards = render15ShowcaseCards;
    window.switch15ShowcaseTab = switch15ShowcaseTab;
    window.openCatalogWithOfficial15 = openCatalogWithOfficial15;
    window.render15ScriptDossierHtml = render15ScriptDossierHtml;
}
