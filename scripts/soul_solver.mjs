// 오프라인 사전계산 스크립트 — 밤·달빛 영혼석 최적 복구 전략(값 반복)을 목표 단계별로 풀어
// gameData.js에 박아 넣을 상수 배열을 만듭니다. 브라우저에서 매번 계산하면 target=13 기준
// 1초 넘게 걸려(8192개 비트마스크 상태 × 수백~수천 회 반복) 미리 계산해 둡니다.

const p = 0.51, q = 1 - p;
const RECOVERY_COST = [0, 1, 3, 6, 11, 19, 34, 59, 102, 175, 301, 518, 890];
const MAX_STEP = 13;

function solveTarget(target) {
  const numMasks = 1 << target;
  const V = [];
  for (let lvl = 0; lvl <= target; lvl++) V.push(new Float64Array(numMasks));
  // "그냥 결제"만 했을 때의 값으로 초기화하면 참값에 가까이서 시작해 반복 횟수가 크게 줄어듭니다.
  const payFromLvl = new Float64Array(target + 1);
  for (let lvl = target - 1; lvl >= 0; lvl--) {
    const cost = RECOVERY_COST[lvl] || 0;
    payFromLvl[lvl] = (1 + p * payFromLvl[lvl + 1] + q * cost) / p;
  }
  for (let lvl = 0; lvl <= target; lvl++) V[lvl].fill(payFromLvl[lvl]);

  const EPS = 1e-10, MAX_ITER = 20000;
  for (let iter = 0; iter < MAX_ITER; iter++) {
    let maxDelta = 0;
    for (let lvl = target - 1; lvl >= 0; lvl--) {
      const Vnext = V[lvl + 1], Vlvl = V[lvl];
      const cost = RECOVERY_COST[lvl] || 0;
      const bit = 1 << lvl;
      for (let mask = 0; mask < numMasks; mask++) {
        const hasToken = (mask & bit) !== 0;
        const riskVal = hasToken ? Vlvl[mask & ~bit] : V[0][mask | bit];
        const payVal = (1 + p * Vnext[mask] + q * cost) / p;
        const riskBranchVal = 1 + p * Vnext[mask] + q * riskVal;
        const newVal = Math.min(payVal, riskBranchVal);
        const delta = Math.abs(newVal - Vlvl[mask]);
        if (delta > maxDelta) maxDelta = delta;
        Vlvl[mask] = newVal;
      }
    }
    if (maxDelta < EPS) break;
  }
  return V;
}

// 목표 단계별 "0강부터 그 단계까지" 기대 재료 개수.
const cumulative = [0];
for (let target = 1; target <= MAX_STEP; target++) {
  const V = solveTarget(target);
  cumulative.push(V[0][0]);
}

// 각 단계에서 "토큰(그 단계 복구 재료)이 아직 없는 상태"일 때 결제(pay) vs 위험감수(risk) 중
// 어느 쪽이 더 싼지 — 최종 목표를 13강으로 잡고 푼 결과를 기준으로 판단합니다.
const V13 = solveTarget(MAX_STEP);
const policy = [];
for (let lvl = 0; lvl < MAX_STEP; lvl++) {
  const cost = RECOVERY_COST[lvl] || 0;
  const Vnext = V13[lvl + 1];
  const mask = 0; // 토큰 없음
  const bit = 1 << lvl;
  const riskVal = V13[0][mask | bit];
  const payVal = (1 + p * Vnext[mask] + q * cost) / p;
  const riskBranchVal = 1 + p * Vnext[mask] + q * riskVal;
  policy.push({ level: lvl, pay: +payVal.toFixed(4), risk: +riskBranchVal.toFixed(4), better: payVal <= riskBranchVal ? "pay" : "risk" });
}

console.log("cumulative =", JSON.stringify(cumulative.map(v => +v.toFixed(6))));
console.log("policy:");
policy.forEach(p => console.log(`  Lv${p.level}->${p.level+1}: pay=${p.pay} risk=${p.risk} => ${p.better}`));
