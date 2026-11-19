// Khung hình chính của "máy quay" và đường đi của thuyền (dữ liệu thuần, kiểm thử được).
// pos/look: [x, y, z] theo tọa độ thế giới. Xem PLACES trong js/world/index.js.
export function cameraKeys() {
  return [
    // 1. Bình minh trên biển
    { t: 0, pos: [16, 7, 26], look: [0, 3, -12] },
    { t: 8, pos: [11, 5, 18], look: [0, 3, -6] },
    // 2. Ra khơi: cận cảnh buồm, rồi ngước lên ngôi sao "C"
    { t: 12, pos: [8, 3.6, 9], look: [0, 3.2, 0] },
    { t: 17, pos: [8.5, 3.8, 6], look: [0, 3.6, -1] },
    { t: 22, pos: [7, 4, 6], look: [0, 40, -150] },
    // 3. Đảo C
    { t: 27, pos: [36, 9, -12], look: [25, 3, -48] },
    { t: 31, pos: [53, 12, -28], look: [33, 3, -54] },
    { t: 37, pos: [55, 13, -36], look: [31, 3, -56] },
    { t: 42, pos: [34, 8, -32], look: [0, 55, -230] },
    // 4. Mây giông → cầu vồng
    { t: 47, pos: [6, 7, -44], look: [4, 14, -105] },
    { t: 53, pos: [6, 6, -50], look: [4, 11, -95] },
    { t: 58, pos: [5, 9, -54], look: [3, 22, -150] },
    // 5. Thành phố hệ thống → bay lên cao
    { t: 65, pos: [16, 8, -80], look: [0, 5, -110] },
    { t: 71, pos: [24, 12, -92], look: [0, 7, -119] },
    { t: 78, pos: [0, 118, -98], look: [0, 0, -137] },
    { t: 84, pos: [0, 124, -104], look: [0, 0, -139] },
    // 6. Thiệp: ngước lên bầu trời, nơi các đốm sáng hội tụ
    { t: 87, pos: [0, 72, -60], look: [0, 64, -230] },
    { t: 95, pos: [0, 74, -66], look: [0, 64, -230] },
  ];
}

export function boatKeys() {
  return [
    { t: 12, pos: [0, 0, 0] },
    { t: 27, pos: [5, 0, -32] },
    { t: 40, pos: [3, 0, -58] },
    { t: 47, pos: [3, 0, -70] },
    { t: 65, pos: [2, 0, -88] },
    { t: 75, pos: [1, 0, -97] },
  ];
}
