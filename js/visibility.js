// Quyết định khi tab bị ẩn / hiện lại (thuần, kiểm thử được).
export function visibilityActions({ hidden, started, ended, muted, frozen }) {
  if (!started || frozen) return { film: null, music: null };
  if (hidden) return { film: "pause", music: "pause" };
  return { film: ended ? null : "resume", music: muted ? null : "play" };
}
