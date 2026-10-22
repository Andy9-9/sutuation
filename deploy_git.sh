#!/usr/bin/env bash
# Script hỗ trợ khởi tạo Git và chuẩn bị đẩy lên GitHub / Netlify
set -e

echo "=== KHỞI TẠO VÀ CHUẨN BỊ ĐẨY CODE LÊN GITHUB / NETLIFY ==="

if [ ! -d ".git" ]; then
  echo "-> Đang khởi tạo git repository..."
  git init
  git branch -M main
fi

echo "-> Thêm toàn bộ tệp vào git (đã bỏ qua tệp tạm theo .gitignore)..."
git add .

echo "-> Đang kiểm tra trạng thái git..."
git status -s

echo ""
echo "-> Tạo commit phát hành bản Netlify..."
git commit -m "Deploy: Sẵn sàng triển khai Netlify với Reader Mode và tối ưu đồng bộ" || echo "Không có thay đổi mới để commit."

echo ""
echo "=========================================================="
echo "🎉 HOÀN TẤT CHUẨN BỊ MÃ NGUỒN!"
echo ""
echo "Để đẩy lên GitHub của bạn, hãy chạy 2 lệnh sau:"
echo "  1) git remote add origin <URL_REPO_GITHUB_CUA_BAN>"
echo "  2) git push -u origin main"
echo ""
echo "Hoặc tải tệp 'netlify_deploy.zip' lên https://app.netlify.com/drop"
echo "=========================================================="
