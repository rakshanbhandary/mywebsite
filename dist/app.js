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

// Keep the collapsed cards aligned, without stretching an expanded neighbour.
const workGrid = document.querySelector('.work-grid');
const overviews = [...document.querySelectorAll('.experience-overview')];
function alignExperienceCards() {
  overviews.forEach(element => { element.style.minHeight = ''; });
  if (window.matchMedia('(min-width: 851px)').matches) {
    const height = Math.max(...overviews.map(element => element.getBoundingClientRect().height));
    overviews.forEach(element => { element.style.minHeight = `${Math.ceil(height)}px`; });
  }
  workGrid.classList.add('is-aligned');
}
let lastGridWidth = 0;
const cardObserver = new ResizeObserver(entries => {
  const width = entries[0].contentRect.width;
  if (Math.abs(width - lastGridWidth) > 1) {
    lastGridWidth = width;
    alignExperienceCards();
  }
});
cardObserver.observe(workGrid);
document.fonts.ready.then(alignExperienceCards);
window.addEventListener('load', alignExperienceCards);
alignExperienceCards();

// Animate both directions while retaining native details keyboard semantics.
document.querySelectorAll('.experience-details').forEach(details => {
  const summary = details.querySelector('summary');
  const content = details.querySelector('.experience-content');
  let expanded = details.open;
  let animation = null;
  const settle = () => {
    details.open = expanded;
    if (animation) animation.cancel();
    animation = null;
    content.style.height = '';
  };
  summary.addEventListener('click', event => {
    event.preventDefault();
    const from = details.open ? content.getBoundingClientRect().height : 0;
    expanded = !expanded;
    if (animation) animation.cancel();
    if (reducedMotion.matches || !content.animate) { settle(); return; }
    details.open = true;
    content.style.height = 'auto';
    const to = expanded ? content.getBoundingClientRect().height : 0;
    content.style.height = `${from}px`;
    animation = content.animate(
      [{height:`${from}px`},{height:`${to}px`}],
      {duration:340,easing:'cubic-bezier(.22,.8,.25,1)',fill:'both'}
    );
    animation.onfinish = settle;
  });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) settle(); });
});

// Reveal skill lists on hover, keyboard focus, or tap; Escape dismisses them.
const skillCards = [...document.querySelectorAll('.skill-card')];
function closeSkill(card) {
  card.dataset.pinned = 'false';
  card.querySelector('.skill-trigger').setAttribute('aria-expanded','false');
  card.querySelector('.skill-panel').hidden = true;
}
function openSkill(card) {
  skillCards.forEach(other => { if (other !== card) closeSkill(other); });
  card.querySelector('.skill-trigger').setAttribute('aria-expanded','true');
  card.querySelector('.skill-panel').hidden = false;
}
skillCards.forEach(card => {
  const button = card.querySelector('.skill-trigger');
  card.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') openSkill(card); });
  card.addEventListener('pointerleave', () => {
    if (card.dataset.pinned !== 'true' && !card.contains(document.activeElement)) closeSkill(card);
  });
  button.addEventListener('focus', () => { if (button.matches(':focus-visible')) openSkill(card); });
  button.addEventListener('click', () => {
    if (card.dataset.pinned === 'true') closeSkill(card);
    else { openSkill(card); card.dataset.pinned = 'true'; }
  });
  card.addEventListener('focusout', event => { if (!card.contains(event.relatedTarget)) closeSkill(card); });
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') skillCards.forEach(closeSkill);
});
document.addEventListener('pointerdown', event => {
  skillCards.forEach(card => { if (!card.contains(event.target)) closeSkill(card); });
});
