// tests/test_real_data_inventory.js
// Automated verification of Real Data Inventory & Metrics Calculation

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

global.window = {
  localStorage: localStorageMock,
  documentStore: [],
  catalogData: [],
  deletedCodes: new Set(),
  customLessons: [],
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.localStorage = localStorageMock;
global.document = {
  getElementById: (id) => ({
    innerText: '',
    textContent: '',
    innerHTML: '',
    style: {},
    classList: { add: () => {}, remove: () => {} },
    appendChild: () => {}
  }),
  querySelectorAll: () => [],
  addEventListener: () => {},
  removeEventListener: () => {},
  createElement: () => ({ style: {}, setAttribute: () => {}, click: () => {} }),
  body: { appendChild: () => {}, removeChild: () => {} }
};
let lastBlobContent = '';
global.URL = { createObjectURL: () => 'blob:mock', revokeObjectURL: () => {} };
global.Blob = class {
  constructor(parts) {
    this.parts = parts;
    lastBlobContent = parts.join('');
  }
};

// Load data.js
const dataCode = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');
eval(dataCode);

// Load app.js
const appCode = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
eval(appCode);

console.log('================================================================');
console.log('   KIỂM THỬ TÍNH NĂNG KIỂM KÊ SỐ LIỆU THẬT & BẢNG THỐNG KÊ      ');
console.log('================================================================\n');

// Test 1: calculateRealMetrics()
console.log('1. Kiểm thử calculateRealMetrics():');
const metrics = window.calculateRealMetrics();

if (metrics.totalLessons === 42) {
  console.log(`  ✓ Tổng số bài học SGK thực tế: ${metrics.totalLessons} bài (14 Khối 10, 14 Khối 11, 14 Khối 12)`);
} else {
  throw new Error(`Sai tổng số bài học: ${metrics.totalLessons}`);
}

if (metrics.examCodeRate === 100 && metrics.examCodeCount === 42) {
  console.log(`  ✓ Chuẩn hóa mã đề thi: 100% (${metrics.examCodeCount}/${metrics.totalLessons} bài)`);
} else {
  throw new Error(`Sai tỷ lệ mã đề: ${metrics.examCodeRate}%, count: ${metrics.examCodeCount}`);
}

if (metrics.totalDocs === 14) {
  console.log(`  ✓ Kho hồ sơ tư liệu số hóa: ${metrics.totalDocs} tài liệu độc lập`);
} else {
  throw new Error(`Sai số lượng tài liệu: ${metrics.totalDocs}`);
}

if (metrics.allCharactersList.length === 88) {
  console.log(`  ✓ Hồ sơ nhân vật & vai diễn lịch sử: ${metrics.allCharactersList.length} nhân vật`);
  console.log(`    • Nhân vật chính sử xác thực: ${metrics.historicalFactCount}`);
  console.log(`    • Vai diễn kịch bản hóa sáng tạo: ${metrics.creativeCount}`);
} else {
  throw new Error(`Sai số nhân vật: ${metrics.allCharactersList.length}`);
}

if (metrics.totalTopics === 29) {
  console.log(`  ✓ Chủ đề SGK lịch sử chuyên sâu: ${metrics.totalTopics} chủ đề`);
} else {
  throw new Error(`Sai số chủ đề: ${metrics.totalTopics}`);
}

// Test 2: Character Search & Filter
console.log('\n2. Kiểm thử Bộ lọc và Tìm kiếm Nhân vật:');
window.filterInventoryCharacters('fact');
console.log('  ✓ Lọc nhân vật chính sử (fact) thực thi thành công');

window.filterInventoryCharacters('creative');
console.log('  ✓ Lọc nhân vật kịch bản (creative) thực thi thành công');

window.searchInventoryCharacters('Trần');
console.log('  ✓ Tìm kiếm nhân vật "Trần" thực thi thành công');

window.filterInventoryCharacters('all');
window.searchInventoryCharacters('');
console.log('  ✓ Reset bộ lọc nhân vật về mặc định');

// Test 3: Inventory Modal Rendering & Export
console.log('\n3. Kiểm thử Modal & Xuất Báo cáo:');
window.renderRealDataInventoryModal();
console.log('  ✓ renderRealDataInventoryModal() thực thi trơn tru không lỗi');

window.exportRealDataInventoryReport('json');
if (lastBlobContent && lastBlobContent.includes('Báo cáo Kiểm kê Dữ liệu CSDL Sử Tuation')) {
  console.log('  ✓ Xuất báo cáo định dạng JSON thành công');
} else {
  throw new Error('Xuất JSON thất bại');
}

window.exportRealDataInventoryReport('txt');
if (lastBlobContent && lastBlobContent.includes('BÁO CÁO KIỂM KÊ & KIỂM ĐỊNH SỐ LIỆU THẬT CSDL SỬ TUATION')) {
  console.log('  ✓ Xuất biên bản kiểm kê định dạng TXT thành công');
} else {
  throw new Error('Xuất TXT thất bại');
}

console.log('\n================================================================');
console.log('   🎉 100% CÁC KIỂM THỬ SỐ LIỆU THẬT & KIỂM KÊ ĐÃ VƯỢT QUA!');
console.log('================================================================\n');
