// 애플리케이션(로직) 계층 — 순수 계산 함수만 모아둡니다. DOM을 건드리지 않고, localStorage도 직접
// 읽지 않습니다(브라우저 저장소 접근은 데이터 계층인 js/data/userState.js의 몫). 재료 시세(prices)는
// 항상 인자로 명시적으로 받습니다 — 그래야 이 파일이 어떤 상태 저장 방식(localStorage, 메모리, 서버 등)
// 을 쓰든 그대로 재사용할 수 있습니다.

import {
  GRADE_ORDER, EQUIP_BREAKTHROUGH_CURVE, EQUIP_CP_TABLE, EQUIP_BASE_STAT, GRADE_UP_RECIPES,
  EQUIP_AWAKEN, ACCESSORY_AWAKEN, ACCESSORY_GRADE_UP, ACCESSORY_GRADE_NEXT, GRADE_UP_BUY_ITEM,
  RING_QTY_PER_STEP, RING_STAT_AT_STEP, RING_GRADE_UP, RING_ATTEMPT_SILVER,
  SOUL_OPTIMAL_CUMULATIVE_QTY, ANCIENT_ANVIL, RELIC_SERIES_CP_GAIN, RELIC_SERIES_RECOVERY_QTY, RELIC_SERIES_ATTEMPT_COST,
  FAMILY_ITEMS, EQUIP_DROP_PROTECT,
  UNPRICED_MATERIALS, MATERIAL_PRICE_SUBSTITUTE, MATERIAL_CRAFT_MULTIPLIER, LIGHTSTONE_GRADE_UP_TABLE, EMBLEM_DECORATION_UNLOCK,
  KARAZAD_CRAFT, KARAZAD_ITEM_MATERIAL, KARAZAD_BREAKTHROUGH_CURVE,
  SHADOW_GEAR, SHADOW_GEAR_ANVIL, SHADOW_GEAR_ATTEMPT_SILVER, BLACK_CRYSTAL_TICKET_QTY, BLACK_CRYSTAL_BOOST_RECIPES,
  INSIGNIA_BOOK_MEDIAN_STAT
} from "../data/gameData.js";

export function familyItem(id) { return FAMILY_ITEMS.filter(function (x) { return x.id === id; })[0]; }

// 재료 1개의 은화 가치 — 구매 불가 재화(UNPRICED_MATERIALS)는 0, 대체 가치가 있는 재화
// (MATERIAL_PRICE_SUBSTITUTE)는 그 대체 재료의 시세, 그 외에는 시세 표의 값을 그대로 씁니다.
export function priceOf(materialName, prices) {
  if (UNPRICED_MATERIALS.has(materialName)) return 0;
  const sub = MATERIAL_PRICE_SUBSTITUTE[materialName];
  if (sub) return prices[sub] || 0;
  const craft = MATERIAL_CRAFT_MULTIPLIER[materialName];
  if (craft) return craft.qty * priceOf(craft.from, prices);
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

// 철벽·투지 휘장 장식 — 내부 강화 성공 횟수(0~150)를 실제 인게임 단계 번호로 변환합니다.
// 100번째 성공까지는 성공당 1단계, 그 이후는 성공당 2단계씩 올라 150번째 성공이 200단계입니다
// (사용자 확인, 2026-07-31).
export function emblemDecoRealLevel(successCount) {
  return successCount <= 100 ? successCount : 100 + (successCount - 100) * 2;
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

// 실제 성공 확률 p로, 고대의 모루 확정 시도 횟수(N)를 상한으로 하는 절단 기하분포 기대 시도
// 횟수. 공식 E = (1-(1-p)^N)/p — N번째는 모루로 확정 성공하고, 그 전에 확률 p로 먼저 성공할
// 수도 있어 기댓값은 항상 N 이하입니다.
function truncatedGeometricExpectedAttempts(p, n) {
  if (p <= 0) return n;
  return (1 - Math.pow(1 - p, n)) / p;
}

// 카라자드(신성 등급) 장신구 — 다른 장신구 등급과 달리 실제 성공 확률표(KARAZAD_BREAKTHROUGH_CURVE)와
// 전용 모루표(ANCIENT_ANVIL.karazad)가 있어, 장비 돌파와 같은 방식으로 둘을 함께 반영합니다.
export function karazadExpectedAttempts(step) {
  const p = KARAZAD_BREAKTHROUGH_CURVE[step] / 100;
  const n = ANCIENT_ANVIL.karazad[step] + 1;
  return truncatedGeometricExpectedAttempts(p, n);
}

// 장비 돌파 "강화 기대값 계산기"(③ 탭) — 사용자가 직접 확률 상승권 10%/50%/100% 사용 구간과
// 돌파 복구권 사용 구간을 설정해, FROM강→TO강까지 필요한 재료·상승권·복구권 기대 개수를
// 계산합니다. ②탭 순위표의 하드코딩된 기본 전략과 달리 여기서는 완전히 자유롭게 설정할 수
// 있습니다. 돌파 복구권 사용 구간 밖의 단계는 실패 시 방어 없이 100% 이전 단계로 하락합니다
// (사용자 확인, 2026-07-29 — "혼돈의 그림자 장비" 100% 방어 옵션은 이 계산기에서는 단순화를
// 위해 제외). 하락은 진짜 바닥인 0강까지 재귀적으로 이어질 수 있습니다 — FROM은 "이 계산에
// 얼마나 많은 구간을 합산할지"만 정할 뿐, FROM 아래로 떨어져도 그만큼 다시 올라오는 비용이
// 그대로 반영됩니다(사용자 확인, 2026-07-29 — 이전엔 FROM을 바닥으로 잘못 취급해 FROM 밑으로
// 떨어지는 하락 비용이 누락돼 있었습니다). 재료(순도 높은 흑결정)와 별개로 시도 1회당(성공/
// 실패 모두) 은화 500이 고정으로 듭니다(사용자 확인). 하락 방어는 돌파 복구권(200개)만
// 소모하고 별도 은화는 들지 않습니다. 상승권·복구권·재료는 전부 raw 개수로 반환합니다.
const EQUIP_RANGE_BOOST_MULT = { "10": 1.1, "50": 1.5, "100": 2 };
const EQUIP_RANGE_ATTEMPT_SILVER = 500;

function equipRangeBoostTypeAt(label, boostConfig) {
  if (boostConfig.boost10.use && label >= boostConfig.boost10.start && label <= boostConfig.boost10.end) return "10";
  if (boostConfig.boost50.use && label >= boostConfig.boost50.start && label <= boostConfig.boost50.end) return "50";
  if (boostConfig.boost100.use && label >= boostConfig.boost100.start && label <= boostConfig.boost100.end) return "100";
  return null;
}
function equipRangeUsesRecoveryAt(label, recoveryConfig) {
  return !!recoveryConfig.use && label >= recoveryConfig.start && label <= recoveryConfig.end;
}

// 확률 상승권 구간은 10%→50%→100% 순서로 이어져야 하고(사용 중인 것끼리는 빈 구간 없이 연속),
// 맨 앞·맨 뒤는 비워둘 수 있습니다. 돌파 복구권 구간은 그 자체로 1~10강 안의 유효한 구간이면
// 됩니다(다른 구간과 무관). 문제가 없으면 null, 있으면 에러 메시지를 반환합니다.
export function validateEquipRangeConfig(boostConfig, recoveryConfig) {
  const order = ["boost10", "boost50", "boost100"];
  const labels = { boost10: "10%", boost50: "50%", boost100: "100%" };
  const active = [];
  for (const key of order) {
    const c = boostConfig[key];
    if (!c.use) continue;
    if (!(c.start >= 1 && c.end <= 10 && c.start <= c.end)) {
      return labels[key] + " 구간이 올바르지 않습니다(1~10강, 시작≤끝).";
    }
    active.push({ label: labels[key], start: c.start, end: c.end });
  }
  for (let i = 1; i < active.length; i++) {
    if (active[i].start !== active[i - 1].end + 1) {
      return active[i - 1].label + " 구간과 " + active[i].label + " 구간 사이는 빈 칸 없이 이어져야 합니다.";
    }
  }
  if (recoveryConfig.use && !(recoveryConfig.start >= 1 && recoveryConfig.end <= 10 && recoveryConfig.start <= recoveryConfig.end)) {
    return "돌파 복구권 구간이 올바르지 않습니다(1~10강, 시작≤끝).";
  }
  return null;
}

// 그림자 장비 1개 제작 재료(돌파 복구권 1050개 고정 + 확률 상승권 10%/50%/100% 중 하나, 섞어
// 쓸 수 없음)에서 현재 시세 기준 가장 저렴한 조합을 고릅니다.
function cheapestBlackCrystalRecipe(prices) {
  let best = null;
  BLACK_CRYSTAL_BOOST_RECIPES.forEach(function (r) {
    const cost = BLACK_CRYSTAL_TICKET_QTY * priceOf("돌파 복구권", prices) + r.boostQty * priceOf("확률 상승권(" + r.boostType + "%)", prices);
    if (!best || cost < best.cost) best = { boostType: r.boostType, boostQty: r.boostQty, cost: cost };
  });
  return best;
}

// 그림자 장비 트랙 — 100% 방어(실패해도 하락 없음, 복구 비용 없음)라 확률/모루/하락 재귀를 전부
// 건너뛰고 결정론적으로 계산합니다(자체 단계마다 모루 17 → 시도 18회 확정).
function computeShadowGearResult(step, prices) {
  const shadow = SHADOW_GEAR[step];
  const attempts = (SHADOW_GEAR_ANVIL + 1) * shadow.targetSteps;
  const crystalQty = attempts * shadow.crystalPerAttempt;
  const recipe = cheapestBlackCrystalRecipe(prices);
  const result = {
    attempts: 0, silverDirect: attempts * SHADOW_GEAR_ATTEMPT_SILVER,
    boost10: 0, boost50: 0, boost100: 0,
    recoveryTicket: crystalQty * BLACK_CRYSTAL_TICKET_QTY, blackCrystal: crystalQty
  };
  result["boost" + recipe.boostType] = crystalQty * recipe.boostQty;
  return result;
}

export function computeEquipRangePlan(from, to, boostConfig, recoveryConfig, prices, shadowConfig) {
  shadowConfig = shadowConfig || {};
  const memo = {};
  function zero() { return { attempts: 0, silverDirect: 0, boost10: 0, boost50: 0, boost100: 0, recoveryTicket: 0, blackCrystal: 0 }; }
  function solve(step) {
    if (step < 0) return zero(); // 0강→1강 자체는 여전히 계산해야 함 — 그 아래(음수)만 진짜 바닥
    if (memo[step] !== undefined) return memo[step];
    if (SHADOW_GEAR[step] && shadowConfig["step" + step]) {
      const shadowResult = computeShadowGearResult(step, prices);
      memo[step] = shadowResult;
      return shadowResult;
    }
    const label = step + 1;
    const boostType = equipRangeBoostTypeAt(label, boostConfig);
    const mult = boostType ? EQUIP_RANGE_BOOST_MULT[boostType] : 1;
    const p = Math.min(1, (EQUIP_BREAKTHROUGH_CURVE[step] / 100) * mult);
    const n = ANCIENT_ANVIL.equip[step] + 1;
    const attempts = truncatedGeometricExpectedAttempts(p, n);
    const failures = attempts - 1;

    const usesRecovery = equipRangeUsesRecoveryAt(label, recoveryConfig);
    const dropChance = usesRecovery ? 0.5 : 1;
    const protectTicket = usesRecovery ? failures * EQUIP_DROP_PROTECT.plainTicket : 0;
    const attemptSilver = attempts * EQUIP_RANGE_ATTEMPT_SILVER;

    const reclimb = solve(step - 1);
    const factor = failures * dropChance;

    const result = {
      attempts: attempts + reclimb.attempts * factor,
      silverDirect: attemptSilver + reclimb.silverDirect * factor,
      boost10: (boostType === "10" ? attempts : 0) + reclimb.boost10 * factor,
      boost50: (boostType === "50" ? attempts : 0) + reclimb.boost50 * factor,
      boost100: (boostType === "100" ? attempts : 0) + reclimb.boost100 * factor,
      recoveryTicket: protectTicket + reclimb.recoveryTicket * factor,
      blackCrystal: reclimb.blackCrystal * factor
    };
    memo[step] = result;
    return result;
  }

  const total = zero();
  for (let s = from; s < to; s++) {
    const r = solve(s);
    total.attempts += r.attempts;
    total.blackCrystal += r.blackCrystal;
    total.silverDirect += r.silverDirect;
    total.boost10 += r.boost10;
    total.boost50 += r.boost50;
    total.boost100 += r.boost100;
    total.recoveryTicket += r.recoveryTicket;
  }
  return total;
}

// 장비 등급업(혼돈→공허)은 각성이 필수 선행조건이지만(장신구와 동일 규칙), 강화(잠재력 돌파)
// 단계는 무관하게 아무 때나 할 수 있습니다 — 현재 단계 그대로 다음 등급으로 넘어갑니다(사용자
// 확인, 2026-07-31). 전투력 증가치는 "등급업 전(현재 등급 0강 기준치 + 지금까지 강화로 쌓은
// 증가분 + 이미 각성했다면 그 보너스) vs 등급업 후(다음 등급 0강 기준치 + 같은 강화 단계까지의
// 증가분)"의 차이로 계산합니다.
function equipCumulativeCp(grade, partId, uptoStep) {
  const arr = EQUIP_CP_TABLE[grade] && EQUIP_CP_TABLE[grade][partId];
  if (!arr) return 0;
  let sum = 0;
  for (let i = 0; i < uptoStep; i++) sum += arr[i];
  return sum;
}
export function computeEquipGradeUp(part, rec, prices) {
  const grade = rec.grade;
  const nextGrade = nextGradeOf(grade);
  if (!nextGrade) return null;
  const awakenTable = EQUIP_AWAKEN[grade] && EQUIP_AWAKEN[grade][part.id];
  if (awakenTable && !rec.awakened) return null; // computeEquipAwaken이 별도로 각성 액션을 보여줌
  const recipe = GRADE_UP_RECIPES.filter(function (r) { return r.from === grade && r.to === nextGrade; })[0];
  if (!recipe) return null;
  const c = recipeCostForPart(recipe, part.id, prices);
  const currentCp = EQUIP_BASE_STAT[grade][part.id] + equipCumulativeCp(grade, part.id, rec.step) + (awakenTable ? awakenTable.cpGain : 0);
  const nextCp = EQUIP_BASE_STAT[nextGrade][part.id] + equipCumulativeCp(nextGrade, part.id, rec.step);
  return {
    label: grade + "(" + rec.step + "강) → " + nextGrade + "(" + rec.step + "강) 등급업",
    materialLabel: c.label,
    cost: c.total, gain: nextCp - currentCp
  };
}

// 각성 — 잠재력 돌파 단계와 무관하게 해당 등급에서 언제든 가능하지만(선행조건 없음), 다음 등급으로
// 등급업하려면 반드시 먼저 각성해야 합니다. 아직 그 등급에서 각성하지 않았을 때만 액션으로
// 제시합니다(1회성, 완료하면 ① 탭의 체크박스로 표시 후 다시 나타나지 않습니다). rec.awakened/
// fam.awakened는 등급별 객체가 아니라 단순 boolean이고(사용자 확인, 2026-07-30), 등급이
// 바뀌면 gearGrid.js에서 false로 초기화합니다.
export function computeEquipAwaken(part, rec, prices) {
  const grade = rec.grade;
  const table = EQUIP_AWAKEN[grade] && EQUIP_AWAKEN[grade][part.id];
  if (!table) return null;
  if (rec.awakened) return null;
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
  if (fam.awakened) return null;
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
// 필요한 재료 기대 개수만 보여줍니다. 실패마다 "확정 복구 비용을 내고 남기" vs "결제 없이 위험
// 감수(그 단계 복구 재료를 이미 가졌으면 공짜로 남고, 없으면 0강으로 떨어지되 재료를 얻기)" 중
// 최적을 매번 골랐을 때의 기댓값이며(사용자 확인), 상태공간이 커서(목표 13강 기준 8,192가지
// 조합 × 13단계) 브라우저에서 매번 풀면 느려 오프라인에서 값 반복으로 미리 계산해 뒀습니다
// (SOUL_OPTIMAL_CUMULATIVE_QTY, scripts/soul_solver.mjs 참고).
export function soulCumulativeQty(targetStep) {
  return SOUL_OPTIMAL_CUMULATIVE_QTY[targetStep];
}

// 반지/목걸이/허리띠/귀걸이/팔찌/휘장/토템/연금석/유물1/유물2의 등급업(제작) 경로.
// 이미 각성 완료된 "자기 자신"(이전 등급 아이템)을 재료로 소모하지만 은화로 값을 매기지 않고,
// 그 외 부재료·직접 소모 은화만 계산합니다. 반지/목걸이/귀걸이/허리띠/팔찌의 혼돈→공허는
// 재료 제작 대신 완제품(공허의 OO) 구매로도 할 수 있어(GRADE_UP_BUY_ITEM), 더 싼 쪽을 기본값으로
// 쓰고 fam.gradeUpMethod("material"/"buy")로 사용자가 직접 고르면 그 선택을 따릅니다
// (사용자 확인, 2026-07-31).
export function computeAccessoryGradeUp(itemId, grade, fam, prices) {
  const table = ACCESSORY_GRADE_UP[itemId];
  if (!table || !table[grade]) return null;
  // 각성해야만 다음 등급으로 제작할 수 있습니다. 아직 각성 전이면 등급업 액션을 감추고
  // 별도로 계산되는 "각성" 액션(computeAccessoryAwaken)만 보여줍니다.
  const awakenTable = ACCESSORY_AWAKEN[grade] && ACCESSORY_AWAKEN[grade][itemId];
  if (awakenTable && !fam.awakened) return null;
  const entry = table[grade];
  let materialTotal = entry.silver || 0;
  const parts = [];
  Object.keys(entry.materials).forEach(function (matName) {
    const q = entry.materials[matName];
    materialTotal += q * priceOf(matName, prices);
    parts.push(matName + " ×" + q.toLocaleString("ko-KR"));
  });
  if (entry.silver) parts.push("직접 은화 " + fmt(entry.silver));
  const materialOption = { materialLabel: parts.join(", ") + " (선행조건: " + entry.prereq + ")", cost: materialTotal };

  const buyItemName = GRADE_UP_BUY_ITEM[itemId];
  const buyOption = buyItemName ? { materialLabel: buyItemName + " × 1 구매", cost: priceOf(buyItemName, prices) } : null;

  const label = grade + " → " + ACCESSORY_GRADE_NEXT[grade] + " 등급업";
  if (!buyOption) return { label: label, materialLabel: materialOption.materialLabel, cost: materialOption.cost, methodOptions: null };

  const method = (fam.gradeUpMethod === "material" || fam.gradeUpMethod === "buy")
    ? fam.gradeUpMethod
    : (buyOption.cost < materialOption.cost ? "buy" : "material");
  const chosen = method === "buy" ? buyOption : materialOption;
  return {
    label: label, materialLabel: chosen.materialLabel, cost: chosen.cost,
    methodOptions: { material: materialOption, buy: buyOption, current: method }
  };
}

// 공허 → 카라자드(신성 등급) 제작 — 각성 완료한 공허 +9단계 또는 +10단계(최대) 장신구를
// "카라자드 장신구(+0)" 1개와 함께 소모합니다. 소모되는 공허 장신구 자체는 은화로 값을 매기지
// 않고(이미 보유한 장비), 구매해야 하는 카라자드 장신구(+0)의 시세만 비용으로 계산합니다.
// KARAZAD_CRAFT_CP_GAIN 수치는 "전투력 증가분"이 아니라 공격력/방어력 절대 수치라고 확인돼
// (사용자 확인, 2026-07-29) 전투력 증가는 다시 직접 입력(gain: undefined → 호출부에서
// fam.gradeUpGain 사용)으로 되돌렸습니다 — 실제 증가분 계산에 필요한 데이터를 확인 중입니다.
export function computeKarazadCraft(itemId, fam, prices) {
  if (fam.grade !== "공허") return null;
  const materialName = KARAZAD_ITEM_MATERIAL[itemId];
  if (!materialName) return null;
  const entry = KARAZAD_CRAFT[fam.level];
  if (!entry) return null;
  if (!fam.awakened) return null;
  const basePrice = priceOf(materialName, prices);
  return {
    label: "공허 → 카라자드 제작(카라자드 " + entry.resultStep + "단계부터 시작)",
    materialLabel: materialName + "(+0) 1개 × " + fmt(basePrice) + "은화 (선행조건: " + entry.prereq + ")",
    cost: basePrice
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

// 문양 각인서 — 강화가 아니라 "다음 등급 책으로 교체 구매"가 스펙업 액션입니다. 전투력
// 상승량은 다음 등급 중앙값(공격력+방어력)에서 ①탭에서 고른 현재 실제 감정 결과를 뺀 값입니다
// (사용자 확인, 2026-07-31). 이미 최고 등급(혼돈)이면 더 살 게 없어 null.
export function computeInsigniaGradeUp(item, fam, prices) {
  const grades = item.gradeOptions;
  const next = grades[grades.indexOf(fam.grade) + 1];
  if (!next) return null;
  const material = item.materialByGrade[next];
  const target = INSIGNIA_BOOK_MEDIAN_STAT[next];
  const current = (fam.atkGain || 0) + (fam.defGain || 0);
  return {
    label: fam.grade + " → " + next + " 교체 구매",
    materialLabel: material + " × 1",
    cost: priceOf(material, prices),
    gain: (target.atk + target.def) - current
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
  // 복구는 항상 차원의 조각만 사용합니다(사용자 확인, 2026-07-29 — 돌파 복구권 선택지 제거).
  const recoveryQtyEach = RELIC_SERIES_RECOVERY_QTY["차원의 조각"][step];
  const recoveryCost = failures * recoveryQtyEach * priceOf("차원의 조각", prices);
  const cost = attemptCost + recoveryCost;
  const gain = RELIC_SERIES_CP_GAIN[step];
  return {
    maxed: false,
    label: "공허 유물 계열 돌파(마력각인) " + step + " → " + (step + 1) + " (고대의 모루 확정까지 최대 " + attempts + "회)",
    materialLabel: "시도당 아크라드 " + RELIC_SERIES_ATTEMPT_COST["아크라드"] + "개·차원의 조각 " + RELIC_SERIES_ATTEMPT_COST["차원의 조각"] + "개 × 기대값 " + fmt(attempts) + "회 · 실패 " + fmt(failures) + "회 × 차원의 조각 " + fmt(recoveryQtyEach) + "개",
    cost: cost, gain: gain,
    gainFixed: true
  };
}
