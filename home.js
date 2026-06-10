/* ============================================================
   DecidIA — Home Controller
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ── Partículas ──────────────────────────────────────────
  DecidIA.Particles.init('particle-canvas');

  // ── Referencias DOM ─────────────────────────────────────
  const questionEl   = document.getElementById('oracle-question');
  const charCountEl  = document.getElementById('char-count');
  const btnConsult   = document.getElementById('btn-consult');
  const btnAgain     = document.getElementById('btn-again');
  const oracleSlot   = document.getElementById('oracle-slot');
  const oracleColumn = document.getElementById('oracle-column');
  const inputArea    = document.getElementById('input-area');
  const postResult   = document.getElementById('post-result');
  const exampleChips = document.getElementById('example-chips');
  const feedbackBtns = document.querySelectorAll('.feedback-btn');

  // ── Contador de caracteres ───────────────────────────────
  questionEl.addEventListener('input', () => {
    charCountEl.textContent = questionEl.value.length;
  });

  // ── Rotador de placeholders ──────────────────────────────
  DecidIA.ExampleRotator.init(questionEl, DecidIA.QUESTION_EXAMPLES, 3500);

  // ── Chips de ejemplo ─────────────────────────────────────
  DecidIA.QUESTION_EXAMPLES.slice(0, 4).forEach(q => {
    const chip = document.createElement('button');
    chip.className = 'example-chip';
    chip.textContent = q;
    chip.addEventListener('click', () => {
      questionEl.value = q;
      charCountEl.textContent = q.length;
      questionEl.focus();
    });
    exampleChips.appendChild(chip);
  });

  // ── Consultar ────────────────────────────────────────────
  btnConsult.addEventListener('click', handleConsult);
  questionEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) handleConsult();
  });

  function handleConsult() {
    const question = questionEl.value.trim();
    if (!question) {
      shakeInput(questionEl);
      return;
    }
    if (DecidIA.Oracle.isSpinning) return;

    // Guardar pregunta en estado
    DecidIA.state.currentQuestion = question;

    // Ocultar input, mostrar tambor
    inputArea.style.display = 'none';
    postResult.classList.remove('is-visible');
    oracleSlot.classList.add('is-visible', 'is-spinning');
    oracleSlot.classList.remove('is-revealed');

    // Girar oráculo
    DecidIA.Oracle.spin(oracleColumn, (result) => {
      oracleSlot.classList.remove('is-spinning');
      oracleSlot.classList.add('is-revealed');
      postResult.classList.add('is-visible');
      saveToHistory(question, result);
    });
  }

  // ── Preguntar de nuevo ───────────────────────────────────
  btnAgain.addEventListener('click', () => {
    questionEl.value = '';
    charCountEl.textContent = '0';
    oracleSlot.classList.remove('is-visible', 'is-spinning', 'is-revealed');
    postResult.classList.remove('is-visible');
    inputArea.style.display = '';
    oracleColumn.innerHTML = '<span class="oracle-column__idle">🔮</span>';
    feedbackBtns.forEach(b => b.classList.remove('active'));
    questionEl.focus();
  });

  // ── Feedback ─────────────────────────────────────────────
  feedbackBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      feedbackBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const value = btn.dataset.value;
      if (DecidIA.state.history.length > 0) {
        DecidIA.state.history[DecidIA.state.history.length - 1].feedback = parseInt(value);
      }
    });
  });

  // ── Historial local ──────────────────────────────────────
  function saveToHistory(question, result) {
    const entry = {
      id:       Date.now(),
      date:     new Date().toISOString(),
      question,
      response: result.text,
      category: getCategoryFromResult(result),
      feedback: null,
    };
    DecidIA.state.history.unshift(entry);
    // Persistir en localStorage (máx 50 entradas free)
    try {
      const stored = JSON.parse(localStorage.getItem('decidia_history') || '[]');
      stored.unshift(entry);
      localStorage.setItem('decidia_history', JSON.stringify(stored.slice(0, 50)));
    } catch (e) {}
  }

  function getCategoryFromResult(result) {
    for (const [cat, responses] of Object.entries(DecidIA.RESPONSES)) {
      if (responses.some(r => r.text === result.text)) return cat;
    }
    return 'unknown';
  }

  // ── Shake animation para input vacío ─────────────────────
  function shakeInput(el) {
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = 'shake 0.4s ease';
    el.addEventListener('animationend', () => {
      el.style.animation = '';
    }, { once: true });
    el.focus();
  }

  // ── Animaciones de entrada escalonadas ───────────────────
  const animEls = document.querySelectorAll('.step-card, .pricing-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  animEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });

  // ── Navbar scroll shadow ─────────────────────────────────
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 20) {
      navbar.style.borderBottomColor = 'rgba(108,62,255,0.15)';
    } else {
      navbar.style.borderBottomColor = '';
    }
  }, { passive: true });

});

// ── Modal helpers ─────────────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('is-open');
    document.body.style.overflow = '';
  }
}

function switchModal(fromId, toId) {
  closeModal(fromId);
  setTimeout(() => openModal(toId), 150);
}

// Cerrar al hacer clic fuera del modal
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.remove('is-open');
    document.body.style.overflow = '';
  }
});

// Cerrar con Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop.is-open').forEach(m => {
      m.classList.remove('is-open');
    });
    document.body.style.overflow = '';
  }
});
