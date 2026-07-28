// 프레젠테이션 계층 — 여러 화면(가격표, 스펙업 표, 장비 타일)에서 공통으로 쓰는 자잘한 DOM 빌더.
// 이 파일은 다른 UI 모듈을 import하지 않습니다(순환 참조 방지용 최하단 레이어).

export function buildMaterialSelect(options, value, onChange) {
  const sel = document.createElement("select");
  options.forEach(function (name) {
    const o = document.createElement("option"); o.value = name; o.textContent = name;
    if (name === value) o.selected = true;
    sel.appendChild(o);
  });
  sel.addEventListener("change", function () { onChange(sel.value); });
  return sel;
}

export function buildNumberInput(value, onChange, width) {
  const input = document.createElement("input");
  input.type = "number"; input.min = "0";
  if (width) input.style.width = width;
  input.value = value;
  input.addEventListener("input", function () { onChange(parseFloat(input.value) || 0); });
  return input;
}

export function staticLabelCell(text) {
  return function (td) {
    const span = document.createElement("span");
    span.style.cssText = "color:var(--text-dim);white-space:normal;font-size:11.8px;";
    span.textContent = text;
    td.appendChild(span);
  };
}
