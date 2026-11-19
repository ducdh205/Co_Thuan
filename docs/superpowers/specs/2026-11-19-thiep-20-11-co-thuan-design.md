# Thiệp 20/11 tặng cô Thuận — Bản thiết kế

Ngày: 2026-11-19 · Người tặng: Thu Phương · Hạn: xem được vào **20/11/2026**

## 1. Ý định & lý do

Thu Phương muốn tặng cô Thuận một **trang web chạy như một đoạn phim** nhân ngày Nhà giáo Việt Nam 20/11.
Cô Thuận là người **dạy Phương môn lập trình C** và là người **đồng ý hướng dẫn đồ án tốt nghiệp** của Phương.
Phương hiện làm **BA (phân tích nghiệp vụ / phân tích hệ thống)**.

Câu chuyện: hành trình từ dòng C đầu tiên cô dạy → vượt qua lỗi nhờ cô → nhìn được cả hệ thống (góc nhìn BA) → đồ án tốt nghiệp có cô dẫn đường → tấm thiệp cảm ơn.
Kiến thức CNTT phải **lồng vào hình ảnh ẩn dụ**, không phải màn hình code.

## 2. Mục tiêu, phi mục tiêu, phản mục tiêu

**Mục tiêu**
- Cô mở một đường link, bấm "Mở quà", xem một bộ phim 3D tự chạy ~1,5–2 phút, kết thúc bằng tấm thiệp 20/11.
- Sống động, **màu tươi sáng, vui tươi** (tông "Bình minh rực rỡ").
- Ẩn dụ CNTT nhận ra được: C, biến, vòng lặp, con trỏ, lỗi biên dịch, cấu trúc dữ liệu/đồ thị, sơ đồ hệ thống.
- Chạy được trên **cả điện thoại lẫn laptop** (tự co theo màn hình, cả dọc lẫn ngang).

**Phi mục tiêu**
- Không có backend, đăng nhập, lưu dữ liệu.
- Không cần đa ngôn ngữ (chỉ tiếng Việt).
- Không cần người xem điều khiển camera; đây là phim, không phải game.

**Phản mục tiêu** (chạy được nhưng vẫn là thất bại)
- **Bó trong màn hình coding** (Phương đã nói rõ không muốn). Code chỉ xuất hiện như điểm nhấn nhỏ (vd. chữ trên cánh buồm, dòng `return 0;` cuối).
- Tông tối, u ám.
- Giật, đứng hình, hoặc màn trắng trên điện thoại của cô.
- Chữ tiếng Việt lỗi dấu.
- Lời chúc chung chung, không có dấu ấn cô Thuận – Thu Phương.

## 3. Ràng buộc

- **Thời gian:** phải xong và có link trước/trong ngày 20/11/2026 → ưu tiên độ mượt và hoàn thiện hơn số lượng hiệu ứng.
- **Ưu tiên thứ có sẵn:** không bước build, không cài npm; thư viện qua CDN; mô hình 3D dựng từ hình khối có sẵn của three.js (không tải model ngoài).
- Trình duyệt chặn tự phát âm thanh → bắt buộc có thao tác bấm trước khi phát nhạc.
- Thư mục dự án: `e:\CoThuan` (đang trống, không phải git repo).

## 4. Các cách đã cân nhắc

| Cách | Đánh đổi | Kết quả |
|---|---|---|
| **1. Thế giới 3D low-poly bằng three.js**, camera bay theo kịch bản, chữ & thiệp là HTML đè lên | "Như video", có chiều sâu, cảnh bay lên cao ấn tượng; nặng hơn trên máy yếu | **Đã chọn** (Phương: "tạo 3D, tạo web") |
| 2. Tranh 2D nhiều lớp (SVG + parallax) | Nhẹ, nhanh; mất cảm giác 3D, không dùng three.js | Loại |
| 3. Xuất thành file video .mp4 | Không còn là web, mất tương tác "mở quà" | Loại |

Hướng ẩn dụ: đã so 3 hướng (Vũ trụ tri thức / Hạt mầm thành cây / Hải đăng & con thuyền). Phương chọn **Hải đăng & con thuyền, thêm bầu trời đốm sáng của hướng Vũ trụ**.
Bảng màu: đã so 3 bảng (Bình minh / Pastel / Nhiệt đới). Phương chọn **Bình minh rực rỡ**.

## 5. Những gì Phương đã quyết

- Ẩn dụ chính: **con thuyền giấy nhỏ (Phương)** ra khơi, **ngọn hải đăng (cô Thuận)** dẫn đường, đích đến là **thành phố hệ thống**.
- Thêm từ hướng Vũ trụ: **bầu trời các đốm sáng kiến thức** lớn dần theo hành trình, nối thành chòm (đồ thị/cấu trúc dữ liệu).
- **Màu tươi sáng, vui tươi.** Bảng màu Bình minh rực rỡ:
  - Trời: `#ff9a8b` → `#ffc3a0` → `#ffe29f` (hồng cam đào → vàng nhạt)
  - Biển: `#4fd1c5` → `#2bb3c0` (xanh ngọc)
  - Điểm nhấn: hồng `#ff5c8a`, tím `#7b61ff`, vàng nắng `#ffd166`, trắng
- 3D, dạng web; công nghệ để Claude chọn, ưu tiên có sẵn.

## 6. Kịch bản (đề xuất của Claude, Phương đã xem qua khi chuyển sang tông sáng)

Mỗi cảnh có 1 dòng thuyết minh ngắn (HTML overlay, hiện/ẩn mềm). Thời lượng là gợi ý.

| # | Cảnh | Hình ảnh | Ẩn dụ CNTT | ~giây |
|---|---|---|---|---|
| 0 | **Mở quà** | Biển bình minh tĩnh, mờ; nút "🎁 Mở quà" + dòng "Gửi cô Thuận" | — | chờ bấm |
| 1 | **Bình minh trên biển** | Mặt trời nhô lên, biển gợn sóng; vài ký tự 0/1 lấp lánh trên mặt nước như ánh nắng | Biển dữ liệu nhị phân | 12 |
| 2 | **Ra khơi** | Thuyền giấy thả xuống nước; cánh buồm in `Hello, World!`; đốm sáng đầu tiên mang chữ "C" bay lên trời | Chương trình đầu tiên; môn C | 15 |
| 3 | **Đảo C** | Thuyền qua hòn đảo đầu tiên: hộp quà nhỏ = biến, dòng xoáy tròn = vòng lặp, mũi tên ánh sáng = con trỏ. Mỗi thứ bật lên → 1 đốm màu bay lên trời, nối thành chòm. **Hải đăng bật sáng lần đầu** | Biến, vòng lặp, con trỏ, đồ thị | 20 |
| 4 | **Mây giông ngắn** | Mây xám kéo đến, tia chớp mang chữ `Syntax error`, `Segmentation fault`; thuyền chao đảo. Tia hải đăng xuyên mây → mây tan thành hạt sáng → **cầu vồng** hiện ra | Lỗi biên dịch / runtime; cô giúp vượt qua | 18 |
| 5 | **Thành phố hệ thống** | Thuyền cập bờ thành phố ánh sáng: tòa nhà = module, đường phố = luồng dữ liệu, cầu = quan hệ giữa các bảng. Camera **bay vút lên**: nhìn từ trên, thành phố + chòm sao xếp thành một **sơ đồ hệ thống**. Một tòa nhà đang xây, biển "Đồ án tốt nghiệp", tia hải đăng chiếu tới | Phân tích hệ thống (BA), đồ án có cô hướng dẫn | 22 |
| 6 | **Thiệp 20/11** | Mọi đốm sáng bay về một điểm, nở như pháo hoa → tấm thiệp. Đốm sáng nhất đặt ở góc thiệp (cô là ngôi sao dẫn đường). Cuối thiệp dòng nhỏ `return 0; // cảm ơn cô` | Kết thúc chương trình thành công | giữ nguyên |

Sau cảnh 6: thiệp đứng yên, có nút **"Xem lại"** và nút **bật/tắt nhạc**.

**Lời thuyết minh (nháp, Phương có thể sửa):**
1. "Ngày ấy, thế giới với em chỉ là những con số 0 và 1…"
2. "Rồi em viết dòng đầu tiên: Hello, World!"
3. "Cô dạy em từng biến, từng vòng lặp, từng con trỏ…"
4. "Có những lúc chương trình báo lỗi đỏ rực. Cô luôn ở đó, soi đường."
5. "Giờ em nhìn thấy cả một hệ thống. Và đồ án của em vẫn có cô dẫn lối."
6. (thiệp)

**Tấm thiệp (Phương đã duyệt, giữ nguyên câu chữ):**
> **Kính gửi cô Thuận**
> Nhân ngày Nhà giáo Việt Nam 20/11, em xin cảm ơn cô — người đã dạy em những dòng C đầu tiên và nay tiếp tục dẫn đường cho đồ án tốt nghiệp của em. Chúc cô luôn mạnh khỏe, hạnh phúc và mãi là ngọn hải đăng của bao thế hệ học trò.
> *Em, Thu Phương*

## 7. Công nghệ (Claude chọn, theo tiêu chí "ưu tiên có sẵn")

- **HTML + JavaScript ES modules**, không build. `index.html` + `js/` + `css/`.
- **three.js** (bản cố định, vd. `three@0.160.0`) qua **import map** từ jsDelivr; dùng các addon có sẵn (vd. `EffectComposer` + `UnrealBloomPass` cho ánh sáng lung linh nếu máy đủ mạnh).
- **GSAP 3** (bản cố định, vd. `gsap@3.12.5`) làm **dòng thời gian phim**: một master timeline điều khiển camera, vật thể và chữ.
- **Mô hình:** dựng từ hình khối có sẵn của three.js (Cone, Cylinder, Box, Icosahedron, Plane biến dạng cho sóng), `flatShading` cho phong cách low-poly. Không tải file model ngoài.
- **Chữ 3D/ký tự trên mặt nước, cánh buồm:** vẽ lên `CanvasTexture` (đảm bảo dấu tiếng Việt), không dùng TextGeometry.
- **Font:** Google Fonts có tiếng Việt: **Be Vietnam Pro** (thuyết minh) + **Dancing Script** (chữ ký/tiêu đề thiệp).
- **Nhạc:** Phương không lo bản quyền (không bán) nhưng chưa đưa file. Trang tìm `assets/music.mp3`: có file → phát file đó (Phương có thể tự thả bài vào sau); không có → tự tạo giai điệu nhẹ nhàng, vui tươi bằng Web Audio API. Thời lượng phim không phụ thuộc độ dài bài nhạc (nhạc lặp/fade).
- **Hiệu năng/điện thoại:** giới hạn `devicePixelRatio` ≤ 2; tự giảm (tắt bloom, ít hạt hơn) khi màn nhỏ hoặc FPS thấp; camera/khung hình điều chỉnh cho màn dọc.
- **Đưa lên mạng:** Phương tự đưa lên GitHub sau (ví dụ GitHub Pages). Phía người xây: `git init` trong `e:\CoThuan`, commit bình thường; trang phải chạy được khi đặt ở thư mục con (đường dẫn tương đối, không dùng `/` tuyệt đối). Tên đề tài đồ án: không có → biển ghi "Đồ án tốt nghiệp".
- **Tương thích (Claude quyết):** chưa biết cô mở bằng máy/trình duyệt nào (có thể là trình duyệt trong Zalo/Messenger) nên:
  - Nạp `es-module-shims` (bản cố định) để import map chạy được trên trình duyệt cũ.
  - Kiểm tra WebGL khi tải; nếu không có WebGL hoặc three.js lỗi → hiện **thiệp 2D dự phòng** (cùng bảng màu, chữ thiệp, đốm sáng CSS bay, nhạc vẫn phát). Cô không bao giờ thấy màn trắng.
  - Có màn "đang tải" mềm trong lúc tải thư viện.
  - Thẻ `og:title` / `og:description` / `og:image` để link hiện ảnh xem trước đẹp khi gửi qua Zalo/Messenger.

## 8. Để người xây quyết

- Hình dáng chi tiết của từng vật thể, quỹ đạo camera, easing, thời lượng chính xác từng cảnh (giữ tổng ~1,5–2 phút).
- Cách chuyển cảnh (liền mạch một thế giới, camera di chuyển giữa các vùng — khuyến nghị — hay cắt cảnh).
- Cấu trúc file trong `js/`.
- Giai điệu nhạc tự tạo (nếu dùng).
- Nền tảng host cụ thể.
