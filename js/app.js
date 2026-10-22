/**
 * ====================================================================
 * SITUATION APPLICATION UI, NAVIGATION & RAG CHATBOT (js/app.js)
 * ====================================================================
 * Điều hướng trang (switchPage), hiển thị danh mục, bộ lọc,
 * hộp thoại chi tiết, phân vai học sinh, kho tài liệu và Chatbot AI.
 */

function showSituationToast({ title, message, badge, code, actionText, onAction, duration = 8000 }) {
            const container = document.getElementById("situationToastContainer");
            if (!container || typeof container.appendChild !== "function") return;

            const toastId = "toast_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
            const toastEl = document.createElement("div");
            toastEl.id = toastId;
            toastEl.className = "situation-toast";

            toastEl.innerHTML = `
                <div style="font-size: 1.6rem; flex-shrink: 0; line-height: 1;">${badge || '🔔'}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 700; color: var(--gold-light); font-size: 0.95rem; margin-bottom: 0.2rem; display: flex; align-items: center; justify-content: space-between;">
                        <span>${escapeHtml(title || 'Thông báo mới')}</span>
                    </div>
                    <div style="font-size: 0.85rem; color: #E0E0E0; line-height: 1.45; margin-bottom: 0.55rem;">
                        ${escapeHtml(message || '')}
                    </div>
                    ${actionText ? `
                        <button type="button" class="btn-primary" style="background: var(--gold); color: #1B0E07; font-size: 0.78rem; font-weight: 800; padding: 0.25rem 0.75rem; border-color: #FFF; cursor: pointer;" id="toastActionBtn_${toastId}">
                            ${escapeHtml(actionText)}
                        </button>
                    ` : ''}
                </div>
                <button type="button" style="background: transparent; border: none; color: #AAA; font-size: 1.1rem; cursor: pointer; padding: 0 0.2rem; line-height: 1;" onclick="dismissSituationToast('${toastId}')" title="Đóng">✕</button>
            `;

            container.appendChild(toastEl);

            if (actionText) {
                const btn = document.getElementById(`toastActionBtn_${toastId}`);
                if (btn) {
                    btn.addEventListener("click", () => {
                        dismissSituationToast(toastId);
                        if (typeof onAction === "function") {
                            onAction();
                        } else if (code) {
                            openDetailModal(code, true);
                        }
                    });
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
                        <h5 style="margin: 0 0 0.5rem 0; color: #33691E; font-size: 0.9rem;">📋 Danh sách kịch bản phân vai các nhóm đã nộp cho bài này (${submissions.length}):</h5>
                        <div style="display: flex; flex-direction: column; gap: 0.65rem;">
                            ${submissions.map(sub => `
                                <div style="background: #fff; border: 1px solid var(--border); border-radius: 4px; padding: 0.75rem 0.95rem; border-left: 4px solid ${sub.status === 'GRADED' ? '#2E7D32' : '#FF9800'};">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; flex-wrap: wrap; gap: 0.4rem;">
                                        <div>
                                            <strong style="color: var(--burgundy); font-size: 0.92rem;">👤 ${escapeHtml(sub.studentName)}</strong>
                                            <span style="font-size: 0.8rem; background: #EDE7F6; color: #512DA8; padding: 0.1rem 0.45rem; border-radius: 3px; margin-left: 0.35rem;">Vai: ${escapeHtml(sub.roleName)}</span>
                                        </div>
                                        <div>
                                            ${sub.status === 'GRADED'
                                                ? `<span style="font-size: 0.78rem; background: #E8F5E9; color: #2E7D32; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 3px;">✅ Thầy/Cô đã chấm: ${escapeHtml(sub.teacherGrade)}</span>`
                                                : `<span style="font-size: 0.78rem; background: #FFF3E0; color: #E65100; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 3px;">⏳ Chờ Thầy/Cô nhận xét</span>`
                                            }
                                            <span style="font-size: 0.75rem; color: var(--ink-muted); margin-left: 0.4rem;">📅 ${escapeHtml(sub.submittedAt)}</span>
                                        </div>
                                    </div>
                                    <div style="font-size: 0.86rem; color: #333; line-height: 1.5; white-space: pre-wrap; background: #FAFAFA; border: 1px solid #EEE; padding: 0.5rem 0.75rem; border-radius: 3px; margin-bottom: 0.4rem;">${escapeHtml(sub.content)}</div>
                                    ${sub.teacherFeedback ? `
                                        <div style="background: #F1F8E9; border-left: 3px solid #689F38; padding: 0.5rem 0.75rem; border-radius: 3px; font-size: 0.84rem; color: #1B5E20; margin-top: 0.4rem;">
                                            <strong>💬 Lời phê của Thầy/Cô (${escapeHtml(sub.feedbackAuthor || item.author || "Giáo viên")}):</strong> ${escapeHtml(sub.teacherFeedback)}
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
              <span>🎭</span> Không gian Tương tác Học sinh: Đăng ký Phân vai & Nộp Kịch bản nhóm
            </h4>
            <button type="button" class="btn-secondary" id="btnBookmarkItem_${item.code}" style="font-size: 0.8rem; padding: 0.25rem 0.65rem; border-color: #C0CA33; color: #33691E; background: #fff;" onclick="toggleStudentBookmark('${item.code}')">
              ${isBookmarked ? '⭐ Đã lưu vào Góc học tập' : '☆ Lưu vào Góc học tập'}
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
                📤 Gửi Kịch bản / Bài làm cho Giáo viên
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

                            <div style="background: #FAFAFA; border: 1px solid #EEE; padding: 0.65rem 0.85rem; border-radius: 4px; font-size: 0.88rem; line-height: 1.55; white-space: pre-wrap; margin-bottom: 0.65rem;">
                                ${escapeHtml(sub.content)}
                            </div>

                            ${sub.teacherFeedback ? `
                                <div style="background: #F1F8E9; border-left: 3px solid #689F38; padding: 0.5rem 0.75rem; border-radius: 3px; font-size: 0.85rem; color: #1B5E20; margin-bottom: 0.65rem;">
                                    <strong>💬 Nhận xét của Thầy/Cô:</strong> ${escapeHtml(sub.teacherFeedback)} (Điểm: <strong>${escapeHtml(sub.teacherGrade)}</strong>)
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
                                        ✓ Lưu & Gửi cho Học sinh
                                    </button>
                                    <button type="button" class="btn-secondary" style="font-size: 0.8rem; padding: 0.35rem 0.65rem;" onclick="document.getElementById('gradeFormBox_${sub.id}').style.display='none'">
                                        Hủy
                                    </button>
                                </div>
                            </div>

                            <div style="display: flex; justify-content: flex-end; gap: 0.45rem; margin-top: 0.35rem;">
                                <button type="button" class="btn-secondary" style="font-size: 0.78rem; padding: 0.3rem 0.65rem; color: #1B5E20; border-color: #81C784;" onclick="document.getElementById('gradeFormBox_${sub.id}').style.display='block'">
                                    ${sub.status === 'GRADED' ? '✏️ Sửa điểm & Lời phê' : '📝 Chấm điểm & Nhận xét'}
                                </button>
                                <button type="button" class="btn-secondary" style="font-size: 0.78rem; padding: 0.3rem 0.55rem; color: var(--burgundy);" onclick="openDetailModal('${sub.postCode}')">
                                    👁️ Mở bài học
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
                btn.textContent = studentBookmarks.has(code) ? "⭐ Đã lưu vào Góc học tập" : "☆ Lưu vào Góc học tập";
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
            updateApiStatusDisplay();
            populateFilterDropdowns();
            updateHomeCounters();
            applyCatalogFilters();
            renderDocuments();
            renderChatSessions();
            renderActiveChat();
            updateRagCounters();

            // Fix lỗi: Đóng modal khi click ra ngoài vùng nền mờ (Backdrop)
            document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
                backdrop.addEventListener("click", e => {
                    if (e.target === backdrop) {
                        backdrop.classList.remove("open");
                    }
                });
            });

            // Fix lỗi: Đóng modal khi nhấn phím Escape (ESC)
            window.addEventListener("keydown", e => {
                if (e.key === "Escape") {
                    document.querySelectorAll(".modal-backdrop.open").forEach(m => m.classList.remove("open"));
                }
            });
        });

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

        function toggleAdminMode() {
            isAdmin = !isAdmin;
            const badge = document.getElementById("adminToggleBtn");
            if (isAdmin) {
                badge.textContent = "Quyền: Quản trị viên (Admin)";
                badge.style.backgroundColor = "#7D1018";
                badge.style.color = "#fff";
            } else {
                badge.textContent = "Quyền: Học sinh / Giáo viên";
                badge.style.backgroundColor = "rgba(197, 164, 109, 0.15)";
                badge.style.color = "var(--gold-light)";
            }
            renderDocuments();
        }

        function updateGradeTabBadges() {
            const allBadge = document.getElementById("grade-badge-all");
            if (allBadge) allBadge.textContent = catalogData.length;
            ["10", "11", "12"].forEach(g => {
                const count = catalogData.filter(i => i.grade === g).length;
                const el = document.getElementById(`grade-badge-${g}`);
                if (el) el.textContent = count;
            });
            const heroLessons = document.getElementById("heroMetricTotalLessons");
            if (heroLessons) heroLessons.textContent = catalogData.length;
            const heroDocs = document.getElementById("heroMetricTotalDocs");
            if (heroDocs) heroDocs.textContent = (typeof documentStore !== 'undefined') ? documentStore.length : 14;
        }

        function updateHomeCounters() {
            ["10", "11", "12"].forEach(g => {
                const count = catalogData.filter(item => item.grade === g).length;
                const el = document.getElementById(`home-count-${g}`);
                if (el) el.textContent = `${count} bài học chuẩn`;
            });
            updateGradeTabBadges();
            updateTeacherPostCountBadge();
        }

        // 6. CHỨC NĂNG TRANG 2: DANH MỤC LỊCH SỬ & TRA CỨU
        function populateFilterDropdowns() {
            const formatSelect = document.getElementById("formatFilter");
            const topicSelect = document.getElementById("topicFilter");

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
            document.getElementById("orientationTitle").textContent = orient.title;
            document.getElementById("orientationDesc").textContent = orient.desc;

            currentPage = 1;
            applyCatalogFilters();
        }

        function applyCatalogFilters() {
            const query = document.getElementById("searchInput").value.trim().toLowerCase();
            const format = document.getElementById("formatFilter").value;
            const topic = document.getElementById("topicFilter").value;
            const sortOrder = document.getElementById("sortOrder").value;
            const teacherOnly = document.getElementById("teacherOnlyFilter")?.checked || false;

            filteredCatalog = catalogData.filter(item => {
                const matchGrade = currentGradeTab === "ALL" || item.grade === currentGradeTab;
                const matchFormat = format === "ALL" || item.format === format;
                const matchTopic = topic === "ALL" || item.topic === topic;
                const matchTeacher = !teacherOnly || item.originType === "TEACHER_CONTRIBUTED";
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
            document.getElementById("searchInput").value = "";
            document.getElementById("formatFilter").value = "ALL";
            document.getElementById("topicFilter").value = "ALL";
            document.getElementById("sortOrder").value = "ASC";
            selectGradeTab("ALL");
        }

        function renderCatalogView() {
            const tbody = document.getElementById("catalogTableBody");
            const mobileContainer = document.getElementById("mobileCatalogCards");
            const emptyState = document.getElementById("catalogEmptyState");
            const resultCountText = document.getElementById("resultCountText");

            resultCountText.textContent = filteredCatalog.length;

            if (filteredCatalog.length === 0) {
                tbody.innerHTML = "";
                mobileContainer.innerHTML = "";
                emptyState.style.display = "block";
                document.getElementById("paginationInfo").textContent = "0 kết quả";
                document.getElementById("paginationButtons").innerHTML = "";
                return;
            }

            emptyState.style.display = "none";
            const totalPages = Math.ceil(filteredCatalog.length / ITEMS_PER_PAGE);
            if (currentPage > totalPages) currentPage = 1;

            const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
            const pageItems = filteredCatalog.slice(startIdx, startIdx + ITEMS_PER_PAGE);

            // Render Desktop Table (Đủ 5 trường thông tin bắt buộc)
            tbody.innerHTML = pageItems.map(item => {
                const examCode = getPostExamCode(item);
                let originBadge = `<div class="source-origin-tag origin-sgk">📘 Khung chương trình SGK</div>`;
                if (item.originType === "VERIFIED_ORIGINAL") {
                    originBadge = `<div class="source-origin-tag origin-verified">✓ Dữ liệu gốc xác thực</div>`;
                } else if (item.originType === "TEACHER_CONTRIBUTED") {
                    originBadge = `<div class="source-origin-tag origin-teacher">👨‍🏫 Biên soạn: ${escapeHtml(item.author || "Giáo viên")}${item.school ? ` (${escapeHtml(item.school)})` : ""}</div> <span class="badge-pulse" title="Bài mới từ Giáo viên được kết nối trực tiếp">✨ MỚI TỪ GV</span>`;
                }

                return `
          <tr onclick="openDetailModal('${item.code}')">
            <td>
              <div style="display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap;">
                <span class="code-badge">${escapeHtml(item.code)}</span>
                <span style="font-family: monospace; font-size: 0.74rem; background: #FFF3E0; color: #BF360C; border: 1px solid #FFE0B2; padding: 0.1rem 0.35rem; border-radius: 3px; font-weight: 700;" title="Mã đề">🏷️ ${escapeHtml(examCode)}</span>
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
                  ⬇️ Tải về
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
                    ? `<div class="source-origin-tag origin-teacher" style="margin-bottom:0.4rem;">👨‍🏫 Biên soạn: ${escapeHtml(item.author || "Giáo viên")}</div>`
                    : "";
                return `
        <div class="mobile-card" onclick="openDetailModal('${item.code}')">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.35rem;">
            <div style="display: flex; align-items: center; gap: 0.35rem;">
              <span class="code-badge">${escapeHtml(item.code)} (Khối ${escapeHtml(item.grade)})</span>
              <span style="font-family: monospace; font-size: 0.74rem; background: #FFF3E0; color: #BF360C; border: 1px solid #FFE0B2; padding: 0.1rem 0.35rem; border-radius: 3px; font-weight: 700;">🏷️ ${escapeHtml(examCode)}</span>
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
            <button type="button" class="btn-secondary" style="padding: 0.3rem 0.65rem; font-size: 0.78rem; font-weight: 600;" onclick="event.stopPropagation(); openDetailModal('${item.code}')">👁️ Chi tiết</button>
            <button type="button" class="btn-primary" style="padding: 0.3rem 0.75rem; font-size: 0.8rem; background: #2E7D32; border-color: #1B5E20; font-weight: 700; display: inline-flex; align-items: center; gap: 0.25rem;" onclick="event.stopPropagation(); downloadTeacherWordFile('${item.code}')">⬇️ Tải về máy</button>
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
                 <strong>👨‍🏫 Biên soạn bởi:</strong> ${escapeHtml(item.author || "Giáo viên Lịch sử THPT")} ${item.school ? `— <em>${escapeHtml(item.school)}</em>` : ""}
                 ${item.createdAt ? `<span style="font-size:0.78rem; color:var(--ink-muted); margin-left:0.5rem;">(Ngày đăng: ${escapeHtml(item.createdAt)})</span>` : ""}
               </div>
               ${item.authLevel ? `<span style="font-size:0.78rem; font-weight:700; color:#2E7D32; background:#E8F5E9; padding:0.2rem 0.6rem; border-radius:3px;">🔑 Xác thực: ${escapeHtml(item.authLevel)}</span>` : ""}
             </div>
           </div>`
                : "";

            // Khối tải file kịch bản đa định dạng (hỗ trợ 100% tất cả các bài học trên nền tảng)
            const hasUploadedFile = Boolean(item.fileName || item.fileData);
            const uploadedFileName = item.fileName || "";
            const uploadedExt = uploadedFileName ? (uploadedFileName.slice((uploadedFileName.lastIndexOf(".") - 1 >>> 0) + 2) || "FILE").toUpperCase() : "";

            const wordDownloadBanner = hasUploadedFile
                ? `
        <div style="background: #E8F5E9; border: 1.5px solid #81C784; border-radius: 6px; padding: 0.85rem 1.15rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; box-shadow: 0 2px 6px rgba(46,125,50,0.08);">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 2rem;">${uploadedExt === 'PDF' ? '📑' : (uploadedExt === 'TXT' ? '📝' : '📘')}</span>
            <div>
              <div style="font-size: 0.75rem; font-weight: 700; color: #1B5E20; text-transform: uppercase;">
                ⭐ TỆP ĐÃ TẢI LÊN: ${escapeHtml(uploadedFileName)} (${uploadedExt})
              </div>
              <strong style="color: #1B5E20; font-size: 0.98rem;">Tải về đúng định dạng đã tải lên: ${escapeHtml(uploadedFileName)}</strong>
              <div style="font-size: 0.8rem; color: #2E7D32;">Dung lượng: ${item.fileSize ? Math.round(item.fileSize / 1024) + ' KB' : 'Đã nạp'} • Tải ngay tệp gốc hoặc chuyển đổi sang DOCX, DOC, PDF, TXT, HTML</div>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
            <button class="btn-primary" style="background: #1B5E20; border-color: #0D3810; font-weight: 800; padding: 0.55rem 1.15rem; font-size: 0.88rem; cursor: pointer;" onclick="viewUploadedItemFile('${item.code}')">
              👁️ Xem tệp ${escapeHtml(uploadedFileName)}
            </button>
            <button class="btn-primary" style="background: #2E7D32; border-color: #1B5E20; font-weight: 800; padding: 0.55rem 1.15rem; font-size: 0.88rem; cursor: pointer;" onclick="exportLessonOriginalFile(catalogData.find(i=>i.code==='${item.code}'))">
              ⬇️ Tải tệp ${escapeHtml(uploadedFileName)}
            </button>
            <button class="btn-secondary" style="border-color: #81C784; color: #1B5E20; font-weight: 600; padding: 0.55rem 0.85rem; font-size: 0.84rem; cursor: pointer; background: #fff;" onclick="downloadTeacherWordFile('${item.code}')">
              ⚙️ Định dạng khác...
            </button>
          </div>
        </div>`
                : `
        <div style="background: #E8F5E9; border: 1.5px solid #81C784; border-radius: 6px; padding: 0.85rem 1.15rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; box-shadow: 0 2px 6px rgba(46,125,50,0.08);">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 2rem;">📥</span>
            <div>
              <strong style="color: #1B5E20; font-size: 0.98rem;">Hồ sơ Kịch bản chuyển thể Sân khấu hóa — Mã: ${escapeHtml(item.code)}</strong>
              <div style="font-size: 0.8rem; color: #2E7D32;">Tự động xuất trọn bộ Kịch bản, Bảng phân vai & Hướng dẫn sư phạm chuẩn: Word (.docx, .doc), PDF, Text, HTML</div>
            </div>
          </div>
          <button class="btn-primary" style="background: #2E7D32; border-color: #1B5E20; font-weight: 700; padding: 0.5rem 1.25rem; font-size: 0.88rem; cursor: pointer;" onclick="downloadTeacherWordFile('${item.code}')">
            ⬇️ Tùy chọn tải về máy
          </button>
        </div>`;

            const teacherActionsHtml = `
        <button class="btn-secondary" style="border-color:var(--gold); color:var(--burgundy); font-weight:600;" onclick="if(!isTeacherAuthenticated){ alert('Vui lòng nhập mã khóa giáo viên trước khi sửa bài.'); openTeacherAuthGate('${item.code}'); } else { closeDetailModal(); openTeacherPostModal('${item.code}'); }">✏️ Sửa bài này</button>
        <button class="btn-secondary" style="border-color:#E57373; color:#C62828; font-weight:600;" onclick="if(!isTeacherAuthenticated){ alert('Vui lòng nhập mã khóa giáo viên trước khi xóa bài.'); openTeacherAuthGate('${item.code}'); } else { deleteTeacherPost('${item.code}'); }">🗑️ Xóa bài này</button>
      `;

            const charsHtml = (item.characters && item.characters.length > 0)
                ? item.characters.map(c => {
                    const badge = c.type === "HISTORICAL_FACT"
                        ? `<span class="badge-fact">✓ Nhân vật lịch sử xác thực</span>`
                        : `<span class="badge-creative">🎭 Vai đại diện / Gợi ý sáng tạo</span>`;
                    return `<li style="margin-bottom: 0.55rem;"><strong>${escapeHtml(c.name)}</strong> ${badge}<br/><span style="font-size: 0.86rem; color: var(--ink-muted);">${escapeHtml(c.desc)}</span></li>`;
                }).join("")
                : `<li><span class="badge-creative">🎭 Gợi ý sáng tạo</span> Giáo viên và học sinh có thể xây dựng các vai đại diện phù hợp với tình huống: <em>${escapeHtml(item.scenario)}</em></li>`;

            const linkedDocs = documentStore.filter(d => d.code === item.code);
            const docsHtml = linkedDocs.length > 0
                ? linkedDocs.map(d => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:0.5rem; border:1px solid var(--border); background:var(--ivory); margin-bottom:0.4rem;">
              <span><strong>[${escapeHtml(d.format)}]</strong> ${escapeHtml(d.title)}</span>
              <div style="display:flex; gap:0.4rem;">
                <button class="btn-primary" style="padding: 0.25rem 0.6rem; font-size:0.78rem; background:#2E7D32; border-color:#1B5E20;" onclick="downloadDocument('${d.id}')">⬇️ Tải về</button>
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
              <span>👁️</span> Xem trước tệp đính kèm
            </h4>
            <button type="button" class="btn-secondary" style="padding: 0.2rem 0.6rem; font-size: 0.8rem;" onclick="toggleDetailInlinePreview(false)">✕ Đóng xem</button>
          </div>
          <div id="detailPreviewContent"></div>
        </div>
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
          <h4>4. Các nhân vật hoặc vai diễn có thể sử dụng</h4>
          <ul style="padding-left: 1.2rem; margin-top: 0.5rem;">${charsHtml}</ul>
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

        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-top: 1rem;">
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            ${teacherActionsHtml}
          </div>
          <div style="display: flex; gap: 0.65rem; flex-wrap: wrap;">
            <button class="btn-secondary" style="background: #E8F5E9; color: #1B5E20; border-color: #81C784; font-weight: 700;" onclick="${hasUploadedFile ? `exportLessonOriginalFile(catalogData.find(i=>i.code==='${item.code}'))` : `downloadTeacherWordFile('${item.code}')`}">
              ⬇️ ${hasUploadedFile ? `Tải tệp ${escapeHtml(uploadedFileName)}` : 'Tải Kịch bản về máy'}
            </button>
            <button class="btn-secondary" onclick="closeDetailModal()">Đóng</button>
            <button class="btn-primary" onclick="askAiAboutItem('${item.code}')">💬 Khai thác mục ${item.code} cùng Chatbot AI →</button>
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
            const query = document.getElementById("docSearchInput").value.trim().toLowerCase();
            const grade = document.getElementById("docGradeFilter").value;
            const format = document.getElementById("docTypeFilter").value;

            const filtered = documentStore.filter(doc => {
                const matchGrade = grade === "ALL" || doc.grade === grade;
                const matchFormat = format === "ALL" || doc.format === format;
                const searchable = `${doc.title} ${doc.code} ${doc.source} ${doc.content}`.toLowerCase();
                const matchQuery = !query || searchable.includes(query);
                return matchGrade && matchFormat && matchQuery;
            });

            const container = document.getElementById("docGridContainer");
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
            <button class="btn-secondary" style="padding: 0.35rem 0.7rem; font-size: 0.8rem;" onclick="previewDocument('${doc.id}')">👁 Xem trước</button>
            <button class="btn-secondary" style="padding: 0.35rem 0.7rem; font-size: 0.8rem; background: #E8F5E9; color: #1B5E20; border-color: #81C784; font-weight: 600;" onclick="downloadDocument('${doc.id}')">⬇ Tải về</button>
            ${isAdmin ? `<button class="btn-secondary" style="padding: 0.35rem 0.7rem; font-size: 0.8rem; color: var(--bordeaux);" onclick="deleteDocument('${doc.id}')">🗑 Xóa</button>` : ""}
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
                                <span style="font-weight: 700; color: #1B5E20;">📑 Tệp PDF nguyên bản: ${escapeHtml(fileName)}</span>
                                <div style="font-size: 0.8rem; color: #2E7D32;">Tài liệu lưu trữ trực tiếp trong CSDL SQL/IndexedDB</div>
                            </div>
                            <div style="display:flex; gap:0.5rem; align-items:center;">
                                <a href="${pdfUrl}" target="_blank" class="btn-secondary" style="font-size: 0.8rem; padding: 0.35rem 0.75rem; text-decoration: none; border-color: #81C784; color: #1B5E20; background: #fff;">↗️ Mở tab riêng</a>
                                <button type="button" class="btn-primary" style="background:#2E7D32; border-color:#1B5E20; font-size: 0.8rem; padding: 0.35rem 0.85rem;" onclick="exportDocStoreOriginalFile(documentStore.find(d=>d.id==='${doc.id}'))">⬇️ Tải tệp ${escapeHtml(fileName)}</button>
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
                            <span style="font-weight: 600; color: #1B5E20;">📝 Văn bản thuần: ${escapeHtml(fileName)}</span>
                            <button type="button" class="btn-primary" style="background:#2E7D32; border-color:#1B5E20; font-size: 0.8rem; padding: 0.25rem 0.7rem;" onclick="exportDocStoreOriginalFile(documentStore.find(d=>d.id==='${doc.id}'))">⬇️ Tải tệp ${escapeHtml(fileName)}</button>
                        </div>
                        <pre style="max-height: 480px; overflow-y: auto; white-space: pre-wrap; font-family: 'Consolas', 'Courier New', monospace; font-size: 0.92rem; line-height: 1.65; background: #fff; border: 1px solid var(--border); padding: 1.25rem; border-radius: 4px; margin-bottom: 1rem;">${escapeHtml(plainText)}</pre>
                    `;
                } else {
                    fileViewerHtml = `
                        <div style="background: #E8F5E9; border: 1.5px solid #81C784; border-radius: 6px; padding: 0.85rem 1.15rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
                            <div>
                                <span style="font-weight: 700; color: #1B5E20; font-size: 0.95rem;">📘 Tệp Word nguyên bản: ${escapeHtml(fileName)}</span>
                                <div style="font-size: 0.8rem; color: #2E7D32;">Tệp Microsoft Word lưu trữ đầy đủ trong hệ thống. Tải về để mở chỉnh sửa trên Word/Docs.</div>
                            </div>
                            <button type="button" class="btn-primary" style="background:#2E7D32; border-color:#1B5E20; font-size: 0.85rem; padding: 0.45rem 1rem;" onclick="exportDocStoreOriginalFile(documentStore.find(d=>d.id==='${doc.id}'))">⬇️ Tải tệp ${escapeHtml(fileName)}</button>
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
          <button class="btn-primary" style="background:#2E7D32; border-color:#1B5E20; font-weight:700;" onclick="exportDocStoreOriginalFile(documentStore.find(d=>d.id==='${doc.id}'))">⬇️ Tải tệp ${escapeHtml(fileName)}</button>
          <button class="btn-secondary" style="border-color:#81C784; color:#1B5E20;" onclick="downloadDocument('${doc.id}')">⚙️ Định dạng khác...</button>
          ` : `
          <button class="btn-primary" style="background:#2E7D32; border-color:#1B5E20;" onclick="downloadDocument('${doc.id}')">⬇ Tùy chọn tải về</button>
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

    // Formatting utilities
    window.escapeHtml = escapeHtml;
    window.formatMarkdown = formatMarkdown;
}
