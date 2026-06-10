/* ============================================================
   DecidIA — Oracle & Animations
   ============================================================ */

'use strict';

const DecidIA = window.DecidIA || {};

// ── Partículas de fondo ─────────────────────────────────────
DecidIA.Particles = {
  canvas: null,
  ctx: null,
  particles: [],
  animFrame: null,

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.spawn(60);
    this.loop();
    window.addEventListener('resize', () => this.resize());
  },

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  spawn(count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x:     Math.random() * this.canvas.width,
        y:     Math.random() * this.canvas.height,
        r:     Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        vx:    (Math.random() - 0.5) * 0.3,
        vy:   -(Math.random() * 0.4 + 0.1),
        color: Math.random() > 0.5 ? '108,62,255' : '0,212,204',
      });
    }
  },

  loop() {
    this.animFrame = requestAnimationFrame(() => this.loop());
    const { ctx, canvas, particles } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.0003;

      if (p.y < -10 || p.alpha <= 0) {
        particles[i] = {
          x:     Math.random() * canvas.width,
          y:     canvas.height + 10,
          r:     Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.4 + 0.1,
          vx:    (Math.random() - 0.5) * 0.3,
          vy:   -(Math.random() * 0.4 + 0.1),
          color: Math.random() > 0.5 ? '108,62,255' : '0,212,204',
        };
        return;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();
    });
  },

  burst(x, y, count = 20) {
    // Burst extra particles on oracle reveal
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 2 + 1;
      this.particles.push({
        x,
        y,
        r:     Math.random() * 2.5 + 1,
        alpha: 0.8,
        vx:    Math.cos(angle) * speed,
        vy:    Math.sin(angle) * speed - 1,
        color: Math.random() > 0.5 ? '108,62,255' : '0,212,204',
      });
    }
  },
};

// ── Oráculo (slot machine) ──────────────────────────────────
DecidIA.Oracle = {
  isSpinning: false,
  currentResult: null,

  // Items visibles durante el giro (todos los textos disponibles)
  get spinItems() {
    return DecidIA.ALL_RESPONSES.map(r => r.text);
  },

  /**
   * Anima la columna central y detiene en el resultado.
   * @param {HTMLElement} column - el contenedor del tambor
   * @param {Function} onComplete - callback con el resultado
   */
  spin(column, onComplete) {
    if (this.isSpinning) return;
    this.isSpinning = true;

    const result    = DecidIA.getRandomResponse();
    this.currentResult = result;

    const items     = this.spinItems;
    const totalMs   = 3500;
    const phases    = [
      { duration: 800,  interval: 80  },   // aceleración
      { duration: 1500, interval: 100 },   // velocidad media
      { duration: 800,  interval: 160 },   // desaceleración
      { duration: 400,  interval: 260 },   // casi parado
    ];

    column.innerHTML = '';
    column.classList.remove('oracle-column--result');
    column.classList.add('oracle-column--spinning');

    let phaseIndex = 0;
    let elapsed    = 0;
    let timer      = null;

    const showItem = (text) => {
      column.innerHTML = `<span class="oracle-column__item">${text}</span>`;
    };

    const randomItem = () => items[Math.floor(Math.random() * items.length)];

    const runPhase = () => {
      if (phaseIndex >= phases.length) {
        // Mostrar resultado final
        clearTimeout(timer);
        this.isSpinning = false;
        column.classList.remove('oracle-column--spinning');
        column.classList.add('oracle-column--result');
        this.renderResult(column, result);
        onComplete && onComplete(result);
        return;
      }

      const phase = phases[phaseIndex];
      showItem(randomItem());

      timer = setTimeout(() => {
        elapsed += phase.interval;
        if (elapsed >= phase.duration) {
          elapsed = 0;
          phaseIndex++;
        }
        runPhase();
      }, phase.interval);
    };

    runPhase();
  },

  renderResult(column, result) {
    const colorMap = {
      success: '#22D47B',
      teal:    '#00D4CC',
      violet:  '#6C3EFF',
      warning: '#FFB547',
      danger:  '#FF5C7A',
      muted:   '#9898C8',
    };
    const hex = colorMap[result.color] || '#F0F0FF';

    column.innerHTML = `
      <div class="oracle-result">
        <span class="oracle-result__emoji">${result.emoji}</span>
        <span class="oracle-result__text" style="color: ${hex}">${result.text}</span>
      </div>
    `;

    // Burst de partículas en el centro de la columna
    const rect = column.getBoundingClientRect();
    DecidIA.Particles.burst(
      rect.left + rect.width / 2,
      rect.top  + rect.height / 2,
      30
    );
  },
};

// ── Animación de entrada para elementos ────────────────────
DecidIA.animate = {
  fadeIn(el, delay = 0) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`;
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  },

  staggerFadeIn(elements, baseDelay = 0, step = 100) {
    elements.forEach((el, i) => this.fadeIn(el, baseDelay + i * step));
  },

  pulse(el) {
    el.classList.add('pulse-once');
    el.addEventListener('animationend', () => el.classList.remove('pulse-once'), { once: true });
  },
};

// ── Rotador de ejemplos ─────────────────────────────────────
DecidIA.ExampleRotator = {
  init(inputEl, examples, interval = 3000) {
    if (!inputEl || !examples.length) return;
    let index = 0;
    const rotate = () => {
      inputEl.setAttribute('placeholder', examples[index]);
      index = (index + 1) % examples.length;
    };
    rotate();
    setInterval(rotate, interval);
  },
};

window.DecidIA = DecidIA;
