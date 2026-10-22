/**
 * ====================================================================
 * TEST ĐỒNG BỘ DEPLOY NETLIFY & TỐI ƯU HÓA XEM BÀI ĐĂNG (READER MODE)
 * ====================================================================
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log("=================================================================");
console.log("   KIỂM THỬ DEPLOY NETLIFY & TỐI ƯU HÓA XEM BÀI ĐĂNG (READER MODE)");
console.log("=================================================================\n");

// 1. Kiểm tra cấu hình Netlify
console.log("1. Kiểm tra cấu hình triển khai Netlify (*.netlify.app):");
assert.ok(fs.existsSync(path.join(__dirname, '../index.html')), "index.html phải tồn tại để Netlify nhận diện trang chủ");
assert.ok(fs.existsSync(path.join(__dirname, '../_redirects')), "_redirects phải tồn tại để cấu hình SPA routing");
assert.ok(fs.existsSync(path.join(__dirname, '../netlify.toml')), "netlify.toml phải tồn tại để cấu hình cache và build");
assert.ok(fs.existsSync(path.join(__dirname, '../_headers')), "_headers phải tồn tại để tối ưu CDN caching");

const redirectsContent = fs.readFileSync(path.join(__dirname, '../_redirects'), 'utf8');
assert.ok(redirectsContent.includes('/index.html'), "_redirects phải điều hướng về /index.html");

const tomlContent = fs.readFileSync(path.join(__dirname, '../netlify.toml'), 'utf8');
assert.ok(tomlContent.includes('publish = "."'), "netlify.toml phải publish thư mục gốc");

console.log("  ✓ index.html sẵn sàng cho Netlify root domain");
console.log("  ✓ _redirects cấu hình chuẩn SPA 200 rewrite");
console.log("  ✓ netlify.toml & _headers tối ưu caching JS/CSS/JSON");

// 2. Kiểm tra resolveSyncServerUrl trên Netlify
console.log("\n2. Kiểm tra xử lý máy chủ khi chạy trên netlify.app:");
function testResolveUrl(locationObj, storage = {}) {
    const env = {
        URLSearchParams: global.URLSearchParams,
        window: { location: locationObj },
        localStorage: {
            getItem(k) { return storage[k] || null; },
            setItem(k, v) { storage[k] = String(v); }
        }
    };
    const syncCode = fs.readFileSync(path.join(__dirname, '../js/sync.js'), 'utf8');
    vm.createContext(env);
    vm.runInContext(syncCode, env);
    return env.resolveSyncServerUrl();
}

// 2.1 Chạy trên domain Netlify không có backend -> Chạy Client-First, không lỗi 404
const netlifyUrl = testResolveUrl({
    protocol: "https:",
    origin: "https://situation-nguvan.netlify.app",
    hostname: "situation-nguvan.netlify.app",
    search: ""
});
assert.strictEqual(netlifyUrl, "", "Trên Netlify không có server backend thì không spam /api/sync");
console.log("  ✓ Netlify tĩnh: Chế độ Client-First siêu mượt (0 lag, 0 lỗi 404)");

// 2.2 Chạy trên Netlify có tham số ?server=https://my-backend.onrender.com
const netlifyWithServerParam = testResolveUrl({
    protocol: "https:",
    origin: "https://situation-nguvan.netlify.app",
    hostname: "situation-nguvan.netlify.app",
    search: "?server=https://situation-backend.onrender.com"
});
assert.strictEqual(netlifyWithServerParam, "https://situation-backend.onrender.com", "Nhận diện đúng tham số ?server=");
console.log(`  ✓ Nhận diện URL máy chủ qua query param: ${netlifyWithServerParam}`);

// 2.3 Chạy local
const localUrl = testResolveUrl({
    protocol: "http:",
    origin: "http://localhost:8080",
    hostname: "localhost",
    search: ""
});
assert.strictEqual(localUrl, "http://localhost:8080");
console.log("  ✓ Localhost: Tự động kết nối sync_server.js cổng 8080");

// 3. Kiểm tra Reader Mode xem bài đăng trực tiếp
console.log("\n3. Kiểm tra Tính năng Xem Bài Đăng (Reader Mode):");
function createTestEnv() {
    const storage = {};
    const elements = {};
    function el(id) {
        if (!elements[id]) {
            elements[id] = {
                id,
                value: "",
                textContent: "",
                innerHTML: "",
                style: {},
                classList: {
                    _classes: new Set(),
                    add(c) { this._classes.add(c); },
                    remove(c) { this._classes.delete(c); },
                    contains(c) { return this._classes.has(c); }
                },
                appendChild() {},
                addEventListener() {},
                focus() {},
                reset() { this.value = ""; }
            };
        }
        return elements[id];
    }
    const env = {
        console,
        setTimeout: (fn) => fn(),
        clearTimeout() {},
        localStorage: {
            getItem(k) { return storage[k] || null; },
            setItem(k, v) { storage[k] = String(v); },
            removeItem(k) { delete storage[k]; }
        },
        sessionStorage: {
            getItem(k) { return storage['s_' + k] || null; },
            setItem(k, v) { storage['s_' + k] = String(v); },
            removeItem(k) { delete storage['s_' + k]; }
        },
        document: {
            getElementById: el,
            querySelectorAll: () => [],
            querySelector: (sel) => el(sel.replace(/[^a-zA-Z0-9_-]/g, "")),
            createElement: (t) => ({ tagName: t, style: {}, addEventListener() {} })
        },
        alert: () => {},
        confirm: () => true,
        addEventListener: () => {},
        removeEventListener: () => {},
        URLSearchParams: global.URLSearchParams,
        window: {}
    };
    env.window = env;
    const jsFiles = ["data.js", "db.js", "sql-studio.js", "sync.js", "teacher.js", "app.js"];
    const code = jsFiles.map(f => fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8')).join('\n;\n');
    vm.createContext(env);
    vm.runInContext(code, env);
    return env;
}

const env = createTestEnv();

// Tạo một bài kịch bản mới của giáo viên
env.sessionTeacherKey = "SU2026";
env.isTeacherAuthenticated = true;
env.document.getElementById("teacherTitle").value = "Hoạt cảnh: Khởi nghĩa Lam Sơn và Hội thề Lũng Nhai";
env.document.getElementById("teacherGrade").value = "11";
env.document.getElementById("teacherAuthor").value = "Thầy Lê Lợi";
env.document.getElementById("teacherSchool").value = "THPT Lam Sơn Thanh Hóa";
env.document.getElementById("teacherSummary").value = "Tái hiện 19 nghĩa sĩ Lam Sơn cắt máu ăn thề kết nghĩa huynh đệ tại Lũng Nhai năm 1416.";

env.saveTeacherPost();

const post = env.catalogData.find(i => i.lesson.includes("Khởi nghĩa Lam Sơn"));
assert.ok(post, "Bài đăng phải có trong CSDL");

// Mở xem bài bằng openDetailModal với autoPreview = true
env.openDetailModal(post.code, true);

const previewBox = env.document.getElementById("detailFileInlinePreview");
const previewContent = env.document.getElementById("detailPreviewContent");

assert.strictEqual(previewBox.style.display, "block", "Khung xem trước phải tự động mở (style.display = block)");
assert.ok(previewContent.innerHTML.includes("Hội thề Lũng Nhai") || previewContent.innerHTML.includes("1416"), "Nội dung Reader Mode phải hiển thị đầy đủ kịch bản");
console.log(`  ✓ Bài đăng ${post.code} mở xem ngay lập tức với Reader Mode!`);
console.log(`  ✓ Tiêu đề xem trước: "${env.document.getElementById("detailPreviewTitle").innerHTML.replace(/<[^>]+>/g, "")}"`);

// Kiểm tra xem bài chuẩn SGK không có tệp đính kèm -> Vẫn mở Reader Mode mượt mà không lỗi alert
env.viewUploadedItemFile("10.01A");
assert.strictEqual(previewBox.style.display, "block", "Bài SGK không có file vẫn mở Reader Mode mượt mà");
assert.ok(previewContent.innerHTML.includes("10.01A"), "Hiển thị đúng mã bài học chuẩn");
console.log("  ✓ Xem bài SGK (10.01A) trực tiếp: Không báo lỗi, mở Reader Mode kịch bản và phân vai 100%");

console.log("\n=================================================================");
console.log("   🎉 TẤT CẢ KIỂM THỬ NETLIFY VÀ XEM BÀI ĐĂNG ĐÃ VƯỢT QUA 100%!");
console.log("=================================================================\n");
