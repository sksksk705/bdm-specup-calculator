// 공식 모험가 가이드·패치노트 이미지 매핑. 강화 단계와 전투력은 gameData.js와 사용자 상태를 사용합니다.
export const ITEM_GROUPS = [
  { label: "장비", ids: ["mainhand","offhand","helmet","armor","gloves","shoes"] },
  { label: "장신구", ids: ["ring1","necklace","belt","earring","bracelet"] },
  { label: "가문 · 특수", ids: ["emblem","heritageRing","totem","riftTotem","alchemy","relic1","relic2","relicSeries1","relicSeries2","insigniaBook","nightsoul","moonsoul","lightstone","sylvia","balance","emblemDeco1","emblemDeco2","emblemDeco3","emblemDeco4","emblemDeco5"] },
];

export const ITEM_VISUALS = {
  mainhand: { name: "주무기", note: "직업별 외형 중 대표 무기 이미지입니다.", grades: {
    "혼돈": {"icon":"mainhand-chaos-icon.webp","art":"mainhand-chaos-art.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4001","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/c838638125020240805114618011.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=608719"},
    "공허": {"icon":"mainhand-chaos-icon.webp","art":"mainhand-eternal-art.webp","name":"새벽의 주무기","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4001","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/242379e231220240827164826100.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=608719"},
  } },
  offhand: { name: "보조무기", note: "직업별 외형 중 비녀칼 이미지입니다.", grades: {
    "혼돈": {"icon":"offhand-chaos-icon.webp","art":"offhand-chaos-art.webp","source":"https://forum.blackdesertm.com/Board/Detail?boardNo=7&contentNo=573119","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/Contents/a4b1bcc616120231024112821324.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=608719"},
    "공허": {"icon":"offhand-chaos-icon.webp","art":"offhand-eternal-art.webp","name":"새벽의 보조무기","source":"https://forum.blackdesertm.com/Board/Detail?boardNo=7&contentNo=573119","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/Contents/9a0b8922a0a20231024112803183.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=608719"},
  } },
  helmet: { name: "투구", grades: {
    "혼돈": {"icon":"helmet-chaos-icon.webp","art":"helmet-chaos-art.webp","source":"https://forum.blackdesertm.com/Board/Detail?boardNo=7&contentNo=597137","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/Contents/8c1a16db91820240415144331758.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=608719"},
    "공허": {"icon":"helmet-chaos-icon.webp","art":"helmet-eternal-art.webp","name":"새벽의 투구","source":"https://forum.blackdesertm.com/Board/Detail?boardNo=7&contentNo=597137","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/Contents/89566412a9f20240415144239170.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=608719"},
  } },
  armor: { name: "갑옷", grades: {
    "혼돈": {"icon":"armor-chaos-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4001","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/256e1ee721420240805183210595.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=608719"},
    "공허": {"icon":"armor-chaos-icon.webp","art":"armor-eternal-art.webp","name":"새벽의 갑옷","source":"https://forum.blackdesertm.com/Board/Detail?boardNo=7&contentNo=597137","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/Contents/773d196506e20240415144418292.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=608719"},
  } },
  gloves: { name: "장갑", note: "혼돈 원본의 +5는 캡처 당시의 강화 단계입니다.", grades: {
    "혼돈": {"icon":"gloves-chaos-icon.webp","art":"gloves-chaos-art.webp","source":"https://forum.blackdesertm.com/Board/Detail?boardNo=7&contentNo=567150","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/Contents/697487351fe20230911223541162.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=608719"},
    "공허": {"icon":"gloves-chaos-icon.webp","art":"gloves-eternal-art.webp","name":"새벽의 장갑","source":"https://forum.blackdesertm.com/Board/Detail?boardNo=7&contentNo=567150","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/Contents/697487351fe20230911223541162.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=608719"},
  } },
  shoes: { name: "신발", grades: {
    "혼돈": {"icon":"shoes-chaos-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4001","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/256e1ee721420240805183210595.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=608719"},
    "공허": {"icon":"shoes-chaos-icon.webp","art":"shoes-eternal-art.webp","name":"새벽의 신발","source":"https://forum.blackdesertm.com/Board/Detail?boardNo=7&contentNo=573119","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/Contents/38191c5667920231024112758882.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=608719"},
  } },
  ring1: { name: "반지", grades: {
    "태고": {"icon":"ring1-primal-icon.webp","art":"ring1-primal-art.webp","name":"카프라스의 반지","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4004","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/35d4fbfd2d220240805101552545.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=611130"},
    "혼돈": {"icon":"ring1-primal-icon.webp","art":"ring1-chaos-art.webp","name":"혼돈의 반지","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4004","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/93b0f00211a20240805101555659.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=611130"},
    "공허": {"icon":"ring1-primal-icon.webp","art":"ring1-eternal-art.webp","name":"공허의 반지","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4004","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/ec07c8d1f5b20240805101714791.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=611130"},
    "카라자드": {"icon":"ring1-primal-icon.webp","art":"ring1-karajad-art.webp","name":"카라자드 반지","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4004","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/81c0ba83c5320260210144454360.png"},
  } },
  necklace: { name: "목걸이", grades: {
    "태고": {"icon":"necklace-primal-icon.webp","name":"카프라스의 목걸이","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4004","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/50cb5723abd20240805183514348.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=611130"},
    "혼돈": {"icon":"necklace-primal-icon.webp","art":"necklace-chaos-art.webp","name":"혼돈의 목걸이","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=457244","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/Contents/db30716a5e220210622113732778.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=611130"},
    "공허": {"icon":"necklace-primal-icon.webp","art":"necklace-eternal-art.webp","name":"공허의 목걸이","source":"https://forum.blackdesertm.com/Board/Detail?boardNo=7&contentNo=552743","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/Contents/b1a83a72d3120230605165343794.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=611130"},
    "카라자드": {"icon":"necklace-primal-icon.webp","art":"necklace-karajad-art.webp","name":"카라자드 목걸이","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4004","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/Contents/8be758e3d2220260210001416012.png"},
  } },
  belt: { name: "허리띠", grades: {
    "태고": {"icon":"belt-primal-icon.webp","name":"카프라스의 허리띠","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4004","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/50cb5723abd20240805183514348.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=611130"},
    "혼돈": {"icon":"belt-primal-icon.webp","art":"belt-chaos-art.webp","name":"혼돈의 허리띠","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=457244","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/Contents/2243334246520210622113721168.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=611130"},
    "공허": {"icon":"belt-primal-icon.webp","name":"공허의 허리띠","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4004","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/50cb5723abd20240805183514348.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=611130"},
    "카라자드": {"icon":"belt-primal-icon.webp","art":"belt-karajad-art.webp","name":"카라자드 허리띠","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4004","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/Contents/4f873e540a620260210001413869.png"},
  } },
  earring: { name: "귀걸이", grades: {
    "태고": {"icon":"earring-primal-icon.webp","name":"카프라스의 귀걸이","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4004","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/50cb5723abd20240805183514348.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=611130"},
    "혼돈": {"icon":"earring-primal-icon.webp","art":"earring-chaos-art.webp","name":"혼돈의 귀걸이","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=457244","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/Contents/db30716a5e220210622113732778.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=611130"},
    "공허": {"icon":"earring-primal-icon.webp","name":"공허의 귀걸이","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4004","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/50cb5723abd20240805183514348.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=611130"},
    "카라자드": {"icon":"earring-primal-icon.webp","art":"earring-karajad-art.webp","name":"카라자드 귀걸이","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4004","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/Contents/4f873e540a620260210001413869.png"},
  } },
  bracelet: { name: "팔찌", grades: {
    "태고": {"icon":"bracelet-primal-icon.webp","name":"카프라스의 팔찌","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4004","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/50cb5723abd20240805183514348.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=611130"},
    "혼돈": {"icon":"bracelet-primal-icon.webp","art":"bracelet-chaos-art.webp","name":"혼돈의 팔찌","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=457244","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/Contents/2243334246520210622113721168.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=611130"},
    "공허": {"icon":"bracelet-primal-icon.webp","name":"공허의 팔찌","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4004","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/50cb5723abd20240805183514348.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=611130"},
    "카라자드": {"icon":"bracelet-primal-icon.webp","art":"bracelet-karajad-art.webp","name":"카라자드 팔찌","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4004","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/Contents/4f873e540a620260210001413869.png"},
  } },
  emblem: { name: "휘장", note: "상세 원본의 숫자는 캡처 당시의 강화 단계입니다.", grades: {
    "태고": {"icon":"emblem-primal-icon.webp","art":"emblem-primal-art.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4008","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/1c97467d11920250214144707110.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=611130"},
    "혼돈": {"icon":"emblem-primal-icon.webp","art":"emblem-chaos-art.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4008","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/45f5c90dfcc20250214144721520.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=611130"},
    "공허": {"icon":"emblem-primal-icon.webp","art":"emblem-eternal-art.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4008","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/7600823a76a20250214144711815.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=611130"},
  } },
  heritageRing: { name: "전승의 고리", grades: {
    "심연": {"icon":"heritageRing-abyssal-icon.webp","art":"heritageRing-abyssal-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4009","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/8dc6fb4ba0920240806172321280.png"},
    "태고": {"icon":"heritageRing-primal-icon.webp","art":"heritageRing-primal-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4009","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/ea8aba89bc420240806172324295.png"},
    "혼돈": {"icon":"heritageRing-chaos-icon.webp","art":"heritageRing-chaos-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4009","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/da95e040e1720240806172326747.png"},
    "공허": {"icon":"heritageRing-eternal-icon.webp","art":"heritageRing-eternal-art.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4009","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/d4b8974708f20250731112859653.png"},
  } },
  totem: { name: "토템 (태고 이상)", grades: {
    "태고": {"icon":"totem-primal-icon.webp","art":"totem-primal-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4006","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/8cf8ea7b22820250213173921536.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=611130"},
    "혼돈": {"icon":"totem-chaos-icon.webp","art":"totem-chaos-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4006","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/b29c141c2b520250408160609834.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=611130"},
    "공허": {"icon":"totem-eternal-icon.webp","art":"totem-eternal-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4006","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/1ea729fc21a20260121132847573.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=611130"},
  } },
  riftTotem: { name: "균열의 토템", grades: {
    "기본": {"icon":"riftTotem-base-icon.webp","art":"riftTotem-base-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4006","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/40b8b29035920250213173838995.png"},
  } },
  alchemy: { name: "조화의 연금석", grades: {
    "혼돈": {"icon":"alchemy-chaos-icon.webp","art":"alchemy-chaos-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4007","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/375751e189120250224182300490.png"},
    "공허": {"icon":"alchemy-eternal-icon.webp","art":"alchemy-eternal-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4007","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/e47f21da15620260612182530401.png"},
  } },
  relic1: { name: "유물1", note: "등급별 대표 유물입니다. 실제 외형은 계열에 따라 달라질 수 있습니다.", grades: {
    "태고": {"icon":"relic1-primal-icon.webp","art":"relic1-primal-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4005","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/1abdf98e45b20250224173749227.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=644544"},
    "혼돈": {"icon":"relic1-chaos-icon.webp","art":"relic1-chaos-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4005","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/14159d5198320250224174213370.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=644544"},
    "공허": {"icon":"relic1-eternal-icon.webp","art":"relic1-eternal-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4005","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/d5230fe20bf20250224174223502.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=644544"},
  } },
  relic2: { name: "유물2", note: "등급별 대표 유물입니다. 실제 외형은 계열에 따라 달라질 수 있습니다.", grades: {
    "태고": {"icon":"relic1-primal-icon.webp","art":"relic1-primal-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4005","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/1abdf98e45b20250224173749227.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=644544"},
    "혼돈": {"icon":"relic1-chaos-icon.webp","art":"relic1-chaos-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4005","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/14159d5198320250224174213370.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=644544"},
    "공허": {"icon":"relic1-eternal-icon.webp","art":"relic1-eternal-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4005","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/d5230fe20bf20250224174223502.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=644544"},
  } },
  relicSeries1: { name: "유물1 마력 각인", grades: {
    "공허": {"icon":"relic1-eternal-icon.webp","art":"relicSeries1-eternal-art.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4005","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/d5230fe20bf20250224174223502.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=644544"},
  } },
  relicSeries2: { name: "유물2 마력 각인", grades: {
    "공허": {"icon":"relic1-eternal-icon.webp","art":"relicSeries1-eternal-art.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4005","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/d5230fe20bf20250224174223502.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=644544"},
  } },
  insigniaBook: { name: "문양 각인서", grades: {
    "심연": {"icon":"insigniaBook-abyssal-icon.webp","art":"insigniaBook-abyssal-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4005","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/8a2696826b720210421151144980.png","statsSource":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=1001013"},
    "태고": {"icon":"insigniaBook-primal-icon.webp","art":"insigniaBook-primal-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4005","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/66713949f7c20210421151137122.png","statsSource":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=1001013"},
    "혼돈": {"icon":"insigniaBook-chaos-icon.webp","art":"insigniaBook-chaos-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4005","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/c23bda7b00520240110162906511.png","statsSource":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=1001013"},
    "공허": {"icon":"insigniaBook-eternal-icon.webp","art":"insigniaBook-eternal-icon.webp","name":"공허 문양 각인서","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4005","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/bb361a38d0020261013150658272.png","statsSource":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=1001013"},
  } },
  nightsoul: { name: "밤의 영혼석", grades: {
    "기본": {"icon":"nightsoul-base-icon.webp","art":"nightsoul-base-art.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=10111","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/4343602a14320260407155337613.png"},
  } },
  moonsoul: { name: "달빛 영혼석", grades: {
    "기본": {"icon":"moonsoul-base-icon.webp","art":"moonsoul-base-art.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=10111","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/a5533f911be20260407155339031.png"},
  } },
  lightstone: { name: "광원석", note: "상세 원본의 숫자는 캡처 당시의 강화 단계입니다.", grades: {
    "태고": {"icon":"lightstone-primal-icon.webp","art":"lightstone-primal-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4013","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/4c728f486e320250214150647543.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=641262"},
    "혼돈": {"icon":"lightstone-chaos-icon.webp","art":"lightstone-chaos-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4013","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/eba6a23ddbd20250214150653628.png","statsSource":"https://forum.blackdesertm.com/Board/Detail?boardNo=17&contentNo=641262"},
  } },
  sylvia: { name: "실비아 여신상", grades: {
    "기본": {"icon":"sylvia-base-icon.webp","art":"sylvia-base-art.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4016","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/54569acabea20240830165112996.gif"},
  } },
  balance: { name: "균형의 돌", grades: {
    "기본": {"icon":"balance-base-icon.webp","art":"balance-base-art.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4011","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/e4510d5d0f220240830134803188.png"},
  } },
  emblemDeco1: { name: "휘장 장식(용맹)", grades: {
    "기본": {"icon":"emblemDeco1-base-icon.webp","art":"emblemDeco1-base-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4008","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/92442cefa3b20250214145813526.png"},
  } },
  emblemDeco2: { name: "휘장 장식(침착)", grades: {
    "기본": {"icon":"emblemDeco2-base-icon.webp","art":"emblemDeco2-base-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4008","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/fc283c8a56220250214145815853.png"},
  } },
  emblemDeco3: { name: "휘장 장식(격렬)", grades: {
    "기본": {"icon":"emblemDeco3-base-icon.webp","art":"emblemDeco3-base-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4008","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/76ad912e74d20250214145817887.png"},
  } },
  emblemDeco4: { name: "휘장 장식(철벽)", grades: {
    "기본": {"icon":"emblemDeco4-base-icon.webp","art":"emblemDeco4-base-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4008","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/60c7e6949d120250214145819984.png"},
  } },
  emblemDeco5: { name: "휘장 장식(투지)", grades: {
    "기본": {"icon":"emblemDeco5-base-icon.webp","art":"emblemDeco5-base-icon.webp","source":"https://www.blackdesertm.com/Ocean/Wiki?wikiNo=4008","imageSource":"https://s1.blackdesertm.com/KR/Forum/BDM/Upload/WIKI/669fef92f0520250214145821510.png"},
  } },
};
