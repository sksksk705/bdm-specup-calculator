// 공개 기준으로 관리하는 주요 재화 환산 규칙.
// 새 환산 기준이 추가되면 이 파일에 기준 재화/구매 패키지를 등록합니다.
export const CURRENCY_CONVERSION_RULES = {
  pearl: {
    redemptionOptions: [
      { material: "홍익의 불씨", pearls: 990 },
      { material: "공허의 눈", pearls: 990 }
    ],
    cashPackage: { krw: 50000, pearls: 6000 }
  },
  generalKnowledge: {
    pearlsPerCp: 10
  },
  bossRushKnowledge: {
    ticketPack: { tickets: 2000, pearls: 3800 },
    ticketsPerRun: 1,
    sample: {
      runs: 52,
      silver: 43004,
      ancientGoldCoins: 184184,
      abyssalBlackEnergy: 5
    },
    ancientGoldCoinExchange: { coins: 1000000, blackEnergy: 290 },
    blackEnergyCpExchange: { blackEnergy: 20000, cp: 7 }
  },
  adventureToken: {
    tokensPerRun: 100,
    sample: {
      runs: 30,
      silver: 31680,
      repeatedSilverReward: { count: 44, silverEach: 1630 },
      ancientGoldCoins: 121860
    }
  },
  moonlightSoulstone: {
    fragmentedSoulstoneBlackPearls: 300,
    blackPearlsPerPearl: 1
  }
};
