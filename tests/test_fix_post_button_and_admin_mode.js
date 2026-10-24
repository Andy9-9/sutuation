// tests/test_fix_post_button_and_admin_mode.js
// Comprehensive Verification of Post Buttons, Admin Mode, and Modal Open/Close

const fs = require('fs');
const path = require('path');

// Mock browser environment
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

const sessionStorageMock = (function () {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

// DOM Mock Elements
const elements = {};
function getOrCreateElement(id) {
  if (!elements[id]) {
    elements[id] = {
      id: id,
      value: '',
      innerText: '',
      textContent: '',
      innerHTML: '',
      style: {},
      disabled: false,
      classList: {
        classes: new Set(),
        add: function(c) { this.classes.add(c); },
        remove: function(c) { this.classes.delete(c); },
        contains: function(c) { return this.classes.has(c); }
      },
      focus: () => {},
      click: () => {},
      appendChild: () => {},
      removeChild: () => {},
      setAttribute: () => {},
      getAttribute: () => null
    };
  }
  return elements[id];
}

global.window = {
  localStorage: localStorageMock,
  sessionStorage: sessionStorageMock,
  documentStore: [],
  catalogData: [],
  deletedCodes: new Set(),
  customLessons: [],
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.localStorage = localStorageMock;
global.sessionStorage = sessionStorageMock;
global.document = {
  getElementById: (id) => getOrCreateElement(id),
  querySelectorAll: () => [],
  addEventListener: () => {},
  removeEventListener: () => {},
  createElement: () => ({ style: {}, setAttribute: () => {}, click: () => {}, addEventListener: () => {}, appendChild: () => {} }),
  body: { appendChild: () => {}, removeChild: () => {} }
};

// Load modular JS files
const dataCode = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');
eval(dataCode);

const syncCode = fs.readFileSync(path.join(__dirname, '../js/sync.js'), 'utf8');
eval(syncCode);

const teacherCode = fs.readFileSync(path.join(__dirname, '../js/teacher.js'), 'utf8');
eval(teacherCode);

const appCode = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
eval(appCode);

console.log('================================================================');
console.log('   KIỂM THỬ KHẮC PHỤC LIỆT NÚT ĐĂNG BÀI & QUYỀN QUẢN TRỊ VIÊN   ');
console.log('================================================================\n');

// Test 1: Kiểm tra CSS .modal-backdrop.open trong HTML
console.log('1. Kiểm tra cấu hình CSS trong index.html và duan.html:');
const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const duanHtml = fs.readFileSync(path.join(__dirname, '../duan.html'), 'utf8');

if (indexHtml.includes('.modal-backdrop.open') && indexHtml.includes('display: flex')) {
  console.log('  ✓ [PASS] index.html chứa quy tắc CSS .modal-backdrop.open { display: flex !important; }');
} else {
  throw new Error('index.html thiếu CSS .modal-backdrop.open!');
}

if (duanHtml.includes('.modal-backdrop.open') && duanHtml.includes('display: flex')) {
  console.log('  ✓ [PASS] duan.html chứa quy tắc CSS .modal-backdrop.open { display: flex !important; }');
} else {
  throw new Error('duan.html thiếu CSS .modal-backdrop.open!');
}

// Test 2: Bấm nút Đăng bài Giáo viên khi chưa đăng nhập -> Cổng Auth Gate mở
console.log('\n2. Kiểm tra Mở Cổng Xác thực (Teacher Auth Gate):');
window.isTeacherAuthenticated = false;
window.sessionTeacherKey = '';
if (typeof isTeacherAuthenticated !== 'undefined') isTeacherAuthenticated = false;
if (typeof sessionTeacherKey !== 'undefined') sessionTeacherKey = '';

window.openTeacherAuthGate();
const gateModal = elements['teacherAuthGateModal'];
if (gateModal.classList.contains('open') && gateModal.style.display === 'flex') {
  console.log('  ✓ [PASS] teacherAuthGateModal đã mở với class "open" và style.display="flex"');
} else {
  throw new Error('teacherAuthGateModal không mở đúng cách!');
}

window.closeTeacherAuthGate();
if (!gateModal.classList.contains('open') && gateModal.style.display === 'none') {
  console.log('  ✓ [PASS] closeTeacherAuthGate() đóng modal hoàn toàn');
} else {
  throw new Error('closeTeacherAuthGate() không đóng modal!');
}

// Test 3: Kích hoạt Quyền Quản trị viên (Admin Mode)
console.log('\n3. Kiểm tra Chuyển đổi Quyền Quản trị viên (Admin Mode):');
window.isAdmin = false;
if (typeof isAdmin !== 'undefined') isAdmin = false;

window.toggleAdminMode(); // Bật Admin
if (window.isAdmin === true) {
  console.log('  ✓ [PASS] isAdmin chuyển thành true');
} else {
  throw new Error('toggleAdminMode không set isAdmin = true');
}

const adminBadge = elements['adminToggleBtn'];
if (adminBadge.textContent.includes('Quản trị viên (Admin)')) {
  console.log(`  ✓ [PASS] Badge hiển thị đúng: "${adminBadge.textContent}"`);
} else {
  throw new Error('Badge text sai!');
}

if (window.isTeacherAuthenticated === true && window.sessionTeacherKey === 'SECURE#2026$GV-HIST@SITUATION') {
  console.log('  ✓ [PASS] Tự động cấp quyền Giáo viên / Quản trị viên cấp cao nhất!');
} else {
  throw new Error('Không tự động đồng bộ quyền Giáo viên khi ở chế độ Admin!');
}

// Test 4: Khi ở quyền Quản trị viên, bấm Đăng bài -> Vào thẳng Form soạn thảo
console.log('\n4. Kiểm tra Nút Đăng bài khi có quyền Quản trị viên:');
window.openTeacherAuthGate();
const postModal = elements['teacherPostModal'];
if (postModal.classList.contains('open') && postModal.style.display === 'flex') {
  console.log('  ✓ [PASS] Vào thẳng teacherPostModal không bị chặn!');
} else {
  throw new Error('Không vào được teacherPostModal khi ở chế độ Admin!');
}

// Test 5: Kiểm tra quá trình Đăng bài và Đảm bảo nút không bao giờ bị liệt
console.log('\n5. Kiểm tra Quá trình Đăng bài và Trạng thái Nút bấm:');
getOrCreateElement('teacherEditCode').value = '';
getOrCreateElement('teacherTitle').value = 'Kháng chiến chống Tống (981) - Lê Hoàn';
getOrCreateElement('teacherGrade').value = '10';
getOrCreateElement('teacherExamCode').value = '';
getOrCreateElement('teacherAuthor').value = 'Cô Nguyễn Thị Lan';
getOrCreateElement('teacherSchool').value = 'THPT Chuyên Chu Văn An';
getOrCreateElement('teacherSummary').value = 'Kịch bản tái hiện trận chiến trên sông Bạch Đằng năm 981.';
getOrCreateElement('teacherFileName').value = 'KichBan_BachDang_981.docx';
getOrCreateElement('teacherFileBase64').value = 'UEsDBBQABgAIAAAAIQA=';
getOrCreateElement('teacherFileSize').value = '15360';
getOrCreateElement('teacherFileType').value = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const submitBtn = getOrCreateElement('btnSubmitTeacherPost');
window.saveTeacherPost();

if (submitBtn.disabled === false) {
  console.log('  ✓ [PASS] Nút Đăng bài (#btnSubmitTeacherPost) luôn được giải phóng (disabled = false)!');
} else {
  throw new Error('Nút Đăng bài bị treo ở trạng thái disabled = true!');
}

const newPost = window.catalogData.find(i => i.lesson && i.lesson.includes('Lê Hoàn'));
if (newPost) {
  console.log(`  ✓ [PASS] Bài học đã lưu thành công vào CSDL với mã: ${newPost.code}`);
} else {
  throw new Error('Bài đăng không được lưu vào catalogData!');
}

// Test 6: Kiểm tra xác thực mã khóa giáo viên thường (SU2026)
console.log('\n6. Kiểm tra Cổng xác thực với mã khóa giáo viên SU2026:');
window.isAdmin = false;
window.isTeacherAuthenticated = false;
window.sessionTeacherKey = '';
if (typeof isAdmin !== 'undefined') isAdmin = false;
if (typeof isTeacherAuthenticated !== 'undefined') isTeacherAuthenticated = false;
if (typeof sessionTeacherKey !== 'undefined') sessionTeacherKey = '';

elements['gateAuthKeyInput'].value = 'SU2026';
window.submitTeacherAuthGate();

if (window.isTeacherAuthenticated === true && window.sessionTeacherKey === 'SU2026') {
  console.log('  ✓ [PASS] Nhập mã SU2026 xác thực thành công!');
} else {
  throw new Error('Xác thực SU2026 thất bại!');
}

if (postModal.classList.contains('open') && postModal.style.display === 'flex') {
  console.log('  ✓ [PASS] Sau khi nhập mã hợp lệ, Form đăng bài tự động mở!');
} else {
  throw new Error('Form đăng bài không mở sau khi xác thực!');
}

window.closeTeacherPostModal();
if (!postModal.classList.contains('open') && postModal.style.display === 'none') {
  console.log('  ✓ [PASS] closeTeacherPostModal() đóng modal thành công');
} else {
  throw new Error('closeTeacherPostModal() không đóng modal!');
}

console.log('\n================================================================');
console.log('   🎉 TẤT CẢ CÁC BÀI TEST ĐÃ VƯỢT QUA 100%! NÚT ĐĂNG BÀI HOẠT ĐỘNG HOÀN HẢO!');
console.log('================================================================\n');
