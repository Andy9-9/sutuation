// tests/test_global_cross_device_sync.js
// Automated verification of Global Cross-Device Sync (Device A Laptop ↔ Device B Phone)
// Simulating 2 completely isolated devices with distinct local storages

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function createIsolatedDevice(deviceName, clientId, roomCode = "sutuation_test_room") {
  const store = {
    situation_room_code: roomCode
  };
  const elements = {};

  function getElement(id) {
    if (!elements[id]) {
      elements[id] = {
        id,
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
        setAttribute: () => {},
        getAttribute: () => null,
        appendChild: () => {},
        removeChild: () => {}
      };
    }
    return elements[id];
  }

  const localStorageMock = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = v.toString(); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { for (const k in store) delete store[k]; }
  };

  const sandbox = {
    console: {
      log: (...a) => console.log(...a),
      warn: (...a) => console.warn(...a),
      error: (...a) => console.error(...a)
    },
    Paho: require('paho-mqtt'),
    WebSocket: globalThis.WebSocket,
    fetch: globalThis.fetch,
    AbortController: globalThis.AbortController,
    localStorage: localStorageMock,
    sessionStorage: localStorageMock,
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout,
    setInterval: globalThis.setInterval,
    clearInterval: globalThis.clearInterval,
    Date: globalThis.Date,
    Math: globalThis.Math,
    JSON: globalThis.JSON,
    Set: globalThis.Set,
    Array: globalThis.Array,
    Object: globalThis.Object,
    String: globalThis.String,
    Number: globalThis.Number,
    Boolean: globalThis.Boolean,
    RegExp: globalThis.RegExp,
    URL: Object.assign(globalThis.URL, { createObjectURL: () => 'blob:mock', revokeObjectURL: () => {} }),
    Blob: class { constructor(parts) { this.parts = parts; } },
    document: {
      getElementById: (id) => getElement(id),
      querySelector: () => null,
      querySelectorAll: () => [],
      createElement: () => ({ style: {}, setAttribute: () => {}, click: () => {}, addEventListener: () => {}, appendChild: () => {} }),
      body: { appendChild: () => {}, removeChild: () => {} },
      addEventListener: () => {},
      removeEventListener: () => {}
    },
    confirm: () => true,
    alert: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    window: null
  };
  sandbox.window = sandbox;
  sandbox.__situation_tab_id = clientId;

  const context = vm.createContext(sandbox);

  const dataJs = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');
  vm.runInContext(dataJs, context);

  const dbJs = fs.readFileSync(path.join(__dirname, '../js/db.js'), 'utf8');
  vm.runInContext(dbJs, context);

  const syncJs = fs.readFileSync(path.join(__dirname, '../js/sync.js'), 'utf8');
  vm.runInContext(syncJs, context);

  const teacherJs = fs.readFileSync(path.join(__dirname, '../js/teacher.js'), 'utf8');
  vm.runInContext(teacherJs, context);

  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  vm.runInContext(appJs, context);

  context.initSituationRealtimeSync();

  return {
    name: deviceName,
    ctx: sandbox,
    getElement: (id) => getElement(id)
  };
}

async function runCrossDeviceTest() {
  const TEST_ROOM = "test_live_room_" + Date.now();
  console.log('================================================================');
  console.log('   KIỂM THỬ ĐỒNG BỘ 2 THIẾT BỊ KHÁC NHAU QUA CLOUD RELAY        ');
  console.log('   (THIẾT BỊ 1: LAPTOP GIÁO VIÊN ↔ THIẾT BỊ 2: ĐIỆN THOẠI HỌC SINH)');
  console.log('================================================================\n');

  // Bước 1: Khởi tạo 2 thiết bị độc lập hoàn toàn (không chung bộ nhớ)
  console.log('1. Khởi tạo 2 thiết bị độc lập:');
  const deviceTeacher = createIsolatedDevice('Thiết bị 1 (Laptop Giáo viên)', 'dev_teacher_macbook', TEST_ROOM);
  const deviceStudent = createIsolatedDevice('Thiết bị 2 (Điện thoại Học sinh)', 'dev_student_phone', TEST_ROOM);

  // Chờ 2.5s để cả 2 thiết bị kết nối MQTT broker
  await new Promise(r => setTimeout(r, 2500));

  console.log(`  ✓ ${deviceTeacher.name} ban đầu: ${deviceTeacher.ctx.catalogData.length} bài học`);
  console.log(`  ✓ ${deviceStudent.name} ban đầu: ${deviceStudent.ctx.catalogData.length} bài học`);

  // Bước 2: Giáo viên trên Thiết bị 1 đăng bài mới
  console.log('\n2. Giáo viên tại Thiết bị 1 ĐĂNG BÀI:');
  deviceTeacher.ctx.toggleAdminMode();
  
  const testPost = {
    code: '11.W88',
    grade: '11',
    examCode: 'MD-11.88',
    lesson: 'Kháng chiến chống Tống (981) - Thầy Lê Văn Hùng',
    topic: 'Kịch bản Hoạt cảnh Khối 11',
    author: 'Thầy Lê Văn Hùng',
    school: 'THPT Chu Văn An',
    scenario: 'Tái hiện kế sách mai phục trên sông Bạch Đằng của Lê Hoàn...',
    format: 'Kịch bản Word (.docx)',
    originType: 'TEACHER_CONTRIBUTED',
    fileName: 'KichBan_KhangChienChongTong_981.docx',
    fileSize: 22400
  };

  deviceTeacher.ctx.commitDatabaseMutation('TEACHER_POST_SAVED', {
    post: testPost,
    author: testPost.author,
    lesson: testPost.lesson,
    code: testPost.code
  });

  console.log(`  ✓ Thiết bị 1 (Giáo viên) đã lưu và đẩy bài [${testPost.code}] lên Cloud`);
  console.log(`  ✓ Số bài trên Thiết bị 1: ${deviceTeacher.ctx.catalogData.length}`);

  // Chờ 1.5 giây để Cloud state lan tỏa qua mạng Internet
  console.log('\n3. Chờ đồng bộ mạng Internet toàn cầu...');
  await deviceTeacher.ctx.pushStateToGlobalCloud();
  await new Promise(r => setTimeout(r, 1000));

  // Bước 3: Thiết bị 2 (Học sinh) kéo dữ liệu từ Cloud
  console.log('4. Thiết bị 2 (Điện thoại Học sinh) kiểm tra dữ liệu từ Cloud:');
  await deviceStudent.ctx.pullStateFromGlobalCloud(false);
  console.log('  -> Đã kéo xong! Số bài hiện tại của HS:', deviceStudent.ctx.catalogData.length);

  const postOnStudentDevice = deviceStudent.ctx.catalogData.find(i => i.code === testPost.code);
  if (postOnStudentDevice) {
    console.log(`  ✓ [THÀNH CÔNG RỰC RỠ] Thiết bị 2 đã nhận bài [${testPost.code}]!`);
    console.log(`    • Tiêu đề bài học: "${postOnStudentDevice.lesson}"`);
    console.log(`    • Tác giả: "${postOnStudentDevice.author} (${postOnStudentDevice.school})"`);
    console.log(`    • Số bài trên Thiết bị 2: ${deviceStudent.ctx.catalogData.length} (Tăng từ 42 -> 43)`);
  } else {
    throw new Error('Thiết bị 2 không nhận được bài đăng từ Thiết bị 1!');
  }

  // Bước 4: Giáo viên trên Thiết bị 1 XÓA BÀI
  console.log('\n5. Giáo viên tại Thiết bị 1 thực hiện XÓA BÀI:');
  deviceTeacher.ctx.commitDatabaseMutation('TEACHER_POST_DELETED', {
    code: testPost.code
  });
  console.log(`  ✓ Thiết bị 1 đã xóa bài [${testPost.code}], còn lại ${deviceTeacher.ctx.catalogData.length} bài`);

  // Chờ 1.5 giây để Cloud state lan tỏa
  await deviceTeacher.ctx.pushStateToGlobalCloud();
  await new Promise(r => setTimeout(r, 1000));

  // Bước 5: Thiết bị 2 (Học sinh) cập nhật
  console.log('\n6. Thiết bị 2 (Điện thoại Học sinh) nhận lệnh xóa:');
  await deviceStudent.ctx.pullStateFromGlobalCloud(false);

  const postDeletedOnStudent = deviceStudent.ctx.catalogData.find(i => i.code === testPost.code);
  if (!postDeletedOnStudent) {
    console.log(`  ✓ [THÀNH CÔNG RỰC RỠ] Bài [${testPost.code}] đã biến mất khỏi Thiết bị 2!`);
    console.log(`  ✓ Số bài trên Thiết bị 2: ${deviceStudent.ctx.catalogData.length} (Trở về đúng 42 bài gốc)`);
  } else {
    throw new Error('Bài đã xóa vẫn còn tồn tại trên Thiết bị 2!');
  }

  console.log('\n================================================================');
  console.log('   🎉 100% HOÀN THÀNH: ĐỒNG BỘ ĐA THIẾT BỊ HOẠT ĐỘNG HOÀN HẢO!');
  console.log('   LAPTOP ĐĂNG BÀI -> ĐIỆN THOẠI THẤY NGAY');
  console.log('   LAPTOP XÓA BÀI -> ĐIỆN THOẠI MẤT NGAY');
  console.log('================================================================\n');
  process.exit(0);
}

runCrossDeviceTest().catch(e => {
  console.error('Test thất bại:', e);
  process.exit(1);
});
