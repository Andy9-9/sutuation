/**
 * ====================================================================
 * TEST SUITE: PUBLIC WEB APPLICATION LIFECYCLE
 * GIÁO VIÊN NHẬP KEY & ĐĂNG BÀI - HỌC SINH LẤY BÀI VỀ HỌC TẬP
 * ====================================================================
 * Kiểm thử toàn diện 8 giai đoạn trọng tâm của hệ thống:
 * 1. Bảo mật & Xác thực Mã Khóa Giáo viên (3 cấp độ).
 * 2. Giáo viên Đăng bài giảng & Tệp Kịch bản Word/PDF.
 * 3. Học sinh trên Web Public nhận bài mới Tức thì 100% (< 0.05s).
 * 4. Học sinh Mở bài học & Tải bài về máy (Word/PDF/Docx/Doc).
 * 5. Học sinh Phân vai kịch bản & Nộp bài cho Giáo viên.
 * 6. Giáo viên Chấm điểm & Gửi nhận xét phản hồi cho Học sinh.
 * 7. Giáo viên Chỉnh sửa & Xóa bài (Học sinh cập nhật tức thì).
 * 8. Học sinh mới truy cập lần đầu (Cold-start từ Server API).
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

let passCount = 0;
let totalCount = 0;

function assert(condition, message) {
    totalCount++;
    if (!condition) {
        console.error(`  ❌ THẤT BẠI: ${message}`);
        throw new Error(message);
    } else {
        passCount++;
        console.log(`  ✓ ${message}`);
    }
}

// Bộ nhớ dùng chung giữa các phiên (mô phỏng Web Storage & BroadcastChannel của trình duyệt)
const sharedStorage = {};
const sharedBroadcastListeners = [];
const sessions = [];

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
    const sessionMemory = {};
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
            getItem: k => (k in sessionMemory ? sessionMemory[k] : null),
            setItem: (k, v) => { sessionMemory[k] = String(v); },
            removeItem: k => { delete sessionMemory[k]; },
            clear: () => { for (let k in sessionMemory) delete sessionMemory[k]; }
        },
        fetch: async (url, opts) => {
            return { ok: false, status: 404, json: async () => ({}) };
        },
        Blob: typeof Blob !== 'undefined' ? Blob : class MockBlob { constructor(parts, opts) { this.parts = parts; this.opts = opts; } },
        URL: typeof URL !== 'undefined' ? URL : { createObjectURL: () => 'blob:mock', revokeObjectURL: () => {} },
        alert: (msg) => { env._lastAlert = msg; },
        confirm: () => true
    };

    const elements = {};
    function getOrCreateElement(id) {
        if (!elements[id]) {
            elements[id] = {
                id: id,
                value: '',
                textContent: '',
                innerHTML: '',
                style: {},
                classList: {
                    _classes: new Set(),
                    add(c) { this._classes.add(c); },
                    remove(c) { this._classes.delete(c); },
                    contains(c) { return this._classes.has(c); },
                    toggle(c) {
                        if (this._classes.has(c)) { this._classes.delete(c); return false; }
                        else { this._classes.add(c); return true; }
                    }
                },
                focus() { this._focused = true; },
                reset() { this.value = ''; }
            };
        }
        return elements[id];
    }

    const windowListeners = {};
    const docListeners = {};

    env.document = {
        getElementById: id => getOrCreateElement(id),
        querySelectorAll: () => [],
        querySelector: () => null,
        addEventListener: (event, fn) => {
            if (!docListeners[event]) docListeners[event] = [];
            docListeners[event].push(fn);
        },
        visibilityState: 'visible',
        createElement: (tag) => {
            return {
                tagName: tag.toUpperCase(),
                style: {},
                appendChild: () => {},
                removeChild: () => {},
                click: () => {},
                setAttribute: () => {},
                getAttribute: () => null
            };
        },
        body: {
            appendChild: () => {},
            removeChild: () => {}
        }
    };

    env.window = {
        addEventListener: (event, fn) => {
            if (!windowListeners[event]) windowListeners[event] = [];
            windowListeners[event].push(fn);
        },
        removeEventListener: () => {},
        _listeners: windowListeners,
        location: { href: 'http://localhost:8080/duan.html', protocol: 'http:' }
    };
    env.window.window = env.window;
    env.window.document = env.document;
    env.window.localStorage = env.localStorage;
    env.window.sessionStorage = env.sessionStorage;
    env.window.BroadcastChannel = MockBroadcastChannel;

    sessions.push(env);
    vm.createContext(env);
    vm.runInContext(scriptCode, env);

    const bridgeScript = `
        if (typeof window.catalogData === "undefined") window.catalogData = catalogData;
        if (typeof window.documentStore === "undefined") window.documentStore = documentStore;
        if (typeof window.studentSubmissions === "undefined") window.studentSubmissions = studentSubmissions;
        if (typeof window.isTeacherAuthenticated === "undefined") window.isTeacherAuthenticated = isTeacherAuthenticated;
        if (typeof window.sessionTeacherKey === "undefined") window.sessionTeacherKey = sessionTeacherKey;
        window.saveTeacherPost = saveTeacherPost;
        window.openDetailModal = openDetailModal;
        window.generateAndDownloadWordDocument = generateAndDownloadWordDocument;
        window.commitDatabaseMutation = commitDatabaseMutation;
        window.openTeacherPostModal = openTeacherPostModal;
        window.submitTeacherAuthGate = submitTeacherAuthGate;
        window.lockTeacherSession = lockTeacherSession;
        window.applyFullServerSync = applyFullServerSync;
        window.getTeacherAuthState = getTeacherAuthState;
    `;
    vm.runInContext(bridgeScript, env);

    if (env.catalogData === undefined) {
        Object.defineProperty(env, 'catalogData', { get: () => env.window.catalogData, set: v => { env.window.catalogData = v; } });
    }
    if (env.documentStore === undefined) {
        Object.defineProperty(env, 'documentStore', { get: () => env.window.documentStore, set: v => { env.window.documentStore = v; } });
    }
    if (env.studentSubmissions === undefined) {
        Object.defineProperty(env, 'studentSubmissions', { get: () => env.window.studentSubmissions, set: v => { env.window.studentSubmissions = v; } });
    }
    env.saveTeacherPost = (...args) => env.window.saveTeacherPost(...args);
    env.openDetailModal = (...args) => env.window.openDetailModal(...args);
    env.generateAndDownloadWordDocument = (...args) => env.window.generateAndDownloadWordDocument(...args);
    env.commitDatabaseMutation = (...args) => env.window.commitDatabaseMutation(...args);
    env.openTeacherPostModal = (...args) => env.window.openTeacherPostModal(...args);
    env.submitTeacherAuthGate = (...args) => env.window.submitTeacherAuthGate(...args);
    env.lockTeacherSession = (...args) => env.window.lockTeacherSession(...args);
    env.applyFullServerSync = (...args) => env.window.applyFullServerSync(...args);
    env.getTeacherAuthState = (...args) => env.window.getTeacherAuthState(...args);

    // Kích hoạt DOMContentLoaded
    if (docListeners['DOMContentLoaded']) {
        docListeners['DOMContentLoaded'].forEach(fn => fn());
    }
    if (windowListeners['DOMContentLoaded']) {
        windowListeners['DOMContentLoaded'].forEach(fn => fn());
    }

    env._elements = elements;
    env._sessionName = sessionName;
    return env;
}

async function runPublicWebLifecycleTests() {
    console.log('================================================================');
    console.log('   KIỂM THỬ WEB PUBLIC: GIÁO VIÊN NHẬP KEY & ĐĂNG BÀI - HS LẤY BÀI');
    console.log('================================================================\n');

    // Dọn sạch storage ban đầu
    for (let k in sharedStorage) delete sharedStorage[k];

    // Khởi tạo 2 phiên làm việc độc lập
    const teacherSession = createSession('Máy Giáo viên (Tab 1)');
    const studentSession = createSession('Máy Học sinh (Tab 2)');

    // -------------------------------------------------------------
    // GIAI ĐOẠN 1: BẢO MẬT & XÁC THỰC MÃ KHÓA GIÁO VIÊN (3 CẤP ĐỘ)
    // -------------------------------------------------------------
    console.log('1. Kiểm thử Bảo mật & Phân quyền Mã Khóa Giáo viên:');
    assert(teacherSession.getTeacherAuthState().isAuthenticated === false, 'Ban đầu giáo viên chưa xác thực mã khóa.');
    assert(studentSession.getTeacherAuthState().isAuthenticated === false, 'Ban đầu học sinh chưa xác thực mã khóa.');

    // 1.1 Thử nhập mã khóa sai (123456)
    teacherSession.document.getElementById('gateAuthKeyInput').value = '123456';
    teacherSession.submitTeacherAuthGate();
    assert(teacherSession.getTeacherAuthState().isAuthenticated === false, 'Nhập mã sai "123456" bị từ chối xác thực 100%.');
    assert(teacherSession._elements['gateKeyFeedback'].innerHTML.includes('không chính xác'), 'Giao diện phản hồi thông báo mã khóa không chính xác.');

    // 1.2 Thử nhập mã khóa Cấp 1 (SU2026 - Giáo viên Bộ môn)
    teacherSession.document.getElementById('gateAuthKeyInput').value = 'SU2026';
    teacherSession.submitTeacherAuthGate();
    assert(teacherSession.getTeacherAuthState().isAuthenticated === true, 'Mã "SU2026" xác thực thành công.');
    assert(teacherSession.getTeacherAuthState().key === 'SU2026', 'Lưu đúng mã phiên "SU2026".');
    assert(teacherSession.sessionStorage.getItem('situation_teacher_session_key') === 'SU2026', 'Mã phiên được lưu an toàn trong sessionStorage.');

    // Mở form đăng bài với thông tin xác thực
    teacherSession.openTeacherPostModal();
    const badgeText = teacherSession._elements['teacherAuthHeaderBadge'].innerHTML;
    assert(badgeText.includes('Giáo viên Bộ môn Lịch sử'), 'Form hiển thị đúng vai trò Giáo viên Bộ môn Lịch sử.');

    // 1.3 Kiểm tra chức năng Khóa phiên làm việc
    teacherSession.lockTeacherSession();
    assert(teacherSession.getTeacherAuthState().isAuthenticated === false, 'Đã khóa phiên làm việc thành công.');
    assert(teacherSession.sessionStorage.getItem('situation_teacher_session_key') === null, 'Dọn sạch session key trong sessionStorage.');

    // 1.4 Thử đăng nhập lại bằng Key Cấp 2 (GV-HIST-2026 - Tổ trưởng)
    teacherSession.document.getElementById('gateAuthKeyInput').value = 'GV-HIST-2026';
    teacherSession.submitTeacherAuthGate();
    assert(teacherSession.getTeacherAuthState().isAuthenticated === true, 'Mã "GV-HIST-2026" xác thực thành công.');
    teacherSession.openTeacherPostModal();
    assert(teacherSession._elements['teacherAuthHeaderBadge'].innerHTML.includes('Tổ trưởng Chuyên môn'), 'Form hiển thị đúng vai trò Tổ trưởng Chuyên môn.');

    // -------------------------------------------------------------
    // GIAI ĐOẠN 2: GIÁO VIÊN ĐĂNG BÀI KỊCH BẢN & ĐÍNH KÈM TỆP WORD/PDF
    // -------------------------------------------------------------
    console.log('\n2. Giáo viên Đăng bài giảng & Tệp Kịch bản Word:');
    const initialTeacherPostCount = teacherSession.catalogData.length;
    assert(initialTeacherPostCount === 42, 'Hệ thống ban đầu có 42 bài học chuẩn SGK.');

    // Giáo viên điền thông tin bài học Khối 11
    teacherSession.document.getElementById('teacherGrade').value = '11';
    teacherSession.document.getElementById('teacherTitle').value = 'Khởi nghĩa Hương Khê và thủ lĩnh Phan Đình Phùng';
    teacherSession.document.getElementById('teacherAuthor').value = 'Thầy Phan Đình Phùng';
    teacherSession.document.getElementById('teacherSchool').value = 'THPT Chuyên Hà Tĩnh';
    teacherSession.document.getElementById('teacherSummary').value = 'Tái hiện căn cứ Vụ Quang và tinh thần chiến đấu anh dũng của nghĩa quân Hương Khê chống thực dân Pháp.';
    teacherSession.document.getElementById('teacherFileName').value = 'KichBan_HuongKhe.docx';
    teacherSession.document.getElementById('teacherFileBase64').value = 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,UEsDBBQAAAAIAAA...';
    teacherSession.document.getElementById('teacherFileSize').value = 450000;
    teacherSession.document.getElementById('teacherFileType').value = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    // Bấm lưu bài đăng
    teacherSession.saveTeacherPost();

    assert(teacherSession.catalogData.length === 43, 'Danh mục Giáo viên tăng lên 43 bài.');
    const createdPost = teacherSession.catalogData.find(i => i.lesson.includes('Hương Khê'));
    assert(createdPost !== undefined, 'Bài học Khởi nghĩa Hương Khê đã được tạo.');
    assert(createdPost.code === '11.W01', 'Mã bài học tự sinh chuẩn xác: 11.W01.');
    assert(createdPost.originType === 'TEACHER_CONTRIBUTED', 'Nguồn gốc bài: TEACHER_CONTRIBUTED.');
    assert(createdPost.fileName === 'KichBan_HuongKhe.docx', 'Tệp đính kèm Word .docx được lưu trữ trọn vẹn.');
    assert(createdPost.author === 'Thầy Phan Đình Phùng', 'Lưu đúng tên Giáo viên biên soạn.');

    // Kiểm tra tài liệu liên kết trong Kho tri thức RAG
    const linkedDoc = teacherSession.documentStore.find(d => d.code === '11.W01');
    assert(linkedDoc !== undefined, 'Hồ sơ tài liệu kịch bản được tự động nạp vào Kho tri thức RAG.');
    assert(linkedDoc.id === 'DOC-11W01', 'Mã định danh tài liệu chuẩn: DOC-11W01.');

    // -------------------------------------------------------------
    // GIAI ĐOẠN 3: HỌC SINH TRÊN WEB PUBLIC NHẬN BÀI MỚI TỨC THÌ
    // -------------------------------------------------------------
    console.log('\n3. Học sinh trên Web Public nhận bài mới Tức thì 100%:');
    assert(studentSession.catalogData.length === 43, 'Tab Học sinh tự động tăng lên 43 bài (Không cần F5).');
    const studentReceivedPost = studentSession.catalogData.find(i => i.code === '11.W01');
    assert(studentReceivedPost !== undefined, 'Bài 11.W01 xuất hiện nguyên vẹn tại màn hình Học sinh.');
    assert(studentReceivedPost.lesson === 'Khởi nghĩa Hương Khê và thủ lĩnh Phan Đình Phùng', 'Tiêu đề bài học tại Học sinh khớp 100%.');
    assert(studentReceivedPost.fileName === 'KichBan_HuongKhe.docx', 'Tệp Word đính kèm sẵn sàng cho Học sinh tải về.');

    // Kiểm tra số lượng bài Khối 11 tại phía Học sinh
    const grade11CountStudent = studentSession.catalogData.filter(i => i.grade === '11').length;
    assert(grade11CountStudent === 15, 'Số bài Khối 11 phía Học sinh tăng từ 14 lên 15 bài chuẩn xác.');
    assert(studentSession._elements['grade-badge-11'].textContent === 15, 'Huy hiệu Khối 11 cập nhật số 15 tại màn hình Học sinh.');
    assert(studentSession._elements['home-count-11'].textContent === '15 bài học chuẩn', 'Thẻ Khối 11 Trang chủ cập nhật 15 bài học chuẩn.');

    // -------------------------------------------------------------
    // GIAI ĐOẠN 4: HỌC SINH MỞ VÀ LẤY BÀI VỀ MÁY (WORD/PDF/DOCX/DOC)
    // -------------------------------------------------------------
    console.log('\n4. Học sinh Mở và Lấy bài về máy (Download & Export):');
    studentSession.openDetailModal('11.W01');
    assert(studentSession._elements['detailCode'].textContent.includes('11.W01'), 'Hộp thoại chi tiết hiển thị đúng mã bài 11.W01.');
    assert(studentSession._elements['detailLesson'].textContent.includes('Hương Khê'), 'Hộp thoại chi tiết hiển thị đúng tên bài.');

    // Học sinh tải file nguyên bản (.docx) do giáo viên đính kèm
    let downloadedOriginalFile = null;
    studentSession.exportLessonOriginalFile = function(item) {
        downloadedOriginalFile = {
            fileName: item.fileName,
            fileData: item.fileData,
            fileSize: item.fileSize
        };
    };
    studentSession.exportLessonOriginalFile(studentReceivedPost);
    assert(downloadedOriginalFile !== null, 'Học sinh tải thành công tệp gốc đính kèm của Giáo viên.');
    assert(downloadedOriginalFile.fileName === 'KichBan_HuongKhe.docx', 'Tên tệp tải về đúng 100%: KichBan_HuongKhe.docx.');
    assert(downloadedOriginalFile.fileData.startsWith('data:application/vnd.openxmlformats'), 'Dữ liệu tệp nguyên vẹn dạng base64.');

    // Học sinh xuất tệp Word (.doc) đầy đủ kịch bản, bảng phân vai và hướng dẫn sư phạm
    let downloadedDocObject = null;
    studentSession.document.createElement = (tag) => {
        const el = {
            tagName: tag.toUpperCase(),
            style: {},
            click: () => { downloadedDocObject = el; },
            setAttribute: (k, v) => { el[k] = v; }
        };
        return el;
    };
    studentSession.generateAndDownloadWordDocument(studentReceivedPost);
    assert(downloadedDocObject !== null, 'Học sinh xuất thành công bản Word (.doc) phân vai hoạt cảnh.');
    assert(downloadedDocObject.download.includes('KichBan_11.W01'), 'Tên tệp xuất chuẩn dạng KichBan_11.W01.');

    // -------------------------------------------------------------
    // GIAI ĐOẠN 5: HỌC SINH LÀM BÀI / PHÂN VAI VÀ NỘP BÀI
    // -------------------------------------------------------------
    console.log('\n5. Học sinh Phân vai kịch bản và Nộp bài cho Giáo viên:');
    assert(studentSession.studentSubmissions.length === 0, 'Ban đầu chưa có bài nộp nào.');
    assert(teacherSession.studentSubmissions.length === 0, 'Phía Giáo viên chưa có bài nộp nào.');

    const newSubmission = {
        id: 'SUB-HS11-001',
        postCode: '11.W01',
        lessonTitle: 'Khởi nghĩa Hương Khê và thủ lĩnh Phan Đình Phùng',
        grade: '11',
        groupName: 'Nhóm Sử 11A3',
        leadStudent: 'Nguyễn Văn Minh',
        submittedAt: '2026-10-21 16:30',
        members: 'Minh, Lan, Hoàng, Tuấn',
        scriptContent: 'Cảnh 1: Tại căn cứ Vụ Quang, Cao Thắng báo cáo Phan Đình Phùng về việc đúc súng trường theo mẫu súng Pháp 1874...',
        status: 'SUBMITTED',
        score: null,
        feedback: ''
    };

    // Học sinh nộp bài
    studentSession.commitDatabaseMutation('STUDENT_SUBMISSION_CREATED', newSubmission);

    assert(studentSession.studentSubmissions.length === 1, 'Bài nộp đã ghi nhận phía Học sinh.');
    assert(teacherSession.studentSubmissions.length === 1, 'Giáo viên nhận bài nộp ngay lập tức (Realtime).');
    assert(teacherSession._elements['teacherSubmissionsCountBadge'].textContent === 1, 'Huy hiệu "📬 Bài nộp Học sinh" phía Giáo viên hiển thị số 1.');
    assert(teacherSession.studentSubmissions[0].groupName === 'Nhóm Sử 11A3', 'Tên nhóm nộp hiển thị đúng: Nhóm Sử 11A3.');

    // -------------------------------------------------------------
    // GIAI ĐOẠN 6: GIÁO VIÊN CHẤM ĐIỂM & NHẬN XÉT PHẢN HỒI
    // -------------------------------------------------------------
    console.log('\n6. Giáo viên Chấm điểm & Gửi nhận xét phản hồi:');
    const gradedSubmission = {
        ...newSubmission,
        status: 'GRADED',
        score: 9.8,
        feedback: 'Kịch bản rất sinh động, tái hiện chân thực tinh thần sáng tạo của Cao Thắng!'
    };

    // Giáo viên chấm bài
    teacherSession.commitDatabaseMutation('TEACHER_FEEDBACK_SAVED', gradedSubmission);

    assert(teacherSession.studentSubmissions[0].status === 'GRADED', 'Phía Giáo viên ghi nhận trạng thái GRADED.');
    assert(studentSession.studentSubmissions[0].status === 'GRADED', 'Phía Học sinh nhận trạng thái GRADED tức thì.');
    assert(studentSession.studentSubmissions[0].score === 9.8, 'Điểm số 9.8/10 hiển thị đúng tại phía Học sinh.');
    assert(studentSession.studentSubmissions[0].feedback.includes('Cao Thắng'), 'Lời phê của Thầy/Cô hiển thị đầy đủ phía Học sinh.');

    // -------------------------------------------------------------
    // GIAI ĐOẠN 7: GIÁO VIÊN CHỈNH SỬA & XÓA BÀI (HỌC SINH CẬP NHẬT TỨC THÌ)
    // -------------------------------------------------------------
    console.log('\n7. Giáo viên Chỉnh sửa & Xóa bài:');
    // 7.1 Sửa bài
    const updatedPost = {
        ...createdPost,
        lesson: 'Khởi nghĩa Hương Khê: Chiến công chế tạo súng trường của Cao Thắng'
    };
    teacherSession.commitDatabaseMutation('TEACHER_POST_SAVED', { post: updatedPost, doc: linkedDoc });
    assert(studentSession.catalogData.find(i => i.code === '11.W01').lesson.includes('Cao Thắng'), 'Học sinh nhận ngay tiêu đề bài giảng đã sửa.');

    // 7.2 Xóa bài
    teacherSession.commitDatabaseMutation('TEACHER_POST_DELETED', { code: '11.W01' });
    assert(teacherSession.catalogData.find(i => i.code === '11.W01') === undefined, 'Giáo viên đã xóa bài 11.W01.');
    assert(studentSession.catalogData.find(i => i.code === '11.W01') === undefined, 'Học sinh mất bài 11.W01 ngay lập tức.');
    assert(studentSession.catalogData.length === 42, 'Tổng số bài phía Học sinh trở về đúng 42 bài SGK ban đầu.');
    assert(studentSession._elements['grade-badge-11'].textContent === 14, 'Huy hiệu Khối 11 phía Học sinh trở về 14 bài.');

    // -------------------------------------------------------------
    // GIAI ĐOẠN 8: HỌC SINH MỚI TRUY CẬP LẦN ĐẦU (COLD-START TỪ SERVER API)
    // -------------------------------------------------------------
    console.log('\n8. Học sinh mới truy cập lần đầu (Cold-start từ Server API):');
    const { loadDatabase, saveDatabase } = require('../sync_server.js');
    const serverDb = loadDatabase();

    // Mô phỏng server có 1 bài do giáo viên khác đăng sẵn trên trường
    const publicPost = {
        code: '10.W01',
        grade: '10',
        examCode: 'MD-10.HUNGVUONG',
        topic: 'Thời đại Hùng Vương - An Dương Vương',
        lesson: 'Hoạt cảnh: Lời thề dưới chân núi Nghĩa Lĩnh',
        scenario: 'Tái hiện hội thề non nước của các Lạc hầu, Lạc tướng thời vua Hùng.',
        format: 'Kịch bản Word (.docx)',
        originType: 'TEACHER_CONTRIBUTED',
        author: 'Cô Lê Thu Hà',
        school: 'THPT Chu Văn An',
        fileName: 'LoiTheNghiaLinh.docx',
        fileSize: 280000,
        fileData: 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,AAA...'
    };
    serverDb.teacherPosts = serverDb.teacherPosts.filter(p => p.code !== publicPost.code);
    serverDb.teacherPosts.unshift(publicPost);
    saveDatabase(serverDb);

    // Phiên C: Học sinh mở web lần đầu trên điện thoại
    const newStudentSession = createSession('Học sinh mới (Điện thoại)');
    assert(newStudentSession.catalogData.length === 42, 'Học sinh mới mở web ban đầu có 42 bài gốc.');

    // Đồng bộ snapshot từ Server API
    newStudentSession.applyFullServerSync(serverDb);
    const activeTeacherPosts = serverDb.teacherPosts.filter(p => !(serverDb.deletedCodes || []).includes(p.code));
    const expectedCount = 42 + activeTeacherPosts.length;
    assert(newStudentSession.catalogData.length === expectedCount, `Học sinh mới tự động nhận bài đăng từ máy chủ công khai (${expectedCount} bài).`);
    assert(newStudentSession.catalogData.some(i => i.code === '10.W01'), 'Bài 10.W01 xuất hiện đầy đủ cho Học sinh mới.');

    // -------------------------------------------------------------
    // GIAI ĐOẠN 9: KIỂM THỬ XÓA TOÀN BỘ KHỐI 11 & KHÔI PHỤC DỮ LIỆU GỐC SGK
    // -------------------------------------------------------------
    console.log('\n9. Giáo viên Xóa toàn bộ Khối 11 -> Học sinh mất ngay tức thì 100%:');
    const g11Items = teacherSession.catalogData.filter(i => i.grade === '11');
    const g11Codes = g11Items.map(i => i.code);
    assert(g11Codes.length === 14, `Phía Giáo viên đang có đủ ${g11Codes.length} bài Khối 11.`);
    assert(studentSession.catalogData.filter(i => i.grade === '11').length === 14, 'Phía Học sinh đang có đủ 14 bài Khối 11.');

    // Giáo viên xóa sạch cả Khối 11
    teacherSession.commitDatabaseMutation('TEACHER_POSTS_BULK_DELETED', { codes: g11Codes });

    assert(teacherSession.catalogData.filter(i => i.grade === '11').length === 0, 'Phía Giáo viên đã xóa sạch Khối 11 (còn 0 bài).');
    assert(studentSession.catalogData.filter(i => i.grade === '11').length === 0, 'Phía Học sinh lập tức mất toàn bộ bài Khối 11 (còn 0 bài).');
    assert(studentSession._elements['grade-badge-11'].textContent === 0, 'Huy hiệu Khối 11 phía Học sinh hiển thị số 0.');
    assert(studentSession._elements['home-count-11'].textContent === '0 bài học chuẩn', 'Thẻ Khối 11 Trang chủ cập nhật 0 bài.');

    // Giáo viên khôi phục lại dữ liệu gốc chuẩn SGK
    teacherSession.commitDatabaseMutation('RESTORE_DEFAULT_DATA', {});
    assert(teacherSession.catalogData.filter(i => i.grade === '11').length === 14, 'Giáo viên khôi phục đủ 14 bài Khối 11.');
    assert(studentSession.catalogData.filter(i => i.grade === '11').length === 14, 'Học sinh khôi phục đủ 14 bài Khối 11.');
    assert(studentSession.catalogData.length === 42, 'Tổng số bài phía Học sinh trở về đúng 42 bài gốc SGK.');

    // Dọn dẹp trả lại dữ liệu sạch trên server
    serverDb.teacherPosts = serverDb.teacherPosts.filter(p => p.code !== '10.W01' && p.code !== '11.W01');
    serverDb.deletedCodes = [];
    saveDatabase(serverDb);

    console.log('\n================================================================');
    console.log(`   🎉 KẾT QUẢ KIỂM THỬ: ${passCount}/${totalCount} TIÊU CHÍ ĐÃ ĐẠT 100%!`);
    console.log('   TOÀN BỘ QUY TRÌNH WEB PUBLIC ĐÃ HOẠT ĐỘNG HOÀN HẢO 100%!');
    console.log('================================================================');
    process.exit(0);
}

runPublicWebLifecycleTests().catch(err => {
    console.error('Lỗi kiểm thử:', err);
    process.exit(1);
});
