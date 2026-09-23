(() => {
  const root = document.documentElement;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Deep links and restored scroll positions should take visitors straight to their content.
  if (motion.matches || location.hash || window.scrollY > 0 || typeof Element.prototype.animate !== 'function') return;

  let overlay;
  let settleTimer;
  let safetyTimer;
  let finished = false;
  const animations = [];
  function finish() {
    finished = true;
    clearTimeout(settleTimer);
    clearTimeout(safetyTimer);
    animations.forEach(animation => animation.cancel());
    overlay?.remove();
    root.classList.remove('name-reveal-active', 'name-reveal-settling');
    window.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('pagehide', finish);
    document.removeEventListener('keydown', finish);
    document.removeEventListener('pointerdown', finish);
    motion.removeEventListener('change', onMotionChange);
  }
  function onMotionChange() { if (motion.matches) finish(); }
  function onResize() { if (overlay) finish(); }
  function onScroll() { if (window.scrollY > 0) finish(); }
  root.classList.add('name-reveal-active');
  // Restore the complete page even if font loading or animation setup fails.
  safetyTimer = setTimeout(finish, 1400);
  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('pagehide', finish, { once: true });
  document.addEventListener('keydown', finish, { once: true });
  document.addEventListener('pointerdown', finish, { once: true });
  motion.addEventListener('change', onMotionChange);

  function start() {
    if (finished) return;
    if (window.scrollY > 0) { finish(); return; }
    try {
      const heading = document.querySelector('.hero-name');
      const style = getComputedStyle(heading);
      const ns = 'http://www.w3.org/2000/svg';
      overlay = document.createElementNS(ns, 'svg');
      overlay.classList.add('name-reveal-overlay');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.setAttribute('focusable', 'false');
      overlay.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);
      document.body.append(overlay);
      const nodes = [heading.firstChild, heading.querySelector('span').firstChild];
      const words = nodes.map((node, index) => {
        const range = document.createRange();
        range.selectNodeContents(node);
        const destination = range.getBoundingClientRect();
        const marker = document.createElement('i');
        marker.setAttribute('aria-hidden', 'true');
        marker.style.cssText = 'display:inline-block;width:0;height:0;padding:0;margin:0;vertical-align:baseline';
        node.parentNode.insertBefore(marker, node.nextSibling);
        const baseline = marker.getBoundingClientRect().top;
        marker.remove();
        const group = document.createElementNS(ns, 'g');
        const text = document.createElementNS(ns, 'text');
        text.textContent = node.textContent;
        text.style.fontFamily = style.fontFamily;
        text.style.fontSize = style.fontSize;
        text.style.letterSpacing = style.letterSpacing;
        if (index) text.classList.add('name-surname');
        group.append(text);
        overlay.append(group);
        const bounds = text.getBBox();
        if (!bounds.width || !destination.width) throw new Error('Name has no measurable bounds');
        return { group, text, bounds, destination, baseline };
      });
      const gap = parseFloat(style.fontSize) * .3;
      const totalWidth = words.reduce((sum, word) => sum + word.bounds.width, gap);
      const maxHeight = Math.max(...words.map(word => word.bounds.height));
      const scale = Math.min(innerWidth * .88 / totalWidth, innerHeight * .22 / maxHeight, 2.2);
      let cursor = (innerWidth - totalWidth * scale) / 2;
      const top = (innerHeight - maxHeight * scale) / 2;
      words.forEach(({ group, text, bounds, destination, baseline }) => {
        // Measure the actual inline baseline so the SVG lands on the original text precisely.
        const x = cursor - bounds.x * scale;
        const y = top - bounds.y * scale;
        const targetX = destination.left;
        const targetY = baseline;
        const from = `translate(${x}px, ${y}px) scale(${scale})`;
        const to = `translate(${targetX}px, ${targetY}px) scale(1)`;
        group.style.transformOrigin = '0 0';
        animations.push(group.animate([
          { transform: from, offset: 0 },
          { transform: from, offset: .44 },
          { transform: to, offset: 1 }
        ], { duration: 1000, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' }));
        const dash = 600;
        text.style.strokeDasharray = String(dash);
        animations.push(text.animate([
          { strokeDashoffset: dash, fillOpacity: 0, strokeOpacity: 1, offset: 0 },
          { strokeDashoffset: 0, fillOpacity: 0, strokeOpacity: 1, offset: .48 },
          { strokeDashoffset: 0, fillOpacity: 1, strokeOpacity: 0, offset: .9 },
          { strokeDashoffset: 0, fillOpacity: 1, strokeOpacity: 0, offset: 1 }
        ], { duration: 1000, easing: 'ease-in-out', fill: 'both' }));
        cursor += (bounds.width + gap) * scale;
      });
      settleTimer = setTimeout(() => root.classList.add('name-reveal-settling'), 750);
      Promise.all(animations.map(animation => animation.finished)).then(finish, finish);
    } catch { finish(); }
  }

  function ready() {
    // Give the heading font a short head start without delaying the page on a slow connection.
    if (document.fonts?.load) {
      Promise.race([
        document.fonts.load('600 82px Manrope'),
        new Promise(resolve => setTimeout(resolve, 150))
      ]).then(start, start);
    } else start();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true });
  else ready();
})();
