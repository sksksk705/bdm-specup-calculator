// 애플리케이션(로직) 계층 — 순수 계산 함수만 모아둡니다. DOM을 건드리지 않고, localStorage도 직접
// 읽지 않습니다(브라우저 저장소 접근은 데이터 계층인 js/data/userState.js의 몫). 재료 시세(prices)는
// 항상 인자로 명시적으로 받습니다 — 그래야 이 파일이 어떤 상태 저장 방식(localStorage, 메모리, 서버 등)
// 을 쓰든 그대로 재사용할 수 있습니다.

import {
  GRADE_ORDER, BREAKTHROUGH_GRADES, EQUIP_BREAKTHROUGH_CURVE, EQUIP_CP_TABLE, GRADE_UP_RECIPES,
  EQUIP_AWAKEN, ACCESSORY_AWAKEN, ACCESSORY_GRADE_UP, ACCESSORY_GRADE_NEXT,
  RING_QTY_PER_STEP, RING_STAT_AT_STEP, RING_GRADE_UP, RING_ATTEMPT_SILVER,
  SOUL_CUMULATIVE_QTY_TABLE, ANCIENT_ANVIL, RELIC_SERIES_CP_GAIN, RELIC_SERIES_RECOVERY_QTY, RELIC_SERIES_ATTEMPT_COST,
  FAMILY_ITEMS, EQUIP_DROP_PROTECT, EQUIP_SHADOW_PROTECT, EQUIP_PROBABILITY_BOOST, EQUIP_PROBABILITY_BOOST_ITEM,
  UNPRICED_MATERIALS, MATERIAL_PRICE_SUBSTITUTE, LIGHTSTONE_GRADE_UP_TABLE, EMBLEM_DECORATION_UNLOCK,
  KARAZAD_CRAFT, KARAZAD_ITEM_MATERIAL, KARAZAD_BREAKTHROUGH_CURVE, KARAZAD_CRAFT_CP_GAIN
} from "../data/gameData.js";

export function familyItem(id) { return FAMILY_ITEMS.filter(function (x) { return x.id === id; })[0]; }

// 재료 1개의 은화 가치 — 구매 불가 재화(UNPRICED_MATERIALS)는 0, 대체 가치가 있는 재화
// (MATERIAL_PRICE_SUBSTITUTE)는 그 대체 재료의 시세, 그 외에는 시세 표의 값을 그대로 씁니다.
export function priceOf(materialName, prices) {
  if (UNPRICED_MATERIALS.has(materialName)) return 0;
  const sub = MATERIAL_PRICE_SUBSTITUTE[materialName];
  if (sub) return prices[sub] || 0;
  return prices[materialName] || 0;
}

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
    total += qty * priceOf(matName, prices);
    parts.push(matName + " ×" + qty.toLocaleString("ko-KR"));
  });
  return { total: total, label: parts.join(", ") };
}

// 확률 상승권(1회당 1개, EQUIP_PROBABILITY_BOOST 배율)을 적용한 실제 성공 확률.
export function equipBoostedProbability(step) {
  const base = EQUIP_BREAKTHROUGH_CURVE[step] / 100;
  return Math.min(1, base * EQUIP_PROBABILITY_BOOST[step]);
}

// 실제 성공 확률 p로, 고대의 모루 확정 시도 횟수(N)를 상한으로 하는 절단 기하분포 기대 시도
// 횟수. 공식 E = (1-(1-p)^N)/p — N번째는 모루로 확정 성공하고, 그 전에 확률 p로 먼저 성공할
// 수도 있어 기댓값은 항상 N 이하입니다.
function truncatedGeometricExpectedAttempts(p, n) {
  if (p <= 0) return n;
  return (1 - Math.pow(1 - p, n)) / p;
}

// ANCIENT_ANVIL 값은 "허용되는 최대 실패 횟수"라 총 시도 횟수 상한 N은 그 값+1(실패를 다
// 채운 다음 시도가 확정 성공, 사용자 확인 2026-07-28)입니다.
export function equipExpectedAttempts(step) {
  const p = equipBoostedProbability(step);
  const n = ANCIENT_ANVIL.equip[step] + 1;
  return truncatedGeometricExpectedAttempts(p, n);
}

// 카라자드(신성 등급) 장신구 — 다른 장신구 등급과 달리 실제 성공 확률표(KARAZAD_BREAKTHROUGH_CURVE)와
// 전용 모루표(ANCIENT_ANVIL.karazad)가 있어, 장비 돌파와 같은 방식으로 둘을 함께 반영합니다.
export function karazadExpectedAttempts(step) {
  const p = KARAZAD_BREAKTHROUGH_CURVE[step] / 100;
  const n = ANCIENT_ANVIL.karazad[step] + 1;
  return truncatedGeometricExpectedAttempts(p, n);
}

// 기대 시도 횟수만큼의 재료+확률 상승권 비용. 상승권은 실패분이 아니라 "매 시도"마다 씁니다
// (어느 시도가 성공할지 미리 알 수 없으므로). 회당 재료 소모량(qtyPerAttempt)은 다른 항목과
// 동일하게 공식 문서에 없어 1개(더미)로 가정합니다 — 시도 횟수 자체는 더 이상 더미가 아닙니다.
export function equipAttemptCost(step, materialPrice, prices) {
  const attempts = equipExpectedAttempts(step);
  const qtyPerAttempt = dummyQtyPerAttempt(step);
  const totalQty = attempts * qtyPerAttempt;
  const boostItem = EQUIP_PROBABILITY_BOOST_ITEM[step];
  const boostCost = boostItem ? priceOf(boostItem, prices) : 0;
  return { attempts: attempts, qtyPerAttempt: qtyPerAttempt, totalQty: totalQty, cost: totalQty * materialPrice + attempts * boostCost };
}

// 장비 돌파는 "그냥 강화"로 진행하면 0강 초과 모든 단계에서 실패 시 50% 확률로 1단계 하락할 수
// 있고, 돌파 복구권을 필수로 소모해 방어를 시도합니다(사용자 확인, 그래도 50%만 방어됨). 고대의
// 모루는 "실패 시 기운 +1, 성공 시 그 단계만 초기화되고 그보다 아래 단계는 유지"라 하락 여부와
// 무관하다고 확인돼(사용자 확인), 하락하면 그 아래 단계까지 같은 방어 정책(및 같은 확률 상승권
// 전략)으로 다시 돌파해야 한다고 가정해 기댓값을 재귀적으로 계산합니다. 정확히 몇 단계까지
// 떨어지는지는 공식 문서에 없어 1단계 하락으로 가정했습니다. 0강은 더 떨어질 곳이 없어 방어가
// 필요 없습니다(하락 위험 자체가 없음). method: "plain"(그냥 강화, 50% 방어) 또는 "shadow"
// (7·8강 전용 혼돈의 그림자 장비 사용, 100% 방어 — 그 외 단계는 100% 방어 수단이 없어 자동으로
// plain 방식으로 처리됩니다).
export function equipStepCost(step, method, materialPrice, ticketPrice, prices) {
  const { attempts, cost: attemptCost } = equipAttemptCost(step, materialPrice, prices);
  const failures = attempts - 1; // 회당 재료 소모량은 1로 가정하므로 attempts == totalQty
  if (step <= 0) return attemptCost;
  const shadow = EQUIP_SHADOW_PROTECT[step];
  const useShadow = method === "shadow" && !!shadow;
  const protectCost = useShadow
    ? shadow.shadowTicket * ticketPrice + shadow.shadowSilver
    : EQUIP_DROP_PROTECT.plainTicket * ticketPrice + EQUIP_DROP_PROTECT.plainSilver;
  const dropChance = useShadow ? 0 : 0.5;
  const reclimbCost = dropChance > 0 ? equipStepCost(step - 1, method, materialPrice, ticketPrice, prices) : 0;
  return attemptCost + failures * protectCost + failures * dropChance * reclimbCost;
}

function equipBoostLabel(step) {
  const item = EQUIP_PROBABILITY_BOOST_ITEM[step];
  return item ? " + 시도당 " + item : "";
}

export function computeEquipNextAction(part, rec, prices) {
  const grade = rec.grade, step = rec.step;
  if (BREAKTHROUGH_GRADES[grade] && step < 10) {
    const cpTable = EQUIP_CP_TABLE[grade] && EQUIP_CP_TABLE[grade][part.id];
    const hasRealCp = !!cpTable;
    const gain = hasRealCp ? cpTable[step] : (rec.cpGain || 0);
    const materialPrice = priceOf(rec.material, prices);
    const ticketPrice = priceOf("돌파 복구권", prices);
    const attempts = equipExpectedAttempts(step);
    const shadow = EQUIP_SHADOW_PROTECT[step];
    // 0강은 더 떨어질 곳이 없어 하락 위험·복구권 소모가 없습니다. 그 외 단계는 "그냥 강화"도
    // 하락 50% 방어를 위해 돌파 복구권을 필수로 소모합니다(사용자 확인, 2026-07-28).
    const plainSuffix = step > 0
      ? " + 실패당 돌파 복구권 " + EQUIP_DROP_PROTECT.plainTicket + "개·은화 " + fmt(EQUIP_DROP_PROTECT.plainSilver) + "(하락 50% 방어, 하락 시 재돌파 비용 포함)"
      : "";
    const variants = [
      {
        label: grade + " 돌파 " + step + " → " + (step + 1) + "단계" + (step > 0 ? " (그냥 강화, 하락 50% 방어)" : ""),
        materialLabel: rec.material + " × 기대값 " + fmt(attempts) + equipBoostLabel(step) + plainSuffix,
        cost: equipStepCost(step, "plain", materialPrice, ticketPrice, prices), gain: gain, maxed: false,
        editable: { material: false, qty: false, cp: !hasRealCp }
      }
    ];
    if (shadow) {
      variants.push({
        label: grade + " 돌파 " + step + " → " + (step + 1) + "단계 (" + shadow.label + " 사용, 하락 100% 방어)",
        materialLabel: rec.material + " × 기대값 " + fmt(attempts) + equipBoostLabel(step) + " + 실패당 " + shadow.label + "(돌파 복구권 " + shadow.shadowTicket + "개·은화 " + fmt(shadow.shadowSilver) + " 제작)",
        cost: equipStepCost(step, "shadow", materialPrice, ticketPrice, prices), gain: gain, maxed: false,
        editable: { material: false, qty: false, cp: !hasRealCp }
      });
    }
    return { variants: variants };
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
    matTotal += table.materials[m] * priceOf(m, prices);
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
    matTotal += table.materials[m] * priceOf(m, prices);
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
    const cost = qty * priceOf("봉인된 전승의 고리", prices) + RING_ATTEMPT_SILVER;
    const gain = statTable[step + 1] - statTable[step];
    return {
      label: grade + " 각성 " + step + " → " + (step + 1) + "단계",
      materialLabel: "봉인된 전승의 고리 ×" + qty.toLocaleString("ko-KR") + " + 직접 은화 " + fmt(RING_ATTEMPT_SILVER),
      cost: cost, gain: gain, maxed: false, qty: qty, isDummyQty: false,
      editable: {}
    };
  }
  const up = RING_GRADE_UP[grade];
  if (!up) return { label: "최고 등급 도달", cost: 0, gain: 0, maxed: true, editable: {} };
  let total = 0;
  const parts = [];
  Object.keys(up.materials).forEach(function (matName) {
    const q = up.materials[matName];
    total += q * priceOf(matName, prices);
    parts.push(matName + " ×" + q);
  });
  return {
    label: grade + " → " + up.to + " 등급업",
    materialLabel: parts.join(", ") + " (+" + grade + " 전승의 고리)",
    cost: total, gain: 0, maxed: false, editable: {}
  };
}

// 밤·달빛 영혼석은 구매 불가 재화라 은화 스펙업 순위에서 빼고, 대신 0강부터 목표 강화 단계까지
// 필요한 재료 기대 개수만 보여줍니다. 실패 시 0강으로 떨어지되 그 단계의 "복구 재료"를 받고,
// 이미 그 단계 복구 재료가 있으면 그걸 소모해 즉시 복구되는 방식이라(사용자 확인) 닫힌 공식으로
// 정확히 계산할 수 없어(자세한 설명은 SOUL_CUMULATIVE_QTY_TABLE 주석 참고), 몬테카를로 시뮬레이션
// 으로 구한 값(SOUL_CUMULATIVE_QTY_TABLE)을 그대로 씁니다.
export function soulCumulativeQty(targetStep) {
  return SOUL_CUMULATIVE_QTY_TABLE[targetStep];
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
    total += q * priceOf(matName, prices);
    parts.push(matName + " ×" + q.toLocaleString("ko-KR"));
  });
  if (entry.silver) parts.push("직접 은화 " + fmt(entry.silver));
  return {
    label: grade + " → " + ACCESSORY_GRADE_NEXT[grade] + " 등급업",
    materialLabel: parts.join(", ") + " (선행조건: " + entry.prereq + ")",
    cost: total
  };
}

// 공허 → 카라자드(신성 등급) 제작 — 각성 완료한 공허 +9단계 또는 +10단계(최대) 장신구를
// "카라자드 장신구(+0)" 1개와 함께 소모합니다. 소모되는 공허 장신구 자체는 은화로 값을 매기지
// 않고(이미 보유한 장비), 구매해야 하는 카라자드 장신구(+0)의 시세만 비용으로 계산합니다.
export function computeKarazadCraft(itemId, fam, prices) {
  if (fam.grade !== "공허") return null;
  const materialName = KARAZAD_ITEM_MATERIAL[itemId];
  if (!materialName) return null;
  const entry = KARAZAD_CRAFT[fam.level];
  if (!entry) return null;
  if (!(fam.awakened && fam.awakened["공허"])) return null;
  const basePrice = priceOf(materialName, prices);
  const gainTable = KARAZAD_CRAFT_CP_GAIN[itemId];
  const gain = gainTable ? gainTable[entry.resultStep] : undefined;
  return {
    label: "공허 → 카라자드 제작(카라자드 " + entry.resultStep + "단계부터 시작)",
    materialLabel: materialName + "(+0) 1개 × " + fmt(basePrice) + "은화 (선행조건: " + entry.prereq + ")",
    cost: basePrice, gain: gain
  };
}

// 광원석 태고→혼돈 등급업 — 태고 강화 단계에 따라 필요한 혼돈의 원소 개수와 등급업 직후
// 시작하는 혼돈 단계가 다릅니다(LIGHTSTONE_GRADE_UP_TABLE, 사용자 제공값). 태고 등급의 잠재력
// 돌파(강화) 자체는 스펙업 표에 추천하지 않고, 이 등급업만 계산합니다.
export function computeLightstoneGradeUp(fam, prices) {
  if (fam.grade !== "태고") return null;
  const entry = LIGHTSTONE_GRADE_UP_TABLE[fam.level];
  if (!entry) return null;
  const total = entry.oreQty * priceOf("혼돈의 원소", prices)
    + 5 * priceOf("혼돈의 축", prices)
    + 10 * priceOf("아크라드", prices);
  return {
    label: "태고 → 혼돈 등급업(혼돈 " + entry.resultStep + "강부터 시작)",
    materialLabel: "혼돈의 원소 ×" + entry.oreQty + ", 혼돈의 축 ×5, 아크라드 ×10",
    cost: total
  };
}

// 휘장 장식 해금 여부 — 슬롯 1~3은 휘장(emblem) 현재 등급+강화 단계가 조건 중 하나(OR)를
// 만족하면 되고, 슬롯 4~5는 장식 5개의 강화 단계 합이 기준치 이상이어야 합니다.
export function isEmblemDecorationUnlocked(itemId, emblemFam, decoLevelSum) {
  const rule = EMBLEM_DECORATION_UNLOCK[itemId];
  if (!rule) return true;
  if (rule.type === "decoSum") return decoLevelSum >= rule.threshold;
  return rule.conditions.some(function (c) { return emblemFam.grade === c.grade && emblemFam.level >= c.level; });
}

// 휘장 장식 전투력 근사 — 공식 문서에 단계별 실수치 표가 없고 1단계(+cpMin)~150단계(+cpMax)
// 구간값만 있어, 그 사이를 선형 보간해 반올림한 근사치를 씁니다(0단계=0).
function emblemDecoValueAt(minV, maxV, level) {
  if (level <= 0) return 0;
  if (level >= 150) return maxV;
  return minV + (maxV - minV) * (level - 1) / 149;
}
export function emblemDecorationGain(minV, maxV, fromLevel) {
  return Math.round(emblemDecoValueAt(minV, maxV, fromLevel + 1)) - Math.round(emblemDecoValueAt(minV, maxV, fromLevel));
}

// 공허 유물 계열 돌파(2026-05-12부터 "유물 마력 각인") — 공허 등급 유물에서만 가능, +20 한도.
// 시도 1회당(성공/실패 모두) 아크라드 1개+차원의 조각 90개가 고정 소모되고(RELIC_SERIES_ATTEMPT_COST,
// 사용자 제공값), 고대의 모루 확정까지의 실패(attempts-1)번에 대해서는 별도로 차원의 조각 또는
// 돌파 복구권(둘 다 실수치, 10강부터 고정) 중 선택한 방식으로 복구 비용도 계산합니다. 단계별
// 전투력 증가치(공격력=방어력, 2배 근사)도 0~19단계 전부 실수치입니다(최대 생명력 증가분은 단위가
// 달라 제외 — 위 토템과 같은 이유).
export function computeRelicSeriesAction(fam, prices) {
  if (fam.grade !== "공허") return null;
  const step = fam.seriesLevel;
  const table = ANCIENT_ANVIL.relicSeries;
  if (step >= table.length) return { maxed: true, label: "최고 단계 도달", cost: 0, gain: 0 };
  const attempts = table[step] + 1; // 모루 값 = 허용 실패 횟수, +1번째 시도가 확정 성공
  const failures = attempts - 1;
  const attemptCostEach = RELIC_SERIES_ATTEMPT_COST["아크라드"] * priceOf("아크라드", prices)
    + RELIC_SERIES_ATTEMPT_COST["차원의 조각"] * priceOf("차원의 조각", prices);
  const attemptCost = attempts * attemptCostEach;
  const recoveryQtyEach = RELIC_SERIES_RECOVERY_QTY[fam.seriesRecoveryMethod][step];
  const recoveryCost = failures * recoveryQtyEach * priceOf(fam.seriesRecoveryMethod, prices);
  const cost = attemptCost + recoveryCost;
  const gain = RELIC_SERIES_CP_GAIN[step];
  return {
    maxed: false,
    label: "공허 유물 계열 돌파(마력각인) " + step + " → " + (step + 1) + " (고대의 모루 확정까지 최대 " + attempts + "회)",
    materialLabel: "시도당 아크라드 " + RELIC_SERIES_ATTEMPT_COST["아크라드"] + "개·차원의 조각 " + RELIC_SERIES_ATTEMPT_COST["차원의 조각"] + "개 × 기대값 " + fmt(attempts) + "회 · 실패 " + fmt(failures) + "회 × " + fam.seriesRecoveryMethod + " " + fmt(recoveryQtyEach) + "개",
    cost: cost, gain: gain,
    gainFixed: true
  };
}
