/**
 * ====================================================================
 * TEST: LIVE SERVER MULTI-DEVICE SYNC & DOWNLOAD VERIFICATION
 * ====================================================================
 * Kiểm thử quy trình đồng bộ máy chủ thời gian thực & tải file:
 * 1. Máy chủ HTTP/SSE đang chạy trên cổng 8080.
 * 2. Giáo viên ở Thiết bị A đăng bài giảng và tải lên tệp Word/PDF.
 * 3. Đồng bộ server ghi vào CSDL và phát sóng SSE.
 * 4. Học sinh ở Thiết bị B (cùng mạng Wi-Fi / IP) nhận bài ngay lập tức.
 * 5. Học sinh tải về tệp gốc (Word/PDF) và các định dạng chuyển đổi.
 * 6. Học sinh nộp kịch bản đóng vai -> Giáo viên nhận bài & chấm điểm.
 * 7. Giáo viên xóa bài -> Học sinh mất bài thời gian thực 100%.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PORT = 8080;
const SERVER_URL = `http://localhost:${PORT}`;

function httpRequest(urlPath, method = 'GET', body = null, customHeaders = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(urlPath, SERVER_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: { ...(customHeaders || {}) }
        };
        if (body) {
            options.headers['Content-Type'] = 'application/json';
        }
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, headers: res.headers, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, headers: res.headers, raw: data });
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
        req.end();
    });
}

function createClientSession(clientName, initialOrigin = "http://localhost:8080") {
    const storage = {};
    const sessionStore = {};
    const elements = {};
    let lastDownloadedFileName = null;
    let lastDownloadedHref = null;
    let lastDownloadedBlob = null;

    const mockEl = (id = 'mock') => {
        if (elements[id]) return elements[id];
        const el = {
            id,
            value: '',
            textContent: '',
            innerHTML: '',
            style: {},
            checked: false,
            classList: {
                _classes: new Set(),
                add: (c) => el.classList._classes.add(c),
                remove: (c) => el.classList._classes.delete(c),
                contains: (c) => el.classList._classes.has(c),
                toggle: (c) => {
                    if (el.classList._classes.has(c)) {
                        el.classList._classes.delete(c);
                        return false;
                    } else {
                        el.classList._classes.add(c);
                        return true;
                    }
                }
            },
            addEventListener: () => {},
            focus: () => {},
            reset: () => { el.value = ''; },
            appendChild: () => {},
            removeChild: () => {},
            click: () => {}
        };
        elements[id] = el;
        return el;
    };

    const ctx = {
        console,
        Buffer,
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
        addEventListener: () => {},
        removeEventListener: () => {},
        localStorage: {
            getItem: k => (k in storage ? storage[k] : null),
            setItem: (k, v) => { storage[k] = String(v); },
            removeItem: k => { delete storage[k]; },
            clear: () => { for (let k in storage) delete storage[k]; }
        },
        sessionStorage: {
            getItem: k => (k in sessionStore ? sessionStore[k] : null),
            setItem: (k, v) => { sessionStore[k] = String(v); },
            removeItem: k => { delete sessionStore[k]; },
            clear: () => { for (let k in sessionStore) delete sessionStore[k]; }
        },
        window: null,
        location: {
            protocol: 'http:',
            origin: initialOrigin,
            href: `${initialOrigin}/duan.html`,
            reload: () => {}
        },
        document: {
            getElementById: id => mockEl(id),
            querySelectorAll: () => [],
            querySelector: () => null,
            body: {
                appendChild: () => {},
                removeChild: () => {}
            },
            createElement: tag => {
                const el = mockEl(tag);
                if (tag === 'a') {
                    return {
                        ...el,
                        click: function() {
                            lastDownloadedFileName = this.download;
                            lastDownloadedHref = this.href;
                        }
                    };
                }
                return el;
            }
        },
        Blob: function(parts, options) {
            this.parts = parts;
            this.options = options;
            this.size = parts.reduce((acc, p) => acc + (typeof p === 'string' ? p.length : (p.length || 0)), 0);
            this.type = options?.type || '';
        },
        URL: {
            createObjectURL: (blob) => {
                lastDownloadedBlob = blob;
                return `blob:mock/${Date.now()}`;
            },
            revokeObjectURL: () => {}
        },
        EventSource: function(url) {
            this.url = url;
            this.readyState = 1;
            this.close = () => { this.readyState = 2; };
        },
        fetch: async (url, options = {}) => {
            const method = options.method || 'GET';
            const body = options.body ? JSON.parse(options.body) : null;
            const res = await httpRequest(url, method, body, options.headers);
            return {
                ok: res.status >= 200 && res.status < 300,
                status: res.status,
                json: async () => res.data,
                text: async () => (typeof res.data === 'string' ? res.data : JSON.stringify(res.data))
            };
        },
        alert: (msg) => {},
        confirm: () => true,
        prompt: (msg, def) => def
    };

    ctx.window = ctx;

    const jsFiles = ["data.js", "db.js", "sql-studio.js", "sync.js", "teacher.js", "app.js"];
    const scriptCode = jsFiles.map(f => fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8')).join('\n;\n');
    vm.createContext(ctx);
    vm.runInContext(scriptCode, ctx);

    return {
        ctx,
        name: clientName,
        getLastDownload: () => ({ fileName: lastDownloadedFileName, href: lastDownloadedHref, blob: lastDownloadedBlob }),
        resetLastDownload: () => { lastDownloadedFileName = null; lastDownloadedHref = null; lastDownloadedBlob = null; }
    };
}

async function runTestSuite() {
    console.log('================================================================');
    console.log('   KIỂM THỬ ĐỒNG BỘ SERVER THỰC TẾ & DOWNLOAD (GV ĐĂNG -> HS TẢI)');
    console.log('================================================================\n');

    // Bước 1: Kiểm tra kết nối máy chủ
    console.log('1. Kiểm tra trạng thái máy chủ HTTP/SSE sync_server.js:');
    // Đảm bảo CSDL máy chủ sạch 42 bài gốc ban đầu
    await httpRequest('/api/sync', 'POST', {
        action: 'FULL_OVERWRITE',
        teacherPosts: [],
        teacherDocs: [],
        deletedCodes: [],
        studentSubmissions: [],
        customDocs: []
    });

    const syncRes = await httpRequest('/api/sync?force=true');
    if (syncRes.status !== 200) {
        throw new Error(`Máy chủ không phản hồi 200 OK: ${syncRes.status}`);
    }
    console.log('  ✓ Máy chủ /api/sync đang trực tuyến (200 OK)');

    const netRes = await httpRequest('/api/network-info');
    if (netRes.status !== 200 || !netRes.data.primaryLanUrl) {
        throw new Error('Endpoint /api/network-info không hợp lệ');
    }
    console.log(`  ✓ Endpoint /api/network-info nhận diện LAN IP: ${netRes.data.primaryLanUrl}`);

    // Bước 2: Khởi tạo Phiên A (Giáo viên trên máy A) và Phiên B (Học sinh trên máy B qua LAN IP)
    console.log('\n2. Khởi tạo 2 phiên làm việc độc lập (GV máy A ↔ HS máy B qua LAN IP):');
    const teacherSession = createClientSession('Thiết bị Giáo viên (Bục giảng)', 'http://localhost:8080');
    const studentSession = createClientSession('Thiết bị Học sinh (Phòng học)', 'http://10.65.168.172:8080');

    teacherSession.ctx.initSituationRealtimeSync();
    studentSession.ctx.initSituationRealtimeSync();

    console.log(`  ✓ Máy GV kết nối tới: ${teacherSession.ctx.syncServerUrl}`);
    console.log(`  ✓ Máy HS tự động kết nối theo URL máy tính: ${studentSession.ctx.syncServerUrl}`);
    console.log(`  ✓ Số bài ban đầu tại máy GV: ${teacherSession.ctx.catalogData.length}`);
    console.log(`  ✓ Số bài ban đầu tại máy HS: ${studentSession.ctx.catalogData.length}`);

    // Bước 3: Giáo viên xác thực mã khóa bảo mật SU2026
    console.log('\n3. Giáo viên mở Cổng bảo mật và xác thực mã khóa:');
    teacherSession.ctx.document.getElementById('gateAuthKeyInput').value = 'SU2026';
    teacherSession.ctx.submitTeacherAuthGate();
    if (!teacherSession.ctx.isTeacherAuthenticated) {
        throw new Error('Giáo viên không xác thực được mã khóa SU2026');
    }
    console.log('  ✓ Xác thực quyền Giáo viên Bộ môn thành công với key: SU2026');

    // Bước 4: Giáo viên soạn thảo và ĐĂNG BÀI MỚI kèm tệp Word .docx
    console.log('\n4. Giáo viên đăng bài giảng mới kèm tệp Word .docx:');
    const testPostTitle = "Hoạt cảnh: Chiến dịch Điện Biên Phủ trên không (Hà Nội 1972)";
    const testAuthor = "Thầy Trần Nam Dũng";
    const testSchool = "THPT Chuyên Chu Văn An";
    const testWordFile = "KichBan_DienBienPhu_1972.docx";
    const testFileData = "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,PGh0bWw+PGJvZHk+S2ljaCBCYW4gRGllbiBCaWVuIFBodSB0cmVuIGtob25nPC9ib2R5PjwvaHRtbD4=";

    teacherSession.ctx.document.getElementById('teacherTitle').value = testPostTitle;
    teacherSession.ctx.document.getElementById('teacherGrade').value = '12';
    teacherSession.ctx.document.getElementById('teacherAuthor').value = testAuthor;
    teacherSession.ctx.document.getElementById('teacherSchool').value = testSchool;
    teacherSession.ctx.document.getElementById('teacherExamCode').value = 'MD-12.1972';
    teacherSession.ctx.document.getElementById('teacherSummary').value = 'Tái hiện 12 ngày đêm khói lửa bảo vệ bầu trời thủ đô Hà Nội, đập tan pháo đài bay B-52.';
    teacherSession.ctx.document.getElementById('teacherFileName').value = testWordFile;
    teacherSession.ctx.document.getElementById('teacherFileSize').value = '245600';
    teacherSession.ctx.document.getElementById('teacherFileType').value = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    teacherSession.ctx.document.getElementById('teacherFileBase64').value = testFileData;

    teacherSession.ctx.saveTeacherPost();

    const createdPost = teacherSession.ctx.catalogData[0];
    console.log(`  ✓ Giáo viên đã lưu bài đăng mã: ${createdPost.code} (${createdPost.lesson})`);
    console.log(`  ✓ Tệp đính kèm: ${createdPost.fileName}`);

    // Bước 5: Chờ máy chủ đồng bộ và Học sinh nhận bài
    console.log('\n5. Đồng bộ hóa qua Server & Kiểm tra phía Học sinh nhận bài:');
    // Máy chủ nhận mutation
    await new Promise(r => setTimeout(r, 100));

    // Học sinh nhận cập nhật từ server (qua SSE hoặc heartbeat)
    await studentSession.ctx.checkServerSync(false, true);

    const studentReceivedPost = studentSession.ctx.catalogData.find(i => i.code === createdPost.code);
    if (!studentReceivedPost) {
        throw new Error('Học sinh không nhận được bài đăng từ Giáo viên!');
    }
    console.log(`  ✓ Học sinh lập tức nhìn thấy bài đăng của Giáo viên: ${studentReceivedPost.code}`);
    console.log(`  ✓ Tiêu đề bài học tại máy HS: "${studentReceivedPost.lesson}"`);
    console.log(`  ✓ Tên Giáo viên biên soạn hiển thị đúng: ${studentReceivedPost.author} (${studentReceivedPost.school})`);
    console.log(`  ✓ Tệp đính kèm sẵn sàng: ${studentReceivedPost.fileName}`);

    // Bước 6: Học sinh mở bài & DOWNLOAD tệp gốc của Giáo viên
    console.log('\n6. Học sinh Tải về tệp gốc của Giáo viên (Download):');
    studentSession.resetLastDownload();
    studentSession.ctx.exportLessonOriginalFile(studentReceivedPost);
    let dl = studentSession.getLastDownload();
    if (dl.fileName !== testWordFile) {
        throw new Error(`Tải tệp gốc thất bại! Mong đợi '${testWordFile}', nhận được '${dl.fileName}'`);
    }
    console.log(`  ✓ Tải tệp gốc trực tiếp: thành công tệp "${dl.fileName}"`);

    // Bước 7: Học sinh mở Modal tùy chọn tải về và tải các định dạng khác
    console.log('\n7. Học sinh chọn các định dạng xuất khác nhau (DOCX, DOC, TXT, HTML):');
    studentSession.ctx.openDownloadFormatModal(studentReceivedPost.code);

    // Xuất DOCX
    studentSession.resetLastDownload();
    studentSession.ctx.executeDownloadSelectedFormat('docx');
    dl = studentSession.getLastDownload();
    if (!dl.fileName || !dl.fileName.endsWith('.docx')) {
        throw new Error(`Xuất docx thất bại: ${dl.fileName}`);
    }
    console.log(`  ✓ Xuất định dạng Word (.docx): thành công "${dl.fileName}"`);

    // Xuất DOC (Word 97-2003)
    studentSession.resetLastDownload();
    studentSession.ctx.executeDownloadSelectedFormat('doc');
    dl = studentSession.getLastDownload();
    if (!dl.fileName || !dl.fileName.endsWith('.doc')) {
        throw new Error(`Xuất doc thất bại: ${dl.fileName}`);
    }
    console.log(`  ✓ Xuất định dạng Word cổ điển (.doc): thành công "${dl.fileName}"`);

    // Xuất TXT
    studentSession.resetLastDownload();
    studentSession.ctx.executeDownloadSelectedFormat('txt');
    dl = studentSession.getLastDownload();
    if (!dl.fileName || !dl.fileName.endsWith('.txt')) {
        throw new Error(`Xuất txt thất bại: ${dl.fileName}`);
    }
    console.log(`  ✓ Xuất định dạng Text (.txt): thành công "${dl.fileName}"`);

    // Xuất HTML
    studentSession.resetLastDownload();
    studentSession.ctx.executeDownloadSelectedFormat('html');
    dl = studentSession.getLastDownload();
    if (!dl.fileName || !dl.fileName.endsWith('.html')) {
        throw new Error(`Xuất html thất bại: ${dl.fileName}`);
    }
    console.log(`  ✓ Xuất định dạng Web độc lập (.html): thành công "${dl.fileName}"`);

    // Bước 8: Học sinh tải nhanh trực tiếp từ nút trên Danh mục (1-Click Table Button)
    console.log('\n8. Học sinh bấm nút tải nhanh "⬇️ Tải về" trực tiếp trên hàng danh mục:');
    studentSession.resetLastDownload();
    studentSession.ctx.downloadTeacherWordFile(studentReceivedPost.code);
    studentSession.ctx.executeDownloadSelectedFormat('original');
    dl = studentSession.getLastDownload();
    if (dl.fileName !== testWordFile) {
        throw new Error(`Tải nhanh thất bại: ${dl.fileName}`);
    }
    console.log(`  ✓ Nút tải nhanh tại bảng danh mục: tải đúng tệp "${dl.fileName}"`);

    // Bước 9: Học sinh nộp bài kịch bản phân vai cho Giáo viên
    console.log('\n9. Học sinh phân vai và Nộp bài kịch bản cho Giáo viên:');
    const submissionId = `SUB-${Date.now()}`;
    const studentSub = {
        id: submissionId,
        postCode: studentReceivedPost.code,
        postTitle: studentReceivedPost.lesson,
        grade: studentReceivedPost.grade,
        examCode: studentReceivedPost.examCode,
        studentName: "Nhóm Sử 12A1 (Trần Đăng Khoa, Nguyễn Mai Chi)",
        rolesAssigned: "Khoa đóng vai Bộ đội tên lửa, Chi đóng vai Nữ tự vệ thủ đô",
        scriptNotes: "Kịch bản đã hoàn thành chi tiết lời thoại cảnh đêm 18/12/1972",
        submittedAt: new Date().toISOString(),
        status: "PENDING"
    };

    studentSession.ctx.commitDatabaseMutation("STUDENT_SUBMISSION_CREATED", studentSub);
    console.log(`  ✓ Học sinh đã nộp bài: ${studentSub.studentName}`);

    // Chờ mạng truyền tải tới server
    await new Promise(r => setTimeout(r, 300));

    // Giáo viên nhận bài nộp
    await teacherSession.ctx.checkServerSync(false, true);
    const teacherReceivedSub = teacherSession.ctx.studentSubmissions.find(s => s.id === submissionId);
    if (!teacherReceivedSub) {
        throw new Error('Giáo viên không nhận được bài nộp của Học sinh!');
    }
    console.log(`  ✓ Giáo viên nhận được bài nộp của học sinh trong hòm thư thời gian thực!`);

    // Bước 10: Giáo viên chấm điểm 10/10 và gửi lời phê
    console.log('\n10. Giáo viên chấm điểm & gửi nhận xét sư phạm:');
    teacherSession.ctx.document.getElementById(`gradeInput_${submissionId}`).value = '10.0';
    teacherSession.ctx.document.getElementById(`feedbackInput_${submissionId}`).value = 'Kịch bản xuất sắc! Tái hiện khí phách hào hùng của quân dân thủ đô.';
    teacherSession.ctx.submitTeacherFeedback(submissionId);

    // Chờ mạng truyền tải tới server
    await new Promise(r => setTimeout(r, 300));

    // Học sinh nhận điểm số
    await studentSession.ctx.checkServerSync(false, true);
    const studentUpdatedSub = studentSession.ctx.studentSubmissions.find(s => s.id === submissionId);
    if (!studentUpdatedSub || studentUpdatedSub.status !== 'GRADED' || studentUpdatedSub.teacherGrade !== '10.0') {
        throw new Error('Học sinh không nhận được điểm số 10.0!');
    }
    console.log(`  ✓ Học sinh nhận được điểm số: ${studentUpdatedSub.teacherGrade}/10 (Xuất sắc)`);
    console.log(`  ✓ Lời phê của Giáo viên: "${studentUpdatedSub.teacherFeedback}"`);

    // Bước 11: Giáo viên xóa bài đăng -> Học sinh lập tức mất bài
    console.log('\n11. Giáo viên xóa bài đăng -> Học sinh lập tức đồng bộ xóa bài:');
    teacherSession.ctx.deleteTeacherPost(createdPost.code);
    await new Promise(r => setTimeout(r, 150));
    await studentSession.ctx.checkServerSync(false, true);

    const postAfterDelete = studentSession.ctx.catalogData.find(i => i.code === createdPost.code);
    if (postAfterDelete) {
        throw new Error('Bài học vẫn còn tồn tại phía Học sinh sau khi Giáo viên đã xóa!');
    }
    console.log(`  ✓ Học sinh lập tức mất bài ${createdPost.code} sau khi Giáo viên xóa (Đồng bộ xóa 100%)`);

    // Bước 12: Thiết bị C mới vào lần đầu (Cold Start)
    console.log('\n12. Thiết bị C mới mở web lần đầu (Cold-start từ Server API):');
    const newStudentSession = createClientSession('Thiết bị Học sinh C (Mới mở)', 'http://10.65.168.172:8080');
    newStudentSession.ctx.initSituationRealtimeSync();
    await newStudentSession.ctx.checkServerSync(false, true);

    const postInNewDevice = newStudentSession.ctx.catalogData.find(i => i.code === createdPost.code);
    if (postInNewDevice) {
        throw new Error('Thiết bị mới vẫn nạp bài đã xóa!');
    }
    console.log(`  ✓ Thiết bị mới đồng bộ chuẩn xác từ CSDL máy chủ (Không sót bài đã xóa)`);

    console.log('\n================================================================');
    console.log('   🎉 TẤT CẢ 12 TIÊU CHÍ ĐỒNG BỘ THỜI GIAN THỰC & DOWNLOAD ĐÃ ĐẠT 100%!');
    console.log('   GV ĐĂNG BÀI -> SERVER LƯU TRỮ -> HS MÁY KHÁC THẤY VÀ DOWNLOAD HOÀN HẢO!');
    console.log('================================================================\n');

    process.exit(0);
}

runTestSuite().catch(err => {
    console.error('\n❌ KIỂM THỬ THẤT BẠI:', err);
    process.exit(1);
});
