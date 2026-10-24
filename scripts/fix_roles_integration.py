#!/usr/bin/env python3
# -*- coding: utf-8 -*-

def fix_all():
    # 1. Update app.js
    with open("js/app.js", "r", encoding="utf-8") as f:
        app_code = f.read()

    # In render15ScriptDossierHtml:
    old_chars_app = """            // Characters in Part A
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
            ).join("");"""

    new_chars_app = """            // Characters in Part A
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
            ).join("");"""

    if old_chars_app in app_code:
        app_code = app_code.replace(old_chars_app, new_chars_app, 1)
        with open("js/app.js", "w", encoding="utf-8") as f:
            f.write(app_code)
        print("✓ Updated roles parsing in app.js")
    else:
        print("! Could not find old_chars_app in app.js")

    # 2. Update teacher.js
    with open("js/teacher.js", "r", encoding="utf-8") as f:
        teacher_code = f.read()

    # In generateAndDownloadWordDocument
    old_chars_teacher1 = """                const partAChars = (script15.partA && script15.partA.characters) ? script15.partA.characters : [];
                const rolesRows15 = partAChars.map((c, idx) => {
                    const studentName = savedRoles[idx] || "........................................................";
                    const isFact = c.type === "HISTORICAL_FACT";
                    const typeLabel = isFact ? "Nhân vật lịch sử xác thực" : "Vai kịch bản hóa";
                    const typeColor = isFact ? "#1B5E20" : "#4A148C";
                    return `
                        <tr>
                            <td style="text-align: center; font-weight: bold; width: 40px; border: 1px solid #777; padding: 6px;">${idx + 1}</td>
                            <td style="font-weight: bold; color: #800020; width: 160px; border: 1px solid #777; padding: 6px;">${escapeHtml(c.name)}</td>
                            <td style="width: 150px; border: 1px solid #777; padding: 6px; font-size: 10pt; color: ${typeColor}; font-weight: bold;">${typeLabel}</td>
                            <td style="border: 1px solid #777; padding: 6px; font-size: 10.5pt;">${escapeHtml(c.desc)}</td>
                            <td style="width: 180px; border: 1px solid #777; padding: 6px; font-weight: bold; color: #0D47A1;">${escapeHtml(studentName)}</td>
                        </tr>
                    `;
                }).join("");"""

    new_chars_teacher1 = """                const partAChars = (script15.partA && (script15.partA.roles || script15.partA.characters)) ? (script15.partA.roles || script15.partA.characters) : [];
                const rolesRows15 = partAChars.map((c, idx) => {
                    const rName = c.name || c.role || "Nhân vật";
                    const rDesc = c.desc || c.prep || "Đọc các lượt của vai; đánh dấu chỗ vào lời.";
                    const studentName = savedRoles[idx] || c.studentName || "........................................................";
                    const isFact = c.type === "HISTORICAL_FACT" || (!rName.includes("dẫn") && !rName.includes("Kỹ thuật"));
                    const typeLabel = isFact ? "Nhân vật lịch sử xác thực" : "Vai kịch bản hóa";
                    const typeColor = isFact ? "#1B5E20" : "#4A148C";
                    return `
                        <tr>
                            <td style="text-align: center; font-weight: bold; width: 40px; border: 1px solid #777; padding: 6px;">${idx + 1}</td>
                            <td style="font-weight: bold; color: #800020; width: 160px; border: 1px solid #777; padding: 6px;">${escapeHtml(rName)}</td>
                            <td style="width: 150px; border: 1px solid #777; padding: 6px; font-size: 10pt; color: ${typeColor}; font-weight: bold;">${typeLabel}</td>
                            <td style="border: 1px solid #777; padding: 6px; font-size: 10.5pt;">${escapeHtml(rDesc)}</td>
                            <td style="width: 180px; border: 1px solid #777; padding: 6px; font-weight: bold; color: #0D47A1;">${escapeHtml(studentName)}</td>
                        </tr>
                    `;
                }).join("");"""

    if old_chars_teacher1 in teacher_code:
        teacher_code = teacher_code.replace(old_chars_teacher1, new_chars_teacher1, 1)
        print("✓ Updated roles parsing in teacher.js (Word doc)")

    # In buildLessonPrintableHtml
    old_chars_teacher2 = """                const partAChars = (script15.partA && script15.partA.characters) ? script15.partA.characters : [];
                const rolesRows15 = partAChars.map((c, idx) => {
                    const studentName = savedRoles[idx] || "........................................................";
                    const isFact = c.type === "HISTORICAL_FACT";
                    const typeLabel = isFact ? "Lịch sử xác thực" : "Vai kịch bản";
                    return `
                        <tr>
                            <td style="text-align: center; font-weight: bold; width: 35px; border: 1px solid #777; padding: 5px;">${idx + 1}</td>
                            <td style="font-weight: bold; color: #800020; width: 150px; border: 1px solid #777; padding: 5px;">${escapeHtml(c.name)}</td>
                            <td style="width: 130px; border: 1px solid #777; padding: 5px; font-size: 9.5pt; font-weight: bold;">${typeLabel}</td>
                            <td style="border: 1px solid #777; padding: 5px; font-size: 10pt;">${escapeHtml(c.desc)}</td>
                            <td style="width: 170px; border: 1px solid #777; padding: 5px; color: #0D47A1; font-weight: bold;">${escapeHtml(studentName)}</td>
                        </tr>
                    `;
                }).join("");"""

    new_chars_teacher2 = """                const partAChars = (script15.partA && (script15.partA.roles || script15.partA.characters)) ? (script15.partA.roles || script15.partA.characters) : [];
                const rolesRows15 = partAChars.map((c, idx) => {
                    const rName = c.name || c.role || "Nhân vật";
                    const rDesc = c.desc || c.prep || "Đọc các lượt của vai; đánh dấu chỗ vào lời.";
                    const studentName = savedRoles[idx] || c.studentName || "........................................................";
                    const isFact = c.type === "HISTORICAL_FACT" || (!rName.includes("dẫn") && !rName.includes("Kỹ thuật"));
                    const typeLabel = isFact ? "Lịch sử xác thực" : "Vai kịch bản";
                    return `
                        <tr>
                            <td style="text-align: center; font-weight: bold; width: 35px; border: 1px solid #777; padding: 5px;">${idx + 1}</td>
                            <td style="font-weight: bold; color: #800020; width: 150px; border: 1px solid #777; padding: 5px;">${escapeHtml(rName)}</td>
                            <td style="width: 130px; border: 1px solid #777; padding: 5px; font-size: 9.5pt; font-weight: bold;">${typeLabel}</td>
                            <td style="border: 1px solid #777; padding: 5px; font-size: 10pt;">${escapeHtml(rDesc)}</td>
                            <td style="width: 170px; border: 1px solid #777; padding: 5px; color: #0D47A1; font-weight: bold;">${escapeHtml(studentName)}</td>
                        </tr>
                    `;
                }).join("");"""

    if old_chars_teacher2 in teacher_code:
        teacher_code = teacher_code.replace(old_chars_teacher2, new_chars_teacher2, 1)
        print("✓ Updated roles parsing in teacher.js (Printable HTML)")

    # In buildLessonPlainText
    old_chars_teacher3 = """                const partAChars = (script15.partA && script15.partA.characters) ? script15.partA.characters : [];
                const rolesText = partAChars.map((c, idx) => {
                    const studentName = savedRoles[idx] || "(Chưa ghi tên)";
                    return `  ${idx + 1}. ${c.name} [${c.type === 'HISTORICAL_FACT' ? 'Lịch sử' : 'Sáng tạo'}]\\n     - Đặc điểm: ${c.desc}\\n     - Học sinh nhận vai: ${studentName}`;
                }).join("\\n\\n");"""

    new_chars_teacher3 = """                const partAChars = (script15.partA && (script15.partA.roles || script15.partA.characters)) ? (script15.partA.roles || script15.partA.characters) : [];
                const rolesText = partAChars.map((c, idx) => {
                    const rName = c.name || c.role || "Nhân vật";
                    const rDesc = c.desc || c.prep || "Đọc các lượt của vai; đánh dấu chỗ vào lời.";
                    const studentName = savedRoles[idx] || c.studentName || "(Chưa ghi tên)";
                    const isFact = c.type === "HISTORICAL_FACT" || (!rName.includes("dẫn") && !rName.includes("Kỹ thuật"));
                    return `  ${idx + 1}. ${rName} [${isFact ? 'Lịch sử' : 'Sáng tạo'}]\\n     - Đặc điểm: ${rDesc}\\n     - Học sinh nhận vai: ${studentName}`;
                }).join("\\n\\n");"""

    if old_chars_teacher3 in teacher_code:
        teacher_code = teacher_code.replace(old_chars_teacher3, new_chars_teacher3, 1)
        print("✓ Updated roles parsing in teacher.js (Plain text)")

    with open("js/teacher.js", "w", encoding="utf-8") as f:
        f.write(teacher_code)
    print("✓ Successfully saved js/teacher.js")

if __name__ == "__main__":
    fix_all()
