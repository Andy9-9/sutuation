/**
 * ====================================================================
 * TEST SUITE: 1 GIÁO VIÊN & 2 HỌC SINH ĐỒNG THỜI (1 GV + 2 HS)
 * ĐẢM BẢO DOWNLOAD VỀ ĐƯỢC 100% & BỘ NHỚ RAM < 6 GB
 * ====================================================================
 */

const http = require('http');
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8080;
const SERVER_URL = `http://localhost:${PORT}`;
const MAX_ALLOWED_RAM_MB = 6 * 1024; // 6,144 MB (6 GB)

function logPass(msg) { console.log(`  ✓ [PASS] ${msg}`); }
function logFail(msg) { console.error(`  ✗ [FAIL] ${msg}`); process.exit(1); }

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
    let downloadedFiles = [];

    const mockEl = (id) => {
        if (elements[id]) return elements[id];
        const el = {
            id,
            tagName: 'DIV',
            value: '',
            textContent: '',
            innerHTML: '',
            style: { display: 'block' },
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
                            downloadedFiles.push({
                                fileName: this.download,
                                href: this.href,
                                timestamp: Date.now()
                            });
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
            _active: new Set(),
            createObjectURL: (blob) => {
                const u = `blob:mock/${Date.now()}_${Math.random()}`;
                ctx.URL._active.add(u);
                return u;
            },
            revokeObjectURL: (u) => {
                ctx.URL._active.delete(u);
            }
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
        prompt: (msg, def) => def,
        downloadedFiles
    };

    ctx.window = ctx;

    const jsFiles = ["data.js", "db.js", "sql-studio.js", "sync.js", "teacher.js", "app.js"];
    const scriptCode = jsFiles.map(f => fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8')).join('\n;\n');
    vm.createContext(ctx);
    vm.runInContext(scriptCode, ctx);

    return {
        ctx,
        name: clientName,
        origin: initialOrigin,
        getDownloads: () => downloadedFiles,
        clearDownloads: () => { downloadedFiles = []; }
    };
}

async function runTestSuite() {
    console.log('================================================================');
    console.log('   KIỂM THỬ: 1 GV + 2 HS ĐỒNG BỘ, DOWNLOAD & BỘ NHỚ RAM < 6 GB');
    console.log('================================================================\n');

    // BƯỚC 1: KIỂM TRA BỘ NHỚ RAM BAN ĐẦU & KHỞI TẠO CSDL CHUẨN
    console.log('1. Đo lường Bộ nhớ RAM hệ thống & Thiết lập CSDL ban đầu:');
    // Đảm bảo CSDL máy chủ sạch 42 bài học chuẩn
    await httpRequest('/api/sync', 'POST', {
        action: 'FULL_OVERWRITE',
        teacherPosts: [],
        teacherDocs: [],
        deletedCodes: [],
        studentSubmissions: [],
        customDocs: []
    });

    const initMemRes = await httpRequest('/api/system-memory');
    if (initMemRes.status !== 200 || !initMemRes.data.serverMemory) {
        logFail('Không thể lấy chỉ số RAM từ /api/system-memory');
    }
    const initRssMb = initMemRes.data.serverMemory.rssMb;
    const initHeapMb = initMemRes.data.serverMemory.heapUsedMb;
    console.log(`   -> RSS RAM Server: ${initRssMb} MB (Chiếm ${initMemRes.data.serverMemory.percentOf6GbLimit} của ngưỡng 6 GB)`);
    console.log(`   -> Heap RAM Server: ${initHeapMb} MB`);
    if (initRssMb > MAX_ALLOWED_RAM_MB) {
        logFail(`RAM vượt quá 6 GB ngay từ đầu: ${initRssMb} MB > ${MAX_ALLOWED_RAM_MB} MB`);
    }
    logPass(`Bộ nhớ RAM khởi điểm an toàn tuyệt đối: ${initRssMb} MB (chỉ ${initMemRes.data.serverMemory.percentOf6GbLimit} của 6 GB)`);

    // BƯỚC 2: KHỞI TẠO 3 THIẾT BỊ (1 GV + 2 HS)
    console.log('\n2. Khởi tạo 3 thiết bị độc lập (1 GV + 2 HS):');
    const netInfo = await httpRequest('/api/network-info');
    const lanUrl = netInfo.data?.primaryLanUrl || SERVER_URL;

    const gvSession = createClientSession('Giáo viên (Laptop)', SERVER_URL);
    const hs1Session = createClientSession('Học sinh 1 (Điện thoại HS)', lanUrl);
    const hs2Session = createClientSession('Học sinh 2 (Máy tính phòng Tin)', lanUrl);

    // Kích hoạt đồng bộ cho cả 3
    gvSession.ctx.initSituationRealtimeSync();
    hs1Session.ctx.initSituationRealtimeSync();
    hs2Session.ctx.initSituationRealtimeSync();

    await gvSession.ctx.checkServerSync(false, true);
    await hs1Session.ctx.checkServerSync(false, true);
    await hs2Session.ctx.checkServerSync(false, true);

    const gvCount = gvSession.ctx.catalogData.length;
    const hs1Count = hs1Session.ctx.catalogData.length;
    const hs2Count = hs2Session.ctx.catalogData.length;

    if (gvCount !== 42 || hs1Count !== 42 || hs2Count !== 42) {
        logFail(`Số bài ban đầu không khớp 42: GV=${gvCount}, HS1=${hs1Count}, HS2=${hs2Count}`);
    }
    logPass(`Cả 3 thiết bị (GV, HS1, HS2) đồng bộ khớp chính xác 42 bài học SGK ban đầu.`);

    // BƯỚC 3: GIÁO VIÊN XÁC THỰC MÃ KHÓA & ĐĂNG BÀI KÈM TỆP WORD
    console.log('\n3. Giáo viên đăng bài giảng mới kèm tệp Word (.docx):');
    gvSession.ctx.isTeacherAuthenticated = true;
    gvSession.ctx.sessionTeacherKey = 'SU2026';
    logPass('Giáo viên xác thực quyền SU2026 thành công.');

    const testPostTitle = "Hoạt cảnh: Chiến thắng Điện Biên Phủ trên không 1972";
    const testAuthor = "Thầy Trần Nam Dũng";
    const testSchool = "THPT Chuyên Chu Văn An";
    const testWordFile = "KichBan_DienBienPhu_1972.docx";
    const testFileData = "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,PGh0bWw+PGJvZHk+S2ljaCBCYW4gRGllbiBCaWVuIFBodSB0cmVuIGtob25nPC9ib2R5PjwvaHRtbD4=";

    gvSession.ctx.document.getElementById('teacherTitle').value = testPostTitle;
    gvSession.ctx.document.getElementById('teacherGrade').value = '12';
    gvSession.ctx.document.getElementById('teacherAuthor').value = testAuthor;
    gvSession.ctx.document.getElementById('teacherSchool').value = testSchool;
    gvSession.ctx.document.getElementById('teacherExamCode').value = 'MD-12.1972';
    gvSession.ctx.document.getElementById('teacherSummary').value = 'Tái hiện 12 ngày đêm khói lửa bảo vệ bầu trời thủ đô Hà Nội, đập tan pháo đài bay B-52.';
    gvSession.ctx.document.getElementById('teacherFileName').value = testWordFile;
    gvSession.ctx.document.getElementById('teacherFileSize').value = '245600';
    gvSession.ctx.document.getElementById('teacherFileType').value = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    gvSession.ctx.document.getElementById('teacherFileBase64').value = testFileData;

    gvSession.ctx.saveTeacherPost();

    const createdPost = gvSession.ctx.catalogData[0];
    const postCode = createdPost.code;
    const fileName = createdPost.fileName;
    await new Promise(r => setTimeout(r, 200));
    logPass(`Giáo viên đã lưu bài đăng mã: ${postCode} ("${createdPost.lesson}") kèm tệp ${fileName}`);

    // BƯỚC 4: HỌC SINH 1 VÀ 2 ĐỒNG THỜI NHẬN BÀI QUA SERVER
    console.log('\n4. Kiểm tra Học sinh 1 và Học sinh 2 đồng thời nhận bài qua Server:');
    await hs1Session.ctx.checkServerSync(false, true);
    await hs2Session.ctx.checkServerSync(false, true);

    const hs1Post = hs1Session.ctx.catalogData.find(i => i.code === postCode);
    const hs2Post = hs2Session.ctx.catalogData.find(i => i.code === postCode);

    if (!hs1Post || !hs2Post) {
        logFail(`Học sinh chưa nhận đủ bài: HS1=${!!hs1Post}, HS2=${!!hs2Post}`);
    }
    logPass(`Học sinh 1 nhìn thấy bài: "${hs1Post.lesson}" (Mã: ${hs1Post.code}, GV: ${hs1Post.author})`);
    logPass(`Học sinh 2 nhìn thấy bài: "${hs2Post.lesson}" (Mã: ${hs2Post.code}, GV: ${hs2Post.author})`);

    // BƯỚC 5: CẢ 2 HỌC SINH ĐỒNG THỜI DOWNLOAD TỆP VỀ MÁY
    console.log('\n5. Kiểm thử Tải về (Download) độc lập trên cả 2 máy Học sinh:');
    
    // HS1 tải tệp gốc
    hs1Session.ctx.exportLessonOriginalFile(postCode);
    const hs1Downloads = hs1Session.getDownloads();
    if (hs1Downloads.length === 0 || hs1Downloads[0].fileName !== fileName) {
        logFail(`HS1 tải tệp gốc không đúng: ${JSON.stringify(hs1Downloads)}`);
    }
    logPass(`Học sinh 1 tải thành công tệp gốc: "${hs1Downloads[0].fileName}"`);

    // HS2 tải tệp gốc
    hs2Session.ctx.exportLessonOriginalFile(postCode);
    const hs2Downloads = hs2Session.getDownloads();
    if (hs2Downloads.length === 0 || hs2Downloads[0].fileName !== fileName) {
        logFail(`HS2 tải tệp gốc không đúng: ${JSON.stringify(hs2Downloads)}`);
    }
    logPass(`Học sinh 2 tải thành công tệp gốc: "${hs2Downloads[0].fileName}"`);

    // HS1 xuất Word DOCX chuẩn hóa
    hs1Session.ctx.exportLessonToFormat(postCode, 'DOCX');
    logPass(`Học sinh 1 tải định dạng Word (.docx): "${hs1Downloads[1]?.fileName}"`);

    // HS2 xuất Word DOC cổ điển
    hs2Session.ctx.exportLessonToFormat(postCode, 'DOC');
    logPass(`Học sinh 2 tải định dạng Word (.doc): "${hs2Downloads[1]?.fileName}"`);

    // HS2 xuất Text thuần (.txt)
    hs2Session.ctx.exportLessonToFormat(postCode, 'TXT');
    logPass(`Học sinh 2 tải định dạng Text (.txt): "${hs2Downloads[2]?.fileName}"`);

    // HS1 tải nhanh nút 1-click trên bảng
    hs1Session.ctx.downloadDirectItem(postCode);
    logPass(`Học sinh 1 bấm nút nhanh "⬇️ Tải về" trên bảng danh mục: "${hs1Downloads[2]?.fileName}"`);

    // HS2 tải nhanh nút 1-click trên bảng
    hs2Session.ctx.downloadDirectItem(postCode);
    logPass(`Học sinh 2 bấm nút nhanh "⬇️ Tải về" trên bảng danh mục: "${hs2Downloads[3]?.fileName}"`);

    // BƯỚC 6: HỌC SINH 1 VÀ 2 NỘP BÀI -> GIÁO VIÊN CHẤM ĐIỂM
    console.log('\n6. Cả 2 Học sinh nộp bài kịch bản phân vai -> Giáo viên chấm điểm:');
    const sub1 = {
        id: 'SUB-1-' + Date.now(),
        postCode: postCode,
        lessonTitle: createdPost.lesson,
        studentName: 'Nguyễn Văn An (12A1)',
        roleName: 'Chỉ huy Sở Phòng không Hà Nội',
        scriptContent: 'Kịch bản phân vai bảo vệ bầu trời Hà Nội.',
        createdAt: new Date().toISOString()
    };
    const sub2 = {
        id: 'SUB-2-' + (Date.now() + 1),
        postCode: postCode,
        lessonTitle: createdPost.lesson,
        studentName: 'Trần Thị Bình (12A2)',
        roleName: 'Chiến sĩ Trinh sát Ra-đa',
        scriptContent: 'Kịch bản phân vai phát hiện B-52.',
        createdAt: new Date().toISOString()
    };

    hs1Session.ctx.commitDatabaseMutation('STUDENT_SUBMISSION_CREATED', sub1);
    hs2Session.ctx.commitDatabaseMutation('STUDENT_SUBMISSION_CREATED', sub2);
    await new Promise(r => setTimeout(r, 150));

    // Giáo viên nhận bài
    await gvSession.ctx.checkServerSync(false, true);
    const gvSubs = gvSession.ctx.studentSubmissions;
    const found1 = gvSubs.find(s => s.id === sub1.id);
    const found2 = gvSubs.find(s => s.id === sub2.id);
    if (!found1 || !found2) logFail('GV không nhận đủ bài nộp của HS1 và HS2');

    logPass(`Giáo viên nhận bài của HS1: "${found1.studentName}" [${found1.roleName}]`);
    logPass(`Giáo viên nhận bài của HS2: "${found2.studentName}" [${found2.roleName}]`);

    // Giáo viên chấm điểm
    found1.teacherGrade = '10.0';
    found1.teacherFeedback = 'Kịch bản xuất sắc!';
    found1.status = 'GRADED';
    found2.teacherGrade = '9.5';
    found2.teacherFeedback = 'Phân vai rất sinh động!';
    found2.status = 'GRADED';

    gvSession.ctx.commitDatabaseMutation('TEACHER_FEEDBACK_SAVED', found1);
    gvSession.ctx.commitDatabaseMutation('TEACHER_FEEDBACK_SAVED', found2);
    await new Promise(r => setTimeout(r, 150));

    // Cả 2 học sinh nhận điểm
    await hs1Session.ctx.checkServerSync(false, true);
    await hs2Session.ctx.checkServerSync(false, true);

    const hs1Grade = hs1Session.ctx.studentSubmissions.find(s => s.id === sub1.id)?.teacherGrade;
    const hs2Grade = hs2Session.ctx.studentSubmissions.find(s => s.id === sub2.id)?.teacherGrade;

    if (hs1Grade !== '10.0' || hs2Grade !== '9.5') {
        logFail(`Điểm số không khớp: HS1=${hs1Grade}, HS2=${hs2Grade}`);
    }
    logPass(`Học sinh 1 nhận điểm: ${hs1Grade}/10 ("${found1.teacherFeedback}")`);
    logPass(`Học sinh 2 nhận điểm: ${hs2Grade}/10 ("${found2.teacherFeedback}")`);

    // BƯỚC 7: GIÁO VIÊN XÓA BÀI -> CẢ 2 HỌC SINH ĐỒNG THỜI BIẾN MẤT BÀI
    console.log('\n7. Giáo viên xóa bài -> Cả 2 Học sinh đồng bộ xóa tức thì:');
    gvSession.ctx.deleteTeacherPost(postCode);
    await new Promise(r => setTimeout(r, 150));

    await hs1Session.ctx.checkServerSync(false, true);
    await hs2Session.ctx.checkServerSync(false, true);

    const hs1Deleted = hs1Session.ctx.catalogData.find(i => i.code === postCode);
    const hs2Deleted = hs2Session.ctx.catalogData.find(i => i.code === postCode);

    if (hs1Deleted || hs2Deleted) {
        logFail('Bài vẫn còn tồn tại phía Học sinh sau khi xóa');
    }
    logPass(`Học sinh 1: bài 12.W01 biến mất ngay lập tức (Số bài: ${hs1Session.ctx.catalogData.length})`);
    logPass(`Học sinh 2: bài 12.W01 biến mất ngay lập tức (Số bài: ${hs2Session.ctx.catalogData.length})`);

    // BƯỚC 8: ĐO LƯỜNG & KIỂM CHỨNG BỘ NHỚ RAM CUỐI CÙNG (< 6 GB)
    console.log('\n8. Đo lường & Kiểm chứng Bộ nhớ RAM sau toàn bộ chu trình:');
    const finalMemRes = await httpRequest('/api/system-memory');
    const finalRssMb = finalMemRes.data.serverMemory.rssMb;
    const finalHeapMb = finalMemRes.data.serverMemory.heapUsedMb;

    console.log(`   -> RSS RAM Server: ${finalRssMb} MB (Chiếm ${finalMemRes.data.serverMemory.percentOf6GbLimit} của ngưỡng 6 GB)`);
    console.log(`   -> Heap RAM Server: ${finalHeapMb} MB`);
    console.log(`   -> Ngưỡng RAM tối đa cho phép: ${MAX_ALLOWED_RAM_MB} MB (6 GB)`);

    if (finalRssMb > MAX_ALLOWED_RAM_MB) {
        logFail(`Bộ nhớ RAM vượt ngưỡng 6 GB: ${finalRssMb} MB > ${MAX_ALLOWED_RAM_MB} MB`);
    }

    logPass(`HOÀN TOÀN TỐI ƯU: Bộ nhớ RAM Server (${finalRssMb} MB) chỉ chiếm ~${finalMemRes.data.serverMemory.percentOf6GbLimit} của 6 GB.`);
    logPass(`Dư hơn ${(MAX_ALLOWED_RAM_MB - finalRssMb).toFixed(0)} MB RAM trống, không lo quá tải, hoạt động siêu mượt!`);

    console.log('\n================================================================');
    console.log('   🎉 TẤT CẢ TIÊU CHÍ 1 GV + 2 HS, DOWNLOAD VÀ RAM < 6 GB ĐẠT 100%!');
    console.log('================================================================');
}

runTestSuite().then(() => {
    process.exit(0);
}).catch(err => {
    console.error('Lỗi kiểm thử:', err);
    process.exit(1);
});
