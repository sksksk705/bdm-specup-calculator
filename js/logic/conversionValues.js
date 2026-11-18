import { CURRENCY_CONVERSION_RULES } from "../data/conversionData.js";

// 현재 재료 시세 중 더 비싼 교환 재료를 기준으로 펄의 은화 환산가를 계산합니다.
export function calculatePearlConversion(prices) {
  const rules = CURRENCY_CONVERSION_RULES.pearl;
  const candidates = rules.redemptionOptions.map(function (option) {
    return {
      material: option.material,
      pearls: option.pearls,
      silver: Number(prices[option.material]) || 0
    };
  });
  candidates.sort(function (a, b) { return b.silver - a.silver; });

  const reference = candidates[0];
  const cashPackage = rules.cashPackage;
  const silverPerPearl = reference && reference.silver > 0
    ? reference.silver / reference.pearls
    : 0;
  const krwPerPearl = cashPackage.krw / cashPackage.pearls;
  const pearlsPerCp = CURRENCY_CONVERSION_RULES.generalKnowledge.pearlsPerCp;

  return {
    hasValue: silverPerPearl > 0,
    referenceMaterial: reference ? reference.material : "",
    referenceSilver: reference ? reference.silver : 0,
    silverPerPearl: silverPerPearl,
    krwPerPearl: krwPerPearl,
    silverPerKrw: silverPerPearl / krwPerPearl,
    packageKrw: cashPackage.krw,
    packagePearls: cashPackage.pearls,
    packageSilver: silverPerPearl * cashPackage.pearls,
    generalKnowledgePearlsPerCp: pearlsPerCp,
    generalKnowledgeSilverPerCp: silverPerPearl * pearlsPerCp,
    generalKnowledgeKrwPerCp: krwPerPearl * pearlsPerCp
  };
}

// 토벌 실측 보상에서 입장권 은화 환산 비용과 검은 기운의 전투력 가치를 계산합니다.
export function calculateBossRushKnowledgeConversion(silverPerPearl) {
  const rules = CURRENCY_CONVERSION_RULES.bossRushKnowledge;
  const sample = rules.sample;
  const ticketsSpent = sample.runs * rules.ticketsPerRun;
  const pearlsSpent = ticketsSpent * rules.ticketPack.pearls / rules.ticketPack.tickets;
  const ticketSilverCost = pearlsSpent * silverPerPearl;
  const blackEnergyFromCoins = sample.ancientGoldCoins
    * rules.ancientGoldCoinExchange.blackEnergy / rules.ancientGoldCoinExchange.coins;
  // 심연 검은 기운은 일반 검은 기운과 경험치 단위가 다를 수 있어, 환산값을 받기 전까지 제외합니다.
  const totalBlackEnergy = blackEnergyFromCoins;
  const cpGain = totalBlackEnergy * rules.blackEnergyCpExchange.cp
    / rules.blackEnergyCpExchange.blackEnergy;
  const netSilverCost = ticketSilverCost - sample.silver;

  return {
    runs: sample.runs,
    pearlsSpent: pearlsSpent,
    ticketSilverCost: ticketSilverCost,
    silverReward: sample.silver,
    netSilverCost: netSilverCost,
    blackEnergyFromCoins: blackEnergyFromCoins,
    totalBlackEnergy: totalBlackEnergy,
    unconvertedAbyssalBlackEnergy: sample.abyssalBlackEnergy,
    cpGain: cpGain,
    netSilverPerCp: cpGain > 0 ? netSilverCost / cpGain : 0
  };
}

// 별자리 30회 실측 보상으로 모험의 증표 1개의 은화 환산가를 계산합니다.
export function calculateAdventureTokenSilverValue(silverPerPearl) {
  const rules = CURRENCY_CONVERSION_RULES.adventureToken;
  const sample = rules.sample;
  const bossRules = CURRENCY_CONVERSION_RULES.bossRushKnowledge;
  const directSilver = sample.silver
    + sample.repeatedSilverReward.count * sample.repeatedSilverReward.silverEach;
  const blackEnergyFromCoins = sample.ancientGoldCoins
    * bossRules.ancientGoldCoinExchange.blackEnergy / bossRules.ancientGoldCoinExchange.coins;
  const cpGain = blackEnergyFromCoins * bossRules.blackEnergyCpExchange.cp
    / bossRules.blackEnergyCpExchange.blackEnergy;
  const silverPerCp = silverPerPearl * CURRENCY_CONVERSION_RULES.generalKnowledge.pearlsPerCp;
  const totalSilverEquivalent = directSilver + cpGain * silverPerCp;
  const tokensSpent = sample.runs * rules.tokensPerRun;

  return {
    tokensSpent: tokensSpent,
    directSilver: directSilver,
    cpGain: cpGain,
    rewardSilverEquivalent: totalSilverEquivalent,
    silverPerToken: tokensSpent > 0 ? totalSilverEquivalent / tokensSpent : 0
  };
}

// 그림자 매듭 1개로 토벌 1회를 진행하는 기준의 은화 환산 입장 비용입니다.
export function calculateShadowKnotSilverValue(silverPerPearl) {
  const rules = CURRENCY_CONVERSION_RULES.bossRushKnowledge;
  const pearlsPerRun = rules.ticketPack.pearls * rules.ticketsPerRun / rules.ticketPack.tickets;
  return pearlsPerRun * silverPerPearl;
}

// 달빛 영혼석 조각의 기대 소모량을 블랙펄 및 은화 가치로 환산합니다.
export function calculateMoonlightSoulstoneCost(expectedFragments, silverPerPearl) {
  const rules = CURRENCY_CONVERSION_RULES.moonlightSoulstone;
  const blackPearls = expectedFragments * rules.fragmentedSoulstoneBlackPearls;
  const silver = blackPearls * rules.blackPearlsPerPearl * silverPerPearl;
  return { blackPearls: blackPearls, silver: silver };
}
