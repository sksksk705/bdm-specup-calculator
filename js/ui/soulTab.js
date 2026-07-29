// 프레젠테이션 계층 — ③ 탭 "밤·달빛 영혼석" 목표 강화 단계 재료 계산기.
// 구매 불가 재화라 은화 스펙업 순위(② 탭)에는 넣지 않고, 별도 탭에서 목표 단계까지 필요한
// 재료 기대 개수만 계산해 보여줍니다.

import { SOUL_ITEMS, SOUL_BREAKTHROUGH_CURVE } from "../data/gameData.js";
import { state, persist } from "../data/userState.js";
import { buildTile } from "./tiles.js";
import { fmt, soulCumulativeQty } from "../logic/calculations.js";

export function renderSoulTab() {
  const wrap = document.getElementById("soulGrid");
  wrap.innerHTML = "";
  SOUL_ITEMS.forEach(function (item) {
    const rec = state.soul[item.id];
    const built = buildTile(item.name);
    const stepSel = document.createElement("select");
    for (let i = 0; i <= SOUL_BREAKTHROUGH_CURVE.length; i++) {
      const o = document.createElement("option"); o.value = i; o.textContent = i + "단계";
      if (i === rec.step) o.selected = true;
      stepSel.appendChild(o);
    }
    const note = document.createElement("div");
    note.style.cssText = "color:var(--text-faint);font-size:10px;margin-top:4px;white-space:normal;max-width:220px;";
    function updateNote() {
      note.textContent = "0→" + rec.step + "단계 재료 기대값 " + fmt(soulCumulativeQty(rec.step)) + "개(" + item.material + ")";
    }
    stepSel.addEventListener("change", function () { rec.step = parseInt(stepSel.value, 10); persist(); updateNote(); });
    updateNote();
    built.controls.appendChild(stepSel);
    built.controls.appendChild(note);
    wrap.appendChild(built.tile);
  });
}
