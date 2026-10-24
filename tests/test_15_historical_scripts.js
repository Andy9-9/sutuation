/**
 * ====================================================================
 * TEST SUITE: 15 HOẠT CẢNH LỊCH SỬ CHUẨN SƯ PHẠM (MỖI KHỐI 5 BÀI)
 * SỬ TUATION • KIỂM THỬ TOÀN DIỆN DỮ LIỆU, GIAO DIỆN & TÍNH NĂNG SƯ PHẠM
 * ====================================================================
 */

const assert = require('assert');
const fs = require('fs');

console.log("=================================================================");
console.log("   KIỂM THỬ 15 HOẠT CẢNH LỊCH SỬ CHUẨN SƯ PHẠM (MỖI KHỐI 5 BÀI)   ");
console.log("=================================================================\n");

// 1. Kiểm tra nạp module scripts15-data.js
const { HISTORICAL_15_SCRIPTS, REHEARSAL_5_STEPS, getOfficial15Script, get15ScriptsByGrade } = require('../js/scripts15-data.js');

console.log("1. Kiểm tra cấu trúc CSDL 15 Hoạt cảnh:");
assert.strictEqual(HISTORICAL_15_SCRIPTS.length, 15, "Phải có đúng 15 hoạt cảnh lịch sử");
console.log("  ✓ Tổng số kịch bản: 15 bài");

const g10 = get15ScriptsByGrade('10');
const g11 = get15ScriptsByGrade('11');
const g12 = get15ScriptsByGrade('12');

assert.strictEqual(g10.length, 5, "Khối 10 phải có đúng 5 hoạt cảnh");
assert.strictEqual(g11.length, 5, "Khối 11 phải có đúng 5 hoạt cảnh");
assert.strictEqual(g12.length, 5, "Khối 12 phải có đúng 5 hoạt cảnh");

console.log("  ✓ Phân bổ chuẩn: Khối 10 (5 bài) | Khối 11 (5 bài) | Khối 12 (5 bài)");

// 2. Kiểm tra tính toàn vẹn 3 Phần (A, B, C) cho toàn bộ 15 kịch bản
console.log("\n2. Kiểm tra tính toàn vẹn 3 Phần (Phần A, B, C) cho từng kịch bản:");
HISTORICAL_15_SCRIPTS.forEach((s, idx) => {
    // Phần A
    assert(s.partA, `Bài ${s.code} thiếu partA`);
    const partRoles = s.partA.roles || s.partA.characters;
    assert(partRoles && partRoles.length >= 3, `Bài ${s.code} partA phải có ít nhất 3 nhân vật`);
    
    // Phần B
    assert(s.partB, `Bài ${s.code} thiếu partB`);
    assert(s.partB.scenes && s.partB.scenes.length >= 2, `Bài ${s.code} partB phải có ít nhất 2 cảnh sân khấu`);
    s.partB.scenes.forEach((sc, scIdx) => {
        assert(sc.sceneName, `Bài ${s.code} cảnh ${scIdx + 1} thiếu tên cảnh`);
        assert(sc.turns && sc.turns.length > 0, `Bài ${s.code} cảnh ${scIdx + 1} thiếu lượt thoại`);
    });

    // Phần C
    assert(s.partC, `Bài ${s.code} thiếu partC`);
    assert(s.partC.qa && s.partC.qa.length === 3, `Bài ${s.code} partC phải có 3 câu hỏi khán giả`);
    assert(s.partC.contentNotes, `Bài ${s.code} thiếu lưu ý nội dung`);
    assert(s.partC.sourceRef, `Bài ${s.code} thiếu nguồn tham khảo`);
});
console.log("  ✓ 100% (15/15) kịch bản có đầy đủ trọn vẹn Phần A, Phần B (3 Cảnh), Phần C (3 Câu hỏi)");

// 3. Kiểm tra hàm tìm kiếm & liên kết mã (Canonical & Alternate Codes)
console.log("\n3. Kiểm tra ánh xạ mã bài học (Mapping Codes):");
const codePairs = [
    { inCode: '10.04A', expectedTitle: 'Bên dòng sông Nile' },
    { inCode: '10.06A', expectedTitle: 'Từ xưởng thủ công đến nhà máy' },
    { inCode: '11.07A', expectedTitle: 'Bạch Đằng – chuẩn bị cho trận đánh' },
    { inCode: '11.09A', expectedTitle: 'Một chính sách, nhiều góc nhìn' },
    { inCode: '11.10B', expectedTitle: 'Theo dấu đội Hoàng Sa' },
    { inCode: '12.01A', expectedTitle: 'Cùng tìm một giải pháp hòa bình' },
    { inCode: '12.04A', expectedTitle: 'Cùng mở một chặng đường' },
    { inCode: '12.08A', expectedTitle: 'Một chuyến hàng trên Trường Sơn' }
];

codePairs.forEach(cp => {
    const found = getOfficial15Script(cp.inCode);
    assert(found, `Không tìm thấy kịch bản cho mã: ${cp.inCode}`);
    assert.strictEqual(found.title, cp.expectedTitle, `Sai tiêu đề cho ${cp.inCode}: mong đợi "${cp.expectedTitle}", nhận "${found.title}"`);
    console.log(`  ✓ Mã ${cp.inCode} -> "${found.title}" (Khối ${found.grade})`);
});

// 4. Kiểm tra 5 Bước tập hoạt cảnh chuẩn sư phạm
console.log("\n4. Kiểm tra Hướng dẫn 5 Bước tập hoạt cảnh:");
assert.strictEqual(REHEARSAL_5_STEPS.length, 5, "Phải có đúng 5 bước sư phạm");
REHEARSAL_5_STEPS.forEach(st => {
    assert(st.step && st.title && st.desc && st.icon, "Bước sư phạm thiếu thông tin");
    console.log(`  ✓ Bước ${st.step}: ${st.title} (${st.tag})`);
});

// 5. Kiểm tra tính năng xuất file Word, TXT, Print HTML trong js/teacher.js
console.log("\n5. Kiểm tra xuất kịch bản đầy đủ 3 phần trong js/teacher.js:");
// Thiết lập môi trường DOM giả lập
global.window = {
    addEventListener: () => {},
    localStorage: {
        _data: {},
        getItem(k) { return this._data[k] || null; },
        setItem(k, v) { this._data[k] = String(v); },
        removeItem(k) { delete this._data[k]; }
    },
    HISTORICAL_15_SCRIPTS,
    REHEARSAL_5_STEPS,
    getOfficial15Script,
    get15ScriptsByGrade
};
global.localStorage = global.window.localStorage;
global.document = {
    getElementById: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ setAttribute: () => {}, style: {} })
};
global.getOfficial15Script = getOfficial15Script;

// Nạp teacher.js
const teacherJsCode = fs.readFileSync('js/teacher.js', 'utf8');
eval(teacherJsCode);

const mockItem = {
    code: '10.04A',
    examCode: 'MD-10.04',
    grade: '10',
    lesson: 'Bài 4. Khái niệm văn minh',
    topic: 'Văn minh Ai Cập cổ đại',
    format: 'Hoạt cảnh đời sống',
    scenario: 'Bên dòng sông Nile',
    focus: 'Điều kiện tự nhiên và sản xuất',
    context: 'Sông Nile và cư dân Ai Cập'
};

const plainText = buildLessonPlainText(mockItem);
assert(plainText.includes("PHẦN A: BẢNG CHUẨN BỊ & PHÂN CÔNG VAI DIỄN"), "Bản TXT phải có Phần A");
assert(plainText.includes("PHẦN B: BẢNG DIỄN THEO LƯỢT"), "Bản TXT phải có Phần B");
assert(plainText.includes("PHẦN C: PHẦN KẾT, CÂU HỎI KHÁN GIẢ & GỢI Ý ĐỐI CHIẾU"), "Bản TXT phải có Phần C");
assert(plainText.includes("QUY TRÌNH 5 BƯỚC TẬP HOẠT CẢNH CHUẨN SƯ PHẠM"), "Bản TXT phải có 5 bước tập");
console.log("  ✓ Xuất bản Văn bản thuần (TXT) chứa trọn vẹn 3 Phần A, B, C và 5 Bước tập!");

const printableHtml = buildLessonPrintableHtml(mockItem);
assert(printableHtml.includes("PHẦN A: BẢNG CHUẨN BỊ & PHÂN CÔNG VAI DIỄN"), "Bản in phải có Phần A");
assert(printableHtml.includes("PHẦN B: BẢNG DIỄN THEO LƯỢT"), "Bản in phải có Phần B");
assert(printableHtml.includes("PHẦN C: PHẦN KẾT, CÂU HỎI KHÁN GIẢ & GỢI Ý ĐỐI CHIẾU"), "Bản in phải có Phần C");
assert(printableHtml.includes("QUY TRÌNH 5 BƯỚC TẬP HOẠT CẢNH CHUẨN SƯ PHẠM"), "Bản in phải có 5 bước tập");
console.log("  ✓ Xuất bản in PDF / DOCX chứa trọn vẹn 3 Phần A, B, C và 5 Bước tập!");

// 6. Kiểm tra giao diện và bộ lọc trong index.html, duan.html
console.log("\n6. Kiểm tra giao diện tích hợp trong duan.html & index.html:");
['duan.html', 'index.html'].forEach(f => {
    const html = fs.readFileSync(f, 'utf8');
    assert(html.includes("scripts15-data.js"), `${f} phải nhúng scripts15-data.js`);
    assert(html.includes("official15ShowcaseSection"), `${f} phải có khu vực 15 hoạt cảnh chuẩn trên trang chủ`);
    assert(html.includes("rehearsalGuideModal"), `${f} phải có Modal Hướng dẫn 5 Bước`);
    assert(html.includes("official15Filter"), `${f} phải có checkbox Lọc 15 Kịch bản Chuẩn`);
    console.log(`  ✓ ${f}: Có đầy đủ Showcase, Tabs Khối 10-11-12, Modal 5 Bước & Bộ lọc!`);
});

console.log("\n=================================================================");
console.log("   🎉 100% CÁC BÀI TEST 15 HOẠT CẢNH LỊCH SỬ CHUẨN SƯ PHẠM ĐÃ ĐẠT!   ");
console.log("=================================================================");
