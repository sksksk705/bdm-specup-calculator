// 프레젠테이션 계층 — 라이트/다크 테마 전환 버튼. 실제 테마 적용은 index.html의 인라인
// 스크립트가 화면이 그려지기 전에 이미 해뒀습니다(깜빡임 방지) — 여기서는 버튼 표시/전환만 맡습니다.

import { track } from "../analytics.js";

const STORAGE_KEY = "bdm_theme";

export function initThemeToggle() {
  const btn = document.getElementById("themeToggle");

  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    btn.textContent = theme === "dark" ? "🌙 다크" : "☀️ 라이트";
    btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  }

  apply(document.documentElement.getAttribute("data-theme") || "dark");

  btn.addEventListener("click", function () {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
    apply(next);
    track("theme_toggle", { theme: next });
  });
}
