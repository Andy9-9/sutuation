// scripts/build_deploy_zip.js
// Automated Builder for Deployment Zip Files

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');

console.log('================================================================');
console.log('       SỬ TUATION — QUY TRÌNH NÂNG CẤP & ĐÓNG GÓI TỆP ZIP       ');
console.log('================================================================\n');

// 1. Files to include in deployment package
const CORE_FILES = [
  'index.html',
  'duan.html',
  '404.html',
  '_redirects',
  '_headers',
  'netlify.toml',
  'render.yaml',
  'situation_database.json',
  'favicon.svg',
  'manifest.json',
  '.nojekyll',
  'HUONG_DAN_UP_CODE.txt'
];

const JS_FILES = [
  'js/official-posts-data.js',
  'js/scripts15-data.js',
  'js/app.js',
  'js/data.js',
  'js/db.js',
  'js/paho-mqtt-min.js',
  'js/sync.js',
  'js/teacher.js',
  'js/sql-studio.js'
];

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}
const distJsDir = path.join(DIST_DIR, 'js');
if (!fs.existsSync(distJsDir)) {
  fs.mkdirSync(distJsDir, { recursive: true });
}
const distUploadsDir = path.join(DIST_DIR, 'uploads');
if (!fs.existsSync(distUploadsDir)) {
  fs.mkdirSync(distUploadsDir, { recursive: true });
}

// Copy uploads files
if (fs.existsSync(path.join(ROOT_DIR, 'uploads'))) {
  const uploadFiles = fs.readdirSync(path.join(ROOT_DIR, 'uploads'));
  uploadFiles.forEach(f => {
    if (!f.startsWith('.')) {
      fs.copyFileSync(path.join(ROOT_DIR, 'uploads', f), path.join(distUploadsDir, f));
    }
  });
}

// 2. Copy and compute file hashes
const fileManifest = [];
const allFilesToBundle = [...CORE_FILES, ...JS_FILES];

allFilesToBundle.forEach(relPath => {
  const src = path.join(ROOT_DIR, relPath);
  const dest = path.join(DIST_DIR, relPath);
  
  if (!fs.existsSync(src)) {
    throw new Error(`Thiếu tệp nguồn bắt buộc: ${relPath}`);
  }

  const content = fs.readFileSync(src);
  fs.writeFileSync(dest, content);

  const hash = crypto.createHash('sha256').update(content).digest('hex').slice(0, 10);
  fileManifest.push({
    file: relPath,
    size: content.length,
    sizeKb: `${(content.length / 1024).toFixed(1)} KB`,
    sha256: hash
  });
  console.log(`  ✓ Đã chuẩn bị: ${relPath.padEnd(25)} [${(content.length / 1024).toFixed(1)} KB] (${hash})`);
});

// 3. Create deploy_manifest.json
const deployManifest = {
  projectName: "Sử Tuation — Nền tảng Hoạt cảnh hóa Lịch sử THPT",
  version: "2.8.0",
  buildTimestamp: new Date().toISOString(),
  builtFor: [
    "Netlify Drop (app.netlify.com/drop)",
    "Netlify CLI",
    "Vercel",
    "Cloudflare Pages",
    "GitHub Pages",
    "Render Static Site",
    "Apache / Nginx / cPanel"
  ],
  totalFiles: fileManifest.length + 1,
  files: fileManifest
};

const manifestPath = path.join(DIST_DIR, 'deploy_manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(deployManifest, null, 2), 'utf8');
fs.writeFileSync(path.join(ROOT_DIR, 'deploy_manifest.json'), JSON.stringify(deployManifest, null, 2), 'utf8');
console.log('  ✓ Đã sinh deploy_manifest.json kiểm định toàn vẹn.');

// 4. Create ZIP archives from inside dist/ so root files are at root of zip
console.log('\nĐang tạo tệp nén ZIP chuẩn cho Netlify Drop...');
const zipTargets = [
  path.join(ROOT_DIR, 'netlify_deploy.zip'),
  path.join(ROOT_DIR, 'deploy.zip')
];

zipTargets.forEach(targetZip => {
  if (fs.existsSync(targetZip)) {
    fs.unlinkSync(targetZip);
  }
  // Change directory into dist to ensure files are at the root level of the ZIP
  execSync(`cd "${DIST_DIR}" && zip -r "${targetZip}" . -x "*.DS_Store"`, { stdio: 'inherit' });
  
  // Verify zip integrity
  const testOutput = execSync(`unzip -t "${targetZip}"`).toString();
  if (!testOutput.includes('No errors detected')) {
    throw new Error(`Tệp zip ${path.basename(targetZip)} bị lỗi cấu trúc!`);
  }
  
  const stats = fs.statSync(targetZip);
  console.log(`  🎉 Đã tạo thành công: ${path.basename(targetZip)} [${(stats.size / 1024).toFixed(1)} KB]`);
});

console.log('\n================================================================');
console.log('   🎉 HOÀN TẤT NÂNG CẤP TỆP ZIP! SẴN SÀNG KÉO THẢ ĐẨY CODE 100%!');
console.log('================================================================\n');
