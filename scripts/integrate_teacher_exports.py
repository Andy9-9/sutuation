#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re

def update_teacher_js():
    path = "js/teacher.js"
    with open(path, "r", encoding="utf-8") as f:
        code = f.read()

    # 1. Update generateAndDownloadWordDocument
    old_target = """            const originTitle = item.originType === "TEACHER_CONTRIBUTED"
                ? `Biên soạn đóng góp bởi Giáo viên: ${escapeHtml(item.author || 'Thầy/Cô')} (${escapeHtml(item.school || 'THPT')})`
                : (item.originType === "VERIFIED_ORIGINAL" ? "Dữ liệu gốc đã xác thực kiểm chứng" : "Khung chương trình chuẩn SGK GDPT 2018");

            const htmlContent = `"""

    new_helper_and_target = """            const originTitle = item.originType === "TEACHER_CONTRIBUTED"
                ? `Biên soạn đóng góp bởi Giáo viên: ${escapeHtml(item.author || 'Thầy/Cô')} (${escapeHtml(item.school || 'THPT')})`
                : (item.originType === "VERIFIED_ORIGINAL" ? "Dữ liệu gốc đã xác thực kiểm chứng" : "Khung chương trình chuẩn SGK GDPT 2018");

            const script15 = (typeof getOfficial15Script === "function" ? getOfficial15Script(item.code) : null) || item.scriptData;

            // Nếu là 1 trong 15 hoạt cảnh chuẩn sư phạm, xuất bản tài liệu Word chuẩn 3 phần đầy đủ
            if (script15) {
                const safeCode = item.code.replace(/[^A-Za-z0-9]/g, "");
                const savedRoles = (typeof getScriptRoleAssignments === "function") ? getScriptRoleAssignments(item.code) : {};
                const partAChars = (script15.partA && script15.partA.characters) ? script15.partA.characters : [];
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
                }).join("");

                const scenes15 = (script15.partB && script15.partB.scenes) ? script15.partB.scenes : [];
                const scenesHtml15 = scenes15.map((sc, sIdx) => {
                    const turnsRows = sc.turns.map(t => {
                        const isNonSpoken = t.turn === "—" || t.dialogue.includes("Không đọc thành lời");
                        return `
                            <tr>
                                <td style="text-align: center; font-weight: bold; width: 45px; border: 1px solid #888; padding: 6px; color: #800020;">${escapeHtml(t.turn)}</td>
                                <td style="font-weight: bold; width: 160px; border: 1px solid #888; padding: 6px; color: #800020;">${escapeHtml(t.character)}</td>
                                <td style="border: 1px solid #888; padding: 6px; font-style: ${isNonSpoken ? 'italic' : 'normal'}; color: ${isNonSpoken ? '#666' : '#000'};">${escapeHtml(t.dialogue)}</td>
                                <td style="width: 220px; border: 1px solid #888; padding: 6px; color: #2E7D32; font-size: 10pt;">${escapeHtml(t.actionCue || '—')}</td>
                            </tr>
                        `;
                    }).join("");

                    return `
                        <div style="margin-top: 18px; margin-bottom: 8px;">
                            <strong style="color: #800020; font-size: 12.5pt; text-transform: uppercase;">${escapeHtml(sc.sceneName)}</strong>
                        </div>
                        <table class="data-table" style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                            <thead>
                                <tr style="background: #f0e6d6;">
                                    <th style="width: 45px; text-align: center; border: 1px solid #777; padding: 6px;">Lượt</th>
                                    <th style="width: 160px; border: 1px solid #777; padding: 6px;">Nhân vật</th>
                                    <th style="border: 1px solid #777; padding: 6px;">Lời thoại kịch bản gốc</th>
                                    <th style="width: 220px; border: 1px solid #777; padding: 6px;">Thao tác gợi ý (Dàn dựng)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${turnsRows}
                            </tbody>
                        </table>
                    `;
                }).join("");

                const qaItems15 = (script15.partC && script15.partC.qa) ? script15.partC.qa : [];
                const qaHtml15 = qaItems15.map((q, qIdx) => `
                    <div style="margin-bottom: 10px; padding: 8px 12px; background: #fafafa; border-left: 4px solid #800020; border: 1px solid #ddd;">
                        <p style="margin: 0 0 4px 0;"><strong>Câu hỏi ${qIdx + 1}:</strong> ${escapeHtml(q.question)}</p>
                        <p style="margin: 0; color: #1B5E20; font-size: 11pt;"><strong>Gợi ý đối chiếu trả lời:</strong> ${escapeHtml(q.answerHint)}</p>
                    </div>
                `).join("");

                const word15Content = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>Kịch bản Hoạt cảnh Lịch sử: ${escapeHtml(script15.title)}</title>
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #111; margin: 2cm 1.8cm; }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .header-table td { border: none; vertical-align: top; padding: 0; }
    .doc-title { font-size: 16pt; font-weight: bold; color: #800020; text-align: center; margin-top: 15px; margin-bottom: 4px; text-transform: uppercase; }
    .doc-subtitle { font-size: 12pt; font-weight: bold; color: #B8860B; text-align: center; margin-bottom: 20px; font-style: italic; }
    .meta-box { background: #faf7f2; border: 1.5px solid #dcd3c5; border-left: 6px solid #800020; padding: 12px 16px; margin-bottom: 20px; }
    .section-title { font-size: 13pt; font-weight: bold; color: #800020; border-bottom: 1.5px solid #800020; padding-bottom: 3px; margin-top: 20px; margin-bottom: 10px; text-transform: uppercase; }
    table.data-table { width: 100%; border-collapse: collapse; margin-top: 6px; margin-bottom: 15px; }
    table.data-table th { background-color: #f0e6d6; color: #5d101d; font-weight: bold; border: 1px solid #777; padding: 6px 8px; text-align: left; font-size: 11pt; }
    table.data-table td { border: 1px solid #aaa; padding: 6px 8px; vertical-align: top; font-size: 11pt; }
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

  <div class="doc-title">KỊCH BẢN HOẠT CẢNH LỊCH SỬ CHUẨN SƯ PHẠM (DẠNG BẢNG)</div>
  <div class="doc-subtitle">${escapeHtml(script15.title)} — ${escapeHtml(script15.format)}</div>

  <div class="meta-box">
    <table style="width: 100%; border: none; border-collapse: collapse;">
      <tr>
        <td style="border: none; padding: 3px 6px; width: 50%;"><strong>📌 Mã bài học:</strong> <span style="color: #800020; font-weight: bold;">${escapeHtml(item.code)}</span></td>
        <td style="border: none; padding: 3px 6px; width: 50%;"><strong>🏷️ Mã đề chuẩn hóa:</strong> <span style="color: #BF360C; font-weight: bold;">${escapeHtml(examCode)}</span></td>
      </tr>
      <tr>
        <td style="border: none; padding: 3px 6px;"><strong>🎓 Khối lớp:</strong> Lớp ${escapeHtml(item.grade)} THPT</td>
        <td style="border: none; padding: 3px 6px;"><strong>⏱️ Thời lượng:</strong> ${escapeHtml(script15.duration || '3–5 phút')} (3 cảnh)</td>
      </tr>
      <tr>
        <td style="border: none; padding: 3px 6px;" colspan="2"><strong>📖 Bài học SGK:</strong> ${escapeHtml(script15.lesson)}</td>
      </tr>
      <tr>
        <td style="border: none; padding: 3px 6px;" colspan="2"><strong>📚 Chủ đề:</strong> ${escapeHtml(script15.topic)}</td>
      </tr>
      <tr>
        <td style="border: none; padding: 3px 6px;" colspan="2"><strong>🎭 Tình huống sân khấu hóa:</strong> ${escapeHtml(script15.scenario)}</td>
      </tr>
    </table>
  </div>

  <div class="section-title">PHẦN A: BẢNG CHUẨN BỊ & PHÂN CÔNG VAI DIỄN</div>
  <p><strong>1. Trọng tâm học tập:</strong> ${escapeHtml(script15.focus)}</p>
  <p><strong>2. Bối cảnh lịch sử:</strong> ${escapeHtml(script15.context)}</p>
  <p><strong>3. Danh sách phân công nhân vật & học sinh nhận vai:</strong></p>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 40px; text-align: center;">STT</th>
        <th style="width: 160px;">Tên nhân vật</th>
        <th style="width: 150px;">Phân loại</th>
        <th>Đặc điểm vai & Gợi ý diễn xuất</th>
        <th style="width: 180px;">Học sinh / Nhóm đảm nhận</th>
      </tr>
    </thead>
    <tbody>
      ${rolesRows15}
    </tbody>
  </table>

  <div class="section-title">PHẦN B: BẢNG DIỄN THEO LƯỢT (TOÀN VĂN KỊCH BẢN GỐC)</div>
  ${scenesHtml15}

  <div class="section-title">PHẦN C: PHẦN KẾT, CÂU HỎI KHÁN GIẢ & GỢI Ý ĐỐI CHIẾU</div>
  <p><strong>1. Câu hỏi thảo luận dành cho khán giả sau hoạt cảnh:</strong></p>
  ${qaHtml15}
  <div style="margin-top: 10px;">
    <p><strong>2. Lưu ý nội dung & ranh giới diễn xuất:</strong> ${escapeHtml(script15.partC && script15.partC.contentNotes ? script15.partC.contentNotes : 'Phân biệt rõ dữ kiện lịch sử có căn cứ và chi tiết kịch bản hư cấu sáng tạo.')}</p>
    <p><strong>3. Nguồn tra cứu:</strong> ${escapeHtml(script15.partC && script15.partC.sourceRef ? script15.partC.sourceRef : script15.sources)}</p>
    <p><strong>4. Nhiệm vụ nối tiếp:</strong> ${escapeHtml(script15.partC && script15.partC.nextTask ? script15.partC.nextTask : 'Hoàn thành phiếu đối chiếu dữ kiện lịch sử M02.')}</p>
  </div>

  <div class="section-title">HƯỚNG DẪN 5 BƯỚC TẬP HOẠT CẢNH CHUẨN SƯ PHẠM GDPT 2018</div>
  <ol>
    <li><strong>Bước 1 - Đọc kịch bản & Nắm bối cảnh:</strong> Học sinh đọc toàn bộ kịch bản, xác định bối cảnh lịch sử, nắm thông điệp cốt lõi bài học.</li>
    <li><strong>Bước 2 - Phân công vai diễn:</strong> Phân chia người dẫn, các nhân vật và kỹ thuật. Ghi tên học sinh nhận vai vào bảng phân vai.</li>
    <li><strong>Bước 3 - Luyện đọc khớp nhịp & Thao tác thẻ:</strong> Khớp lượt nói từng cảnh (Cảnh 1, 2, 3), làm quen cử chỉ gợi ý, thao tác đạo cụ nhẹ/thẻ mô phỏng.</li>
    <li><strong>Bước 4 - Diễn thử có bấm giờ (3–5 phút):</strong> Thực hành diễn toàn bộ hoạt cảnh trong khung thời gian 3–5 phút; tránh kéo dài bằng lời hô đồng thanh.</li>
    <li><strong>Bước 5 - Hỏi đáp khán giả & Rút ra bài học:</strong> Thực hiện phần kết: đặt 3 câu hỏi cho người xem, đối chiếu gợi ý trả lời, phân biệt giữa sự thật lịch sử và hư cấu kịch bản.</li>
  </ol>

  <table style="width: 100%; border: none; margin-top: 35px;">
    <tr>
      <td style="border: none; width: 50%; text-align: center; vertical-align: top;">
        <em>Ngày xuất bản: ${new Date().toLocaleDateString('vi-VN')}</em><br/>
        <strong>HỆ THỐNG NỀN TẢNG SITUATION</strong><br/>
        <span style="font-size: 10pt; color: #666;">Kho tri thức Sân khấu hóa Lịch sử THPT</span>
      </td>
      <td style="border: none; width: 50%; text-align: center; vertical-align: top;">
        <em>Xác thực hồ sơ</em><br/>
        <strong>TỔ CHUYÊN MÔN LỊCH SỬ THPT</strong><br/>
        <span style="font-size: 10pt; color: #666;">(Ký, đóng dấu số hóa)</span>
      </td>
    </tr>
  </table>
</body>
</html>
                `;

                try {
                    const blob = new Blob(['\\ufeff', word15Content], { type: 'application/msword;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = outDocFileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                    return;
                } catch (err) {
                    console.error("Lỗi tạo file Word 15 bài:", err);
                }
            }

            const htmlContent = `"""

    if old_target in code:
        code = code.replace(old_target, new_helper_and_target, 1)
        print("✓ Updated generateAndDownloadWordDocument in teacher.js")
    else:
        print("! Could not find old_target in teacher.js")

    # 2. Update buildLessonPrintableHtml (for DOCX & PDF)
    old_printable_header = """        function buildLessonPrintableHtml(item) {
            const examCode = getPostExamCode(item);
            const charsRows = (item.characters && item.characters.length > 0)"""

    new_printable_header = """        function buildLessonPrintableHtml(item) {
            const examCode = getPostExamCode(item);
            const script15 = (typeof getOfficial15Script === "function" ? getOfficial15Script(item.code) : null) || item.scriptData;

            if (script15) {
                const safeCode = item.code.replace(/[^A-Za-z0-9]/g, "");
                const savedRoles = (typeof getScriptRoleAssignments === "function") ? getScriptRoleAssignments(item.code) : {};
                const partAChars = (script15.partA && script15.partA.characters) ? script15.partA.characters : [];
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
                }).join("");

                const scenes15 = (script15.partB && script15.partB.scenes) ? script15.partB.scenes : [];
                const scenesHtml15 = scenes15.map((sc, sIdx) => {
                    const turnsRows = sc.turns.map(t => {
                        const isNonSpoken = t.turn === "—" || t.dialogue.includes("Không đọc thành lời");
                        return `
                            <tr>
                                <td style="text-align: center; font-weight: bold; width: 40px; border: 1px solid #888; padding: 5px; color: #800020;">${escapeHtml(t.turn)}</td>
                                <td style="font-weight: bold; width: 150px; border: 1px solid #888; padding: 5px; color: #800020;">${escapeHtml(t.character)}</td>
                                <td style="border: 1px solid #888; padding: 5px; font-style: ${isNonSpoken ? 'italic' : 'normal'}; color: ${isNonSpoken ? '#666' : '#000'}; font-size: 10.5pt;">${escapeHtml(t.dialogue)}</td>
                                <td style="width: 210px; border: 1px solid #888; padding: 5px; color: #2E7D32; font-size: 9.5pt;">${escapeHtml(t.actionCue || '—')}</td>
                            </tr>
                        `;
                    }).join("");

                    return `
                        <div style="margin-top: 14px; margin-bottom: 6px;">
                            <strong style="color: #800020; font-size: 11.5pt; text-transform: uppercase;">${escapeHtml(sc.sceneName)}</strong>
                        </div>
                        <table class="data-table" style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
                            <thead>
                                <tr style="background: #f0e6d6;">
                                    <th style="width: 40px; text-align: center; border: 1px solid #777; padding: 5px;">Lượt</th>
                                    <th style="width: 150px; border: 1px solid #777; padding: 5px;">Nhân vật</th>
                                    <th style="border: 1px solid #777; padding: 5px;">Lời thoại kịch bản gốc</th>
                                    <th style="width: 210px; border: 1px solid #777; padding: 5px;">Thao tác gợi ý (Dàn dựng)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${turnsRows}
                            </tbody>
                        </table>
                    `;
                }).join("");

                const qaItems15 = (script15.partC && script15.partC.qa) ? script15.partC.qa : [];
                const qaHtml15 = qaItems15.map((q, qIdx) => `
                    <div style="margin-bottom: 8px; padding: 6px 10px; background: #fafafa; border-left: 4px solid #800020; border: 1px solid #ddd;">
                        <p style="margin: 0 0 3px 0; font-size: 10.5pt;"><strong>Câu hỏi ${qIdx + 1}:</strong> ${escapeHtml(q.question)}</p>
                        <p style="margin: 0; color: #1B5E20; font-size: 10pt;"><strong>Gợi ý đối chiếu:</strong> ${escapeHtml(q.answerHint)}</p>
                    </div>
                `).join("");

                return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>Bản in Kịch bản Chuẩn Sư Phạm: ${escapeHtml(script15.title)}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm 15mm 15mm 15mm; }
    body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.45; color: #111; margin: 0; padding: 0; background: #fff; }
    .no-print { display: flex; justify-content: space-between; align-items: center; background: #faf7f2; border: 1px solid #dcd3c5; padding: 10px 18px; margin-bottom: 20px; border-radius: 6px; }
    @media print { .no-print { display: none !important; } body { margin: 0; padding: 0; } }
    .header-tbl { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    .header-tbl td { vertical-align: top; border: none; padding: 0; }
    .doc-title { text-align: center; font-size: 15pt; font-weight: bold; color: #800020; text-transform: uppercase; margin-top: 10px; margin-bottom: 4px; }
    .doc-subtitle { text-align: center; font-size: 11pt; font-style: italic; color: #555; margin-bottom: 16px; }
    .meta-box { background: #faf7f2; border: 1px solid #bbb; border-left: 4px solid #800020; padding: 10px 14px; margin-bottom: 16px; font-size: 10.5pt; }
    .sec-h { font-size: 12pt; font-weight: bold; color: #800020; border-bottom: 1px solid #800020; padding-bottom: 3px; margin-top: 16px; margin-bottom: 8px; text-transform: uppercase; }
    table.data-table { width: 100%; border-collapse: collapse; margin-top: 6px; margin-bottom: 12px; }
    table.data-table th { background: #f0e6d6; color: #5d101d; font-weight: bold; border: 1px solid #777; padding: 5px; text-align: left; font-size: 10pt; }
    table.data-table td { border: 1px solid #aaa; padding: 5px; font-size: 10pt; }
  </style>
</head>
<body>
  <div class="no-print">
    <div>
      <strong style="color: #800020; font-size: 13pt;">📑 Bản In Sư Phạm / Lưu PDF (A4)</strong>
      <span style="font-size: 10pt; color: #555; margin-left: 10px;">(Chọn "Save as PDF" trong hộp thoại in để lưu file PDF)</span>
    </div>
    <button onclick="window.print()" style="background: #800020; color: #fff; border: none; padding: 8px 18px; border-radius: 4px; cursor: pointer; font-weight: bold;">🖨️ In Ngay / Lưu PDF</button>
  </div>

  <table class="header-tbl">
    <tr>
      <td style="width: 45%; text-align: center;">
        <strong>BỘ GIÁO DỤC VÀ ĐÀO TẠO</strong><br/>
        <strong>CHƯƠNG TRÌNH GDPT 2018 — MÔN LỊCH SỬ</strong><br/>
        -------------------
      </td>
      <td style="width: 55%; text-align: center;">
        <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/>
        <strong>Độc lập – Tự do – Hạnh phúc</strong><br/>
        *******************
      </td>
    </tr>
  </table>

  <div class="doc-title">HỒ SƠ KỊCH BẢN HOẠT CẢNH LỊCH SỬ CHUẨN SƯ PHẠM</div>
  <div class="doc-subtitle">${escapeHtml(script15.title)} — ${escapeHtml(script15.format)}</div>

  <div class="meta-box">
    <table style="width: 100%; border: none; border-collapse: collapse;">
      <tr>
        <td style="border: none; padding: 3px 6px; width: 50%;"><strong>📌 Mã bài học:</strong> <span style="color: #800020; font-weight: bold;">${escapeHtml(item.code)}</span></td>
        <td style="border: none; padding: 3px 6px; width: 50%;"><strong>🏷️ Mã đề chuẩn hóa:</strong> <span style="color: #BF360C; font-weight: bold;">${escapeHtml(examCode)}</span></td>
      </tr>
      <tr>
        <td style="border: none; padding: 3px 6px;"><strong>🎓 Khối lớp:</strong> Lớp ${escapeHtml(item.grade)} THPT</td>
        <td style="border: none; padding: 3px 6px;"><strong>⏱️ Thời lượng:</strong> ${escapeHtml(script15.duration || '3–5 phút')}</td>
      </tr>
      <tr>
        <td style="border: none; padding: 3px 6px;" colspan="2"><strong>📖 Bài học SGK:</strong> ${escapeHtml(script15.lesson)}</td>
      </tr>
      <tr>
        <td style="border: none; padding: 3px 6px;" colspan="2"><strong>📚 Chủ đề:</strong> ${escapeHtml(script15.topic)}</td>
      </tr>
      <tr>
        <td style="border: none; padding: 3px 6px;" colspan="2"><strong>🎭 Tình huống sân khấu hóa:</strong> ${escapeHtml(script15.scenario)}</td>
      </tr>
    </table>
  </div>

  <div class="sec-h">PHẦN A: BẢNG CHUẨN BỊ & PHÂN CÔNG VAI DIỄN</div>
  <p><strong>1. Trọng tâm học tập:</strong> ${escapeHtml(script15.focus)}</p>
  <p><strong>2. Bối cảnh lịch sử:</strong> ${escapeHtml(script15.context)}</p>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 35px; text-align: center;">STT</th>
        <th style="width: 150px;">Tên nhân vật</th>
        <th style="width: 130px;">Phân loại</th>
        <th>Đặc điểm vai & Gợi ý diễn xuất</th>
        <th style="width: 170px;">Học sinh nhận vai</th>
      </tr>
    </thead>
    <tbody>
      ${rolesRows15}
    </tbody>
  </table>

  <div class="sec-h">PHẦN B: BẢNG DIỄN THEO LƯỢT (TOÀN VĂN KỊCH BẢN GỐC)</div>
  ${scenesHtml15}

  <div class="sec-h">PHẦN C: PHẦN KẾT, CÂU HỎI KHÁN GIẢ & GỢI Ý ĐỐI CHIẾU</div>
  ${qaHtml15}
  <div style="margin-top: 8px; font-size: 10pt;">
    <p><strong>Lưu ý nội dung:</strong> ${escapeHtml(script15.partC && script15.partC.contentNotes ? script15.partC.contentNotes : 'Phân biệt rõ dữ kiện lịch sử có căn cứ và chi tiết kịch bản hư cấu sáng tạo.')}</p>
    <p><strong>Nguồn tra cứu:</strong> ${escapeHtml(script15.partC && script15.partC.sourceRef ? script15.partC.sourceRef : script15.sources)}</p>
    <p><strong>Nhiệm vụ nối tiếp:</strong> ${escapeHtml(script15.partC && script15.partC.nextTask ? script15.partC.nextTask : 'Hoàn thành phiếu đối chiếu dữ kiện lịch sử M02.')}</p>
  </div>

  <div class="sec-h">QUY TRÌNH 5 BƯỚC TẬP HOẠT CẢNH CHUẨN SƯ PHẠM GDPT 2018</div>
  <ol style="font-size: 10pt; line-height: 1.5;">
    <li><strong>Bước 1 - Đọc kịch bản & Nắm bối cảnh:</strong> Học sinh đọc toàn bộ kịch bản, xác định bối cảnh lịch sử, nắm thông điệp cốt lõi bài học.</li>
    <li><strong>Bước 2 - Phân công vai diễn:</strong> Phân chia người dẫn, các nhân vật và kỹ thuật. Ghi tên học sinh nhận vai vào bảng phân vai.</li>
    <li><strong>Bước 3 - Luyện đọc khớp nhịp & Thao tác thẻ:</strong> Khớp lượt nói từng cảnh (Cảnh 1, 2, 3), làm quen cử chỉ gợi ý, thao tác đạo cụ nhẹ/thẻ mô phỏng.</li>
    <li><strong>Bước 4 - Diễn thử có bấm giờ (3–5 phút):</strong> Thực hành diễn toàn bộ hoạt cảnh trong khung thời gian 3–5 phút; tránh kéo dài bằng lời hô đồng thanh.</li>
    <li><strong>Bước 5 - Hỏi đáp khán giả & Rút ra bài học:</strong> Thực hiện phần kết: đặt 3 câu hỏi cho người xem, đối chiếu gợi ý trả lời, phân biệt giữa sự thật lịch sử và hư cấu kịch bản.</li>
  </ol>

  <table style="width: 100%; border: none; margin-top: 30px;">
    <tr>
      <td style="width: 50%; border: none; text-align: center; vertical-align: top;">
        <br/>
        <strong>GIÁO VIÊN BỘ MÔN / NHÓM HỌC SINH</strong><br/>
        <span style="font-size: 9.5pt; color: #555;">(Ký và ghi rõ họ tên)</span>
      </td>
      <td style="width: 50%; border: none; text-align: center; vertical-align: top;">
        <em>Hà Nội, ngày .... tháng .... năm 2026</em><br/>
        <strong>TỔ CHUYÊN MÔN LỊCH SỬ THPT SITUATION</strong><br/>
        <span style="font-size: 9.5pt; color: #555;">(Xác thực hồ sơ số hóa)</span>
      </td>
    </tr>
  </table>
</body>
</html>`;
            }

            const charsRows = (item.characters && item.characters.length > 0)"""

    if old_printable_header in code:
        code = code.replace(old_printable_header, new_printable_header, 1)
        print("✓ Updated buildLessonPrintableHtml in teacher.js")
    else:
        print("! Could not find old_printable_header in teacher.js")

    # 3. Update buildLessonPlainText (for TXT)
    old_plain_header = """        function buildLessonPlainText(item) {
            const examCode = getPostExamCode(item);
            const charsText = (item.characters && item.characters.length > 0)"""

    new_plain_header = """        function buildLessonPlainText(item) {
            const examCode = getPostExamCode(item);
            const script15 = (typeof getOfficial15Script === "function" ? getOfficial15Script(item.code) : null) || item.scriptData;

            if (script15) {
                const safeCode = item.code.replace(/[^A-Za-z0-9]/g, "");
                const savedRoles = (typeof getScriptRoleAssignments === "function") ? getScriptRoleAssignments(item.code) : {};
                const partAChars = (script15.partA && script15.partA.characters) ? script15.partA.characters : [];
                const rolesText = partAChars.map((c, idx) => {
                    const studentName = savedRoles[idx] || "(Chưa ghi tên)";
                    return `  ${idx + 1}. ${c.name} [${c.type === 'HISTORICAL_FACT' ? 'Lịch sử' : 'Sáng tạo'}]\n     - Đặc điểm: ${c.desc}\n     - Học sinh nhận vai: ${studentName}`;
                }).join("\\n\\n");

                const scenes15 = (script15.partB && script15.partB.scenes) ? script15.partB.scenes : [];
                const scenesText = scenes15.map(sc => {
                    const turns = sc.turns.map(t => {
                        const cue = t.actionCue ? ` [Thao tác: ${t.actionCue}]` : '';
                        return `  [Lượt ${t.turn}] ${t.character}: \"${t.dialogue}\"${cue}`;
                    }).join("\\n");
                    return `=== ${sc.sceneName.toUpperCase()} ===\\n${turns}`;
                }).join("\\n\\n");

                const qaItems15 = (script15.partC && script15.partC.qa) ? script15.partC.qa : [];
                const qaText = qaItems15.map((q, idx) => {
                    return `  Câu hỏi ${idx + 1}: ${q.question}\\n  -> Gợi ý đối chiếu: ${q.answerHint}`;
                }).join("\\n\\n");

                return `================================================================================
BỘ GIÁO DỤC VÀ ĐÀO TẠO — HỆ THỐNG TRA CỨU TƯ LIỆU LỊCH SỬ THPT SITUATION
HỒ SƠ KỊCH BẢN HOẠT CẢNH LỊCH SỬ CHUẨN SƯ PHẠM (CHƯƠNG TRÌNH GDPT 2018)
================================================================================

📌 MÃ BÀI HỌC   : ${item.code}
🏷️ MÃ ĐỀ THI    : ${examCode}
🎓 KHỐI LỚP     : Lớp ${item.grade} THPT
📚 CHỦ ĐỀ       : ${script15.topic}
📖 BÀI HỌC SGK  : ${script15.lesson}
🎭 TIÊU ĐỀ      : ${script15.title} (${script15.format})
⏱️ THỜI LƯỢNG   : ${script15.duration || '3–5 phút'}
🔍 NGUỒN CĂN CỨ : ${script15.sources || 'GDPT 2018'}

--------------------------------------------------------------------------------
PHẦN A: BẢNG CHUẨN BỊ & PHÂN CÔNG VAI DIỄN
--------------------------------------------------------------------------------
1. BỐI CẢNH LỊCH SỬ:
${script15.context}

2. TRỌNG TÂM HỌC TẬP:
${script15.focus}

3. TÌNH HUỐNG SÂN KHẤU HÓA:
${script15.scenario}

4. DANH SÁCH NHÂN VẬT & PHÂN CÔNG HỌC SINH:
${rolesText}

--------------------------------------------------------------------------------
PHẦN B: BẢNG DIỄN THEO LƯỢT (TOÀN VĂN KỊCH BẢN GỐC)
--------------------------------------------------------------------------------
${scenesText}

--------------------------------------------------------------------------------
PHẦN C: PHẦN KẾT, CÂU HỎI KHÁN GIẢ & GỢI Ý ĐỐI CHIẾU
--------------------------------------------------------------------------------
1. CÂU HỎI DÀNH CHO KHÁN GIẢ SAU HOẠT CẢNH:
${qaText}

2. LƯU Ý NỘI DUNG & RANH GIỚI DIỄN XUẤT:
${script15.partC && script15.partC.contentNotes ? script15.partC.contentNotes : 'Phân biệt rõ dữ kiện lịch sử và chi tiết sáng tạo.'}

3. TÀI LIỆU ĐỐI CHIẾU:
${script15.partC && script15.partC.sourceRef ? script15.partC.sourceRef : script15.sources}

4. NHIỆM VỤ NỐI TIẾP:
${script15.partC && script15.partC.nextTask ? script15.partC.nextTask : 'Hoàn thành phiếu đối chiếu dữ kiện lịch sử M02.'}

--------------------------------------------------------------------------------
QUY TRÌNH 5 BƯỚC TẬP HOẠT CẢNH CHUẨN SƯ PHẠM GDPT 2018
--------------------------------------------------------------------------------
- Bước 1: Đọc kịch bản & Nắm bối cảnh lịch sử, bài học SGK.
- Bước 2: Phân công nhân vật & Thống nhất vai diễn, ghi tên học sinh.
- Bước 3: Luyện đọc thoại & Khớp nhịp chuyển cảnh, làm quen cử chỉ gợi ý.
- Bước 4: Diễn tập thử & Bấm giờ quy định (3–5 phút), dùng thẻ mô phỏng.
- Bước 5: Thảo luận, Phản hồi & Hỏi đáp người xem, rút ra bài học.

================================================================================
XÁC THỰC SỐ HÓA: TỔ CHUYÊN MÔN LỊCH SỬ THPT SITUATION (NĂM HỌC 2025 - 2026)
================================================================================
`;
            }

            const charsText = (item.characters && item.characters.length > 0)"""

    if old_plain_header in code:
        code = code.replace(old_plain_header, new_plain_header, 1)
        print("✓ Updated buildLessonPlainText in teacher.js")
    else:
        print("! Could not find old_plain_header in teacher.js")

    with open(path, "w", encoding="utf-8") as f:
        f.write(code)
    print("✓ Successfully saved js/teacher.js")

if __name__ == "__main__":
    update_teacher_js()
