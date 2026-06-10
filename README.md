# DecidIA 🔮

**Tu asistente de decisiones — Casino Edition**

Haz una pregunta y deja que el oráculo (o la IA) responda.

## 🚀 Deploy en GitHub Pages

1. Sube todos los archivos a un repositorio en GitHub
2. Ve a **Settings → Pages**
3. En *Source*, selecciona **Deploy from a branch**
4. Rama: `main`, carpeta: `/ (root)`
5. Guarda — en minutos estará en `https://tuusuario.github.io/decidia/`

## 📁 Estructura

```
/
├── index.html          ← Página principal
├── css/
│   ├── tokens.css      ← Variables / design tokens
│   ├── global.css      ← Reset, componentes globales
│   └── home.css        ← Estilos de la home (casino layout)
├── js/
│   ├── models.js       ← Datos, respuestas, perfiles
│   ├── oracle.js       ← Animación del tambor + partículas
│   └── home.js         ← Controlador principal
└── README.md
```

## ✨ Características

- 🎰 Slot machine animado estilo casino
- 🌟 Partículas interactivas con burst en resultado
- 📱 Completamente responsivo (mobile-first)
- 🌙 Dark theme con neón violet/teal
- 💾 Historial en localStorage (hasta 50 consultas)
- 🔒 Sin dependencias externas (vanilla JS)
