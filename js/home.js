/* ============================================================
   DecidIA — Home Controller (Casino Edition v2)
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', function() {

  // ── Particles ──
  DecidIA.Particles.init('particle-canvas');

  // ── DOM refs ──
  var questionInput    = document.getElementById('oracle-question');
  var btnGirar         = document.getElementById('btn-girar');
  var btnAgain         = document.getElementById('btn-again');
  var drumColumn       = document.getElementById('drum-column');
  var drumWindow       = document.getElementById('drum-window');
  var drumHighlight    = document.getElementById('drum-highlight');
  var postResult       = document.getElementById('post-result');
  var feedbackBtns     = document.querySelectorAll('.feedback-btn');
  var examplesBtn      = document.getElementById('examples-btn');
  var examplesDropdown = document.getElementById('examples-dropdown');

  // Guard: if critical elements missing, log and stop
  if (!drumColumn || !btnGirar) {
    console.error('DecidIA: drum-column or btn-girar not found in DOM');
    return;
  }

  // ── Placeholder rotator ──
  if (questionInput) {
    DecidIA.ExampleRotator.init(questionInput, DecidIA.QUESTION_EXAMPLES, 3500);
  }

  // ── Example chips ──
  if (examplesDropdown && questionInput) {
    DecidIA.QUESTION_EXAMPLES.forEach(function(q) {
      var chip = document.createElement('button');
      chip.className = 'example-chip';
      chip.textContent = q;
      chip.addEventListener('click', function() {
        questionInput.value = q;
        examplesDropdown.classList.remove('is-open');
        questionInput.focus();
      });
      examplesDropdown.appendChild(chip);
    });
  }

  if (examplesBtn && examplesDropdown) {
    examplesBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      examplesDropdown.classList.toggle('is-open');
    });
    document.addEventListener('click', function() {
      examplesDropdown.classList.remove('is-open');
    });
  }

  // ── GIRAR ──
  btnGirar.addEventListener('click', handleGirar);

  if (questionInput) {
    questionInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGirar();
    });
  }

  function handleGirar() {
    if (DecidIA.Oracle.isSpinning) return;

    var question = (questionInput && questionInput.value.trim()) || 'Mi consulta';
    DecidIA.state.currentQuestion = question;

    // Reset UI
    if (postResult) postResult.classList.remove('is-visible');
    if (feedbackBtns) feedbackBtns.forEach(function(b){ b.classList.remove('active'); });
    btnGirar.disabled = true;
    btnGirar.style.opacity = '0.6';

    // Spin
    DecidIA.Oracle.spin(drumColumn, drumWindow, drumHighlight, function(result) {
      btnGirar.disabled = false;
      btnGirar.style.opacity = '';
      if (postResult) postResult.classList.add('is-visible');
      saveToHistory(question, result);
    });
  }

  // ── Again ──
  if (btnAgain) {
    btnAgain.addEventListener('click', function() {
      if (questionInput) { questionInput.value = ''; questionInput.focus(); }
      if (postResult) postResult.classList.remove('is-visible');
      if (drumHighlight) drumHighlight.classList.remove('is-active');
      drumColumn.innerHTML = '<div class="slot-drum__item is-center" style="color:rgba(255,255,255,0.25);font-size:2rem">🔮</div>';
      feedbackBtns.forEach(function(b){ b.classList.remove('active'); });
    });
  }

  // ── Feedback ──
  feedbackBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      feedbackBtns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var val = parseInt(btn.dataset.value);
      if (DecidIA.state.history.length > 0) DecidIA.state.history[0].feedback = val;
    });
  });

  // ── History ──
  function saveToHistory(question, result) {
    var entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      question: question,
      response: result.text,
      category: getCat(result),
      feedback: null,
    };
    DecidIA.state.history.unshift(entry);
    try {
      var stored = JSON.parse(localStorage.getItem('decidia_history') || '[]');
      stored.unshift(entry);
      localStorage.setItem('decidia_history', JSON.stringify(stored.slice(0, 50)));
    } catch(e) {}
  }

  function getCat(result) {
    var cats = Object.keys(DecidIA.RESPONSES);
    for (var i = 0; i < cats.length; i++) {
      var cat = cats[i];
      var arr = DecidIA.RESPONSES[cat];
      for (var j = 0; j < arr.length; j++) {
        if (arr[j].text === result.text) return cat;
      }
    }
    return 'unknown';
  }

  // ── Scroll-in animation for cards ──
  var animEls = document.querySelectorAll('.step-card, .pricing-card');
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry, i) {
      if (entry.isIntersecting) {
        setTimeout(function() {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 100);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  animEls.forEach(function(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    obs.observe(el);
  });

  // ── Navbar scroll ──
  window.addEventListener('scroll', function() {
    var nb = document.getElementById('navbar');
    if (!nb) return;
    nb.style.borderBottomColor = window.scrollY > 20 ? 'rgba(124,58,255,0.25)' : '';
  }, { passive: true });

  // ── Mobile hamburger ──
  var hamburger = document.getElementById('hamburger');
  var drawer    = document.getElementById('nav-drawer');
  if (hamburger && drawer) {
    hamburger.addEventListener('click', function() {
      var open = drawer.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        drawer.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

});

// ── Modal helpers ───────────────────────────────────────────
function openModal(id) {
  var el = document.getElementById(id);
  if (el) { el.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  var el = document.getElementById(id);
  if (el) { el.classList.remove('is-open'); document.body.style.overflow = ''; }
}
function switchModal(fromId, toId) {
  closeModal(fromId);
  setTimeout(function(){ openModal(toId); }, 150);
}
function closeDrawer() {
  var d = document.getElementById('nav-drawer');
  var h = document.getElementById('hamburger');
  if (d) d.classList.remove('is-open');
  if (h) h.classList.remove('is-open');
  document.body.style.overflow = '';
}

document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.remove('is-open');
    document.body.style.overflow = '';
  }
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop.is-open').forEach(function(m) {
      m.classList.remove('is-open');
    });
    document.body.style.overflow = '';
  }
});
