/**
 * ====================================================================
 * SITUATION REALTIME SYNCHRONIZATION ENGINE (js/sync.js)
 * ====================================================================
 * Động cơ đồng bộ thời gian thực đa tab / đa thiết bị:
 * - Server-Sent Events (SSE Realtime Push)
 * - BroadcastChannel đa tab
 * - StorageEvent cross-window fallback
 * - Tab Reactivation Auto-wake (focus & visibilitychange)
 * - Atomic Multi-record persistence
 */

let syncChannel = null;

function resolveSyncServerUrl() {
    // 1. Kiểm tra tham số ?server=https://... hoặc ?api=... trên thanh địa chỉ URL
    if (typeof window !== "undefined" && window.location && window.location.search) {
        try {
            const params = new URLSearchParams(window.location.search);
            const serverParam = params.get("server") || params.get("api");
            if (serverParam && serverParam.trim()) {
                const cleanServerUrl = serverParam.trim().replace(/\/+$/, "");
                if (typeof localStorage !== "undefined") {
                    localStorage.setItem("situation_sync_server_url", cleanServerUrl);
                }
                return cleanServerUrl;
            }
        } catch (e) { }
    }

    // 2. Kiểm tra cấu hình máy chủ do Thầy/Cô thiết lập trong localStorage
    try {
        if (typeof localStorage !== "undefined") {
            const saved = localStorage.getItem("situation_sync_server_url");
            if (saved && saved.trim()) return saved.trim().replace(/\/+$/, "");
        }
    } catch (e) {}

    // 3. Kiểm tra môi trường trình duyệt web
    if (typeof window !== "undefined" && window.location && window.location.protocol && window.location.protocol.startsWith("http")) {
        const hostname = (window.location.hostname || "").toLowerCase();

        // Nhận diện các nền tảng hosting tĩnh (Netlify, Vercel, GitHub Pages, Surge)
        const isStaticCloudHost = hostname.endsWith("netlify.app") ||
                                  hostname.endsWith("vercel.app") ||
                                  hostname.endsWith("github.io") ||
                                  hostname.endsWith("surge.sh");

        if (isStaticCloudHost) {
            // Khi deploy lên Netlify mà chưa cấu hình server backend riêng:
            // Trả về chuỗi rỗng để chạy chế độ Local-First PWA (0 lag, 0 lỗi 404 console)
            return "";
        }

        // Trường hợp chạy local hoặc VPS có máy chủ backend cùng domain
        return (window.location.origin || "").replace(/\/+$/, "");
    }
    return "http://localhost:8080";
}

let syncServerUrl = resolveSyncServerUrl();
let isSyncServerOnline = false;
let lastKnownServerVersion = 0;
let syncHeartbeatTimer = null;
let sseEventSource = null;
let serverNetworkInfo = null;

// ==========================================
// ĐỘNG CƠ ĐỒNG BỘ ĐÁM MÂY TOÀN CẦU (GLOBAL CLOUD REALTIME RELAY)
// Đảm bảo bất kỳ ai tải bài lên hoặc xóa bài thì mọi người dùng
// trên mọi thiết bị (Netlify / Internet) đều thấy ngay lập tức.
// ==========================================

// Bộ nhớ đệm chống trùng lặp sự kiện giữa các kênh (BroadcastChannel, Storage, Cloud SSE)
const seenEventIds = new Set();
function hasProcessedEvent(eventId) {
    if (!eventId) return false;
    if (seenEventIds.has(eventId)) return true;
    seenEventIds.add(eventId);
    if (seenEventIds.size > 300) {
        const first = seenEventIds.values().next().value;
        seenEventIds.delete(first);
    }
    return false;
}

let myLocalTabId = null;
function getMyClientId() {
    if (typeof window === "undefined") return "node_client";
    if (!myLocalTabId) {
        // Sinh ID định danh duy nhất cho từng Tab (KHÔNG lưu sessionStorage để tránh bị clone khi nhân đôi Tab)
        myLocalTabId = "tab_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2, 9);
        window.__situation_tab_id = myLocalTabId;
    }
    return myLocalTabId;
}

function getCloudRoomCode() {
    if (typeof window !== "undefined" && window.location && window.location.search) {
        try {
            const params = new URLSearchParams(window.location.search);
            const r = params.get("room") || params.get("lop") || params.get("class");
            if (r && r.trim()) {
                const clean = r.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
                if (clean) {
                    if (typeof localStorage !== "undefined") {
                        localStorage.setItem("situation_room_code", clean);
                    }
                    return clean;
                }
            }
        } catch (e) {}
    }
    try {
        if (typeof localStorage !== "undefined") {
            const saved = localStorage.getItem("situation_room_code");
            if (saved && saved.trim()) return saved.trim();
        }
    } catch (e) {}
    return "sutuation_classroom_live_2026";
}

function getCloudChannelUrl() {
    const room = getCloudRoomCode();
    return `https://ntfy.sh/${room}`;
}

let cloudEventSource = null;
let isCloudOnline = false;

function setCloudOnlineState(online) {
    if (isCloudOnline !== online) {
        isCloudOnline = online;
        updateSyncStatusDisplay();
    }
}

function connectCloudSSE() {
    if (typeof EventSource === "undefined") return;
    const url = getCloudChannelUrl();
    if (!url) return;

    if (cloudEventSource && cloudEventSource.readyState !== EventSource.CLOSED) {
        return;
    }

    try {
        if (cloudEventSource) {
            try { cloudEventSource.close(); } catch (e) {}
            cloudEventSource = null;
        }

        cloudEventSource = new EventSource(`${url}/sse`);
        cloudEventSource.onopen = () => {
            setCloudOnlineState(true);
        };

        cloudEventSource.onmessage = async (event) => {
            try {
                if (!event || !event.data) return;
                const raw = JSON.parse(event.data);
                if (!raw || raw.event !== 'message') return;

                setCloudOnlineState(true);

                let msgObj = null;
                if (raw.attachment && raw.attachment.url) {
                    try {
                        const attRes = await fetch(raw.attachment.url);
                        if (attRes.ok) {
                            msgObj = await attRes.json();
                        }
                    } catch (err) {}
                } else if (raw.message) {
                    try {
                        msgObj = typeof raw.message === 'string' ? JSON.parse(raw.message) : raw.message;
                    } catch (err) {}
                } else if (raw.type) {
                    msgObj = raw;
                }

                if (msgObj && msgObj.type) {
                    if (msgObj.senderId && msgObj.senderId === getMyClientId()) {
                        return; // Bỏ qua sự kiện của chính mình
                    }
                    handleIncomingSyncEvent(msgObj, { fromCloud: true });
                }
            } catch (e) {
                console.warn("Lỗi nhận sự kiện Cloud:", e);
            }
        };

        cloudEventSource.onerror = () => {
            // Tự động kết nối lại theo cơ chế chuẩn
        };
    } catch (e) {}
}

async function publishEventToCloud(msg) {
    if (typeof fetch === "undefined") return;
    if (typeof URL !== "function") return; // Bỏ qua nếu môi trường mock không có constructor URL
    const url = getCloudChannelUrl();
    if (!url) return;
    try {
        if (!msg.id) {
            msg.id = "evt_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2, 7);
        }
        seenEventIds.add(msg.id); // Đánh dấu sự kiện do chính tab này phát ra

        const bodyStr = JSON.stringify(msg);
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: bodyStr
        });
        if (res && res.ok) {
            setCloudOnlineState(true);
        }
    } catch (e) {
        console.warn("Lỗi gửi sự kiện lên đám mây:", e);
    }
}

let hasPolledCloudHistory = false;
async function pollCloudRecentHistory(force = false) {
    if (typeof fetch === "undefined") return;
    if (typeof URL !== "function") return; // Bỏ qua nếu môi trường mock không có constructor URL
    const url = getCloudChannelUrl();
    if (!url) return;

    try {
        const res = await fetch(`${url}/json?poll=1&since=all`, {
            headers: { 'Cache-Control': 'no-cache' }
        });
        if (!res.ok) return;

        const text = await res.text();
        const lines = text.trim().split('\n').filter(Boolean);
        if (lines.length === 0) return;

        const myId = getMyClientId();
        let changed = false;

        for (const line of lines) {
            try {
                const raw = JSON.parse(line);
                if (raw.event !== 'message') continue;

                let msgObj = null;
                if (raw.attachment && raw.attachment.url) {
                    try {
                        const attRes = await fetch(raw.attachment.url);
                        if (attRes.ok) msgObj = await attRes.json();
                    } catch (e) {}
                } else if (raw.message) {
                    try {
                        msgObj = typeof raw.message === 'string' ? JSON.parse(raw.message) : raw.message;
                    } catch (e) {}
                } else if (raw.type) {
                    msgObj = raw;
                }

                if (msgObj && msgObj.type && msgObj.senderId !== myId) {
                    handleIncomingSyncEvent(msgObj, {
                        fromBroadcast: true,
                        fromServer: true,
                        fromCloud: true,
                        silentToast: true
                    });
                    changed = true;
                }
            } catch (e) {}
        }

        if (changed) {
            setCloudOnlineState(true);
            hasPolledCloudHistory = true;
        }
    } catch (e) {}
}

function requestCloudStateSnapshot() {
    publishEventToCloud({
        type: "REQUEST_CLASSROOM_SNAPSHOT",
        senderId: getMyClientId(),
        timestamp: Date.now()
    });
}

        function getActiveDetailModalCode() {
            const m = document.getElementById("detailModal");
            if (m && m.classList.contains("open")) {
                const codeEl = document.getElementById("detailCode");
                return codeEl ? codeEl.textContent.trim() : "";
            }
            return "";
        }

        function initSituationRealtimeSync() {
            // 1. Tải danh sách bài nộp của học sinh từ localStorage
            try {
                const rawSubs = localStorage.getItem("situation_student_submissions");
                if (rawSubs) {
                    studentSubmissions = JSON.parse(rawSubs);
                }
            } catch (e) {
                console.warn("Lỗi tải submissions:", e);
            }

            // 2. Tải danh sách bài học sinh đã lưu (bookmarks)
            try {
                const rawBm = localStorage.getItem("situation_student_bookmarks");
                if (rawBm) {
                    studentBookmarks = new Set(JSON.parse(rawBm));
                }
            } catch (e) {
                console.warn("Lỗi tải bookmarks:", e);
            }

            // 3. Khởi tạo BroadcastChannel kết nối tức thì các Tab trình duyệt
            if (typeof BroadcastChannel !== "undefined") {
                try {
                    syncChannel = new BroadcastChannel("situation_interactive_sync");
                    syncChannel.onmessage = (event) => {
                        if (event && event.data) {
                            handleIncomingSyncEvent(event.data);
                        }
                    };
                } catch (e) {
                    console.warn("BroadcastChannel error:", e);
                }
            }

            // 4. Lắng nghe storage event (Hỗ trợ đa cửa sổ / cross-window fallback)
            if (typeof window !== "undefined") {
                window.addEventListener("storage", (e) => {
                    if (e.key === "situation_last_sync_event" && e.newValue) {
                        try {
                            const data = JSON.parse(e.newValue);
                            handleIncomingSyncEvent(data);
                        } catch (err) { }
                    } else if (e.key === "situation_teacher_posts" || e.key === "situation_deleted_codes") {
                        loadSavedTeacherPosts();
                        applyCatalogFilters();
                        renderDocuments();
                        updateHomeCounters();
                        updateRagCounters();
                        updateSyncAuditDisplay();
                    } else if (e.key === "situation_student_submissions") {
                        try {
                            studentSubmissions = JSON.parse(e.newValue || "[]");
                            renderTeacherSubmissionsList();
                            updateTeacherSubmissionsCountBadge();
                            updateSyncAuditDisplay();
                        } catch (err) { }
                    }
                });
            }

            // 5. Tự động làm tươi CSDL khi người dùng chuyển Tab (Focus / VisibilityChange)
            if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
                window.addEventListener("focus", handleTabReactivation);
            }
            if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
                document.addEventListener("visibilitychange", () => {
                    if (document.visibilityState === "visible") {
                        handleTabReactivation();
                    }
                });
            }

            // 6. Khởi động bộ lập lịch tự động kiểm tra định kỳ (Auto-sync Heartbeat thông minh)
            if (syncHeartbeatTimer) clearInterval(syncHeartbeatTimer);
            syncHeartbeatTimer = setInterval(() => {
                runPeriodicSyncHeartbeat();
            }, 5000);

            // 7. Khởi chạy luồng SSE Realtime & Kiểm tra kết nối máy chủ
            connectServerSSE();
            checkServerSync(false);

            // 8. Khởi chạy luồng Đám mây Toàn cầu (Global Cloud Live Relay)
            connectCloudSSE();
            pollCloudRecentHistory();
            setTimeout(() => {
                requestCloudStateSnapshot();
            }, 1000);

            updateTeacherSubmissionsCountBadge();
            updateSyncStatusDisplay();
            updateSyncAuditDisplay();
        }

        // ==========================================
        // KẾT NỐI KÊNH SERVER-SENT EVENTS (SSE REALTIME PUSH)
        // ==========================================
        function connectServerSSE() {
            if (typeof EventSource === "undefined" || !syncServerUrl) return;
            if (sseEventSource && sseEventSource.readyState !== EventSource.CLOSED) {
                return;
            }
            try {
                if (sseEventSource) {
                    try { sseEventSource.close(); } catch (e) { }
                    sseEventSource = null;
                }
                sseEventSource = new EventSource(`${syncServerUrl}/api/sync/events`);
                sseEventSource.onopen = () => {
                    setSyncServerOnlineState(true);
                };
                sseEventSource.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (!data) return;
                        setSyncServerOnlineState(true);
                        if (data.event) {
                            handleIncomingSyncEvent(data.event);
                        } else if (data.version && data.version > lastKnownServerVersion) {
                            checkServerSync(false, true);
                        }
                    } catch (e) { }
                };
                sseEventSource.onerror = () => {
                    if (sseEventSource) {
                        try { sseEventSource.close(); } catch (e) { }
                        sseEventSource = null;
                    }
                };
            } catch (err) { }
        }

        // ==========================================
        // SINGLE SOURCE OF TRUTH: COMMIT DATABASE MUTATION
        // ĐẢM BẢO THÊM GÌ XÓA GÌ ĐỀU ĐỒNG BỘ Y HỆT NHAU 100%
        // ==========================================
        function commitDatabaseMutation(mutationType, payload = {}, options = {}) {
            if (!mutationType) return;

            // 1. BIẾN ĐỔI BỘ NHỚ RAM & PERSISTENCE CHO TỪNG LOẠI HÀNH ĐỘNG
            if (mutationType === 'TEACHER_POST_SAVED') {
                const post = payload.post || payload;
                const doc = payload.doc;
                if (!post) return;

                // Xóa khỏi danh sách đã xóa nếu mã này từng bị xóa trước đó
                removeDeletedCode(post.code);

                const existCatIdx = catalogData.findIndex(i => i.code === post.code);
                if (existCatIdx >= 0) catalogData[existCatIdx] = post;
                else catalogData.unshift(post);

                if (doc) {
                    const existDocIdx = documentStore.findIndex(d => d.id === doc.id || d.code === post.code);
                    if (existDocIdx >= 0) documentStore[existDocIdx] = doc;
                    else documentStore.unshift(doc);
                }

                if (window.SituationDB) {
                    try {
                        window.SituationDB.insertCatalogItem(post);
                        if (doc) window.SituationDB.insertDocument(doc);
                    } catch (e) { }
                }
                saveTeacherPostsToStorage();

            } else if (mutationType === 'TEACHER_POST_DELETED') {
                const code = payload.code;
                if (!code) return;

                addDeletedCode(code);
                catalogData = catalogData.filter(i => i.code !== code);
                const docId = `DOC-${code.replace(/[^A-Z0-9]/gi, "")}`;
                documentStore = documentStore.filter(d => d.code !== code && d.id !== docId);

                if (window.SituationDB) {
                    try {
                        window.SituationDB.deleteCatalogItem(code);
                        window.SituationDB.deleteDocument(docId);
                    } catch (e) { }
                }
                if (typeof selectedManagePostCodes !== 'undefined' && selectedManagePostCodes.delete) {
                    selectedManagePostCodes.delete(code);
                }
                saveTeacherPostsToStorage();

                if (getActiveDetailModalCode() === code) {
                    closeDetailModal();
                }
            } else if (mutationType === 'TEACHER_POSTS_BULK_DELETED') {
                const codes = Array.isArray(payload.codes) ? payload.codes : [];
                if (codes.length === 0) return;

                addDeletedCodes(codes);
                catalogData = catalogData.filter(i => !codes.includes(i.code));
                if (typeof window !== "undefined") {
                    window.catalogData = catalogData;
                }
                codes.forEach(code => {
                    const docId = `DOC-${code.replace(/[^A-Z0-9]/gi, "")}`;
                    documentStore = documentStore.filter(d => d.code !== code && d.id !== docId);
                    if (window.SituationDB) {
                        try {
                            window.SituationDB.deleteCatalogItem(code);
                            window.SituationDB.deleteDocument(docId);
                        } catch (e) { }
                    }
                    if (typeof selectedManagePostCodes !== 'undefined' && selectedManagePostCodes.delete) {
                        selectedManagePostCodes.delete(code);
                    }
                });
                if (typeof window !== "undefined") {
                    window.documentStore = documentStore;
                }
                saveTeacherPostsToStorage();

                const activeModalCode = getActiveDetailModalCode();
                if (codes.includes(activeModalCode)) {
                    closeDetailModal();
                }

            } else if (mutationType === 'DOCUMENT_SAVED') {
                const doc = payload.doc;
                if (!doc) return;
                const docIdx = documentStore.findIndex(d => d.id === doc.id);
                if (docIdx >= 0) documentStore[docIdx] = doc;
                else documentStore.unshift(doc);

                if (window.SituationDB) {
                    try { window.SituationDB.insertDocument(doc); } catch (e) { }
                }
                saveTeacherPostsToStorage();

            } else if (mutationType === 'DOCUMENT_DELETED') {
                const docId = payload.docId;
                if (!docId) return;
                documentStore = documentStore.filter(d => d.id !== docId);

                if (window.SituationDB) {
                    try { window.SituationDB.deleteDocument(docId); } catch (e) { }
                }
                saveTeacherPostsToStorage();

            } else if (mutationType === 'STUDENT_SUBMISSION_CREATED') {
                const sub = payload;
                if (!sub || !sub.id) return;
                const sIdx = studentSubmissions.findIndex(s => s.id === sub.id);
                if (sIdx >= 0) studentSubmissions[sIdx] = sub;
                else studentSubmissions.unshift(sub);
                try {
                    localStorage.setItem("situation_student_submissions", JSON.stringify(studentSubmissions));
                } catch (e) { }

            } else if (mutationType === 'TEACHER_FEEDBACK_SAVED') {
                const sub = payload;
                if (!sub || !sub.id) return;
                const sIdx = studentSubmissions.findIndex(s => s.id === sub.id);
                if (sIdx >= 0) studentSubmissions[sIdx] = sub;
                try {
                    localStorage.setItem("situation_student_submissions", JSON.stringify(studentSubmissions));
                } catch (e) { }

                const detailModal = document.getElementById("detailModal");
                if (detailModal && detailModal.classList.contains("open")) {
                    const curCode = getActiveDetailModalCode();
                    if (curCode === sub.postCode) {
                        openDetailModal(curCode);
                    }
                }

            } else if (mutationType === 'RESTORE_DEFAULT_DATA') {
                localStorage.removeItem("situation_deleted_codes");
                localStorage.removeItem("situation_teacher_posts");
                localStorage.removeItem("situation_teacher_docs");
                localStorage.removeItem("situation_custom_docs");
                localStorage.removeItem("situation_student_submissions");

                if (typeof INITIAL_CATALOG_DATA !== 'undefined') {
                    catalogData = JSON.parse(JSON.stringify(INITIAL_CATALOG_DATA));
                }
                if (typeof INITIAL_DOCUMENTS_DATA !== 'undefined') {
                    documentStore = JSON.parse(JSON.stringify(INITIAL_DOCUMENTS_DATA));
                }
                studentSubmissions = [];

                if (window.SituationDB) {
                    try { window.SituationDB.resetToDefaultSeed(); } catch (e) { }
                }

            } else if (mutationType === 'FULL_DATABASE_SYNC') {
                if (payload && typeof payload === 'object') {
                    if (Array.isArray(payload.teacherPosts)) {
                        localStorage.setItem("situation_teacher_posts", JSON.stringify(payload.teacherPosts));
                    }
                    if (Array.isArray(payload.teacherDocs)) {
                        localStorage.setItem("situation_teacher_docs", JSON.stringify(payload.teacherDocs));
                    }
                    if (Array.isArray(payload.customDocs)) {
                        localStorage.setItem("situation_custom_docs", JSON.stringify(payload.customDocs));
                    }
                    if (Array.isArray(payload.deletedCodes)) {
                        localStorage.setItem("situation_deleted_codes", JSON.stringify(payload.deletedCodes));
                    }
                    if (Array.isArray(payload.studentSubmissions)) {
                        localStorage.setItem("situation_student_submissions", JSON.stringify(payload.studentSubmissions));
                    }
                }
                loadSavedTeacherPosts();
                try {
                    const rawSubs = localStorage.getItem("situation_student_submissions");
                    if (rawSubs) {
                        studentSubmissions = JSON.parse(rawSubs);
                    }
                } catch (e) { }
            }

            if (typeof window !== "undefined") {
                window.catalogData = catalogData;
                window.documentStore = documentStore;
                window.studentSubmissions = studentSubmissions;
            }

            // 2. TỰ ĐỘNG ĐỒNG BỘ TOÀN BỘ GIAO DIỆN CỦA MỌI TRANG VÀ TAB
            applyCatalogFilters();
            renderDocuments();
            updateHomeCounters();
            updateRagCounters();
            populateFilterDropdowns();
            updateTeacherPostCountBadge();
            updateTeacherSubmissionsCountBadge();
            if (typeof renderTeacherPostsManageList === 'function') {
                renderTeacherPostsManageList();
            }
            if (typeof renderTeacherSubmissionsList === 'function') {
                renderTeacherSubmissionsList();
            }
            updateSyncAuditDisplay();

            // 3. PHÁT SÓNG REALTIME NỘI BỘ (BROADCASTCHANNEL & STORAGE)
            if (!options.fromBroadcast && mutationType !== 'FULL_DATABASE_SYNC') {
                broadcastSyncEvent(mutationType, payload);
            }

            // 4. PHÁT SÓNG REALTIME QUA MÁY CHỦ MẠNG LAN / SERVER
            if (!options.fromServer && !options.fromBroadcast && mutationType !== 'FULL_DATABASE_SYNC') {
                sendMutationToServer(mutationType, payload);
            }

            // 5. PHÁT SÓNG REALTIME QUA ĐÁM MÂY TOÀN CẦU (GLOBAL CLOUD CHANNEL)
            if (!options.fromCloud && !options.fromBroadcast && mutationType !== 'FULL_DATABASE_SYNC') {
                publishEventToCloud({
                    type: mutationType,
                    payload: payload,
                    senderId: getMyClientId(),
                    room: getCloudRoomCode(),
                    timestamp: Date.now()
                });
            }
        }

        function broadcastSyncEvent(type, payload) {
            const msg = {
                id: "evt_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2, 7),
                type,
                payload,
                senderId: getMyClientId(),
                timestamp: Date.now()
            };
            seenEventIds.add(msg.id);
            if (syncChannel) {
                try {
                    syncChannel.postMessage(msg);
                } catch (e) { }
            }
            try {
                localStorage.setItem("situation_last_sync_event", JSON.stringify(msg));
            } catch (e) { }
        }

        function handleIncomingSyncEvent(data, options = {}) {
            if (!data || !data.type) return;

            // Bỏ qua nếu là sự kiện do chính tab/thiết bị này phát ra
            if (data.senderId && data.senderId === getMyClientId()) return;

            // Bỏ qua nếu sự kiện đã được xử lý qua kênh khác
            if (data.id && hasProcessedEvent(data.id)) return;

            // Xử lý yêu cầu đồng bộ snapshot toàn phòng học
            if (data.type === "REQUEST_CLASSROOM_SNAPSHOT") {
                let posts = [];
                try {
                    const raw = localStorage.getItem("situation_teacher_posts");
                    if (raw) posts = JSON.parse(raw);
                } catch (e) {}
                const deletedCodes = getDeletedCodes();
                // Chỉ phản hồi nếu thiết bị này thực sự có bài đăng hoặc mã đã xóa
                if (posts.length > 0 || deletedCodes.length > 0) {
                    try {
                        publishEventToCloud({
                            type: "CLASSROOM_SNAPSHOT_RESPONSE",
                            targetId: data.senderId,
                            senderId: getMyClientId(),
                            room: getCloudRoomCode(),
                            payload: {
                                teacherPosts: posts,
                                teacherDocs: JSON.parse(localStorage.getItem("situation_teacher_docs") || "[]"),
                                customDocs: JSON.parse(localStorage.getItem("situation_custom_docs") || "[]"),
                                deletedCodes: deletedCodes,
                                studentSubmissions: studentSubmissions
                            }
                        });
                    } catch (e) {}
                }
                return;
            } else if (data.type === "CLASSROOM_SNAPSHOT_RESPONSE") {
                if (data.targetId === getMyClientId() && data.payload) {
                    applyFullServerSync(data.payload);
                }
                return;
            }

            const payload = data.payload || {};

            // Thực hiện biến đổi dữ liệu với cờ fromBroadcast = true, fromServer = true, fromCloud = true để triệt tiêu vòng lặp echo
            commitDatabaseMutation(data.type, payload, { fromBroadcast: true, fromServer: true, fromCloud: true });

            // Hiển thị Toast thông báo tương ứng cho người dùng nếu không bật chế độ im lặng
            if (!options.silentToast) {
                if (data.type === "TEACHER_POST_SAVED") {
                    const post = payload.post || payload;
                    showSituationToast({
                        title: "🔔 THẦY/CÔ VỪA ĐĂNG BÀI MỚI!",
                        message: `${payload.author || post.author || "Giáo viên"} (${post.school || "THPT"}) vừa biên soạn: "${payload.lesson || post.lesson}".`,
                        badge: "👨‍🏫",
                        code: post.code,
                        actionText: "👁️ Xem bài ngay",
                        onAction: () => openDetailModal(post.code, true)
                    });
                } else if (data.type === "TEACHER_POST_DELETED") {
                    showSituationToast({
                        title: "🗑️ Cập nhật Danh mục",
                        message: `Bài học mã ${payload.code} đã được giáo viên xóa khỏi hệ thống.`,
                        badge: "ℹ️"
                    });
                } else if (data.type === "TEACHER_POSTS_BULK_DELETED") {
                    const count = payload.codes ? payload.codes.length : 0;
                    showSituationToast({
                        title: "🗑️ Cập nhật Danh mục",
                        message: `Giáo viên đã xóa ${count} bài đăng khỏi hệ thống.`,
                        badge: "ℹ️"
                    });
                } else if (data.type === "DOCUMENT_SAVED") {
                    showSituationToast({
                        title: "📁 Kho Tư liệu Cập nhật",
                        message: `Tài liệu mới đã được thêm vào Kho kiến thức.`,
                        badge: "📚"
                    });
                } else if (data.type === "DOCUMENT_DELETED") {
                    showSituationToast({
                        title: "📁 Kho Tư liệu Cập nhật",
                        message: `Một tài liệu đã được gỡ khỏi Kho kiến thức.`,
                        badge: "ℹ️"
                    });
                } else if (data.type === "STUDENT_SUBMISSION_CREATED") {
                    const sub = payload;
                    showSituationToast({
                        title: "📬 BÀI NỘP MỚI TỪ HỌC SINH!",
                        message: `${sub.studentName} vừa nộp kịch bản phân vai [${sub.roleName}] cho bài "${sub.lessonTitle || sub.postCode}".`,
                        badge: "🎓",
                        code: sub.postCode,
                        actionText: "📝 Xem & Chấm bài",
                        onAction: () => {
                            if (!isTeacherAuthenticated) openTeacherAuthGate(sub.postCode);
                            else {
                                openTeacherPostModal();
                                switchTeacherModalTab('submissions');
                            }
                        }
                    });
                } else if (data.type === "TEACHER_FEEDBACK_SAVED") {
                    const sub = payload;
                    showSituationToast({
                        title: "⭐ THẦY/CÔ ĐÃ CHẤM ĐIỂM KỊCH BẢN!",
                        message: `Bài kịch bản của ${sub.studentName} đã được chấm: ${sub.teacherGrade}. Nhấp để xem nhận xét!`,
                        badge: "🏆",
                        code: sub.postCode,
                        actionText: "📖 Xem lời phê",
                        onAction: () => openDetailModal(sub.postCode, true)
                    });
                } else if (data.type === "RESTORE_DEFAULT_DATA") {
                    showSituationToast({
                        title: "🔄 Khôi phục Dữ liệu Gốc",
                        message: "Toàn bộ 42 bài học chuẩn SGK đã được khôi phục đồng bộ trên mọi màn hình.",
                        badge: "🔄"
                    });
                }
            }
        }

        // ==========================================
        // GIAO TIẾP VỚI MÁY CHỦ ĐỒNG BỘ LAN / SERVER
        // ==========================================
        async function sendMutationToServer(mutationType, payload) {
            if (!syncServerUrl || mutationType === 'FULL_DATABASE_SYNC') return;
            try {
                const res = await fetch(`${syncServerUrl}/api/sync`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'COMMIT_MUTATION', mutationType, payload })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.version) {
                        lastKnownServerVersion = data.version;
                        setSyncServerOnlineState(true);
                    }
                }
            } catch (err) {
                setSyncServerOnlineState(false);
            }
        }

        let isCheckingServerSync = false;
        async function checkServerSync(isManualCheck = false, forceApply = false) {
            if (!syncServerUrl || isCheckingServerSync) return;
            isCheckingServerSync = true;
            try {
                const shouldCheckVersion = !forceApply && lastKnownServerVersion > 0;
                const versionParam = shouldCheckVersion ? `?version=${lastKnownServerVersion}` : (forceApply ? '?force=true' : '');
                const headers = { 'Cache-Control': 'no-cache' };
                if (shouldCheckVersion) {
                    headers['X-Sync-Version'] = String(lastKnownServerVersion);
                } else if (forceApply) {
                    headers['X-Force-Apply'] = 'true';
                }

                const res = await fetch(`${syncServerUrl}/api/sync${versionParam}`, {
                    method: 'GET',
                    headers: headers
                });
                if (res.ok) {
                    const data = await res.json();
                    setSyncServerOnlineState(true);

                    // Nếu server trả về upToDate: true (dữ liệu không đổi), thoát ngay, không tốn CPU hay render lại DOM!
                    if (!forceApply && data && data.upToDate) {
                        if (isManualCheck) {
                            alert("🟢 KẾT NỐI MÁY CHỦ THÀNH CÔNG!\n\nDữ liệu đã ở trạng thái mới nhất 100%.");
                        }
                        return;
                    }

                    // Nếu server có dữ liệu mới hơn phiên hiện tại, hoặc được yêu cầu đồng bộ bắt buộc
                    if (forceApply || (data.version && data.version > lastKnownServerVersion) || lastKnownServerVersion === 0) {
                        lastKnownServerVersion = data.version || Date.now();
                        applyFullServerSync(data);
                    }
                    if (!serverNetworkInfo) {
                        fetchServerNetworkInfo();
                    }
                    if (isManualCheck) {
                        alert("🟢 KẾT NỐI MÁY CHỦ THÀNH CÔNG!\n\nHệ thống đang ở chế độ đồng bộ Live Multi-device 100%.");
                    }
                } else {
                    setSyncServerOnlineState(false);
                    if (isManualCheck) alert("⚠️ Máy chủ phản hồi mã lỗi: " + res.status);
                }
            } catch (err) {
                setSyncServerOnlineState(false);
                if (isManualCheck) {
                    alert("⚠️ Chưa kết nối được máy chủ tại: " + syncServerUrl + "\n\n(Vui lòng mở Terminal và chạy lệnh: node sync_server.js)");
                }
            } finally {
                isCheckingServerSync = false;
            }
        }

        function applyFullServerSync(data) {
            if (!data) return;
            if (Array.isArray(data.deletedCodes)) {
                localStorage.setItem("situation_deleted_codes", JSON.stringify(data.deletedCodes));
            }
            if (Array.isArray(data.teacherPosts)) {
                localStorage.setItem("situation_teacher_posts", JSON.stringify(data.teacherPosts));
            }
            if (Array.isArray(data.teacherDocs)) {
                localStorage.setItem("situation_teacher_docs", JSON.stringify(data.teacherDocs));
            }
            if (Array.isArray(data.customDocs)) {
                localStorage.setItem("situation_custom_docs", JSON.stringify(data.customDocs));
            }
            if (Array.isArray(data.studentSubmissions)) {
                studentSubmissions = data.studentSubmissions;
                localStorage.setItem("situation_student_submissions", JSON.stringify(studentSubmissions));
            }
            commitDatabaseMutation('FULL_DATABASE_SYNC', data, { fromServer: true });
        }

        let lastHeartbeatPollTime = 0;
        let lastCloudPollTime = 0;
        function runPeriodicSyncHeartbeat() {
            const now = Date.now();
            if (syncServerUrl) {
                const isSseConnected = sseEventSource && sseEventSource.readyState === EventSource.OPEN;

                if (!isSseConnected) {
                    // Nếu SSE chưa kết nối được, cố gắng kết nối lại
                    if (typeof EventSource !== "undefined" && (!sseEventSource || sseEventSource.readyState === EventSource.CLOSED)) {
                        connectServerSSE();
                    }
                    // Kiểm tra đồng bộ qua HTTP mỗi 5s khi mất SSE
                    if (now - lastHeartbeatPollTime >= 5000) {
                        lastHeartbeatPollTime = now;
                        checkServerSync(false);
                    }
                } else {
                    // Khi SSE đang OPEN bình thường (nhận real-time push <2ms):
                    // Chỉ kiểm tra nhẹ qua HTTP mỗi 30s một lần làm sanity check
                    if (now - lastHeartbeatPollTime >= 30000) {
                        lastHeartbeatPollTime = now;
                        checkServerSync(false);
                    }
                }
            }

            // Đảm bảo kênh Cloud SSE luôn mở để bắt kịp sự kiện tải lên và xóa bài
            if (typeof EventSource !== "undefined") {
                if (!cloudEventSource || cloudEventSource.readyState === EventSource.CLOSED) {
                    connectCloudSSE();
                }
            }

            // Fallback định kỳ thăm dò Cloud mỗi 5s phòng khi SSE bị ngắt hoặc firewall chặn
            if (now - lastCloudPollTime >= 5000) {
                lastCloudPollTime = now;
                pollCloudRecentHistory();
            }

            // 2. Làm tươi các chỉ số audit
            updateSyncAuditDisplay();
        }

        async function fetchServerNetworkInfo() {
            if (!syncServerUrl) return;
            try {
                const res = await fetch(`${syncServerUrl}/api/network-info`, {
                    headers: { 'Cache-Control': 'no-cache' }
                });
                if (res.ok) {
                    serverNetworkInfo = await res.json();
                    updateLanShareUrlDisplay();
                }
            } catch (e) { }
        }

        function updateLanShareUrlDisplay() {
            const container = document.getElementById("serverLanShareContainer");
            const textEl = document.getElementById("serverLanShareUrlText");
            if (!container || !textEl) return;

            let shareUrl = "";
            if (serverNetworkInfo && serverNetworkInfo.primaryLanUrl) {
                shareUrl = serverNetworkInfo.primaryLanUrl;
            } else if (typeof window !== "undefined" && window.location && window.location.protocol.startsWith("http")) {
                shareUrl = `${window.location.origin}/`;
            } else if (syncServerUrl) {
                shareUrl = syncServerUrl.endsWith("/") ? syncServerUrl : `${syncServerUrl}/`;
            }

            if (isSyncServerOnline && shareUrl) {
                container.style.display = "block";
                textEl.textContent = shareUrl;
            } else {
                container.style.display = "none";
            }
        }

        function copyLanShareUrl() {
            const textEl = document.getElementById("serverLanShareUrlText");
            const url = textEl ? textEl.textContent.trim() : (serverNetworkInfo?.primaryLanUrl || syncServerUrl);
            if (!url) return;
            if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(() => {
                    alert(`📋 ĐÃ SAO CHÉP ĐƯỜNG DẪN TRUY CẬP CHO HỌC SINH:\n\n${url}\n\nThầy/Cô hãy gửi liên kết này vào Zalo / Teams / Messenger để Học sinh và các máy khác cùng xem và tải kịch bản thời gian thực.`);
                }).catch(() => {
                    prompt("Sao chép liên kết chia sẻ cho Học sinh:", url);
                });
            } else {
                prompt("Sao chép liên kết chia sẻ cho Học sinh:", url);
            }
        }

        function setSyncServerOnlineState(isOnline) {
            isSyncServerOnline = Boolean(isOnline);
            updateSyncStatusDisplay();
        }

        function updateSyncStatusDisplay() {
            const badge = document.getElementById("syncServerBadge");
            const statusText = document.getElementById("syncServerBadgeStatus");
            const navText = document.getElementById("syncStatusBadgeText");
            const navDot = document.getElementById("syncPulseDot");
            const roomEl = document.getElementById("syncCurrentRoomCode");
            if (roomEl) roomEl.textContent = getCloudRoomCode();

            const isFileProto = (typeof window !== "undefined" && window.location && window.location.protocol === "file:");
            const hostname = (typeof window !== "undefined" && window.location && window.location.hostname || "").toLowerCase();
            const isNetlify = hostname.endsWith("netlify.app");

            if (isSyncServerOnline) {
                if (badge) {
                    badge.style.background = "#C8E6C9";
                    badge.style.color = "#1B5E20";
                }
                if (statusText) statusText.textContent = "🟢 Máy chủ + Cloud Online (Đồng bộ Toàn cầu 100%)";
                if (navText) navText.textContent = "🟢 Live Sync 100%";
                if (navDot) {
                    navDot.style.background = "#4CAF50";
                    navDot.style.boxShadow = "0 0 8px #81C784";
                }
            } else if (isCloudOnline) {
                if (badge) {
                    badge.style.background = "#E0F2F1";
                    badge.style.color = "#004D40";
                }
                if (statusText) statusText.textContent = `🌐 Đám mây Toàn cầu Live (Phòng: ${getCloudRoomCode()})`;
                if (navText) navText.textContent = "🌐 Cloud Live 100%";
                if (navDot) {
                    navDot.style.background = "#00897B";
                    navDot.style.boxShadow = "0 0 8px #80CBC4";
                }
            } else {
                if (badge) {
                    badge.style.background = isFileProto ? "#FFEBEE" : (isNetlify ? "#E0F2F1" : "#FFF3E0");
                    badge.style.color = isFileProto ? "#C62828" : (isNetlify ? "#00695C" : "#E65100");
                }
                if (statusText) {
                    statusText.textContent = isFileProto
                        ? "⚠️ Đang mở dạng file:// (Khuyến nghị mở qua http://localhost:8080/duan.html để tránh bị Safari cô lập)"
                        : (isNetlify ? `🌐 Netlify Cloud (Phòng: ${getCloudRoomCode()})` : "🟡 Chế độ Nội bộ Trình duyệt & Đa Tab");
                }
                if (navText) {
                    navText.textContent = isFileProto ? "⚠️ Mở qua :8080" : (isNetlify ? "🌐 Netlify Cloud" : "📡 Đồng bộ 100%");
                }
                if (navDot) {
                    navDot.style.background = isFileProto ? "#FF9800" : (isNetlify ? "#00897B" : "#81C784");
                    navDot.style.boxShadow = isFileProto ? "0 0 6px #FF9800" : (isNetlify ? "0 0 6px #80CBC4" : "0 0 6px #81C784");
                }
            }
        }

        function updateSyncAuditDisplay() {
            const elLessons = document.getElementById("syncAuditTotalLessons");
            const elDocs = document.getElementById("syncAuditTotalDocs");
            const elSubs = document.getElementById("syncAuditTotalSubs");
            const elDeleted = document.getElementById("syncAuditDeletedCodes");

            if (elLessons) elLessons.textContent = catalogData.length;
            if (elDocs) elDocs.textContent = documentStore.length;
            if (elSubs) elSubs.textContent = studentSubmissions.length;
            if (elDeleted) elDeleted.textContent = getDeletedCodes().length;
        }

        function applySyncServerUrlChange() {
            const input = document.getElementById("syncServerUrlInput");
            if (!input) return;
            const newUrl = input.value.trim().replace(/\/+$/, "");
            if (!newUrl) {
                alert("Vui lòng nhập địa chỉ máy chủ (VD: http://localhost:8080)");
                return;
            }
            syncServerUrl = newUrl;
            try {
                localStorage.setItem("situation_sync_server_url", newUrl);
            } catch (e) { }
            connectServerSSE();
            checkServerSync(true);
        }

        function applyCloudRoomCodeChange() {
            const input = document.getElementById("syncRoomCodeInput");
            if (!input) return;
            const newRoom = input.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
            if (!newRoom) {
                alert("Vui lòng nhập mã phòng hợp lệ (chữ và số không dấu)");
                return;
            }
            try {
                localStorage.setItem("situation_room_code", newRoom);
            } catch (e) {}
            if (cloudEventSource) {
                try { cloudEventSource.close(); } catch (e) {}
                cloudEventSource = null;
            }
            connectCloudSSE();
            pollCloudRecentHistory();
            updateSyncStatusDisplay();
            showSituationToast({
                title: "🌐 ĐÃ ĐỔI PHÒNG HỌC!",
                message: `Đang kết nối phòng: ${newRoom}`,
                badge: "🏫"
            });
        }

        // ==========================================
        // 1-CLICK SNAPSHOT CSDL TOÀN DIỆN (.JSON)
        // ==========================================
        function exportFullDatabaseSnapshot() {
            const snapshot = {
                format: "SITUATION_FULL_DATABASE_BACKUP",
                version: Date.now(),
                exportDate: new Date().toISOString(),
                stats: {
                    catalogTotal: catalogData.length,
                    docsTotal: documentStore.length,
                    submissionsTotal: studentSubmissions.length,
                    deletedTotal: getDeletedCodes().length
                },
                teacherPosts: catalogData.filter(i => i.originType === "TEACHER_CONTRIBUTED"),
                teacherDocs: documentStore.filter(d => catalogData.some(p => p.code === d.code && p.originType === "TEACHER_CONTRIBUTED")),
                customDocs: documentStore.filter(d => !d.id.startsWith("DOC-10") && !d.id.startsWith("DOC-11") && !d.id.startsWith("DOC-12") && !catalogData.some(p => p.code === d.code && p.originType === "TEACHER_CONTRIBUTED")),
                deletedCodes: getDeletedCodes(),
                studentSubmissions: studentSubmissions,
                studentBookmarks: [...studentBookmarks]
            };

            const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Situation_Full_Database_Snapshot_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showSituationToast({
                title: "📦 Xuất CSDL Thành Công!",
                message: `Đã xuất ${snapshot.stats.catalogTotal} bài học & ${snapshot.stats.docsTotal} tài liệu thành tệp snapshot JSON.`,
                badge: "✅"
            });
        }

        function importFullDatabaseSnapshotFile(file) {
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (!data || (!data.teacherPosts && !data.deletedCodes && !data.stats)) {
                        alert("Tệp JSON không đúng định dạng sao lưu CSDL Situation.");
                        return;
                    }

                    if (Array.isArray(data.deletedCodes)) {
                        localStorage.setItem("situation_deleted_codes", JSON.stringify(data.deletedCodes));
                    }
                    if (Array.isArray(data.teacherPosts)) {
                        localStorage.setItem("situation_teacher_posts", JSON.stringify(data.teacherPosts));
                    }
                    if (Array.isArray(data.teacherDocs)) {
                        localStorage.setItem("situation_teacher_docs", JSON.stringify(data.teacherDocs));
                    }
                    if (Array.isArray(data.customDocs)) {
                        localStorage.setItem("situation_custom_docs", JSON.stringify(data.customDocs));
                    }
                    if (Array.isArray(data.studentSubmissions)) {
                        studentSubmissions = data.studentSubmissions;
                        localStorage.setItem("situation_student_submissions", JSON.stringify(studentSubmissions));
                    }
                    if (Array.isArray(data.studentBookmarks)) {
                        studentBookmarks = new Set(data.studentBookmarks);
                        localStorage.setItem("situation_student_bookmarks", JSON.stringify(data.studentBookmarks));
                    }

                    loadSavedTeacherPosts();
                    commitDatabaseMutation('FULL_DATABASE_SYNC', data);

                    // Gửi toàn bộ lên Sync Server nếu đang online
                    if (isSyncServerOnline && syncServerUrl) {
                        try {
                            fetch(`${syncServerUrl}/api/sync`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    action: 'FULL_OVERWRITE',
                                    teacherPosts: data.teacherPosts || [],
                                    teacherDocs: data.teacherDocs || [],
                                    deletedCodes: data.deletedCodes || [],
                                    studentSubmissions: data.studentSubmissions || [],
                                    customDocs: data.customDocs || []
                                })
                            }).catch(() => { });
                        } catch (err) { }
                    }

                    alert("🎉 ĐÃ NẠP CƠ SỞ DỮ LIỆU THÀNH CÔNG 100%!\n\nMọi bài học, tệp Word/PDF và bài nộp đã được đồng bộ chuẩn xác trên toàn hệ thống.");
                } catch (err) {
                    alert("Lỗi khi đọc tệp JSON: " + err.message);
                }
            };
            reader.readAsText(file);
        }

        // --- TOAST NOTIFICATION SYSTEM ---
        

        function handleTabReactivation() {
            if (typeof loadSavedTeacherPosts === 'function') loadSavedTeacherPosts();
            if (typeof applyCatalogFilters === 'function') applyCatalogFilters();
            if (typeof renderDocuments === 'function') renderDocuments();
            if (typeof updateHomeCounters === 'function') updateHomeCounters();
            if (typeof updateRagCounters === 'function') updateRagCounters();
            if (typeof updateSyncAuditDisplay === 'function') updateSyncAuditDisplay();
            if (typeof renderTeacherPostsManageList === 'function') {
                renderTeacherPostsManageList();
            }
            if (syncServerUrl && typeof checkServerSync === 'function') {
                checkServerSync(false);
            }
            if (typeof connectCloudSSE === 'function') {
                connectCloudSSE();
            }
            if (typeof pollCloudRecentHistory === 'function') {
                pollCloudRecentHistory();
            }
        }

if (typeof window !== "undefined") {
    window.initSituationRealtimeSync = initSituationRealtimeSync;
    window.commitDatabaseMutation = commitDatabaseMutation;
    window.broadcastSyncEvent = broadcastSyncEvent;
    window.handleIncomingSyncEvent = handleIncomingSyncEvent;
    window.sendMutationToServer = sendMutationToServer;
    window.checkServerSync = checkServerSync;
    window.applyFullServerSync = applyFullServerSync;
    window.connectServerSSE = connectServerSSE;
    window.connectCloudSSE = connectCloudSSE;
    window.pollCloudRecentHistory = pollCloudRecentHistory;
    window.publishEventToCloud = publishEventToCloud;
    window.applyCloudRoomCodeChange = applyCloudRoomCodeChange;
    window.getCloudRoomCode = getCloudRoomCode;
    window.handleTabReactivation = handleTabReactivation;
    window.exportFullDatabaseSnapshot = exportFullDatabaseSnapshot;
    window.exportDatabaseSnapshot = exportFullDatabaseSnapshot;
    window.importFullDatabaseSnapshotFile = importFullDatabaseSnapshotFile;
    window.importDatabaseSnapshot = importFullDatabaseSnapshotFile;
    window.updateSyncAuditDisplay = updateSyncAuditDisplay;
    window.updateSyncStatusDisplay = updateSyncStatusDisplay;
    window.applySyncServerUrlChange = applySyncServerUrlChange;
    window.fetchServerNetworkInfo = fetchServerNetworkInfo;
    window.updateLanShareUrlDisplay = updateLanShareUrlDisplay;
    window.copyLanShareUrl = copyLanShareUrl;
    window.resolveSyncServerUrl = resolveSyncServerUrl;
    window.syncServerUrl = syncServerUrl;
}
