// 프레젠테이션 계층 — 첫 방문 안내 배너. 닫으면 localStorage에 기록해 다시 뜨지 않습니다.

const STORAGE_KEY = "bdm_onboard_dismissed";

export function initOnboarding() {
  const banner = document.getElementById("onboardBanner");
  const closeBtn = document.getElementById("onboardClose");

  let dismissed = false;
  try { dismissed = localStorage.getItem(STORAGE_KEY) === "1"; } catch (e) {}
  if (dismissed) { banner.classList.add("hidden"); return; }

  closeBtn.addEventListener("click", function () {
    banner.classList.add("hidden");
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch (e) {}
  });
}
