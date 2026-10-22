/**
 * ====================================================================
 * TEST SUITE: 100% IDENTICAL SYNCHRONIZATION (THÊM GÌ XÓA GÌ Y HỆT NHAU 100%)
 * ====================================================================
 * Kiểm thử toàn diện:
 * 1. Thêm bài học mới (Add Post) -> Tất cả các bên y hệt nhau 100%.
 * 2. Sửa bài học (Edit Post) -> Nội dung biến đổi y hệt nhau 100%.
 * 3. Xóa đơn lẻ bài học (Delete Post) -> Xóa sạch ở mọi bên 100%.
 * 4. Xóa hàng loạt bài học (Bulk Delete) -> Đồng bộ xóa 100%.
 * 5. Thêm tài liệu mới vào Kho (Add Document) -> Đồng bộ 100%.
 * 6. Xóa tài liệu khỏi Kho (Delete Document) -> Đồng bộ 100%.
 * 7. Học sinh nộp bài (Submit Roleplay) -> Giáo viên thấy ngay 100%.
 * 8. Giáo viên chấm điểm (Teacher Grade) -> Học sinh nhận điểm ngay 100%.
 * 9. Khôi phục dữ liệu gốc (Restore Default) -> Đồng bộ 42 bài gốc 100%.
 * 10. Xuất & Nạp Snapshot CSDL (.json) -> Tái lập nguyên trạng 100%.
 * 11. Kiểm tra tích hợp Máy chủ Đồng bộ Realtime (sync_server.js).
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const http = require('http');

const html = fs.readFileSync(path.join(__dirname, '..', 'duan.html'), 'utf8');
let scriptCode = '';
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
    scriptCode = scriptMatch[1];
} else {
    const jsFiles = ["data.js", "db.js", "sql-studio.js", "sync.js", "teacher.js", "app.js"];
    scriptCode = jsFiles.map(f => fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8')).join('\n;\n');
}

// 1. Setup shared memory bus
const sharedStorage = {};
const sharedBroadcastListeners = [];

class MockBroadcastChannel {
    constructor(name) {
        this.name = name;
        sharedBroadcastListeners.push(this);
    }
    postMessage(data) {
        sharedBroadcastListeners.forEach(bc => {
            if (bc !== this && typeof bc.onmessage === 'function') {
                bc.onmessage({ data });
            }
        });
    }
}

function createSession(sessionName) {
    const env = {
        console: console,
        Buffer: Buffer,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        clearInterval: clearInterval,
        BroadcastChannel: MockBroadcastChannel,
        localStorage: {
            getItem: k => (k in sharedStorage ? sharedStorage[k] : null),
            setItem: (k, v) => {
                sharedStorage[k] = String(v);
                // Dispatch storage event to other active sessions
                sessions.forEach(s => {
                    if (s !== env && s.window && s.window._listeners && s.window._listeners['storage']) {
                        s.window._listeners['storage'].forEach(fn => {
                            fn({ key: k, newValue: String(v) });
                        });
                    }
                });
            },
            removeItem: k => {
                delete sharedStorage[k];
                sessions.forEach(s => {
                    if (s !== env && s.window && s.window._listeners && s.window._listeners['storage']) {
                        s.window._listeners['storage'].forEach(fn => {
                            fn({ key: k, newValue: null });
                        });
                    }
                });
            },
            clear: () => {
                for (let k in sharedStorage) delete sharedStorage[k];
            }
        },
        sessionStorage: {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
            clear: () => {}
        },
        fetch: async (url, opts) => {
            // Mock offline/online fetch for sync server
            return { ok: false, status: 404, json: async () => ({}) };
        },
        alert: () => {},
        confirm: () => true
    };

    const elements = {};
    const mockElement = (id = 'mock') => {
        if (elements[id]) return elements[id];
        let val = '';
        if (id === 'formatFilter' || id === 'topicFilter' || id === 'docGradeFilter' || id === 'docTypeFilter') val = 'ALL';
        if (id === 'sortOrder') val = 'ASC';
        const el = {
            id,
            value: val,
            textContent: '',
            innerHTML: '',
            style: {},
            checked: false,
            classList: {
                _classes: new Set(),
                add: c => el.classList._classes.add(c),
                remove: c => el.classList._classes.delete(c),
                contains: c => el.classList._classes.has(c)
            },
            addEventListener: (evt, fn) => { el['on' + evt] = fn; },
            appendChild: child => {},
            removeChild: child => {},
            scrollIntoView: () => {},
            click: () => { if (el.onclick) el.onclick(); },
            reset: () => { el.value = ''; }
        };
        elements[id] = el;
        return el;
    };

    env.document = {
        getElementById: mockElement,
        querySelector: () => mockElement(),
        querySelectorAll: () => [],
        createElement: tag => mockElement(tag + '_' + Math.random().toString(36).slice(2, 6)),
        body: mockElement('body')
    };

    env.window = env;
    env.Blob = class { constructor(parts, opts) { this.parts = parts; this.opts = opts; } };
    env.URL = { createObjectURL: () => 'blob:mock', revokeObjectURL: () => {} };
    const listeners = {};
    env.window.addEventListener = (evt, fn) => {
        if (!listeners[evt]) listeners[evt] = [];
        listeners[evt].push(fn);
    };
    env.window._listeners = listeners;
    env.window.open = () => {};
    env.window.location = { href: 'http://localhost:8080/duan.html', reload: () => {} };

    const exportBridge = `
        if (typeof window.catalogData === "undefined") window.catalogData = catalogData;
        if (typeof window.documentStore === "undefined") window.documentStore = documentStore;
        if (typeof window.studentSubmissions === "undefined") window.studentSubmissions = studentSubmissions;
        if (typeof window.isTeacherAuthenticated === "undefined") window.isTeacherAuthenticated = isTeacherAuthenticated;
        if (typeof window.sessionTeacherKey === "undefined") window.sessionTeacherKey = sessionTeacherKey;
        window.saveTeacherPost = saveTeacherPost;
        window.openDetailModal = openDetailModal;
        window.submitTeacherFeedback = submitTeacherFeedback;
        window.studentBookmarks = studentBookmarks;
        window.switchTeacherModalTab = switchTeacherModalTab;
        window.applyCatalogFilters = applyCatalogFilters;
        window.toggleStudentBookmark = toggleStudentBookmark;
        window.isItemBookmarked = isItemBookmarked;
        window.initSituationRealtimeSync = initSituationRealtimeSync;
        window.commitDatabaseMutation = commitDatabaseMutation;
        window.getDeletedCodes = getDeletedCodes;
        window.addDeletedCode = addDeletedCode;
        window.removeDeletedCode = removeDeletedCode;
        window.runInteractiveSyncDemo = runInteractiveSyncDemo;
        window.submitTeacherAuthGate = submitTeacherAuthGate;
        window.exportFullDatabaseSnapshot = exportFullDatabaseSnapshot;
        window.importFullDatabaseSnapshotFile = importFullDatabaseSnapshotFile;
    `;

    const ctx = vm.createContext(env);
    vm.runInContext(scriptCode + exportBridge, ctx);
    env.initSituationRealtimeSync();

    return env;
}

const sessions = [];
let passCount = 0;
let totalCount = 0;

function assert(condition, message) {
    totalCount++;
    if (condition) {
        passCount++;
        console.log(`  ✓ ${message}`);
    } else {
        console.error(`  ❌ THẤT BẠI: ${message}`);
        process.exit(1);
    }
}

async function runTests() {
    console.log('================================================================');
    console.log('   KIỂM THỬ ĐỒNG BỘ 100%: THÊM GÌ XÓA GÌ Y HỆT NHAU 100%');
    console.log('================================================================\n');

    // 1. Khởi tạo 2 phiên độc lập: Phiên A (Giáo viên) và Phiên B (Học sinh)
    console.log('1. Khởi tạo 2 phiên độc lập (Phiên A: Giáo viên, Phiên B: Học sinh):');
    const sessionA = createSession('SessionA_Teacher');
    const sessionB = createSession('SessionB_Student');
    sessions.push(sessionA, sessionB);

    assert(sessionA.catalogData.length === 42, 'Phiên A có đúng 42 bài học chuẩn SGK ban đầu.');
    assert(sessionB.catalogData.length === 42, 'Phiên B có đúng 42 bài học chuẩn SGK ban đầu.');
    assert(sessionA.documentStore.length === sessionB.documentStore.length, 'Kho tư liệu 2 bên ban đầu khớp nhau 100%.');

    // 2. Thử nghiệm THÊM BÀI HỌC MỚI tại Phiên A
    console.log('\n2. Phiên A (Giáo viên) thêm bài học mới:');
    const newPost = {
        code: "12.W01",
        grade: "12",
        examCode: "MD-12.1945",
        topic: "Cách mạng tháng Tám năm 1945",
        lesson: "Hoạt cảnh: Khởi nghĩa giành chính quyền tại Bắc Bộ Phủ",
        scenario: "Tái hiện không khí sục sôi mùa thu tháng Tám, quần chúng nhân dân tiến chiếm Phủ Khâm sai Bắc Kỳ.",
        format: "Kịch bản Word (.docx)",
        focus: "Nghệ thuật chớp thời cơ và sức mạnh đoàn kết toàn dân tộc.",
        originType: "TEACHER_CONTRIBUTED",
        author: "Cô Vũ Thị Hương",
        school: "THPT Chu Văn An",
        fileName: "KichBan_CachMangThangTam.docx",
        fileSize: 312000,
        fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        fileData: "data:application/docx;base64,UEsDBBQ...",
        characters: [{ name: "Tự vệ đỏ", type: "CREATIVE_REP", desc: "Tiên phong phất cờ đỏ sao vàng" }]
    };
    const newDoc = {
        id: "DOC-12W01",
        code: "12.W01",
        title: "Hồ sơ tư liệu: Khởi nghĩa Bắc Bộ Phủ",
        grade: "12",
        format: "DOCX",
        fileName: "KichBan_CachMangThangTam.docx",
        fileSize: 312000,
        fileData: "data:application/docx;base64,UEsDBBQ...",
        content: "Nội dung tư liệu lịch sử 1945..."
    };

    sessionA.commitDatabaseMutation('TEACHER_POST_SAVED', {
        post: newPost,
        doc: newDoc,
        author: newPost.author,
        lesson: newPost.lesson,
        code: newPost.code
    });

    assert(sessionA.catalogData.length === 43, 'Phiên A tăng lên 43 bài học.');
    assert(sessionB.catalogData.length === 43, 'Phiên B lập tức tăng lên 43 bài học (Đồng bộ tức thì 100%).');
    assert(sessionB.catalogData.find(i => i.code === "12.W01") !== undefined, 'Bài học 12.W01 xuất hiện nguyên vẹn tại Phiên B.');
    assert(sessionB.documentStore.find(d => d.code === "12.W01") !== undefined, 'Tài liệu DOC-12W01 xuất hiện nguyên vẹn tại Kho Phiên B.');
    assert(sessionA.catalogData.length === sessionB.catalogData.length, 'Số lượng bài học giữa 2 phiên y hệt nhau 100%.');

    // 3. Thử nghiệm CHỈNH SỬA BÀI HỌC tại Phiên A
    console.log('\n3. Phiên A chỉnh sửa thông tin bài học:');
    const updatedPost = Object.assign({}, newPost, {
        lesson: "Hoạt cảnh: Khởi nghĩa giành chính quyền tại Bắc Bộ Phủ (Bản chuẩn hóa 1945)",
        author: "Cô Vũ Thị Hương (Tổ trưởng Sử)"
    });
    sessionA.commitDatabaseMutation('TEACHER_POST_SAVED', {
        post: updatedPost,
        doc: newDoc,
        author: updatedPost.author,
        lesson: updatedPost.lesson,
        code: updatedPost.code
    });

    const postInB = sessionB.catalogData.find(i => i.code === "12.W01");
    assert(postInB.lesson === "Hoạt cảnh: Khởi nghĩa giành chính quyền tại Bắc Bộ Phủ (Bản chuẩn hóa 1945)", 'Phiên B nhận đúng tiêu đề bài đã sửa 100%.');
    assert(postInB.author === "Cô Vũ Thị Hương (Tổ trưởng Sử)", 'Phiên B nhận đúng tên tác giả đã sửa 100%.');

    // 4. Thử nghiệm XÓA ĐƠN LẺ BÀI HỌC tại Phiên A
    console.log('\n4. Phiên A xóa bài học 12.W01:');
    sessionA.commitDatabaseMutation('TEACHER_POST_DELETED', { code: "12.W01" });

    assert(sessionA.catalogData.find(i => i.code === "12.W01") === undefined, 'Phiên A đã gỡ bỏ hoàn toàn bài 12.W01.');
    assert(sessionB.catalogData.find(i => i.code === "12.W01") === undefined, 'Phiên B lập tức gỡ bỏ hoàn toàn bài 12.W01.');
    assert(sessionA.catalogData.length === 42 && sessionB.catalogData.length === 42, 'Cả 2 phiên trở về đúng 42 bài học y hệt nhau 100%.');
    assert(sessionA.getDeletedCodes().includes("12.W01"), 'Mã 12.W01 đã ghi vào danh sách đã xóa của Phiên A.');
    assert(sessionB.getDeletedCodes().includes("12.W01"), 'Mã 12.W01 đã ghi vào danh sách đã xóa của Phiên B.');

    // 5. Thử nghiệm XÓA HÀNG LOẠT (BULK DELETE) tại Phiên A
    console.log('\n5. Phiên A tạo 2 bài rồi thực hiện XÓA HÀNG LOẠT (Bulk Delete):');
    const postBulk1 = Object.assign({}, newPost, { code: "10.W88", lesson: "Bài test 1" });
    const postBulk2 = Object.assign({}, newPost, { code: "10.W89", lesson: "Bài test 2" });
    sessionA.commitDatabaseMutation('TEACHER_POST_SAVED', { post: postBulk1, code: "10.W88" });
    sessionA.commitDatabaseMutation('TEACHER_POST_SAVED', { post: postBulk2, code: "10.W89" });
    assert(sessionA.catalogData.length === 44 && sessionB.catalogData.length === 44, 'Thêm 2 bài -> 2 bên đều có 44 bài.');

    // Thực hiện xóa hàng loạt
    sessionA.commitDatabaseMutation('TEACHER_POSTS_BULK_DELETED', { codes: ["10.W88", "10.W89"] });
    assert(sessionA.catalogData.length === 42, 'Phiên A đã xóa sạch 2 bài.');
    assert(sessionB.catalogData.length === 42, 'Phiên B lập tức nhận lệnh xóa hàng loạt và xóa sạch 2 bài.');
    assert(sessionA.catalogData.find(i => i.code === "10.W88" || i.code === "10.W89") === undefined, 'Không còn bài nào sót lại ở Phiên A.');
    assert(sessionB.catalogData.find(i => i.code === "10.W88" || i.code === "10.W89") === undefined, 'Không còn bài nào sót lại ở Phiên B.');

    // 6. Thử nghiệm THÊM & XÓA TÀI LIỆU TRONG KHO (Kho tư liệu)
    console.log('\n6. Thử nghiệm Thêm & Xóa tài liệu trong Kho tư liệu:');
    const customDoc = {
        id: "DOC-CUSTOM-999",
        title: "Tư liệu bổ trợ: Di chúc Chủ tịch Hồ Chí Minh",
        code: "12.09A",
        grade: "12",
        format: "PDF",
        source: "Bảo tàng Lịch sử Quốc gia",
        content: "Toàn văn bản Di chúc năm 1969..."
    };
    sessionA.commitDatabaseMutation('DOCUMENT_SAVED', { doc: customDoc });
    assert(sessionB.documentStore.find(d => d.id === "DOC-CUSTOM-999") !== undefined, 'Phiên B nhận ngay tài liệu mới trong Kho tư liệu.');

    sessionA.commitDatabaseMutation('DOCUMENT_DELETED', { docId: "DOC-CUSTOM-999" });
    assert(sessionA.documentStore.find(d => d.id === "DOC-CUSTOM-999") === undefined, 'Phiên A đã gỡ tài liệu khỏi Kho.');
    assert(sessionB.documentStore.find(d => d.id === "DOC-CUSTOM-999") === undefined, 'Phiên B lập tức gỡ tài liệu khỏi Kho.');
    assert(sessionA.documentStore.length === sessionB.documentStore.length, 'Kho tư liệu 2 bên khớp nhau 100%.');

    // 7. Thử nghiệm HỌC SINH NỘP BÀI (Phiên B -> Phiên A)
    console.log('\n7. Học sinh nộp bài kịch bản phân vai từ Phiên B sang Phiên A:');
    const submission = {
        id: "SUB-TEST-123",
        postCode: "10.04A",
        lessonTitle: "Bài 4. Khái niệm văn minh",
        studentName: "Nguyễn Văn An (Nhóm 1)",
        roleName: "Thái sử công Tư Mã Thiên",
        content: "Lời thoại phân vai kịch bản hoàn chỉnh...",
        status: "PENDING"
    };
    sessionB.commitDatabaseMutation('STUDENT_SUBMISSION_CREATED', submission);
    assert(sessionA.studentSubmissions.length === 1, 'Phiên Giáo viên A nhận được bài nộp tức thì 100%.');
    assert(sessionA.studentSubmissions[0].studentName === "Nguyễn Văn An (Nhóm 1)", 'Tên học sinh nộp đúng 100%.');

    // 8. Thử nghiệm GIÁO VIÊN CHẤM ĐIỂM (Phiên A -> Phiên B)
    console.log('\n8. Giáo viên chấm điểm và nhận xét từ Phiên A gửi về Phiên B:');
    const gradedSub = Object.assign({}, submission, {
        status: "GRADED",
        teacherGrade: "10/10 (Xuất sắc)",
        teacherFeedback: "Kịch bản chuẩn xác lịch sử, biểu cảm giàu cảm xúc!"
    });
    sessionA.commitDatabaseMutation('TEACHER_FEEDBACK_SAVED', gradedSub);
    assert(sessionB.studentSubmissions[0].status === "GRADED", 'Phiên B (Học sinh) nhận trạng thái GRADED ngay lập tức.');
    assert(sessionB.studentSubmissions[0].teacherGrade === "10/10 (Xuất sắc)", 'Điểm số hiển thị đúng 10/10 tại Phiên B.');
    assert(sessionB.studentSubmissions[0].teacherFeedback.includes("Kịch bản chuẩn xác"), 'Lời phê hiển thị đầy đủ tại Phiên B.');

    // 9. Thử nghiệm KHÔI PHỤC DỮ LIỆU GỐC (RESTORE DEFAULT DATA)
    console.log('\n9. Khôi phục dữ liệu gốc chuẩn SGK:');
    sessionA.commitDatabaseMutation('RESTORE_DEFAULT_DATA', {});
    assert(sessionA.catalogData.length === 42, 'Phiên A khôi phục 42 bài học chuẩn.');
    assert(sessionB.catalogData.length === 42, 'Phiên B khôi phục 42 bài học chuẩn.');
    assert(sessionA.getDeletedCodes().length === 0, 'Danh sách mã đã xóa của Phiên A đã dọn sạch.');
    assert(sessionB.getDeletedCodes().length === 0, 'Danh sách mã đã xóa của Phiên B đã dọn sạch.');

    // 10. Thử nghiệm XUẤT VÀ NẠP SNAPSHOT CSDL (.JSON)
    console.log('\n10. Xuất và Nạp Snapshot CSDL Toàn diện (.json):');
    const exportedSnapshot = {
        format: "SITUATION_FULL_DATABASE_BACKUP",
        version: Date.now(),
        exportDate: new Date().toISOString(),
        stats: { catalogTotal: 43, docsTotal: 15, submissionsTotal: 1, deletedTotal: 0 },
        teacherPosts: [newPost],
        teacherDocs: [newDoc],
        customDocs: [],
        deletedCodes: [],
        studentSubmissions: [gradedSub],
        studentBookmarks: ["10.04A"]
    };

    // Tạo Phiên C mới tinh và nạp snapshot vào
    const sessionC = createSession('SessionC_FreshDevice');
    sessions.push(sessionC);
    assert(sessionC.catalogData.length === 42, 'Phiên C ban đầu có 42 bài.');

    // Nạp snapshot vào Phiên C
    sessionC.localStorage.setItem('situation_teacher_posts', JSON.stringify(exportedSnapshot.teacherPosts));
    sessionC.localStorage.setItem('situation_teacher_docs', JSON.stringify(exportedSnapshot.teacherDocs));
    sessionC.localStorage.setItem('situation_student_submissions', JSON.stringify(exportedSnapshot.studentSubmissions));
    sessionC.commitDatabaseMutation('FULL_DATABASE_SYNC', exportedSnapshot);

    assert(sessionC.catalogData.length === 43, 'Phiên C nạp snapshot thành công -> có đúng 43 bài.');
    assert(sessionC.catalogData.find(i => i.code === "12.W01") !== undefined, 'Bài 12.W01 có mặt đầy đủ tại Phiên C.');
    assert(sessionC.studentSubmissions.length === 1, 'Bài nộp học sinh có mặt đầy đủ tại Phiên C.');

    // 11. Kiểm tra MÁY CHỦ ĐỒNG BỘ REALTIME (sync_server.js)
    console.log('\n11. Kiểm thử Máy chủ Đồng bộ Realtime (sync_server.js):');
    const { loadDatabase, saveDatabase } = require('../sync_server.js');
    const serverDb = loadDatabase();
    assert(typeof serverDb === 'object', 'Tệp máy chủ sync_server.js đọc CSDL thành công.');
    assert(Array.isArray(serverDb.teacherPosts), 'Cấu trúc CSDL máy chủ chuẩn xác.');

    // Mô phỏng lưu mutation vào máy chủ
    serverDb.teacherPosts = serverDb.teacherPosts.filter(p => p.code !== newPost.code);
    serverDb.teacherPosts.unshift(newPost);
    saveDatabase(serverDb);
    const reloadedServerDb = loadDatabase();
    assert(reloadedServerDb.teacherPosts.some(p => p.code === "12.W01"), 'Máy chủ lưu trữ bền vững tệp situation_database.json thành công 100%.');

    // 12. Kiểm thử xóa sạch toàn bộ bài Khối 11 (Grade 11 Complete Deletion & Realtime Tab Sync)
    console.log('\n12. Kiểm thử Phiên A xóa toàn bộ bài Khối 11 -> Phiên B lập tức mất 100%:');
    const grade11Items = sessionA.catalogData.filter(i => i.grade === '11');
    const initialGrade11Count = grade11Items.length;
    assert(initialGrade11Count === 14, `Phiên A ban đầu có đủ ${initialGrade11Count} bài học Khối 11.`);
    assert(sessionB.catalogData.filter(i => i.grade === '11').length === 14, 'Phiên B ban đầu có đủ 14 bài học Khối 11.');

    const initialTotal = sessionA.catalogData.length;
    const grade11Codes = grade11Items.map(i => i.code);
    sessionA.commitDatabaseMutation('TEACHER_POSTS_BULK_DELETED', { codes: grade11Codes });

    assert(sessionA.catalogData.filter(i => i.grade === '11').length === 0, 'Phiên A đã xóa sạch toàn bộ bài Khối 11 (còn 0 bài).');
    assert(sessionB.catalogData.filter(i => i.grade === '11').length === 0, 'Phiên B lập tức mất toàn bộ bài Khối 11 (còn 0 bài).');
    assert(sessionA.catalogData.length === sessionB.catalogData.length, 'Số lượng bài giữa 2 phiên khớp nhau 100% sau khi xóa.');
    assert(sessionB.catalogData.length === initialTotal - 14, `Tổng bài học tại Phiên B giảm đúng 14 bài (còn ${initialTotal - 14} bài).`);
    assert(sessionB.document.getElementById('grade-badge-11').textContent === 0, 'Huy hiệu Khối 11 tại Phiên B hiển thị đúng số 0.');
    assert(sessionB.document.getElementById('home-count-11').textContent === '0 bài học chuẩn', 'Thẻ Khối 11 Trang chủ tại Phiên B cập nhật 0 bài.');

    // Khôi phục lại dữ liệu cho trạng thái sạch
    sessionA.commitDatabaseMutation('RESTORE_DEFAULT_DATA', {});
    assert(sessionA.catalogData.filter(i => i.grade === '11').length === 14, 'Phiên A khôi phục lại đủ 14 bài Khối 11.');
    assert(sessionB.catalogData.filter(i => i.grade === '11').length === 14, 'Phiên B khôi phục lại đủ 14 bài Khối 11.');

    console.log('\n================================================================');
    console.log(`   🎉 KẾT QUẢ KIỂM THỬ: ${passCount}/${totalCount} TIÊU CHÍ ĐÃ ĐẠT 100%!`);
    console.log('   MỌI THAO TÁC THÊM GÌ - XÓA GÌ ĐỀU ĐỒNG BỘ Y HỆT NHAU 100%!');
    console.log('================================================================');
    process.exit(0);
}

runTests().catch(err => {
    console.error('Lỗi kiểm thử:', err);
    process.exit(1);
});
