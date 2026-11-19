// Chờ font web trước khi vẽ chữ lên canvas (nhãn 3D).
// Stylesheet Google Fonts được nạp không chặn (media="print" → "all"); trước khi nó áp dụng,
// document.fonts.load() không biết @font-face nào và trả về ngay → chữ bị vẽ bằng font dự phòng.
export const FACES = [
  "600 64px 'Be Vietnam Pro'",
  "700 64px 'Be Vietnam Pro'",
  "800 64px 'Be Vietnam Pro'",
  "700 64px 'Dancing Script'",
];

function stylesheetApplied(doc, timeoutMs) {
  const link = doc.querySelector('link[href*="fonts.googleapis.com"]');
  if (!link || link.media === 'all') return Promise.resolve();
  return new Promise((ok) => {
    const timer = setTimeout(ok, timeoutMs);
    const done = () => { clearTimeout(timer); ok(); };
    link.addEventListener('load', done, { once: true });
    link.addEventListener('error', done, { once: true });
  });
}

export async function fontsReady(doc = document, { faces = FACES, timeoutMs = 4000 } = {}) {
  try {
    await stylesheetApplied(doc, timeoutMs);
    if (!doc.fonts) return;
    let timer;
    await Promise.race([
      Promise.all(faces.map((f) => doc.fonts.load(f))),
      new Promise((ok) => { timer = setTimeout(ok, timeoutMs); }),
    ]).finally(() => clearTimeout(timer));
  } catch {
    // Không có font web vẫn chạy được, chỉ kém đẹp hơn.
  }
}
