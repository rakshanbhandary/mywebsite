const intro = document.getElementById('intro');
const main = document.getElementById('portfolio');
const plane = document.getElementById('plane');
const route = document.getElementById('route');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const duration = 1800;
const flightDuration = 1450;
let frame = 0;
let finishTimer = 0;

function finishJourney() {
  cancelAnimationFrame(frame);
  clearTimeout(finishTimer);
  intro.hidden = true;
  intro.classList.remove('leaving', 'arrived');
  document.body.classList.remove('playing');
  main.inert = false;
}

function playJourney() {
  finishJourney();
  if (reducedMotion.matches) return;
  intro.hidden = false;
  main.inert = true;
  route.style.strokeDashoffset = '1';
  document.body.classList.add('playing');
  const start = performance.now();
  const length = route.getTotalLength();
  function animate(now) {
    const elapsed = now - start;
    const raw = Math.min(elapsed / flightDuration, 1);
    const progress = raw * raw * (3 - 2 * raw);
    const point = route.getPointAtLength(progress * length);
    const ahead = route.getPointAtLength(Math.min(length, progress * length + 1));
    const behind = route.getPointAtLength(Math.max(0, progress * length - 1));
    const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180 / Math.PI + 180;
    plane.setAttribute('transform', `translate(${point.x} ${point.y}) rotate(${angle})`);
    route.style.strokeDashoffset = String(1 - progress);
    if (raw === 1) intro.classList.add('arrived');
    if (elapsed >= 1500) intro.classList.add('leaving');
    if (elapsed < duration) frame = requestAnimationFrame(animate);
    else finishJourney();
  }
  frame = requestAnimationFrame(animate);
  finishTimer = setTimeout(finishJourney, duration);
}

document.getElementById('replay').addEventListener('click', playJourney);
reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) finishJourney(); });
window.addEventListener('pagehide', finishJourney);
playJourney();
