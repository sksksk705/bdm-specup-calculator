// 프레젠테이션 계층 — ⑤ 탭 "은화 ↔ 전투력 계산기". 두 방향을 지원합니다: 보유 은화 입력 →
// planSpecBudget(예산 안에서 최대한), 목표 전투력 입력 → planSpecByTargetGain(목표 도달까지).
// state는 읽기만 하고(clone은 planner.js 내부에서) 여기서 직접 수정하지 않습니다.

import { state } from "../data/userState.js";
import { fmt } from "../logic/calculations.js";
import { planSpecBudget, planSpecByTargetGain } from "../logic/planner.js";
import { track } from "../analytics.js";

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

function currentMode() {
  return document.getElementById("plannerModeGain").checked ? "gain" : "silver";
}

function renderSteps(steps) {
  const body = document.getElementById("plannerTableBody");
  body.innerHTML = "";
  const displaySteps = consolidateSteps(steps);
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

function runSilverMode() {
  const budget = parseFloat(document.getElementById("plannerBudget").value) || 0;
  const summary = document.getElementById("plannerSummary");
  const emptyNote = document.getElementById("plannerEmptyNote");
  document.getElementById("plannerTableBody").innerHTML = "";

  if (budget <= 0) {
    summary.style.display = "none";
    emptyNote.style.display = "block";
    emptyNote.textContent = "먼저 보유 은화를 입력하세요.";
    return;
  }

  const result = planSpecBudget(state, budget);
  track("planner_run", { mode: "silver" });
  document.getElementById("plannerRemainingStat").style.display = "";
  document.getElementById("plannerRemainingStat").querySelector(".label").textContent = "남은 은화";
  document.getElementById("plannerRemaining").textContent = fmt(result.remaining) + "은화";

  summary.style.display = "flex";
  document.getElementById("plannerTotalCost").textContent = fmt(result.totalCost) + "은화";
  document.getElementById("plannerTotalGain").textContent = "+" + fmt(result.totalGain);

  if (!result.steps.length) {
    emptyNote.style.display = "block";
    emptyNote.textContent = "입력한 은화로는 살 수 있는 스펙업이 없습니다 — 모든 항목이 최고 단계이거나 예산이 부족합니다.";
    return;
  }
  emptyNote.style.display = "none";
  renderSteps(result.steps);
}

function runGainMode() {
  const targetGain = parseFloat(document.getElementById("plannerTargetGain").value) || 0;
  const summary = document.getElementById("plannerSummary");
  const emptyNote = document.getElementById("plannerEmptyNote");
  document.getElementById("plannerTableBody").innerHTML = "";

  if (targetGain <= 0) {
    summary.style.display = "none";
    emptyNote.style.display = "block";
    emptyNote.textContent = "먼저 목표 전투력을 입력하세요.";
    return;
  }

  const result = planSpecByTargetGain(state, targetGain);
  track("planner_run", { mode: "gain" });

  summary.style.display = "flex";
  document.getElementById("plannerTotalCost").textContent = fmt(result.totalCost) + "은화";
  document.getElementById("plannerTotalGain").textContent = "+" + fmt(result.totalGain);
  document.getElementById("plannerRemainingStat").style.display = "";
  document.getElementById("plannerRemainingStat").querySelector(".label").textContent = "목표 달성 여부";
  document.getElementById("plannerRemaining").textContent = result.reached ? "달성" : "미달성";

  if (!result.steps.length) {
    emptyNote.style.display = "block";
    emptyNote.textContent = "이미 목표 전투력을 달성했거나, 살 수 있는 스펙업이 없습니다.";
    return;
  }
  emptyNote.style.display = result.reached ? "none" : "block";
  if (!result.reached) {
    emptyNote.textContent = "이 계산기가 다루는 항목을 전부 최고 단계까지 올려도(아래 표) 목표 전투력에는 못 미칩니다 — 그 이상은 카라자드 제작·확률형 항목 등 이 계산기 범위 밖의 방법이 필요합니다.";
  }
  renderSteps(result.steps);
}

function run() {
  if (currentMode() === "gain") runGainMode(); else runSilverMode();
}

function syncModeVisibility() {
  const isGain = currentMode() === "gain";
  document.getElementById("plannerSilverField").style.display = isGain ? "none" : "";
  document.getElementById("plannerGainField").style.display = isGain ? "" : "none";
}

export function initPlannerTab() {
  document.getElementById("plannerRunBtn").addEventListener("click", run);
  document.getElementById("plannerBudget").addEventListener("keydown", function (e) { if (e.key === "Enter") run(); });
  document.getElementById("plannerTargetGain").addEventListener("keydown", function (e) { if (e.key === "Enter") run(); });
  document.querySelectorAll('input[name="plannerMode"]').forEach(function (radio) {
    radio.addEventListener("change", syncModeVisibility);
  });
}
