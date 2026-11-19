# Gửi cô Thuận — 20/11

Một "bộ phim" 3D nhỏ chạy trên trình duyệt: con thuyền giấy ra khơi, ngọn hải đăng soi đường, đảo C, cơn giông hóa cầu vồng, thành phố hệ thống, và cuối cùng là tấm thiệp 20/11.

Không cần cài đặt gì: chỉ là HTML + JavaScript, thư viện (three.js, GSAP) tải từ CDN.

## Xem thử trên máy

Cần Node.js (đã có sẵn):

```bash
node tools/serve.mjs
```

Mở http://localhost:5173 → bấm **🎁 Mở quà**.

> Mở trực tiếp file `index.html` (double-click) sẽ **không** chạy được 3D, vì trình duyệt chặn module khi mở file cục bộ. Hãy dùng lệnh trên hoặc đưa lên GitHub Pages.

## Thêm nhạc riêng

Thả một file nhạc vào `assets/music.mp3` (đúng tên này). Trang sẽ tự phát bài đó và lặp lại.
Không có file → trang tự chơi một giai điệu hộp nhạc nhẹ nhàng.

## Đưa lên mạng bằng GitHub Pages

1. Tạo một repository mới trên GitHub (ví dụ `thiep-co-thuan`), rồi đẩy code lên:
   ```bash
   git remote add origin https://github.com/<tên-tài-khoản>/thiep-co-thuan.git
   git push -u origin main
   ```
2. Trên GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, chọn branch `main`, thư mục `/ (root)`, bấm **Save**.
3. Đợi 1–2 phút, link sẽ có dạng: `https://<tên-tài-khoản>.github.io/thiep-co-thuan/`
4. **Ảnh xem trước khi gửi qua Zalo/Messenger:** các ứng dụng chat cần đường dẫn ảnh đầy đủ. Sau khi có link, mở `index.html`, sửa dòng
   ```html
   <meta property="og:image" content="assets/og.png">
   ```
   thành
   ```html
   <meta property="og:image" content="https://<tên-tài-khoản>.github.io/thiep-co-thuan/assets/og.png">
   ```
   rồi commit và push lại.
5. Mở thử link trên điện thoại trước khi gửi cô.

## Nếu máy không chạy được 3D

Trên máy cũ hoặc khi mạng chặn CDN, trang tự chuyển sang **thiệp 2D** cùng màu sắc và lời chúc (sau tối đa 12 giây). Cô sẽ không bao giờ thấy màn hình trắng.

## Dành cho người sửa code

- Kiểm thử: `node --test tests/`
- Chụp màn hình tại một giây bất kỳ: `node tools/shoot.mjs "?autostart=1&t=60" 1280x720 shots/t60.png`
- Tham số URL: `?t=<giây>` tua và dừng, `?autostart=1` bỏ qua nút mở quà, `?nowebgl=1` xem thiệp 2D, `?forcefail=1` giả lập lỗi tải, `?quality=low|high`, `?debug=island|storm|rainbow|city|city-street|lights`.
- Lời thiệp, thuyết minh, thời lượng cảnh: `js/config.js`. Đường máy quay: `js/keys.js`. Dòng thời gian: `js/film.js`.
