// GA4 커스텀 이벤트 전송 — gtag.js는 index.html에서 이미 로드됩니다. 광고 차단 등으로
// window.gtag가 없어도 죽지 않게 안전 호출만 감쌉니다.
export function track(name, params) {
  if (typeof window.gtag === "function") window.gtag("event", name, params || {});
}
