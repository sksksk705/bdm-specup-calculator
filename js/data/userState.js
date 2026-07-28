// 데이터 계층 — 사용자의 현재 장비/장신구 상태를 브라우저 localStorage에 저장/복원합니다.
// 가격표(price sheet)와 달리 이건 "이 브라우저를 쓰는 사람"만의 데이터라 사이트가 관리하는
// data/prices.json이 아니라 로컬 저장소에 둡니다.

import {
  PARTS, GRADE_ORDER, RING_GRADE_ORDER, SOUL_ITEMS, FAMILY_ITEMS, ACCESSORY_AWAKEN
} from "./gameData.js";
import { familyGradeOptions } from "../logic/calculations.js";

const STORAGE_KEY = "bdm_specup_calc_v3";

// 저장된 값이 없거나, 저장된 값이 0인데 새 기본값은 0이 아니면(과거엔 미입력/더미 이전 상태였던
// 항목에 이번에 값이 채워진 경우) 새 기본값을 우선 적용합니다. 사용자가 실제로 입력해 둔 0이
// 아닌 값은 항상 그대로 보존됩니다 — 코드에서 더미·기본값을 갱신해도 브라우저에 저장된 옛 0 값에
// 계속 가려지는 문제를 막기 위한 공통 로직입니다.
export function healZero(savedVal, newDefault) {
  if (savedVal === undefined || (savedVal === 0 && newDefault !== 0)) return newDefault;
  return savedVal;
}

function loadRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

// 다른 모듈은 이 객체 하나를 계속 import해서 공유합니다(속성만 바뀌고 객체 자체는 재할당되지
// 않으므로 참조 공유가 안전합니다).
export const state = {
  prices: {},   // name -> price
  status: {},   // partId -> { grade, step, material, qtyPerAttempt, cpGain }
  ring: null,   // { grade, step }
  soul: {},     // soulId -> { step, material, qtyPerAttempt, cpGain }
  family: {}    // itemId -> { level, material, qtyPerLevel, cpPerLevel }
};

// defaultPrices: data/prices.json에서 fetch해 온 배열([{name,cat,price,note}, ...]).
export function initState(defaultPrices) {
  const saved = loadRaw();

  defaultPrices.forEach(function (m) {
    const savedVal = saved && saved.prices ? saved.prices[m.name] : undefined;
    state.prices[m.name] = healZero(savedVal, m.price);
  });

  const materialNames = defaultPrices.map(function (m) { return m.name; });
  PARTS.forEach(function (p) {
    const savedRec = saved && saved.status ? saved.status[p.id] : null;
    const rec = savedRec || { grade: "혼돈", step: 0, material: "순도 높은 흑결정", qtyPerAttempt: 1, cpGain: 10 };
    rec.cpGain = healZero(rec.cpGain, 10);
    if (GRADE_ORDER.indexOf(rec.grade) === -1) rec.grade = "혼돈";
    if (materialNames.indexOf(rec.material) === -1) rec.material = "순도 높은 흑결정";
    if (!rec.awakened) rec.awakened = {};
    state.status[p.id] = rec;
  });

  state.ring = (saved && saved.ring) || { grade: "혼돈", step: 0 };
  if (RING_GRADE_ORDER.indexOf(state.ring.grade) === -1) state.ring = { grade: "혼돈", step: 0 };

  SOUL_ITEMS.forEach(function (item) {
    const savedSoul = saved && saved.soul ? saved.soul[item.id] : null;
    const rec = savedSoul || { step: 0, material: item.material, qtyPerAttempt: 1, cpGain: 10 };
    rec.cpGain = healZero(rec.cpGain, 10);
    if (materialNames.indexOf(rec.material) === -1) rec.material = item.material;
    state.soul[item.id] = rec;
  });

  FAMILY_ITEMS.forEach(function (item) {
    const savedFam = saved && saved.family ? saved.family[item.id] : null;
    const fam = savedFam || {
      level: 0, material: item.defaultMaterial, qtyPerLevel: 1, cpPerLevel: item.cpPerLevel,
      grade: familyGradeOptions(item)[0], gradeUpGain: 10, recoveryQty: 0, recoverySilver: 100000
    };
    fam.gradeUpGain = healZero(fam.gradeUpGain, 10);
    // 복구는 기본적으로 은화(인게임 재화)를 쓰는 것으로 가정합니다 — 복구권 개수는 0이 정상 기본값이고,
    // 복구권 사용이 강제되는 항목만 개별적으로 채워 넣습니다. 은화 쪽만 더미로 채웁니다.
    if (fam.recoveryQty === undefined) fam.recoveryQty = 0;
    fam.recoverySilver = healZero(fam.recoverySilver, 100000);
    if (fam.seriesLevel === undefined) fam.seriesLevel = 0;
    if (fam.seriesRecoveryMethod === undefined) fam.seriesRecoveryMethod = "돌파 복구권";
    // 고정 전투력 항목(cpEditable:false, 예: 실비아 여신상/균형의 돌)은 사용자가 값을 바꿀 UI 자체가
    // 없으므로, 저장된 옛 값이 남아있어도 항상 최신 기준값(item.cpPerLevel)으로 덮어씁니다.
    // (가격처럼 "저장된 값이 있으면 최신 값을 가린다"는 문제가 여기서는 복구할 방법이 없기 때문)
    if (!item.cpEditable) fam.cpPerLevel = item.cpPerLevel;
    if (item.materialOptions.indexOf(fam.material) === -1) fam.material = item.defaultMaterial;
    if (familyGradeOptions(item).indexOf(fam.grade) === -1) fam.grade = familyGradeOptions(item)[0];
    const hasAwakenData = Object.keys(ACCESSORY_AWAKEN).some(function (g) { return !!ACCESSORY_AWAKEN[g][item.id]; });
    if (hasAwakenData && !fam.awakened) fam.awakened = {};
    state.family[item.id] = fam;
  });
}

export function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      prices: state.prices, status: state.status, ring: state.ring, soul: state.soul, family: state.family
    }));
  } catch (e) {}
}
