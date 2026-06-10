/* ============================================================
   DecidIA — Data Models
   ============================================================ */

'use strict';

window.DecidIA = window.DecidIA || {};
var DecidIA = window.DecidIA;

// ── Respuestas del Oráculo ──────────────────────────────────
DecidIA.RESPONSES = {
  positive: [
    { text: "Sí", emoji: "✅", color: "success",  energy: "alta"  },
    { text: "Adelante", emoji: "🚀", color: "teal",    energy: "alta"  },
    { text: "Hazlo", emoji: "⚡", color: "violet",  energy: "alta"  },
    { text: "Excelente idea", emoji: "💡", color: "teal",    energy: "alta"  },
    { text: "La suerte está contigo", emoji: "🌟", color: "violet",  energy: "media" },
    { text: "Es el momento", emoji: "🎯", color: "success",  energy: "alta"  },
  ],
  negative: [
    { text: "No", emoji: "🚫", color: "danger",  energy: "alta"  },
    { text: "Espera", emoji: "⏸️", color: "warning", energy: "media" },
    { text: "Mejor no", emoji: "⚠️", color: "danger",  energy: "media" },
    { text: "No es el momento", emoji: "🌑", color: "warning", energy: "baja"  },
    { text: "Riesgo elevado", emoji: "🔴", color: "danger",  energy: "alta"  },
  ],
  neutral: [
    { text: "Reúne más información", emoji: "🔍", color: "teal",    energy: "media" },
    { text: "Analízalo mejor",        emoji: "🧠", color: "violet",  energy: "baja"  },
    { text: "Consulta nuevamente",    emoji: "🔄", color: "muted",   energy: "baja"  },
    { text: "Falta claridad",         emoji: "🌫️", color: "muted",   energy: "baja"  },
  ],
  mysterious: [
    { text: "Las señales son confusas", emoji: "🌀", color: "violet",  energy: "misteriosa" },
    { text: "Tu respuesta llegará pronto", emoji: "⏳", color: "teal",    energy: "misteriosa" },
    { text: "El destino aún no decide", emoji: "🎴", color: "violet",  energy: "misteriosa" },
    { text: "Escucha tu intuición",    emoji: "🔮", color: "violet",  energy: "misteriosa" },
  ],
};

// Todos en un pool plano para el giro del tambor
DecidIA.ALL_RESPONSES = Object.values(DecidIA.RESPONSES).flat();

// ── Perfiles psicológicos ───────────────────────────────────
DecidIA.PROFILES = {
  analytical: {
    id: 'analytical',
    name: 'Analítico',
    icon: '🧮',
    description: 'Tomas decisiones con datos y lógica. Valoras la certeza.',
    traits: ['Metodológico', 'Preciso', 'Cauteloso'],
    color: 'teal',
  },
  impulsive: {
    id: 'impulsive',
    name: 'Impulsivo',
    icon: '⚡',
    description: 'Actúas rápido y confías en tu instinto del momento.',
    traits: ['Veloz', 'Apasionado', 'Espontáneo'],
    color: 'danger',
  },
  conservative: {
    id: 'conservative',
    name: 'Conservador',
    icon: '🛡️',
    description: 'Prefieres la seguridad y minimizar riesgos.',
    traits: ['Prudente', 'Estable', 'Confiable'],
    color: 'warning',
  },
  explorer: {
    id: 'explorer',
    name: 'Explorador',
    icon: '🧭',
    description: 'Buscas nuevas experiencias y te adaptas bien al cambio.',
    traits: ['Curioso', 'Flexible', 'Creativo'],
    color: 'violet',
  },
  strategist: {
    id: 'strategist',
    name: 'Estratega',
    icon: '♟️',
    description: 'Piensas a largo plazo y ves el panorama completo.',
    traits: ['Visionario', 'Planificador', 'Paciente'],
    color: 'success',
  },
};

// ── Niveles de gamificación ─────────────────────────────────
DecidIA.LEVELS = [
  { id: 1, name: 'Novato',               min: 0,   max: 9,   icon: '🌱', color: '#9898C8' },
  { id: 2, name: 'Explorador',           min: 10,  max: 29,  icon: '🧭', color: '#00D4CC' },
  { id: 3, name: 'Estratega',            min: 30,  max: 59,  icon: '♟️', color: '#6C3EFF' },
  { id: 4, name: 'Visionario',           min: 60,  max: 99,  icon: '👁️', color: '#FFB547' },
  { id: 5, name: 'Maestro de Decisiones', min: 100, max: Infinity, icon: '⚡', color: '#22D47B' },
];

// ── Insignias ───────────────────────────────────────────────
DecidIA.BADGES = [
  { id: 'first_question', name: 'Primera Consulta', icon: '🎯', description: 'Hiciste tu primera pregunta al oráculo.', xp: 10  },
  { id: 'lucky_streak',   name: 'Racha de Suerte',  icon: '🎰', description: '5 respuestas positivas consecutivas.',      xp: 25  },
  { id: 'deep_thinker',   name: 'Pensador Profundo', icon: '🧠', description: 'Completaste el perfil psicológico.',        xp: 50  },
  { id: 'ai_pioneer',     name: 'Pionero IA',        icon: '🤖', description: 'Primera consulta con análisis de IA.',     xp: 30  },
  { id: 'century',        name: 'Centenario',        icon: '💯', description: '100 decisiones tomadas.',                  xp: 100 },
  { id: 'perfectionist',  name: 'Perfeccionista',    icon: '✨', description: '90% de decisiones exitosas.',             xp: 75  },
];

// ── Preguntas de perfilamiento ──────────────────────────────
DecidIA.PROFILE_QUESTIONS = [
  // Perfil emocional
  {
    id: 'stress',
    section: 'emotional',
    question: '¿Cómo describes tu nivel de estrés esta semana?',
    emoji: '😤',
    type: 'scale',
    options: ['Muy bajo', 'Bajo', 'Moderado', 'Alto', 'Muy alto'],
  },
  {
    id: 'optimism',
    section: 'emotional',
    question: 'Cuando te enfrentas a una decisión difícil, ¿qué sientes primero?',
    emoji: '🌤️',
    type: 'choice',
    options: ['Emoción y curiosidad', 'Calma y análisis', 'Nervios y dudas', 'Indiferencia'],
  },
  {
    id: 'confidence',
    section: 'emotional',
    question: '¿Qué tan seguido dudas de tus decisiones después de tomarlas?',
    emoji: '🤔',
    type: 'scale',
    options: ['Casi nunca', 'Pocas veces', 'A veces', 'Frecuentemente', 'Siempre'],
  },
  // Perfil psicológico (Big Five / DISC simplificado)
  {
    id: 'decision_speed',
    section: 'psychological',
    question: 'Tienes que elegir un restaurante ahora mismo. ¿Qué haces?',
    emoji: '🍽️',
    type: 'choice',
    options: [
      'Elijo el primero que veo',
      'Leo reseñas y comparo opciones',
      'Pregunto a alguien de confianza',
      'Me quedo con el de siempre',
    ],
  },
  {
    id: 'risk_tolerance',
    section: 'psychological',
    question: 'Te ofrecen duplicar tu salario pero cambiar de carrera. ¿Qué priorizas?',
    emoji: '💼',
    type: 'choice',
    options: [
      'El dinero — lo tomo',
      'Lo analizo con datos durante semanas',
      'La estabilidad — no cambio',
      'La aventura — lo intento',
    ],
  },
  {
    id: 'information_style',
    section: 'psychological',
    question: 'Antes de decidir algo importante, ¿cuánta información necesitas?',
    emoji: '📊',
    type: 'scale',
    options: ['Solo intuición', 'Algo de contexto', 'Bastante info', 'Toda la disponible', 'Nunca es suficiente'],
  },
  {
    id: 'long_term',
    section: 'psychological',
    question: '¿Con qué horizonte de tiempo sueles tomar decisiones?',
    emoji: '🗓️',
    type: 'choice',
    options: ['El presente', '1–6 meses', '1–3 años', 'Más de 5 años'],
  },
];

// ── Ejemplos de preguntas para el placeholder ───────────────
DecidIA.QUESTION_EXAMPLES = [
  '¿Debo aceptar este trabajo?',
  '¿Le escribo hoy?',
  '¿Compro ese producto?',
  '¿Hago ese viaje?',
  '¿Me cambio de carrera?',
  '¿Es el momento de emprender?',
  '¿Debo tener esa conversación?',
  '¿Sigo adelante con este proyecto?',
];

// ── Estado de la app ────────────────────────────────────────
DecidIA.state = {
  user: null,           // null = no autenticado
  currentQuestion: '',
  lastResult: null,
  history: [],
  xp: 0,
  badges: [],
  profileCompleted: false,
  psychProfile: null,
  emotionalIndex: null,
};

// ── Helpers ─────────────────────────────────────────────────
DecidIA.getRandomResponse = function(forcedCategory = null) {
  const categories = Object.keys(DecidIA.RESPONSES);
  const weights = [0.45, 0.25, 0.20, 0.10]; // pos, neg, neutral, mysterious
  
  let category = forcedCategory;
  if (!category) {
    const rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (rand < cumulative) {
        category = categories[i];
        break;
      }
    }
  }
  
  const pool = DecidIA.RESPONSES[category];
  return pool[Math.floor(Math.random() * pool.length)];
};

DecidIA.getLevelFromXP = function(xp) {
  return DecidIA.LEVELS.find(l => xp >= l.min && xp <= l.max) || DecidIA.LEVELS[0];
};

DecidIA.getXPProgress = function(xp) {
  const level = DecidIA.getLevelFromXP(xp);
  if (level.max === Infinity) return 100;
  const range = level.max - level.min;
  const progress = xp - level.min;
  return Math.round((progress / range) * 100);
};

window.DecidIA = DecidIA;
