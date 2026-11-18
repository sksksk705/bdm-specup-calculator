function hexToRgbParts(hex) {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255);
}

// 배경(약한 그라데이션)·테두리에 특정 색상을 반영합니다(등급 색, 영혼석 색 등 공용 —
// 색상이 없으면 스타일시트 기본값으로 되돌립니다). base는 그라데이션 밑에 깔 원래 배경
// 변수 이름(기본 --card-2, .card처럼 --ink-2를 쓰는 요소는 직접 지정).
export function applyColorTint(tile, color, base) {
  if (!color) { tile.style.background = ""; tile.style.borderColor = ""; return; }
  const rgb = hexToRgbParts(color);
  tile.style.background = "linear-gradient(135deg, rgba(" + rgb + ",0.16), transparent 70%), var(" + (base || "--card-2") + ")";
  tile.style.borderColor = "rgba(" + rgb + ",0.5)";
}
