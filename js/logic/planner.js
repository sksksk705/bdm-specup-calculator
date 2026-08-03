// 로직 계층 — ⑤ 탭 "은화 예산 플래너"용 스펙업 시뮬레이션. calculations.js의 개별 계산 함수를
// 그대로 재사용하되, state를 통째로 복제해 그 복제본만 반복적으로 변형(apply)하며 진행합니다
// (원본 state는 손대지 않습니다). 카라자드 제작(신성 등급 최상위 경로)은 제외했습니다 — 조건이
// 복잡하고 실사용 빈도가 낮아 우선 흔한 스펙업 경로만 다룹니다.

import {
  PARTS, FAMILY_ITEMS, ACCESSORY_AWAKEN, ACCESSORY_GRADE_UP, ACCESSORY_GRADE_NEXT,
  RING_QTY_PER_STEP, RING_GRADE_UP, LIGHTSTONE_GRADE_UP_TABLE, INSIGNIA_BOOK_MEDIAN_STAT,
  KARAZAD_ITEM_MATERIAL
} from "../data/gameData.js";
import {
  priceOf, dummyQtyPerAttempt, familyMaxLevel, familyCpGainArray, nextGradeOf,
  computeEquipAwaken, computeEquipGradeUp, computeAccessoryAwaken, computeAccessoryGradeUp,
  computeRingNextAction, computeRelicSeriesAction, computeLightstoneGradeUp,
  computeInsigniaGradeUp, isEmblemDecorationUnlocked, karazadExpectedAttempts
} from "./calculations.js";

// ②탭(specTable.js)의 "장비/장신구 잠재력 돌파" 계산을 DOM 없이 그대로 옮긴 순수 함수입니다.
// specTable.js를 고치면 여기도 같이 맞춰야 두 탭의 계산이 어긋나지 않습니다.
function computeFamilyBreakthrough(item, fam, prices, emblemFam, decoLevelSum, paidMaterials) {
  const emblemDecoIds = ["emblemDeco1", "emblemDeco2", "emblemDeco3", "emblemDeco4", "emblemDeco5"];
  const usesUncheckedPaidMaterial = [fam.material, item.extraMaterial].some(function (name) {
    return name && paidMaterials[name] && !paidMaterials[name].use;
  });
  const skipBreakthrough = (item.id === "lightstone" && fam.grade === "태고")
    || (emblemDecoIds.indexOf(item.id) !== -1 && !isEmblemDecorationUnlocked(item.id, emblemFam, decoLevelSum))
    || usesUncheckedPaidMaterial;
  if (skipBreakthrough || fam.level >= familyMaxLevel(item, fam.grade)) return null;

  const qtyByGrade = item.qtyPerAttemptTableByGrade && item.qtyPerAttemptTableByGrade[fam.grade];
  let qtyPerAttempt = qtyByGrade ? qtyByGrade[fam.level]
    : item.qtyPerAttemptTable ? item.qtyPerAttemptTable[fam.level]
    : (item.qtyPerAttempt || dummyQtyPerAttempt(fam.level));
  const isKarazad = !!KARAZAD_ITEM_MATERIAL[item.id] && fam.grade === "카라자드";
  const attempts = isKarazad ? karazadExpectedAttempts(fam.level)
    : (item.anvilTable ? item.anvilTable[fam.level] + 1 : 1);
  const freeMat = item.freeMaterialUntilLevel;
  const usesFreeMaterial = !!(freeMat && fam.level < freeMat.maxLevel);
  const effectiveMaterial = usesFreeMaterial ? freeMat.material : fam.material;
  if (usesFreeMaterial) qtyPerAttempt = 1;
  const totalQty = attempts * qtyPerAttempt;
  const materialCost = totalQty * priceOf(effectiveMaterial, prices)
    + (item.extraMaterial ? totalQty * priceOf(item.extraMaterial, prices) : 0);
  const failures = attempts - 1;
  const recTable = item.recoveryTable && item.recoveryTable[fam.grade];
  const hasRealRecovery = !!(recTable && recTable.silver[fam.level] !== undefined);
  const hasMaterialRecovery = !!(item.recoveryMaterial && item.recoveryMaterial[fam.level] !== undefined);
  const recoveryCost = item.noRecovery ? 0
    : hasMaterialRecovery ? failures * item.recoveryQtyByLevel[fam.level] * priceOf(item.recoveryMaterial[fam.level], prices)
    : hasRealRecovery ? failures * recTable.silver[fam.level]
    : failures * (fam.recoveryQty * priceOf("돌파 복구권", prices) + fam.recoverySilver);
  const cost = materialCost + recoveryCost;
  const cpArr = familyCpGainArray(item, fam.grade);
  const hasRealCp = !!(cpArr && cpArr[fam.level] !== undefined);
  const gain = hasRealCp ? cpArr[fam.level] : fam.cpPerLevel;
  return {
    label: fam.level + " → " + (fam.level + 1) + "단계",
    cost: cost, gain: gain,
    apply: function () { fam.level += 1; }
  };
}

// 지금 이 state에서 "한 번에 살 수 있는 다음 액션들"을 전부 모읍니다(전투력 증가량이 0 이하인
// 액션은 예산 배분에 의미가 없어 제외). 각 액션은 apply()로 자기 자신을 state에 반영합니다.
export function collectSpecActions(state) {
  const actions = [];
  function add(itemName, label, cost, gain, apply) {
    if (gain > 0 && isFinite(cost) && cost >= 0) actions.push({ item: itemName, label: label, cost: cost, gain: gain, apply: apply });
  }

  PARTS.forEach(function (part) {
    const rec = state.status[part.id];
    const awaken = computeEquipAwaken(part, rec, state.prices);
    if (awaken) add(part.name, awaken.label, awaken.cost, awaken.gain, function () { rec.awakened = true; });
    const gradeUp = computeEquipGradeUp(part, rec, state.prices);
    if (gradeUp) add(part.name, gradeUp.label, gradeUp.cost, gradeUp.gain, function () {
      rec.grade = nextGradeOf(rec.grade); rec.awakened = false;
    });
  });

  const ringAction = computeRingNextAction(state.ring, state.prices);
  if (!ringAction.maxed) {
    add("전승의 고리", ringAction.label, ringAction.cost, ringAction.gain, function () {
      const qtyTable = RING_QTY_PER_STEP[state.ring.grade];
      if (state.ring.step < qtyTable.length) {
        state.ring.step += 1;
      } else {
        const up = RING_GRADE_UP[state.ring.grade];
        state.ring.grade = up.to; state.ring.step = 0;
      }
    });
  }

  const emblemFam = state.family.emblem;
  const emblemDecoIds = ["emblemDeco1", "emblemDeco2", "emblemDeco3", "emblemDeco4", "emblemDeco5"];
  const decoLevelSum = emblemDecoIds.reduce(function (sum, id) { return sum + state.family[id].level; }, 0);

  FAMILY_ITEMS.forEach(function (item) {
    const fam = state.family[item.id];

    const breakthrough = computeFamilyBreakthrough(item, fam, state.prices, emblemFam, decoLevelSum, state.paidMaterials);
    if (breakthrough) add(item.name, breakthrough.label, breakthrough.cost, breakthrough.gain, breakthrough.apply);

    const accAwaken = ACCESSORY_AWAKEN[fam.grade] ? computeAccessoryAwaken(item, fam, state.prices) : null;
    if (accAwaken) add(item.name, accAwaken.label, accAwaken.cost, accAwaken.gain, function () { fam.awakened = true; });

    if (item.id === "insigniaBook") {
      const insigniaGradeUp = computeInsigniaGradeUp(item, fam, state.prices);
      if (insigniaGradeUp) {
        add(item.name, insigniaGradeUp.label, insigniaGradeUp.cost, insigniaGradeUp.gain, function () {
          const next = item.gradeOptions[item.gradeOptions.indexOf(fam.grade) + 1];
          fam.grade = next;
          fam.atkGain = INSIGNIA_BOOK_MEDIAN_STAT[next].atk;
          fam.defGain = INSIGNIA_BOOK_MEDIAN_STAT[next].def;
          if (item.materialByGrade && item.materialByGrade[next]) fam.material = item.materialByGrade[next];
        });
      }
    }

    if (item.id === "lightstone") {
      const lightstoneUp = computeLightstoneGradeUp(fam, state.prices);
      if (lightstoneUp) {
        add(item.name, lightstoneUp.label, lightstoneUp.cost, fam.gradeUpGain, function () {
          const entry = LIGHTSTONE_GRADE_UP_TABLE[fam.level];
          fam.grade = "혼돈"; fam.level = entry.resultStep;
        });
      }
    } else if (ACCESSORY_GRADE_UP[item.id]) {
      const gradeUp = computeAccessoryGradeUp(item.id, fam.grade, fam, state.prices);
      if (gradeUp) {
        add(item.name, gradeUp.label, gradeUp.cost, fam.gradeUpGain, function () {
          const next = ACCESSORY_GRADE_NEXT[fam.grade];
          fam.grade = next; fam.level = 0; fam.awakened = false;
          if (item.materialByGrade && item.materialByGrade[next]) fam.material = item.materialByGrade[next];
        });
      }
    }

    if (item.hasSeries) {
      const seriesAction = computeRelicSeriesAction(fam, state.prices);
      if (seriesAction && !seriesAction.maxed) {
        add(item.name, seriesAction.label, seriesAction.cost, seriesAction.gain, function () { fam.seriesLevel += 1; });
      }
    }
  });

  return actions;
}

// 매번 "은화 1당 전투력이 가장 좋은" 액션을 하나씩 골라 적용하는 탐욕 시뮬레이션 공통 루프.
// 매 순간의 최선만 보는 방식이라 전역 최적(더 비싼 선택이 나중에 더 큰 이득을 주는 경우)은
// 놓칠 수 있지만, ②탭이 원래 "다음 한 스텝 추천"에 쓰는 것과 같은 기준이라 일관적입니다.
// 반복 상한(5000)은 무한 루프 방지용 안전장치입니다. maxCost가 있으면 그 한도 안에서(예산
// 모드), targetGain이 있으면 그 전투력에 도달할 때까지(목표 전투력 모드) 반복합니다.
const MAX_ITERATIONS = 5000;
function runGreedySim(state, maxCost, targetGain) {
  const sim = JSON.parse(JSON.stringify(state));
  let totalCost = 0, totalGain = 0;
  const steps = [];
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    if (targetGain !== undefined && totalGain >= targetGain) break;
    let actions = collectSpecActions(sim);
    if (maxCost !== undefined) {
      const remaining = maxCost - totalCost;
      actions = actions.filter(function (a) { return a.cost <= remaining; });
    }
    if (!actions.length) break;
    actions.sort(function (a, b) { return (a.cost / a.gain) - (b.cost / b.gain); });
    const pick = actions[0];
    pick.apply();
    totalCost += pick.cost;
    totalGain += pick.gain;
    steps.push({ item: pick.item, label: pick.label, cost: pick.cost, gain: pick.gain });
  }
  return { totalCost: totalCost, totalGain: totalGain, steps: steps };
}

// 보유 은화로 살 수 있는 만큼 전부 사는 모드.
export function planSpecBudget(state, budget) {
  const r = runGreedySim(state, budget, undefined);
  return { totalCost: r.totalCost, totalGain: r.totalGain, remaining: budget - r.totalCost, steps: r.steps };
}

// 목표 전투력에 도달할 때까지 가장 싼 조합부터 사는 모드(예산 무제한). 모든 항목을 최고
// 단계까지 올려도 목표에 못 미치면 reached:false — 이 계산기가 다루는 항목만으로는 그 이상
// 전투력을 올릴 방법이 없다는 뜻입니다.
export function planSpecByTargetGain(state, targetGain) {
  const r = runGreedySim(state, undefined, targetGain);
  return { totalCost: r.totalCost, totalGain: r.totalGain, reached: r.totalGain >= targetGain, steps: r.steps };
}
