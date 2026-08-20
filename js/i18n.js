// 프레젠테이션 계층 — 언어 전환(ko/en). 계산 로직과 state의 내부 값(등급명 등)은 전부 한국어
// 그대로 두고, 화면에 그리는 시점에만 번역합니다 — 한국어 원문 문자열 자체를 사전의 키로 씁니다.
// static 문구는 정확 일치(EXACT)로 옮기고, ②⑤탭처럼 로직 계층에서 조합해 만드는 문장은
// t()가 사전에 없으면 등록된 단어/구 중 가장 긴 것부터 부분 치환합니다(생성 라벨 대응 —
// 완벽한 자연스러운 문장은 아니지만 용어는 정확하게 옮겨집니다). 재료 개별 설명(재료 시세
// "비고" 칸)과 ④탭·하단 각주의 긴 설명문은 이번 1차 작업 범위에서 빠졌습니다(별도 후속 작업).

import { track } from "./analytics.js";

const STORAGE_KEY = "bdm_lang";
export const state = { lang: "ko" };

// 숫자에 붙는 접미사(강/단계/개/회/은화)는 사전 단어 치환보다 먼저 정규식으로 처리합니다 —
// "6강" 같은 문자열은 숫자와 접미사 순서를 그대로 두고 접미사만 바꿔야 자연스럽습니다.
// 한글 음절은 정규식에서 \w(단어 문자)로 취급되지 않아 \b(단어 경계)가 한글 뒤에서는
// 문자열 끝이나 구두점 앞일 때 매치되지 않습니다(둘 다 "비단어"로 취급돼 경계가 안 생김) —
// 그래서 \b 대신 그냥 접미사 글자 자체까지만 매치합니다.
const SUFFIX_PATTERNS = [
  [/(\d[\d,]*)\s*강\)/g, "Lv.$1)"],
  [/(\d[\d,]*)\s*강/g, "Lv.$1"],
  [/(\d[\d,]*)\s*단계/g, "Lv.$1"],
  [/×\s*(\d[\d,]*)\s*개/g, "×$1"],
  [/(\d[\d,]*)\s*개/g, "$1 pcs"],
  [/(\d[\d,]*)\s*회/g, "$1 tries"],
  [/(\d[\d,]*)\s*은화/g, "$1 Silver"],
  [/(\d[\d,]*)\s*장\)/g, "$1)"],
  [/(\d[\d,]*)\s*장/g, "$1"]
];

// ── 정확 일치 사전: index.html의 data-i18n 문구 + 각 JS 파일의 고정 문자열 ──
const EXACT = {
  // index.html — 헤더/온보딩/추천 배너
  "샤카투 은화연구소 | 검은사막 모바일 스펙업 계산기": "Shakatu Silver Lab | Black Desert Mobile Spec-Up Calculator",
  "샤카투 은화연구소 | 검은사막 모바일 스펙업 계산기 — 내 은화로 전투력을 가장 저렴하게 올리는 방법":
    "Shakatu Silver Lab | Black Desert Mobile Spec-Up Calculator — The cheapest way to raise your CP with your Silver",
  "Black Desert Mobile · 샤카투 은화연구소": "Black Desert Mobile · Shakatu Silver Lab",
  "처음이신가요? 이렇게 쓰면 돼요": "First time here? Quick start guide",
  "① 현재 상태": "① Current Status", "② 스펙업 방식": "② Spec-Up Methods",
  "③ 강화 기대값 계산기": "③ Enhancement EV Calculator", "④ 전투력 참고표": "④ CP Reference",
  "⑤ 은화 예산 플래너": "⑤ Silver Budget Planner",
  "— 장비·장신구 등급/단계와 재료 시세를 인게임 화면과 같은 배치로 입력하세요.": "— Enter your gear/accessory grade & level and material prices, laid out just like the in-game screen.",
  "— 은화 1냥당 전투력이 가장 높은 순서로 자동 정렬된 표를 확인하세요.": "— Check the table, auto-sorted by combat power gained per Silver spent.",
  "— 장비 돌파·밤·달빛 영혼석처럼 확률이 얽힌 항목은 여기서 세부 설정 후 계산하세요.": "— For probability-based items like gear breakthrough or Night/Moonlight Soul Stones, configure the details and calculate here.",
  "— 항목별 등급·단계별 실수치를 조회만 할 수 있어요(수정 불가).": "— Look up the official per-grade, per-level values (read-only).",
  "— 보유 은화 또는 목표 전투력을 입력하면 어떤 순서로 스펙업해야 가장 저렴한지 시뮬레이션해줘요.": "— Enter your Silver on hand or a target combat power, and it simulates the cheapest order to spec up.",
  "가장 효율적인 다음 스펙업": "Most efficient next spec-up",
  "① 현재 상태를 입력하면 자동으로 계산됩니다": "Fill in ① Current Status and this is calculated automatically",
  "은화 / 전투력 1": "Silver / 1 CP",
  "전투력 증가량을 입력한 항목이 아직 없습니다": "No item has a CP gain entered yet",
  "«② 스펙업 방식» 표에서 전투력 증가 칸을 채워보세요.": "Fill in the CP gain column in the «② Spec-Up Methods» table.",
  "무료": "Free", "전투력 미입력": "No CP entered", "(더미)": "(dummy)",
  "은화 ": "Silver ", "전투력 +": "CP +", "은화": "Silver", "또는": "or",
  "재료 기대 소모량": "Expected material use", "실패당 은화(기본)": "Per failure — Silver (default)",
  "복구권(강제인 경우만)": "Recovery Tickets (only if forced)", "실패당": "Per failure:",
  // 탭바
  "① 현재 상태 ": "① Current Status ",
  // 패널 1
  "복구 기준 시세": "Recovery Reference Price",
  "유료 재화": "Premium Materials",
  "장비 & 장신구": "Gear & Accessories",
  "기타 가문 콘텐츠": "Other Family Content",
  "재료 시세 (은화 / 개당)": "Material Prices (Silver / each)",
  "돌파 복구권 1개 = 은화": "1 Breakthrough Recovery Ticket = Silver",
  "내 상태와 가까운 프리셋 선택(장비·장신구만 적용)": "Pick the preset closest to your status (gear & accessories only)",
  "직접 입력할래요": "I'll enter it myself",
  "프리셋 적용": "Apply Preset",
  "재료명 검색…": "Search materials…",
  "+ 재료 추가": "+ Add Material",
  "재료명": "Material", "분류": "Category", "단가 (은화)": "Price (Silver)", "비고": "Note",
  " 보유(프리미엄으로 조달 예정) — 끄면 이 재료가 필요한 스펙업 방식을 표에서 제외": " owned (planning to get via premium currency) — uncheck to exclude spec-ups needing this material",
  "삭제": "Delete", "사용자 추가": "Custom", "추가할 재료명을 입력하세요.": "Enter the material name to add.",
  // 패널 2
  "모든 스펙업 방식과 효율": "All Spec-Up Methods & Efficiency",
  "항목": "Item", "다음 액션": "Next Action", "소모 재료": "Materials Used", "회당 개수": "Qty / Attempt",
  "총 은화": "Total Silver", "전투력 증가": "CP Gain",
  "모든 항목이 최고 단계에 도달했습니다.": "Every item has reached its max level.",
  // 패널 3
  "밤·달빛 영혼석 — 0강부터 13강까지 필요 재료 기대 개수": "Night/Moonlight Soul Stone — Expected Materials from Lv.0 to Lv.13",
  "단계": "Level", "재료 기대 개수": "Expected Qty", "기대 개수": "Expected Qty",
  "밤의 영혼석 강화 재료": "Night Soul Stone Enhancement Material",
  "달빛 영혼석 강화 재료": "Moonlight Soul Stone Enhancement Material",
  "밤의 영혼석": "Night Soul Stone", "달빛 영혼석": "Moonlight Soul Stone",
  "장비 돌파 — 강화 기대값 계산기": "Gear Breakthrough — Enhancement EV Calculator",
  "계산할 강화 단계": "Enhancement Range to Calculate",
  "확률 상승권 사용 세팅": "Boost Scroll Usage Settings",
  "돌파 복구권 세팅": "Breakthrough Recovery Ticket Settings",
  "그림자 장비 사용 (7~8강·8~9강이 계산 범위에 포함될 때만 표시)": "Use Shadow Gear (shown only when Lv.7~8 / Lv.8~9 is in range)",
  "확률 상승권 10%": "Boost Scroll 10%", "확률 상승권 50%": "Boost Scroll 50%", "확률 상승권 100%": "Boost Scroll 100%",
  "돌파 복구권 사용": "Use Breakthrough Recovery Ticket",
  "⚠ 강화 단계 범위가 올바르지 않습니다(0~10강, 시작<끝).": "⚠ Invalid enhancement range (Lv.0~10, start < end).",
  "순도 높은 흑결정": "High-Purity Black Crystal", "고결한 흑결정(그림자 장비용)": "Pristine Black Crystal (for Shadow Gear)",
  "은화(복구 시 직접 소모)": "Silver (spent directly on recovery)",
  "확률 상승권(10%)": "Boost Scroll (10%)", "확률 상승권(50%)": "Boost Scroll (50%)", "확률 상승권(100%)": "Boost Scroll (100%)",
  "돌파 복구권": "Breakthrough Recovery Ticket",
  "칠흑같은 그림자 장비": "Onyx-like Shadow Gear", "피어나는 그림자 장비": "Blooming Shadow Gear",
  "강 ~": "~", "강": "",
  " 사용 (": " Use (", ", 100% 방어)": ", 100% Defended)",
  "구간이 올바르지 않습니다(1~10강, 시작≤끝).": "range is invalid (Lv.1~10, start ≤ end).",
  "구간과 ": " range and ", " 구간 사이는 빈 칸 없이 이어져야 합니다.": " range must connect with no gap between them.",
  "돌파 복구권 구간이 올바르지 않습니다(1~10강, 시작≤끝).": "Breakthrough Recovery Ticket range is invalid (Lv.1~10, start ≤ end).",
  "⚠ 강화 단계 범위가 올바르지 않습니다(0~10강, 시작<끝).": "⚠ Invalid enhancement range (Lv.0~10, start < end).",
  // 패널 4
  "전투력 참고표": "Combat Power Reference",
  // 패널 5
  "은화 ↔ 전투력 계산기": "Silver ↔ Combat Power Calculator",
  "보유 은화로 계산": "Calculate from Silver on hand",
  "목표 전투력으로 계산": "Calculate from target CP",
  "보유 은화": "Silver on hand", "목표 전투력": "Target CP",
  "계산하기": "Calculate",
  "총 소모 은화": "Total Silver Spent", "총 증가 전투력": "Total CP Gained",
  "남은 은화": "Silver Remaining", "목표 달성 여부": "Target Reached?",
  "달성": "Reached", "미달성": "Not Reached",
  "순서": "#", "액션": "Action", "소모 은화": "Silver Spent", "증가 전투력": "CP Gained",
  "입력한 은화로는 살 수 있는 스펙업이 없습니다 — 모든 항목이 최고 단계이거나 예산이 부족합니다.": "No spec-up is affordable with that Silver — everything is maxed or the budget is too small.",
  "먼저 보유 은화를 입력하세요.": "Enter your Silver on hand first.",
  "먼저 목표 전투력을 입력하세요.": "Enter a target CP first.",
  "이미 목표 전투력을 달성했거나, 살 수 있는 스펙업이 없습니다.": "You've already reached the target, or nothing is left to buy.",
  "이 계산기가 다루는 항목을 전부 최고 단계까지 올려도(아래 표) 목표 전투력에는 못 미칩니다 — 그 이상은 카라자드 제작·확률형 항목 등 이 계산기 범위 밖의 방법이 필요합니다.":
    "Even maxing out everything this calculator covers (see table) falls short of the target — going further needs methods outside this calculator's scope, like Karajad crafting or probability-based content.",

  // ── 재료 시세 표 카테고리 (data/prices.json의 cat) ──
  "잠재력 돌파": "Breakthrough", "가공 재료": "Processing Material", "등급업 재료": "Grade-Up Material",
  "가문 전투력": "Family CP", "장신구/기타": "Accessory/Other", "복구 재화": "Recovery Material", "문양 각인서": "Inscribed Glyph",

  // ── 등급 ──
  "심연": "Abyssal", "태고": "Primal", "혼돈": "Chaos", "공허": "Eternal", "카라자드": "Karajad", "기본": "Base",

  // ── 장비 부위 ──
  "주무기": "Main Weapon", "보조무기": "Sub Weapon", "갑옷": "Armor", "투구": "Helmet", "장갑": "Gloves", "신발": "Shoes",

  // ── 가문 콘텐츠 항목명 ──
  "반지": "Ring", "목걸이": "Necklace", "허리띠": "Belt", "귀걸이": "Earrings", "팔찌": "Bracelet",
  "균열의 토템": "Rift Totem", "토템": "Totem",
  "조화의 연금석": "Harmony Alchemy Stone",
  "유물1(강화용 동일품)": "Relic 1 (Enhancement Material)", "유물2(강화용 동일품)": "Relic 2 (Enhancement Material)",
  "유물1": "Relic 1", "유물2": "Relic 2",
  "전승의 고리": "Charm of Succession", "고리": "Charm", "실비아 여신상": "Sylvia Goddess Statue", "균형의 돌": "Stone of Balance",
  "광원석": "Lightstone",
  "휘장 장식(용맹)": "Emblem Decoration (Valor)", "휘장 장식(침착)": "Emblem Decoration (Composure)",
  "휘장 장식(격렬)": "Emblem Decoration (Ferocity)", "휘장 장식(철벽)": "Emblem Decoration (Fortitude)",
  "휘장 장식(투지)": "Emblem Decoration (Tenacity)", "휘장": "Emblem",
  "문양 각인서": "Inscribed Glyph",
  "유물1 계열돌파": "Relic 1 Series Breakthrough", "유물2 계열돌파": "Relic 2 Series Breakthrough",
  "공허 유물 계열 돌파(마력각인)": "Eternal Relic Series Breakthrough (Magic Engraving)",

  // ── 재료명 ──
  "아크라드": "Ah'krad", "혼돈의 축": "Chaos Jewel", "공허의 눈": "Voidsent Eye", "혼돈의 핵": "Chaos Nucleus",
  "홍익의 불꽃": "Flame of Hongik", "홍익의 불씨": "Ember of Hongik",
  "차원의 조각": "Dimensional Fragment", "균열의 열기": "Riftborn Fervor", "공허의 주술핵": "Voidhex Core",
  "투스의 숨결": "Tuss's Breath", "주술의 근원": "Root of Sorcery",
  "카프라스": "Caphras", "카라자드 반지": "Karajad Ring",
  "미확인 문양 각인서": "Unidentified Inscribed Glyph", "혼돈 문양각인": "Chaos Glyph Imbuement",
  "태초의 원소": "First Element", "혼돈의 원소": "Chaos Element",
  "혼돈의 결정": "Crystal of Chaos", "타오르는 혼돈의 결정": "Blazing Crystal of Chaos",
  "결정화된 토템": "Crystallized Totem",
  "피어나는 오기에르의 가호": "Eidolic Okiara's Blessing", "구원하는 오기에르의 가호": "Nocturnal Okiara's Blessing",
  "오기에르의 가호": "Okiara's Blessing",
  "조화의 빛": "Harmonious Light", "시간의 고리": "Twisted Time", "영겁의 고리": "Ring of Eternity",
  "영광의 증표": "Badge of Glory", "돌파 복구권": "Breakthrough Recovery Ticket",
  "연금석 강화 재료": "Alchemy Stone Enhancement Material", "계열돌파": "Series Breakthrough",
  "여신의 눈물": "Tear of the Goddess", "파도치는 여신의 눈물": "Rippling Tear of the Goddess",
  "고결한 여신의 눈물": "Pristine Tear of the Goddess",
  "과거의 영광": "Glory of the Past", "태양의 결정": "Crystal of the Sun",
  "봉인된 전승의 고리": "Sealed Charm of Succession", "용연향": "Ambergris",

  // ── 등급업/각성/돌파 등 공통 연결어 ──
  "등급업": "Grade Up", "각성완료": "Awakened", "각성": "Awaken", "돌파": "Breakthrough", "강화": "Enhance",
  "공격력": "ATK", "방어력": "DEF",
  "최고 단계 도달": "Max Level Reached", "최고 등급 도달": "Max Grade Reached",
  "교체 구매": "Replace & Buy", "완제품 구매": "Buy Finished Item", "재료로 제작": "Craft from Materials",
  "제작": "Craft", "구매": "Buy", "선행조건: ": "Requirement: ", "선행조건:": "Requirement:",
  "부터 시작": " onward", "직접 은화 ": "Silver ", "직접 ": "",
  "이상": "or higher", "보유": "owned", "달성": "reached", "유물": "Relic", "균열": "Rift",
  "등급": "Grade", "완료": "Complete", "장신구": "Accessory", "찬란한 황금 휘장": "Emblem of Glory",
  "고대의 모루 확정까지 최대 ": "up to ",
  "혼돈의 휘장": "Chaos Emblem",
  "카프라스의 반지": "Caphras Ring", "카프라스의 목걸이": "Caphras Necklace", "카프라스의 귀걸이": "Caphras Earrings",
  "카프라스의 허리띠": "Caphras Belt", "카프라스의 팔찌": "Caphras Bracelet",
  "혼돈의 반지": "Chaos Ring", "혼돈의 목걸이": "Chaos Necklace", "혼돈의 귀걸이": "Chaos Earrings",
  "혼돈의 허리띠": "Chaos Belt", "혼돈의 팔찌": "Chaos Bracelet",
  "태고의 균열 토템": "Primal Rift Totem", "혼돈의 균열 토템": "Chaos Rift Totem",

  // ── 프리셋 (드랍다운 옵션) ──
  "시즌 졸업 직후": "Right After Season Graduation",
  "공허 장비 진입": "Entering Eternal Gear",
  "카라자드 준비": "Preparing for Karajad",
  "최상위 성장 구간": "Top-Tier Growth Stage",
  "혼돈 장비 +6 · 혼돈 장신구 +1 · 태고 유물 각성 +7": "Chaos Gear +6 · Chaos Accessories +1 · Primal Relic Awaken +7",
  "공허 장비 +7 · 혼돈 장신구 +7": "Eternal Gear +7 · Chaos Accessories +7",
  "공허 장비 +8 · 공허 장신구 +9 · 장비·장신구 각성 완료": "Eternal Gear +8 · Eternal Accessories +9 · Gear & Accessories Fully Awakened",
  "공허 장비 +9 이상 · 카라자드 장신구 · 장비·장신구 각성 완료": "Eternal Gear +9+ · Karajad Accessories · Gear & Accessories Fully Awakened",

  // ── 복구 안내 문구 (RECOVERY_NOTES) ──
  "실패해도 단계가 하락하지 않고, 은화 또는 돌파 복구권으로 100% 복구됩니다.":
    "Failure never drops your level — 100% recoverable with Silver or a Breakthrough Recovery Ticket.",
  "실패 시 은화 또는 돌파 복구권으로 복구됩니다.": "On failure, recover with Silver or a Breakthrough Recovery Ticket.",
  "실패 시 은화로 복구됩니다(0~4강 45,000, 이후 5단계마다 45,000씩 증가).":
    "On failure, recover with Silver (45,000 for Lv.0~4, +45,000 every 5 levels after).",
  "실패 시 0→1강은 복구 비용 없음, 1~7강은 결정화된 토템, 8·9강은 오기에르의 가호 1개로 100% 복구됩니다.":
    "On failure: Lv.0→1 costs nothing to recover, Lv.1~7 uses a Crystallized Totem, and Lv.8~9 use 1 Okiara's Blessing — all 100% recovery.",

  // ── 스펙업 표 하단 안내 ──
  "전승의 고리처럼 공식 문서에 회당 소모량이 정해져 있는 항목은 그 실제 수치를 그대로 계산에 사용합니다.": "For items with an official per-attempt cost (like Charm of Succession), the real figure is used as-is."
};

let sortedKeys = null;
function substitute(str) {
  if (!sortedKeys) sortedKeys = Object.keys(EXACT).sort(function (a, b) { return b.length - a.length; });
  let out = str;
  sortedKeys.forEach(function (ko) {
    if (ko.length > 1 && out.indexOf(ko) !== -1) out = out.split(ko).join(EXACT[ko]);
  });
  return out;
}

// 화면 표시 직전에 부르는 번역 함수 — 한국어 원문을 그대로 넣으면 영어 모드일 때만 바꿔 돌려줍니다.
export function t(ko) {
  if (state.lang !== "en" || !ko) return ko;
  if (EXACT[ko] !== undefined) return EXACT[ko];
  let out = ko;
  SUFFIX_PATTERNS.forEach(function (pair) { out = out.replace(pair[0], pair[1]); });
  return substitute(out);
}

const listeners = [];
export function onLangChange(fn) { listeners.push(fn); }

// 배너 이미지 자체에 한글이 그려져 있어 언어별로 다른 파일을 씁니다(다크/라이트는 CSS가 계속 담당).
const BANNER_SRC = {
  ko: { dark: "asset/57e010d8-53c1-4e2b-8c4c-35c84475bdc1.png", light: "asset/light_mode.png" },
  en: { dark: "asset/dark_en.png", light: "asset/light_en.png" }
};

function applyBannerLang() {
  const src = BANNER_SRC[state.lang];
  const alt = t("샤카투 은화연구소 | 검은사막 모바일 스펙업 계산기 — 내 은화로 전투력을 가장 저렴하게 올리는 방법");
  const dark = document.getElementById("bannerDark"), light = document.getElementById("bannerLight");
  if (dark) { dark.src = src.dark; dark.alt = alt; }
  if (light) { light.src = src.light; light.alt = alt; }
}

export function applyStaticTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
    el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
  });
  applyBannerLang();
}

export function setLang(lang) {
  if (state.lang === lang) return;
  state.lang = lang;
  try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  document.documentElement.lang = lang;
  applyStaticTranslations();
  track("lang_toggle", { lang: lang });
  listeners.forEach(function (fn) { fn(); });
}

export function initLangToggle() {
  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  state.lang = saved === "en" ? "en" : "ko";
  document.documentElement.lang = state.lang;

  const btn = document.getElementById("langToggle");
  function render() { btn.textContent = state.lang === "en" ? "EN" : "한"; }
  render();
  applyStaticTranslations();

  btn.addEventListener("click", function () {
    setLang(state.lang === "en" ? "ko" : "en");
    render();
  });
}
