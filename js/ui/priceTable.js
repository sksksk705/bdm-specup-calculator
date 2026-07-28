// 프레젠테이션 계층 — ① 탭 "재료 시세" 표와 그 위의 "복구 기준 시세" 입력칸을 그립니다.
// 표시할 재료 목록(materialList)은 initPriceTable에서 받은 data/prices.json 내용으로 초기화되고,
// "+ 재료 추가"로 사용자가 커스텀 재료를 더 넣을 수 있습니다(이 목록은 저장되지 않고 세션 동안만 유지 —
// 실제 단가만 state.prices를 통해 localStorage에 저장됩니다).

import { state, persist } from "../data/userState.js";
import { renderSpecTable } from "./specTable.js";

let materialList = [];
let priceTableBody = null;
let recoveryTicketInput = null;

export function renderPriceTable(filter) {
  filter = (filter || "").trim().toLowerCase();
  priceTableBody.innerHTML = "";
  materialList.forEach(function (m) {
    if (filter && m.name.toLowerCase().indexOf(filter) === -1) return;
    const tr = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.className = "name"; tdName.textContent = m.name;
    tr.appendChild(tdName);

    const tdCat = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "badge muted"; badge.textContent = m.cat;
    tdCat.appendChild(badge);
    tr.appendChild(tdCat);

    const tdPrice = document.createElement("td");
    tdPrice.className = "num";
    const input = document.createElement("input");
    input.type = "number"; input.min = "0"; input.step = "1"; input.className = "price-input";
    input.value = state.prices[m.name] || 0;
    input.addEventListener("input", function () {
      state.prices[m.name] = parseFloat(input.value) || 0;
      persist();
      if (m.name === "돌파 복구권") syncRecoveryTicketInput();
      renderSpecTable();
    });
    tdPrice.appendChild(input);
    tr.appendChild(tdPrice);

    const tdNote = document.createElement("td");
    tdNote.style.color = "var(--text-faint)"; tdNote.style.fontSize = "11.5px"; tdNote.style.whiteSpace = "normal";
    tdNote.textContent = m.note || "";
    tr.appendChild(tdNote);

    const tdDel = document.createElement("td");
    if (m.custom) {
      const delBtn = document.createElement("button");
      delBtn.className = "icon-btn"; delBtn.textContent = "✕"; delBtn.title = "삭제";
      delBtn.addEventListener("click", function () {
        materialList = materialList.filter(function (x) { return x !== m; });
        delete state.prices[m.name];
        renderPriceTable(document.getElementById("priceSearch").value);
        renderSpecTable();
      });
      tdDel.appendChild(delBtn);
    }
    tr.appendChild(tdDel);

    priceTableBody.appendChild(tr);
  });
}

export function syncRecoveryTicketInput() {
  recoveryTicketInput.value = state.prices["돌파 복구권"] || 0;
}

// defaultPrices: data/prices.json에서 fetch해 온 배열([{name,cat,price,note}, ...]).
export function initPriceTable(defaultPrices) {
  priceTableBody = document.getElementById("priceTableBody");
  recoveryTicketInput = document.getElementById("recoveryTicketPrice");
  materialList = defaultPrices.map(function (m) { return { name: m.name, cat: m.cat, note: m.note }; });

  document.getElementById("priceSearch").addEventListener("input", function (e) {
    renderPriceTable(e.target.value);
  });

  // 상단 "복구 기준 시세" 입력칸 — 재료 시세 표의 "돌파 복구권" 행과 같은 값을 공유합니다.
  recoveryTicketInput.addEventListener("input", function () {
    state.prices["돌파 복구권"] = parseFloat(recoveryTicketInput.value) || 0;
    persist();
    renderPriceTable(document.getElementById("priceSearch").value);
    renderSpecTable();
  });

  document.getElementById("addMaterialBtn").addEventListener("click", function () {
    let name = prompt("추가할 재료명을 입력하세요.");
    if (!name) return;
    name = name.trim();
    if (!name || materialList.some(function (m) { return m.name === name; })) return;
    materialList.push({ name: name, cat: "사용자 추가", note: "", custom: true });
    state.prices[name] = 0;
    renderPriceTable(document.getElementById("priceSearch").value);
  });
}
