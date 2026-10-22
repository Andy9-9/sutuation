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
global.localStorage = {
  getItem: k => (k in storage ? storage[k] : null),
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: k => { delete storage[k]; },
  clear: () => { for (let k in storage) delete storage[k]; }
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
    reset: () => {},
    appendChild: () => {},
    removeChild: () => {},
    click: () => {}
  };
  elements[id] = el;
  return el;
};

let lastDownloadedBlob = null;
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
global.Blob = class {
  constructor(parts, opts) {
    this.parts = parts;
    this.opts = opts;
    lastDownloadedBlob = this;
  }
};
global.URL = { createObjectURL: () => 'blob:mock-url', revokeObjectURL: () => {} };

// Run application
vm.runInThisContext(scriptCode);

console.log('Testing Download Format Selection System...');

// 1. Open Download Format Modal for lesson 10.04A
openDownloadFormatModal('10.04A');
const modal = document.getElementById('downloadFormatModal');
if (!modal.classList.contains('open')) throw new Error('DownloadFormatModal was not opened!');
console.log('  ✓ Modal opened successfully for 10.04A');
console.log('  ✓ Lesson title in modal:', document.getElementById('downloadModalLesson').textContent);
console.log('  ✓ Exam code in modal:', document.getElementById('downloadModalExamCode').textContent);

// 2. Test downloading as .docx
executeDownloadSelectedFormat('docx');
if (!lastDownloadedFileName || !lastDownloadedFileName.endsWith('.docx')) {
  throw new Error('Failed to download .docx: ' + lastDownloadedFileName);
}
console.log('  ✓ Successfully downloaded as .docx:', lastDownloadedFileName);

// 3. Test downloading as .doc
openDownloadFormatModal('10.04A');
executeDownloadSelectedFormat('doc');
if (!lastDownloadedFileName || !lastDownloadedFileName.endsWith('.doc')) {
  throw new Error('Failed to download .doc: ' + lastDownloadedFileName);
}
console.log('  ✓ Successfully downloaded as .doc:', lastDownloadedFileName);

// 4. Test downloading as .txt
openDownloadFormatModal('10.04A');
executeDownloadSelectedFormat('txt');
if (!lastDownloadedFileName || !lastDownloadedFileName.endsWith('.txt')) {
  throw new Error('Failed to download .txt: ' + lastDownloadedFileName);
}
console.log('  ✓ Successfully downloaded as .txt:', lastDownloadedFileName);

// 5. Test downloading as .html
openDownloadFormatModal('10.04A');
executeDownloadSelectedFormat('html');
if (!lastDownloadedFileName || !lastDownloadedFileName.endsWith('.html')) {
  throw new Error('Failed to download .html: ' + lastDownloadedFileName);
}
console.log('  ✓ Successfully downloaded as .html:', lastDownloadedFileName);

// 6. Test downloading Document Store item as .docx, .doc, .txt, .html
openDocDownloadFormatModal('DOC-1001A');
if (!modal.classList.contains('open')) throw new Error('Modal did not open for DOC-1001A!');
console.log('  ✓ Document modal opened for DOC-1001A:', document.getElementById('downloadModalLesson').textContent);

executeDownloadSelectedFormat('txt');
if (!lastDownloadedFileName || !lastDownloadedFileName.endsWith('.txt')) {
  throw new Error('Failed to download doc store as .txt: ' + lastDownloadedFileName);
}
console.log('  ✓ Successfully downloaded doc store item as .txt:', lastDownloadedFileName);

openDocDownloadFormatModal('DOC-1001A');
executeDownloadSelectedFormat('docx');
if (!lastDownloadedFileName || !lastDownloadedFileName.endsWith('.docx')) {
  throw new Error('Failed to download doc store as .docx: ' + lastDownloadedFileName);
}
console.log('  ✓ Successfully downloaded doc store item as .docx:', lastDownloadedFileName);

console.log('\n🎉 ALL DOWNLOAD FORMAT SELECTION TESTS PASSED 100%!');
