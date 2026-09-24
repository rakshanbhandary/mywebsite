const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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

// Journey stops link directly to the matching entry and reveal its work details.
function revealJourneyStop(hash) {
  if (hash !== '#work-accenture' && hash !== '#work-sensopart') return;
  const details = document.querySelector(`${hash} .experience-details`);
  if (details && !details.open) details.querySelector('summary').click();
}
document.querySelectorAll('.pipeline-node').forEach(link => {
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    revealJourneyStop(link.hash);
  });
});
window.addEventListener('hashchange', () => revealJourneyStop(location.hash));
revealJourneyStop(location.hash);


// Reveal Luffy once per page load; only his own button changes the palette.
const onePieceEgg = document.querySelector('.one-piece-egg');
if (onePieceEgg) {
  const trigger = onePieceEgg.querySelector('.one-piece-trigger');
  const peek = onePieceEgg.querySelector('.luffy-window');
  const luffyButton = peek.querySelector('button');
  const illustration = peek.querySelector('img');
  const status = document.querySelector('.easter-egg-status');
  let revealed = false;
  let loading = false;
  function positionLuffy() {
    if (!revealed) return;
    const word = onePieceEgg.getBoundingClientRect();
    const halfWidth = peek.offsetWidth / 2;
    const center = Math.max(12 + halfWidth, Math.min(innerWidth - 12 - halfWidth, word.left + word.width / 2));
    peek.style.left = `${center - word.left}px`;
  }
  trigger.addEventListener('click', async () => {
    if (revealed || loading) return;
    loading = true;
    trigger.setAttribute('aria-busy', 'true');
    if (!illustration.getAttribute('src')) illustration.src = illustration.dataset.src;
    try { await illustration.decode(); }
    catch {
      loading = false;
      trigger.removeAttribute('aria-busy');
      status.textContent = 'The surprise could not load. Try again.';
      return;
    }
    loading = false;
    revealed = true;
    trigger.removeAttribute('aria-busy');
    trigger.setAttribute('aria-expanded', 'true');
    trigger.setAttribute('aria-label', 'One piece — Luffy is here');
    peek.setAttribute('aria-hidden', 'false');
    luffyButton.disabled = false;
    onePieceEgg.closest('.hero-copy').classList.add('has-luffy');
    onePieceEgg.classList.add('is-peeking');
    positionLuffy();
    status.textContent = 'Luffy is here! Click him to try One Piece colours.';
  });
  luffyButton.addEventListener('click', () => {
    const enabled = document.documentElement.dataset.pirate !== 'true';
    if (enabled) document.documentElement.dataset.pirate = 'true';
    else delete document.documentElement.dataset.pirate;
    luffyButton.setAttribute('aria-pressed', String(enabled));
    const label = enabled ? 'Restore regular colours' : 'Switch to One Piece colours';
    luffyButton.setAttribute('aria-label', label);
    luffyButton.title = label;
    window.dispatchEvent(new Event('palettechange'));
    status.textContent = enabled ? 'One Piece colours on. Click Luffy again to restore regular colours.' : 'Regular colours restored.';
  });
  window.addEventListener('resize', positionLuffy);
}
