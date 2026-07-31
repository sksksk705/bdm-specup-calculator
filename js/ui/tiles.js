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

// 인게임처럼 현재 강화 수치를 카드 우상단에 겹쳐 보여주는 배지 — 그 자체가 <select>라
// 클릭하면 바로 수정할 수 있습니다(범위가 정해진 값이라 드랍다운, "+N" 형식). 등급 색이
// 있으면 그 색을, 없으면 기본 강조색을 텍스트 색으로 씁니다. value(내부 강화 성공 횟수, 0~maxLevel)와
// 실제 인게임 표시 단계가 다른 항목(철벽/투지 휘장 장식처럼 100단계 이후 성공당 2단계씩 오르는
// 경우)은 labelFn으로 성공 횟수 → 실제 단계 번호를 변환합니다(생략 시 그대로 표시).
function buildLevelBadge(maxLevel, currentLevel, gradeColor, onChange, labelFn) {
  const badge = document.createElement("select");
  badge.className = "tile-level-badge";
  badge.style.color = gradeColor || "var(--accent)";
  for (let i = 0; i <= maxLevel; i++) {
    const o = document.createElement("option");
    o.value = i; o.textContent = "+" + (labelFn ? labelFn(i) : i);
    if (i === currentLevel) o.selected = true;
    badge.appendChild(o);
  }
  badge.addEventListener("change", function () { onChange(parseInt(badge.value, 10)); });
  return badge;
}

// 각성은 1회성이라 "이미 각성함"을 사용자가 직접 표시해야 다시 추천되지 않습니다. rec/fam은
// 단순 boolean(rec.awakened)만 가지고 있고, 등급이 바뀌면 gearGrid.js가 false로 초기화합니다.
// 켜져 있으면 카드에 "각성 후광" 비주얼(.awakened 클래스)도 함께 토글합니다.
export function appendAwakenCheckbox(tile, controls, rec) {
  const wrap = document.createElement("label");
  wrap.style.cssText = "display:flex;align-items:center;gap:4px;font-size:10px;color:var(--text-faint);margin-top:3px;cursor:pointer;white-space:nowrap;position:relative;z-index:1;";
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.checked = !!rec.awakened;
  cb.addEventListener("change", function () {
    rec.awakened = cb.checked;
    tile.classList.toggle("awakened", cb.checked);
    persist(); renderSpecTable();
  });
  wrap.appendChild(cb);
  const span = document.createElement("span"); span.textContent = "각성완료";
  wrap.appendChild(span);
  controls.appendChild(wrap);
}

// 등급별 대표 색상 — 선택창 앞 점과 카드 배경/테두리/배지 텍스트에 함께 씁니다(사용자 제공값).
const GRADE_COLORS = { "태고": "#EC4899", "혼돈": "#6366F1", "공허": "#8B5CF6", "검은별": "#EAB308" };

function hexToRgbParts(hex) {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255);
}

// 배경(약한 그라데이션)·테두리에 특정 색상을 반영합니다(등급 색, 영혼석 색 등 공용 —
// 색상이 없으면 스타일시트 기본값으로 되돌립니다). base는 그라데이션 밑에 깔 원래 배경
// 변수 이름(기본 --card-2, .card처럼 --ink-2를 쓰는 요소는 직접 지정).
export function applyColorTint(tile, color, base) {
  if (!color) { tile.style.background = ""; tile.style.borderColor = ""; return; }
  const rgb = hexToRgbParts(color);
  tile.style.background = "linear-gradient(135deg, rgba(" + rgb + ",0.16), transparent 70%), var(" + (base || "--card-2") + ")";
  tile.style.borderColor = "rgba(" + rgb + ",0.5)";
}

// 등급 색상을 카드에 반영해 등급이 한눈에 보이게 합니다.
function applyGradeTint(tile, grade) {
  applyColorTint(tile, GRADE_COLORS[grade]);
}

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
  applyGradeTint(built.tile, rec.grade);
  built.tile.appendChild(buildLevelBadge(maxStepFor(rec.grade), rec.step, GRADE_COLORS[rec.grade], onStepChange));
  built.controls.appendChild(buildGradeSelect(gradeOptions, rec.grade, onGradeChange));
  if (rec.awakened !== undefined) {
    if (rec.awakened) built.tile.classList.add("awakened");
    appendAwakenCheckbox(built.tile, built.controls, rec);
  }
  return built.tile;
}

export function stepOnlyTile(name, maxStep, rec, onStepChange) {
  const built = buildTile(name);
  built.tile.appendChild(buildLevelBadge(maxStep, rec.step, null, onStepChange));
  return built.tile;
}

export function levelOnlyTile(name, maxLevel, level, onChange, labelFn) {
  const built = buildTile(name);
  built.tile.appendChild(buildLevelBadge(maxLevel, level, null, onChange, labelFn));
  return built.tile;
}

// 문양 각인서처럼 강화 단계 대신 "실제 감정 결과(공격력/방어력)"를 직접 고르는 항목용 —
// +N 배지 하나 대신 값 배지 두 개(공격력/방어력)를 우상단에 세로로 겹쳐 둡니다. 배지 자체가
// <select>라 클릭해서 바로 수정할 수 있고, 범위는 현재 등급 기준입니다(사용자 확인, 2026-07-31).
function buildStatBadge(range, currentValue, label, gradeColor, onChange) {
  const badge = document.createElement("select");
  badge.className = "tile-stat-badge";
  badge.style.color = gradeColor || "var(--accent)";
  for (let i = range[0]; i <= range[1]; i++) {
    const o = document.createElement("option");
    o.value = i; o.textContent = label + " " + i;
    if (i === currentValue) o.selected = true;
    badge.appendChild(o);
  }
  badge.addEventListener("change", function () { onChange(parseInt(badge.value, 10)); });
  return badge;
}

export function dualStatWithGradeTile(name, gradeOptions, fam, statRangeByGrade, onAtkChange, onDefChange, onGradeChange) {
  const built = buildTile(name);
  applyGradeTint(built.tile, fam.grade);
  const badgeWrap = document.createElement("div");
  badgeWrap.className = "tile-stat-badges";
  badgeWrap.appendChild(buildStatBadge(statRangeByGrade.atk[fam.grade], fam.atkGain, "공격력", GRADE_COLORS[fam.grade], onAtkChange));
  badgeWrap.appendChild(buildStatBadge(statRangeByGrade.def[fam.grade], fam.defGain, "방어력", GRADE_COLORS[fam.grade], onDefChange));
  built.tile.appendChild(badgeWrap);
  built.controls.appendChild(buildGradeSelect(gradeOptions, fam.grade, onGradeChange));
  return built.tile;
}

// 등급업(제작) 경로가 있는 항목용 — 등급 선택 + 현재 단계(배지 드랍다운)를 함께 보여준다.
export function levelWithGradeTile(name, gradeOptions, maxLevel, fam, onLevelChange, onGradeChange) {
  const built = buildTile(name);
  applyGradeTint(built.tile, fam.grade);
  built.tile.appendChild(buildLevelBadge(maxLevel, fam.level, GRADE_COLORS[fam.grade], onLevelChange));
  built.controls.appendChild(buildGradeSelect(gradeOptions, fam.grade, onGradeChange));
  if (fam.awakened !== undefined) {
    if (fam.awakened) built.tile.classList.add("awakened");
    appendAwakenCheckbox(built.tile, built.controls, fam);
  }
  return built.tile;
}
