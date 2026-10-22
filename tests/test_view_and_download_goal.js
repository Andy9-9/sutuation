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
    reset: () => { el.value = ''; },
    appendChild: () => {},
    removeChild: () => {},
    click: () => {},
    scrollIntoView: () => {}
  };
  elements[id] = el;
  return el;
};

let lastDownloadedFileName = null;
let lastDownloadedHref = null;
let revokedBlobUrls = [];

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
global.URL = {
  createObjectURL: (b) => 'blob:mock-uuid-' + Math.random().toString(36).slice(2),
  revokeObjectURL: (u) => { revokedBlobUrls.push(u); }
};

// Run application
vm.runInThisContext(scriptCode);

console.log('================================================================');
console.log('   KIỂM THỬ TOÀN DIỆN MỤC TIÊU /goal: ĐĂNG BÀI - XEM - TẢI VỀ');
console.log('================================================================\n');

isTeacherAuthenticated = true;
sessionTeacherKey = 'SU2026';

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

// -----------------------------------------------------------
// TEST 1: ĐĂNG TỆP PDF (1.pdf) -> XEM ĐƯỢC -> TẢI VỀ ĐƯỢC ĐÚNG 1.pdf
// -----------------------------------------------------------
console.log('1. Kiểm thử Đăng bài, Xem trước & Tải về tệp PDF (1.pdf):');
document.getElementById('teacherGrade').value = '11';
document.getElementById('teacherTitle').value = 'Kháng chiến chống Tống (Lý Thường Kiệt)';
document.getElementById('teacherAuthor').value = 'Thầy Trần Văn C';
document.getElementById('teacherSchool').value = 'THPT Chuyên Hà Nội - Amsterdam';
document.getElementById('teacherSummary').value = 'Bài thơ thần Nam quốc sơn hà và trận chiến bên phòng tuyến sông Như Nguyệt.';
document.getElementById('teacherExamCode').value = 'MD-PDF-1077';
document.getElementById('teacherFileBase64').value = 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKNyAwIG9iago8PAovVHlwZSAvUGFnZXMKL0NvdW50IDEKL0tpZHMgWyA0IDAgUiBdCj4+CmVuZG9iag==';
document.getElementById('teacherFileName').value = '1.pdf';
document.getElementById('teacherFileSize').value = '204800';
document.getElementById('teacherFileType').value = 'application/pdf';

saveTeacherPost();

const pdfItem = catalogData.find(i => i.fileName === '1.pdf');
assert(pdfItem !== undefined, 'Bài đăng đã lưu trữ thành công với tệp 1.pdf');
assert(pdfItem.format === 'Tài liệu PDF', 'Nhận diện định dạng chuẩn: Tài liệu PDF');

// Xem bài đăng trong Modal chi tiết (openDetailModal)
openDetailModal(pdfItem.code);
const detailBody = document.getElementById('detailModalBody').innerHTML;
assert(detailBody.includes('👁️ Xem tệp 1.pdf'), 'Nút "👁️ Xem tệp 1.pdf" xuất hiện trong Modal chi tiết');
assert(detailBody.includes('⬇️ Tải tệp 1.pdf'), 'Nút "⬇️ Tải tệp 1.pdf" xuất hiện trong Modal chi tiết');
assert(detailBody.includes('detailFileInlinePreview'), 'Thẻ khung chứa xem trước inline #detailFileInlinePreview sẵn sàng');

// Thao tác xem tệp PDF
viewUploadedItemFile(pdfItem.code);
const previewBox = document.getElementById('detailFileInlinePreview');
const previewContent = document.getElementById('detailPreviewContent').innerHTML;
assert(previewBox.style.display === 'block', 'Khung xem trước hiển thị trực quan (style.display = block)');
assert(previewContent.includes('<iframe') && previewContent.includes('title="Xem trước PDF"'), 'Trình nhúng iframe chuẩn PDF đã nạp vào xem trước');
assert(previewContent.includes('1.pdf'), 'Tên tệp 1.pdf hiển thị chính xác trong giao diện xem');

// Đóng modal chi tiết -> phải dọn dẹp preview & revoke blob
closeDetailModal();
assert(previewBox.style.display === 'none', 'Đóng modal thì tắt khung xem trước để giải phóng bộ nhớ');

// Tải về trực tiếp 1.pdf
exportLessonOriginalFile(pdfItem);
assert(lastDownloadedFileName === '1.pdf', 'Tải trực tiếp nhận đúng tệp: ' + lastDownloadedFileName);
assert(lastDownloadedHref.startsWith('blob:mock-uuid-'), 'Tải về thông qua đối tượng nhị phân Blob an toàn 100%');

// Mở modal hỏi tải về bằng gì -> bấm xem trước từ modal
openDownloadFormatModal(pdfItem.code);
const bannerInModal = document.getElementById('downloadUploadedFileBanner');
assert(bannerInModal.style.display === 'flex', 'Modal hỏi định dạng nhận diện có tệp tải lên và hiển thị Banner nổi bật');
assert(document.getElementById('downloadUploadedFileName').textContent === '1.pdf', 'Tên tệp trên Banner hiển thị đúng 1.pdf');

// Bấm xem tệp trước từ Modal hỏi định dạng
previewCurrentDownloadTargetFile();
assert(document.getElementById('detailModal').classList.contains('open'), 'Bấm xem từ hộp thoại định dạng tự động điều hướng sang màn hình xem');

// Tải về từ modal định dạng
openDownloadFormatModal(pdfItem.code);
executeDownloadSelectedFormat('original');
assert(lastDownloadedFileName === '1.pdf', 'Tải qua nút tệp gốc của modal định dạng trả về đúng 1.pdf');

// -----------------------------------------------------------
// TEST 2: ĐĂNG TỆP WORD (.DOCX) -> XEM ĐƯỢC -> TẢI VỀ ĐƯỢC ĐÚNG .DOCX
// -----------------------------------------------------------
console.log('\n2. Kiểm thử Đăng bài, Xem trước & Tải về tệp Word (.docx):');
document.getElementById('teacherGrade').value = '10';
document.getElementById('teacherTitle').value = 'Chiến dịch Điện Biên Phủ 1954';
document.getElementById('teacherAuthor').value = 'Thầy Lê Hoàng';
document.getElementById('teacherSchool').value = 'THPT Chu Văn An';
document.getElementById('teacherSummary').value = 'Kịch bản phân cảnh kéo pháo và 56 ngày đêm khoét núi ngủ hầm.';
document.getElementById('teacherExamCode').value = 'MD-DOCX-1954';
document.getElementById('teacherFileBase64').value = 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,UEsDBBQABgAIAAAAIQAAAA==';
document.getElementById('teacherFileName').value = 'KichBan_DienBienPhu.docx';
document.getElementById('teacherFileSize').value = '1048576';
document.getElementById('teacherFileType').value = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

saveTeacherPost();

const docxItem = catalogData.find(i => i.fileName === 'KichBan_DienBienPhu.docx');
assert(docxItem !== undefined, 'Đã lưu trữ thành công bài đăng Word KichBan_DienBienPhu.docx');
assert(docxItem.format === 'Kịch bản Word (.docx)', 'Định dạng chuẩn xác: Kịch bản Word (.docx)');

openDetailModal(docxItem.code);
viewUploadedItemFile(docxItem.code);
const docxPreviewContent = document.getElementById('detailPreviewContent').innerHTML;
assert(docxPreviewContent.includes('KichBan_DienBienPhu.docx'), 'Giao diện xem trước nhận diện đúng tệp Word KichBan_DienBienPhu.docx');
assert(docxPreviewContent.includes('Microsoft Word'), 'Hiển thị thẻ tài liệu Word đầy đủ thông tin');

exportLessonOriginalFile(docxItem);
assert(lastDownloadedFileName === 'KichBan_DienBienPhu.docx', 'Tải về đúng tệp Word nguyên bản: ' + lastDownloadedFileName);

// -----------------------------------------------------------
// TEST 3: ĐĂNG TỆP TEXT (.TXT) -> XEM ĐƯỢC -> TẢI VỀ ĐƯỢC ĐÚNG .TXT
// -----------------------------------------------------------
console.log('\n3. Kiểm thử Đăng bài, Xem trước & Tải về tệp Văn bản thuần (.txt):');
const sampleText = 'CANH 1: HOP BO CHINH TRI DINH DANG CON BAC TAY NGUYEN 1975\nDai tuong Vo Nguyen Giap chu tri...';
const b64Text = Buffer.from(sampleText, 'utf8').toString('base64');

document.getElementById('teacherGrade').value = '12';
document.getElementById('teacherTitle').value = 'Chiến dịch Tây Nguyên 1975';
document.getElementById('teacherAuthor').value = 'Nhóm Sử 12';
document.getElementById('teacherSchool').value = 'THPT Lê Quý Đôn';
document.getElementById('teacherSummary').value = 'Toàn văn kịch bản thoại dạng text thuần túy.';
document.getElementById('teacherExamCode').value = 'MD-TXT-1975';
document.getElementById('teacherFileBase64').value = 'data:text/plain;base64,' + b64Text;
document.getElementById('teacherFileName').value = 'kich_ban_tay_nguyen.txt';
document.getElementById('teacherFileSize').value = '5120';
document.getElementById('teacherFileType').value = 'text/plain';

saveTeacherPost();

const txtItem = catalogData.find(i => i.fileName === 'kich_ban_tay_nguyen.txt');
assert(txtItem !== undefined, 'Đã lưu trữ thành công bài đăng Text kich_ban_tay_nguyen.txt');
assert(txtItem.format === 'Văn bản Text (.txt)', 'Định dạng chuẩn xác: Văn bản Text (.txt)');

openDetailModal(txtItem.code);
viewUploadedItemFile(txtItem.code);
const txtPreviewContent = document.getElementById('detailPreviewContent').innerHTML;
assert(txtPreviewContent.includes('CANH 1: HOP BO CHINH TRI'), 'Nội dung văn bản thuần xem trực tiếp trên màn hình đầy đủ');
assert(txtPreviewContent.includes('kich_ban_tay_nguyen.txt'), 'Hiển thị đúng tên tệp txt');

exportLessonOriginalFile(txtItem);
assert(lastDownloadedFileName === 'kich_ban_tay_nguyen.txt', 'Tải về đúng tệp Text nguyên bản: ' + lastDownloadedFileName);

// -----------------------------------------------------------
// TEST 4: KHO TÀI LIỆU SỐ HÓA - XEM VÀ TẢI TỆP NGUYÊN BẢN
// -----------------------------------------------------------
console.log('\n4. Kiểm thử Kho tài liệu số hóa: Xem trực tiếp & Tải tệp nguyên bản:');
const linkedDoc = documentStore.find(d => d.fileName === '1.pdf');
assert(linkedDoc !== undefined, 'Tài liệu số hóa 1.pdf đã tự động lưu trong documentStore');

previewDocument(linkedDoc.id);
const docPreviewBody = document.getElementById('previewDocBody').innerHTML;
assert(docPreviewBody.includes('<iframe') && docPreviewBody.includes('1.pdf'), 'Kho tài liệu mở được xem trước PDF qua iframe');
assert(docPreviewBody.includes('Tải tệp 1.pdf'), 'Có nút tải đúng tên tệp 1.pdf trong Kho tài liệu');

exportDocStoreOriginalFile(linkedDoc);
assert(lastDownloadedFileName === '1.pdf', 'Kho tài liệu tải về đúng tệp nguyên bản: ' + lastDownloadedFileName);

closeDocPreviewModal();

// -----------------------------------------------------------
// TEST 5: DANH SÁCH BÀI ĐĂNG CỦA GIÁO VIÊN (TAB QUẢN LÝ)
// -----------------------------------------------------------
console.log('\n5. Kiểm thử Tab Quản lý bài đăng giáo viên:');
renderTeacherPostsManageList();
const manageHtml = document.getElementById('teacherPostsManageList').innerHTML;
assert(manageHtml.includes('👁️ Xem'), 'Mỗi bài trong bảng quản lý có nút "👁️ Xem" để xem bài và tệp');
assert(manageHtml.includes('1.pdf'), 'Hiển thị đúng tên tệp đính kèm 1.pdf');
assert(manageHtml.includes('KichBan_DienBienPhu.docx'), 'Hiển thị đúng tên tệp KichBan_DienBienPhu.docx');
assert(manageHtml.includes('kich_ban_tay_nguyen.txt'), 'Hiển thị đúng tên tệp kich_ban_tay_nguyen.txt');

// -----------------------------------------------------------
// TEST 6: LƯU TRỮ VÀ KHÔI PHỤC STORAGE
// -----------------------------------------------------------
console.log('\n6. Kiểm thử tính năng lưu trữ & khôi phục (Persistence):');
saveTeacherPostsToStorage();
const rawStorage = localStorage.getItem('situation_teacher_posts');
assert(rawStorage && rawStorage.length > 0, 'Dữ liệu bài đăng đã lưu an toàn vào localStorage');
const parsed = JSON.parse(rawStorage);
assert(parsed.some(p => p.fileName === '1.pdf'), 'Tệp 1.pdf được lưu trọn vẹn trong Storage');
assert(parsed.some(p => p.fileName === 'KichBan_DienBienPhu.docx'), 'Tệp docx được lưu trọn vẹn trong Storage');

console.log('\n================================================================');
console.log(`   🎉 KẾT QUẢ: ${passedChecks}/${totalChecks} KIỂM THỬ ĐÃ ĐẠT 100%!`);
console.log('   TÍNH NĂNG ĐĂNG BÀI - XEM TỆP - TẢI VỀ KHÔNG LỖI ĐÃ HOÀN TẤT!');
console.log('================================================================\n');
