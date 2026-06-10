/* ============================================================
   DecidIA — Home Controller (Casino Edition)
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ── Particles ──
  DecidIA.Particles.init('particle-canvas');

  // ── DOM refs ──
  const questionInput    = document.getElementById('oracle-question');
  const btnGirar         = document.getElementById('btn-girar');
  const btnAgain         = document.getElementById('btn-again');
  const drumColumn       = document.getElementById('drum-column');
  const drumWindow       = document.getElementById('drum-window');
  const drumHighlight    = document.getElementById('drum-highlight');
  const postResult       = document.getElementById('post-result');
  const feedbackBtns     = document.querySelectorAll('.feedback-btn');
  const examplesBtn      = document.getElementById('examples-btn');
  const examplesDropdown = document.getElementById('examples-dropdown');

  // ── Placeholder rotator ──
  if (questionInput) {
    DecidIA.ExampleRotator.init(questionInput, DecidIA.QUESTION_EXAMPLES, 3500);
  }

  // ── Example chips in dropdown ──
  if (examplesDropdown && questionInput) {
    DecidIA.QUESTION_EXAMPLES.forEach(q => {
      const chip = document.createElement('button');
      chip.className = 'example-chip';
      chip.textContent = q;
      chip.addEventListener('click', () => {
        questionInput.value = q;
        examplesDropdown.classList.remove('is-open');
        questionInput.focus();
      });
      examplesDropdown.appendChild(chip);
    });
  }

  if (examplesBtn && examplesDropdown) {
    examplesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      examplesDropdown.classList.toggle('is-open');
    });
    document.addEventListener('click', () => examplesDropdown.classList.remove('is-open'));
  }

  // ── GIRAR ──
  if (btnGirar) {
    btnGirar.addEventListener('click', handleGirar);
  }
  if (questionInput) {
    questionInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGirar();
    });
  }

  function handleGirar() {
    const question = questionInput ? questionInput.value.trim() : 'Mi pregunta';
    if (DecidIA.Oracle.isSpinning) return;

    DecidIA.state.currentQuestion = question || 'Mi consulta';

    // Hide post-result, disable button
    if (postResult) postResult.classList.remove('is-visible');
    if (btnGirar)   btnGirar.disabled = true;
    if (drumHighlight) drumHighlight.classList.remove('is-active');

    // Spin
    DecidIA.Oracle.spin(drumColumn, drumWindow, drumHighlight, (result) => {
      if (postResult) postResult.classList.add('is-visible');
      if (btnGirar)   btnGirar.disabled = false;
      saveToHistory(DecidIA.state.currentQuestion, result);
    });
  }

  // ── Again ──
  if (btnAgain) {
    btnAgain.addEventListener('click', () => {
      if (questionInput) { questionInput.value = ''; questionInput.focus(); }
      if (postResult) postResult.classList.remove('is-visible');
      if (drumHighlight) drumHighlight.classList.remove('is-active');
      if (drumColumn) drumColumn.innerHTML = idleHTML();
      feedbackBtns.forEach(b => b.classList.remove('active'));
    });
  }

  function idleHTML() {
    return `<div class="slot-drum__item is-center" style="color:rgba(255,255,255,0.25);font-size:2rem">🔮</div>`;
  }

  // ── Feedback ──
  feedbackBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      feedbackBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = parseInt(btn.dataset.value);
      if (DecidIA.state.history.length > 0) {
        DecidIA.state.history[0].feedback = val;
      }
    });
  });

  // ── History ──
  function saveToHistory(question, result) {
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      question,
      response: result.text,
      category: getCat(result),
      feedback: null,
    };
    DecidIA.state.history.unshift(entry);
    try {
      const stored = JSON.parse(localStorage.getItem('decidia_history') || '[]');
      stored.unshift(entry);
      localStorage.setItem('decidia_history', JSON.stringify(stored.slice(0, 50)));
    } catch(e) {}
  }

  function getCat(result) {
    for (const [cat, arr] of Object.entries(DecidIA.RESPONSES)) {
      if (arr.some(r => r.text === result.text)) return cat;
    }
    return 'unknown';
  }

  // ── Intersection observer for cards ──
  const animEls = document.querySelectorAll('.step-card, .pricing-card');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 100);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  animEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    obs.observe(el);
  });

  // ── Navbar scroll ──
  window.addEventListener('scroll', () => {
    const nb = document.getElementById('navbar');
    if (!nb) return;
    nb.style.borderBottomColor = window.scrollY > 20 ? 'rgba(124,58,255,0.2)' : '';
  }, { passive: true });

  // ── Mobile hamburger ──
  const hamburger = document.getElementById('hamburger');
  const drawer    = document.getElementById('nav-drawer');
  if (hamburger && drawer) {
    hamburger.addEventListener('click', () => {
      const open = drawer.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        drawer.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

});

// ── Modal helpers (global) ──────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('is-open'); document.body.style.overflow = ''; }
}
function switchModal(fromId, toId) {
  closeModal(fromId);
  setTimeout(() => openModal(toId), 150);
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.remove('is-open');
    document.body.style.overflow = '';
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop.is-open').forEach(m => m.classList.remove('is-open'));
    document.body.style.overflow = '';
  }
});
