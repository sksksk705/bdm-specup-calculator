// 프레젠테이션 계층 — ④ 탭 "전투력 참고표". 조회 전용(수정 불가) — state에 의존하지 않고
// gameData.js의 상수를 그대로 표로 보여줍니다. boot() 시 한 번만 렌더링합니다.

import {
  PARTS, GRADE_ORDER, EQUIP_CP_TABLE, EQUIP_AWAKEN,
  ACCESSORY_CP_TABLE, ACCESSORY_AWAKEN,
  RELIC_CP_TABLE, RELIC_SERIES_CP_GAIN,
  LIGHTSTONE_CP_TABLE, EMBLEM_CP_TABLE, TOTEM_CP_TABLE,
  RING_GRADE_ORDER, RING_STAT_AT_STEP,
  INSIGNIA_BOOK_ATK_RANGE, INSIGNIA_BOOK_DEF_RANGE, INSIGNIA_BOOK_MEDIAN_STAT, KARAZAD_BASE_STAT,
  FAMILY_ITEMS
} from "../data/gameData.js";
import { fmt, familyCpGainArray } from "../logic/calculations.js";

function familyItem(id) { return FAMILY_ITEMS.filter(function (x) { return x.id === id; })[0]; }
function familyName(id) { const item = familyItem(id); return item ? item.name : id; }

function el(tag, opts) {
  const node = document.createElement(tag);
  if (opts) {
    if (opts.className) node.className = opts.className;
    if (opts.text !== undefined) node.textContent = opts.text;
    if (opts.style) node.style.cssText = opts.style;
  }
  return node;
}

function subHeading(text) {
  return el("h3", { text: text, style: "font-size:12.5px;font-weight:700;margin:16px 0 6px;color:var(--text-dim);" });
}

// rows/columns: [{label, key}], cellValue(row, col) => number|string|null
function buildTable(rowHeaderLabel, columns, rows, cellValue) {
  const wrap = el("div", { className: "table-wrap" });
  if (rows.length > 22) wrap.style.cssText = "max-height:420px;overflow-y:auto;";
  const table = el("table");
  const thead = el("thead");
  const headRow = el("tr");
  headRow.appendChild(el("th", { text: rowHeaderLabel }));
  columns.forEach(function (c) { headRow.appendChild(el("th", { className: "num", text: c.label })); });
  thead.appendChild(headRow);
  table.appendChild(thead);
  const tbody = el("tbody");
  rows.forEach(function (r) {
    const tr = el("tr");
    tr.appendChild(el("td", { className: "name", text: r.label }));
    columns.forEach(function (c) {
      const v = cellValue(r, c);
      const td = el("td", { className: "num" });
      td.textContent = (v === null || v === undefined) ? "–" : (typeof v === "number" ? fmt(v) : v);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  return wrap;
}

function stepRows(n) {
  const rows = [];
  for (let i = 0; i < n; i++) rows.push({ label: i + "강→" + (i + 1) + "강", step: i });
  return rows;
}

function buildCard(title, desc) {
  const card = el("div", { className: "card" });
  card.appendChild(el("h2", { text: title }));
  if (desc) card.appendChild(el("div", { className: "desc", text: desc }));
  return card;
}

function buildNote(html) {
  const note = el("div", { className: "note" });
  note.innerHTML = html;
  return note;
}

function renderEquipSection(root) {
  const card = buildCard("장비 6부위 — 잠재력 돌파",
    "주무기·보조무기·갑옷·투구·장갑·신발의 0강→10강 단계별 전투력 증가치입니다(혼돈·공허 등급만 — 검은별은 전투력 상승이 없는 사이드그레이드라 제외, 태고 이하는 원자료 미공개).");
  const columns = PARTS.map(function (p) { return { label: p.name, key: p.id }; });
  GRADE_ORDER.forEach(function (grade) {
    card.appendChild(subHeading(grade + " 등급"));
    card.appendChild(buildTable("단계", columns, stepRows(10), function (r, c) {
      return EQUIP_CP_TABLE[grade][c.key][r.step];
    }));
  });
  card.appendChild(subHeading("각성 (1회성, 등급별)"));
  const awakenCols = GRADE_ORDER.map(function (g) { return { label: g, key: g }; });
  const awakenRows = PARTS.map(function (p) { return { label: p.name, key: p.id }; });
  card.appendChild(buildTable("부위", awakenCols, awakenRows, function (r, c) {
    return EQUIP_AWAKEN[c.key][r.key].cpGain;
  }));
  root.appendChild(card);
}

function renderAccessorySection(root) {
  const card = buildCard("장신구(반지·목걸이·허리띠·귀걸이·팔찌) — 잠재력 돌파",
    "등급별 0강→10강 단계별 전투력 증가치입니다. 태고·혼돈 등급은 원자료 표가 동일해 같은 값을 씁니다.");
  const itemKeys = ["ring1", "necklace", "belt", "earring", "bracelet"];
  const columns = itemKeys.map(function (k) { return { label: familyName(k), key: k }; });
  ["태고", "혼돈", "공허"].forEach(function (grade) {
    card.appendChild(subHeading(grade + " 등급"));
    card.appendChild(buildTable("단계", columns, stepRows(10), function (r, c) {
      return ACCESSORY_CP_TABLE[grade][c.key][r.step];
    }));
  });
  card.appendChild(buildNote("<b>카라자드(신성) 등급</b>은 잠재력 돌파 단계별 전투력 증가치가 아직 공개되지 않아 계산기에서 직접 입력을 받습니다 — 이 표에도 실을 데이터가 없습니다."));
  card.appendChild(subHeading("각성 (1회성, 등급별)"));
  const awakenCols = ["태고", "혼돈", "공허"].map(function (g) { return { label: g, key: g }; });
  const awakenRows = itemKeys.map(function (k) { return { label: familyName(k), key: k }; });
  card.appendChild(buildTable("부위", awakenCols, awakenRows, function (r, c) {
    return ACCESSORY_AWAKEN[c.key][r.key].cpGain;
  }));
  root.appendChild(card);
}

function renderKarazadSection(root) {
  const card = buildCard("카라자드(신성) 장신구",
    "공허 +9/+10단계 각성 완료 장신구로 제작하는 최상위 등급입니다. 제작 직후 시작 단계(+2/+4단계)와 그 안에서의 잠재력 돌파(0→1강~9→10강) 모두 전투력 증가치가 아직 공개되지 않아 계산기에서 직접 입력을 받습니다 — 이 표에도 실을 데이터가 없습니다.");
  card.appendChild(buildNote("참고로 <b>+0단계(잠재력 돌파 전) 기본 능력치</b>만 공개돼 있습니다 — 전투력 증가분이 아니라 절대 공격력·방어력 수치입니다:"));
  const rows = ["ring1", "necklace", "belt", "earring", "bracelet"].map(function (k) { return { label: familyName(k), key: k }; });
  card.appendChild(buildTable("부위", [{ label: "공격력", key: "atk" }, { label: "방어력", key: "def" }], rows, function (r, c) {
    return KARAZAD_BASE_STAT[r.key][c.key];
  }));
  root.appendChild(card);
}

function renderRelicSection(root) {
  const card = buildCard("유물(유물1·유물2) — 잠재력 돌파",
    "등급(태고/혼돈/공허) 무관하게 동일한 수치입니다(원자료에 명시). 유물1·유물2도 같은 표를 씁니다.");
  card.appendChild(buildTable("단계", [{ label: "전투력 증가", key: "v" }], stepRows(10), function (r) {
    return RELIC_CP_TABLE["태고"][r.step];
  }));
  card.appendChild(subHeading("공허 유물 계열 돌파 (마력각인, 0~19단계)"));
  card.appendChild(buildTable("단계", [{ label: "전투력 증가", key: "v" }], stepRows(20), function (r) {
    return RELIC_SERIES_CP_GAIN[r.step];
  }));
  root.appendChild(card);
}

function renderLightstoneSection(root) {
  const card = buildCard("광원석 — 잠재력 돌파", "태고·혼돈 등급의 0강→20강 단계별 전투력 증가치입니다(공격력=방어력 2배 근사).");
  const columns = [{ label: "태고", key: "태고" }, { label: "혼돈", key: "혼돈" }];
  card.appendChild(buildTable("단계", columns, stepRows(20), function (r, c) {
    return LIGHTSTONE_CP_TABLE[c.key][r.step];
  }));
  root.appendChild(card);
}

function renderAlchemySection(root) {
  const card = buildCard("조화의 연금석 — 잠재력 돌파",
    "단계별 실수치 표는 공개되지 않았습니다. 공식 문서에는 공허 등급이 매 단계 고정 전투력 +10(공격력+5·방어력+5)이라고만 명시돼 있고, 혼돈 등급은 수치 정보가 없어 계산기에서 직접 입력을 받습니다.");
  card.appendChild(buildTable("등급", [{ label: "전투력(단계당, 고정)", key: "v" }],
    [{ label: "혼돈", key: "혼돈" }, { label: "공허", key: "공허" }],
    function (r) { return r.key === "공허" ? 10 : null; }));
  root.appendChild(card);
}

function renderEmblemSection(root) {
  const card = buildCard("휘장 — 잠재력 돌파",
    "태고 등급은 30단계, 혼돈·공허 등급은 50단계까지 원자료가 공개돼 있습니다(그 이상은 미공개). 공격력=방어력 동일 수치라 2배 근사했습니다.");
  const columns = [{ label: "태고", key: "태고" }, { label: "혼돈", key: "혼돈" }, { label: "공허", key: "공허" }];
  card.appendChild(buildTable("단계", columns, stepRows(50), function (r, c) {
    const arr = EMBLEM_CP_TABLE[c.key];
    return r.step < arr.length ? arr[r.step] : null;
  }));
  root.appendChild(card);
}

function renderEmblemDecoSection(root) {
  const card = buildCard("휘장 장식(용맹·침착·격렬·철벽·투지)",
    "단계가 오른 만큼 그대로 공격력(용맹·격렬·투지) 또는 방어력(침착·철벽)이 오릅니다(1단계당 1). 철벽·투지는 100단계 이후 성공당 단계가 2씩 올라(150성공째 200단계) 그만큼도 2씩 오릅니다.");
  const decoIds = ["emblemDeco1", "emblemDeco2", "emblemDeco3", "emblemDeco4", "emblemDeco5"];
  const decoItems = decoIds.map(familyItem);
  const columns = decoItems.map(function (item) { return { label: item.name.replace("휘장 장식", "").replace(/[()]/g, ""), key: item.id }; });
  card.appendChild(buildTable("단계", columns, stepRows(150), function (r, c) {
    const item = familyItem(c.key);
    return familyCpGainArray(item, "태고")[r.step];
  }));
  root.appendChild(card);
}

function renderTotemSection(root) {
  const card = buildCard("토템(균열의 토템) — 잠재력 돌파",
    "등급별 최대 단계가 다릅니다(태고 40·혼돈 20·공허 40). 공격력=방어력 동일 수치라 2배 근사했고, 혼돈 등급부터 함께 오르는 생명력 증가분은 단위가 너무 달라(40~50배) 제외했습니다 — 그만큼 실제 효율은 표시된 값보다 좋습니다.");
  const columns = [{ label: "태고", key: "태고" }, { label: "혼돈", key: "혼돈" }, { label: "공허", key: "공허" }];
  card.appendChild(buildTable("단계", columns, stepRows(40), function (r, c) {
    const arr = TOTEM_CP_TABLE[c.key];
    return r.step < arr.length ? arr[r.step] : null;
  }));
  root.appendChild(card);
}

function renderRingSection(root) {
  const card = buildCard("전승의 고리 — 각성 단계별 전투력",
    "심연→태고→혼돈→공허 순으로 등급업하며, 각 등급 안에서 단계가 오를 때마다 전투력이 오릅니다(공격력·방어력 동일 적용 근사).");
  const columns = RING_GRADE_ORDER.map(function (g) { return { label: g, key: g }; });
  const maxSteps = Math.max.apply(null, RING_GRADE_ORDER.map(function (g) { return RING_STAT_AT_STEP[g].length - 1; }));
  card.appendChild(buildTable("단계", columns, stepRows(maxSteps), function (r, c) {
    const table = RING_STAT_AT_STEP[c.key];
    if (r.step + 1 >= table.length) return null;
    return table[r.step + 1] - table[r.step];
  }));
  root.appendChild(card);
}

const INSIGNIA_GRADE_ORDER = ["심연", "태고", "혼돈"];

function renderInsigniaSection(root) {
  const card = buildCard("문양 각인서",
    "①탭에서 현재 보유 중인 등급의 실제 감정 결과(공격력/방어력)를 직접 고릅니다. 감정 결과는 공격력·방어력이 등급별 구간 내에서 함께(그룹으로 짝지어) 무작위로 정해집니다. ②탭 스펙업 액션은 \"다음 등급 책으로 교체 구매\"이고, 전투력 상승량은 다음 등급 중앙값(공격력+방어력)에서 현재 보유 값을 뺀 값입니다 — 혼돈은 다음 등급이 없어 표시하지 않습니다.");
  card.appendChild(buildTable("등급",
    [{ label: "공격력 하한", key: "atkMin" }, { label: "공격력 상한", key: "atkMax" },
      { label: "방어력 하한", key: "defMin" }, { label: "방어력 상한", key: "defMax" },
      { label: "다음 등급 중앙값 기대 상승량", key: "delta" }],
    [{ label: "심연", key: "심연" }, { label: "태고", key: "태고" }, { label: "혼돈", key: "혼돈" }],
    function (r, c) {
      if (c.key === "delta") {
        const next = INSIGNIA_GRADE_ORDER[INSIGNIA_GRADE_ORDER.indexOf(r.key) + 1];
        if (!next) return null;
        const cur = INSIGNIA_BOOK_MEDIAN_STAT[r.key], tgt = INSIGNIA_BOOK_MEDIAN_STAT[next];
        return (tgt.atk + tgt.def) - (cur.atk + cur.def);
      }
      const range = c.key.indexOf("atk") === 0 ? INSIGNIA_BOOK_ATK_RANGE[r.key] : INSIGNIA_BOOK_DEF_RANGE[r.key];
      return range[c.key.indexOf("Min") !== -1 ? 0 : 1];
    }));
  root.appendChild(card);
}

function renderFlatRateSection(root) {
  const card = buildCard("균형의 돌 · 실비아 여신상",
    "레벨당 상승분이 전 구간 고정된 항목입니다 — 단계별 표 대신 고정 비율만 안내합니다.");
  card.appendChild(buildTable("항목", [{ label: "레벨당 전투력", key: "cp" }, { label: "최대 레벨", key: "max" }],
    [{ label: "실비아 여신상", key: "sylvia" }, { label: "균형의 돌", key: "balance" }],
    function (r, c) {
      const item = familyItem(r.key);
      return c.key === "cp" ? item.cpPerLevel : item.maxLevel;
    }));
  root.appendChild(card);
}

export function renderReferenceTab() {
  const root = document.getElementById("referenceTabRoot");
  if (!root) return;
  root.innerHTML = "";
  renderEquipSection(root);
  renderAccessorySection(root);
  renderKarazadSection(root);
  renderRelicSection(root);
  renderLightstoneSection(root);
  renderAlchemySection(root);
  renderEmblemSection(root);
  renderEmblemDecoSection(root);
  renderTotemSection(root);
  renderRingSection(root);
  renderInsigniaSection(root);
  renderFlatRateSection(root);
}
