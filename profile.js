/* ============================================================
   DecidIA — Profile Quiz Controller
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  DecidIA.Particles.init('particle-canvas');

  const questions = DecidIA.PROFILE_QUESTIONS;
  const answers   = {};
  let currentQ    = 0;

  const progressFill  = document.getElementById('quiz-progress-fill');
  const stepLabel     = document.getElementById('quiz-step-label');
  const quizEmoji     = document.getElementById('q-emoji');
  const quizText      = document.getElementById('q-text');
  const quizOptions   = document.getElementById('q-options');
  const btnPrev       = document.getElementById('btn-prev');
  const btnNext       = document.getElementById('btn-next');

  // Render first question
  renderQuestion(currentQ);

  function renderQuestion(index) {
    const q = questions[index];
    const total = questions.length;

    // Update progress
    const pct = Math.round(((index) / total) * 100);
    progressFill.style.width = `${pct}%`;
    stepLabel.textContent = `Pregunta ${index + 1} de ${total}`;

    // Update content
    quizEmoji.textContent = q.emoji;
    quizText.textContent  = q.question;
    quizOptions.innerHTML = '';

    const isScale = q.type === 'scale';
    quizOptions.className = `quiz-card__options${isScale ? ' is-scale' : ''}`;

    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = opt;
      if (answers[q.id] === i) btn.classList.add('selected');
      btn.addEventListener('click', () => {
        quizOptions.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        answers[q.id] = i;
        btnNext.disabled = false;
      });
      quizOptions.appendChild(btn);
    });

    // Btn states
    btnPrev.disabled = index === 0;
    btnNext.textContent = index === total - 1 ? 'Ver mi perfil ✨' : 'Siguiente →';
    btnNext.disabled = answers[q.id] === undefined;
  }

  btnPrev.addEventListener('click', () => {
    if (currentQ > 0) {
      currentQ--;
      renderQuestion(currentQ);
    }
  });

  btnNext.addEventListener('click', () => {
    const q = questions[currentQ];
    if (answers[q.id] === undefined) return;

    if (currentQ < questions.length - 1) {
      currentQ++;
      renderQuestion(currentQ);
    } else {
      // Quiz complete
      completeQuiz();
    }
  });

  function completeQuiz() {
    const profile = computeProfile(answers);
    saveProfile(profile);
    showResults(profile);
  }

  function computeProfile(ans) {
    // Simple scoring based on answers
    // Each option maps to a profile type (0=analytical, 1=impulsive, 2=conservative, 3=explorer, 4=strategist)
    const scores = { analytical: 0, impulsive: 0, conservative: 0, explorer: 0, strategist: 0 };

    const decisonSpeedMap = ['impulsive', 'analytical', 'conservative', 'conservative'];
    const riskMap         = ['impulsive', 'analytical', 'conservative', 'explorer'];
    const infoMap         = ['impulsive', 'explorer', 'analytical', 'analytical', 'analytical'];
    const longTermMap     = ['impulsive', 'explorer', 'strategist', 'strategist'];

    if (ans['decision_speed'] !== undefined) scores[decisonSpeedMap[ans['decision_speed']]]++;
    if (ans['risk_tolerance']  !== undefined) scores[riskMap[ans['risk_tolerance']]]++;
    if (ans['information_style'] !== undefined) {
      const types = ['impulsive', 'explorer', 'analytical', 'analytical', 'analytical'];
      scores[types[Math.min(ans['information_style'], types.length - 1)]]++;
    }
    if (ans['long_term'] !== undefined) scores[longTermMap[ans['long_term']]]++;

    const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    const profileData = DecidIA.PROFILES[dominant] || DecidIA.PROFILES.analytical;

    // Emotional dimensions
    const stressVal    = ans['stress'] !== undefined ? Math.round(((ans['stress'] + 1) / 5) * 100) : 50;
    const optimismVal  = ans['optimism'] !== undefined ? [80, 70, 30, 40][ans['optimism']] : 50;
    const confidenceVal = ans['confidence'] !== undefined
      ? Math.round((1 - (ans['confidence'] / 4)) * 100) : 50;

    return {
      type: dominant,
      profile: profileData,
      dimensions: {
        stress:     stressVal,
        optimism:   optimismVal,
        confidence: confidenceVal,
        analysis:   scores.analytical * 25,
        risk:       Math.round((scores.impulsive / 4) * 100),
      }
    };
  }

  function saveProfile(profile) {
    try {
      localStorage.setItem('decidia_profile', JSON.stringify(profile));
      // Award badge
      const badges = JSON.parse(localStorage.getItem('decidia_badges') || '[]');
      if (!badges.includes('deep_thinker')) {
        badges.push('deep_thinker');
        localStorage.setItem('decidia_badges', JSON.stringify(badges));
      }
      // XP
      const xp = parseInt(localStorage.getItem('decidia_xp') || '0');
      localStorage.setItem('decidia_xp', xp + 50);
    } catch (e) {}
  }

  function showResults(profile) {
    document.getElementById('quiz-section').style.display = 'none';
    const resultsSection = document.getElementById('results-section');
    resultsSection.style.display = 'block';

    // Profile type
    document.getElementById('profile-icon').textContent = profile.profile.icon;
    document.getElementById('profile-name').textContent = profile.profile.name;
    document.getElementById('profile-description').textContent = profile.profile.description;

    const traitsEl = document.getElementById('profile-traits');
    traitsEl.innerHTML = '';
    profile.profile.traits.forEach(t => {
      const span = document.createElement('span');
      span.className = `badge badge--${profile.profile.color}`;
      span.textContent = t;
      traitsEl.appendChild(span);
    });

    // Dimensions
    const dimList = document.getElementById('dimension-list');
    const dimConfig = [
      { key: 'stress',     label: 'Estrés',     invert: true  },
      { key: 'optimism',   label: 'Optimismo',   invert: false },
      { key: 'confidence', label: 'Confianza',   invert: false },
      { key: 'analysis',   label: 'Análisis',    invert: false },
      { key: 'risk',       label: 'Tolerancia al riesgo', invert: false },
    ];

    dimList.innerHTML = '';
    dimConfig.forEach(dim => {
      let val = profile.dimensions[dim.key] || 0;
      if (dim.invert) val = 100 - val;
      val = Math.min(100, Math.max(0, val));

      const row = document.createElement('div');
      row.className = 'dimension-row';
      row.innerHTML = `
        <span class="dimension-row__label">${dim.label}</span>
        <div class="dimension-row__bar">
          <div class="dimension-row__fill" style="width: 0%"></div>
        </div>
        <span class="dimension-row__value">${val}%</span>
      `;
      dimList.appendChild(row);

      // Animate bar
      requestAnimationFrame(() => {
        setTimeout(() => {
          row.querySelector('.dimension-row__fill').style.width = `${val}%`;
        }, 200);
      });
    });
  }
});
