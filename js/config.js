// Dữ liệu cố định của phim: màu, cảnh, lời thiệp.
export const PALETTE = {
  skyTop: '#ff9a8b', skyMid: '#ffc3a0', skyLow: '#ffe29f',
  seaLight: '#4fd1c5', seaDeep: '#2bb3c0',
  pink: '#ff5c8a', purple: '#7b61ff', sun: '#ffd166', white: '#ffffff',
  cloud: '#9aa3b5',
};

export const SCENES = [
  { id: 'sea',    start: 0,  duration: 12, caption: 'Ngày ấy, thế giới với em chỉ là những con số 0 và 1…' },
  { id: 'launch', start: 12, duration: 15, caption: 'Rồi em viết dòng đầu tiên: Hello, World!' },
  { id: 'island', start: 27, duration: 20, caption: 'Cô dạy em từng biến, từng vòng lặp, từng con trỏ…' },
  { id: 'storm',  start: 47, duration: 18, caption: 'Có những lúc chương trình báo lỗi đỏ rực. Cô luôn ở đó, soi đường.' },
  { id: 'city',   start: 65, duration: 22, caption: 'Giờ em nhìn thấy cả một hệ thống. Và đồ án của em vẫn có cô dẫn lối.' },
  { id: 'card',   start: 87, duration: 8,  caption: null },
];

export const CARD = {
  greeting: 'Kính gửi cô Thuận',
  body: 'Nhân ngày Nhà giáo Việt Nam 20/11, em xin cảm ơn cô — người đã dạy em những dòng C đầu tiên và nay tiếp tục dẫn đường cho đồ án tốt nghiệp của em. Chúc cô luôn mạnh khỏe, hạnh phúc và mãi là ngọn hải đăng của bao thế hệ học trò.',
  signature: 'Em, Thu Phương',
  footer: 'return 0; // cảm ơn cô',
};

export const LIMITS = { loadTimeoutMs: 12000, maxPixelRatio: 2 };
