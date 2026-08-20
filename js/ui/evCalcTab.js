// 프레젠테이션 계층 — ③ 탭 "강화 기대값 계산기". 은화 스펙업 순위(② 탭)와 분리해, 목표/구간을
// 직접 입력하면 필요한 재료·아이템 기대 개수만 계산해 보여주는 도구 모음입니다.
// (1) 밤·달빛 영혼석: 구매 불가 재화라 목표 단계까지 재료 기대 개수만.
// (2) 장비 돌파: 확률 상승권 10%/50%/100%·돌파 복구권을 어느 구간에 쓸지 직접 설정.

import { SOUL_ITEMS, SOUL_MAX_STEP, SHADOW_GEAR } from "../data/gameData.js";
import { state, persist } from "../data/userState.js";
import { applyColorTint } from "./tiles.js";
import { fmt, soulCumulativeQty, computeEquipRangePlan, validateEquipRangeConfig } from "../logic/calculations.js";
import { t } from "../i18n.js";

// 밤·달빛 영혼석은 확률·기대값이 완전히 같아(사용자 확인, 2026-07-30) 달빛 영혼석 기준
// 하나로 통합해 0~13강 전체를 표로 보여줍니다. 카드 색도 달빛 영혼석 색만 남깁니다.
const MOON_COLOR = "#6B90C6";

function renderSoulSection() {
  const moon = SOUL_ITEMS.filter(function (item) { return item.id === "moonsoul"; })[0];
  applyColorTint(document.getElementById("soulCard"), MOON_COLOR, "--ink-2");
  const qtyHeader = document.getElementById("soulQtyHeader");
  if (qtyHeader) qtyHeader.textContent = t(moon.material + " 기대 개수");
  const body = document.getElementById("soulGrid");
  body.innerHTML = "";
  for (let step = 0; step <= SOUL_MAX_STEP; step++) {
    const tr = document.createElement("tr");
    const tdStep = document.createElement("td"); tdStep.className = "name"; tdStep.textContent = t(step + "강");
    const tdQty = document.createElement("td"); tdQty.className = "num";
    tdQty.style.cssText = "color:" + MOON_COLOR + ";font-weight:800;";
    tdQty.textContent = soulCumulativeQty(step).toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + t("개");
    tr.appendChild(tdStep); tr.appendChild(tdQty);
    body.appendChild(tr);
  }
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
  labelSpan.textContent = t(labelText);
  label.appendChild(labelSpan);
  row.appendChild(label);

  const startInput = document.createElement("input");
  startInput.type = "number"; startInput.min = "1"; startInput.max = "10"; startInput.style.width = "60px";
  startInput.value = config.start;
  const tilde = document.createElement("span"); tilde.textContent = t("강 ~");
  const endInput = document.createElement("input");
  endInput.type = "number"; endInput.min = "1"; endInput.max = "10"; endInput.style.width = "60px";
  endInput.value = config.end;
  const endLabel = document.createElement("span"); endLabel.textContent = t("강");

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
    labelSpan.textContent = t(SHADOW_GEAR[s.step].label + " 사용 (" + s.step + "→" + (s.step + 1) + "강, 100% 방어)");
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
      errorEl.textContent = t("⚠ 강화 단계 범위가 올바르지 않습니다(0~10강, 시작<끝).");
      outputBody.innerHTML = "";
      return;
    }
    const err = validateEquipRangeConfig(boostConfig, plan.recovery);
    if (err) {
      errorEl.style.display = "block";
      errorEl.textContent = "⚠ " + t(err);
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
      const tdName = document.createElement("td"); tdName.className = "name"; tdName.textContent = t(row[0]);
      const tdVal = document.createElement("td"); tdVal.className = "num"; tdVal.textContent = t(fmt(row[1]) + row[2]);
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
