#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re

def update_app_js():
    path = "js/app.js"
    with open(path, "r", encoding="utf-8") as f:
        code = f.read()

    # 1. Update applyCatalogFilters
    old_filter = """            const teacherOnly = document.getElementById("teacherOnlyFilter")?.checked || false;

            filteredCatalog = catalogData.filter(item => {
                const matchGrade = currentGradeTab === "ALL" || item.grade === currentGradeTab;
                const matchFormat = format === "ALL" || item.format === format;
                const matchTopic = topic === "ALL" || item.topic === topic;
                const matchTeacher = !teacherOnly || item.originType === "TEACHER_CONTRIBUTED";"""

    new_filter = """            const teacherOnly = document.getElementById("teacherOnlyFilter")?.checked || false;
            const official15El = document.getElementById("official15Filter");
            const official15Only = official15El ? official15El.checked : false;

            filteredCatalog = catalogData.filter(item => {
                const matchGrade = currentGradeTab === "ALL" || item.grade === currentGradeTab;
                const matchFormat = format === "ALL" || item.format === format;
                const matchTopic = topic === "ALL" || item.topic === topic;
                const matchTeacher = !teacherOnly || item.originType === "TEACHER_CONTRIBUTED";
                const matchOfficial15 = !official15Only || ((typeof getOfficial15Script === "function" && getOfficial15Script(item.code) !== null) || Boolean(item.scriptData));"""

    if old_filter in code:
        code = code.replace(old_filter, new_filter, 1)
        print("✓ Updated applyCatalogFilters in app.js")
    else:
        print("! Could not find old_filter in app.js")

    # 2. Update resetCatalogFilters
    old_reset = """            if (tOnly) tOnly.checked = false;
            selectGradeTab("ALL");"""
    new_reset = """            if (tOnly) tOnly.checked = false;
            const o15Only = document.getElementById("official15Filter");
            if (o15Only) o15Only.checked = false;
            selectGradeTab("ALL");"""

    if old_reset in code:
        code = code.replace(old_reset, new_reset, 1)
        print("✓ Updated resetCatalogFilters in app.js")
    else:
        print("! Could not find old_reset in app.js")

    # 3. Update DOMContentLoaded
    old_init = """            updateRagCounters();
            updateRoleBadgeUI();"""
    new_init = """            updateRagCounters();
            updateRoleBadgeUI();
            if (typeof render15ShowcaseCards === "function") {
                render15ShowcaseCards("10");
            }"""

    if old_init in code:
        code = code.replace(old_init, new_init, 1)
        print("✓ Updated DOMContentLoaded in app.js")
    else:
        print("! Could not find old_init in app.js")

    # 4. Insert 15 Scripts Rehearsal & Showcase helper functions
    helpers_code = '''
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
            const partAChars = (script.partA && script.partA.characters) ? script.partA.characters : [];
            const rolesRows = partAChars.map((c, idx) => {
                const studentVal = savedRoles[idx] || "";
                const roleTypeBadge = c.type === "HISTORICAL_FACT"
                    ? `<span class="badge-fact" style="font-size: 0.74rem;">${stIcon('check', 11)} Lịch sử</span>`
                    : `<span class="badge-creative" style="font-size: 0.74rem;">${stIcon('mask', 11)} Sáng tạo</span>`;
                return `
                    <tr>
                        <td style="text-align: center; font-weight: 700; width: 40px; color: var(--bordeaux);">${idx + 1}</td>
                        <td style="width: 170px;">
                            <strong style="color: var(--burgundy);">${escapeHtml(c.name)}</strong>
                            <div style="margin-top: 0.2rem;">${roleTypeBadge}</div>
                        </td>
                        <td style="font-size: 0.86rem; color: #444; line-height: 1.45;">
                            ${escapeHtml(c.desc)}
                        </td>
                        <td style="width: 220px;">
                            <input type="text" class="input-control" id="roleStudent_${safeCode}_${idx}" value="${escapeHtml(studentVal)}" placeholder="Nhập tên HS / Nhóm..." onchange="autoSaveScriptRoleAssignment('${code}', ${idx}, this.value)" style="font-size: 0.85rem; padding: 0.35rem 0.6rem; border: 1.5px solid #C5A46D;" />
                        </td>
                    </tr>
                `;
            }).join("");

            const roleFilterOptions = [`<option value="ALL">-- Tất cả các vai diễn (${partAChars.length}) --</option>`].concat(
                partAChars.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`)
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
'''

    # Insert helpers right before openDetailModal
    target_modal = "        // 7. TRANG CHI TIẾT NỘI DUNG LỊCH SỬ\n        function openDetailModal(code, autoPreview = false) {"
    if target_modal in code:
        code = code.replace(target_modal, helpers_code + "\n" + target_modal, 1)
        print("✓ Inserted 15-script helpers before openDetailModal in app.js")
    else:
        print("! Could not find target_modal in app.js")

    # 5. Update openDetailModal to render 3-part dossier when script15 is available
    old_modal_body = """        <div class="detail-grid">
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
        </div>"""

    new_modal_body = """        ${(() => {
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
        })()}"""

    if old_modal_body in code:
        code = code.replace(old_modal_body, new_modal_body, 1)
        print("✓ Updated openDetailModal with 3-part dossier in app.js")
    else:
        print("! Could not find old_modal_body in app.js")

    # 6. Export new functions at bottom of app.js
    exports_old = """    // Formatting utilities
    window.escapeHtml = escapeHtml;
    window.formatMarkdown = formatMarkdown;
}"""

    exports_new = """    // Formatting utilities
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
}"""

    if exports_old in code:
        code = code.replace(exports_old, exports_new, 1)
        print("✓ Exported new functions to window in app.js")
    else:
        print("! Could not find exports_old in app.js")

    with open(path, "w", encoding="utf-8") as f:
        f.write(code)
    print("✓ Successfully saved js/app.js")

if __name__ == "__main__":
    update_app_js()
