const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'duan.html'), 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
let scriptCode = '';
if (scriptMatch) {
  scriptCode = scriptMatch[1];
} else {
  const jsFiles = ["data.js", "db.js", "sql-studio.js", "sync.js", "teacher.js", "app.js"];
  scriptCode = jsFiles.map(f => fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8')).join('\n;\n');
}

// Mock browser environment
const storage = {};
const sessionStore = {};
global.localStorage = {
  getItem: k => (k in storage ? storage[k] : null),
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: k => { delete storage[k]; },
  clear: () => { for (let k in storage) delete storage[k]; }
};

global.sessionStorage = {
  getItem: k => (k in sessionStore ? sessionStore[k] : null),
  setItem: (k, v) => { sessionStore[k] = String(v); },
  removeItem: k => { delete sessionStore[k]; },
  clear: () => { for (let k in sessionStore) delete sessionStore[k]; }
};

global.window = global;
global.window.addEventListener = () => {};
global.location = { reload: () => {} };

const elements = {};
const mockElement = (id = 'mock') => {
  if (elements[id]) return elements[id];
  const el = {
    id,
    value: '',
    textContent: '',
    innerHTML: '',
    style: {},
    checked: false,
    indeterminate: false,
    classList: {
      _classes: new Set(),
      add: (c) => el.classList._classes.add(c),
      remove: (c) => el.classList._classes.delete(c),
      toggle: (c) => {
        if (el.classList._classes.has(c)) {
          el.classList._classes.delete(c);
          return false;
        } else {
          el.classList._classes.add(c);
          return true;
        }
      },
      contains: (c) => el.classList._classes.has(c)
    },
    addEventListener: () => {},
    setAttribute: () => {},
    removeAttribute: () => {},
    focus: () => {},
    reset: () => {
      el.value = '';
    },
    appendChild: () => {},
    removeChild: () => {},
    click: () => {}
  };
  elements[id] = el;
  return el;
};

let lastDownloadedFileName = null;
global.document = {
  getElementById: id => mockElement(id),
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: tag => {
    const el = mockElement(tag);
    if (tag === 'a') {
      return {
        ...el,
        click: function() {
          lastDownloadedFileName = this.download;
        }
      };
    }
    return el;
  },
  body: mockElement('body')
};

global.alert = msg => {};
global.confirm = () => true;
global.Blob = class { constructor(parts, opts) { this.parts = parts; this.opts = opts; } };
global.URL = { createObjectURL: () => 'blob:mock-url', revokeObjectURL: () => {} };

// Run application
vm.runInThisContext(scriptCode);

console.log('======================================================');
console.log('   TEST TẢI LÊN BÀI ĐĂNG & LƯU TRỮ BỀN VỮNG (STORAGE)  ');
console.log('======================================================\n');

// 1. Xác thực giáo viên với key SU2026
isTeacherAuthenticated = true;
sessionTeacherKey = 'SU2026';

const initialTotal = catalogData.length;
console.log('Số bài ban đầu:', initialTotal);

// 2. Điền form tải lên bài học mới
document.getElementById('teacherGrade').value = '10';
document.getElementById('teacherTitle').value = 'Kháng chiến chống Tống lần thứ nhất (Năm 981)';
document.getElementById('teacherAuthor').value = 'Thầy Lê Văn Hùng';
document.getElementById('teacherSchool').value = 'THPT Chuyên Hà Nội - Amsterdam';
document.getElementById('teacherSummary').value = 'Tái hiện hội nghị quân sự Hoa Lư và chiến thắng Bạch Đằng - Tây Kết năm 981.';
document.getElementById('teacherExamCode').value = 'MD-10.981';
document.getElementById('teacherFileBase64').value = 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,UEsDBBQABgAIAAAAIQ...';
document.getElementById('teacherFileName').value = 'KichBan_KhangChienChongTong_981.docx';
document.getElementById('teacherFileSize').value = '45600';
document.getElementById('teacherFileType').value = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

// 3. Thực hiện lưu bài đăng
saveTeacherPost();

if (catalogData.length !== initialTotal + 1) {
  throw new Error('Bài đăng mới chưa được thêm vào catalogData!');
}

const uploadedPost = catalogData[0];
console.log('  ✓ Đã thêm bài mới thành công:');
console.log('    • Mã bài:', uploadedPost.code);
console.log('    • Mã đề:', uploadedPost.examCode);
console.log('    • Tiêu đề:', uploadedPost.lesson);
console.log('    • Tác giả:', uploadedPost.author);
console.log('    • Tệp đính kèm:', uploadedPost.fileName);

// 4. Kiểm tra lưu trữ trong localStorage
const savedPostsRaw = localStorage.getItem('situation_teacher_posts');
if (!savedPostsRaw) throw new Error('Chưa lưu situation_teacher_posts vào localStorage!');
const savedPosts = JSON.parse(savedPostsRaw);
if (!savedPosts.some(p => p.code === uploadedPost.code)) {
  throw new Error('Bài mới chưa có trong localStorage situation_teacher_posts!');
}
console.log('  ✓ Đã lưu bền vững vào localStorage (situation_teacher_posts)');

// 5. Kiểm tra tài liệu được lưu trong Kho tư liệu
const savedDocsRaw = localStorage.getItem('situation_teacher_docs');
if (!savedDocsRaw) throw new Error('Chưa lưu situation_teacher_docs vào localStorage!');
console.log('  ✓ Đã lưu tài liệu liên kết vào situation_teacher_docs');

// 6. Mô phỏng F5 / Tải lại trang (Reload Page)
console.log('\nMô phỏng Reload trang web:');
// Giả lập reset catalogData về dữ liệu gốc và gọi loadSavedTeacherPosts()
catalogData = catalogData.filter(i => i.code !== uploadedPost.code);
console.log('  -> Khi reset dữ liệu gốc: số bài =', catalogData.length);
loadSavedTeacherPosts();
if (!catalogData.some(i => i.code === uploadedPost.code)) {
  throw new Error('Sau khi reload, bài đăng không được nạp lại từ localStorage!');
}
console.log('  ✓ [PASS] Sau khi reload trang, bài đăng tự động nạp lại đầy đủ 100%! Tổng số bài:', catalogData.length);

// 7. Kiểm tra tính năng Tải về (Download) cho bài vừa tải lên với đầy đủ các định dạng
openDownloadFormatModal(uploadedPost.code);
executeDownloadSelectedFormat('docx');
console.log('  ✓ Tải về bài vừa đăng dưới dạng .docx:', lastDownloadedFileName);
if (!lastDownloadedFileName.includes(uploadedPost.code) && !lastDownloadedFileName.includes('981')) {
  throw new Error('Tên tệp tải về không khớp bài đăng!');
}

executeDownloadSelectedFormat('txt');
console.log('  ✓ Tải về bài vừa đăng dưới dạng .txt:', lastDownloadedFileName);

executeDownloadSelectedFormat('html');
console.log('  ✓ Tải về bài vừa đăng dưới dạng .html:', lastDownloadedFileName);

// 8. Kiểm tra chỉnh sửa bài đăng
document.getElementById('teacherEditCode').value = uploadedPost.code;
document.getElementById('teacherGrade').value = '10';
document.getElementById('teacherTitle').value = 'Chiến thắng Bạch Đằng - Tây Kết năm 981 (Cập nhật)';
document.getElementById('teacherAuthor').value = 'Thầy Lê Văn Hùng (Cập nhật)';
saveTeacherPost();

const updatedItem = catalogData.find(i => i.code === uploadedPost.code);
if (!updatedItem.lesson.includes('(Cập nhật)')) {
  throw new Error('Chỉnh sửa bài đăng chưa được cập nhật!');
}
console.log('  ✓ [PASS] Tính năng chỉnh sửa bài đã lưu hoạt động chính xác.');

// 9. Dọn dẹp test
deleteTeacherPost(uploadedPost.code);
console.log('  ✓ [PASS] Xóa bài test thành công.');

console.log('\n======================================================');
console.log('   🎉 TOÀN BỘ QUY TRÌNH TẢI LÊN & LƯU TRỮ ĐẠT 100%!  ');
console.log('======================================================\n');
