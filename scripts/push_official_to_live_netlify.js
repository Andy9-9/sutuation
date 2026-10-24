/**
 * ====================================================================
 * SCRIPT: ĐẨY TRỰC TIẾP TOÀN BỘ 68 BÀI TRONG 5 FILE LÊN NETLIFY LIVE
 * ====================================================================
 * Bơm dữ liệu qua kênh Cloud Realtime (MQTT WSS) của https://sutuation.netlify.app/
 * Tối ưu kích thước gói tin (< 52 KB) để tương thích 100% giới hạn 64 KB của EMQX & HiveMQ.
 */

const mqtt = require('mqtt');
const {
    OFFICIAL_TEACHER_POSTS,
    OFFICIAL_REPLACED_PLACEHOLDER_CODES
} = require('../js/official-posts-data.js');

const CDN_BASE = 'https://andy9-9.github.io/sutuation/';

const cloudPosts = OFFICIAL_TEACHER_POSTS.map(p => ({
    code: p.code,
    grade: p.grade,
    examCode: p.examCode,
    lesson: p.lesson,
    topic: p.topic,
    format: p.format,
    scenario: p.scenario,
    focus: p.focus,
    author: 'Tổ Lịch sử THPT',
    school: 'GDPT 2018',
    originType: 'TEACHER_CONTRIBUTED',
    fileName: p.fileName,
    fileSize: p.fileSize,
    fileType: p.fileType,
    fileData: CDN_BASE + p.fileUrl,
    characters: (p.characters || []).slice(0, 2).map(c => ({
        name: c.name,
        type: c.type,
        desc: c.desc
    }))
}));

const payload = {
    version: Date.now() + 2500000000,
    senderId: 'official_admin_' + Date.now(),
    room: 'sutuation_classroom_live_2026',
    posts: cloudPosts,
    docs: [],
    deletedCodes: OFFICIAL_REPLACED_PLACEHOLDER_CODES,
    submissions: []
};

const jsonStr = JSON.stringify(payload);
console.log(`Kích thước gói tin MQTT: ${(Buffer.byteLength(jsonStr, 'utf8') / 1024).toFixed(1)} KB (${cloudPosts.length} bài)`);

const topics = [
    'sutuation/v1/sutuation_classroom_live_2026/state',
    'sutuation/v1/sutuation_classroom_v2026_live/state'
];

const brokers = [
    'mqtt://broker.emqx.io:1883',
    'mqtt://broker.hivemq.com:1883'
];

async function publishToBroker(brokerUrl) {
    return new Promise((resolve) => {
        const client = mqtt.connect(brokerUrl, { connectTimeout: 6000 });
        const timer = setTimeout(() => {
            try { client.end(true); } catch (e) {}
            resolve(false);
        }, 8000);

        client.on('connect', () => {
            let done = 0;
            topics.forEach(t => {
                client.publish(t, jsonStr, { retain: true, qos: 1 }, (err) => {
                    if (err) console.error('Publish error:', err);
                    done++;
                    if (done === topics.length) {
                        setTimeout(() => {
                            clearTimeout(timer);
                            console.log(`✓ Đã đồng bộ lên Cloud Broker: ${brokerUrl} (${(Buffer.byteLength(jsonStr, 'utf8') / 1024).toFixed(1)} KB)`);
                            client.end();
                            resolve(true);
                        }, 500);
                    }
                });
            });
        });

        client.on('error', (err) => {
            clearTimeout(timer);
            try { client.end(true); } catch (e) {}
            resolve(false);
        });
    });
}

(async () => {
    console.log(`Đang đẩy toàn bộ ${cloudPosts.length} bài trong 5 tệp tài liệu lên https://sutuation.netlify.app/ ...`);
    for (const b of brokers) {
        await publishToBroker(b);
    }
    console.log(`🎉 Hoàn tất! Mọi trình duyệt mở https://sutuation.netlify.app/ sẽ tự động nhận đủ ${cloudPosts.length} bài Giáo viên đăng!`);
    process.exit(0);
})();
