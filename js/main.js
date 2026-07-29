// 애플리케이션 진입점 — 데이터 계층(가격표 fetch, 사용자 상태 로드)을 먼저 준비한 뒤,
// 프레젠테이션 계층(탭, 타일 그리드, 시세 표, 스펙업 표)을 초기화합니다.

import { loadDefaultPrices } from "./data/priceRepository.js";
import { initState } from "./data/userState.js";
import { initTabs } from "./ui/tabs.js";
import { initPriceTable, renderPriceTable, syncRecoveryTicketInput } from "./ui/priceTable.js";
import { renderGearGrid, renderGearExtra } from "./ui/gearGrid.js";
import { renderSpecTable } from "./ui/specTable.js";
import { renderSoulTab } from "./ui/soulTab.js";

async function boot() {
  let defaultPrices;
  try {
    defaultPrices = await loadDefaultPrices();
  } catch (err) {
    document.querySelector(".shell").innerHTML =
      '<div class="card"><h2>가격표를 불러오지 못했습니다</h2>' +
      '<div class="desc">이 계산기는 data/prices.json을 fetch로 읽어옵니다 — file:// 로 직접 열면 브라우저 보안 정책(CORS)에 막히니, ' +
      'GitHub Pages 같은 http(s) 서버로 열어주세요.<br>오류: ' + String(err.message || err) + '</div></div>';
    return;
  }

  initState(defaultPrices);
  initTabs();
  initPriceTable(defaultPrices);

  renderPriceTable("");
  syncRecoveryTicketInput();
  renderGearGrid();
  renderGearExtra();
  renderSpecTable();
  renderSoulTab();
}

boot();
