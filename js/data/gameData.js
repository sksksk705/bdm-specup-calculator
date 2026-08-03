// 데이터 계층 — 게임 밸런스 상수(장비/장신구 등급, 잠재력 돌파 곡선, 각성 재료, 고대의 모루 표 등).
// 거래소 시세처럼 자주 바뀌지 않는 "게임 패치에 종속된" 값이라 시세(data/prices.json)와는
// 분리해 이 모듈에 코드로 둡니다. 값의 출처는 각 상수 위 주석을 참고하세요.

// 거래소에서 구매할 수 없는 재화 — 시세 표에 없고, 은화 비용 계산에도 포함하지 않습니다(0으로
// 취급). 다만 스펙업 표의 "소모 재료" 칸에는 필요 수량을 그대로 표시합니다(사용자 확인).
export const UNPRICED_MATERIALS = new Set([
  "과거의 영광",
  "밤의 영혼석 강화 재료", "달빛 영혼석 강화 재료",
  "태양의 결정", "고결한 여신의 눈물", "순도 높은 흑결정",
  // 뉴비 전용 무료 재료 — 각각 해당 레벨까지는 이걸 쓰라고 안내(사용자 확인, 2026-07-31).
  "파도치는 여신의 눈물", "타오르는 혼돈의 결정"
]);
export const MATERIAL_PRICE_SUBSTITUTE = {};
// 독립적인 시세가 아니라 "다른 재료 N개로 제작"하는 완제품 — 가격을 직접 입력받지 않고
// 원재료 시세 × 배수로 자동 계산합니다(예: 피어나는 오기에르의 가호 = 오기에르의 가호 3개).
export const MATERIAL_CRAFT_MULTIPLIER = {
  "피어나는 오기에르의 가호": { from: "오기에르의 가호", qty: 3 },
  "구원하는 오기에르의 가호": { from: "오기에르의 가호", qty: 10 },
  "혼돈의 핵": { from: "혼돈의 축", qty: 0.01 },
  "홍익의 불꽃": { from: "홍익의 불씨", qty: 30 },
  // 공허의 주술핵 10개 = 공허의 눈 1개 가치(사용자 확인, 2026-07-31 — 기존 1:1 대체값은 폐기).
  "공허의 주술핵": { from: "공허의 눈", qty: 0.1 }
};

// "유료 재화" — 은화로 살 수 없고 실제 게임 화폐(프리미엄)로만 얻을 수 있는 재화입니다.
// ① 탭 위쪽에서 항목별로 "보유/사용" 체크박스를 켜고 끌 수 있는데, 체크(기본값)하면 해당 재료를
// 쓰는 스펙업 방식을 그대로 은화 스펙업 표에 포함하고(은화 비용은 0으로 취급 — 프리미엄으로
// 얻을 계획), 체크를 끄면 그 재료를 쓰는 스펙업 방식 자체를 표에서 제외합니다(사용자 확인,
// 2026-07-29). state.paidMaterials[재료명] = { use }로 관리합니다.
export const PAID_MATERIALS = ["시간의 고리", "영겁의 고리"];

export const PARTS = [
  { id: "mainhand", name: "주무기" },
  { id: "offhand", name: "보조무기" },
  { id: "helmet", name: "투구" },
  { id: "armor", name: "갑옷" },
  { id: "gloves", name: "장갑" },
  { id: "shoes", name: "신발" }
];

// 은화 재료 기반 등급업 (부위별). 값은 개수(數量).
// 태고 이하 등급(일반~태고)은 현재 대부분 사용하지 않아(시즌 패스 졸업 시 혼돈 등급부터 시작)
// 계산 대상에서 제외했습니다. 검은별 등급은 전투력 상승이 없는 사이드그레이드라 제외했고,
// 혼돈→공허 등급업까지만 다룹니다.
export const GRADE_UP_RECIPES = [
  {
    from: "혼돈", to: "공허",
    note: "공허(새벽의 장비) 승급. 홍익의 불꽃 + 혼돈의 축 + 아크라드.",
    byPart: {
      mainhand: { "홍익의 불꽃": 5, "혼돈의 축": 10, "아크라드": 30 },
      offhand: { "홍익의 불꽃": 4, "혼돈의 축": 8, "아크라드": 30 },
      armor: { "홍익의 불꽃": 3, "혼돈의 축": 6, "아크라드": 30 },
      helmet: { "홍익의 불꽃": 2, "혼돈의 축": 5, "아크라드": 30 },
      gloves: { "홍익의 불꽃": 2, "혼돈의 축": 4, "아크라드": 30 },
      shoes: { "홍익의 불꽃": 2, "혼돈의 축": 4, "아크라드": 30 }
    }
  }
];

// 잠재력 돌파 확률표 (%), 인덱스 i = (i)->(i+1) 단계("(i+1)강"). 실제 비용 계산은 이 확률에
// 아래 EQUIP_PROBABILITY_BOOST를 곱한 값과, 고대의 모루 확정 시도 횟수(ANCIENT_ANVIL.equip)를
// 상한으로 하는 기댓값을 사용합니다 — 이 원본 확률표는 참고·출처 확인용입니다.
export const EQUIP_BREAKTHROUGH_CURVE = [70, 60, 40, 20, 10, 7, 5, 3, 1, 0.5]; // 태고·혼돈·새벽(공허)의 장비 표준 곡선
export const SOUL_BREAKTHROUGH_CURVE = Array(15).fill(51); // 밤/달빛 영혼석: 전 구간 51%

// 확률 상승권 — 시도 1회당 1개만 쓸 수 있고, 확률을 그 비율만큼 곱해서 올립니다(10%권=1.1배,
// 50%권=1.5배, 100%권=2배). 사용자가 알려준 실전 전략: 1~3강은 안 쓰고, 4강은 50%권(20%→30%),
// 5강부터는 100%권(예: 10%→20%, 7%→14%)을 계속 씁니다. 인덱스 i = "(i+1)강"에 쓰는 배율.
export const EQUIP_PROBABILITY_BOOST = [1, 1, 1, 1.5, 2, 2, 2, 2, 2, 2];
// 위 배율에 대응하는 상승권 이름 — 재료 시세에서 값을 찾는 키로도 씁니다. null = 사용 안 함.
export const EQUIP_PROBABILITY_BOOST_ITEM = [
  null, null, null,
  "확률 상승권(50%)", "확률 상승권(100%)", "확률 상승권(100%)", "확률 상승권(100%)",
  "확률 상승권(100%)", "확률 상승권(100%)", "확률 상승권(100%)"
];

// 장비 돌파는 "그냥 강화"로 진행하면 실패 시 50% 확률로 1단계 하락할 수 있고, 이를 막으려면
// 돌파 복구권을 필수로 소모해야 합니다(실패당 200개+은화 500, 그래도 50%만 방어됨) — 0강 이상
// 모든 단계에 공통 적용됩니다(0강은 더 떨어질 곳이 없어 예외, 사용자 확인 2026-07-28).
export const EQUIP_DROP_PROTECT = { plainTicket: 200, plainSilver: 500 };
// 7→8("칠흑같은 혼돈의 장비")·8→9("피어나는 그림자 장비") 두 단계만 "혼돈의 그림자 장비"라는
// 전용 소모품(실패당 돌파 복구권 1050개+은화 5000으로 제작)으로 100% 방어할 수 있는 대체 수단이
// 있습니다. 그 외 단계는 100% 방어 수단이 없어(사용자 확인) 50% 방어만 가능합니다.
export const EQUIP_SHADOW_PROTECT = {
  7: { label: "칠흑같은 혼돈의 장비", shadowTicket: 1050, shadowSilver: 5000 },
  8: { label: "피어나는 그림자 장비", shadowTicket: 1050, shadowSilver: 5000 }
};

// 그림자 장비(③ 탭 "강화 기대값 계산기" 전용, 위 EQUIP_SHADOW_PROTECT와 별개 모델) — 기존 7·8강
// 장비를 그림자 장비로 전환해 완전히 별도의 자체 강화 트랙(칠흑=0~5강, 피어나는=0~10강)을 밟고,
// 그 최종 단계에 도달하면 다음 실제 강화 단계(8강/9강)로 교환됩니다. 실패해도 단계가 떨어지지
// 않고 복구 비용도 없습니다(100% 방어, 확률/모루/하락 재귀 로직 전부 건너뜀). 자체 단계마다
// 모루(최대 실패 허용) 17(=시도 18회 확정), 시도 1회당(성공/실패 모두) 고결한 흑결정(칠흑 1개·
// 피어나는 7개)+은화 5000이 듭니다. 고결한 흑결정 1개는 돌파 복구권 1050개 + 확률 상승권
// (10% 50개 / 50% 10개 / 100% 2개 중 하나, 섞어 쓸 수 없음)으로 제작하며, 계산기는 현재 시세
// 기준 가장 저렴한 조합을 자동으로 고릅니다. 사용자 제공값, 2026-07-30 확인.
export const SHADOW_GEAR = {
  7: { label: "칠흑같은 그림자 장비", targetSteps: 5, crystalPerAttempt: 1 },
  8: { label: "피어나는 그림자 장비", targetSteps: 10, crystalPerAttempt: 7 }
};
export const SHADOW_GEAR_ANVIL = 17;
export const SHADOW_GEAR_ATTEMPT_SILVER = 5000;
export const BLACK_CRYSTAL_TICKET_QTY = 1050;
export const BLACK_CRYSTAL_BOOST_RECIPES = [
  { boostType: "10", boostQty: 50 },
  { boostType: "50", boostQty: 10 },
  { boostType: "100", boostQty: 2 }
];

// 장비 부위별 잠재력 돌파 1단계당 실수치 상승분 (공식 포럼 가이드 22편 기준, 혼돈/공허 등급).
// 원자료는 "공격력"(보조무기는 공격력:방어력) 단위이며, 전투력 근사값으로 그대로 사용합니다.
// 보조무기는 공격력+방어력 합산값. 인덱스 i = i단계→(i+1)단계 상승분.
// 출처: forum.blackdesertm.com 모험가 가이드 22편(boardNo=17, contentNo=608719)
export const EQUIP_CP_TABLE = {
  "혼돈": {
    mainhand: [22, 24, 26, 29, 33, 40, 51, 99, 272, 470],
    offhand: [20, 22, 24, 26, 30, 37, 46, 92, 243, 426],
    armor: [12, 13, 14, 16, 19, 21, 28, 54, 149, 256],
    helmet: [10, 11, 12, 13, 15, 19, 23, 45, 124, 214],
    gloves: [8, 9, 10, 10, 12, 15, 19, 36, 100, 172],
    shoes: [8, 9, 10, 10, 12, 15, 19, 36, 100, 172]
  },
  "공허": {
    mainhand: [28, 30, 33, 37, 42, 51, 65, 125, 313, 533],
    offhand: [25, 29, 30, 34, 38, 46, 59, 118, 281, 485],
    armor: [16, 17, 19, 21, 25, 28, 37, 72, 176, 299],
    helmet: [14, 15, 17, 18, 21, 27, 32, 63, 151, 255],
    gloves: [12, 13, 14, 15, 17, 21, 28, 52, 124, 210],
    shoes: [12, 13, 14, 15, 17, 21, 28, 52, 124, 210]
  }
};

// 장비 0강(미강화) 기준 실수치 — 등급업(혼돈→공허) 시 "같은 강화 단계라도 등급 자체가 주는
// 순수 전투력 차이"를 계산하는 데 씁니다(EQUIP_CP_TABLE은 강화 단계별 증가분만 있고 기준치가
// 없었음). 보조무기는 공격력+방어력 합산값(다른 값들과 단위를 맞춤). 출처: 공식 확률/스탯 정보
// (#4 혼돈·#5 새벽 표, 2026-07-31 확인).
export const EQUIP_BASE_STAT = {
  "혼돈": { mainhand: 1151, offhand: 709 + 273, armor: 810, helmet: 553, gloves: 488, shoes: 488 },
  "공허": { mainhand: 1652, offhand: 984 + 384, armor: 1210, helmet: 900, gloves: 774, shoes: 774 }
};

// 등급 순서 — 태고 이하(일반~태고)는 요즘 거의 쓰이지 않아 제외했고, 검은별은 전투력 상승이
// 없는 사이드그레이드라 계산 대상에서 제외했습니다.
export const GRADE_ORDER = ["혼돈", "공허"];
export const BREAKTHROUGH_GRADES = { "혼돈": true, "공허": true };

// 등급업(제작) 경로 — 반지/목걸이/허리띠/귀걸이/팔찌/휘장/토템/연금석/유물1/유물2에
// 공통으로 적용. "자기 자신(각성 완료된 이전 등급 아이템)"은 재료로 소모되지만 은화로 값을 매기지
// 않고, 그 외 부재료·직접 소모 은화만 계산합니다. 출처: 공식 모험가 가이드
// (장신구 wikiNo=4004, 토템 wikiNo=4006, 연금석 wikiNo=4007, 유물 wikiNo=4005, 휘장 wikiNo=4008),
// 2026-07-27 확인.
export const ACCESSORY_GRADE_NEXT = { "태고": "혼돈", "혼돈": "공허" };
// 혼돈→공허 등급업은 재료 제작 대신 완제품(공허의 OO)을 구매해 대체할 수도 있습니다. 시세는
// 둘 중 더 싼 쪽을 스펙업 표 기본값으로 자동 선택합니다(사용자 제공값, 2026-07-31).
export const GRADE_UP_BUY_ITEM = {
  ring1: "공허의 반지", necklace: "공허의 목걸이", earring: "공허의 귀걸이",
  belt: "공허의 허리띠", bracelet: "공허의 팔찌"
};
export const ACCESSORY_GRADE_UP = {
  emblem: {
    "태고": { materials: { "과거의 영광": 7 }, silver: 0, prereq: "찬란한 황금 휘장(태고) 보유" },
    "혼돈": { materials: { "공허의 눈": 25, "혼돈의 축": 5, "아크라드": 15 }, silver: 0, prereq: "혼돈의 휘장 보유" }
  },
  ring1: {
    "태고": { materials: { "혼돈의 축": 2, "아크라드": 10 }, silver: 0, prereq: "각성 카프라스의 반지 보유" },
    "혼돈": { materials: { "공허의 눈": 50, "혼돈의 축": 21, "아크라드": 50 }, silver: 0, prereq: "혼돈의 반지 보유" }
  },
  necklace: {
    "태고": { materials: { "혼돈의 축": 5, "아크라드": 10 }, silver: 0, prereq: "각성 카프라스의 목걸이 보유" },
    "혼돈": { materials: { "공허의 눈": 85, "혼돈의 축": 36, "아크라드": 50 }, silver: 0, prereq: "혼돈의 목걸이 보유" }
  },
  earring: {
    "태고": { materials: { "혼돈의 축": 3, "아크라드": 10 }, silver: 0, prereq: "각성 카프라스의 귀걸이 보유" },
    "혼돈": { materials: { "공허의 눈": 55, "혼돈의 축": 24, "아크라드": 50 }, silver: 0, prereq: "혼돈의 귀걸이 보유" }
  },
  belt: {
    "태고": { materials: { "혼돈의 축": 4, "아크라드": 10 }, silver: 0, prereq: "각성 카프라스의 허리띠 보유" },
    "혼돈": { materials: { "공허의 눈": 65, "혼돈의 축": 30, "아크라드": 50 }, silver: 0, prereq: "혼돈의 허리띠 보유" }
  },
  bracelet: {
    "태고": { materials: { "혼돈의 축": 2, "아크라드": 10 }, silver: 0, prereq: "각성 카프라스의 팔찌 보유" },
    "혼돈": { materials: { "공허의 눈": 50, "혼돈의 축": 21, "아크라드": 50 }, silver: 0, prereq: "혼돈의 팔찌 보유" }
  },
  totem: {
    "태고": { materials: { "균열의 열기": 20, "혼돈의 축": 2, "아크라드": 5 }, silver: 5000000000, prereq: "+40 태고의 균열 토템 달성" },
    "혼돈": { materials: { "균열의 열기": 20, "홍익의 불꽃": 1, "공허의 눈": 70 }, silver: 10000000, prereq: "+20 혼돈의 균열 토템 달성" }
  },
  // 조화의 연금석은 태고 등급이 없고 혼돈부터 시작합니다(제작 재료: 혼돈의 축10+아크라드20,
  // 이야기 '큰 힘을 다루는 법' 완료 필요 — 최초 제작 비용이라 등급업 표에는 포함하지 않음).
  alchemy: {
    "혼돈": { materials: { "공허의 눈": 20, "혼돈의 축": 10, "아크라드": 30 }, silver: 0, prereq: "+40 혼돈 등급 조화의 연금석 달성" }
  },
  relic1: {
    "태고": { materials: { "아크라드": 30, "혼돈의 축": 10 }, silver: 1000000, prereq: "각성 +7단계 이상 태고 유물 보유" },
    "혼돈": { materials: { "공허의 눈": 25, "아크라드": 30, "혼돈의 축": 10 }, silver: 1000000, prereq: "각성 +8단계 이상 혼돈 유물 보유" }
  },
  relic2: {
    "태고": { materials: { "아크라드": 30, "혼돈의 축": 10 }, silver: 1000000, prereq: "각성 +7단계 이상 태고 유물 보유" },
    "혼돈": { materials: { "공허의 눈": 25, "아크라드": 30, "혼돈의 축": 10 }, silver: 1000000, prereq: "각성 +8단계 이상 혼돈 유물 보유" }
  }
};

// 광원석 태고→혼돈 등급업 — 태고 광원석의 강화 단계에 따라 필요한 혼돈의 원소 개수와 등급업
// 직후 시작하는 혼돈 단계가 다릅니다(사용자 제공값). 혼돈의 축 5개·아크라드 10개는 단계와
// 무관하게 항상 함께 필요합니다. 배열 인덱스 = 현재 태고 강화 단계(0~20강).
export const LIGHTSTONE_GRADE_UP_TABLE = [
  { oreQty: 50, resultStep: 0 }, { oreQty: 50, resultStep: 0 }, { oreQty: 50, resultStep: 0 },
  { oreQty: 50, resultStep: 0 }, { oreQty: 50, resultStep: 0 }, { oreQty: 50, resultStep: 0 },
  { oreQty: 50, resultStep: 0 }, { oreQty: 50, resultStep: 0 }, { oreQty: 50, resultStep: 0 },
  { oreQty: 50, resultStep: 0 }, { oreQty: 50, resultStep: 0 }, { oreQty: 50, resultStep: 0 },
  { oreQty: 50, resultStep: 0 }, { oreQty: 50, resultStep: 0 }, // 0~13강
  { oreQty: 40, resultStep: 0 },  // 14강
  { oreQty: 35, resultStep: 2 },  // 15강
  { oreQty: 25, resultStep: 4 },  // 16강
  { oreQty: 10, resultStep: 6 },  // 17강
  { oreQty: 1, resultStep: 8 },   // 18강
  { oreQty: 1, resultStep: 10 },  // 19강
  { oreQty: 1, resultStep: 13 }   // 20강
];

// 휘장 장식 고대의 모루 + 투스의 숨결 소모량 — 사용자 제공 밴드표("강화 시작 단계 1~39: 모루
// 불필요, 40~69: 2회, 70~89: 4회, 90~149: 10회" / 투스의 숨결 회당 1·3·5·7개)를 이 코드베이스의
// 0-index 관례(배열 인덱스 = 시작 단계, 레벨 0부터 최대 150까지 총 150회 전환)에 맞춰 옮겼습니다.
// 원자료의 "1~39"를 시작 단계 0~39(40개 구간)로 해석해야 0→150까지 정확히 150개 전환이 됩니다.
// 값 자체는 "허용되는 최대 실패 횟수"이고(위 ANCIENT_ANVIL과 동일한 모루 로직, 사용자 확인
// 2026-07-28), 실제 계산에서는 +1(실패를 다 채운 다음 시도가 확정 성공)을 적용합니다.
function buildEmblemDecoBandTable(bandValues) {
  return [].concat(
    Array(40).fill(bandValues[0]), Array(30).fill(bandValues[1]),
    Array(20).fill(bandValues[2]), Array(60).fill(bandValues[3])
  );
}
export const EMBLEM_DECORATION_ANVIL = buildEmblemDecoBandTable([1, 2, 4, 10]);
export const EMBLEM_DECORATION_TICKET_QTY = buildEmblemDecoBandTable([1, 3, 5, 7]);

// 휘장 장식 전투력 증가치 — 단계가 오른 만큼 그대로 공격력(또는 방어력)이 오릅니다(1단계당 1).
// 철벽·투지는 100단계 이후 성공당 단계가 2씩 올라 그만큼도 2씩 오릅니다(사용자 확인, 2026-07-31).
// 다른 등급별 cpTable(RELIC_CP_TABLE 등)과 형식을 맞추기 위해 태고/혼돈/공허 키에 같은 배열을 둡니다
// (이 항목들은 등급 선택 UI 자체가 없어 실제로는 항상 같은 배열을 씁니다).
const EMBLEM_DECO_CP_STANDARD = Array(150).fill(1);
const EMBLEM_DECO_CP_ACCEL = Array(100).fill(1).concat(Array(50).fill(2));
export const EMBLEM_DECO_CP_TABLE_STANDARD = { "태고": EMBLEM_DECO_CP_STANDARD, "혼돈": EMBLEM_DECO_CP_STANDARD, "공허": EMBLEM_DECO_CP_STANDARD };
export const EMBLEM_DECO_CP_TABLE_ACCEL = { "태고": EMBLEM_DECO_CP_ACCEL, "혼돈": EMBLEM_DECO_CP_ACCEL, "공허": EMBLEM_DECO_CP_ACCEL };

// 휘장 장식 해금 조건 — 슬롯 1~3(용맹/침착/격렬)은 휘장 자체의 등급별 강화 단계 중 하나만
// 충족하면 되고, 슬롯 4~5(철벽/투지)는 장식 5개의 강화 단계 합이 기준치 이상이어야 합니다.
// 출처: 공식 가이드(wikiNo=4008), 2026-07-28 확인.
export const EMBLEM_DECORATION_UNLOCK = {
  emblemDeco1: { type: "emblemLevel", conditions: [{ grade: "태고", level: 10 }, { grade: "혼돈", level: 8 }, { grade: "공허", level: 4 }] },
  emblemDeco2: { type: "emblemLevel", conditions: [{ grade: "태고", level: 20 }, { grade: "혼돈", level: 16 }, { grade: "공허", level: 11 }] },
  emblemDeco3: { type: "emblemLevel", conditions: [{ grade: "태고", level: 30 }, { grade: "혼돈", level: 27 }, { grade: "공허", level: 21 }] },
  emblemDeco4: { type: "decoSum", threshold: 150 },
  emblemDeco5: { type: "decoSum", threshold: 300 }
};

// 고대의 모루(wikiNo=4021) — 강화 "실패"마다 기운이 1씩 쌓이고, 기운이 표의 최대치에 도달한
// 뒤의 다음 시도는 확정 성공합니다(사용자 확인, 2026-07-28). 즉 배열 인덱스 = 시작 단계, 값 =
// 허용되는 최대 실패 횟수이고, 총 시도 횟수 상한은 그 값+1(마지막 한 번은 확정 성공)입니다 —
// 아래 모든 계산은 이 값에 +1을 해서 "확정 성공까지의 총 시도 횟수"로 씁니다. 확률 데이터가
// 없는 항목은 이 총 시도 횟수 상한을 그대로 필요 시도 횟수로 가정해 계산합니다(성공률이 그보다
// 좋으면 실제 비용은 더 낮아질 수 있는 보수적 상한치). "-"(모루 불필요, 사실상 100% 성공)로
// 표시된 구간은 실패 허용 0회(=반드시 첫 시도에 성공)로 처리했습니다.
export const ANCIENT_ANVIL = {
  // 태고·혼돈·새벽(공허) 장비 표준 잠재력 돌파, 0~9단계. 사용자 제공 참고값(공식 확률표 기준).
  equip: [1, 1, 2, 3, 5, 8, 10, 17, 50, 100],
  accessory: [1, 1, 1, 2, 3, 4, 12, 25, 100, 334], // 장신구 잠재력 각성, 0~9단계
  relic: [2, 4, 10, 10, 10, 13, 20, 34, 100, 200], // 유물 잠재력 돌파, 0~9단계
  harmonyAlchemy: [ // 조화의 연금석 돌파, 0~39단계
    2, 4, 10, 11, 11, 11, 12, 12, 12, 13, 13, 13, 14, 14, 15, 15, 16, 16, 17, 18,
    18, 19, 20, 21, 22, 23, 25, 26, 28, 30, 32, 34, 38, 41, 46, 51, 58, 68, 81, 100
  ],
  lightstone: [ // 광원석 강화, 0~19단계
    5, 5, 7, 7, 7, 7, 10, 10, 20, 20, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34
  ],
  // 공허 유물 계열 돌파(2026-05-12부터 "유물 마력 각인"으로 명칭 변경), 0~19단계(+20 한도)
  relicSeries: [10, 20, 34, 34, 50, 50, 100, 100, 200, 200, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40],
  // 카라자드(신성 등급) 장신구 전용 모루표, 0~9단계. 다른 장신구 등급(accessory)과는 별개의
  // 고유 수치입니다. 사용자 제공값, 2026-07-29 확인.
  karazad: [0, 2, 2, 4, 4, 7, 10, 20, 34, 100]
};

// 장신구(반지/팔찌/귀걸이/허리띠/목걸이)/휘장/토템의 잠재력 돌파 1단계당 실수치 상승분.
// 출처: forum.blackdesertm.com 모험가 가이드 23편(boardNo=17, contentNo=611130), 2026-07-27 확인.
// 원자료는 스탯 수치(공격력·방어력 등)이며, 전투력 근사값으로 그대로/합산해 사용합니다.
//
// 장신구: 원자료에는 잠재력 돌파의 본스탯 증가치 외에 "각성 추가 수치"(별도 표시된 두 번째 스탯)가
// 함께 실려 있는데, 이는 매 단계 자동으로 붙는 게 아니라 별도의 "각성" 액션(아래 ACCESSORY_AWAKEN,
// wikiNo=3049)으로 1회만 진행되는 수치라 여기서는 제외하고 본스탯 증가치만 담았습니다. 태고·혼돈
// 등급은 원자료 표가 동일해 두 등급이 같은 값을 씁니다.
export const ACCESSORY_CP_TABLE = {
  "태고": {
    ring1: [30, 40, 50, 55, 55, 63, 84, 88, 92, 96],
    bracelet: [30, 40, 50, 55, 55, 63, 84, 88, 92, 96],
    earring: [30, 30, 35, 40, 45, 53, 67, 73, 78, 86],
    belt: [30, 40, 40, 50, 50, 61, 78, 83, 88, 94],
    necklace: [35, 45, 55, 55, 60, 76, 95, 99, 104, 109]
  },
  "혼돈": {
    ring1: [30, 40, 50, 55, 55, 63, 84, 88, 92, 96],
    bracelet: [30, 40, 50, 55, 55, 63, 84, 88, 92, 96],
    earring: [30, 30, 35, 40, 45, 53, 67, 73, 78, 86],
    belt: [30, 40, 40, 50, 50, 61, 78, 83, 88, 94],
    necklace: [35, 45, 55, 55, 60, 76, 95, 99, 104, 109]
  },
  "공허": {
    ring1: [32, 44, 55, 59, 60, 69, 92, 96, 100, 104],
    bracelet: [32, 44, 55, 59, 60, 69, 92, 96, 100, 104],
    earring: [33, 32, 38, 44, 49, 58, 73, 80, 85, 93],
    belt: [33, 43, 44, 54, 55, 66, 85, 91, 96, 102],
    necklace: [38, 49, 60, 60, 65, 83, 104, 108, 113, 119]
  }
};

// 장신구 잠재력 돌파 실패 시 복구 비용 — 장비와 달리 100% 방어됩니다(단계가 하락하지 않음).
// 은화 또는 돌파 복구권 중 하나만 있으면 복구되고 어느 쪽을 쓸지 선택할 수 있습니다(사용자 제공값,
// 2026-07-28 확인). 등급(태고/혼돈/공허) 무관 공통 수치입니다. 배열 인덱스 = 시작 단계 — 0→1강은
// 원자료에 없어(고대의 모루 상 항상 첫 시도에 성공한다고 가정한 구간과 일치) 0으로 둡니다.
const ACCESSORY_RECOVERY_VALUES = {
  silver: [0, 46080, 64512, 92160, 161000, 350000, 672000, 1594000, 2488000, 4976000],
  ticket: [0, 139, 194, 278, 686, 1752, 4205, 9965, 20530, 26131]
};
// 카라자드(신성 등급)는 복구 비용 실수치가 따로 없어 위 공통표를 그대로 재사용합니다.
export const ACCESSORY_RECOVERY_TABLE = { "태고": ACCESSORY_RECOVERY_VALUES, "혼돈": ACCESSORY_RECOVERY_VALUES, "공허": ACCESSORY_RECOVERY_VALUES, "카라자드": ACCESSORY_RECOVERY_VALUES };

// 카라자드(신성 등급) 장신구 — 최상위 사냥터 '오딜리타'(전투력 95,000 이상) 필드 전리품·'어둠의
// 틈' 보상으로 낮은 확률로 얻는 "카라자드 장신구(+0)"를, 각성 완료한 공허 등급 장신구(+9 또는
// +10)와 함께 소모해 [제작]-[장비]-[장신구]-[신성 장신구] 메뉴에서 제작합니다. 공허 +9로 제작하면
// 카라자드 +2단계부터, +10(최대)으로 제작하면 +4단계부터 시작합니다. 잠재력 돌파하지 않은(+0)
// 카라자드 장신구는 거래소에서 매매 가능하고, 돌파 시에도 동일 부위의 +0 카라자드 장신구를
// 재료로 소모합니다(사용자 확인) — 그래서 이 +0 아이템의 시세를 prices.json에 등록해 제작·돌파
// 양쪽에서 함께 씁니다. 출처: 공식 제작 가이드, 사용자 제공, 2026-07-29 확인.
export const KARAZAD_CRAFT = {
  9: { resultStep: 2, prereq: "각성 완료 공허 +9단계 장신구 보유" },
  10: { resultStep: 4, prereq: "각성 완료 공허 +10단계(최대) 장신구 보유" }
};

// itemId → "카라자드 장신구(+0)" 재료명(prices.json에 등록된 이름, priceOf()로 시세 조회).
export const KARAZAD_ITEM_MATERIAL = {
  ring1: "카라자드 반지", necklace: "카라자드 목걸이", earring: "카라자드 귀걸이",
  belt: "카라자드 허리띠", bracelet: "카라자드 팔찌"
};

// 카라자드 +2단계·+4단계(제작 직후 시작 단계)의 부위별 수치 — 처음엔 "전투력 증가분"으로
// 받았지만, 실제로는 전투력 증가분이 아니라 공격력 또는 방어력에 해당하는 절대 수치라고
// 확인돼(사용자 확인, 2026-07-29) 현재는 계산에 쓰지 않습니다(computeKarazadCraft는 다시
// 직접 입력으로 되돌아감). 진짜 전투력 증가분을 구하려면 이 절대 수치를 어떻게 변환할지,
// 또는 공허 +9/+10단계의 대응 절대 수치가 필요합니다 — 확인되면 다시 연결할 예정이라 값은
// 남겨둡니다.
export const KARAZAD_CRAFT_CP_GAIN = {
  ring1: { 2: 2506, 4: 2851 },
  necklace: { 2: 2650, 4: 3039 },
  earring: { 2: 1979, 4: 2280 },
  belt: { 2: 2246, 4: 2580 },
  bracelet: { 2: 2506, 4: 2851 }
};

// 카라자드(신성 등급) 장신구 잠재력 돌파 성공 확률표. 인덱스 i = i→(i+1)단계(%). 다른 장신구
// 등급과 달리 실제 확률 데이터가 있어, 장비 돌파와 같은 방식으로 이 확률과 전용 모루표
// (ANCIENT_ANVIL.karazad)를 함께 반영한 절단 기하분포 기댓값을 씁니다. 사용자 제공값,
// 2026-07-29 확인.
export const KARAZAD_BREAKTHROUGH_CURVE = [100, 75, 50, 30, 25, 15, 10, 5, 3, 1];

// 카라자드 +0단계(잠재력 돌파 전) 기본 능력치 — 부위별 공격력 또는 방어력 중 하나만 붙습니다.
// 잠재력 돌파 단계별 증가치(0→1~9→10)는 아직 공개 데이터가 없어, 지금은 참고용으로만
// 남겨두고 카라자드 제작/돌파의 전투력 증가치는 여전히 직접 입력(cpEditable)입니다.
// 사용자 제공값, 2026-07-29 확인.
export const KARAZAD_BASE_STAT = {
  ring1: { atk: 0, def: 2168 }, necklace: { atk: 2267, def: 0 }, earring: { atk: 1688, def: 0 },
  belt: { atk: 1920, def: 0 }, bracelet: { atk: 0, def: 2168 }
};

// 각성 — 장비/장신구 전용 시스템. 잠재력 돌파를 해당 등급의 최고 단계(10)까지 마친 뒤 1회만
// 진행할 수 있고, 완료하면 다시 할 수 없습니다(① 탭의 "각성완료" 체크박스로 직접 표시). 재료·은화는
// 공식 가이드(wikiNo=3049 "각성 시스템", 2026-07-27 확인), 전투력 증가치는 위 22·23편 원자료의
// "각성 추가 수치/각성총합"에서 가져왔습니다.
export const EQUIP_AWAKEN = {
  "혼돈": {
    mainhand: { materials: { "차원의 조각": 60 }, silver: 12000, cpGain: 150 },
    offhand: { materials: { "차원의 조각": 52 }, silver: 10000, cpGain: 87 },
    armor: { materials: { "차원의 조각": 40 }, silver: 8000, cpGain: 100 },
    helmet: { materials: { "차원의 조각": 20 }, silver: 4000, cpGain: 90 },
    gloves: { materials: { "차원의 조각": 20 }, silver: 4000, cpGain: 50 },
    shoes: { materials: { "차원의 조각": 20 }, silver: 4000, cpGain: 50 }
  },
  "공허": {
    mainhand: { materials: { "홍익의 불꽃": 5, "혼돈의 축": 10, "아크라드": 30 }, silver: 120000, cpGain: 400 },
    offhand: { materials: { "홍익의 불꽃": 4, "혼돈의 축": 8, "아크라드": 30 }, silver: 100000, cpGain: 294 },
    armor: { materials: { "홍익의 불꽃": 3, "혼돈의 축": 6, "아크라드": 30 }, silver: 80000, cpGain: 190 },
    helmet: { materials: { "홍익의 불꽃": 2, "혼돈의 축": 5, "아크라드": 30 }, silver: 40000, cpGain: 180 },
    gloves: { materials: { "홍익의 불꽃": 2, "혼돈의 축": 4, "아크라드": 30 }, silver: 40000, cpGain: 190 },
    shoes: { materials: { "홍익의 불꽃": 2, "혼돈의 축": 4, "아크라드": 30 }, silver: 40000, cpGain: 190 }
  }
};
export const ACCESSORY_AWAKEN = {
  "태고": {
    ring1: { materials: {}, silver: 4400, cpGain: 121 },
    bracelet: { materials: {}, silver: 4400, cpGain: 121 },
    earring: { materials: {}, silver: 3600, cpGain: 99 },
    belt: { materials: {}, silver: 4200, cpGain: 116 },
    necklace: { materials: {}, silver: 4800, cpGain: 132 }
  },
  "혼돈": {
    ring1: { materials: { "혼돈의 축": 4 }, silver: 308000, cpGain: 121 },
    bracelet: { materials: { "혼돈의 축": 4 }, silver: 308000, cpGain: 121 },
    earring: { materials: { "혼돈의 축": 5 }, silver: 252000, cpGain: 99 },
    belt: { materials: { "혼돈의 축": 6 }, silver: 294000, cpGain: 116 },
    necklace: { materials: { "혼돈의 축": 7 }, silver: 336000, cpGain: 132 }
  },
  "공허": {
    ring1: { materials: { "공허의 눈": 55, "혼돈의 축": 8, "아크라드": 20 }, silver: 4620000, cpGain: 615 },
    bracelet: { materials: { "공허의 눈": 55, "혼돈의 축": 8, "아크라드": 20 }, silver: 4620000, cpGain: 615 },
    earring: { materials: { "공허의 눈": 60, "혼돈의 축": 10, "아크라드": 20 }, silver: 3780000, cpGain: 501 },
    belt: { materials: { "공허의 눈": 70, "혼돈의 축": 12, "아크라드": 20 }, silver: 4410000, cpGain: 577 },
    necklace: { materials: { "공허의 눈": 95, "혼돈의 축": 15, "아크라드": 20 }, silver: 5040000, cpGain: 422 }
  }
};

// 휘장: 원자료가 "공격력=방어력"이라고 명시해 두 스탯 몫으로 값을 2배 했습니다.
// 태고 등급은 +30단계가 상한(그 이상은 원자료에 자료 없음, "●"), 혼돈·공허는 +50단계까지.
export const EMBLEM_CP_TABLE = {
  "태고": [10, 10, 10, 12, 12, 12, 12, 14, 14, 14, 14, 16, 16, 16, 16, 16, 16, 16, 18, 18, 18, 18, 18, 18, 18, 18, 20, 20, 20, 20],
  "혼돈": [10, 10, 10, 12, 12, 12, 12, 14, 14, 14, 14, 16, 16, 16, 16, 16, 16, 16, 18, 18, 18, 18, 18, 18, 18, 18, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20],
  "공허": [12, 14, 14, 14, 14, 16, 16, 16, 16, 16, 16, 16, 18, 18, 18, 18, 18, 18, 18, 18, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20]
};

// 토템(균열의 토템): 원자료도 "공격력=방어력" 동일 수치라 2배 했습니다. 혼돈 등급부터는 단계당
// 생명력도 대량(혼돈 +200/단계, 공허 +250/단계)으로 함께 오르지만, 공격력류 스탯과 단위가 전혀
// 달라(생명력이 40~50배 더 큼) 그대로 합산하면 전투력 근사가 심하게 왜곡되므로 이 계산기에서는
// 생명력 증가분을 제외했습니다 — 그만큼 토템의 실제 효율은 여기 표시된 값보다 더 좋습니다.
export const TOTEM_CP_TABLE = {
  "태고": [10, 10, 10, 10, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80],
  "혼돈": [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
  "공허": [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
};

// 공허 등급 균열의 토템 잠재력 돌파 — 시도 전 "공허의 주술핵"으로 성공 확률을 100%까지 채워
// 확정 성공시키는 방식입니다(실패 없음). 개당 확률 증가치가 목표 단계 n에서 4/(n+1)%로
// 로그성 하락합니다(1강 2%, 2강 1.3333%, 3강 1%, 4강 0.8% 확인됨 — 정확히 4/(n+1) 공식과 일치).
// 100%를 채우는 데 필요한 개수 = 100 ÷ (4/(n+1)) = 25×(n+1)개(사용자 확인, 2026-07-31).
// 배열 인덱스 = 시작 단계(0→1강이 index0).
export const TOTEM_VOID_QTY_PER_ATTEMPT = Array.from({ length: 40 }, function (_, i) { return 25 * (i + 2); });

// 균열의 토템(가문 콘텐츠, 위 "토템(균열의 토템)"과 별개 항목) — 등급 구분 없이 0~10단계.
// 공격력=방어력 동일 수치라 2배 근사(장신구 돌파·흑정령 피해량 증가는 단위가 달라 제외 —
// 다른 항목과 같은 이유). 모루(최대 실패 허용)는 시작 단계 0~2강=2, 3=4, 4=7, 5=10, 6=20,
// 7=34, 8=50, 9=100. 실패 시 복구는 0→1강은 복구 비용 0(더 떨어질 곳이 없어 방어가 필요
// 없음), 1~7강(대상 2~8강)은 결정화된 토템으로, 8·9강(대상 9·10강)은 각각 피어나는·구원하는
// 오기에르의 가호 1개로 100% 복구합니다(둘 다 오기에르의 가호 3개/10개로 제작하는 완제품이라
// 시세는 priceOf의 MATERIAL_CRAFT_MULTIPLIER로 자동 계산). 매 시도(성공/실패 모두) 소모량은
// 정보가 없어 결정화된 토템 1개(더미)로 가정합니다. 사용자 제공값, 2026-07-30 확인.
const RIFT_TOTEM_STAT = [30, 42, 58, 77, 102, 134, 181, 244, 325, 430, 570]; // 0~10단계 절대 수치(공격력=방어력)
export const RIFT_TOTEM_CP_TABLE = RIFT_TOTEM_STAT.slice(1).map(function (v, i) { return (v - RIFT_TOTEM_STAT[i]) * 2; });
export const RIFT_TOTEM_ANVIL = [2, 2, 2, 4, 7, 10, 20, 34, 50, 100]; // 인덱스 = 시작 단계(0~9)
export const RIFT_TOTEM_RECOVERY_MATERIAL = [
  "결정화된 토템",
  "결정화된 토템", "결정화된 토템", "결정화된 토템", "결정화된 토템", "결정화된 토템", "결정화된 토템", "결정화된 토템",
  "피어나는 오기에르의 가호", "구원하는 오기에르의 가호"
];
export const RIFT_TOTEM_RECOVERY_QTY = [0, 1, 2, 4, 9, 43, 240, 3700, 1, 1]; // 0→1강은 복구 비용 0(사용자 확인)

// 광원석: 태고·혼돈 등급 기본 능력치(공격력=방어력, 2배 근사) 강화 단계별 상승분.
// 출처: forum.blackdesertm.com 아이템 가이드 20편(boardNo=17, contentNo=641262), 2026-07-27 확인.
export const LIGHTSTONE_CP_TABLE = {
  "태고": [6, 6, 6, 8, 8, 8, 10, 10, 10, 12, 12, 14, 14, 16, 16, 18, 20, 22, 24, 26],
  "혼돈": [10, 10, 10, 10, 10, 10, 12, 12, 12, 12, 12, 12, 14, 14, 14, 14, 14, 14, 16, 16]
};
// 혼돈급 광원석 강화 실패 시 복구 비용(1~9강, 10~19강 두 구간으로 고정). 마지막(+20강) 복구
// 비용은 원자료에 없어 10~19강과 동일하다고 가정했습니다("4강부터 고정" 서술과 일관).
export const LIGHTSTONE_RECOVERY_TABLE = {
  "혼돈": {
    silver: [900000000, 900000000, 900000000, 900000000, 900000000, 900000000, 900000000, 900000000, 900000000,
      1800000000, 1800000000, 1800000000, 1800000000, 1800000000, 1800000000, 1800000000, 1800000000, 1800000000, 1800000000, 1800000000],
    ticket: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000,
      2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000]
  }
};

// 유물 잠재력 돌파(태고/혼돈/공허): "등급에 상관없이 상승 수치가 일정하다"고 원자료에 명시돼
// 있어 세 등급이 같은 값을 씁니다(공격력=방어력, 2배 근사). 출처: forum.blackdesertm.com
// 아이템 가이드 21편(boardNo=17, contentNo=644544), 2026-07-27 확인.
const RELIC_CP_TABLE_VALUES = [28, 28, 32, 36, 40, 60, 66, 74, 86, 100];
export const RELIC_CP_TABLE = { "태고": RELIC_CP_TABLE_VALUES, "혼돈": RELIC_CP_TABLE_VALUES, "공허": RELIC_CP_TABLE_VALUES };

// 문양 각인서 — 현재 보유 중인 등급의 실제 감정 결과(공격력·방어력)를 ①탭에서 직접 고르고,
// ②탭에서는 "한 단계 위 등급 책으로 교체 구매"를 스펙업 액션으로 계산합니다(강화 반복이 아니라
// 등급업 1회 구매). 감정 결과는 공격력·방어력이 그룹별로 함께 정해집니다(그룹마다 "모험가에게
// 주는 피해량"도 나오지만 단위가 달라 전투력 근사에서 제외). 출처: 공식 확률 정보
// (wikiNo=1001013, 2026-07-31 확인).
export const INSIGNIA_BOOK_ATK_RANGE = { "심연": [54, 67], "태고": [68, 93], "혼돈": [94, 133] };
export const INSIGNIA_BOOK_DEF_RANGE = { "심연": [27, 33], "태고": [33, 47], "혼돈": [48, 71] };
// 중앙값 쌍(공격력/방어력) — 각 등급 그룹 목록(11/21/27개, 모두 홀수개)의 가운데 그룹 실수치.
// ①탭 공격력/방어력 입력칸의 기본값(자기 등급 중앙값)이자, ②탭 "다음 등급 교체" 전투력
// 상승량 계산의 목표값(다음 등급 중앙값)으로 함께 씁니다 — 사용자 확인, 2026-07-31.
export const INSIGNIA_BOOK_MEDIAN_STAT = {
  "심연": { atk: 60, def: 30 }, "태고": { atk: 80, def: 40 }, "혼돈": { atk: 114, def: 59 }
};

// 유물 잠재력 돌파(신화급 이상 = 태고/혼돈/공허 공통) 실패 시 복구 비용. 4강부터 고정.
// +10강(마지막 단계) 복구 비용은 원자료에 없어 +4~+9와 동일하다고 가정했습니다.
// silver는 기존에 10,000배 부풀려져 있던 오류를 수정했습니다(사용자 확인, 2026-07-31 —
// 1~2강 13.7만, 2~3강 19.2만, 3~4강 38.4만, 4강부터 54.8만 고정).
const RELIC_RECOVERY_VALUES = {
  silver: [137000, 192000, 384000, 548000, 548000, 548000, 548000, 548000, 548000, 548000],
  ticket: [900, 2100, 4200, 6000, 6000, 6000, 6000, 6000, 6000, 6000]
};
export const RELIC_RECOVERY_TABLE = { "태고": RELIC_RECOVERY_VALUES, "혼돈": RELIC_RECOVERY_VALUES, "공허": RELIC_RECOVERY_VALUES };

// 공허 유물 계열 돌파(마력각인) 0~19단계 전투력 증가치(공격력=방어력, 2배 근사). 10단계부터도
// 더 이상 상승폭이 커지지 않고 단계당 48로 고정됩니다. 출처: 위 21편, 2026-07-27 확인.
export const RELIC_SERIES_CP_GAIN = [12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48];

// 공허 유물 계열 돌파(2026-05-12부터 "유물 마력 각인") 실패 시 복구 재화 소모량. 10강부터 고정.
// 출처: forum.blackdesertm.com 아이템 가이드 21편(boardNo=17, contentNo=644544), 2026-07-27 확인.
export const RELIC_SERIES_RECOVERY_QTY = {
  "차원의 조각": [55, 60, 65, 70, 75, 80, 85, 90, 95, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250],
  "돌파 복구권": [5500, 6000, 6500, 7000, 7500, 8000, 8500, 9000, 9500, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000]
};

// 공허 유물 계열 돌파(마력각인) 시도 1회당(성공/실패 모두) 소모되는 재료 — 단계와 무관하게
// 고정값입니다(사용자 제공값, 2026-07-28 확인).
export const RELIC_SERIES_ATTEMPT_COST = { "아크라드": 1, "차원의 조각": 90 };

// 복구 방식은 항목마다 다릅니다. 출처: 공식 가이드
// (장신구 wikiNo=4004 "은화 및 돌파 복구권을 소모하면 복구", 광원석 wikiNo=4013/조화의 연금석
// wikiNo=4007 "은화 또는 돌파 복구권", 공허 유물 계열 돌파 wikiNo=4005 "차원의 조각 250개
// 혹은 돌파 복구권 25,000개"), 2026-07-27 확인. 유물 기본 잠재력 돌파는 이후 21편에서
// "은화 또는 돌파 복구권 중 하나만 있으면 복구"로 확인돼(AND가 아닌 OR) 문구를 수정했습니다.
export const RECOVERY_NOTES = {
  accessory: "실패 시 은화 또는 돌파 복구권 중 하나만 있으면 100% 복구됩니다(장비와 달리 단계가 하락하지 않아 항상 방어됨). 아래 금액은 원자료 실수치이며 기본적으로 은화만 사용하는 것으로 계산했습니다 — 복구권으로 비교하고 싶다면 «① 현재 상태» 탭 맨 위 «복구 기준 시세» 칸의 환산값과 비교해 보세요.",
  relic: "실패 시 은화 또는 돌파 복구권 중 하나만 있으면 복구됩니다. 아래 금액은 원자료 실수치이며 기본적으로 은화만 사용하는 것으로 계산했습니다 — 복구권으로만 복구하실 거면 실패당 은화 입력칸을 직접 0으로 바꾸세요.",
  harmonyAlchemy: "실패 시 은화로 복구됩니다(0~4강 45,000, 5~9강 90,000처럼 5단계마다 45,000씩 증가 — 사용자 제공값). 돌파 복구권으로도 복구 가능할 수 있으나 정확한 개수는 미공개입니다.",
  lightstone: "실패 시 은화 또는 돌파 복구권 중 하나만 있으면 복구됩니다. 혼돈 등급은 아래 금액이 원자료 실수치(1~9강/10~19강 두 구간)이며 기본적으로 은화만 사용하는 것으로 계산했습니다. 태고 등급은 정확한 개수가 미공개라 직접 입력이 필요합니다.",
  riftTotem: "실패 시 0→1강은 복구 비용 0, 1~7강은 결정화된 토템으로, 8·9강은 각각 피어나는·구원하는 오기에르의 가호 1개로 100% 복구됩니다(사용자 제공값)."
};

// 전승의 고리: 등급별 잠재력 각성 단계당 필요 수량(봉인된 전승의 고리)과
// 공격력·방어력 증가치(각 스탯에 동일하게 적용되는 근사 전투력 지표).
// 출처: 모험가 가이드 > 가문 전투력 > 전승의 고리 (wikiNo=4009), 2026-07-27 확인.
export const RING_GRADE_ORDER = ["심연", "태고", "혼돈", "공허"];
export const RING_QTY_PER_STEP = {
  "심연": [1, 2, 4],
  "태고": [8, 16, 32, 64],
  "혼돈": [64, 64, 128, 128, 256, 256, 512, 512, 1024, 1024],
  "공허": [1024, 1024, 1024, 1024, 1024, 1024, 1024, 1024, 1024, 1024]
};
export const RING_STAT_AT_STEP = {
  "심연": [5, 10, 15, 20],
  "태고": [30, 45, 65, 90, 120],
  "혼돈": [180, 217, 255, 297, 340, 390, 440, 500, 560, 635, 710],
  "공허": [860, 935, 1010, 1085, 1160, 1235, 1310, 1385, 1460, 1535, 1610]
};
export const RING_GRADE_UP = {
  "심연": { requiredStep: 3, to: "태고", materials: { "용연향": 1 } },
  "태고": { requiredStep: 4, to: "혼돈", materials: { "용연향": 3, "혼돈의 축": 5, "아크라드": 10 } },
  "혼돈": { requiredStep: 10, to: "공허", materials: { "용연향": 5, "공허의 눈": 10, "아크라드": 30 } }
};
// 전승의 고리 각성 1회 시도마다 봉인된 전승의 고리 외에 직접 소모되는 은화(단계·등급 무관 고정).
// 사용자 제공값, 2026-07-28 확인.
export const RING_ATTEMPT_SILVER = 5000;

// 밤·달빛 영혼석: 등급 없이 단일 곡선, 자동 계산.
export const SOUL_ITEMS = [
  { id: "nightsoul", name: "밤의 영혼석", material: "밤의 영혼석 강화 재료" },
  { id: "moonsoul", name: "달빛 영혼석", material: "달빛 영혼석 강화 재료" }
];

// 밤·달빛 영혼석 0강→목표 단계 재료 기대 개수 — 실패하면 0강으로 떨어지되 그 단계의 "복구 재료"를
// 1개 받고, 그 단계에서 이미 복구 재료를 갖고 있다면 그걸 소모해 0강 대신 그 단계로 즉시
// 복구되는 방식입니다(사용자 확인, 2026-07-29). 이 규칙 아래에서는 단계별 기댓값을 단순 재귀식
// 으로 이어붙이면 낮은 단계에 쌓인 복구 재료 효과를 못 잡아내 큰 오차가 생깁니다(15강 기준
// 재귀식 근사값이 실제보다 +157% 부풀려짐) — 그래서 몬테카를로 시뮬레이션(51% 성공확률, 목표
// 단계별 200만 회 독립 시행)으로 직접 구한 평균값을 그대로 씁니다. 배열 인덱스 = 목표 단계
// (0강은 0개). 95% 신뢰구간 폭은 가장 큰 15강도 ±2 미만으로 안정적입니다.
export const SOUL_CUMULATIVE_QTY_TABLE = [
  0, 1.959, 5.181, 10.337, 18.397, 30.774, 49.58, 77.882, 120.394,
  183.494, 277.609, 417.603, 624.716, 933.295, 1388.253, 2062.625
];

// 조화의 연금석 실패 시 복구 비용(은화) — 0~4강 45,000, 5~9강 90,000, ... 5단계마다 45,000씩
// 증가합니다. 돌파 복구권 개수는 미공개라 은화만 실수치이고(ticket 배열 없음), maxLevel(40)
// 만큼 생성합니다. 등급(혼돈/공허) 무관 공통 수치입니다. 사용자 제공값, 2026-07-29 확인.
const ALCHEMY_RECOVERY_SILVER = Array.from({ length: 40 }, function (_, level) {
  return 45000 * (Math.floor(level / 5) + 1);
});
export const ALCHEMY_RECOVERY_TABLE = {
  "혼돈": { silver: ALCHEMY_RECOVERY_SILVER }, "공허": { silver: ALCHEMY_RECOVERY_SILVER }
};

// 전투력 1당 증가치가 고정(또는 근사)된 항목, 그리고 "동일 아이템 소모 + 실패 시 초기화"
// 방식이라 확률 기댓값 대신 직접 입력하는 항목 — 모두 같은 구조(레벨/단계, 재료, 회당 개수, 전투력)로 다룹니다.
export const FAMILY_ITEMS = [
  // 회당 소모량(qtyPerAttempt)은 기본 재료(defaultMaterial) 기준 사용자 제공값입니다.
  // 고결한 여신의 눈물/태양의 결정은 거래소에서 구매할 수 없어(UNPRICED_MATERIALS) 선택지에서
  // 뺐습니다(사용자 확인, 2026-07-29) — 여신의 눈물/혼돈의 결정만 남습니다.
  // freeMaterialUntilLevel: 뉴비 전용 무료 재료로 대체되는 구간(사용자 확인, 2026-07-31) — 그
  // 레벨 미만이면 무료 재료(구매 불가, 0원)를 쓰고, 도달하면 원래 재료로 돌아갑니다.
  { id: "sylvia", name: "실비아 여신상", maxLevel: 500, cpPerLevel: 20, cpEditable: false,
    materialOptions: ["여신의 눈물"], defaultMaterial: "여신의 눈물", qtyPerAttempt: 1201057,
    freeMaterialUntilLevel: { material: "파도치는 여신의 눈물", maxLevel: 80 } },
  { id: "balance", name: "균형의 돌", maxLevel: 900, cpPerLevel: 10, cpEditable: false,
    materialOptions: ["혼돈의 결정"], defaultMaterial: "혼돈의 결정", qtyPerAttempt: 42355,
    freeMaterialUntilLevel: { material: "타오르는 혼돈의 결정", maxLevel: 200 } },
  // 심연 등급 없이 태고부터 다룹니다. 등급업(태고→혼돈)이 가능해 gradeOptions를 둡니다.
  { id: "lightstone", name: "광원석", maxLevel: 20, maxLevelByGrade: { "태고": 20, "혼돈": 20 },
    gradeOptions: ["태고", "혼돈"], cpPerLevel: 10, cpEditable: true, cpTable: LIGHTSTONE_CP_TABLE,
    materialOptions: ["태초의 원소", "혼돈의 원소"], defaultMaterial: "태초의 원소",
    materialByGrade: { "태고": "태초의 원소", "혼돈": "혼돈의 원소" },
    anvilTable: ANCIENT_ANVIL.lightstone, recoveryKey: "lightstone", recoveryTable: LIGHTSTONE_RECOVERY_TABLE },
  { id: "emblem", name: "휘장", maxLevel: 50, maxLevelByGrade: { "태고": 30, "혼돈": 50, "공허": 50 },
    cpPerLevel: 20, cpEditable: true, cpTable: EMBLEM_CP_TABLE,
    materialOptions: ["영광의 증표"], defaultMaterial: "영광의 증표", qtyPerAttempt: 81301 },
  // 휘장 장식 5종 — 투스의 숨결로 강화(고대의 모루 확정 시도 있음), 실패해도 단계가 하락하지
  // 않아 복구가 필요 없습니다(noRecovery, 최대 150단계). 해금 전(EMBLEM_DECORATION_UNLOCK 조건
  // 미충족)에는 스펙업 표에 노출하지 않습니다. 전투력 증가치는 공격력 또는 방어력 중 하나이며,
  // 단계(레벨)가 오른 만큼 그대로 오릅니다(1단계당 1). 철벽·투지는 100단계부터 성공당 단계가
  // 2씩 올라(150성공째 200단계) 그만큼 전투력도 2씩 오릅니다 — 사용자 확인, 2026-07-31.
  // 출처: 공식 가이드(wikiNo=1001008, 2026-07-31 확인).
  { id: "emblemDeco1", name: "휘장 장식(용맹)", maxLevel: 150, cpTable: EMBLEM_DECO_CP_TABLE_STANDARD, // 공격력
    materialOptions: ["투스의 숨결"], defaultMaterial: "투스의 숨결",
    anvilTable: EMBLEM_DECORATION_ANVIL, qtyPerAttemptTable: EMBLEM_DECORATION_TICKET_QTY, noRecovery: true },
  { id: "emblemDeco2", name: "휘장 장식(침착)", maxLevel: 150, cpTable: EMBLEM_DECO_CP_TABLE_STANDARD, // 방어력
    materialOptions: ["투스의 숨결"], defaultMaterial: "투스의 숨결",
    anvilTable: EMBLEM_DECORATION_ANVIL, qtyPerAttemptTable: EMBLEM_DECORATION_TICKET_QTY, noRecovery: true },
  { id: "emblemDeco3", name: "휘장 장식(격렬)", maxLevel: 150, cpTable: EMBLEM_DECO_CP_TABLE_STANDARD, // 공격력
    materialOptions: ["투스의 숨결"], defaultMaterial: "투스의 숨결",
    anvilTable: EMBLEM_DECORATION_ANVIL, qtyPerAttemptTable: EMBLEM_DECORATION_TICKET_QTY, noRecovery: true },
  { id: "emblemDeco4", name: "휘장 장식(철벽)", maxLevel: 150, cpTable: EMBLEM_DECO_CP_TABLE_ACCEL, // 방어력
    materialOptions: ["투스의 숨결"], defaultMaterial: "투스의 숨결",
    anvilTable: EMBLEM_DECORATION_ANVIL, qtyPerAttemptTable: EMBLEM_DECORATION_TICKET_QTY, noRecovery: true },
  { id: "emblemDeco5", name: "휘장 장식(투지)", maxLevel: 150, cpTable: EMBLEM_DECO_CP_TABLE_ACCEL, // 공격력
    materialOptions: ["투스의 숨결"], defaultMaterial: "투스의 숨결",
    anvilTable: EMBLEM_DECORATION_ANVIL, qtyPerAttemptTable: EMBLEM_DECORATION_TICKET_QTY, noRecovery: true },
  // 카라자드(신성 등급)는 공허 등급 각성 완료 +9·+10단계에서 별도 재료를 소모해 제작하는
  // 최상위 승급 경로입니다(위 KARAZAD_CRAFT/KARAZAD_ITEM_MATERIAL/KARAZAD_BREAKTHROUGH_CURVE
  // 참고). maxLevel은 태고/혼돈/공허와 동일한 10이라 별도 maxLevelByGrade는 두지 않았습니다.
  // 카라자드 등급의 돌파 재료도 동일 부위 "카라자드 X" +0 아이템 자기소모라 materialByGrade로
  // 등급 전환 시 자동으로 바뀌게 했습니다.
  { id: "ring1", name: "반지", maxLevel: 10, gradeOptions: ["태고", "혼돈", "공허", "카라자드"],
    cpPerLevel: 10, cpEditable: true, cpTable: ACCESSORY_CP_TABLE, cpTableKey: "ring1",
    materialOptions: ["카프라스 반지", "카라자드 반지"], defaultMaterial: "카프라스 반지",
    materialByGrade: { "태고": "카프라스 반지", "혼돈": "카프라스 반지", "공허": "카프라스 반지", "카라자드": "카라자드 반지" },
    anvilTable: ANCIENT_ANVIL.accessory, recoveryKey: "accessory", recoveryTable: ACCESSORY_RECOVERY_TABLE },
  { id: "necklace", name: "목걸이", maxLevel: 10, gradeOptions: ["태고", "혼돈", "공허", "카라자드"],
    cpPerLevel: 10, cpEditable: true, cpTable: ACCESSORY_CP_TABLE, cpTableKey: "necklace",
    materialOptions: ["카프라스 목걸이", "카라자드 목걸이"], defaultMaterial: "카프라스 목걸이",
    materialByGrade: { "태고": "카프라스 목걸이", "혼돈": "카프라스 목걸이", "공허": "카프라스 목걸이", "카라자드": "카라자드 목걸이" },
    anvilTable: ANCIENT_ANVIL.accessory, recoveryKey: "accessory", recoveryTable: ACCESSORY_RECOVERY_TABLE },
  { id: "belt", name: "허리띠", maxLevel: 10, gradeOptions: ["태고", "혼돈", "공허", "카라자드"],
    cpPerLevel: 10, cpEditable: true, cpTable: ACCESSORY_CP_TABLE, cpTableKey: "belt",
    materialOptions: ["카프라스 허리띠", "카라자드 허리띠"], defaultMaterial: "카프라스 허리띠",
    materialByGrade: { "태고": "카프라스 허리띠", "혼돈": "카프라스 허리띠", "공허": "카프라스 허리띠", "카라자드": "카라자드 허리띠" },
    anvilTable: ANCIENT_ANVIL.accessory, recoveryKey: "accessory", recoveryTable: ACCESSORY_RECOVERY_TABLE },
  { id: "earring", name: "귀걸이", maxLevel: 10, gradeOptions: ["태고", "혼돈", "공허", "카라자드"],
    cpPerLevel: 10, cpEditable: true, cpTable: ACCESSORY_CP_TABLE, cpTableKey: "earring",
    materialOptions: ["카프라스 귀걸이", "카라자드 귀걸이"], defaultMaterial: "카프라스 귀걸이",
    materialByGrade: { "태고": "카프라스 귀걸이", "혼돈": "카프라스 귀걸이", "공허": "카프라스 귀걸이", "카라자드": "카라자드 귀걸이" },
    anvilTable: ANCIENT_ANVIL.accessory, recoveryKey: "accessory", recoveryTable: ACCESSORY_RECOVERY_TABLE },
  { id: "bracelet", name: "팔찌", maxLevel: 10, gradeOptions: ["태고", "혼돈", "공허", "카라자드"],
    cpPerLevel: 10, cpEditable: true, cpTable: ACCESSORY_CP_TABLE, cpTableKey: "bracelet",
    materialOptions: ["카프라스 팔찌", "카라자드 팔찌"], defaultMaterial: "카프라스 팔찌",
    materialByGrade: { "태고": "카프라스 팔찌", "혼돈": "카프라스 팔찌", "공허": "카프라스 팔찌", "카라자드": "카라자드 팔찌" },
    anvilTable: ANCIENT_ANVIL.accessory, recoveryKey: "accessory", recoveryTable: ACCESSORY_RECOVERY_TABLE },
  // 균열의 토템 기준 — 등급별 돌파 재료·최대 단계가 다릅니다(태고: 주술의 근원/+40,
  // 혼돈: 혼돈의 핵/+20, 공허: 공허의 주술핵/+40). 출처: 공식 가이드(wikiNo=4006).
  { id: "totem", name: "토템(균열의 토템)", maxLevel: 40, maxLevelByGrade: { "태고": 40, "혼돈": 20, "공허": 40 },
    cpPerLevel: 10, cpEditable: true, cpTable: TOTEM_CP_TABLE,
    qtyPerAttemptTableByGrade: { "공허": TOTEM_VOID_QTY_PER_ATTEMPT },
    materialOptions: ["주술의 근원", "혼돈의 핵", "공허의 주술핵"], defaultMaterial: "주술의 근원",
    materialByGrade: { "태고": "주술의 근원", "혼돈": "혼돈의 핵", "공허": "공허의 주술핵" } },
  // 균열의 토템 — 등급 구분 없이 0~10단계인 별도 항목. 회당 소모량은 정보가 없어 결정화된
  // 토템 1개(더미)로 가정합니다.
  { id: "riftTotem", name: "균열의 토템", maxLevel: 10, gradeOptions: ["기본"],
    cpPerLevel: 10, cpEditable: true, cpTable: { "기본": RIFT_TOTEM_CP_TABLE },
    materialOptions: ["결정화된 토템"], defaultMaterial: "결정화된 토템",
    anvilTable: RIFT_TOTEM_ANVIL, recoveryKey: "riftTotem",
    recoveryMaterial: RIFT_TOTEM_RECOVERY_MATERIAL, recoveryQtyByLevel: RIFT_TOTEM_RECOVERY_QTY },
  // 조화의 연금석 기준 — 태고 등급 없이 혼돈부터 시작하는 별도 4슬롯 결합 아이템입니다.
  // 공허 등급은 돌파 단계마다 공격력+5/방어력+5(=전투력 근사 10)가 공식 문서에 명시돼 있습니다.
  // 출처: 공식 가이드(wikiNo=4007).
  // 돌파 재료는 등급별 재료(시간의 고리/영겁의 고리, 유료 재화) 1개 + 조화의 빛(구매 가능) 1개를
  // 시도마다 함께 소모합니다(extraMaterial, 사용자 확인 2026-07-29). 재료 선택 드롭다운은 없애고
  // 등급별 자동 재료(materialByGrade)만 씁니다.
  { id: "alchemy", name: "조화의 연금석", maxLevel: 40, maxLevelByGrade: { "혼돈": 40, "공허": 40 },
    gradeOptions: ["혼돈", "공허"], cpPerLevel: 10, cpEditable: true,
    materialOptions: ["시간의 고리", "영겁의 고리"], defaultMaterial: "시간의 고리",
    materialByGrade: { "혼돈": "시간의 고리", "공허": "영겁의 고리" }, extraMaterial: "조화의 빛",
    anvilTable: ANCIENT_ANVIL.harmonyAlchemy, recoveryKey: "harmonyAlchemy", recoveryTable: ALCHEMY_RECOVERY_TABLE },
  // 태고·혼돈 등급 유물은 10단계까지 돌파합니다(희귀~심연 등급은 5단계뿐이지만 이 계산기는
  // 태고 이상만 다룹니다). 출처: 공식 확률 안내(wikiNo=1001004).
  { id: "relic1", name: "유물1", maxLevel: 10, cpPerLevel: 10, cpEditable: true, cpTable: RELIC_CP_TABLE,
    materialOptions: ["유물1(강화용 동일품)"], defaultMaterial: "유물1(강화용 동일품)", anvilTable: ANCIENT_ANVIL.relic, recoveryKey: "relic", recoveryTable: RELIC_RECOVERY_TABLE,
    hasSeries: true },
  { id: "relic2", name: "유물2", maxLevel: 10, cpPerLevel: 10, cpEditable: true, cpTable: RELIC_CP_TABLE,
    materialOptions: ["유물2(강화용 동일품)"], defaultMaterial: "유물2(강화용 동일품)", anvilTable: ANCIENT_ANVIL.relic, recoveryKey: "relic", recoveryTable: RELIC_RECOVERY_TABLE,
    hasSeries: true },
  // 문양 각인서 — 강화 반복이 아니라 "다음 등급 책으로 교체 구매"가 스펙업 액션입니다(아래
  // computeInsigniaGradeUp 참고). statRangeByGrade는 ①탭에서 현재 보유 감정 결과(공격력/방어력)를
  // 직접 고르는 드랍다운 범위입니다.
  { id: "insigniaBook", name: "문양 각인서", gradeOptions: ["심연", "태고", "혼돈"],
    statRangeByGrade: { atk: INSIGNIA_BOOK_ATK_RANGE, def: INSIGNIA_BOOK_DEF_RANGE },
    materialOptions: ["심연 미확인 문양 각인서", "태고 미확인 문양 각인서", "혼돈 미확인 문양 각인서"],
    defaultMaterial: "심연 미확인 문양 각인서",
    materialByGrade: { "심연": "심연 미확인 문양 각인서", "태고": "태고 미확인 문양 각인서", "혼돈": "혼돈 미확인 문양 각인서" } }
];

// ①탭 첫 입력을 쉽게 해주는 프리셋 — 장비(주무기~신발)·장신구(반지~팔찌)·유물에만 적용되고
// (사용자가 지정한 범위), 그 외 항목(휘장·토템·조화의 연금석·광원석·문양 각인서·전승의 고리·
// 실비아 여신상·균형의 돌·카라자드)은 건드리지 않습니다. relic이 null이면 유물은 그대로 둡니다.
// 사용자 확인, 2026-07-31.
export const GEAR_PRESETS = [
  {
    id: "postseason", name: "시즌 졸업 직후",
    desc: "혼돈 장비 +6 · 혼돈 장신구 +1 · 태고 유물 각성 +7",
    equip: { grade: "혼돈", step: 6, awakened: false },
    accessory: { grade: "혼돈", level: 1, awakened: false },
    relic: { grade: "태고", level: 7, awakened: true }
  },
  {
    id: "voidEntry", name: "공허 장비 진입",
    desc: "공허 장비 +7 · 혼돈 장신구 +7",
    equip: { grade: "공허", step: 7, awakened: false },
    accessory: { grade: "혼돈", level: 7, awakened: false },
    relic: null
  },
  {
    id: "karazadPrep", name: "카라자드 준비",
    desc: "공허 장비 +8 · 공허 장신구 +9",
    equip: { grade: "공허", step: 8, awakened: false },
    accessory: { grade: "공허", level: 9, awakened: false },
    relic: null
  },
  {
    id: "topTier", name: "최상위 성장 구간",
    desc: "공허 장비 +9 이상 · 카라자드 장신구",
    equip: { grade: "공허", step: 9, awakened: false },
    accessory: { grade: "카라자드", level: 0, awakened: false },
    relic: null
  }
];
