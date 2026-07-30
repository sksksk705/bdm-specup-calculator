// 프레젠테이션 계층 — 첫 방문 안내 카드. <details>라 클릭 한 번으로 접고 펼 수 있고,
// 마지막으로 남긴 열림/닫힘 상태를 localStorage에 기억합니다(첫 방문 기본값은 열림).

const STORAGE_KEY = "bdm_onboard_open";

export function initOnboarding() {
  const details = document.getElementById("onboardCard");

  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  if (saved === "0") details.open = false;
  else if (saved === "1") details.open = true;

  details.addEventListener("toggle", function () {
    try { localStorage.setItem(STORAGE_KEY, details.open ? "1" : "0"); } catch (e) {}
  });
}
