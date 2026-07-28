// 프레젠테이션 계층 — ② 탭 "모든 스펙업 방식과 효율" 표. 데이터 계층(state)에서 현재 값을 읽고,
// 로직 계층(calculations.js)의 순수 함수로 계산한 뒤, 결과를 DOM에 그립니다.

import {
  PARTS, SOUL_ITEMS, FAMILY_ITEMS, ACCESSORY_AWAKEN, ACCESSORY_GRADE_UP, RECOVERY_NOTES, ANCIENT_ANVIL
} from "../data/gameData.js";
import { state, persist } from "../data/userState.js";
import {
  fmt, efficiencySortKey, dummyQtyPerAttempt, familyMaxLevel, familyCpGainArray,
  computeEquipNextAction, computeEquipAwaken, computeAccessoryAwaken, computeRingNextAction,
  computeSoulNextAction, computeAccessoryGradeUp, computeRelicSeriesAction
} from "../logic/calculations.js";
import { buildMaterialSelect, buildNumberInput, staticLabelCell } from "./domHelpers.js";

export function renderSpecTable() {
  const body = document.getElementById("specTableBody");
  body.innerHTML = "";
  const rows = [];

  PARTS.forEach(function (part) {
    const rec = state.status[part.id];
    const action = computeEquipNextAction(part, rec, state.prices);
    if (!action.maxed) {
      rows.push({
        item: part.name, action: action.label, cost: action.cost, gain: action.gain, qty: action.qty, isDummyQty: action.isDummyQty,
        buildMaterialCell: action.editable.material
          ? function (rec) { return function (td) { td.appendChild(buildMaterialSelect(["순도 높은 흑결정"], rec.material, function (v) { rec.material = v; persist(); renderSpecTable(); })); }; }(rec)
          : staticLabelCell(action.materialLabel),
        buildQtyCell: null,
        buildGainCell: action.editable.cp ? function (rec) { return function (td) { td.appendChild(buildNumberInput(rec.cpGain, function (v) { rec.cpGain = v; persist(); renderSpecTable(); })); }; }(rec) : null
      });
    }

    const awaken = computeEquipAwaken(part, rec, state.prices);
    if (awaken) {
      rows.push({
        item: part.name, action: awaken.label, cost: awaken.cost, gain: awaken.gain,
        buildMaterialCell: staticLabelCell(awaken.materialLabel),
        buildQtyCell: null,
        buildGainCell: null
      });
    }
  });

  const ringAction = computeRingNextAction(state.ring, state.prices);
  if (!ringAction.maxed) {
    rows.push({
      item: "전승의 고리", action: ringAction.label, cost: ringAction.cost, gain: ringAction.gain,
      qty: ringAction.qty, isDummyQty: false,
      buildMaterialCell: function (td) {
        staticLabelCell(ringAction.materialLabel)(td);
        if (ringAction.editable.extraSilver) {
          const wrap = document.createElement("div");
          wrap.style.cssText = "display:flex;align-items:center;gap:5px;margin-top:4px;";
          const label = document.createElement("span");
          label.style.cssText = "color:var(--text-faint);font-size:10px;"; label.textContent = "+ 회당 직접 은화";
          wrap.appendChild(label);
          wrap.appendChild(buildNumberInput(state.ring.extraSilver || 0, function (v) { state.ring.extraSilver = v; persist(); renderSpecTable(); }, "90px"));
          td.appendChild(wrap);
        }
      },
      buildQtyCell: null,
      buildGainCell: null
    });
  }

  SOUL_ITEMS.forEach(function (item) {
    const rec = state.soul[item.id];
    const action = computeSoulNextAction(rec, state.prices);
    if (action.maxed) return;
    rows.push({
      item: item.name, action: action.label, cost: action.cost, gain: action.gain, qty: action.qty, isDummyQty: action.isDummyQty,
      buildMaterialCell: function (rec, item) { return function (td) { td.appendChild(buildMaterialSelect([item.material], rec.material, function (v) { rec.material = v; persist(); renderSpecTable(); })); }; }(rec, item),
      buildQtyCell: null,
      buildGainCell: function (rec) { return function (td) { td.appendChild(buildNumberInput(rec.cpGain, function (v) { rec.cpGain = v; persist(); renderSpecTable(); })); }; }(rec)
    });
  });

  FAMILY_ITEMS.forEach(function (item) {
    const fam = state.family[item.id];
    if (fam.level < familyMaxLevel(item, fam.grade)) {
      const qtyPerAttempt = dummyQtyPerAttempt(fam.level);
      const attempts = item.anvilTable ? item.anvilTable[fam.level] : 1;
      const totalQty = attempts * qtyPerAttempt;
      const materialCost = totalQty * (state.prices[fam.material] || 0);
      const failures = attempts - 1;
      const recTable = item.recoveryTable && item.recoveryTable[fam.grade];
      const hasRealRecovery = !!(recTable && recTable.silver[fam.level] !== undefined);
      const recoveryCost = hasRealRecovery
        ? failures * recTable.silver[fam.level]
        : failures * (fam.recoveryQty * (state.prices["돌파 복구권"] || 0) + fam.recoverySilver);
      const cost = materialCost + recoveryCost;
      const actionLabel = fam.level + " → " + (fam.level + 1) + (item.anvilTable ? " (고대의 모루 확정까지 최대 " + attempts + "회)" : "");
      const cpArr = familyCpGainArray(item, fam.grade);
      const hasRealCp = !!(cpArr && cpArr[fam.level] !== undefined);
      const gain = hasRealCp ? cpArr[fam.level] : fam.cpPerLevel;
      rows.push({
        item: item.name, action: actionLabel, cost: cost, gain: gain, qty: qtyPerAttempt, isDummyQty: true,
        buildMaterialCell: function (item, fam, totalQty, hasRealRecovery, recTable) {
          return function (td) {
            td.appendChild(buildMaterialSelect(item.materialOptions, fam.material, function (v) { fam.material = v; persist(); renderSpecTable(); }));
            if (item.anvilTable) {
              const qtyNote = document.createElement("div");
              qtyNote.style.cssText = "color:var(--text-faint);font-size:10px;margin-top:2px;";
              qtyNote.textContent = "재료 기대 소모량 " + fmt(totalQty) + "개";
              td.appendChild(qtyNote);
              if (item.recoveryKey && RECOVERY_NOTES[item.recoveryKey]) {
                const recNote = document.createElement("div");
                recNote.style.cssText = "color:var(--text-faint);font-size:10px;margin-top:2px;white-space:normal;max-width:220px;";
                recNote.textContent = RECOVERY_NOTES[item.recoveryKey];
                td.appendChild(recNote);
              }
              if (hasRealRecovery) {
                const realNote = document.createElement("div");
                realNote.style.cssText = "color:var(--text-dim);font-size:10.5px;margin-top:4px;";
                realNote.textContent = "실패당 은화 " + fmt(recTable.silver[fam.level]) + " (또는 돌파 복구권 " + fmt(recTable.ticket[fam.level]) + "장)";
                td.appendChild(realNote);
              } else {
                const wrap = document.createElement("div");
                wrap.style.cssText = "display:flex;align-items:center;gap:4px;margin-top:4px;flex-wrap:wrap;";
                const label2 = document.createElement("span");
                label2.style.cssText = "color:var(--text-faint);font-size:10px;"; label2.textContent = "실패당 은화(기본)";
                wrap.appendChild(label2);
                wrap.appendChild(buildNumberInput(fam.recoverySilver, function (v) { fam.recoverySilver = v; persist(); renderSpecTable(); }, "70px"));
                const label1 = document.createElement("span");
                label1.style.cssText = "color:var(--text-faint);font-size:10px;"; label1.textContent = "복구권(강제인 경우만)";
                wrap.appendChild(label1);
                wrap.appendChild(buildNumberInput(fam.recoveryQty, function (v) { fam.recoveryQty = v; persist(); renderSpecTable(); }, "55px"));
                td.appendChild(wrap);
              }
            }
          };
        }(item, fam, totalQty, hasRealRecovery, recTable),
        buildQtyCell: null,
        buildGainCell: (item.cpEditable && !hasRealCp) ? function (fam) { return function (td) { td.appendChild(buildNumberInput(fam.cpPerLevel, function (v) { fam.cpPerLevel = v; persist(); renderSpecTable(); })); }; }(fam) : null
      });
    }

    const accAwaken = ACCESSORY_AWAKEN[fam.grade] ? computeAccessoryAwaken(item, fam, state.prices) : null;
    if (accAwaken) {
      rows.push({
        item: item.name, action: accAwaken.label, cost: accAwaken.cost, gain: accAwaken.gain,
        buildMaterialCell: staticLabelCell(accAwaken.materialLabel),
        buildQtyCell: null,
        buildGainCell: null
      });
    }

    const gradeUp = ACCESSORY_GRADE_UP[item.id] ? computeAccessoryGradeUp(item.id, fam.grade, fam, state.prices) : null;
    if (gradeUp) {
      rows.push({
        item: item.name, action: gradeUp.label, cost: gradeUp.cost, gain: fam.gradeUpGain,
        buildMaterialCell: staticLabelCell(gradeUp.materialLabel),
        buildQtyCell: null,
        buildGainCell: function (fam) { return function (td) { td.appendChild(buildNumberInput(fam.gradeUpGain, function (v) { fam.gradeUpGain = v; persist(); renderSpecTable(); })); }; }(fam)
      });
    }

    if (item.hasSeries) {
      const seriesAction = computeRelicSeriesAction(fam, state.prices);
      if (seriesAction && !seriesAction.maxed) {
        rows.push({
          item: item.name, action: seriesAction.label, cost: seriesAction.cost, gain: seriesAction.gain,
          buildMaterialCell: function (item, fam, seriesAction) {
            return function (td) {
              const span = document.createElement("span");
              span.style.cssText = "color:var(--text-dim);white-space:normal;font-size:11.8px;";
              span.textContent = seriesAction.materialLabel;
              td.appendChild(span);
              const wrap = document.createElement("div");
              wrap.style.cssText = "display:flex;align-items:center;gap:4px;margin-top:4px;flex-wrap:wrap;";
              const label = document.createElement("span");
              label.style.cssText = "color:var(--text-faint);font-size:10px;"; label.textContent = "복구 방식";
              wrap.appendChild(label);
              wrap.appendChild(buildMaterialSelect(["돌파 복구권", "차원의 조각"], fam.seriesRecoveryMethod, function (v) { fam.seriesRecoveryMethod = v; persist(); renderSpecTable(); }));
              td.appendChild(wrap);
              const wrap2 = document.createElement("div");
              wrap2.style.cssText = "display:flex;align-items:center;gap:4px;margin-top:4px;";
              const label2 = document.createElement("span");
              label2.style.cssText = "color:var(--text-faint);font-size:10px;"; label2.textContent = "현재 계열돌파 단계";
              wrap2.appendChild(label2);
              const stepSel = document.createElement("select"); stepSel.style.width = "70px";
              for (let i = 0; i < ANCIENT_ANVIL.relicSeries.length; i++) {
                const o = document.createElement("option"); o.value = i; o.textContent = i + "단계";
                if (i === fam.seriesLevel) o.selected = true;
                stepSel.appendChild(o);
              }
              stepSel.addEventListener("change", function () { fam.seriesLevel = parseInt(stepSel.value, 10); persist(); renderSpecTable(); });
              wrap2.appendChild(stepSel);
              td.appendChild(wrap2);
            };
          }(item, fam, seriesAction),
          buildQtyCell: null,
          buildGainCell: null
        });
      }
    }
  });

  rows.forEach(function (r) { r.sortKey = efficiencySortKey(r.cost, r.gain); });
  rows.sort(function (a, b) { return b.sortKey - a.sortKey; });

  document.getElementById("specEmptyNote").style.display = rows.length ? "none" : "block";

  rows.forEach(function (r, idx) {
    const tr = document.createElement("tr");
    if (idx === 0 && r.gain > 0) tr.className = "rank-1";

    const tdItem = document.createElement("td"); tdItem.className = "name"; tdItem.textContent = r.item;
    tr.appendChild(tdItem);

    const tdAction = document.createElement("td"); tdAction.textContent = r.action;
    tr.appendChild(tdAction);

    const tdMat = document.createElement("td"); r.buildMaterialCell(tdMat);
    tr.appendChild(tdMat);

    const tdQty = document.createElement("td"); tdQty.className = "num";
    if (r.buildQtyCell) {
      r.buildQtyCell(tdQty);
    } else if (r.qty !== undefined && r.qty !== null) {
      tdQty.innerHTML = fmt(r.qty) + (r.isDummyQty ? ' <span style="color:var(--text-faint);font-size:10px;">(더미)</span>' : "");
    } else {
      tdQty.innerHTML = '<span style="color:var(--text-faint);">–</span>';
    }
    tr.appendChild(tdQty);

    const tdCost = document.createElement("td"); tdCost.className = "num";
    tdCost.innerHTML = '<span class="coin-val">' + fmt(r.cost) + "</span>";
    tr.appendChild(tdCost);

    const tdGain = document.createElement("td"); tdGain.className = "num";
    if (r.buildGainCell) r.buildGainCell(tdGain); else tdGain.textContent = fmt(r.gain);
    tr.appendChild(tdGain);

    const tdRatio = document.createElement("td"); tdRatio.className = "num";
    if (r.gain <= 0) {
      tdRatio.innerHTML = '<span style="color:var(--text-faint);">전투력 미입력</span>';
    } else if (r.cost <= 0) {
      tdRatio.innerHTML = '<span class="badge good">무료</span>';
    } else {
      tdRatio.innerHTML = '<span class="ratio-val">' + fmt(r.cost / r.gain) + "</span>";
    }
    tr.appendChild(tdRatio);

    body.appendChild(tr);
  });

  renderRecoBar(rows);
}

function renderRecoBar(rows) {
  const bar = document.getElementById("recoBar");
  const valid = rows.filter(function (r) { return r.gain > 0; });
  if (!valid.length) {
    bar.classList.add("empty");
    document.getElementById("recoTitle").textContent = "전투력 증가량을 입력한 항목이 아직 없습니다";
    document.getElementById("recoSub").textContent = "«② 스펙업 방식» 표에서 전투력 증가 칸을 채워보세요.";
    document.getElementById("recoValue").textContent = "–";
    return;
  }
  bar.classList.remove("empty");
  const best = valid[0];
  document.getElementById("recoTitle").textContent = best.item + " · " + best.action;
  document.getElementById("recoSub").textContent = "은화 " + fmt(best.cost) + " · 전투력 +" + fmt(best.gain);
  document.getElementById("recoValue").textContent = best.cost <= 0 ? "무료" : fmt(best.cost / best.gain);
}
