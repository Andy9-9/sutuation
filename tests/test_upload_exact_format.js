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
let lastDownloadedHref = null;
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
          lastDownloadedHref = this.href;
        }
      };
    }
    return el;
  },
  body: mockElement('body')
};

global.alert = () => {};
global.confirm = () => true;
global.Blob = class { constructor(parts, opts) { this.parts = parts; this.opts = opts; } };
global.URL = { createObjectURL: () => 'blob:mock-url', revokeObjectURL: () => {} };

// Run application
vm.runInThisContext(scriptCode);

console.log('======================================================');
console.log('   TEST TẢI LÊN ĐỊNH DẠNG NÀO -> TẢI VỀ ĐÚNG ĐỊNH DẠNG ĐÓ');
console.log('======================================================\n');

// 1. Xác thực giáo viên
isTeacherAuthenticated = true;
sessionTeacherKey = 'SU2026';

// 2. Tải lên tệp 1.pdf
console.log('1. Kiểm thử tải lên tệp 1.pdf:');
document.getElementById('teacherGrade').value = '11';
document.getElementById('teacherTitle').value = 'Chiến thắng Ngọc Hồi - Đống Đa';
document.getElementById('teacherAuthor').value = 'Cô Nguyễn Thị Mai';
document.getElementById('teacherSchool').value = 'THPT Chu Văn An';
document.getElementById('teacherSummary').value = 'Kịch bản hành quân thần tốc của vua Quang Trung mùa xuân Kỷ Dậu 1789.';
document.getElementById('teacherExamCode').value = 'MD-11.1789';
document.getElementById('teacherFileBase64').value = 'data:application/pdf;base64,JVBERi0xLjQKJUZha2VQZGY...';
document.getElementById('teacherFileName').value = '1.pdf';
document.getElementById('teacherFileSize').value = '154200';
document.getElementById('teacherFileType').value = 'application/pdf';

saveTeacherPost();

const pdfPost = catalogData[0];
if (!pdfPost || pdfPost.fileName !== '1.pdf') {
  throw new Error('Lỗi: Bài đăng không lưu đúng tệp 1.pdf!');
}
if (pdfPost.format !== 'Tài liệu PDF') {
  throw new Error(`Lỗi: Format mong đợi 'Tài liệu PDF', nhận được: ${pdfPost.format}`);
}
console.log('  ✓ Đã lưu bài đăng với format chuẩn:', pdfPost.format);
console.log('  ✓ Tên file lưu trữ:', pdfPost.fileName);

// 3. Mở hộp thoại tải về
openDownloadFormatModal(pdfPost.code);
const banner = document.getElementById('downloadUploadedFileBanner');
const bannerName = document.getElementById('downloadUploadedFileName');
const bannerBadge = document.getElementById('downloadUploadedFileBadge');

if (banner.style.display !== 'flex') {
  throw new Error('Lỗi: Banner tệp gốc đã tải lên không hiển thị!');
}
if (bannerName.textContent !== '1.pdf') {
  throw new Error(`Lỗi: Tên file trên banner sai: ${bannerName.textContent}`);
}
if (bannerBadge.textContent !== 'PDF') {
  throw new Error(`Lỗi: Badge format trên banner sai: ${bannerBadge.textContent}`);
}
console.log('  ✓ Banner nổi bật tệp gốc hiển thị chuẩn xác: 1.pdf (PDF)');

// 4. Tải về qua 'original'
lastDownloadedFileName = null;
executeDownloadSelectedFormat('original');
if (lastDownloadedFileName !== '1.pdf') {
  throw new Error(`Lỗi tải original: mong đợi '1.pdf', nhận được '${lastDownloadedFileName}'`);
}
console.log('  ✓ Tải về qua nút Tệp gốc: download thành công đúng', lastDownloadedFileName);

// 5. Tải về khi người dùng chọn 'pdf' trong hộp thoại
openDownloadFormatModal(pdfPost.code);
lastDownloadedFileName = null;
executeDownloadSelectedFormat('pdf');
if (lastDownloadedFileName !== '1.pdf') {
  throw new Error(`Lỗi tải format 'pdf': mong đợi '1.pdf', nhận được '${lastDownloadedFileName}'`);
}
console.log('  ✓ Tải về khi chọn định dạng .pdf trong modal: download thành công đúng', lastDownloadedFileName);

// 6. Tải trực tiếp bằng exportLessonOriginalFile
lastDownloadedFileName = null;
exportLessonOriginalFile(pdfPost);
if (lastDownloadedFileName !== '1.pdf') {
  throw new Error(`Lỗi exportLessonOriginalFile: mong đợi '1.pdf', nhận được '${lastDownloadedFileName}'`);
}
console.log('  ✓ Tải trực tiếp từ Chi tiết bài học (exportLessonOriginalFile): download thành công đúng', lastDownloadedFileName);

// 7. Kiểm tra trong Kho tài liệu (documentStore)
const linkedDoc = documentStore.find(d => d.code === pdfPost.code);
if (!linkedDoc || linkedDoc.format !== 'PDF') {
  throw new Error('Lỗi: Hồ sơ trong Kho tư liệu không nhận đúng format PDF!');
}
lastDownloadedFileName = null;
exportDocStoreOriginalFile(linkedDoc);
if (lastDownloadedFileName !== '1.pdf') {
  throw new Error(`Lỗi exportDocStoreOriginalFile: mong đợi '1.pdf', nhận được '${lastDownloadedFileName}'`);
}
console.log('  ✓ Kho tài liệu số hóa: tải tệp gốc liên kết nhận đúng', lastDownloadedFileName);

// 8. Thử tải lên tệp .docx và tải về
console.log('\n2. Kiểm thử tải lên tệp de_thi_12.docx:');
document.getElementById('teacherGrade').value = '12';
document.getElementById('teacherTitle').value = 'Điện Biên Phủ trên không 1972';
document.getElementById('teacherAuthor').value = 'Thầy Trần Quốc Tuấn';
document.getElementById('teacherSchool').value = 'THPT Quốc Học';
document.getElementById('teacherSummary').value = 'Kịch bản 12 ngày đêm khói lửa bảo vệ bầu trời Hà Nội.';
document.getElementById('teacherExamCode').value = 'MD-12.1972';
document.getElementById('teacherFileBase64').value = 'data:application/vnd.openxmlformats-officedocument...';
document.getElementById('teacherFileName').value = 'de_thi_12.docx';
document.getElementById('teacherFileSize').value = '89000';
document.getElementById('teacherFileType').value = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

saveTeacherPost();
const docxPost = catalogData[0];
openDownloadFormatModal(docxPost.code);
lastDownloadedFileName = null;
executeDownloadSelectedFormat('docx');
if (lastDownloadedFileName !== 'de_thi_12.docx') {
  throw new Error(`Lỗi: mong đợi 'de_thi_12.docx', nhận được '${lastDownloadedFileName}'`);
}
console.log('  ✓ Tải lên de_thi_12.docx -> Tải về định dạng DOCX nhận đúng:', lastDownloadedFileName);

// 9. Thử tải lên tệp .txt và tải về
console.log('\n3. Kiểm thử tải lên tệp kich_ban.txt:');
document.getElementById('teacherGrade').value = '10';
document.getElementById('teacherTitle').value = 'Nhà nước Văn Lang - Âu Lạc';
document.getElementById('teacherAuthor').value = 'Cô Lê Thị Lan';
document.getElementById('teacherSchool').value = 'THPT Trần Phú';
document.getElementById('teacherSummary').value = 'Kịch bản truyền thuyết An Dương Vương.';
document.getElementById('teacherExamCode').value = 'MD-10.AVL';
document.getElementById('teacherFileBase64').value = 'data:text/plain;base64,VGjhuqFpIHPhu60gY8O0bmc...';
document.getElementById('teacherFileName').value = 'kich_ban.txt';
document.getElementById('teacherFileSize').value = '12000';
document.getElementById('teacherFileType').value = 'text/plain';

saveTeacherPost();
const txtPost = catalogData[0];
openDownloadFormatModal(txtPost.code);
lastDownloadedFileName = null;
executeDownloadSelectedFormat('txt');
if (lastDownloadedFileName !== 'kich_ban.txt') {
  throw new Error(`Lỗi: mong đợi 'kich_ban.txt', nhận được '${lastDownloadedFileName}'`);
}
console.log('  ✓ Tải lên kich_ban.txt -> Tải về định dạng TXT nhận đúng:', lastDownloadedFileName);

// 10. Dọn sạch bài test
deleteTeacherPost(pdfPost.code);
deleteTeacherPost(docxPost.code);
deleteTeacherPost(txtPost.code);

console.log('\n======================================================');
console.log('   🎉 100% CÁC KIỂM THỬ ĐỊNH DẠNG FILE ĐÃ VƯỢT QUA!');
console.log('   TẢI LÊN BẰNG CÁI GÌ (VD: 1.pdf) -> DOWNLOAD VỀ ĐÚNG CÁI ĐÓ (1.pdf)!');
console.log('======================================================\n');
