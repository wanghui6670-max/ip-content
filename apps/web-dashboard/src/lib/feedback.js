export async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.focus();
  area.select();
  document.execCommand("copy");
  area.remove();
}

export function showToast(text) {
  const node = document.getElementById("toast");
  node.textContent = text;
  node.classList.add("visible");
  clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => node.classList.remove("visible"), 1500);
}
