// 프레젠테이션 계층 — ①탭 "장비 & 장신구" 프리셋 드랍다운. 장비(주무기~신발)·장신구(반지~팔찌)·
// 유물(프리셋에 지정된 경우만)의 등급/단계/각성 여부를 한 번에 채워줍니다. 그 외 항목은 건드리지
// 않습니다.

import { GEAR_PRESETS, PARTS, FAMILY_ITEMS } from "../data/gameData.js";
import { state, persist } from "../data/userState.js";
import { renderGearGrid } from "./gearGrid.js";
import { renderSpecTable } from "./specTable.js";

const ACCESSORY_IDS = ["ring1", "necklace", "earring", "belt", "bracelet"];
const RELIC_IDS = ["relic1", "relic2"];

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
  persist();
  renderGearGrid();
  renderSpecTable();
}

export function initPresetSelector() {
  const select = document.getElementById("gearPreset");
  GEAR_PRESETS.forEach(function (preset) {
    const o = document.createElement("option");
    o.value = preset.id;
    o.textContent = preset.name + " — " + preset.desc;
    select.appendChild(o);
  });
  document.getElementById("applyPresetBtn").addEventListener("click", function () {
    const preset = GEAR_PRESETS.filter(function (p) { return p.id === select.value; })[0];
    if (!preset) return;
    applyPreset(preset);
  });
}
