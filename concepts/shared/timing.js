export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function animateNumber(el, target, duration = 600) {
  if (!el) return;
  const start = performance.now();
  const from = 0;
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = (from + (target - from) * ease).toFixed(1);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target.toFixed(1);
  }
  requestAnimationFrame(tick);
}
