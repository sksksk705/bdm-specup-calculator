// 애플리케이션(로직) 계층 — 순수 계산 함수만 모아둡니다. DOM을 건드리지 않고, localStorage도 직접
// 읽지 않습니다(브라우저 저장소 접근은 데이터 계층인 js/data/userState.js의 몫). 재료 시세(prices)는
// 항상 인자로 명시적으로 받습니다 — 그래야 이 파일이 어떤 상태 저장 방식(localStorage, 메모리, 서버 등)
// 을 쓰든 그대로 재사용할 수 있습니다.

import {
  GRADE_ORDER, BREAKTHROUGH_GRADES, EQUIP_CP_TABLE, GRADE_UP_RECIPES,
  EQUIP_AWAKEN, ACCESSORY_AWAKEN, ACCESSORY_GRADE_UP, ACCESSORY_GRADE_NEXT,
  RING_QTY_PER_STEP, RING_STAT_AT_STEP, RING_GRADE_UP,
  SOUL_BREAKTHROUGH_CURVE, ANCIENT_ANVIL, RELIC_SERIES_CP_GAIN, RELIC_SERIES_RECOVERY_QTY,
  FAMILY_ITEMS, RISKY_STEPS
} from "../data/gameData.js";

export function familyItem(id) { return FAMILY_ITEMS.filter(function (x) { return x.id === id; })[0]; }

export function fmt(n) {
  if (!isFinite(n)) return "–";
  return Math.round(n).toLocaleString("ko-KR");
}

// 정렬 우선순위 점수 — 값이 클수록 좋은 스펙업(내림차순 정렬용). 실제로 표에 보여주는 값은
// "전투력 1당 필요 은화"(낮을수록 좋음)이므로, 여기서는 그 역수 방향으로 점수를 매깁니다.
export function efficiencySortKey(cost, gain) {
  if (gain <= 0) return -Number.MAX_SAFE_INTEGER; // 전투력 미입력 — 맨 뒤로
  if (cost <= 0) return Number.MAX_SAFE_INTEGER; // 무료 — 맨 앞으로
  return -(cost / gain);
}

// "회당(레벨당) 소모 개수" 기본값 — 장신구는 공식 문서에 "돌파 1회당 동일한 아이템 1개 필요"로
// 명시돼 있고, 그 외 자기 자신을 소모하거나 전용 재화 1개를 투입하는 항목들도 보통 같은 방식이라
// 1로 고정합니다. 단계에 비례해 늘어나는 게 아닙니다 — 이후 항목별로 다른 값이 확인되면 그때
// 개별적으로 반영하면 됩니다.
export function dummyQtyPerAttempt(level) {
  return 1;
}

export function nextGradeOf(grade) {
  const idx = GRADE_ORDER.indexOf(grade);
  if (idx === -1 || idx === GRADE_ORDER.length - 1) return null;
  return GRADE_ORDER[idx + 1];
}

export function familyGradeOptions(item) { return item.gradeOptions || ["태고", "혼돈", "공허"]; }
export function familyMaxLevel(item, grade) {
  return (item.maxLevelByGrade && item.maxLevelByGrade[grade]) || item.maxLevel;
}
// 등급별 실수치 전투력 테이블이 있으면 그 배열을, 없으면 null을 돌려줍니다.
export function familyCpGainArray(item, grade) {
  if (!item.cpTable) return null;
  const g = item.cpTable[grade];
  if (!g) return null;
  return item.cpTableKey ? g[item.cpTableKey] : g;
}

export function recipeCostForPart(recipe, partId, prices) {
  const materials = recipe.byPart[partId] || recipe.byPart.ALL;
  let total = 0;
  const parts = [];
  Object.keys(materials).forEach(function (matName) {
    const qty = materials[matName];
    total += qty * (prices[matName] || 0);
    parts.push(matName + " ×" + qty.toLocaleString("ko-KR"));
  });
  return { total: total, label: parts.join(", ") };
}

// 장비 돌파 7→8, 8→9(위 RISKY_STEPS)는 실패 시 확률적으로 1단계 하락할 수 있는데, 고대의 모루는
// "실패 시 기운 +1, 성공 시 그 단계만 초기화되고 그보다 아래 단계는 유지"라 하락 여부와 무관하다고
// 확인돼(사용자 확인), 하락하면 그 아래 단계까지 같은 방어 정책으로 다시 돌파해야 한다고 가정해
// 기댓값을 재귀적으로 계산합니다. 정확히 몇 단계까지 떨어지는지는 공식 문서에 없어 1단계 하락으로
// 가정했습니다. method: "plain"(그냥 강화, 50% 방어) 또는 "shadow"(그림자 장비 사용, 100% 방어).
export function equipStepCost(step, method, materialPrice, ticketPrice) {
  const attempts = ANCIENT_ANVIL.equip[step];
  const failures = attempts - 1;
  const base = attempts * materialPrice;
  const risky = RISKY_STEPS[step];
  if (!risky) return base;
  const protectCost = method === "shadow"
    ? risky.shadowTicket * ticketPrice + risky.shadowSilver
    : risky.plainTicket * ticketPrice + risky.plainSilver;
  const dropChance = method === "shadow" ? 0 : 0.5;
  const reclimbCost = dropChance > 0 ? equipStepCost(step - 1, method, materialPrice, ticketPrice) : 0;
  return base + failures * protectCost + failures * dropChance * reclimbCost;
}

export function computeEquipNextAction(part, rec, prices) {
  const grade = rec.grade, step = rec.step;
  if (BREAKTHROUGH_GRADES[grade] && step < 10) {
    const cpTable = EQUIP_CP_TABLE[grade] && EQUIP_CP_TABLE[grade][part.id];
    const hasRealCp = !!cpTable;
    const gain = hasRealCp ? cpTable[step] : (rec.cpGain || 0);
    if (RISKY_STEPS[step]) {
      const risky = RISKY_STEPS[step];
      const materialPrice = prices[rec.material] || 0;
      const ticketPrice = prices["돌파 복구권"] || 0;
      return {
        variants: [
          {
            label: grade + " 돌파 " + step + " → " + (step + 1) + "단계 (그냥 강화, 하락 50% 방어)",
            materialLabel: rec.material + " × 기대값 " + fmt(ANCIENT_ANVIL.equip[step]) + " + 실패당 돌파 복구권 200개·은화 500(하락 방어, 하락 시 재돌파 비용 포함)",
            cost: equipStepCost(step, "plain", materialPrice, ticketPrice), gain: gain, maxed: false,
            editable: { material: false, qty: false, cp: !hasRealCp }
          },
          {
            label: grade + " 돌파 " + step + " → " + (step + 1) + "단계 (" + risky.label + " 사용, 하락 100% 방어)",
            materialLabel: rec.material + " × 기대값 " + fmt(ANCIENT_ANVIL.equip[step]) + " + 실패당 " + risky.label + "(돌파 복구권 1050개·은화 5000 제작)",
            cost: equipStepCost(step, "shadow", materialPrice, ticketPrice), gain: gain, maxed: false,
            editable: { material: false, qty: false, cp: !hasRealCp }
          }
        ]
      };
    }
    const attempts = ANCIENT_ANVIL.equip[step];
    const qtyPerAttempt = dummyQtyPerAttempt(step);
    const qty = attempts * qtyPerAttempt;
    const cost = qty * (prices[rec.material] || 0);
    return {
      label: grade + " 돌파 " + step + " → " + (step + 1) + "단계",
      materialLabel: rec.material + " × 기대값 " + fmt(qty),
      cost: cost, gain: gain, maxed: false, qty: qtyPerAttempt, isDummyQty: true,
      editable: { material: true, qty: false, cp: !hasRealCp }
    };
  }
  const nextGrade = nextGradeOf(grade);
  if (!nextGrade) return { label: "최고 단계 도달", cost: 0, gain: 0, maxed: true, editable: {} };
  // 각성해야만 다음 등급으로 제작(등급업)할 수 있습니다(잠재력 돌파 단계와는 무관 — 각성은 언제든
  // 가능하지만, 등급업의 필수 선행조건입니다). 아직 각성 전이면 등급업 액션 대신 별도로 계산되는
  // "각성" 액션(computeEquipAwaken)만 표시합니다.
  if (EQUIP_AWAKEN[grade] && !(rec.awakened && rec.awakened[grade])) {
    return { label: "각성 필요(등급업 선행조건)", cost: 0, gain: 0, maxed: true, editable: {} };
  }
  const recipe = GRADE_UP_RECIPES.filter(function (r) { return r.from === grade && r.to === nextGrade; })[0];
  if (recipe) {
    const c = recipeCostForPart(recipe, part.id, prices);
    return {
      label: grade + " → " + nextGrade + " 등급업",
      materialLabel: c.label,
      cost: c.total, gain: rec.cpGain || 0, maxed: false,
      editable: { material: false, qty: false, cp: true }
    };
  }
  return { label: "데이터 없음", cost: 0, gain: 0, maxed: true, editable: {} };
}

// 각성 — 잠재력 돌파 단계와 무관하게 해당 등급에서 언제든 가능하지만(선행조건 없음), 다음 등급으로
// 등급업하려면 반드시 먼저 각성해야 합니다. 아직 그 등급에서 각성하지 않았을 때만 액션으로
// 제시합니다(1회성, 완료하면 ① 탭의 체크박스로 표시 후 다시 나타나지 않습니다).
export function computeEquipAwaken(part, rec, prices) {
  const grade = rec.grade;
  const table = EQUIP_AWAKEN[grade] && EQUIP_AWAKEN[grade][part.id];
  if (!table) return null;
  if (rec.awakened && rec.awakened[grade]) return null;
  let matTotal = 0;
  const matParts = [];
  Object.keys(table.materials).forEach(function (m) {
    matTotal += table.materials[m] * (prices[m] || 0);
    matParts.push(m + " ×" + table.materials[m]);
  });
  return {
    label: grade + " 각성",
    materialLabel: (matParts.length ? matParts.join(", ") + ", " : "") + "직접 은화 " + fmt(table.silver),
    cost: matTotal + table.silver, gain: table.cpGain
  };
}

export function computeAccessoryAwaken(item, fam, prices) {
  const grade = fam.grade;
  const table = ACCESSORY_AWAKEN[grade] && ACCESSORY_AWAKEN[grade][item.id];
  if (!table) return null;
  if (fam.awakened && fam.awakened[grade]) return null;
  let matTotal = 0;
  const matParts = [];
  Object.keys(table.materials).forEach(function (m) {
    matTotal += table.materials[m] * (prices[m] || 0);
    matParts.push(m + " ×" + table.materials[m]);
  });
  return {
    label: grade + " 각성",
    materialLabel: (matParts.length ? matParts.join(", ") + ", " : "") + "직접 은화 " + fmt(table.silver),
    cost: matTotal + table.silver, gain: table.cpGain
  };
}

export function computeRingNextAction(rec, prices) {
  const grade = rec.grade, step = rec.step;
  const qtyTable = RING_QTY_PER_STEP[grade], statTable = RING_STAT_AT_STEP[grade];
  const maxStep = qtyTable.length;
  if (step < maxStep) {
    const qty = qtyTable[step];
    const cost = qty * (prices["봉인된 전승의 고리"] || 0) + (rec.extraSilver || 0);
    const gain = statTable[step + 1] - statTable[step];
    return {
      label: grade + " 각성 " + step + " → " + (step + 1) + "단계",
      materialLabel: "봉인된 전승의 고리 ×" + qty.toLocaleString("ko-KR"),
      cost: cost, gain: gain, maxed: false, qty: qty, isDummyQty: false,
      editable: { extraSilver: true }
    };
  }
  const up = RING_GRADE_UP[grade];
  if (!up) return { label: "최고 등급 도달", cost: 0, gain: 0, maxed: true, editable: {} };
  let total = 0;
  const parts = [];
  Object.keys(up.materials).forEach(function (matName) {
    const q = up.materials[matName];
    total += q * (prices[matName] || 0);
    parts.push(matName + " ×" + q);
  });
  return {
    label: grade + " → " + up.to + " 등급업",
    materialLabel: parts.join(", ") + " (+" + grade + " 전승의 고리)",
    cost: total, gain: 0, maxed: false, editable: {}
  };
}

export function computeSoulNextAction(rec, prices) {
  const step = rec.step, maxStep = SOUL_BREAKTHROUGH_CURVE.length;
  if (step >= maxStep) return { label: "최고 단계 도달", cost: 0, gain: 0, maxed: true, editable: {} };
  const p = SOUL_BREAKTHROUGH_CURVE[step] / 100;
  const attempts = p > 0 ? 1 / p : Infinity;
  const qtyPerAttempt = dummyQtyPerAttempt(step);
  const qty = attempts * qtyPerAttempt;
  const cost = qty * (prices[rec.material] || 0);
  return {
    label: step + " → " + (step + 1) + "단계",
    materialLabel: rec.material + " × 기대값 " + fmt(qty),
    cost: cost, gain: rec.cpGain || 0, maxed: false, qty: qtyPerAttempt, isDummyQty: true,
    editable: { material: true, qty: false, cp: true }
  };
}

// 반지/목걸이/허리띠/귀걸이/팔찌/휘장/토템/연금석/유물1/유물2의 등급업(제작) 경로.
// 이미 각성 완료된 "자기 자신"(이전 등급 아이템)을 재료로 소모하지만 은화로 값을 매기지 않고,
// 그 외 부재료·직접 소모 은화만 계산합니다.
export function computeAccessoryGradeUp(itemId, grade, fam, prices) {
  const table = ACCESSORY_GRADE_UP[itemId];
  if (!table || !table[grade]) return null;
  // 각성해야만 다음 등급으로 제작할 수 있습니다. 아직 각성 전이면 등급업 액션을 감추고
  // 별도로 계산되는 "각성" 액션(computeAccessoryAwaken)만 보여줍니다.
  const awakenTable = ACCESSORY_AWAKEN[grade] && ACCESSORY_AWAKEN[grade][itemId];
  if (awakenTable && !(fam.awakened && fam.awakened[grade])) return null;
  const entry = table[grade];
  let total = entry.silver || 0;
  const parts = [];
  Object.keys(entry.materials).forEach(function (matName) {
    const q = entry.materials[matName];
    total += q * (prices[matName] || 0);
    parts.push(matName + " ×" + q.toLocaleString("ko-KR"));
  });
  if (entry.silver) parts.push("직접 은화 " + fmt(entry.silver));
  return {
    label: grade + " → " + ACCESSORY_GRADE_NEXT[grade] + " 등급업",
    materialLabel: parts.join(", ") + " (선행조건: " + entry.prereq + ")",
    cost: total
  };
}

// 공허 유물 계열 돌파(2026-05-12부터 "유물 마력 각인") — 공허 등급 유물에서만 가능, +20 한도.
// 시도 자체에 소모되는 재료는 공식 문서에 없어 0으로 두고, 고대의 모루 확정까지의 실패
// (attempts-1)번에 대해서만 차원의 조각 또는 돌파 복구권(둘 다 실수치, 10강부터 고정) 중
// 선택한 방식으로 복구 비용을 계산합니다. 단계별 전투력 증가치(공격력=방어력, 2배 근사)도
// 0~19단계 전부 실수치입니다(최대 생명력 증가분은 단위가 달라 제외 — 위 토템과 같은 이유).
export function computeRelicSeriesAction(fam, prices) {
  if (fam.grade !== "공허") return null;
  const step = fam.seriesLevel;
  const table = ANCIENT_ANVIL.relicSeries;
  if (step >= table.length) return { maxed: true, label: "최고 단계 도달", cost: 0, gain: 0 };
  const attempts = table[step];
  const failures = attempts - 1;
  const recoveryQtyEach = RELIC_SERIES_RECOVERY_QTY[fam.seriesRecoveryMethod][step];
  const cost = failures * recoveryQtyEach * (prices[fam.seriesRecoveryMethod] || 0);
  const gain = RELIC_SERIES_CP_GAIN[step];
  return {
    maxed: false,
    label: "공허 유물 계열 돌파(마력각인) " + step + " → " + (step + 1) + " (고대의 모루 확정까지 최대 " + attempts + "회)",
    materialLabel: "시도 자체 소모 재료 미공개(0으로 가정) · 실패 " + fmt(failures) + "회 × " + fam.seriesRecoveryMethod + " " + fmt(recoveryQtyEach) + "개",
    cost: cost, gain: gain,
    gainFixed: true
  };
}
