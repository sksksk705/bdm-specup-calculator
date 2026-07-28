// 프레젠테이션 계층 — ① 탭 "장비 & 장신구" 그리드를 이루는 타일(칸) 빌더들.

import { persist } from "../data/userState.js";
import { renderSpecTable } from "./specTable.js";

export function buildTile(name, extraClass) {
  const tile = document.createElement("div");
  tile.className = "gear-tile" + (extraClass ? " " + extraClass : "");
  const nameEl = document.createElement("div");
  nameEl.className = "tile-name"; nameEl.textContent = name;
  tile.appendChild(nameEl);
  const controls = document.createElement("div");
  controls.className = "tile-controls";
  tile.appendChild(controls);
  return { tile: tile, controls: controls };
}

// 각성은 1회성이라 "이미 각성함"을 사용자가 직접 표시해야 다시 추천되지 않습니다.
// awakenedObj는 등급별로 따로 저장하므로(rec.awakened[grade]) 등급을 바꾸면 자동으로 그 등급의
// 체크 상태를 보여줍니다.
export function appendAwakenCheckbox(controls, awakenedObj, grade) {
  const wrap = document.createElement("label");
  wrap.style.cssText = "display:flex;align-items:center;gap:4px;font-size:10px;color:var(--text-faint);margin-top:3px;cursor:pointer;";
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.checked = !!awakenedObj[grade];
  cb.addEventListener("change", function () {
    awakenedObj[grade] = cb.checked;
    persist(); renderSpecTable();
  });
  wrap.appendChild(cb);
  const span = document.createElement("span"); span.textContent = grade + " 각성완료";
  wrap.appendChild(span);
  controls.appendChild(wrap);
}

export function gradeStepTile(name, gradeOptions, rec, onGradeChange, onStepChange, maxStepFor) {
  const built = buildTile(name);
  const gradeSel = document.createElement("select");
  gradeOptions.forEach(function (g) {
    const o = document.createElement("option"); o.value = g; o.textContent = g;
    if (g === rec.grade) o.selected = true;
    gradeSel.appendChild(o);
  });
  gradeSel.addEventListener("change", function () { onGradeChange(gradeSel.value); });
  built.controls.appendChild(gradeSel);

  const stepSel = document.createElement("select");
  const maxStep = maxStepFor(rec.grade);
  for (let i = 0; i <= maxStep; i++) {
    const o2 = document.createElement("option"); o2.value = i; o2.textContent = i + "단계";
    if (i === rec.step) o2.selected = true;
    stepSel.appendChild(o2);
  }
  stepSel.addEventListener("change", function () { onStepChange(parseInt(stepSel.value, 10)); });
  built.controls.appendChild(stepSel);
  if (rec.awakened) appendAwakenCheckbox(built.controls, rec.awakened, rec.grade);
  return built.tile;
}

export function stepOnlyTile(name, maxStep, rec, onStepChange) {
  const built = buildTile(name);
  const stepSel = document.createElement("select");
  for (let i = 0; i <= maxStep; i++) {
    const o = document.createElement("option"); o.value = i; o.textContent = i + "단계";
    if (i === rec.step) o.selected = true;
    stepSel.appendChild(o);
  }
  stepSel.addEventListener("change", function () { onStepChange(parseInt(stepSel.value, 10)); });
  built.controls.appendChild(stepSel);
  return built.tile;
}

export function levelOnlyTile(name, maxLevel, level, onChange) {
  const built = buildTile(name);
  const input = document.createElement("input");
  input.type = "number"; input.min = "0"; input.max = String(maxLevel); input.value = level;
  input.addEventListener("input", function () { onChange(Math.max(0, parseFloat(input.value) || 0)); });
  built.controls.appendChild(input);
  return built.tile;
}

// 등급업(제작) 경로가 있는 항목용 — 등급 선택 + 현재 단계 숫자 입력을 함께 보여준다.
export function levelWithGradeTile(name, gradeOptions, maxLevel, fam, onLevelChange, onGradeChange) {
  const built = buildTile(name);
  const gradeSel = document.createElement("select");
  gradeOptions.forEach(function (g) {
    const o = document.createElement("option"); o.value = g; o.textContent = g;
    if (g === fam.grade) o.selected = true;
    gradeSel.appendChild(o);
  });
  gradeSel.addEventListener("change", function () { onGradeChange(gradeSel.value); });
  built.controls.appendChild(gradeSel);

  const input = document.createElement("input");
  input.type = "number"; input.min = "0"; input.max = String(maxLevel); input.value = fam.level;
  input.addEventListener("input", function () { onLevelChange(Math.max(0, parseFloat(input.value) || 0)); });
  built.controls.appendChild(input);
  if (fam.awakened) appendAwakenCheckbox(built.controls, fam.awakened, fam.grade);
  return built.tile;
}
