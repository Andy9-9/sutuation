#!/bin/bash
# ====================================================================
# KHỞI CHẠY HỆ THỐNG ĐỒNG BỘ THỜI GIAN THỰC SỬ TUATION (Node.js)
# ====================================================================

PORT=${PORT:-8080}
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "================================================================"
echo "   🚀 KHỞI ĐỘNG HỆ THỐNG LỊCH SỬ SỬ TUATION (REALTIME SYNC)"
echo "================================================================"

if ! command -v node &> /dev/null
then
    echo "❌ Lỗi: Chưa tìm thấy Node.js trên máy tính."
    echo "   Vui lòng cài đặt Node.js từ https://nodejs.org để chạy máy chủ đồng bộ."
    exit 1
fi

echo "🟢 Đang khởi động máy chủ tại cổng $PORT..."
echo ""

# Tự động mở trình duyệt sau 1 giây
(sleep 1 && (open "http://localhost:$PORT/" 2>/dev/null || xdg-open "http://localhost:$PORT/" 2>/dev/null)) &

node sync_server.js
