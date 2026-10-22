# HƯỚNG DẪN ĐẨY LÊN NETLIFY (NETLIFY.APP) - BẢN TỔNG HỢP CUỐI CÙNG

Tất cả 12 bộ kiểm thử hệ thống đã vượt qua 100%. Giao diện xem bài (Reader Mode), đăng bài, xóa bài, hoàn tác và tối ưu hóa CDN edge đã sẵn sàng.

---

## CÁCH 1: KÉO THẢ TỆP ZIP (NHANH NHẤT - 15 GIÂY)
1. Đăng nhập vào: **https://app.netlify.com/drop**
2. Kéo thả tệp nén **`netlify_deploy.zip`** (đã được tạo sẵn trong thư mục dự án, dung lượng chỉ ~170KB) vào trang web Netlify.
3. Netlify sẽ tự động triển khai và cấp ngay tên miền miễn phí dạng `https://ten-du-an.netlify.app`.

---

## CÁCH 2: KÉO THẢ THƯ MỤC TRỰC TIẾP
1. Mở trang: **https://app.netlify.com/drop**
2. Kéo toàn bộ thư mục `/Users/andy/Documents/nguvan` thả vào cửa sổ trình duyệt.

---

## CÁCH 3: ĐẨY QUA GITHUB ĐỂ TỰ ĐỘNG CẬP NHẬT (CI/CD)
1. Chạy script tự động chuẩn bị git:
   ```bash
   ./deploy_git.sh
   ```
2. Liên kết với GitHub repo cá nhân của bạn:
   ```bash
   git remote add origin https://github.com/<tai-khoan>/<ten-repo>.git
   git push -u origin main
   ```
3. Trên Netlify: Chọn **Add new site** -> **Import from Git** -> Chọn Repo của bạn.

---

## CÁC TỆP CẤU HÌNH ĐÃ ĐƯỢC TỐI ƯU SẴN SÀNG:
- `index.html`: Giao diện gốc chạy trực tiếp từ trang chủ `/` không bao giờ gặp lỗi 404.
- `duan.html`: Tự động đồng bộ và rewrite từ `_redirects`.
- `_redirects`: Thiết lập điều hướng SPA chuẩn (`/* /index.html 200`).
- `netlify.toml`: Thiết lập nén gzip/brotli, bảo mật CSP, X-Frame-Options và cache.
- `_headers`: Ngăn chặn cache lỗi thời cho HTML/JS (`no-cache, must-revalidate`).
- `js/sync.js`: Tự động nhận biết môi trường tĩnh Netlify để kích hoạt chế độ **Client-First** mượt mà, không spam request, và tự động bắt URL backend nếu truyền `?server=https://...`.
