const fs = require('fs');
const vm = require('vm');

const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'duan.html'), 'utf8');
let scriptCode = '';
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
  scriptCode = scriptMatch[1];
} else {
  const jsFiles = ["data.js", "db.js", "sql-studio.js", "sync.js", "teacher.js", "app.js"];
  scriptCode = jsFiles.map(f => fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8')).join('\n;\n');
}

// 1. Setup shared bus for BroadcastChannel and LocalStorage to simulate multi-window
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
        // Dispatch storage event to other sessions
        if (env.window && typeof env.window._triggerStorageEvent === 'function') {
          // Handled per session
        }
      },
      removeItem: k => { delete sharedStorage[k]; },
      clear: () => { for (let k in sharedStorage) delete sharedStorage[k]; }
    },
    sessionStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {}
    }
  };

  const elements = {};
  const mockElement = (id = 'mock') => {
    if (elements[id]) return elements[id];
    let val = '';
    if (id === 'formatFilter' || id === 'topicFilter') val = 'ALL';
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
        add: (c) => el.classList._classes.add(c),
        remove: (c) => el.classList._classes.delete(c),
        contains: (c) => el.classList._classes.has(c)
      },
      addEventListener: (evt, fn) => {
        el['on' + evt] = fn;
      },
      appendChild: (child) => {
        if (!el._children) el._children = [];
        el._children.push(child);
      },
      removeChild: (child) => {
        if (el._children) {
          const idx = el._children.indexOf(child);
          if (idx >= 0) el._children.splice(idx, 1);
        }
      },
      scrollIntoView: () => {},
      click: () => {
        if (el.onclick) el.onclick();
      }
    };
    elements[id] = el;
    return el;
  };

  env.document = {
    getElementById: id => mockElement(id),
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: tag => mockElement(tag + '_' + Math.random().toString(36).slice(2, 6)),
    body: mockElement('body')
  };

  env.window = env;
  env.window.addEventListener = (evt, fn) => {
    if (!env._eventListeners) env._eventListeners = {};
    if (!env._eventListeners[evt]) env._eventListeners[evt] = [];
    env._eventListeners[evt].push(fn);
  };
  env.window.open = (url) => { env._lastOpenedUrl = url; };
  env.window.scrollTo = () => {};

  env.alert = () => {};
  env.confirm = () => true;
  env.Blob = class { constructor(parts, opts) { this.parts = parts; this.opts = opts; } };
  env.URL = { createObjectURL: () => 'blob:mock', revokeObjectURL: () => {} };

  const exportBridge = `
    if (typeof window.catalogData === "undefined") window.catalogData = catalogData;
    if (typeof window.documentStore === "undefined") window.documentStore = documentStore;
    if (typeof window.studentSubmissions === "undefined") window.studentSubmissions = studentSubmissions;
    if (typeof window.isTeacherAuthenticated === "undefined") window.isTeacherAuthenticated = isTeacherAuthenticated;
    if (typeof window.sessionTeacherKey === "undefined") window.sessionTeacherKey = sessionTeacherKey;
    window.saveTeacherPost = saveTeacherPost;
    window.openDetailModal = openDetailModal;
    window.submitStudentWork = submitStudentWork;
    window.submitTeacherFeedback = submitTeacherFeedback;
    window.studentBookmarks = studentBookmarks;
    window.switchTeacherModalTab = switchTeacherModalTab;
    window.applyCatalogFilters = applyCatalogFilters;
    window.toggleStudentBookmark = toggleStudentBookmark;
    window.isItemBookmarked = isItemBookmarked;
    window.initSituationRealtimeSync = initSituationRealtimeSync;
    window.runInteractiveSyncDemo = runInteractiveSyncDemo;
    window.submitTeacherAuthGate = submitTeacherAuthGate;
  `;

  vm.createContext(env);
  vm.runInContext(scriptCode + exportBridge, env);

  // Initialize
  env.initSituationRealtimeSync();

  return env;
}

console.log('================================================================');
console.log('   KIỂM THỬ HỆ THỐNG LIÊN THÔNG: GV 1 ĐĂNG BÀI ↔ HS 1 THẤY NGAY');
console.log('================================================================\n');

let passedChecks = 0;
let totalChecks = 0;
function assert(condition, message) {
  totalChecks++;
  if (!condition) {
    console.error(`  ❌ THẤT BẠI: ${message}`);
    process.exit(1);
  } else {
    passedChecks++;
    console.log(`  ✓ ${message}`);
  }
}

// -------------------------------------------------------------
// KHỞI TẠO 2 PHIÊN TRÌNH DUYỆT RIÊNG BIỆT: TAB GV 1 VÀ TAB HS 1
// -------------------------------------------------------------
console.log('1. Khởi tạo 2 cửa sổ/tab độc lập (GV 1 và HS 1):');
const teacherSession = createSession('Tab_GV_1');
const studentSession = createSession('Tab_HS_1');

assert(teacherSession.catalogData.length === 42, 'Tab GV 1 có 42 bài học gốc chuẩn.');
assert(studentSession.catalogData.length === 42, 'Tab HS 1 có 42 bài học gốc chuẩn.');

// -------------------------------------------------------------
// GV 1 TẠO BÀI ĐĂNG KÈM FILE TẠI TAB 1
// -------------------------------------------------------------
console.log('\n2. GV 1 tạo bài đăng mới tại Tab GV 1:');
teacherSession.isTeacherAuthenticated = true;
teacherSession.sessionTeacherKey = 'SU2026';

teacherSession.document.getElementById('teacherGrade').value = '11';
teacherSession.document.getElementById('teacherTitle').value = 'Khởi nghĩa Lam Sơn & Bình Ngô đại cáo';
teacherSession.document.getElementById('teacherAuthor').value = 'Thầy Hoàng Văn Thụ';
teacherSession.document.getElementById('teacherSchool').value = 'THPT Chuyên Chu Văn An';
teacherSession.document.getElementById('teacherSummary').value = 'Kịch bản đàm phán Đông Quan và tư tưởng nhân nghĩa cứu nước.';
teacherSession.document.getElementById('teacherExamCode').value = 'MD-11.1428';
teacherSession.document.getElementById('teacherFileBase64').value = 'data:application/pdf;base64,JVBERi0xLjQK';
teacherSession.document.getElementById('teacherFileName').value = 'BinhNgoDaiCao.pdf';
teacherSession.document.getElementById('teacherFileSize').value = '350000';
teacherSession.document.getElementById('teacherFileType').value = 'application/pdf';

// Lưu bài tại Tab GV
teacherSession.saveTeacherPost();

const gvPost = teacherSession.catalogData[0];
assert(gvPost.lesson === 'Khởi nghĩa Lam Sơn & Bình Ngô đại cáo', 'GV 1 đã lưu bài thành công tại Tab GV 1: ' + gvPost.code);

// -------------------------------------------------------------
// KIỂM TRA TAB HS 1 TỰ ĐỘNG THẤY BÀI VỪA TẠO THEO THỜI GIAN THỰC
// -------------------------------------------------------------
console.log('\n3. Kiểm tra tính liên thông thời gian thực tại Tab HS 1 (Không cần tải lại trang):');

const studentFoundPost = studentSession.catalogData.find(i => i.code === gvPost.code);
assert(studentFoundPost !== undefined, 'HS 1 ngay lập tức nhìn thấy bài đăng của GV 1 trong CSDL: ' + gvPost.code);
assert(studentFoundPost.lesson === 'Khởi nghĩa Lam Sơn & Bình Ngô đại cáo', 'Tên bài học chuẩn xác tại Tab HS 1.');
assert(studentFoundPost.author === 'Thầy Hoàng Văn Thụ', 'Tên Thầy/Cô biên soạn chuẩn xác: ' + studentFoundPost.author);
assert(studentFoundPost.fileName === 'BinhNgoDaiCao.pdf', 'Tệp đính kèm chuẩn xác: ' + studentFoundPost.fileName);

// Kiểm tra Toast thông báo nổi lên trên màn hình HS 1
const toastContainer = studentSession.document.getElementById('situationToastContainer');
assert(toastContainer._children && toastContainer._children.length > 0, 'HS 1 nhận được Toast thông báo chuông nổi bật.');
const toastHtml = toastContainer._children[0].innerHTML;
assert(toastHtml.includes('THẦY/CÔ VỪA ĐĂNG BÀI MỚI'), 'Tiêu đề thông báo chuẩn xác: THẦY/CÔ VỪA ĐĂNG BÀI MỚI');
assert(toastHtml.includes('Thầy Hoàng Văn Thụ'), 'Nội dung thông báo nêu đúng tên Thầy/Cô biên soạn');
assert(toastHtml.includes('Khởi nghĩa Lam Sơn'), 'Nội dung thông báo nêu đúng tên bài học');

// Kiểm tra giao diện Danh mục tại Tab HS có huy hiệu MỚI TỪ GV khi lọc bài Giáo viên
studentSession.document.getElementById('teacherOnlyFilter').checked = true;
studentSession.applyCatalogFilters();
const studentCatalogHtml = studentSession.document.getElementById('catalogTableBody').innerHTML;
assert(studentCatalogHtml.includes('MỚI TỪ GV'), 'Huy hiệu "✨ MỚI TỪ GV" xuất hiện nổi bật trên bài đăng tại Tab HS 1.');
assert(studentCatalogHtml.includes('Thầy Hoàng Văn Thụ'), 'Họ tên Giáo viên hiển thị trên thẻ bài học của HS.');

// -------------------------------------------------------------
// HS 1 MỞ BÀI, XEM TỆP VÀ NỘP BÀI KỊCH BẢN ĐÓNG VAI NHÓM
// -------------------------------------------------------------
console.log('\n4. HS 1 mở bài của GV 1, xem tệp và nộp kịch bản đóng vai nhóm:');
studentSession.openDetailModal(gvPost.code);

const detailModalBody = studentSession.document.getElementById('detailModalBody').innerHTML;
assert(detailModalBody.includes('Không gian Tương tác Học sinh'), 'Khung tương tác học sinh xuất hiện trong chi tiết bài');
assert(detailModalBody.includes('BinhNgoDaiCao.pdf'), 'Tệp đính kèm BinhNgoDaiCao.pdf hiển thị sẵn sàng cho học sinh');

// Học sinh điền biểu mẫu nộp bài
studentSession.document.getElementById(`studentSubmissionName_${gvPost.code}`).value = 'Nhóm 3 - Lớp 11A1 (Lê Lợi, Mai Anh, Minh Đức)';
studentSession.document.getElementById(`studentSubmissionContent_${gvPost.code}`).value = 'Lời thoại Nguyễn Trãi đối đáp với tướng Minh: Nước Đại Việt ta từ trước vốn xưng nền văn hiến đã lâu...';

studentSession.submitStudentWork(gvPost.code);

const subAtStudent = studentSession.studentSubmissions[0];
assert(subAtStudent !== undefined, 'HS 1 đã nộp bài thành công: ' + subAtStudent.studentName);
assert(subAtStudent.status === 'PENDING', 'Trạng thái ban đầu: PENDING (Chờ chấm)');

// -------------------------------------------------------------
// GV 1 NHẬN ĐƯỢC BÀI NỘP CỦA HS 1 TỨC THÌ TẠI TAB GV 1
// -------------------------------------------------------------
console.log('\n5. Kiểm tra GV 1 nhận bài nộp của HS 1 theo thời gian thực (Tab 3):');
teacherSession.switchTeacherModalTab('submissions');

const subAtTeacher = teacherSession.studentSubmissions.find(s => s.id === subAtStudent.id);
assert(subAtTeacher !== undefined, 'GV 1 đã nhận được bài nộp của HS 1 trong hòm thư thời gian thực!');
assert(subAtTeacher.studentName === 'Nhóm 3 - Lớp 11A1 (Lê Lợi, Mai Anh, Minh Đức)', 'Tên nhóm học sinh đúng 100%.');
assert(subAtTeacher.content.includes('nền văn hiến đã lâu'), 'Nội dung kịch bản học sinh gửi hiển thị nguyên vẹn.');

// -------------------------------------------------------------
// GV 1 CHẤM ĐIỂM VÀ GỬI LỜI PHÊ CHO HỌC SINH
// -------------------------------------------------------------
console.log('\n6. GV 1 chấm điểm 10/10 và gửi nhận xét sư phạm:');
teacherSession.document.getElementById(`gradeInput_${subAtTeacher.id}`).value = '10/10 (Xuất sắc)';
teacherSession.document.getElementById(`feedbackInput_${subAtTeacher.id}`).value = 'Lời thoại rất hào hùng, bám sát tư tưởng nhân nghĩa của Nguyễn Trãi. Thầy khen ngợi nhóm!';

teacherSession.submitTeacherFeedback(subAtTeacher.id);
assert(subAtTeacher.status === 'GRADED', 'Bài nộp được cập nhật trạng thái: GRADED');

// -------------------------------------------------------------
// HS 1 NHẬN ĐƯỢC LỜI PHÊ VÀ ĐIỂM SỐ NGAY TRÊN MÀN HÌNH BÀI HỌC
// -------------------------------------------------------------
console.log('\n7. Kiểm tra HS 1 nhận được điểm số và lời phê của Thầy/Cô thời gian thực:');
const updatedSubAtStudent = studentSession.studentSubmissions.find(s => s.id === subAtStudent.id);
assert(updatedSubAtStudent.status === 'GRADED', 'Tab HS 1 ghi nhận bài đã được Thầy/Cô chấm điểm.');
assert(updatedSubAtStudent.teacherGrade === '10/10 (Xuất sắc)', 'Điểm số hiển thị đúng 10/10 (Xuất sắc).');
assert(updatedSubAtStudent.teacherFeedback.includes('bám sát tư tưởng nhân nghĩa'), 'Lời phê sư phạm hiển thị đầy đủ.');

// Toast báo điểm cho học sinh
const studentToasts = studentSession.document.getElementById('situationToastContainer')._children;
const gradeToast = studentToasts[studentToasts.length - 1].innerHTML;
assert(gradeToast.includes('THẦY/CÔ ĐÃ CHẤM ĐIỂM KỊCH BẢN'), 'Học sinh nhận được Toast thông báo có điểm số từ Thầy/Cô!');

// -------------------------------------------------------------
// HS 1 LƯU BÀI HỌC VÀO GÓC HỌC TẬP (BOOKMARK)
// -------------------------------------------------------------
console.log('\n8. HS 1 lưu bài học vào Góc học tập (Bookmark):');
studentSession.toggleStudentBookmark(gvPost.code);
assert(studentSession.isItemBookmarked(gvPost.code), 'Bài học được đánh dấu yêu thích ⭐ trong Góc học tập của học sinh.');

// -------------------------------------------------------------
// CHẠY THỬ MÔ PHỎNG TỰ ĐỘNG (runInteractiveSyncDemo)
// -------------------------------------------------------------
console.log('\n9. Kiểm thử tính năng Chạy mô phỏng tự động (runInteractiveSyncDemo):');
studentSession.runInteractiveSyncDemo();
const demoPost = studentSession.catalogData.find(i => i.code === '11.W99');
assert(demoPost !== undefined, 'Bài học mô phỏng demo (11.W99) được tạo tự động thành công.');
assert(demoPost.author === 'Thầy Nguyễn Hữu An', 'Tác giả bài mô phỏng đúng.');

console.log('\n================================================================');
console.log(`   🎉 KẾT QUẢ: ${passedChecks}/${totalChecks} KIỂM THỬ ĐÃ ĐẠT 100%!`);
console.log('   MỌI THỨ ĐÃ LIÊN THÔNG VỚI NHAU: GV ĐĂNG BÀI ↔ HS THẤY NGAY 100%!');
console.log('================================================================\n');
process.exit(0);
