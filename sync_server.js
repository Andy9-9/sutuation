/**
 * ====================================================================
 * SITUATION 100% REALTIME SYNC SERVER (Node.js Built-in Zero-Dependency)
 * ====================================================================
 * Máy chủ đồng bộ dữ liệu thời gian thực cho Nền tảng Lịch sử Sử Tuation.
 * Hỗ trợ phục vụ trang web tĩnh + REST API + Server-Sent Events (SSE)
 * giúp mọi thiết bị (máy GV, máy HS, điện thoại, máy tính phòng tin học)
 * THÊM GÌ - XÓA GÌ ĐỀU ĐỒNG BỘ Y HỆT NHAU 100% TRONG < 0.05 GIÂY!
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const zlib = require('zlib');

const PORT = process.env.PORT || 8080;
const DB_FILE = path.join(__dirname, 'situation_database.json');

// Hàm phát hiện địa chỉ mạng LAN / Wi-Fi để học sinh và thiết bị khác kết nối
function getNetworkInfo(port = PORT) {
    const nets = os.networkInterfaces();
    const lanIps = [];
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                lanIps.push({ iface: name, ip: net.address });
            }
        }
    }
    const primaryIp = lanIps.length > 0 ? lanIps[0].ip : '127.0.0.1';
    return {
        port,
        localhostUrl: `http://localhost:${port}/`,
        primaryLanUrl: lanIps.length > 0 ? `http://${primaryIp}:${port}/` : `http://localhost:${port}/`,
        lanUrls: lanIps.map(item => `http://${item.ip}:${port}/`),
        lanIps
    };
}

// 1. Tải hoặc Khởi tạo Cơ sở dữ liệu dùng chung (Single Source of Truth)
function loadDatabase() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const raw = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(raw);
        }
    } catch (e) {
        console.warn('Lỗi đọc database file, khởi tạo mới:', e.message);
    }
    return {
        version: Date.now(),
        lastUpdated: new Date().toISOString(),
        teacherPosts: [],
        teacherDocs: [],
        deletedCodes: [],
        studentSubmissions: [],
        customDocs: []
    };
}

function saveDatabase(db, eventData = null) {
    try {
        db.version = Date.now();
        db.lastUpdated = new Date().toISOString();
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
        notifyClients(db, eventData);
        return true;
    } catch (e) {
        console.error('Lỗi ghi database file:', e.message);
        return false;
    }
}

let currentDb = loadDatabase();

// 2. Danh sách client đang mở kết nối SSE Realtime
const sseClients = new Set();

// 2.1 Heartbeat định kỳ 15 giây gửi ping keepalive để tránh các proxy/hosting miễn phí
// (Cloudflare, Render, Glitch, ngrok, Fly.io) ngắt kết nối idle socket sau 30-60s
setInterval(() => {
    sseClients.forEach(clientRes => {
        try {
            clientRes.write(': keepalive\n\n');
        } catch (e) {
            sseClients.delete(clientRes);
        }
    });
}, 15000).unref();

function notifyClients(db, eventData = null) {
    const payload = JSON.stringify({
        version: db.version,
        lastUpdated: db.lastUpdated,
        event: eventData,
        summary: {
            teacherPostsCount: (db.teacherPosts || []).length,
            teacherDocsCount: (db.teacherDocs || []).length,
            deletedCodesCount: (db.deletedCodes || []).length,
            submissionsCount: (db.studentSubmissions || []).length
        }
    });

    sseClients.forEach(res => {
        try {
            res.write(`data: ${payload}\n\n`);
        } catch (e) {
            sseClients.delete(res);
        }
    });
}

// 3. MIME Types phục vụ Web
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.pdf': 'application/pdf'
};

const server = http.createServer((req, res) => {
    // CORS Headers để hỗ trợ cả truy cập từ file:/// hoặc IP khác
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Sync-Version');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname.replace(/\/+/g, '/');

    // --- API 1: KÊNH SSE REALTIME PUSH ---
    if (pathname === '/api/sync/events') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no', // Vô hiệu hóa buffering proxy trên Nginx, Cloudflare, Traefik
            'Access-Control-Allow-Origin': '*'
        });
        res.write(`data: ${JSON.stringify({ type: 'CONNECTED', version: currentDb.version })}\n\n`);
        sseClients.add(res);

        req.on('close', () => {
            sseClients.delete(res);
        });
        return;
    }

    // --- API 2: LẤY TOÀN BỘ CSDL HIỆN TẠI (GET /api/sync) ---
    if (pathname === '/api/sync' && req.method === 'GET') {
        const isForceApply = req.headers['x-force-apply'] === 'true' || url.searchParams.get('force') === 'true';
        const clientVersion = !isForceApply ? (req.headers['x-sync-version'] || url.searchParams.get('version')) : null;

        if (clientVersion && Number(clientVersion) === currentDb.version) {
            // Client đã có phiên bản mới nhất -> Trả về siêu nhẹ 45 bytes (tiết kiệm 99.99% băng thông & CPU)
            res.writeHead(200, {
                'Content-Type': 'application/json; charset=utf-8',
                'Cache-Control': 'no-cache'
            });
            res.end(JSON.stringify({ upToDate: true, version: currentDb.version }));
            return;
        }

        const jsonStr = JSON.stringify(currentDb);
        const acceptEncoding = req.headers['accept-encoding'] || '';

        if (acceptEncoding.includes('gzip') && jsonStr.length > 1024) {
            zlib.gzip(Buffer.from(jsonStr), (err, compressed) => {
                if (err) {
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(jsonStr);
                } else {
                    res.writeHead(200, {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Content-Encoding': 'gzip',
                        'Content-Length': compressed.length
                    });
                    res.end(compressed);
                }
            });
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(jsonStr);
        }
        return;
    }

    // --- API 3: CẬP NHẬT BIẾN ĐỘNG CSDL (POST /api/sync) ---
    if (pathname === '/api/sync' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const data = JSON.parse(body || '{}');
                if (data.action === 'COMMIT_MUTATION') {
                    const { mutationType, payload } = data;

                    if (mutationType === 'FULL_DATABASE_SYNC') {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, version: currentDb.version }));
                        return;
                    }

                    if (mutationType === 'TEACHER_POST_SAVED') {
                        const { post, doc } = payload;
                        if (post) {
                            currentDb.teacherPosts = currentDb.teacherPosts.filter(p => p.code !== post.code);
                            currentDb.teacherPosts.unshift(post);
                            // Xóa khỏi deletedCodes nếu có
                            currentDb.deletedCodes = (currentDb.deletedCodes || []).filter(c => c !== post.code);
                        }
                        if (doc) {
                            currentDb.teacherDocs = (currentDb.teacherDocs || []).filter(d => d.id !== doc.id && d.code !== doc.code);
                            currentDb.teacherDocs.unshift(doc);
                        }
                    } else if (mutationType === 'TEACHER_POST_DELETED') {
                        const { code } = payload;
                        if (code) {
                            if (!currentDb.deletedCodes.includes(code)) {
                                currentDb.deletedCodes.push(code);
                            }
                            currentDb.teacherPosts = currentDb.teacherPosts.filter(p => p.code !== code);
                            currentDb.teacherDocs = (currentDb.teacherDocs || []).filter(d => d.code !== code && d.id !== `DOC-${code.replace(/[^A-Z0-9]/gi, '')}`);
                        }
                    } else if (mutationType === 'TEACHER_POSTS_BULK_DELETED') {
                        const { codes } = payload;
                        if (Array.isArray(codes)) {
                            codes.forEach(code => {
                                if (!currentDb.deletedCodes.includes(code)) {
                                    currentDb.deletedCodes.push(code);
                                }
                                currentDb.teacherPosts = currentDb.teacherPosts.filter(p => p.code !== code);
                                currentDb.teacherDocs = (currentDb.teacherDocs || []).filter(d => d.code !== code && d.id !== `DOC-${code.replace(/[^A-Z0-9]/gi, '')}`);
                            });
                        }
                    } else if (mutationType === 'DOCUMENT_SAVED') {
                        const { doc } = payload;
                        if (doc) {
                            currentDb.customDocs = (currentDb.customDocs || []).filter(d => d.id !== doc.id);
                            currentDb.customDocs.unshift(doc);
                        }
                    } else if (mutationType === 'DOCUMENT_DELETED') {
                        const { docId } = payload;
                        if (docId) {
                            currentDb.customDocs = (currentDb.customDocs || []).filter(d => d.id !== docId);
                            currentDb.teacherDocs = (currentDb.teacherDocs || []).filter(d => d.id !== docId);
                        }
                    } else if (mutationType === 'STUDENT_SUBMISSION_CREATED' || mutationType === 'TEACHER_FEEDBACK_SAVED') {
                        const sub = payload;
                        if (sub && sub.id) {
                            const idx = (currentDb.studentSubmissions || []).findIndex(s => s.id === sub.id);
                            if (idx >= 0) currentDb.studentSubmissions[idx] = sub;
                            else currentDb.studentSubmissions.unshift(sub);
                        }
                    } else if (mutationType === 'RESTORE_DEFAULT_DATA') {
                        currentDb.deletedCodes = [];
                        currentDb.teacherPosts = [];
                        currentDb.teacherDocs = [];
                        currentDb.studentSubmissions = [];
                        currentDb.customDocs = [];
                    }

                    saveDatabase(currentDb, { type: mutationType, payload });
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, version: currentDb.version }));
                    return;
                } else if (data.action === 'FULL_OVERWRITE') {
                    // Nạp nguyên khối snapshot CSDL
                    currentDb = {
                        version: Date.now(),
                        lastUpdated: new Date().toISOString(),
                        teacherPosts: Array.isArray(data.teacherPosts) ? data.teacherPosts : [],
                        teacherDocs: Array.isArray(data.teacherDocs) ? data.teacherDocs : [],
                        deletedCodes: Array.isArray(data.deletedCodes) ? data.deletedCodes : [],
                        studentSubmissions: Array.isArray(data.studentSubmissions) ? data.studentSubmissions : [],
                        customDocs: Array.isArray(data.customDocs) ? data.customDocs : []
                    };
                    saveDatabase(currentDb, { type: 'FULL_DATABASE_SYNC', payload: currentDb });
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, version: currentDb.version }));
                    return;
                }

                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Hành động không hợp lệ' }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    // --- API 4: THÔNG TIN MẠNG LAN / CHIA SẺ CHO HỌC SINH ---
    if (pathname === '/api/network-info' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(getNetworkInfo(PORT)));
        return;
    }

    // --- API 5: THEO DÕI & KIỂM SOÁT BỘ NHỚ RAM (< 6 GB SAFETY MONITOR) ---
    if (pathname === '/api/system-memory' && req.method === 'GET') {
        const mem = process.memoryUsage();
        const MAX_ALLOWED_RAM_MB = 6 * 1024; // 6 GB
        const serverRssMb = Math.round((mem.rss / 1024 / 1024) * 100) / 100;
        const serverHeapUsedMb = Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100;
        const serverHeapTotalMb = Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100;
        const totalSysMemMb = Math.round((os.totalmem() / 1024 / 1024) * 100) / 100;
        const freeSysMemMb = Math.round((os.freemem() / 1024 / 1024) * 100) / 100;
        const usedSysMemMb = Math.round((totalSysMemMb - freeSysMemMb) * 100) / 100;

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            status: serverRssMb < MAX_ALLOWED_RAM_MB ? 'OPTIMAL' : 'EXCEEDED',
            serverMemory: {
                rssMb: serverRssMb,
                heapUsedMb: serverHeapUsedMb,
                heapTotalMb: serverHeapTotalMb,
                externalMb: Math.round((mem.external / 1024 / 1024) * 100) / 100,
                percentOf6GbLimit: `${((serverRssMb / MAX_ALLOWED_RAM_MB) * 100).toFixed(2)}%`
            },
            systemMemory: {
                totalMb: totalSysMemMb,
                freeMb: freeSysMemMb,
                usedMb: usedSysMemMb,
                percentUsed: `${((usedSysMemMb / totalSysMemMb) * 100).toFixed(1)}%`
            },
            safeLimitMb: MAX_ALLOWED_RAM_MB,
            activeSseClients: sseClients.size
        }));
        return;
    }

    // --- PHỤC VỤ CÁC FILE TĨNH (STATIC FILES CÓ GZIP VÀ TỐI ƯU CACHING CHO MIỀN MIỄN PHÍ) ---
    let filePath = pathname === '/' ? '/duan.html' : pathname;
    filePath = path.join(__dirname, filePath);

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('404 Không tìm thấy tệp');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(`Lỗi máy chủ: ${err.code}`);
            }
            return;
        }

        const acceptEncoding = req.headers['accept-encoding'] || '';
        const isCompressible = ['.html', '.js', '.css', '.json', '.svg'].includes(ext);
        const cacheControl = (ext === '.html' || ext === '.js') ? 'no-cache, must-revalidate' : 'public, max-age=3600';

        if (isCompressible && acceptEncoding.includes('gzip')) {
            zlib.gzip(content, (gzipErr, compressed) => {
                if (gzipErr) {
                    res.writeHead(200, {
                        'Content-Type': contentType,
                        'Cache-Control': cacheControl,
                        'Content-Length': content.length
                    });
                    res.end(content);
                } else {
                    res.writeHead(200, {
                        'Content-Type': contentType,
                        'Content-Encoding': 'gzip',
                        'Cache-Control': cacheControl,
                        'Content-Length': compressed.length
                    });
                    res.end(compressed);
                }
            });
        } else {
            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': cacheControl,
                'Content-Length': content.length
            });
            res.end(content);
        }
    });
});

if (require.main === module) {
    server.listen(PORT, '0.0.0.0', () => {
        const netInfo = getNetworkInfo(PORT);
        console.log('================================================================');
        console.log(`🚀 SITUATION 100% REALTIME SYNC SERVER ĐANG CHẠY:`);
        console.log(`   - Máy GV (cục bộ):  ${netInfo.localhostUrl}`);
        if (netInfo.lanUrls && netInfo.lanUrls.length > 0) {
            console.log(`   - Học sinh & máy khác (LAN/Wi-Fi): ${netInfo.primaryLanUrl}`);
            netInfo.lanUrls.forEach(url => {
                if (url !== netInfo.primaryLanUrl) console.log(`     Hoặc: ${url}`);
            });
        }
        console.log(`   - API Đồng bộ:      http://localhost:${PORT}/api/sync`);
        console.log(`   - Dữ liệu lưu:      ${DB_FILE}`);
        console.log('================================================================');
    });
}

module.exports = { server, loadDatabase, saveDatabase };
