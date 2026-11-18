import {
  GRADE_ORDER, EQUIP_BREAKTHROUGH_CURVE, EQUIP_CP_TABLE, KARAZAD_BASE_STAT,
  KARAZAD_BREAKTHROUGH_CURVE, RING_GRADE_ORDER, RING_QTY_PER_STEP, RING_STAT_AT_STEP,
  RELIC_BREAKTHROUGH_CURVE, RELIC_SERIES_BREAKTHROUGH_CURVE, RELIC_SERIES_CP_GAIN,
  SOUL_CP_GAIN, SOUL_MAX_STEP, SOUL_SUCCESS_RATE, INSIGNIA_BOOK_MEDIAN_STAT, INSIGNIA_BOOK_VOID_STAT_VALUES
} from "../data/gameData.js";
import { ITEM_SLOT_LAYOUT, ITEM_VISUALS } from "../data/itemPresentation.js";
import { state, persist } from "../data/userState.js";
import { emblemDecoRealLevel, familyCpGainArray, familyGradeOptions, familyItem, familyMaxLevel, fmt } from "../logic/calculations.js";
import { t } from "../i18n.js";
import { renderSpecTable } from "./specTable.js";

const imageRoot = new URL("../../asset/items/", import.meta.url);
const rateSource = "https://www.blackdesertm.com/Ocean/Wiki?wikiNo=1001004";
const relicForSeries = { relicSeries1: "relic1", relicSeries2: "relic2" };
let activeItem = ITEM_SLOT_LAYOUT.itemEquipment[0];

function itemState(id) {
  const equipment = state.status[id];
  if (equipment) {
    return {
      record: equipment, key: "step", grades: GRADE_ORDER, max: EQUIP_BREAKTHROUGH_CURVE.length,
      gain: EQUIP_CP_TABLE[equipment.grade][id][equipment.step], gainLabel: "포럼 실측 기반",
      rate: EQUIP_BREAKTHROUGH_CURVE[equipment.step], rateLabel: "계산기 기본 확률"
    };
  }

  if (id === "heritageRing") {
    const { grade, step } = state.ring;
    const stats = RING_STAT_AT_STEP[grade];
    return {
      record: state.ring, key: "step", grades: RING_GRADE_ORDER, max: RING_QTY_PER_STEP[grade].length,
      gain: step + 1 < stats.length ? stats[step + 1] - stats[step] : undefined
    };
  }

  const soul = state.souls[id];
  if (soul) {
    return {
      record: soul, key: "step", max: SOUL_MAX_STEP, gain: SOUL_CP_GAIN[id][soul.step],
      rate: SOUL_SUCCESS_RATE * 100, rateLabel: "공식 가이드 기본 확률"
    };
  }

  const relicId = relicForSeries[id];
  if (relicId) {
    const relic = state.family[relicId];
    return {
      record: relic, key: "seriesLevel", grade: "공허", max: RELIC_SERIES_CP_GAIN.length,
      gain: RELIC_SERIES_CP_GAIN[relic.seriesLevel], rate: RELIC_SERIES_BREAKTHROUGH_CURVE[relic.seriesLevel],
      rateSource, locked: relic.grade !== "공허"
    };
  }

  const item = familyItem(id);
  const record = state.family[id];
  const { grade, level } = record;
  const baseStat = grade === "카라자드" ? KARAZAD_BASE_STAT[id] : undefined;
  const relicRate = item.hasSeries && grade !== "공허" ? RELIC_BREAKTHROUGH_CURVE[level] : undefined;
  return {
    record, family: item, key: "level", grades: Object.keys(ITEM_VISUALS[id].grades).length > 1 ? familyGradeOptions(item) : [],
    max: familyMaxLevel(item, grade),
    gain: familyCpGainArray(item, grade)?.[level] ?? (item.cpEditable === false ? item.cpPerLevel : undefined),
    labelLevel: id === "emblemDeco4" || id === "emblemDeco5" ? emblemDecoRealLevel : undefined,
    isFamilyLevel: id === "sylvia" || id === "balance",
    range: item.statRangeByGrade, baseStat, rate: baseStat ? KARAZAD_BREAKTHROUGH_CURVE[level] : relicRate, rateSource
  };
}

function displayStep(view, step) {
  const value = view.labelLevel ? view.labelLevel(step) : step;
  return (view.isFamilyLevel ? "Lv. " : "+") + fmt(value);
}

function element(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
}

function image(file, alt = "") {
  const img = element("img");
  img.src = new URL(file, imageRoot).href;
  img.alt = alt;
  img.decoding = "async";
  return img;
}

function setGrade(id, view, grade) {
  const { record, family } = view;
  record.grade = grade;
  if (id === "heritageRing" || family && !view.range) record[view.key] = 0;
  if (view.range) {
    const stats = INSIGNIA_BOOK_MEDIAN_STAT[grade];
    record.atkGain = stats.atk;
    record.defGain = stats.def;
  }
  if (record.awakened !== undefined) record.awakened = false;
  if (family?.materialByGrade?.[grade]) record.material = family.materialByGrade[grade];
}

function selectField(id, label, values, current, onChange, format = value => t(String(value))) {
  const field = element("label", "item-field", t(label));
  const select = element("select");
  select.id = id;
  values.forEach(value => select.add(new Option(format(value), value, false, value === current)));
  select.addEventListener("change", () => {
    onChange(select.value);
    persist();
    renderGearGrid();
    renderSpecTable();
    document.getElementById(id)?.focus({ preventScroll: true });
  });
  field.append(select);
  return field;
}

function readVisual(id, view) {
  const item = ITEM_VISUALS[id];
  const grade = view.grade ?? (view.grades?.length ? view.record.grade : "기본");
  return { item, grade, pictures: item.grades[grade] };
}

function selectItem(button) {
  const previous = document.querySelector(".item-choice[aria-pressed=true]");
  previous?.setAttribute("aria-pressed", "false");
  activeItem = button.dataset.item;
  button.setAttribute("aria-pressed", "true");
  buildDetail();

  const detail = document.getElementById("itemDetail");
  if (matchMedia("(max-width: 820px)").matches) {
    detail.focus({ preventScroll: true });
    detail.scrollIntoView({ block: "start" });
  } else {
    detail.scrollIntoView({ block: "nearest" });
  }
}

function buildSlot(id) {
  const view = itemState(id);
  const { item, grade, pictures } = readVisual(id, view);
  const button = element("button", "item-choice");
  button.type = "button";
  button.dataset.item = id;
  button.dataset.itemGrade = grade;
  button.setAttribute("aria-pressed", String(id === activeItem));
  button.setAttribute("aria-controls", "itemDetail");

  const frame = element("span", "item-slot-icon");
  frame.append(image(pictures.art ?? pictures.icon));
  const caption = element("span", "item-caption");
  caption.append(element("strong", "", t(item.name)));
  if (grade !== "기본") caption.append(element("small", "item-slot-grade", t(grade)));

  if (view.range) {
    const atk = fmt(view.record.atkGain);
    const def = fmt(view.record.defGain);
    const stats = element("small", "item-slot-stats", atk + " / " + def);
    stats.title = t("공격력 {atk} · 방어력 {def}").replace("{atk}", atk).replace("{def}", def);
    caption.append(stats);
  } else {
    const step = displayStep(view, Math.min(view.record[view.key], view.max));
    frame.append(element("span", "item-slot-step", step));
  }
  button.append(frame, caption);
  button.addEventListener("click", () => selectItem(button));
  return button;
}

function buildSlots() {
  for (const [containerId, ids] of Object.entries(ITEM_SLOT_LAYOUT)) {
    document.getElementById(containerId).replaceChildren(...ids.map(buildSlot));
  }
}

function buildControls(id, view) {
  const { grades, record, range, max, key } = view;
  const fields = element("div", "item-fields");
  if (grades?.length) {
    fields.append(selectField("itemGrade", "아이템 등급", grades, record.grade, grade => setGrade(id, view, grade)));
  }
  if (range && record.grade === "공허") {
    fields.append(selectField("itemGlyphStat", "공격력·방어력", INSIGNIA_BOOK_VOID_STAT_VALUES, record.atkGain, value => {
      record.atkGain = Number(value);
      record.defGain = Number(value);
    }));
  } else if (range) {
    for (const [stat, key, label] of [["atk", "atkGain", "공격력"], ["def", "defGain", "방어력"]]) {
      const [min, max] = range[stat][record.grade];
      const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
      fields.append(selectField("item" + key, label, values, record[key], value => { record[key] = Number(value); }));
    }
  } else {
    const values = Array.from({ length: max + 1 }, (_, i) => i);
    fields.append(selectField("itemStep", "현재 강화 단계", values, Math.min(record[key], max), value => {
      record[key] = Number(value);
    }, value => displayStep(view, value)));
  }
  if (record.awakened !== undefined && !view.grade) {
    const label = element("label", "item-awakened");
    const check = element("input");
    check.type = "checkbox";
    check.checked = record.awakened;
    check.addEventListener("change", () => {
      record.awakened = check.checked;
      persist();
      renderSpecTable();
    });
    label.append(check, t("각성완료"));
    fields.append(label);
  }
  return fields;
}

function buildMetrics(view) {
  const metrics = element("dl", "item-metrics");
  function add(label, value, note) {
    const card = element("div", "item-metric");
    card.append(element("dt", "", t(label)), element("dd", "", value));
    if (note) card.append(element("dd", "item-metric-note", t(note)));
    metrics.append(card);
  }
  if (view.range) {
    add("공격력 범위", view.range.atk[view.record.grade].join("–"));
    add("방어력 범위", view.range.def[view.record.grade].join("–"));
    return metrics;
  }

  const level = view.record[view.key];
  const maxed = level >= view.max;
  add("다음 강화", maxed ? t("최대 단계") : displayStep(view, level + 1));
  if (view.baseStat) {
    const { atk, def } = view.baseStat;
    add("기본 능력치", "+" + fmt(atk + def), atk ? "공격력" : "방어력");
  } else {
    const gain = view.gain == null ? t("자료 확인 중") : "+" + fmt(view.gain);
    add("전투력 증가량", maxed ? "—" : gain, maxed ? undefined : view.gainLabel);
  }
  if (!maxed && view.rate != null) add("기본 성공 확률", view.rate.toLocaleString("ko-KR") + "%", view.rateLabel ?? "공식 확률 안내");
  else add("강화 상한", displayStep(view, view.max));
  return metrics;
}

function sourceLink(label, url) {
  const link = element("a", "", t(label));
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  return link;
}

function buildDetail() {
  const detail = document.getElementById("itemDetail");
  const view = itemState(activeItem);
  const { item, grade, pictures } = readVisual(activeItem, view);
  const name = t(pictures.name ?? item.name);
  detail.dataset.itemGrade = grade;

  const header = element("div", "item-showcase");
  const art = element("div", pictures.art ? "item-art" : "item-art item-art-fallback");
  art.append(image(pictures.art ?? pictures.icon, name));
  const caption = element("div", "item-heading");
  const imageLabel = pictures.art ? "공식 아이템 이미지" : "아이템 이미지 미확인 · 공식 슬롯 아이콘";
  const title = element("h3", "", name);
  title.id = "itemDetailTitle";
  caption.append(
    element("p", "item-grade", t(grade === "기본" ? "가문 · 특수" : grade)),
    title,
    element("p", "item-image-label", t(imageLabel))
  );
  header.append(art, caption);

  const body = element("div", "item-detail-body");
  body.append(buildControls(activeItem, view), buildMetrics(view));
  if (item.note) body.append(element("p", "item-detail-note", t(item.note)));
  if (view.locked) body.append(element("p", "item-detail-note", t("공허 등급 유물에 적용됩니다.")));

  const sources = element("div", "item-sources");
  sources.append(sourceLink("이미지 출처", pictures.source));
  if (pictures.imageSource) sources.append(sourceLink("원본 보기", pictures.imageSource));
  if (pictures.statsSource) sources.append(sourceLink("강화 수치 출처", pictures.statsSource));
  if (view.rate != null && view.rateSource && view.record[view.key] < view.max) {
    sources.append(sourceLink("성공 확률 출처", view.rateSource));
  }
  body.append(sources);

  const back = element("button", "btn ghost item-back", t("아이템 목록으로"));
  back.type = "button";
  back.addEventListener("click", () => document.querySelector(".item-choice[aria-pressed=true]").focus());
  body.append(back);
  detail.replaceChildren(header, body);
}

export function renderGearGrid() {
  buildSlots();
  buildDetail();
}
