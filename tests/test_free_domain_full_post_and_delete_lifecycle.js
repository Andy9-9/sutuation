/**
 * ====================================================================
 * TEST: FREE DOMAIN POST & DELETE LIFECYCLE & PERSISTENCE
 * ====================================================================
 * Kiểm thử toàn diện vòng đời Đăng bài và Xóa bài trên tên miền miễn phí (Netlify):
 * 1. Đăng bài mới kèm tệp: Tab 1 đăng -> Tab 2 thấy ngay lập tức.
 * 2. Xóa bài đơn lẻ: Tab 1 xóa -> Tab 2 mất ngay.
 * 3. Xóa cả khối (14 bài): Tab 1 xóa -> Tab 2 giảm về 28 bài.
 * 4. Xóa sạch tất cả (42 bài): Tab 1 xóa -> Tab 2 về 0 bài, trống trơn.
 * 5. Khôi phục dữ liệu gốc: Tab 2 bấm khôi phục -> Cả 2 tab về lại 42 bài.
 * 6. Tải lại trang (Persistence): Dữ liệu được bảo toàn bền vững, không lỗi quota.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log("=================================================================");
console.log("   KIỂM THỬ TOÀN DIỆN: ĐĂNG & XÓA BÀI TRÊN TÊN MIỀN MIỄN PHÍ NETLIFY");
console.log("=================================================================\n");

const sharedStorage = {};
const channelSubscribers = [];

function createTab(tabName) {
    const elements = {};
    const mockEl = (id = 'el') => {
        if (elements[id]) return elements[id];
        elements[id] = {
            id,
            value: '',
            textContent: '',
            innerHTML: '',
            style: {},
            checked: false,
            classList: { add: () => {}, remove: () => {}, contains: () => false },
            querySelectorAll: () => [],
            querySelector: () => null
        };
        return elements[id];
    };

    const tabChannel = {
        onmessage: null,
        postMessage: (data) => {
            channelSubscribers.forEach(sub => {
                if (sub !== tabChannel && typeof sub.onmessage === 'function') {
                    sub.onmessage({ data });
                }
            });
        }
    };
    channelSubscribers.push(tabChannel);

    const storageListeners = [];

    const sandbox = {
        console: { log: () => {}, warn: () => {}, error: console.error },
        setTimeout: (fn) => setTimeout(fn, 1),
        clearTimeout,
        setInterval: (fn) => setInterval(fn, 60000),
        clearInterval,
        Date, Math, JSON, Array, Object, String, Number, Boolean, Set, Map, URL,
        localStorage: {
            getItem: (k) => sharedStorage[k] || null,
            setItem: (k, v) => {
                sharedStorage[k] = String(v);
                storageListeners.forEach(fn => fn({ key: k, newValue: String(v) }));
            },
            removeItem: (k) => {
                delete sharedStorage[k];
                storageListeners.forEach(fn => fn({ key: k, newValue: null }));
            }
        },
        sessionStorage: {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {}
        },
        BroadcastChannel: function() { return tabChannel; },
        window: {
            location: {
                hostname: "sutuation-edu.netlify.app",
                origin: "https://sutuation-edu.netlify.app",
                protocol: "https:",
                search: ""
            },
            addEventListener: (ev, fn) => {
                if (ev === "storage") storageListeners.push(fn);
            }
        },
        document: {
            getElementById: mockEl,
            querySelectorAll: () => [],
            querySelector: () => null,
            createElement: mockEl
        },
        fetch: async (url, opts = {}) => ({ ok: true, text: async () => "" }),
        EventSource: class {
            constructor() { this.readyState = 1; }
            close() {}
        }
    };
    sandbox.window.localStorage = sandbox.localStorage;
    sandbox.window.document = sandbox.document;

    const ctx = vm.createContext(sandbox);
    const files = ["data.js", "db.js", "sql-studio.js", "sync.js", "teacher.js", "app.js"];
    files.forEach(f => {
        const code = fs.readFileSync(path.join(__dirname, '../js', f), 'utf8');
        vm.runInContext(code, ctx);
    });

    ctx.initSituationRealtimeSync();
    return { ctx, elements, tabName };
}

async function runTest() {
    console.log("1. Mở Tab 1 (Giáo viên) và Tab 2 (Học sinh) trên Netlify:");
    const tab1 = createTab("Tab 1 (GV)");
    const tab2 = createTab("Tab 2 (HS)");

    assert.strictEqual(tab1.ctx.catalogData.length, 42, "Tab 1 có 42 bài ban đầu");
    assert.strictEqual(tab2.ctx.catalogData.length, 42, "Tab 2 có 42 bài ban đầu");
    console.log("  ✓ Cả 2 tab đều khởi tạo 42 bài chuẩn SGK");

    console.log("\n2. Tab 1 đăng bài mới kèm tệp Word:");
    const newPost = {
        code: "10.W01",
        grade: "10",
        examCode: "MD-10.981",
        lesson: "Hoạt cảnh: Chiến thắng Bạch Đằng năm 981",
        author: "Thầy Lê Văn Hùng",
        school: "THPT Chuyên Lê Hồng Phong",
        format: "Kịch bản Word (.docx)",
        fileName: "KichBan_BachDang_981.docx",
        fileSize: 125000,
        fileData: "data:application/vnd.openxmlformats;base64,VEVTVA==",
        originType: "TEACHER_CONTRIBUTED"
    };

    tab1.ctx.commitDatabaseMutation('TEACHER_POST_SAVED', {
        post: newPost,
        doc: { id: "DOC-10W01", code: "10.W01", title: "Hồ sơ Bạch Đằng 981" },
        author: newPost.author,
        lesson: newPost.lesson,
        code: newPost.code
    });

    assert.strictEqual(tab1.ctx.catalogData.length, 43, "Tab 1 tăng lên 43 bài");
    assert.strictEqual(tab2.ctx.catalogData.length, 43, "Tab 2 lập tức đồng bộ tăng lên 43 bài!");
    const postOnTab2 = tab2.ctx.catalogData.find(i => i.code === "10.W01");
    assert.ok(postOnTab2, "Tab 2 đã thấy bài mới 10.W01");
    assert.strictEqual(postOnTab2.author, "Thầy Lê Văn Hùng");
    console.log("  ✓ Đăng bài mới thành công: Tab 1 và Tab 2 đều hiển thị 43 bài!");

    console.log("\n3. Tab 1 xóa bài vừa đăng (10.W01):");
    tab1.ctx.commitDatabaseMutation('TEACHER_POST_DELETED', { code: "10.W01" });
    assert.strictEqual(tab1.ctx.catalogData.length, 42, "Tab 1 trở về 42 bài");
    assert.strictEqual(tab2.ctx.catalogData.length, 42, "Tab 2 lập tức trở về 42 bài!");
    assert.strictEqual(tab2.ctx.catalogData.find(i => i.code === "10.W01"), undefined, "Tab 2 không còn bài 10.W01");
    console.log("  ✓ Xóa bài đơn lẻ thành công: Cả 2 tab đều giảm về 42 bài tức thì!");

    console.log("\n4. Tab 1 xóa toàn bộ Khối 10 (14 bài):");
    const grade10Codes = tab1.ctx.catalogData.filter(i => i.grade === "10").map(i => i.code);
    assert.strictEqual(grade10Codes.length, 14);

    tab1.ctx.commitDatabaseMutation('TEACHER_POSTS_BULK_DELETED', { codes: grade10Codes });
    assert.strictEqual(tab1.ctx.catalogData.length, 28, "Tab 1 còn 28 bài");
    assert.strictEqual(tab2.ctx.catalogData.length, 28, "Tab 2 lập tức giảm xuống 28 bài!");
    assert.strictEqual(tab2.ctx.catalogData.filter(i => i.grade === "10").length, 0, "Khối 10 ở Tab 2 đã về 0");
    assert.strictEqual(tab2.elements["grade-badge-10"].textContent, 0, "Badge Khối 10 ở Tab 2 cập nhật thành 0");
    console.log("  ✓ Xóa sạch Khối 10 thành công: Tab 2 hiển thị 28 bài (Khối 10: 0 bài) khớp 100%!");

    console.log("\n5. Tab 1 xóa sạch TẤT CẢ các bài còn lại (Khối 11 & Khối 12):");
    const remainingCodes = tab1.ctx.catalogData.map(i => i.code);
    assert.strictEqual(remainingCodes.length, 28);

    tab1.ctx.commitDatabaseMutation('TEACHER_POSTS_BULK_DELETED', { codes: remainingCodes });
    assert.strictEqual(tab1.ctx.catalogData.length, 0, "Tab 1 còn đúng 0 bài");
    assert.strictEqual(tab2.ctx.catalogData.length, 0, "Tab 2 lập tức giảm về đúng 0 bài!");
    assert.strictEqual(tab2.elements["grade-badge-all"].textContent, 0, "Badge Tất cả các khối ở Tab 2 là 0");
    assert.strictEqual(tab2.elements["grade-badge-11"].textContent, 0, "Badge Khối 11 ở Tab 2 là 0");
    assert.strictEqual(tab2.elements["grade-badge-12"].textContent, 0, "Badge Khối 12 ở Tab 2 là 0");
    console.log("  ✓ Xóa hết thành công: Cả 2 tab đồng loạt về đúng 0 bài, không sót 1 bài nào!");

    console.log("\n6. Tab 2 bấm KHÔI PHỤC DỮ LIỆU GỐC (RESTORE_DEFAULT_DATA):");
    tab2.ctx.commitDatabaseMutation('RESTORE_DEFAULT_DATA', {});
    assert.strictEqual(tab2.ctx.catalogData.length, 42, "Tab 2 đã khôi phục lại 42 bài gốc");
    assert.strictEqual(tab1.ctx.catalogData.length, 42, "Tab 1 lập tức nhận lệnh khôi phục và trở lại 42 bài gốc!");
    assert.strictEqual(tab1.elements["grade-badge-all"].textContent, 42);
    assert.strictEqual(tab2.elements["grade-badge-all"].textContent, 42);
    console.log("  ✓ Khôi phục thành công: Cả 2 tab trở lại nguyên vẹn 42 bài chuẩn SGK!");

    console.log("\n7. Kiểm tra tính năng Lưu trữ bền vững (Persistence khi mở Tab 3 mới):");
    // Tab 1 xóa lại 2 bài (10.01A, 10.02A):
    tab1.ctx.commitDatabaseMutation('TEACHER_POSTS_BULK_DELETED', { codes: ["10.01A", "10.02A"] });
    assert.strictEqual(tab1.ctx.catalogData.length, 40);

    // Mở Tab 3 mới tinh:
    const tab3 = createTab("Tab 3 (New)");
    assert.strictEqual(tab3.ctx.catalogData.length, 40, "Tab 3 mở mới tự động nạp đúng 40 bài (đã lưu 2 bài bị xóa)!");
    assert.strictEqual(tab3.ctx.catalogData.some(i => i.code === "10.01A" || i.code === "10.02A"), false);
    console.log("  ✓ Tab mới mở tự động nạp đúng trạng thái CSDL thực tế: 40 bài!");

    console.log("\n=================================================================");
    console.log("   🎉 TOÀN BỘ VÒNG ĐỜI ĐĂNG BÀI - XÓA BÀI - LƯU TRỮ ĐẠT 100%!");
    console.log("=================================================================\n");
    process.exit(0);
}

runTest().catch(err => {
    console.error("❌ Lỗi kiểm thử:", err);
    process.exit(1);
});
