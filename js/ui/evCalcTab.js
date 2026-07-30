// 프레젠테이션 계층 — ③ 탭 "강화 기대값 계산기". 은화 스펙업 순위(② 탭)와 분리해, 목표/구간을
// 직접 입력하면 필요한 재료·아이템 기대 개수만 계산해 보여주는 도구 모음입니다.
// (1) 밤·달빛 영혼석: 구매 불가 재화라 목표 단계까지 재료 기대 개수만.
// (2) 장비 돌파: 확률 상승권 10%/50%/100%·돌파 복구권을 어느 구간에 쓸지 직접 설정.

import { SOUL_ITEMS, SOUL_BREAKTHROUGH_CURVE, SHADOW_GEAR } from "../data/gameData.js";
import { state, persist } from "../data/userState.js";
import { buildTile } from "./tiles.js";
import { fmt, soulCumulativeQty, computeEquipRangePlan, validateEquipRangeConfig } from "../logic/calculations.js";

function renderSoulSection() {
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

// 확률 상승권(10%/50%/100%) 또는 돌파 복구권 1종의 "사용 여부 + 구간(N강~N강)" 입력 줄.
function buildRangeRow(labelText, config, onChange) {
  const row = document.createElement("div");
  row.style.cssText = "display:flex;align-items:center;gap:8px;flex-wrap:wrap;";

  const label = document.createElement("label");
  label.style.cssText = "display:flex;align-items:center;gap:6px;font-size:13px;min-width:140px;cursor:pointer;";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = config.use;
  label.appendChild(checkbox);
  const labelSpan = document.createElement("span");
  labelSpan.textContent = labelText;
  label.appendChild(labelSpan);
  row.appendChild(label);

  const startInput = document.createElement("input");
  startInput.type = "number"; startInput.min = "1"; startInput.max = "10"; startInput.style.width = "60px";
  startInput.value = config.start;
  const tilde = document.createElement("span"); tilde.textContent = "강 ~";
  const endInput = document.createElement("input");
  endInput.type = "number"; endInput.min = "1"; endInput.max = "10"; endInput.style.width = "60px";
  endInput.value = config.end;
  const endLabel = document.createElement("span"); endLabel.textContent = "강";

  row.appendChild(startInput); row.appendChild(tilde); row.appendChild(endInput); row.appendChild(endLabel);

  function syncDisabled() {
    startInput.disabled = !checkbox.checked;
    endInput.disabled = !checkbox.checked;
  }
  syncDisabled();

  checkbox.addEventListener("change", function () { config.use = checkbox.checked; syncDisabled(); persist(); onChange(); });
  startInput.addEventListener("input", function () { config.start = parseInt(startInput.value, 10) || 1; persist(); onChange(); });
  endInput.addEventListener("input", function () { config.end = parseInt(endInput.value, 10) || 1; persist(); onChange(); });

  return row;
}

// 그림자 장비(칠흑같은/피어나는) 사용 체크박스 — 해당 단계(7강 또는 8강)가 계산 범위
// [plan.from, plan.to)에 들어있을 때만 표시합니다.
function renderShadowRows(plan, onChange) {
  const wrap = document.getElementById("equipShadowRows");
  const field = document.getElementById("equipShadowField");
  wrap.innerHTML = "";
  const rows = [
    { step: 7, key: "shadowStep7" },
    { step: 8, key: "shadowStep8" }
  ].filter(function (s) { return plan.from <= s.step && s.step < plan.to; });
  field.style.display = rows.length ? "" : "none";
  rows.forEach(function (s) {
    const label = document.createElement("label");
    label.style.cssText = "display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = plan[s.key];
    label.appendChild(checkbox);
    const labelSpan = document.createElement("span");
    labelSpan.textContent = SHADOW_GEAR[s.step].label + " 사용 (" + s.step + "→" + (s.step + 1) + "강, 100% 방어)";
    label.appendChild(labelSpan);
    checkbox.addEventListener("change", function () {
      plan[s.key] = checkbox.checked;
      persist();
      onChange();
    });
    wrap.appendChild(label);
  });
}

function renderEquipPlanSection() {
  const plan = state.equipPlan;
  const fromInput = document.getElementById("equipPlanFrom");
  const toInput = document.getElementById("equipPlanTo");
  fromInput.value = plan.from;
  toInput.value = plan.to;

  const boostWrap = document.getElementById("equipBoostRows");
  boostWrap.innerHTML = "";
  boostWrap.appendChild(buildRangeRow("확률 상승권 10%", plan.boost10, updateOutput));
  boostWrap.appendChild(buildRangeRow("확률 상승권 50%", plan.boost50, updateOutput));
  boostWrap.appendChild(buildRangeRow("확률 상승권 100%", plan.boost100, updateOutput));

  const recoveryWrap = document.getElementById("equipRecoveryRow");
  recoveryWrap.innerHTML = "";
  recoveryWrap.appendChild(buildRangeRow("돌파 복구권 사용", plan.recovery, updateOutput));

  renderShadowRows(plan, updateOutput);

  fromInput.addEventListener("input", function () {
    plan.from = parseInt(fromInput.value, 10) || 0; persist(); renderShadowRows(plan, updateOutput); updateOutput();
  });
  toInput.addEventListener("input", function () {
    plan.to = parseInt(toInput.value, 10) || 0; persist(); renderShadowRows(plan, updateOutput); updateOutput();
  });

  function updateOutput() {
    const errorEl = document.getElementById("equipPlanError");
    const outputBody = document.getElementById("equipPlanOutput");
    const boostConfig = { boost10: plan.boost10, boost50: plan.boost50, boost100: plan.boost100 };

    if (!(plan.from >= 0 && plan.to <= 10 && plan.from < plan.to)) {
      errorEl.style.display = "block";
      errorEl.textContent = "⚠ 강화 단계 범위가 올바르지 않습니다(0~10강, 시작<끝).";
      outputBody.innerHTML = "";
      return;
    }
    const err = validateEquipRangeConfig(boostConfig, plan.recovery);
    if (err) {
      errorEl.style.display = "block";
      errorEl.textContent = "⚠ " + err;
      outputBody.innerHTML = "";
      return;
    }
    errorEl.style.display = "none";

    const shadowConfig = { step7: plan.shadowStep7, step8: plan.shadowStep8 };
    const result = computeEquipRangePlan(plan.from, plan.to, boostConfig, plan.recovery, state.prices, shadowConfig);
    outputBody.innerHTML = "";
    [
      ["순도 높은 흑결정", result.attempts, "개"],
      ["고결한 흑결정(그림자 장비용)", result.blackCrystal, "개"],
      ["은화(복구 시 직접 소모)", result.silverDirect, "은화"],
      ["확률 상승권(10%)", result.boost10, "개"],
      ["확률 상승권(50%)", result.boost50, "개"],
      ["확률 상승권(100%)", result.boost100, "개"],
      ["돌파 복구권", result.recoveryTicket, "개"]
    ].forEach(function (row) {
      const tr = document.createElement("tr");
      const tdName = document.createElement("td"); tdName.className = "name"; tdName.textContent = row[0];
      const tdVal = document.createElement("td"); tdVal.className = "num"; tdVal.textContent = fmt(row[1]) + row[2];
      tr.appendChild(tdName); tr.appendChild(tdVal);
      outputBody.appendChild(tr);
    });
  }

  updateOutput();
}

export function renderEvCalcTab() {
  renderSoulSection();
  renderEquipPlanSection();
}
