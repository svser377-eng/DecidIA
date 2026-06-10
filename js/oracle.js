/* ============================================================
   DecidIA — Oracle & Particles (Casino Edition)
   ============================================================ */
'use strict';

const DecidIA = window.DecidIA || {};

// ── Partículas ──────────────────────────────────────────────
DecidIA.Particles = {
  canvas: null, ctx: null, particles: [], animFrame: null,

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.spawn(80);
    this.loop();
    window.addEventListener('resize', () => this.resize());
  },

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  spawn(count) {
    const colors = ['124,58,255', '0,229,220', '255,61,90', '255,181,71'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x:     Math.random() * this.canvas.width,
        y:     Math.random() * this.canvas.height,
        r:     Math.random() * 1.8 + 0.3,
        alpha: Math.random() * 0.5 + 0.05,
        vx:    (Math.random() - 0.5) * 0.4,
        vy:   -(Math.random() * 0.5 + 0.1),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  },

  loop() {
    this.animFrame = requestAnimationFrame(() => this.loop());
    const { ctx, canvas, particles } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const colors = ['124,58,255', '0,229,220', '255,61,90', '255,181,71'];
    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy; p.alpha -= 0.0002;
      if (p.y < -10 || p.alpha <= 0) {
        particles[i] = {
          x:     Math.random() * canvas.width,
          y:     canvas.height + 10,
          r:     Math.random() * 1.8 + 0.3,
          alpha: Math.random() * 0.5 + 0.05,
          vx:    (Math.random() - 0.5) * 0.4,
          vy:   -(Math.random() * 0.5 + 0.1),
          color: colors[Math.floor(Math.random() * colors.length)],
        };
        return;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();
    });
  },

  burst(x, y, count = 30) {
    const colors = ['124,58,255', '0,229,220', '255,181,71', '255,61,90'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x, y,
        r:     Math.random() * 3 + 1,
        alpha: 0.9,
        vx:    Math.cos(angle) * speed,
        vy:    Math.sin(angle) * speed - 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  },
};

// ── Slot Machine Oracle ─────────────────────────────────────
DecidIA.Oracle = {
  isSpinning: false,
  currentResult: null,

  get spinItems() {
    return DecidIA.ALL_RESPONSES.map(r => r.text);
  },

  /**
   * Casino-style drum spin on the column element.
   * column: the .slot-drum__column element
   * windowEl: the .slot-drum__window for measuring
   * highlightEl: .slot-drum__highlight
   * onComplete: callback(result)
   */
  spin(columnEl, windowEl, highlightEl, onComplete) {
    if (this.isSpinning) return;
    this.isSpinning = true;

    const result = DecidIA.getRandomResponse();
    this.currentResult = result;

    // Build item list for animation: many random + result at end
    const items = this.spinItems;
    const phases = [
      { count: 10, delay: 60 },
      { count: 12, delay: 90 },
      { count: 10, delay: 130 },
      { count: 6,  delay: 190 },
      { count: 4,  delay: 280 },
    ];

    highlightEl.classList.remove('is-active');
    columnEl.innerHTML = '';

    const ITEM_H = 56;
    const visibleCount = 5;
    const centerIdx = Math.floor(visibleCount / 2);

    let allItems = [];
    phases.forEach(ph => {
      for (let i = 0; i < ph.count; i++) {
        allItems.push({ text: items[Math.floor(Math.random() * items.length)], delay: ph.delay });
      }
    });
    // Last 3 are lead-up, then result
    allItems.push({ text: items[Math.floor(Math.random() * items.length)], delay: 350 });
    allItems.push({ text: items[Math.floor(Math.random() * items.length)], delay: 350 });
    allItems.push({ text: result.text, delay: 400, isResult: true });

    let idx = 0;
    const colorMap = {
      success: '#22D47B', teal: '#00E5DC', violet: '#7C3AFF',
      warning: '#FFB547', danger: '#FF5C7A', muted: '#9898C8',
    };

    const showNext = () => {
      if (idx >= allItems.length) {
        // Show final result display
        this.isSpinning = false;
        highlightEl.classList.add('is-active');
        const hex = colorMap[result.color] || '#F0F0FF';
        columnEl.innerHTML = `
          <div class="slot-drum__item--result">
            <span class="slot-drum__result-emoji">${result.emoji}</span>
            <span class="slot-drum__result-text" style="color:${hex}">${result.text}</span>
          </div>
        `;
        // Burst particles
        const rect = windowEl.getBoundingClientRect();
        DecidIA.Particles.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 40);
        onComplete && onComplete(result);
        return;
      }

      const item = allItems[idx];
      // Build a mini-drum strip centered on current item
      let html = '';
      for (let r = -centerIdx; r <= centerIdx; r++) {
        const pos = idx + r;
        let text = '';
        if (pos >= 0 && pos < allItems.length) text = allItems[pos].text;
        else text = items[Math.floor(Math.random() * items.length)];
        const isCtr = r === 0;
        html += `<div class="slot-drum__item${isCtr ? ' is-center' : ''}">${text}</div>`;
      }
      columnEl.innerHTML = html;

      idx++;
      setTimeout(showNext, item.delay);
    };

    showNext();
  },
};

// ── Example rotator ─────────────────────────────────────────
DecidIA.ExampleRotator = {
  init(inputEl, examples, interval = 3500) {
    if (!inputEl || !examples.length) return;
    let index = 0;
    const rotate = () => { inputEl.setAttribute('placeholder', examples[index]); index = (index + 1) % examples.length; };
    rotate();
    setInterval(rotate, interval);
  },
};

window.DecidIA = DecidIA;
