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

// 등급별 대표 색상 — 선택창 앞에 작은 점으로 표시합니다(사용자 제공값).
const GRADE_COLORS = { "태고": "#EC4899", "혼돈": "#6366F1", "공허": "#8B5CF6", "검은별": "#EAB308" };

// 등급 <select> 앞에 현재 등급의 대표 색상 점을 붙인 묶음(색상이 없는 등급은 점을 숨김).
function buildGradeSelect(gradeOptions, currentGrade, onChange) {
  const wrap = document.createElement("div");
  wrap.style.cssText = "display:flex;align-items:center;gap:5px;min-width:0;flex:1 1 0;width:100%;";
  const dot = document.createElement("span");
  dot.style.cssText = "display:inline-block;width:8px;height:8px;border-radius:50%;flex:none;";
  function syncDot(g) {
    const color = GRADE_COLORS[g];
    dot.style.background = color || "transparent";
    dot.style.visibility = color ? "visible" : "hidden";
  }
  syncDot(currentGrade);
  wrap.appendChild(dot);

  const gradeSel = document.createElement("select");
  gradeSel.style.cssText = "flex:1;min-width:0;padding:5px 6px;font-size:12px;";
  gradeOptions.forEach(function (g) {
    const o = document.createElement("option"); o.value = g; o.textContent = g;
    if (g === currentGrade) o.selected = true;
    gradeSel.appendChild(o);
  });
  gradeSel.addEventListener("change", function () { syncDot(gradeSel.value); onChange(gradeSel.value); });
  wrap.appendChild(gradeSel);
  return wrap;
}

export function gradeStepTile(name, gradeOptions, rec, onGradeChange, onStepChange, maxStepFor) {
  const built = buildTile(name);
  built.controls.appendChild(buildGradeSelect(gradeOptions, rec.grade, onGradeChange));

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
  built.controls.appendChild(buildGradeSelect(gradeOptions, fam.grade, onGradeChange));

  const input = document.createElement("input");
  input.type = "number"; input.min = "0"; input.max = String(maxLevel); input.value = fam.level;
  input.addEventListener("input", function () { onLevelChange(Math.max(0, parseFloat(input.value) || 0)); });
  built.controls.appendChild(input);
  if (fam.awakened) appendAwakenCheckbox(built.controls, fam.awakened, fam.grade);
  return built.tile;
}
