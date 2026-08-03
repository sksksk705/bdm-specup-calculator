// 프레젠테이션 계층 — ①탭 "장비 & 장신구" 프리셋 드랍다운. 장비(주무기~신발)·장신구(반지~팔찌)·
// 유물(프리셋에 지정된 경우만)의 등급/단계/각성 여부에 더해, extra 필드가 있으면 휘장·휘장 장식·
// 전승의 고리·실비아 여신상·균형의 돌·광원석·토템·균열의 토템·조화의 연금석·문양 각인서·유물
// 계열돌파까지 대략 맞춰 채웁니다. 카라자드 제작은 건드리지 않습니다.

import { GEAR_PRESETS, PARTS, FAMILY_ITEMS, INSIGNIA_BOOK_MEDIAN_STAT } from "../data/gameData.js";
import { state, persist } from "../data/userState.js";
import { renderGearGrid, renderGearExtra } from "./gearGrid.js";
import { renderSpecTable } from "./specTable.js";
import { track } from "../analytics.js";
import { t } from "../i18n.js";

const ACCESSORY_IDS = ["ring1", "necklace", "earring", "belt", "bracelet"];
const RELIC_IDS = ["relic1", "relic2"];
const EMBLEM_DECO_IDS = ["emblemDeco1", "emblemDeco2", "emblemDeco3", "emblemDeco4", "emblemDeco5"];

function familyItemById(id) { return FAMILY_ITEMS.filter(function (x) { return x.id === id; })[0]; }

function applyGradeLevel(fam, item, target) {
  fam.grade = target.grade;
  fam.level = target.level;
  fam.awakened = target.awakened;
  if (item.materialByGrade && item.materialByGrade[target.grade]) fam.material = item.materialByGrade[target.grade];
}

function applyPreset(preset) {
  PARTS.forEach(function (part) {
    const rec = state.status[part.id];
    rec.grade = preset.equip.grade;
    rec.step = preset.equip.step;
    rec.awakened = preset.equip.awakened;
  });
  ACCESSORY_IDS.forEach(function (id) {
    applyGradeLevel(state.family[id], familyItemById(id), preset.accessory);
  });
  if (preset.relic) {
    RELIC_IDS.forEach(function (id) {
      applyGradeLevel(state.family[id], familyItemById(id), preset.relic);
    });
  }
  if (preset.extra) {
    const extra = preset.extra;
    applyGradeLevel(state.family.emblem, familyItemById("emblem"), { grade: extra.emblem.grade, level: extra.emblem.level, awakened: undefined });
    EMBLEM_DECO_IDS.forEach(function (id) { state.family[id].level = extra.emblemDecoLevel; });
    state.ring.grade = extra.ring.grade;
    state.ring.step = extra.ring.step;
    state.family.sylvia.level = extra.sylvia;
    state.family.balance.level = extra.balance;
    applyGradeLevel(state.family.lightstone, familyItemById("lightstone"), { grade: extra.lightstone.grade, level: extra.lightstone.level, awakened: undefined });
    applyGradeLevel(state.family.totem, familyItemById("totem"), { grade: extra.totem.grade, level: extra.totem.level, awakened: undefined });
    state.family.riftTotem.level = extra.riftTotemLevel;
    applyGradeLevel(state.family.alchemy, familyItemById("alchemy"), { grade: extra.alchemy.grade, level: extra.alchemy.level, awakened: undefined });

    const insigniaFam = state.family.insigniaBook, insigniaItem = familyItemById("insigniaBook");
    insigniaFam.grade = extra.insigniaGrade;
    insigniaFam.atkGain = INSIGNIA_BOOK_MEDIAN_STAT[extra.insigniaGrade].atk;
    insigniaFam.defGain = INSIGNIA_BOOK_MEDIAN_STAT[extra.insigniaGrade].def;
    if (insigniaItem.materialByGrade && insigniaItem.materialByGrade[extra.insigniaGrade]) insigniaFam.material = insigniaItem.materialByGrade[extra.insigniaGrade];

    RELIC_IDS.forEach(function (id) { state.family[id].seriesLevel = extra.relicSeriesLevel; });
  }
  persist();
  renderGearGrid();
  renderGearExtra();
  renderSpecTable();
  track("preset_apply", { preset_id: preset.id });
}

export function refreshPresetOptions() {
  const select = document.getElementById("gearPreset");
  const prevValue = select.value;
  select.querySelectorAll("option[data-preset]").forEach(function (o) { o.remove(); });
  GEAR_PRESETS.forEach(function (preset) {
    const o = document.createElement("option");
    o.value = preset.id;
    o.dataset.preset = "1";
    o.textContent = t(preset.name) + " — " + t(preset.desc);
    select.appendChild(o);
  });
  select.value = prevValue;
}

export function initPresetSelector() {
  refreshPresetOptions();
  const select = document.getElementById("gearPreset");
  document.getElementById("applyPresetBtn").addEventListener("click", function () {
    const preset = GEAR_PRESETS.filter(function (p) { return p.id === select.value; })[0];
    if (!preset) return;
    applyPreset(preset);
  });
}
