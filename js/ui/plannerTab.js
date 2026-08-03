// 프레젠테이션 계층 — ⑤ 탭 "은화 예산 플래너". 입력한 은화로 planSpecBudget(로직 계층)을 돌려
// 결과를 카드 + 표로 그립니다. state는 읽기만 하고(clone은 planner.js 내부에서) 여기서 직접
// 수정하지 않습니다.

import { state } from "../data/userState.js";
import { fmt } from "../logic/calculations.js";
import { planSpecBudget } from "../logic/planner.js";

// 같은 항목이 연달아 여러 단계 나오면(특히 실비아 여신상 0~80렙 무료 구간처럼 수십~수백 단계)
// 표가 너무 길어지니 하나로 묶어 "첫 단계 ~ 마지막 단계 (N회)"로 보여줍니다.
function consolidateSteps(steps) {
  const merged = [];
  steps.forEach(function (s) {
    const last = merged[merged.length - 1];
    if (last && last.item === s.item) {
      last.cost += s.cost; last.gain += s.gain; last.count += 1; last.lastLabel = s.label;
    } else {
      merged.push({ item: s.item, firstLabel: s.label, lastLabel: s.label, cost: s.cost, gain: s.gain, count: 1 });
    }
  });
  return merged.map(function (m) {
    return {
      item: m.item,
      label: m.count > 1 ? (m.firstLabel + " ~ " + m.lastLabel + " (" + m.count + "회)") : m.firstLabel,
      cost: m.cost, gain: m.gain
    };
  });
}

function run() {
  const input = document.getElementById("plannerBudget");
  const budget = parseFloat(input.value) || 0;
  const summary = document.getElementById("plannerSummary");
  const body = document.getElementById("plannerTableBody");
  const emptyNote = document.getElementById("plannerEmptyNote");
  body.innerHTML = "";

  if (budget <= 0) {
    summary.style.display = "none";
    emptyNote.style.display = "block";
    emptyNote.textContent = "먼저 보유 은화를 입력하세요.";
    return;
  }

  const result = planSpecBudget(state, budget);

  summary.style.display = "flex";
  document.getElementById("plannerTotalCost").textContent = fmt(result.totalCost) + "은화";
  document.getElementById("plannerTotalGain").textContent = "+" + fmt(result.totalGain);
  document.getElementById("plannerRemaining").textContent = fmt(result.remaining) + "은화";

  if (!result.steps.length) {
    emptyNote.style.display = "block";
    emptyNote.textContent = "입력한 은화로는 살 수 있는 스펙업이 없습니다 — 모든 항목이 최고 단계이거나 예산이 부족합니다.";
    return;
  }
  emptyNote.style.display = "none";

  const displaySteps = consolidateSteps(result.steps);
  displaySteps.forEach(function (s, idx) {
    const tr = document.createElement("tr");
    const tdIdx = document.createElement("td"); tdIdx.className = "num"; tdIdx.textContent = idx + 1;
    const tdItem = document.createElement("td"); tdItem.className = "name"; tdItem.textContent = s.item;
    const tdAction = document.createElement("td"); tdAction.textContent = s.label;
    const tdCost = document.createElement("td"); tdCost.className = "num";
    tdCost.innerHTML = '<span class="coin-val">' + fmt(s.cost) + "</span>";
    const tdGain = document.createElement("td"); tdGain.className = "num"; tdGain.textContent = "+" + fmt(s.gain);
    tr.appendChild(tdIdx); tr.appendChild(tdItem); tr.appendChild(tdAction); tr.appendChild(tdCost); tr.appendChild(tdGain);
    body.appendChild(tr);
  });
}

export function initPlannerTab() {
  document.getElementById("plannerRunBtn").addEventListener("click", run);
  document.getElementById("plannerBudget").addEventListener("keydown", function (e) {
    if (e.key === "Enter") run();
  });
}
