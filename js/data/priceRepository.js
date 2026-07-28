// 데이터 계층 — 재료 시세("가격표")를 data/prices.json에서 fetch합니다. 이 계산기의 핵심 로직/UI
// 코드와 완전히 분리돼 있어, 시세가 바뀌면 이 JSON 파일만 고쳐서 올리면 되고 나머지 코드는 건드릴
// 필요가 없습니다. http(s)로 서빙되는 환경(GitHub Pages 등)에서만 동작합니다 — file:// 로 직접
// 열면 브라우저 보안 정책(CORS)에 막혀 fetch가 실패합니다.
const PRICES_URL = "data/prices.json";

export async function loadDefaultPrices() {
  const res = await fetch(PRICES_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(PRICES_URL + " 응답 실패 (" + res.status + ")");
  }
  return res.json();
}
