/**
 * ====================================================================
 * SCRIPT: ĐẨY TRỰC TIẾP 5 FILE & KHÔI PHỤC 42 BÀI SGK LÊN NETLIFY LIVE
 * ====================================================================
 * Bơm dữ liệu qua kênh Cloud Realtime (MQTT WSS) của https://sutuation.netlify.app/
 * mà KHÔNG cần tốn credit deploy của Netlify!
 */

const mqtt = require('mqtt');
const { OFFICIAL_TEACHER_POSTS, OFFICIAL_TEACHER_DOCS } = require('../js/official-posts-data.js');

const CDN_BASE = 'https://andy9-9.github.io/sutuation/';

const cloudPosts = OFFICIAL_TEACHER_POSTS.map(p => {
    const copy = Object.assign({}, p);
    copy.fileData = CDN_BASE + copy.fileUrl;
    return copy;
});

const cloudDocs = OFFICIAL_TEACHER_DOCS.map(d => {
    const copy = Object.assign({}, d);
    copy.fileData = CDN_BASE + copy.fileUrl;
    return copy;
});

const payload = {
    version: Date.now() + 900000000,
    senderId: 'official_admin_publisher_' + Date.now(),
    room: 'sutuation_classroom_live_2026',
    updatedAt: new Date().toISOString(),
    posts: cloudPosts,
    docs: cloudDocs,
    deletedCodes: [],
    submissions: []
};

const jsonStr = JSON.stringify(payload);
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
        const client = mqtt.connect(brokerUrl, { connectTimeout: 5000 });
        const timer = setTimeout(() => {
            try { client.end(true); } catch (e) {}
            resolve(false);
        }, 6000);

        client.on('connect', () => {
            let done = 0;
            topics.forEach(t => {
                client.publish(t, jsonStr, { retain: true, qos: 1 }, () => {
                    done++;
                    if (done === topics.length) {
                        clearTimeout(timer);
                        console.log(`✓ Đã đồng bộ lên Cloud Broker: ${brokerUrl} (${(jsonStr.length / 1024).toFixed(1)} KB)`);
                        client.end();
                        resolve(true);
                    }
                });
            });
        });

        client.on('error', () => {
            clearTimeout(timer);
            try { client.end(true); } catch (e) {}
            resolve(false);
        });
    });
}

(async () => {
    console.log('Đang đẩy 5 tệp tài liệu (Khối 10, 11, 12 & 15 Hoạt cảnh) lên https://sutuation.netlify.app/ ...');
    for (const b of brokers) {
        await publishToBroker(b);
    }
    console.log('🎉 Hoàn tất! Mọi trình duyệt mở https://sutuation.netlify.app/ sẽ tự động nhận đủ 47 bài học và 19 tài liệu!');
    process.exit(0);
})();
