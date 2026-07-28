// 데이터 계층 — 게임 밸런스 상수(장비/장신구 등급, 잠재력 돌파 곡선, 각성 재료, 고대의 모루 표 등).
// 거래소 시세처럼 자주 바뀌지 않는 "게임 패치에 종속된" 값이라 시세(data/prices.json)와는
// 분리해 이 모듈에 코드로 둡니다. 값의 출처는 각 상수 위 주석을 참고하세요.

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

// 잠재력 돌파 확률표 (%), 인덱스 i = (i)->(i+1) 단계
export const EQUIP_BREAKTHROUGH_CURVE = [70, 60, 40, 20, 10, 7, 5, 3, 1, 0.5]; // 태고·혼돈·새벽(공허)의 장비 표준 곡선
export const SOUL_BREAKTHROUGH_CURVE = Array(15).fill(51); // 밤/달빛 영혼석: 전 구간 51%

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
    "혼돈": { materials: { "균열의 열기": 20, "홍익의 불꽃": 1, "공허의 눈": 20 }, silver: 0, prereq: "+20 혼돈의 균열 토템 달성" }
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
  },
  // 광원석은 심연→태고→혼돈 3등급뿐이며 공허 등급이 없습니다. 태고→혼돈 제작 시 재료로 쓰는
  // 태고 광원석의 강화 단계가 높을수록(+14~+20) 혼돈의 원소 소모량이 줄어드는데(40개→1개),
  // 여기서는 최소 요구치인 +14단계 기준(가장 비용이 큰 경우)으로 계산합니다.
  lightstone: {
    "태고": { materials: { "혼돈의 원소": 40, "혼돈의 축": 5, "아크라드": 10 }, silver: 0, prereq: "강화 +14단계 이상 태고 광원석 보유(단계가 높을수록 혼돈의 원소 소모량 감소)" }
  }
};

// 고대의 모루(wikiNo=4021) — 강화 실패마다 "기운"이 쌓이고, 기운이 표의 최대치에 도달하면
// 다음 시도는 확정 성공합니다. 확률 데이터가 없는 항목은 "기운이 가득 찰 때까지의 시도 횟수"를
// 그대로 필요 시도 횟수로 가정해 계산합니다(성공률이 그보다 좋으면 실제 비용은 더 낮아질 수 있는
// 보수적 상한치). 배열 인덱스 = 시작 단계, 값 = 확정 성공까지 필요한 시도 횟수(기운 최대치).
// "-"(모루 불필요, 사실상 100% 성공)로 표시된 구간은 1회로 처리했습니다.
export const ANCIENT_ANVIL = {
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
  relicSeries: [10, 20, 34, 34, 50, 50, 100, 100, 200, 200, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40]
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

// 유물 잠재력 돌파(신화급 이상 = 태고/혼돈/공허 공통) 실패 시 복구 비용. 4강부터 고정.
// +10강(마지막 단계) 복구 비용은 원자료에 없어 +4~+9와 동일하다고 가정했습니다.
const RELIC_RECOVERY_VALUES = {
  silver: [1370000000, 1920000000, 3840000000, 5480000000, 5480000000, 5480000000, 5480000000, 5480000000, 5480000000, 5480000000],
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

// 복구 방식은 항목마다 다릅니다. 출처: 공식 가이드
// (장신구 wikiNo=4004 "은화 및 돌파 복구권을 소모하면 복구", 광원석 wikiNo=4013/조화의 연금석
// wikiNo=4007 "은화 또는 돌파 복구권", 공허 유물 계열 돌파 wikiNo=4005 "차원의 조각 250개
// 혹은 돌파 복구권 25,000개"), 2026-07-27 확인. 유물 기본 잠재력 돌파는 이후 21편에서
// "은화 또는 돌파 복구권 중 하나만 있으면 복구"로 확인돼(AND가 아닌 OR) 문구를 수정했습니다.
export const RECOVERY_NOTES = {
  accessory: "실패 시 은화 + 돌파 복구권을 함께 소모해야 복구됩니다(정확한 개수는 미공개). 기본은 은화만 반영해뒀고, 복구권도 실제로 필요하니 아신다면 개수를 추가로 입력하세요.",
  relic: "실패 시 은화 또는 돌파 복구권 중 하나만 있으면 복구됩니다. 아래 금액은 원자료 실수치이며 기본적으로 은화만 사용하는 것으로 계산했습니다 — 복구권으로만 복구하실 거면 실패당 은화 입력칸을 직접 0으로 바꾸세요.",
  harmonyAlchemy: "실패 시 은화 또는 돌파 복구권 중 하나만 있으면 복구됩니다(정확한 개수는 미공개). 기본은 은화 사용으로 가정했습니다 — 복구권으로만 복구하실 거면 은화 칸을 0으로 지우고 복구권 칸에 입력하세요.",
  lightstone: "실패 시 은화 또는 돌파 복구권 중 하나만 있으면 복구됩니다. 혼돈 등급은 아래 금액이 원자료 실수치(1~9강/10~19강 두 구간)이며 기본적으로 은화만 사용하는 것으로 계산했습니다. 태고 등급은 정확한 개수가 미공개라 직접 입력이 필요합니다."
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

// 밤·달빛 영혼석: 등급 없이 단일 곡선, 자동 계산.
export const SOUL_ITEMS = [
  { id: "nightsoul", name: "밤의 영혼석", material: "밤의 영혼석 강화 재료" },
  { id: "moonsoul", name: "달빛 영혼석", material: "달빛 영혼석 강화 재료" }
];

// 전투력 1당 증가치가 고정(또는 근사)된 항목, 그리고 "동일 아이템 소모 + 실패 시 초기화"
// 방식이라 확률 기댓값 대신 직접 입력하는 항목 — 모두 같은 구조(레벨/단계, 재료, 회당 개수, 전투력)로 다룹니다.
export const FAMILY_ITEMS = [
  { id: "sylvia", name: "실비아 여신상", maxLevel: 500, cpPerLevel: 20, cpEditable: false,
    materialOptions: ["여신의 눈물", "고결한 여신의 눈물"], defaultMaterial: "여신의 눈물" },
  { id: "balance", name: "균형의 돌", maxLevel: 900, cpPerLevel: 10, cpEditable: false,
    materialOptions: ["혼돈의 결정", "태양의 결정"], defaultMaterial: "혼돈의 결정" },
  // 심연 등급 없이 태고부터 다룹니다. 등급업(태고→혼돈)이 가능해 gradeOptions를 둡니다.
  { id: "lightstone", name: "광원석", maxLevel: 20, maxLevelByGrade: { "태고": 20, "혼돈": 20 },
    gradeOptions: ["태고", "혼돈"], cpPerLevel: 10, cpEditable: true, cpTable: LIGHTSTONE_CP_TABLE,
    materialOptions: ["태초의 원소", "혼돈의 원소"], defaultMaterial: "태초의 원소",
    materialByGrade: { "태고": "태초의 원소", "혼돈": "혼돈의 원소" },
    anvilTable: ANCIENT_ANVIL.lightstone, recoveryKey: "lightstone", recoveryTable: LIGHTSTONE_RECOVERY_TABLE },
  { id: "emblem", name: "휘장", maxLevel: 50, maxLevelByGrade: { "태고": 30, "혼돈": 50, "공허": 50 },
    cpPerLevel: 20, cpEditable: true, cpTable: EMBLEM_CP_TABLE,
    materialOptions: ["영광의 증표"], defaultMaterial: "영광의 증표" },
  { id: "ring1", name: "반지", maxLevel: 10, cpPerLevel: 10, cpEditable: true, cpTable: ACCESSORY_CP_TABLE, cpTableKey: "ring1",
    materialOptions: ["반지(강화용 동일품)"], defaultMaterial: "반지(강화용 동일품)", anvilTable: ANCIENT_ANVIL.accessory, recoveryKey: "accessory" },
  { id: "necklace", name: "목걸이", maxLevel: 10, cpPerLevel: 10, cpEditable: true, cpTable: ACCESSORY_CP_TABLE, cpTableKey: "necklace",
    materialOptions: ["목걸이(강화용 동일품)"], defaultMaterial: "목걸이(강화용 동일품)", anvilTable: ANCIENT_ANVIL.accessory, recoveryKey: "accessory" },
  { id: "belt", name: "허리띠", maxLevel: 10, cpPerLevel: 10, cpEditable: true, cpTable: ACCESSORY_CP_TABLE, cpTableKey: "belt",
    materialOptions: ["허리띠(강화용 동일품)"], defaultMaterial: "허리띠(강화용 동일품)", anvilTable: ANCIENT_ANVIL.accessory, recoveryKey: "accessory" },
  { id: "earring", name: "귀걸이", maxLevel: 10, cpPerLevel: 10, cpEditable: true, cpTable: ACCESSORY_CP_TABLE, cpTableKey: "earring",
    materialOptions: ["귀걸이(강화용 동일품)"], defaultMaterial: "귀걸이(강화용 동일품)", anvilTable: ANCIENT_ANVIL.accessory, recoveryKey: "accessory" },
  { id: "bracelet", name: "팔찌", maxLevel: 10, cpPerLevel: 10, cpEditable: true, cpTable: ACCESSORY_CP_TABLE, cpTableKey: "bracelet",
    materialOptions: ["팔찌(강화용 동일품)"], defaultMaterial: "팔찌(강화용 동일품)", anvilTable: ANCIENT_ANVIL.accessory, recoveryKey: "accessory" },
  // 균열의 토템 기준 — 등급별 돌파 재료·최대 단계가 다릅니다(태고: 주술의 근원/+40,
  // 혼돈: 혼돈의 핵/+20, 공허: 공허의 주술핵/+40). 출처: 공식 가이드(wikiNo=4006).
  { id: "totem", name: "토템(균열의 토템)", maxLevel: 40, maxLevelByGrade: { "태고": 40, "혼돈": 20, "공허": 40 },
    cpPerLevel: 10, cpEditable: true, cpTable: TOTEM_CP_TABLE,
    materialOptions: ["주술의 근원", "혼돈의 핵", "공허의 주술핵"], defaultMaterial: "주술의 근원",
    materialByGrade: { "태고": "주술의 근원", "혼돈": "혼돈의 핵", "공허": "공허의 주술핵" } },
  // 조화의 연금석 기준 — 태고 등급 없이 혼돈부터 시작하는 별도 4슬롯 결합 아이템입니다.
  // 공허 등급은 돌파 단계마다 공격력+5/방어력+5(=전투력 근사 10)가 공식 문서에 명시돼 있습니다.
  // 출처: 공식 가이드(wikiNo=4007).
  { id: "alchemy", name: "조화의 연금석", maxLevel: 40, maxLevelByGrade: { "혼돈": 40, "공허": 40 },
    gradeOptions: ["혼돈", "공허"], cpPerLevel: 10, cpEditable: true,
    materialOptions: ["시간의 고리", "영겁의 고리", "조화의 빛"], defaultMaterial: "시간의 고리",
    materialByGrade: { "혼돈": "시간의 고리", "공허": "영겁의 고리" },
    anvilTable: ANCIENT_ANVIL.harmonyAlchemy, recoveryKey: "harmonyAlchemy" },
  // 태고·혼돈 등급 유물은 10단계까지 돌파합니다(희귀~심연 등급은 5단계뿐이지만 이 계산기는
  // 태고 이상만 다룹니다). 출처: 공식 확률 안내(wikiNo=1001004).
  { id: "relic1", name: "유물1", maxLevel: 10, cpPerLevel: 10, cpEditable: true, cpTable: RELIC_CP_TABLE,
    materialOptions: ["유물1(강화용 동일품)"], defaultMaterial: "유물1(강화용 동일품)", anvilTable: ANCIENT_ANVIL.relic, recoveryKey: "relic", recoveryTable: RELIC_RECOVERY_TABLE,
    hasSeries: true },
  { id: "relic2", name: "유물2", maxLevel: 10, cpPerLevel: 10, cpEditable: true, cpTable: RELIC_CP_TABLE,
    materialOptions: ["유물2(강화용 동일품)"], defaultMaterial: "유물2(강화용 동일품)", anvilTable: ANCIENT_ANVIL.relic, recoveryKey: "relic", recoveryTable: RELIC_RECOVERY_TABLE,
    hasSeries: true }
];
