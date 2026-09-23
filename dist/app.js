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

// Skill buttons always toggle the visible list, including after a hover preview.
const skillCards = [...document.querySelectorAll('.skill-card')];
function setSkillOpen(card, open) {
  card.querySelector('.skill-trigger').setAttribute('aria-expanded', String(open));
  card.querySelector('.skill-panel').hidden = !open;
}
function openSkill(card) {
  skillCards.forEach(other => setSkillOpen(other, other === card));
}
skillCards.forEach(card => {
  const button = card.querySelector('.skill-trigger');
  const panel = card.querySelector('.skill-panel');
  button.addEventListener('click', () => {
    if (panel.hidden) openSkill(card);
    else setSkillOpen(card, false);
  });
  card.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') openSkill(card);
  });
  card.addEventListener('pointerleave', () => {
    if (!button.matches(':focus-visible')) setSkillOpen(card, false);
  });
  button.addEventListener('focus', () => {
    if (button.matches(':focus-visible')) openSkill(card);
  });
  card.addEventListener('focusout', event => {
    if (!card.contains(event.relatedTarget)) setSkillOpen(card, false);
  });
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') skillCards.forEach(card => setSkillOpen(card, false));
});
document.addEventListener('pointerdown', event => {
  skillCards.forEach(card => { if (!card.contains(event.target)) setSkillOpen(card, false); });
});

// Each card owns its disclosure animation; neighbours never share its height.
document.querySelectorAll('.experience-card').forEach(card => {
  const details = card.querySelector('.experience-details');
  const summary = details.querySelector('summary');
  const label = summary.querySelector('.more-info-label');
  const content = details.querySelector('.experience-content');
  const company = content.id === 'experience-accenture' ? 'Accenture' : 'SensoPart';
  let expanded = details.open;
  let animation = null;
  function finish() {
    if (animation) { animation.cancel(); animation = null; }
    details.open = expanded;
    content.style.height = '';
  }
  function toggle() {
    const from = details.open ? content.getBoundingClientRect().height : 0;
    expanded = !expanded;
    label.textContent = expanded ? 'Less info' : 'More info';
    summary.setAttribute('aria-label', `${expanded ? 'Less' : 'More'} info about ${company}`);
    if (animation) { animation.cancel(); animation = null; }
    if (reducedMotion.matches || typeof content.animate !== 'function') { finish(); return; }
    details.open = true;
    content.style.height = 'auto';
    const to = expanded ? content.getBoundingClientRect().height : 0;
    content.style.height = `${from}px`;
    const current = content.animate(
      [{height:`${from}px`},{height:`${to}px`}],
      {duration:expanded ? 440 : 350,easing:'cubic-bezier(.22,.61,.36,1)',fill:'both'}
    );
    animation = current;
    current.onfinish = () => { if (animation === current) finish(); };
  }
  summary.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    toggle();
  });
  card.addEventListener('click', event => {
    if (event.target.closest('a, button, input, summary, .experience-content')) return;
    if (window.getSelection()?.toString()) return;
    toggle();
  });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) finish(); });
});

// Match just the overview heights; open content is deliberately excluded.
const workGrid = document.querySelector('.work-grid');
const overviews = [...document.querySelectorAll('.experience-overview')];
function alignExperienceCards() {
  overviews.forEach(element => { element.style.minHeight = ''; });
  if (window.matchMedia('(min-width: 851px)').matches) {
    const height = Math.max(...overviews.map(element => element.getBoundingClientRect().height));
    overviews.forEach(element => { element.style.minHeight = `${Math.ceil(height)}px`; });
  }
}
let lastGridWidth = 0;
if (typeof ResizeObserver === 'function') {
  const observer = new ResizeObserver(entries => {
    const width = entries[0].contentRect.width;
    if (Math.abs(width - lastGridWidth) > 1) {
      lastGridWidth = width;
      alignExperienceCards();
    }
  });
  observer.observe(workGrid);
} else window.addEventListener('resize', alignExperienceCards);
if (document.fonts?.ready) document.fonts.ready.then(alignExperienceCards);
window.addEventListener('load', alignExperienceCards);
alignExperienceCards();

// Decorative intro starts after the primary interactions are ready.
try { playJourney(); } catch (error) { finishJourney(); console.warn('Intro unavailable:', error.message); }
