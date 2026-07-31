// 프레젠테이션 계층 — ① 탭 "장비 & 장신구"(인게임 화면과 같은 배치) 그리드와
// "기타 가문 콘텐츠" 3칸을 그립니다.

import { PARTS, RING_GRADE_ORDER, RING_QTY_PER_STEP, GRADE_ORDER, ANCIENT_ANVIL, INSIGNIA_BOOK_MEDIAN_STAT } from "../data/gameData.js";
import { state, persist } from "../data/userState.js";
import { familyGradeOptions, familyMaxLevel, familyItem, emblemDecoRealLevel } from "../logic/calculations.js";
import { gradeStepTile, stepOnlyTile, levelOnlyTile, levelWithGradeTile, dualStatWithGradeTile } from "./tiles.js";
import { renderSpecTable } from "./specTable.js";

export function renderGearGrid() {
  const side = document.getElementById("gearSide");
  const main = document.getElementById("gearMain");
  const triple = document.getElementById("gearTriple");
  side.innerHTML = ""; main.innerHTML = ""; triple.innerHTML = "";

  // 왼쪽: 휘장, 휘장 장식 5개(용맹/침착/격렬/철벽/투지), 고리(전승의 고리)
  const emblemItem = familyItem("emblem"), emblemFam = state.family["emblem"];
  side.appendChild(levelWithGradeTile("휘장", familyGradeOptions(emblemItem), familyMaxLevel(emblemItem, emblemFam.grade), emblemFam,
    function (v) { emblemFam.level = v; persist(); renderSpecTable(); },
    function (g) { emblemFam.grade = g; emblemFam.level = 0; persist(); renderGearGrid(); renderSpecTable(); }
  ));
  // 철벽/투지는 100단계(=100번째 강화 성공)부터 성공당 실제 단계 번호가 2씩 오릅니다(150번째
  // 성공 = 200단계). 배지 내부값(fam.level)은 계산용 성공 횟수(0~150)를 그대로 쓰고, 배지에
  // 보이는 라벨만 실제 단계 번호로 변환합니다(사용자 확인, 2026-07-31).
  ["emblemDeco1", "emblemDeco2", "emblemDeco3", "emblemDeco4", "emblemDeco5"].forEach(function (id) {
    const item = familyItem(id), fam = state.family[id];
    const labelFn = (id === "emblemDeco4" || id === "emblemDeco5") ? emblemDecoRealLevel : undefined;
    side.appendChild(levelOnlyTile(item.name, item.maxLevel, fam.level, function (fam) {
      return function (v) { fam.level = v; persist(); renderSpecTable(); };
    }(fam), labelFn));
  });
  side.appendChild(gradeStepTile("고리", RING_GRADE_ORDER, state.ring,
    function (g) { state.ring.grade = g; state.ring.step = 0; persist(); renderGearGrid(); renderSpecTable(); },
    function (s) { state.ring.step = s; persist(); renderSpecTable(); },
    function (g) { return RING_QTY_PER_STEP[g].length; }
  ));

  // 오른쪽 2열: 주무기·보조무기 / 투구·갑옷 / 장갑·신발 / 반지·목걸이 / 허리띠·귀걸이 / 토템·팔찌
  PARTS.forEach(function (part) {
    const rec = state.status[part.id];
    main.appendChild(gradeStepTile(part.name, GRADE_ORDER, rec,
      function (rec) { return function (g) { rec.grade = g; rec.awakened = false; persist(); renderGearGrid(); renderSpecTable(); }; }(rec),
      function (rec) { return function (s) { rec.step = s; persist(); renderSpecTable(); }; }(rec),
      function () { return 10; }
    ));
  });

  ["ring1", "necklace", "belt", "earring"].forEach(function (id) {
    const item = familyItem(id), fam = state.family[id];
    main.appendChild(levelWithGradeTile(item.name, familyGradeOptions(item), familyMaxLevel(item, fam.grade), fam,
      function (fam) { return function (v) { fam.level = v; persist(); renderSpecTable(); }; }(fam),
      function (item, fam) { return function (g) {
        fam.grade = g; fam.level = 0;
        if (fam.awakened !== undefined) fam.awakened = false;
        if (item.materialByGrade && item.materialByGrade[g]) fam.material = item.materialByGrade[g];
        persist(); renderGearGrid(); renderSpecTable();
      }; }(item, fam)
    ));
  });

  const totemItem = familyItem("totem"), totemFam = state.family["totem"];
  main.appendChild(levelWithGradeTile("토템", familyGradeOptions(totemItem), familyMaxLevel(totemItem, totemFam.grade), totemFam,
    function (v) { totemFam.level = v; persist(); renderSpecTable(); },
    function (g) {
      totemFam.grade = g; totemFam.level = 0;
      if (totemItem.materialByGrade && totemItem.materialByGrade[g]) totemFam.material = totemItem.materialByGrade[g];
      persist(); renderGearGrid(); renderSpecTable();
    }
  ));
  const braceletItem = familyItem("bracelet"), braceletFam = state.family["bracelet"];
  main.appendChild(levelWithGradeTile("팔찌", familyGradeOptions(braceletItem), familyMaxLevel(braceletItem, braceletFam.grade), braceletFam,
    function (v) { braceletFam.level = v; persist(); renderSpecTable(); },
    function (g) {
      braceletFam.grade = g; braceletFam.level = 0;
      if (braceletFam.awakened !== undefined) braceletFam.awakened = false;
      if (braceletItem.materialByGrade && braceletItem.materialByGrade[g]) braceletFam.material = braceletItem.materialByGrade[g];
      persist(); renderGearGrid(); renderSpecTable();
    }
  ));
  // 균열의 토템 — 등급 구분이 없는 별도 항목이라 토템 바로 아래에 레벨만 입력하는 타일로 둡니다.
  const riftTotemItem = familyItem("riftTotem"), riftTotemFam = state.family["riftTotem"];
  main.appendChild(levelOnlyTile(riftTotemItem.name, riftTotemItem.maxLevel, riftTotemFam.level, function (v) {
    riftTotemFam.level = v; persist(); renderSpecTable();
  }));

  // 마지막 줄 3개: 조화의 연금석, 유물1, 유물2. 유물1/2는 공허 등급 전용 "계열돌파"(마력각인)
  // 단계도 함께 관리해 바로 아래에 타일을 추가합니다(다른 항목처럼 현재 상태는 ①에서 관리).
  ["alchemy", "relic1", "relic2"].forEach(function (id) {
    const item = familyItem(id), fam = state.family[id];
    triple.appendChild(levelWithGradeTile(item.name, familyGradeOptions(item), familyMaxLevel(item, fam.grade), fam,
      function (fam) { return function (v) { fam.level = v; persist(); renderSpecTable(); }; }(fam),
      function (item, fam) { return function (g) {
        fam.grade = g; fam.level = 0;
        if (item.materialByGrade && item.materialByGrade[g]) fam.material = item.materialByGrade[g];
        persist(); renderGearGrid(); renderSpecTable();
      }; }(item, fam)
    ));
    if (item.hasSeries) {
      triple.appendChild(stepOnlyTile(item.name + " 계열돌파", ANCIENT_ANVIL.relicSeries.length, { step: fam.seriesLevel },
        function (fam) { return function (v) { fam.seriesLevel = v; persist(); renderSpecTable(); }; }(fam)
      ));
    }
  });

  // 문양 각인서 — 유물 아래에 등급 하나만 골라 현재 보유 중인 실제 감정 결과(공격력/방어력)를
  // 직접 고르는 항목. 스펙업 액션(다음 등급 교체 구매)은 ②탭에서 계산합니다.
  const insigniaItem = familyItem("insigniaBook"), insigniaFam = state.family["insigniaBook"];
  triple.appendChild(dualStatWithGradeTile(insigniaItem.name, familyGradeOptions(insigniaItem), insigniaFam, insigniaItem.statRangeByGrade,
    function (v) { insigniaFam.atkGain = v; persist(); renderSpecTable(); },
    function (v) { insigniaFam.defGain = v; persist(); renderSpecTable(); },
    function (g) {
      insigniaFam.grade = g;
      insigniaFam.atkGain = INSIGNIA_BOOK_MEDIAN_STAT[g].atk;
      insigniaFam.defGain = INSIGNIA_BOOK_MEDIAN_STAT[g].def;
      if (insigniaItem.materialByGrade && insigniaItem.materialByGrade[g]) insigniaFam.material = insigniaItem.materialByGrade[g];
      persist(); renderGearGrid(); renderSpecTable();
    }
  ));
}

export function renderGearExtra() {
  const wrap = document.getElementById("gearExtra");
  wrap.innerHTML = "";
  ["sylvia", "balance", "lightstone"].forEach(function (id) {
    const item = familyItem(id), fam = state.family[id];
    wrap.appendChild(levelOnlyTile(item.name, item.maxLevel, fam.level, function (fam) {
      return function (v) { fam.level = v; persist(); renderSpecTable(); };
    }(fam)));
  });
}
