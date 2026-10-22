/**
 * ====================================================================
 * TEST: TWO WINDOWS SIDE BY SIDE (EXACT USER SCREENSHOT SCENARIO)
 * ====================================================================
 * Mô phỏng chính xác hình ảnh người dùng gửi:
 * - Cửa sổ Trái (Left Window): Xóa Khối 10 -> CÒN 28 BÀI (Khối 10: 0 bài).
 * - Cửa sổ Phải (Right Window): Trước đây bị kẹt ở 42 BÀI.
 * -> Sau khi sửa lỗi ByteString header và tab-specific client ID:
 *    Cửa sổ Phải PHẢI LẬP TỨC ĐỒNG BỘ XUỐNG 28 BÀI!
 * - Cửa sổ Phải đăng bài mới -> Cửa sổ Trái PHẢI LẬP TỨC NHẬN ĐƯỢC!
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log("=================================================================");
console.log("   KIỂM THỬ: 2 CỬA SỔ SONG SONG CÙNG MÀN HÌNH (USER SCREENSHOT)");
console.log("=================================================================\n");

// Giả lập Cloud Relay thời gian thực
const channelListeners = [];
const eventHistory = [];

function publishToSimulatedCloud(msg) {
    eventHistory.push(msg);
    channelListeners.forEach(listener => {
        try { listener(msg); } catch (e) {}
    });
}

function createWindowInstance(windowLabel) {
    const storage = {};
    const elements = {};

    const mockEl = (id = 'mock') => {
        if (elements[id]) return elements[id];
        const el = {
            id,
            value: '',
            textContent: '',
            innerHTML: '',
            style: {},
            checked: false,
            classList: { contains: () => false, add: () => {}, remove: () => {} },
            addEventListener: () => {},
            focus: () => {}
        };
        elements[id] = el;
        return el;
    };

    const sandbox = {
        console: { log: () => {}, warn: () => {}, error: () => {} },
        setTimeout: (fn) => setTimeout(fn, 1),
        clearTimeout: (id) => clearTimeout(id),
        setInterval: (fn) => setInterval(fn, 10000),
        clearInterval: (id) => clearInterval(id),
        Date, Math, JSON, Array, Object, String, Number, Boolean, Set, Map,
        sessionStorage: {
            getItem: (k) => storage['sess_' + k] || null,
            setItem: (k, v) => { storage['sess_' + k] = String(v); },
            removeItem: (k) => { delete storage['sess_' + k]; }
        },
        localStorage: {
            getItem: (k) => storage[k] || null,
            setItem: (k, v) => { storage[k] = String(v); },
            removeItem: (k) => { delete storage[k]; }
        },
        window: {
            location: {
                hostname: "sutuation.netlify.app",
                protocol: "https:",
                origin: "https://sutuation.netlify.app",
                search: ""
            },
            addEventListener: () => {}
        },
        document: {
            getElementById: (id) => mockEl(id),
            querySelectorAll: () => [],
            querySelector: () => null,
            createElement: (t) => mockEl(t)
        },
        fetch: async (url, opts = {}) => {
            if (url.includes("/json?poll=1")) {
                const text = eventHistory.map(m => JSON.stringify({ event: 'message', message: JSON.stringify(m) })).join('\n');
                return { ok: true, text: async () => text };
            }
            if (opts.method === 'POST') {
                const parsed = JSON.parse(opts.body);
                publishToSimulatedCloud(parsed);
                return { ok: true };
            }
            return { ok: true, json: async () => ({}) };
        },
        EventSource: class {
            constructor() {
                this.readyState = 1;
                this.handler = (msg) => {
                    if (this.onmessage) {
                        this.onmessage({
                            data: JSON.stringify({
                                event: 'message',
                                message: JSON.stringify(msg)
                            })
                        });
                    }
                };
                channelListeners.push(this.handler);
                setTimeout(() => { if (this.onopen) this.onopen(); }, 5);
            }
            close() {
                const idx = channelListeners.indexOf(this.handler);
                if (idx >= 0) channelListeners.splice(idx, 1);
            }
        },
        applyCatalogFilters: () => {},
        renderDocuments: () => {},
        updateHomeCounters: () => {},
        updateRagCounters: () => {},
        populateFilterDropdowns: () => {},
        updateTeacherPostCountBadge: () => {},
        updateTeacherSubmissionsCountBadge: () => {},
        renderTeacherPostsManageList: () => {},
        renderTeacherSubmissionsList: () => {},
        showSituationToast: (opts) => { sandbox._lastToast = opts; },
        closeDetailModal: () => { sandbox._modalClosed = true; },
        openDetailModal: (c) => { sandbox._openedCode = c; }
    };

    sandbox.window.localStorage = sandbox.localStorage;
    sandbox.window.sessionStorage = sandbox.sessionStorage;
    sandbox.window.document = sandbox.document;
    sandbox.window.fetch = sandbox.fetch;
    sandbox.window.EventSource = sandbox.EventSource;

    const ctx = vm.createContext(sandbox);

    const jsFiles = ["data.js", "db.js", "sql-studio.js", "sync.js", "teacher.js"];
    const code = jsFiles.map(f => fs.readFileSync(path.join(__dirname, '../js', f), 'utf8')).join('\n;\n');
    vm.runInContext(code, ctx);

    ctx.initSituationRealtimeSync();

    return ctx;
}

async function runScenario() {
    console.log("1. Mở Cửa sổ Trái và Cửa sổ Phải (cùng mở Netlify):");
    const leftWin = createWindowInstance("LeftWindow");
    const rightWin = createWindowInstance("RightWindow");

    assert.strictEqual(leftWin.catalogData.length, 42, "Cửa sổ Trái có 42 bài ban đầu");
    assert.strictEqual(rightWin.catalogData.length, 42, "Cửa sổ Phải có 42 bài ban đầu");
    console.log("  ✓ Cả 2 cửa sổ ban đầu đều có 42 bài học chuẩn SGK");

    console.log("\n2. Cửa sổ Trái thực hiện XÓA SẠCH KHỐI 10 (14 bài):");
    const grade10Codes = leftWin.catalogData.filter(i => i.grade === "10").map(i => i.code);

    leftWin.commitDatabaseMutation('TEACHER_POSTS_BULK_DELETED', { codes: grade10Codes });

    assert.strictEqual(leftWin.catalogData.length, 28, "Cửa sổ Trái giảm xuống đúng 28 bài (giống hệt ảnh screenshot)");
    console.log("  ✓ Cửa sổ Trái: Tất cả các khối (28) | Khối 10 (0) | Khối 11 (14) | Khối 12 (14)");

    // Đợi lan truyền qua kênh đồng bộ
    await new Promise(r => setTimeout(r, 50));

    // CỬA SỔ PHẢI PHẢI NHẬN ĐƯỢC NGAY LẬP TỨC:
    assert.strictEqual(rightWin.catalogData.length, 28, "Cửa sổ Phải ĐÃ ĐỒNG BỘ GIẢM XUỐNG 28 BÀI!");
    const remainingGrade10OnRight = rightWin.catalogData.filter(i => i.grade === "10");
    assert.strictEqual(remainingGrade10OnRight.length, 0, "Cửa sổ Phải không còn bài Khối 10 nào!");
    console.log("  ✓ Cửa sổ Phải đã tự động cập nhật: 42 -> 28 bài ngay trên màn hình!");

    console.log("\n3. Cửa sổ Phải đăng bài mới kèm tệp Word:");
    const newPost = {
        code: "11.W01",
        grade: "11",
        lesson: "Hoạt cảnh: Khởi nghĩa Lam Sơn",
        author: "Cô Nguyễn Lan",
        format: "Kịch bản Word (.docx)",
        fileName: "LamSon_11W01.docx",
        originType: "TEACHER_CONTRIBUTED"
    };

    rightWin.commitDatabaseMutation('TEACHER_POST_SAVED', {
        post: newPost,
        doc: { id: "DOC-11W01", code: "11.W01", title: "Tài liệu Lam Sơn" },
        author: newPost.author,
        lesson: newPost.lesson,
        code: newPost.code
    });

    assert.strictEqual(rightWin.catalogData.length, 29, "Cửa sổ Phải tăng lên 29 bài");
    await new Promise(r => setTimeout(r, 50));

    assert.strictEqual(leftWin.catalogData.length, 29, "Cửa sổ Trái LẬP TỨC TĂNG LÊN 29 BÀI!");
    const postOnLeft = leftWin.catalogData.find(i => i.code === "11.W01");
    assert.ok(postOnLeft, "Cửa sổ Trái đã thấy bài 11.W01");
    assert.strictEqual(postOnLeft.author, "Cô Nguyễn Lan");
    console.log("  ✓ Cửa sổ Trái nhận bài 11.W01 từ Cửa sổ Phải thành công 100%!");

    console.log("\n4. Cửa sổ Trái bấm khôi phục lại 42 bài gốc (RESTORE_DEFAULT_DATA):");
    leftWin.commitDatabaseMutation('RESTORE_DEFAULT_DATA', {});
    assert.strictEqual(leftWin.catalogData.length, 42, "Cửa sổ Trái trở lại 42 bài gốc");

    await new Promise(r => setTimeout(r, 50));

    assert.strictEqual(rightWin.catalogData.length, 42, "Cửa sổ Phải LẬP TỨC TRỞ LẠI 42 BÀI GỐC!");
    console.log("  ✓ Cả 2 cửa sổ đều trở lại 42 bài chuẩn SGK y hệt nhau 100%!");

    console.log("\n=================================================================");
    console.log("   🎉 TEST 2 CỬA SỔ SONG SONG: ĐỒNG BỘ 100% - KHÔNG BỊ LỆCH!");
    console.log("=================================================================\n");
    process.exit(0);
}

runScenario().catch(err => {
    console.error("❌ Thất bại:", err);
    process.exit(1);
});
