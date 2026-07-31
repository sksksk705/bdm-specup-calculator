// 프레젠테이션 계층 — ② 탭 "모든 스펙업 방식과 효율" 표. 데이터 계층(state)에서 현재 값을 읽고,
// 로직 계층(calculations.js)의 순수 함수로 계산한 뒤, 결과를 DOM에 그립니다.

import {
  PARTS, FAMILY_ITEMS, ACCESSORY_AWAKEN, ACCESSORY_GRADE_UP, RECOVERY_NOTES, KARAZAD_ITEM_MATERIAL
} from "../data/gameData.js";
import { state, persist } from "../data/userState.js";
import {
  fmt, efficiencySortKey, dummyQtyPerAttempt, familyMaxLevel, familyCpGainArray, priceOf,
  computeEquipNextAction, computeEquipAwaken, computeAccessoryAwaken, computeRingNextAction,
  computeAccessoryGradeUp, computeRelicSeriesAction, computeLightstoneGradeUp,
  isEmblemDecorationUnlocked, emblemDecorationGain, karazadExpectedAttempts, computeKarazadCraft
} from "../logic/calculations.js";
import { buildNumberInput, staticLabelCell } from "./domHelpers.js";

export function renderSpecTable() {
  const body = document.getElementById("specTableBody");
  body.innerHTML = "";
  const rows = [];

  PARTS.forEach(function (part) {
    const rec = state.status[part.id];
    // 장비 돌파(0~10강) 자체는 사용자가 확률 상승권·돌파 복구권 구간을 직접 설정하는
    // ③ 탭 "강화 기대값 계산기"로 옮겼습니다 — 여기서는 등급업(혼돈→공허)만 다룹니다.
    const action = computeEquipNextAction(part, rec, state.prices);
    if (!action.variants && !action.maxed) {
      rows.push({
        item: part.name, action: action.label, cost: action.cost, gain: action.gain, qty: action.qty, isDummyQty: action.isDummyQty,
        buildMaterialCell: staticLabelCell(action.materialLabel),
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
      buildMaterialCell: staticLabelCell(ringAction.materialLabel),
      buildQtyCell: null,
      buildGainCell: null
    });
  }

  const emblemFam = state.family["emblem"];
  const emblemDecoIds = ["emblemDeco1", "emblemDeco2", "emblemDeco3", "emblemDeco4", "emblemDeco5"];
  const decoLevelSum = emblemDecoIds.reduce(function (sum, id) { return sum + state.family[id].level; }, 0);

  FAMILY_ITEMS.forEach(function (item) {
    const fam = state.family[item.id];
    // 광원석 태고 등급은 강화(잠재력 돌파) 자체를 추천하지 않고, 아래 등급업(태고→혼돈)만 계산합니다.
    // 휘장 장식은 해금 조건(EMBLEM_DECORATION_UNLOCK) 미충족 시 스펙업 수단으로 노출하지 않습니다.
    // 유료 재화(시간의 고리 등) 체크를 끄면 그 재료가 필요한 스펙업 방식 자체를 표에서 제외합니다.
    const usesUncheckedPaidMaterial = [fam.material, item.extraMaterial].some(function (name) {
      return name && state.paidMaterials[name] && !state.paidMaterials[name].use;
    });
    const skipBreakthrough = (item.id === "lightstone" && fam.grade === "태고")
      || (emblemDecoIds.indexOf(item.id) !== -1 && !isEmblemDecorationUnlocked(item.id, emblemFam, decoLevelSum))
      || usesUncheckedPaidMaterial;
    if (!skipBreakthrough && fam.level < familyMaxLevel(item, fam.grade)) {
      const qtyPerAttempt = item.qtyPerAttemptTable ? item.qtyPerAttemptTable[fam.level]
        : (item.qtyPerAttempt || dummyQtyPerAttempt(fam.level));
      // anvilTable 값 = 허용되는 최대 실패 횟수라, 총 시도 횟수 상한은 그 값+1(실패를 다 채운
      // 다음 시도가 확정 성공)입니다.
      // 카라자드(신성 등급) 장신구는 실제 성공 확률표가 있어 확률+고대의 모루를 함께 반영한
      // 기댓값을 씁니다. 그 외 등급은 기존처럼 고대의 모루 상한만으로 보수적 상한치를 잡습니다.
      const isKarazad = !!KARAZAD_ITEM_MATERIAL[item.id] && fam.grade === "카라자드";
      const attempts = isKarazad ? karazadExpectedAttempts(fam.level)
        : (item.anvilTable ? item.anvilTable[fam.level] + 1 : 1);
      const totalQty = attempts * qtyPerAttempt;
      const materialCost = totalQty * priceOf(fam.material, state.prices)
        + (item.extraMaterial ? totalQty * priceOf(item.extraMaterial, state.prices) : 0);
      const failures = attempts - 1;
      const recTable = item.recoveryTable && item.recoveryTable[fam.grade];
      const hasRealRecovery = !!(recTable && recTable.silver[fam.level] !== undefined);
      // 균열의 토템처럼 복구 비용이 은화가 아니라 재료 개수(단계별로 재료명까지 달라짐)로 정해진
      // 항목 — recoveryMaterial/recoveryQtyByLevel이 있으면 이 방식을 우선 씁니다.
      const hasMaterialRecovery = !!(item.recoveryMaterial && item.recoveryMaterial[fam.level] !== undefined);
      const recoveryCost = item.noRecovery ? 0
        : hasMaterialRecovery ? failures * item.recoveryQtyByLevel[fam.level] * priceOf(item.recoveryMaterial[fam.level], state.prices)
        : hasRealRecovery ? failures * recTable.silver[fam.level]
        : failures * (fam.recoveryQty * priceOf("돌파 복구권", state.prices) + fam.recoverySilver);
      const cost = materialCost + recoveryCost;
      const actionLabel = fam.level + " → " + (fam.level + 1) + (isKarazad ? " (기대값 " + fmt(attempts) + "회)"
        : item.anvilTable ? " (고대의 모루 확정까지 최대 " + attempts + "회)" : "");
      const cpArr = familyCpGainArray(item, fam.grade);
      const hasRealCp = !!(cpArr && cpArr[fam.level] !== undefined) || item.cpMin !== undefined;
      const gain = item.dualStatByGrade ? (fam.atkGain || 0) + (fam.defGain || 0)
        : item.cpMin !== undefined ? emblemDecorationGain(item.cpMin, item.cpMax, fam.level)
        : (hasRealCp ? cpArr[fam.level] : fam.cpPerLevel);
      rows.push({
        item: item.name, action: actionLabel, cost: cost, gain: gain, qty: qtyPerAttempt,
        isDummyQty: !item.qtyPerAttempt && !item.qtyPerAttemptTable,
        buildMaterialCell: function (item, fam, totalQty, hasRealRecovery, recTable) {
          return function (td) {
            const matLabel = document.createElement("span");
            matLabel.style.cssText = "color:var(--text-dim);font-size:11.8px;";
            matLabel.textContent = fam.material + (item.extraMaterial ? " + " + item.extraMaterial : "");
            td.appendChild(matLabel);
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
              if (item.noRecovery) {
                // 실패해도 단계가 하락하지 않아 복구가 필요 없는 항목(휘장 장식) — 복구 UI 자체를 생략합니다.
              } else if (hasMaterialRecovery) {
                const matNote = document.createElement("div");
                matNote.style.cssText = "color:var(--text-dim);font-size:10.5px;margin-top:4px;";
                matNote.textContent = "실패당 " + item.recoveryMaterial[fam.level] + " " + fmt(item.recoveryQtyByLevel[fam.level]) + "개";
                td.appendChild(matNote);
              } else if (hasRealRecovery) {
                const realNote = document.createElement("div");
                realNote.style.cssText = "color:var(--text-dim);font-size:10.5px;margin-top:4px;";
                realNote.textContent = "실패당 은화 " + fmt(recTable.silver[fam.level])
                  + (recTable.ticket ? " (또는 돌파 복구권 " + fmt(recTable.ticket[fam.level]) + "장)" : "");
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
        buildGainCell: item.dualStatByGrade
          ? function (fam) { return function (td) {
              const wrap = document.createElement("div");
              wrap.style.cssText = "display:flex;align-items:center;gap:4px;flex-wrap:wrap;justify-content:flex-end;";
              const atkLabel = document.createElement("span");
              atkLabel.style.cssText = "color:var(--text-faint);font-size:10px;"; atkLabel.textContent = "공격력";
              wrap.appendChild(atkLabel);
              wrap.appendChild(buildNumberInput(fam.atkGain, function (v) { fam.atkGain = v; persist(); renderSpecTable(); }, "55px"));
              const defLabel = document.createElement("span");
              defLabel.style.cssText = "color:var(--text-faint);font-size:10px;"; defLabel.textContent = "방어력";
              wrap.appendChild(defLabel);
              wrap.appendChild(buildNumberInput(fam.defGain, function (v) { fam.defGain = v; persist(); renderSpecTable(); }, "55px"));
              td.appendChild(wrap);
            }; }(fam)
          : (item.cpEditable && !hasRealCp) ? function (td) { td.appendChild(buildNumberInput(fam.cpPerLevel, function (v) { fam.cpPerLevel = v; persist(); renderSpecTable(); })); } : null
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

    const gradeUp = item.id === "lightstone"
      ? computeLightstoneGradeUp(fam, state.prices)
      : (ACCESSORY_GRADE_UP[item.id] ? computeAccessoryGradeUp(item.id, fam.grade, fam, state.prices) : null);
    if (gradeUp) {
      rows.push({
        item: item.name, action: gradeUp.label, cost: gradeUp.cost, gain: fam.gradeUpGain,
        buildMaterialCell: staticLabelCell(gradeUp.materialLabel),
        buildQtyCell: null,
        buildGainCell: function (fam) { return function (td) { td.appendChild(buildNumberInput(fam.gradeUpGain, function (v) { fam.gradeUpGain = v; persist(); renderSpecTable(); })); }; }(fam)
      });
    }

    const karazadCraft = KARAZAD_ITEM_MATERIAL[item.id] ? computeKarazadCraft(item.id, fam, state.prices) : null;
    if (karazadCraft) {
      const hasRealKarazadGain = karazadCraft.gain !== undefined;
      rows.push({
        item: item.name, action: karazadCraft.label, cost: karazadCraft.cost,
        gain: hasRealKarazadGain ? karazadCraft.gain : fam.gradeUpGain,
        buildMaterialCell: staticLabelCell(karazadCraft.materialLabel),
        buildQtyCell: null,
        buildGainCell: hasRealKarazadGain ? null
          : function (fam) { return function (td) { td.appendChild(buildNumberInput(fam.gradeUpGain, function (v) { fam.gradeUpGain = v; persist(); renderSpecTable(); })); }; }(fam)
      });
    }

    if (item.hasSeries) {
      const seriesAction = computeRelicSeriesAction(fam, state.prices);
      if (seriesAction && !seriesAction.maxed) {
        rows.push({
          item: item.name, action: seriesAction.label, cost: seriesAction.cost, gain: seriesAction.gain,
          buildMaterialCell: staticLabelCell(seriesAction.materialLabel),
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
