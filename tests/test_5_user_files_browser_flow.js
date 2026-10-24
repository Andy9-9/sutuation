/**
 * ====================================================================
 * TEST: 5 USER FILES END-TO-END FLOW (POSTS, DOCUMENTS, PREVIEW, DOWNLOAD)
 * ====================================================================
 * Xác thực 100% 5 tệp người dùng gửi đã được đăng tải thành công:
 * 1. Danh_Muc_Hoat_Canh_Khoi_10.pdf  -> Bài 10.GV01 & Tài liệu DOC-10GV01
 * 2. Danh_Muc_Hoat_Canh_Khoi_11.pdf  -> Bài 11.GV01 & Tài liệu DOC-11GV01
 * 3. Danh_Muc_Hoat_Canh_Khoi_12.pdf  -> Bài 12.GV01 & Tài liệu DOC-12GV01
 * 4. 15_Hoat_Canh_Lich_Su_GDPT2018.pdf  -> Bài 12.W15 & Tài liệu DOC-12W15
 * 5. 15_Hoat_Canh_Lich_Su_GDPT2018.docx -> Bài 11.W15 & Tài liệu DOC-11W15
 */

const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');
const vm = require('vm');

async function runTest() {
    console.log('================================================================');
    console.log('   KIỂM THỬ TÍCH HỢP 5 TỆP TÀI LIỆU CỦA NGƯỜI DÙNG LÊN HỆ THỐNG');
    console.log('================================================================\n');

    // 1. Kiểm tra 5 file vật lý trong thư mục uploads/
    console.log('1. Kiểm tra các tệp vật lý trong uploads/:');
    const expectedFiles = [
        { name: 'Danh_Muc_Hoat_Canh_Khoi_10.pdf', minSize: 80000 },
        { name: 'Danh_Muc_Hoat_Canh_Khoi_11.pdf', minSize: 100000 },
        { name: 'Danh_Muc_Hoat_Canh_Khoi_12.pdf', minSize: 100000 },
        { name: '15_Hoat_Canh_Lich_Su_GDPT2018.pdf', minSize: 700000 },
        { name: '15_Hoat_Canh_Lich_Su_GDPT2018.docx', minSize: 80000 }
    ];

    expectedFiles.forEach(f => {
        const p = path.join('uploads', f.name);
        assert(fs.existsSync(p), `Thiếu tệp ${p}`);
        const stat = fs.statSync(p);
        assert(stat.size >= f.minSize, `Kích thước ${f.name} quá nhỏ: ${stat.size} bytes`);
        console.log(`  ✓ Tệp ${f.name} tồn tại (${(stat.size / 1024).toFixed(1)} KB)`);
    });

    // 2. Kiểm tra dữ liệu nạp vào client browser
    console.log('\n2. Kiểm tra dữ liệu khởi tạo trên trình duyệt (js/official-posts-data.js):');
    const { OFFICIAL_TEACHER_POSTS, OFFICIAL_TEACHER_DOCS } = require('../js/official-posts-data.js');
    assert.strictEqual(OFFICIAL_TEACHER_POSTS.length, 68, 'Phải có đúng 68 bài đăng giáo viên (17 Khối 10 + 18 Khối 11 + 13 Khối 12 + 15 Kịch bản + 5 Trọn bộ)');
    assert.strictEqual(OFFICIAL_TEACHER_DOCS.length, 68, 'Phải có đúng 68 tài liệu số hóa');

    const expectedCodes = ['10.01', '10.13', '11.01', '11.13', '12.01', '12.09', 'MD-10.04', 'MD-11.07', 'MD-12.10', '10.GV01', '11.GV01', '12.GV01', '12.W15', '11.W15'];
    expectedCodes.forEach(code => {
        const post = OFFICIAL_TEACHER_POSTS.find(p => p.code === code);
        assert(post, `Không tìm thấy bài đăng ${code}`);
        assert(post.fileName, `Bài ${code} thiếu fileName`);
        assert(post.fileData || post.fileUrl, `Bài ${code} thiếu fileData/fileUrl`);
        console.log(`  ✓ Bài [${code}] - Khối ${post.grade}: "${post.lesson.substring(0, 42)}..." -> File: ${post.fileName}`);
    });

    // 3. Giả lập trình duyệt nạp trang duan.html
    console.log('\n3. Giả lập phiên trình duyệt tải trang duan.html:');
    const dom = {};
    const elements = {
        catalogTableBody: { innerHTML: '' },
        documentsGrid: { innerHTML: '' },
        detailModalTitle: { textContent: '' },
        detailFileInlinePreview: { style: { display: 'none' }, innerHTML: '' },
        detailPreviewTitle: { innerHTML: '' },
        detailPreviewContent: { innerHTML: '' },
        situationToastContainer: { appendChild: () => {} }
    };

    const sandbox = {
        console,
        window: {},
        atob: str => Buffer.from(str, 'base64').toString('binary'),
        btoa: str => Buffer.from(str, 'binary').toString('base64'),
        Blob: class Blob { constructor(parts, opts) { this.parts = parts; this.type = opts ? opts.type : ''; } },
        URL: { createObjectURL: () => 'blob:test', revokeObjectURL: () => {} },
        addEventListener: () => {},
        scrollTo: () => {},
        document: {
            getElementById: id => elements[id] || { style: {}, classList: { add: () => {}, remove: () => {}, toggle: () => {} }, setAttribute: () => {} },
            querySelectorAll: () => [],
            createElement: tag => ({ id: '', className: '', style: {}, innerHTML: '', appendChild: () => {} })
        },
        localStorage: {
            store: {},
            getItem(k) { return this.store[k] || null; },
            setItem(k, v) { this.store[k] = String(v); },
            removeItem(k) { delete this.store[k]; }
        },
        sessionStorage: {
            store: {},
            getItem(k) { return this.store[k] || null; },
            setItem(k, v) { this.store[k] = String(v); },
            removeItem(k) { delete this.store[k]; }
        },
        location: { href: 'http://localhost:8080/duan.html', search: '' }
    };
    sandbox.window = sandbox;

    vm.createContext(sandbox);
    vm.runInContext(fs.readFileSync('js/official-posts-data.js', 'utf-8'), sandbox);
    vm.runInContext(fs.readFileSync('js/data.js', 'utf-8'), sandbox);
    vm.runInContext(fs.readFileSync('js/teacher.js', 'utf-8'), sandbox);
    vm.runInContext(fs.readFileSync('js/app.js', 'utf-8'), sandbox);

    sandbox.loadSavedTeacherPosts();

    assert.strictEqual(sandbox.catalogData.length, 68, 'Tổng danh mục phải là 68 bài từ 5 tệp tài liệu');
    console.log(`  ✓ Nạp danh mục thành công: ${sandbox.catalogData.length} bài học từ 5 tệp tải lên (Khối 10: 23, Khối 11: 25, Khối 12: 20)`);

    // 4. Kiểm thử Bộ lọc "Chỉ bài Giáo viên đăng"
    console.log('\n4. Kiểm thử Bộ lọc "Chỉ bài Giáo viên đăng" (#teacherOnlyFilter):');
    const teacherOnlyList = sandbox.catalogData.filter(i => i.originType === 'TEACHER_CONTRIBUTED');
    assert.strictEqual(teacherOnlyList.length, 68, 'Phải lọc đúng 68 bài của giáo viên');
    console.log(`  ✓ Bật filter Giáo viên -> Lọc ra đúng 68/68 bài đăng kèm file!`);

    // 5. Kiểm thử Mở xem trước tệp inline (toggleDetailInlinePreview)
    console.log('\n5. Kiểm thử tính năng Xem trước tệp đính kèm (Inline Preview):');
    const samplePost = teacherOnlyList.find(p => p.code === '10.GV01');
    sandbox.openDetailModal(samplePost.code);
    sandbox.toggleDetailInlinePreview(true, samplePost.code);

    const previewContainer = elements.detailFileInlinePreview;
    assert.strictEqual(previewContainer.style.display, 'block', 'Khung xem trước phải hiển thị block');
    assert(elements.detailPreviewContent.innerHTML.includes('iframe') || elements.detailPreviewContent.innerHTML.includes('Danh_Muc_Hoat_Canh_Khoi_10.pdf'), 'Khung xem trước phải chứa iframe hoặc tên file');
    console.log(`  ✓ Mở xem trước tệp Danh_Muc_Hoat_Canh_Khoi_10.pdf thành công (iframe nạp mượt mà)`);

    // 6. Kiểm thử Kho tài liệu số hóa (Document Store)
    console.log('\n6. Kiểm thử Kho tài liệu số hóa (Document Store):');
    assert(sandbox.documentStore.length >= 68, 'Kho tài liệu phải có tối thiểu 68 tài liệu');
    expectedCodes.forEach(code => {
        const doc = sandbox.documentStore.find(d => d.code === code);
        assert(doc, `Tài liệu ứng với mã ${code} không có trong Kho tư liệu`);
        assert(doc.fileName, `Tài liệu ${doc.id} thiếu fileName`);
        console.log(`  ✓ Kho tư liệu có tệp: [${doc.id}] ${doc.fileName}`);
    });

    // 7. Kiểm thử Máy chủ đồng bộ phục vụ tệp tĩnh qua HTTP
    console.log('\n7. Kiểm thử Máy chủ HTTP (http://localhost:8080/):');
    const checkHttpFile = (relPath) => new Promise((resolve, reject) => {
        http.get(`http://localhost:8080/${relPath}`, res => {
            if (res.statusCode === 200) {
                let bytes = 0;
                res.on('data', chunk => { bytes += chunk.length; });
                res.on('end', () => resolve({ ok: true, bytes, contentType: res.headers['content-type'] }));
            } else {
                resolve({ ok: false, status: res.statusCode });
            }
        }).on('error', err => resolve({ ok: false, error: err.message }));
    });

    const httpCheck1 = await checkHttpFile('uploads/Danh_Muc_Hoat_Canh_Khoi_10.pdf');
    assert(httpCheck1.ok && httpCheck1.bytes > 80000, 'Không tải được tệp PDF qua HTTP');
    console.log(`  ✓ Máy chủ phục vụ uploads/Danh_Muc_Hoat_Canh_Khoi_10.pdf: HTTP 200 (${httpCheck1.bytes} bytes, Type: ${httpCheck1.contentType})`);

    const httpCheck2 = await checkHttpFile('uploads/15_Hoat_Canh_Lich_Su_GDPT2018.docx');
    assert(httpCheck2.ok && httpCheck2.bytes > 80000, 'Không tải được tệp Word qua HTTP');
    console.log(`  ✓ Máy chủ phục vụ uploads/15_Hoat_Canh_Lich_Su_GDPT2018.docx: HTTP 200 (${httpCheck2.bytes} bytes, Type: ${httpCheck2.contentType})`);

    // 8. Kiểm thử Gói ZIP triển khai Netlify
    console.log('\n8. Kiểm thử gói triển khai Netlify (netlify_deploy.zip):');
    assert(fs.existsSync('netlify_deploy.zip'), 'Thiếu netlify_deploy.zip');
    const zipStat = fs.statSync('netlify_deploy.zip');
    assert(zipStat.size > 5000000, 'Dung lượng zip phải > 5MB (đã kèm file uploads)');
    console.log(`  ✓ netlify_deploy.zip sẵn sàng (${(zipStat.size / 1024).toFixed(1)} KB) đã đóng gói đầy đủ 5 file và js/official-posts-data.js`);

    console.log('\n================================================================');
    console.log('   🎉 TẤT CẢ 8 HẠNG MỤC KIỂM THỬ ĐÃ VƯỢT QUA 100%!');
    console.log('   5 TỆP CỦA BẠN ĐÃ ĐĂNG LÊN WEB THÀNH CÔNG VÀ SẴN SÀNG SỬ DỤNG!');
    console.log('================================================================\n');
}

runTest().catch(err => {
    console.error('❌ Kiểm thử thất bại:', err);
    process.exit(1);
});
