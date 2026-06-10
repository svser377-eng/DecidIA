/* ============================================================
   DecidIA — Oracle & Particles (Casino Edition v2)
   ============================================================ */
'use strict';

window.DecidIA = window.DecidIA || {};
var DecidIA = window.DecidIA;

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
    const colors = ['124,58,255','0,229,220','255,61,90','255,181,71'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * (this.canvas ? this.canvas.width : 800),
        y: Math.random() * (this.canvas ? this.canvas.height : 600),
        r: Math.random() * 1.8 + 0.3,
        alpha: Math.random() * 0.5 + 0.05,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(Math.random() * 0.5 + 0.1),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  },

  loop() {
    if (!this.canvas) return;
    this.animFrame = requestAnimationFrame(() => this.loop());
    const { ctx, canvas, particles } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const colors = ['124,58,255','0,229,220','255,61,90','255,181,71'];
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.alpha -= 0.0002;
      if (p.y < -10 || p.alpha <= 0) {
        particles[i] = {
          x: Math.random() * canvas.width,
          y: canvas.height + 10,
          r: Math.random() * 1.8 + 0.3,
          alpha: Math.random() * 0.5 + 0.05,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -(Math.random() * 0.5 + 0.1),
          color: colors[Math.floor(Math.random() * colors.length)],
        };
        continue;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + p.color + ',' + p.alpha + ')';
      ctx.fill();
    }
  },

  burst(x, y, count) {
    count = count || 30;
    const colors = ['124,58,255','0,229,220','255,181,71','255,61,90'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x: x, y: y,
        r: Math.random() * 3 + 1,
        alpha: 0.9,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  },
};

// ── Oracle Slot Machine ─────────────────────────────────────
DecidIA.Oracle = {
  isSpinning: false,
  currentResult: null,

  /**
   * Animates the drum column with a slot-machine effect.
   * @param {HTMLElement} columnEl   - .slot-drum__column
   * @param {HTMLElement} windowEl   - .slot-drum__window  (for particle burst coords)
   * @param {HTMLElement} highlightEl- .slot-drum__highlight
   * @param {Function}    onComplete - callback(result)
   */
  spin: function(columnEl, windowEl, highlightEl, onComplete) {
    if (this.isSpinning) return;
    if (!columnEl) { console.error('DecidIA.Oracle.spin: columnEl not found'); return; }

    this.isSpinning = true;

    var self = this;
    var result = DecidIA.getRandomResponse();
    self.currentResult = result;

    // Build the full sequence of texts to flash through
    var pool = DecidIA.ALL_RESPONSES.map(function(r){ return r.text; });

    // Schedule: [delay_ms, text] pairs
    var schedule = [];

    // Fast phase
    for (var i = 0; i < 12; i++) {
      schedule.push([65, pool[Math.floor(Math.random() * pool.length)]]);
    }
    // Medium phase
    for (var i = 0; i < 10; i++) {
      schedule.push([110, pool[Math.floor(Math.random() * pool.length)]]);
    }
    // Slow phase
    for (var i = 0; i < 7; i++) {
      schedule.push([180, pool[Math.floor(Math.random() * pool.length)]]);
    }
    // Very slow
    for (var i = 0; i < 4; i++) {
      schedule.push([280, pool[Math.floor(Math.random() * pool.length)]]);
    }
    // Final two near-results
    schedule.push([350, pool[Math.floor(Math.random() * pool.length)]]);
    schedule.push([380, pool[Math.floor(Math.random() * pool.length)]]);
    // RESULT
    schedule.push([0, result.text, true]);

    if (highlightEl) highlightEl.classList.remove('is-active');

    var colorMap = {
      success: '#22D47B',
      teal:    '#00E5DC',
      violet:  '#7C3AFF',
      warning: '#FFB547',
      danger:  '#FF5C7A',
      muted:   '#9898C8',
    };

    var idx = 0;

    function step() {
      if (idx >= schedule.length) return;

      var item = schedule[idx];
      var delay  = item[0];
      var text   = item[1];
      var isFinal = item[2] === true;
      idx++;

      if (isFinal) {
        // Show final result
        self.isSpinning = false;
        if (highlightEl) highlightEl.classList.add('is-active');

        var hex = colorMap[result.color] || '#F0F0FF';
        columnEl.innerHTML =
          '<div class="slot-drum__item--result">' +
            '<span class="slot-drum__result-emoji">' + result.emoji + '</span>' +
            '<span class="slot-drum__result-text" style="color:' + hex + '">' + result.text + '</span>' +
          '</div>';

        // Particle burst
        if (windowEl) {
          var rect = windowEl.getBoundingClientRect();
          DecidIA.Particles.burst(
            rect.left + rect.width / 2,
            rect.top  + rect.height / 2,
            40
          );
        }

        if (typeof onComplete === 'function') onComplete(result);
        return;
      }

      // Show spinning item — with neighbours for depth
      var prev = pool[Math.floor(Math.random() * pool.length)];
      var next = pool[Math.floor(Math.random() * pool.length)];
      columnEl.innerHTML =
        '<div class="slot-drum__item">' + prev + '</div>' +
        '<div class="slot-drum__item is-center">' + text + '</div>' +
        '<div class="slot-drum__item">' + next + '</div>';

      setTimeout(step, delay);
    }

    step();
  },
};

// ── Example placeholder rotator ─────────────────────────────
DecidIA.ExampleRotator = {
  init: function(inputEl, examples, interval) {
    interval = interval || 3500;
    if (!inputEl || !examples || !examples.length) return;
    var index = 0;
    var rotate = function() {
      inputEl.setAttribute('placeholder', examples[index]);
      index = (index + 1) % examples.length;
    };
    rotate();
    setInterval(rotate, interval);
  },
};

window.DecidIA = DecidIA;
