// 프레젠테이션 계층 — 상단 "① 현재 상태 / ② 스펙업 방식" 탭 전환.

import { track } from "../analytics.js";

export function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      tabBtns.forEach(function (b) { b.classList.remove("active"); });
      document.querySelectorAll(".panel").forEach(function (p) { p.classList.remove("active"); });
      btn.classList.add("active");
      document.getElementById("panel-" + btn.dataset.tab).classList.add("active");
      track("tab_view", { tab_name: btn.dataset.tab });
    });
  });
}
