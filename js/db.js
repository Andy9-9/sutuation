/**
 * ====================================================================
 * SITUATION RELATIONAL DATABASE & SQL STORAGE ENGINE (SituationDB)
 * ====================================================================
 * Hỗ trợ lưu trữ bền vững chuẩn Relational Database qua IndexedDB,
 * bộ máy thông dịch & thực thi truy vấn SQL (SQL Query Engine),
 * và xuất/nhập toàn bộ cơ sở dữ liệu dạng .sql dump chuẩn ANSI SQL.
 */

const getSeedCatalog = () => (typeof window !== 'undefined' && window.INITIAL_CATALOG_DATA) ? window.INITIAL_CATALOG_DATA : (typeof INITIAL_CATALOG_DATA !== 'undefined' ? INITIAL_CATALOG_DATA : []);
const getSeedDocuments = () => (typeof window !== 'undefined' && window.INITIAL_DOCUMENTS_DATA) ? window.INITIAL_DOCUMENTS_DATA : (typeof INITIAL_DOCUMENTS_DATA !== 'undefined' ? INITIAL_DOCUMENTS_DATA : []);

class SituationDBEngine {
  constructor() {
    this.dbName = "SituationDB_v2";
    this.version = 1;
    this.db = null;
    this.isReady = false;
    
    // In-memory relational cache
    this.catalog = (typeof window !== "undefined" && window.catalogData && window.catalogData.length > 0) ? [...window.catalogData] : [...getSeedCatalog()];
    this.documents = (typeof window !== "undefined" && window.documentStore && window.documentStore.length > 0) ? [...window.documentStore] : [...getSeedDocuments()];
    this.characters = [];
    this.chatSessions = [];
    this.chatMessages = [];
    this.settings = {};
  }

  // Khởi tạo IndexedDB và di trú dữ liệu
  async init() {
    if (typeof indexedDB === "undefined") {
      this.isReady = true;
      return this;
    }
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        
        // Bảng 1: catalog_items
        if (!db.objectStoreNames.contains("catalog_items")) {
          const store = db.createObjectStore("catalog_items", { keyPath: "code" });
          store.createIndex("grade", "grade", { unique: false });
          store.createIndex("format", "format", { unique: false });
          store.createIndex("topic", "topic", { unique: false });
          store.createIndex("originType", "originType", { unique: false });
        }

        // Bảng 2: documents
        if (!db.objectStoreNames.contains("documents")) {
          const docStore = db.createObjectStore("documents", { keyPath: "id" });
          docStore.createIndex("code", "code", { unique: false });
          docStore.createIndex("grade", "grade", { unique: false });
          docStore.createIndex("format", "format", { unique: false });
        }

        // Bảng 3: characters
        if (!db.objectStoreNames.contains("characters")) {
          const charStore = db.createObjectStore("characters", { keyPath: "id", autoIncrement: true });
          charStore.createIndex("itemCode", "itemCode", { unique: false });
          charStore.createIndex("type", "type", { unique: false });
        }

        // Bảng 4: chat_sessions
        if (!db.objectStoreNames.contains("chat_sessions")) {
          const sessStore = db.createObjectStore("chat_sessions", { keyPath: "id" });
          sessStore.createIndex("updatedAt", "updatedAt", { unique: false });
        }

        // Bảng 5: chat_messages
        if (!db.objectStoreNames.contains("chat_messages")) {
          const msgStore = db.createObjectStore("chat_messages", { keyPath: "id" });
          msgStore.createIndex("sessionId", "sessionId", { unique: false });
          msgStore.createIndex("createdAt", "createdAt", { unique: false });
        }

        // Bảng 6: app_settings
        if (!db.objectStoreNames.contains("app_settings")) {
          db.createObjectStore("app_settings", { keyPath: "key" });
        }
      };

      request.onsuccess = async (e) => {
        this.db = e.target.result;
        await this.syncFromStorage();
        this.isReady = true;
        resolve(this);
      };

      request.onerror = (e) => {
        console.error("Lỗi khởi tạo IndexedDB:", e.target.error);
        // Fallback in-memory
        this.catalog = [...getSeedCatalog()];
        this.documents = [...getSeedDocuments()];
        this.isReady = true;
        resolve(this);
      };
    });
  }

  // Đồng bộ và nạp dữ liệu từ IndexedDB vào bộ nhớ
  async syncFromStorage() {
    const catalogCount = await this.countTable("catalog_items");
    
    // Nếu rỗng, nạp dữ liệu gốc (seed)
    if (catalogCount === 0) {
      await this.seedInitialData();
    }

    // Nạp dữ liệu vào cache
    this.catalog = await this.getAllFromStore("catalog_items");
    this.documents = await this.getAllFromStore("documents");
    this.characters = await this.getAllFromStore("characters");
    this.chatSessions = await this.getAllFromStore("chat_sessions");
    this.chatMessages = await this.getAllFromStore("chat_messages");
    
    const settingsList = await this.getAllFromStore("app_settings");
    settingsList.forEach(s => { this.settings[s.key] = s.value; });

    // Kiểm tra danh sách bài đã xóa để KHÔNG tự động nạp lại
    let deletedCodes = [];
    try {
      deletedCodes = JSON.parse(localStorage.getItem("situation_deleted_codes") || "[]");
      if (!Array.isArray(deletedCodes)) deletedCodes = [];
    } catch(e) {
      deletedCodes = [];
    }

    // Đồng bộ bổ sung các bài học chuẩn SGK từ getSeedCatalog() chưa có trong database và KHÔNG nằm trong danh sách đã xóa
    for (const initItem of getSeedCatalog()) {
      if (!deletedCodes.includes(initItem.code) && !this.catalog.some(c => c.code === initItem.code)) {
        await this.insertCatalogItem(initItem);
      }
    }
    // Đồng bộ bổ sung các hồ sơ tư liệu xác thực từ getSeedDocuments() (không nằm trong danh sách đã xóa)
    for (const initDoc of getSeedDocuments()) {
      const isDocDeleted = deletedCodes.includes(initDoc.code) || deletedCodes.some(dc => initDoc.id === `DOC-${dc.replace(/[^A-Z0-9]/gi, "")}`);
      if (!isDocDeleted && !this.documents.some(d => d.id === initDoc.id)) {
        await this.insertDocument(initDoc);
      }
    }

    // Nạp thêm các bài do giáo viên lưu từ localStorage (nếu có để tương thích ngược)
    try {
      const legacyPosts = localStorage.getItem("situation_teacher_posts");
      if (legacyPosts) {
        const posts = JSON.parse(legacyPosts);
        for (const p of posts) {
          if (!deletedCodes.includes(p.code) && !this.catalog.some(c => c.code === p.code)) {
            await this.insertCatalogItem(p);
          }
        }
      }
    } catch(e) {}

    // Lọc triệt để các mã đã xóa khỏi cache trong memory
    if (deletedCodes.length > 0) {
      this.catalog = this.catalog.filter(c => !deletedCodes.includes(c.code));
      this.documents = this.documents.filter(d => !deletedCodes.includes(d.code) && !deletedCodes.some(dc => d.id === `DOC-${dc.replace(/[^A-Z0-9]/gi, "")}`));
    }

    // Cập nhật lại mảng toàn cục cho ứng dụng
    window.catalogData = this.catalog;
    window.documentStore = this.documents;
  }

  // Nạp seed data vào IndexedDB
  async seedInitialData() {
    const tx = this.db.transaction(["catalog_items", "documents", "characters", "chat_sessions", "chat_messages", "app_settings"], "readwrite");
    const catStore = tx.objectStore("catalog_items");
    const docStore = tx.objectStore("documents");
    const charStore = tx.objectStore("characters");
    const sessStore = tx.objectStore("chat_sessions");
    const msgStore = tx.objectStore("chat_messages");
    const setStore = tx.objectStore("app_settings");

    // Nạp catalog & nhân vật
    for (const item of getSeedCatalog()) {
      catStore.put(item);
      if (item.characters && item.characters.length > 0) {
        item.characters.forEach(c => {
          charStore.put({
            itemCode: item.code,
            name: c.name,
            type: c.type,
            desc: c.desc
          });
        });
      }
    }

    // Nạp documents
    for (const doc of getSeedDocuments()) {
      docStore.put(doc);
    }

    // Nạp phiên chat mặc định
    const defaultSess = {
      id: "sess-1",
      title: "Tra cứu Hoạt cảnh & Danh mục",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    sessStore.put(defaultSess);

    const defaultMsg = {
      id: "msg-1",
      sessionId: "sess-1",
      role: "bot",
      text: "Xin chào! Tôi là **Trợ lý AI Situation**. Tôi được kết nối trực tiếp với **Cơ sở Dữ liệu SQL & Kho tri thức RAG** của hệ thống.\n\nBạn có thể yêu cầu tôi tra cứu bài học, phân tích trọng tâm kiến thức và gợi ý kịch bản hoạt cảnh dựa trên dữ kiện đã kiểm chứng.",
      citations: ["10.04A", "DOC-1004A"],
      createdAt: new Date().toISOString()
    };
    msgStore.put(defaultMsg);

    // Cấu hình ban đầu
    setStore.put({ key: "system_initialized", value: "true" });
    setStore.put({ key: "installed_at", value: new Date().toISOString() });

    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  // Các hàm thao tác cơ bản (CRUD)
  async insertCatalogItem(item) {
    const baseCatalog = (typeof window !== "undefined" && window.catalogData && window.catalogData.length > 0) ? window.catalogData : (this.catalog || [...getSeedCatalog()]);
    this.catalog = baseCatalog.filter(i => i.code !== item.code);
    this.catalog.unshift(item);
    if (typeof window !== "undefined") {
      window.catalogData = this.catalog;
    }

    if (this.db) {
      const tx = this.db.transaction(["catalog_items", "characters"], "readwrite");
      tx.objectStore("catalog_items").put(item);

      if (item.characters && item.characters.length > 0) {
        const charStore = tx.objectStore("characters");
        item.characters.forEach(c => {
          charStore.put({
            itemCode: item.code,
            name: c.name,
            type: c.type,
            desc: c.desc
          });
        });
      }
    }
  }

  async deleteCatalogItem(code) {
    const baseCatalog = (typeof window !== "undefined" && window.catalogData && window.catalogData.length > 0) ? window.catalogData : (this.catalog || [...getSeedCatalog()]);
    this.catalog = baseCatalog.filter(i => i.code !== code);
    if (typeof window !== "undefined") {
      window.catalogData = this.catalog;
    }
    if (this.db) {
      const tx = this.db.transaction(["catalog_items"], "readwrite");
      tx.objectStore("catalog_items").delete(code);
    }
  }

  async insertDocument(doc) {
    const baseDocs = (typeof window !== "undefined" && window.documentStore && window.documentStore.length > 0) ? window.documentStore : (this.documents || [...getSeedDocuments()]);
    this.documents = baseDocs.filter(d => d.id !== doc.id && d.code !== doc.code);
    this.documents.unshift(doc);
    if (typeof window !== "undefined") {
      window.documentStore = this.documents;
    }
    if (this.db) {
      const tx = this.db.transaction(["documents"], "readwrite");
      tx.objectStore("documents").put(doc);
    }
  }

  async deleteDocument(id) {
    const baseDocs = (typeof window !== "undefined" && window.documentStore && window.documentStore.length > 0) ? window.documentStore : (this.documents || [...getSeedDocuments()]);
    this.documents = baseDocs.filter(d => d.id !== id);
    if (typeof window !== "undefined") {
      window.documentStore = this.documents;
    }
    if (this.db) {
      const tx = this.db.transaction(["documents"], "readwrite");
      tx.objectStore("documents").delete(id);
    }
  }

  async saveChatMessage(msg) {
    this.chatMessages.push(msg);
    if (this.db) {
      const tx = this.db.transaction(["chat_messages"], "readwrite");
      tx.objectStore("chat_messages").put(msg);
    }
  }

  async saveChatSession(sess) {
    const idx = this.chatSessions.findIndex(s => s.id === sess.id);
    if (idx >= 0) this.chatSessions[idx] = sess;
    else this.chatSessions.unshift(sess);

    if (this.db) {
      const tx = this.db.transaction(["chat_sessions"], "readwrite");
      tx.objectStore("chat_sessions").put(sess);
    }
  }

  async setSetting(key, value) {
    this.settings[key] = value;
    if (this.db) {
      const tx = this.db.transaction(["app_settings"], "readwrite");
      tx.objectStore("app_settings").put({ key, value });
    }
  }

  getSetting(key) {
    return this.settings[key] || null;
  }

  // ==========================================
  // SQL QUERY ENGINE (THỰC THI TRUY VẤN SQL THỰC)
  // ==========================================
  async querySQL(rawSql) {
    const startTime = performance.now();
    const cleanSql = rawSql.trim().replace(/;+$/, "");
    
    try {
      // Phân tích câu lệnh SELECT
      const selectMatch = cleanSql.match(/^SELECT\s+(.+?)\s+FROM\s+([a-zA-Z0-9_]+)(\s+WHERE\s+(.+?))?(\s+ORDER\s+BY\s+(.+?))?(\s+LIMIT\s+(\d+))?$/i);
      
      if (!selectMatch) {
        // Hỗ trợ SHOW TABLES
        if (/^SHOW\s+TABLES$/i.test(cleanSql)) {
          return {
            columns: ["Tables_in_SituationDB"],
            rows: [["catalog_items"], ["characters"], ["documents"], ["uploaded_word_files"], ["chat_sessions"], ["chat_messages"], ["app_settings"]],
            rowCount: 7,
            timeMs: (performance.now() - startTime).toFixed(2)
          };
        }
        throw new Error("Cú pháp SQL chưa hỗ trợ. Hãy dùng định dạng: SELECT [cột | *] FROM [bảng] WHERE [điều kiện] ORDER BY [cột] LIMIT [số]");
      }

      const [, rawCols, tableName, , whereClause, , orderByClause, , limitClause] = selectMatch;
      const tbl = tableName.toLowerCase();

      let targetData = [];
      const catList = (this.catalog && this.catalog.length > 0) ? this.catalog : (typeof window !== 'undefined' && window.catalogData ? window.catalogData : getSeedCatalog());
      const docList = (this.documents && this.documents.length > 0) ? this.documents : (typeof window !== 'undefined' && window.documentStore ? window.documentStore : getSeedDocuments());

      if (tbl === "catalog_items" || tbl === "catalog") {
        targetData = catList.map(c => ({
          code: c.code,
          grade: c.grade,
          topic: c.topic,
          lesson: c.lesson,
          format: c.format,
          focus: c.focus,
          origin_type: c.originType,
          author: c.author || "SGK Bộ GD&ĐT",
          school: c.school || "Chương trình GDPT",
          created_at: c.createdAt || "2026-10-21"
        }));
      } else if (tbl === "documents" || tbl === "docs") {
        targetData = docList.map(d => ({
          id: d.id,
          code: d.code,
          grade: d.grade,
          title: d.title,
          format: d.format,
          source: d.source,
          content: d.content ? d.content.slice(0, 150) + "..." : "",
          updated_at: d.updatedAt
        }));
      } else if (tbl === "characters") {
        targetData = [];
        const catalogList = (this.catalog && this.catalog.length > 0) ? this.catalog : (typeof window !== 'undefined' && window.catalogData ? window.catalogData : getSeedCatalog());
    const docList = (this.documents && this.documents.length > 0) ? this.documents : (typeof window !== 'undefined' && window.documentStore ? window.documentStore : getSeedDocuments());
    const msgList = this.chatMessages || [];

    catalogList.forEach(item => {
          if (item.characters && item.characters.length > 0) {
            item.characters.forEach(c => {
              targetData.push({
                item_code: item.code,
                name: c.name,
                role_type: c.type,
                description: c.desc
              });
            });
          }
        });
      } else if (tbl === "chat_messages") {
        targetData = this.chatMessages.map(m => ({
          id: m.id,
          session_id: m.sessionId,
          role: m.role,
          text: m.text ? m.text.slice(0, 120) + "..." : "",
          created_at: m.createdAt
        }));
      } else if (tbl === "chat_sessions") {
        targetData = this.chatSessions;
      } else if (tbl === "app_settings") {
        targetData = Object.entries(this.settings).map(([k, v]) => ({ key: k, value: String(v) }));
      } else if (tbl === "uploaded_word_files" || tbl === "files") {
        const catList = (this.catalog && this.catalog.length > 0) ? this.catalog : (typeof window !== 'undefined' && window.catalogData ? window.catalogData : []);
        targetData = catList.filter(i => i.fileData || i.fileName).map(i => ({
          code: i.code,
          lesson: i.lesson,
          grade: i.grade,
          author: i.author || "",
          auth_key_used: i.authKeyUsed || "N/A",
          auth_level: i.authLevel || "N/A",
          file_name: i.fileName || "document.docx",
          file_size_kb: i.fileSize ? Math.round(i.fileSize / 1024) : 0,
          created_at: i.createdAt || ""
        }));
      } else {
        throw new Error(`Bảng '${tableName}' không tồn tại trong SituationDB.`);
      }

      // Áp dụng mệnh đề WHERE
      if (whereClause) {
        targetData = targetData.filter(row => this.evaluateWhere(row, whereClause));
      }

      // Đếm COUNT(*)
      if (/^COUNT\(\*\)$/i.test(rawCols.trim())) {
        return {
          columns: ["COUNT(*)"],
          rows: [[targetData.length]],
          rowCount: 1,
          timeMs: (performance.now() - startTime).toFixed(2)
        };
      }

      // Áp dụng ORDER BY
      if (orderByClause) {
        const parts = orderByClause.trim().split(/\s+/);
        const col = parts[0];
        const isDesc = parts[1] && parts[1].toUpperCase() === "DESC";
        targetData.sort((a, b) => {
          const valA = String(a[col] || "");
          const valB = String(b[col] || "");
          return isDesc ? valB.localeCompare(valA, "vi") : valA.localeCompare(valB, "vi");
        });
      }

      // Áp dụng LIMIT
      if (limitClause) {
        const lim = parseInt(limitClause, 10);
        if (!isNaN(lim) && lim > 0) {
          targetData = targetData.slice(0, lim);
        }
      }

      // Chiếu các cột (SELECT columns)
      let columns = [];
      if (rawCols.trim() === "*") {
        columns = targetData.length > 0 ? Object.keys(targetData[0]) : ["Kết quả"];
      } else {
        columns = rawCols.split(",").map(c => c.trim());
      }

      const rows = targetData.map(item => {
        return columns.map(col => item[col] !== undefined ? item[col] : null);
      });

      return {
        columns,
        rows,
        rowCount: rows.length,
        timeMs: (performance.now() - startTime).toFixed(2)
      };
    } catch (err) {
      return {
        error: err.message,
        timeMs: (performance.now() - startTime).toFixed(2)
      };
    }
  }

  // Đánh giá điều kiện WHERE
  evaluateWhere(row, whereStr) {
    // Xử lý đơn giản cho AND / OR / LIKE / =
    const conditions = whereStr.split(/\s+AND\s+/i);
    return conditions.every(cond => {
      const eqMatch = cond.match(/^([a-zA-Z0-9_]+)\s*=\s*['"](.*?)['"]$/i);
      if (eqMatch) {
        const [, col, val] = eqMatch;
        return String(row[col] || "").toLowerCase() === val.toLowerCase();
      }

      const likeMatch = cond.match(/^([a-zA-Z0-9_]+)\s+LIKE\s+['"]%(.*?)%['"]$/i);
      if (likeMatch) {
        const [, col, val] = likeMatch;
        return String(row[col] || "").toLowerCase().includes(val.toLowerCase());
      }

      const inMatch = cond.match(/^([a-zA-Z0-9_]+)\s+IN\s*\((.+?)\)$/i);
      if (inMatch) {
        const [, col, rawList] = inMatch;
        const vals = rawList.split(",").map(v => v.trim().replace(/^['"]|['"]$/g, "").toLowerCase());
        return vals.includes(String(row[col] || "").toLowerCase());
      }

      return true;
    });
  }

  // ==========================================
  // XUẤT DATABASE SANG FILE .SQL CHUẨN ANSI SQL
  // ==========================================
  exportSQL() {
    const lines = [];
    const now = new Date().toISOString();
    const catalogList = (this.catalog && this.catalog.length > 0) ? this.catalog : (typeof window !== 'undefined' && window.catalogData ? window.catalogData : getSeedCatalog());
    const docList = (this.documents && this.documents.length > 0) ? this.documents : (typeof window !== 'undefined' && window.documentStore ? window.documentStore : getSeedDocuments());
    const msgList = this.chatMessages || [];
    
    lines.push(`-- ====================================================================`);
    lines.push(`-- SITUATION RELATIONAL DATABASE BACKUP (SQL DUMP)`);
    lines.push(`-- Nền tảng Tra cứu Lịch sử & Hoạt cảnh hóa THPT`);
    lines.push(`-- Ngày xuất: ${now}`);
    lines.push(`-- Phiên bản hệ quản trị: SituationSQL Engine 2.0 (ANSI SQL / SQLite / MySQL Compatible)`);
    lines.push(`-- ====================================================================\n`);

    lines.push(`-- 1. BẢNG DANH MỤC HOẠT CẢNH (catalog_items)`);
    lines.push(`DROP TABLE IF EXISTS characters;`);
    lines.push(`DROP TABLE IF EXISTS documents;`);
    lines.push(`DROP TABLE IF EXISTS catalog_items;\n`);

    lines.push(`CREATE TABLE catalog_items (`);
    lines.push(`  code VARCHAR(20) PRIMARY KEY,`);
    lines.push(`  grade VARCHAR(5) NOT NULL,`);
    lines.push(`  topic VARCHAR(255) NOT NULL,`);
    lines.push(`  lesson TEXT NOT NULL,`);
    lines.push(`  scenario TEXT NOT NULL,`);
    lines.push(`  format VARCHAR(100) NOT NULL,`);
    lines.push(`  focus TEXT NOT NULL,`);
    lines.push(`  origin_type VARCHAR(50) DEFAULT 'VERIFIED_ORIGINAL',`);
    lines.push(`  author VARCHAR(100),`);
    lines.push(`  school VARCHAR(200),`);
    lines.push(`  context TEXT,`);
    lines.push(`  sources TEXT,`);
    lines.push(`  created_at VARCHAR(20)`);
    lines.push(`);\n`);

    catalogList.forEach(item => {
      const escapeSql = (s) => (s ? `'${String(s).replace(/'/g, "''")}'` : "NULL");
      lines.push(`INSERT INTO catalog_items (code, grade, topic, lesson, scenario, format, focus, origin_type, author, school, context, sources, created_at) VALUES (` +
        `${escapeSql(item.code)}, ${escapeSql(item.grade)}, ${escapeSql(item.topic)}, ${escapeSql(item.lesson)}, ` +
        `${escapeSql(item.scenario)}, ${escapeSql(item.format)}, ${escapeSql(item.focus)}, ${escapeSql(item.originType)}, ` +
        `${escapeSql(item.author)}, ${escapeSql(item.school)}, ${escapeSql(item.context)}, ${escapeSql(item.sources)}, ${escapeSql(item.createdAt || '2026-10-21')}` +
      `);`);
    });

    lines.push(`\n-- 2. BẢNG PHÂN VAI NHÂN VẬT (characters)`);
    lines.push(`CREATE TABLE characters (`);
    lines.push(`  id INTEGER PRIMARY KEY AUTOINCREMENT,`);
    lines.push(`  item_code VARCHAR(20) NOT NULL,`);
    lines.push(`  name VARCHAR(100) NOT NULL,`);
    lines.push(`  role_type VARCHAR(50) NOT NULL,`);
    lines.push(`  description TEXT,`);
    lines.push(`  FOREIGN KEY (item_code) REFERENCES catalog_items(code) ON DELETE CASCADE`);
    lines.push(`);\n`);

    catalogList.forEach(item => {
      if (item.characters && item.characters.length > 0) {
        item.characters.forEach(c => {
          const escapeSql = (s) => (s ? `'${String(s).replace(/'/g, "''")}'` : "NULL");
          lines.push(`INSERT INTO characters (item_code, name, role_type, description) VALUES (` +
            `${escapeSql(item.code)}, ${escapeSql(c.name)}, ${escapeSql(c.type)}, ${escapeSql(c.desc)}` +
          `);`);
        });
      }
    });

    lines.push(`\n-- 3. BẢNG KHO TÀI LIỆU SỬ LIỆU (documents)`);
    lines.push(`CREATE TABLE documents (`);
    lines.push(`  id VARCHAR(50) PRIMARY KEY,`);
    lines.push(`  code VARCHAR(20),`);
    lines.push(`  grade VARCHAR(5),`);
    lines.push(`  format VARCHAR(20),`);
    lines.push(`  title VARCHAR(255) NOT NULL,`);
    lines.push(`  source TEXT,`);
    lines.push(`  content TEXT,`);
    lines.push(`  updated_at VARCHAR(20)`);
    lines.push(`);\n`);

    docList.forEach(doc => {
      const escapeSql = (s) => (s ? `'${String(s).replace(/'/g, "''")}'` : "NULL");
      lines.push(`INSERT INTO documents (id, code, grade, format, title, source, content, updated_at) VALUES (` +
        `${escapeSql(doc.id)}, ${escapeSql(doc.code)}, ${escapeSql(doc.grade)}, ${escapeSql(doc.format)}, ` +
        `${escapeSql(doc.title)}, ${escapeSql(doc.source)}, ${escapeSql(doc.content)}, ${escapeSql(doc.updatedAt)}` +
      `);`);
    });

    lines.push(`\n-- 4. BẢNG LỊCH SỬ CHATBOT AI (chat_messages)`);
    lines.push(`CREATE TABLE chat_messages (`);
    lines.push(`  id VARCHAR(50) PRIMARY KEY,`);
    lines.push(`  session_id VARCHAR(50) NOT NULL,`);
    lines.push(`  role VARCHAR(20) NOT NULL,`);
    lines.push(`  text TEXT NOT NULL,`);
    lines.push(`  citations TEXT,`);
    lines.push(`  created_at VARCHAR(20)`);
    lines.push(`);\n`);

    msgList.forEach(msg => {
      const escapeSql = (s) => (s ? `'${String(s).replace(/'/g, "''")}'` : "NULL");
      lines.push(`INSERT INTO chat_messages (id, session_id, role, text, citations, created_at) VALUES (` +
        `${escapeSql(msg.id)}, ${escapeSql(msg.sessionId)}, ${escapeSql(msg.role)}, ${escapeSql(msg.text)}, ` +
        `${escapeSql(JSON.stringify(msg.citations || []))}, ${escapeSql(msg.createdAt)}` +
      `);`);
    });

    lines.push(`\n-- 5. BẢNG TẬP TIN WORD LƯU TRỮ TRONG CSDL (uploaded_word_files)`);
    lines.push(`CREATE TABLE IF NOT EXISTS uploaded_word_files (`);
    lines.push(`  code VARCHAR(20) PRIMARY KEY,`);
    lines.push(`  lesson_title VARCHAR(255) NOT NULL,`);
    lines.push(`  grade VARCHAR(5) NOT NULL,`);
    lines.push(`  author VARCHAR(100),`);
    lines.push(`  auth_key_used VARCHAR(50),`);
    lines.push(`  auth_level VARCHAR(100),`);
    lines.push(`  file_name VARCHAR(255),`);
    lines.push(`  file_size INTEGER,`);
    lines.push(`  file_type VARCHAR(100),`);
    lines.push(`  file_data_base64 LONGTEXT,`);
    lines.push(`  uploaded_at VARCHAR(20)`);
    lines.push(`);\n`);

    const filesToExport = catalogList.filter(item => item.fileData || item.fileName);
    if (filesToExport.length === 0) {
      lines.push(`-- (Chưa có tệp Word nào do giáo viên tải lên trong phiên hiện tại)`);
    } else {
      filesToExport.forEach(item => {
        const escapeSql = (s) => (s ? `'${String(s).replace(/'/g, "''")}'` : "NULL");
        lines.push(`INSERT INTO uploaded_word_files (code, lesson_title, grade, author, auth_key_used, auth_level, file_name, file_size, file_type, file_data_base64, uploaded_at) VALUES (` +
          `${escapeSql(item.code)}, ${escapeSql(item.lesson)}, ${escapeSql(item.grade)}, ${escapeSql(item.author)}, ` +
          `${escapeSql(item.authKeyUsed)}, ${escapeSql(item.authLevel)}, ${escapeSql(item.fileName)}, ` +
          `${item.fileSize || 0}, ${escapeSql(item.fileType)}, ${escapeSql(item.fileData)}, ${escapeSql(item.createdAt || '2026-10-21')}` +
        `);`);
      });
    }

    lines.push(`\n-- HOÀN TẤT BẢN SAO LƯU SQL.`);
    return lines.join("\n");
  }

  // Nhập dữ liệu từ file .sql
  async importSQL(sqlContent) {
    const lines = sqlContent.split(/\r?\n/);
    let importedItems = 0;
    let importedDocs = 0;

    for (const line of lines) {
      const trimLine = line.trim();
      if (!trimLine || trimLine.startsWith("--")) continue;

      // Xử lý INSERT INTO catalog_items
      if (trimLine.startsWith("INSERT INTO catalog_items")) {
        const m = trimLine.match(/VALUES\s*\((.*)\);?$/i);
        if (m) {
          const values = this.parseSqlValues(m[1]);
          if (values.length >= 7) {
            const item = {
              code: values[0],
              grade: values[1],
              topic: values[2],
              lesson: values[3],
              scenario: values[4],
              format: values[5],
              focus: values[6],
              originType: values[7] || "VERIFIED_ORIGINAL",
              author: values[8] || "",
              school: values[9] || "",
              context: values[10] || "",
              sources: values[11] || "",
              createdAt: values[12] || new Date().toISOString().slice(0, 10),
              characters: [],
              relatedDocs: []
            };
            await this.insertCatalogItem(item);
            importedItems++;
          }
        }
      }
      // Xử lý INSERT INTO documents
      else if (trimLine.startsWith("INSERT INTO documents")) {
        const m = trimLine.match(/VALUES\s*\((.*)\);?$/i);
        if (m) {
          const values = this.parseSqlValues(m[1]);
          if (values.length >= 7) {
            const doc = {
              id: values[0],
              code: values[1],
              grade: values[2],
              format: values[3],
              title: values[4],
              source: values[5],
              content: values[6],
              updatedAt: values[7] || new Date().toISOString().slice(0, 10)
            };
            await this.insertDocument(doc);
            importedDocs++;
          }
        }
      }
    }

    return { importedItems, importedDocs };
  }

  parseSqlValues(str) {
    const result = [];
    let current = "";
    let inQuotes = false;
    let quoteChar = "";

    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if ((ch === "'" || ch === '"') && !inQuotes) {
        inQuotes = true;
        quoteChar = ch;
      } else if (ch === quoteChar && inQuotes) {
        if (str[i + 1] === quoteChar) {
          current += quoteChar;
          i++; // Bỏ qua escape quote
        } else {
          inQuotes = false;
        }
      } else if (ch === "," && !inQuotes) {
        result.push(current.trim() === "NULL" ? null : current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim() === "NULL" ? null : current.trim());
    return result;
  }

  // Các hàm phụ trợ thống kê
  async countTable(storeName) {
    if (!this.db) return 0;
    return new Promise((resolve) => {
      const tx = this.db.transaction([storeName], "readonly");
      const req = tx.objectStore(storeName).count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(0);
    });
  }

  async getAllFromStore(storeName) {
    if (!this.db) return [];
    return new Promise((resolve) => {
      const tx = this.db.transaction([storeName], "readonly");
      const req = tx.objectStore(storeName).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }
}

// Khởi tạo Singleton Database Engine
window.SituationDB = new SituationDBEngine();
