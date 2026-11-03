// ===== התמונות שלנו =====
const photos = [
  'WhatsApp Image 2026-11-03 at 13.08.06 (1).jpeg',
  'WhatsApp Image 2026-11-03 at 13.08.06.jpeg',
  'WhatsApp Image 2026-11-03 at 13.08.06 (2).jpeg',
  'WhatsApp Image 2026-11-03 at 13.08.06 (4).jpeg',
  'WhatsApp Image 2026-11-03 at 13.08.06 (3).jpeg',
].map((name) => encodeURI(name));

// כל עמוד מקבל תמונה קבועה משלו (עמוד 1 = התמונה שלנו מהרכב)
document.querySelectorAll('.page').forEach((page, i) => {
  const img = page.querySelector('.photo');
  if (img) img.src = photos[i % photos.length];
});

// ===== שיר רקע (ווליום חלש-בינוני) =====
const music = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-btn');
const VOLUME = 0.3;
music.volume = VOLUME;

// באייפון אי אפשר לשנות volume ישירות - מנמיכים דרך Web Audio.
// עובד רק כשהאתר עלה לאינטרנט (http/https), לא כקובץ מקומי.
let audioCtx = null;
const setupQuietAudio = () => {
  if (audioCtx || !location.protocol.startsWith('http')) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  try {
    audioCtx = new Ctx();
    const gain = audioCtx.createGain();
    gain.gain.value = VOLUME;
    audioCtx.createMediaElementSource(music).connect(gain).connect(audioCtx.destination);
    music.volume = 1; // הווליום נשלט עכשיו דרך ה-gain
  } catch (e) {
    audioCtx = null;
  }
};

const startMusic = () => {
  if (!music.paused || music.dataset.muted) return;
  setupQuietAudio();
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  music.play().catch(() => {});
};

musicBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (music.paused) {
    delete music.dataset.muted;
    music.play().catch(() => {});
    musicBtn.textContent = '🔊';
  } else {
    music.dataset.muted = '1';
    music.pause();
    musicBtn.textContent = '🔇';
  }
});

// ===== פיצוץ לבבות ורודים מנקודת הלחיצה =====
const pinkBits = ['💖', '🎀', '🌸', '💕', '💗', '✨', '🩷', '💞'];

const burst = (x, y, count = 26) => {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'burst';
    el.textContent = pinkBits[Math.floor(Math.random() * pinkBits.length)];
    const angle = Math.random() * Math.PI * 2;
    const dist = 90 + Math.random() * 170;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
    el.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
    el.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    el.style.fontSize = 16 + Math.random() * 20 + 'px';
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
};

// ===== מעבר עמוד חמוד =====
const transitionEl = document.getElementById('transition');
let transitioning = false;

const showPage = (id, fromEl) => {
  if (transitioning) return;
  transitioning = true;

  // נקודת המוצא - מרכז הכפתור שנלחץ
  const r = fromEl ? fromEl.getBoundingClientRect() : null;
  const x = r ? r.left + r.width / 2 : window.innerWidth / 2;
  const y = r ? r.top + r.height / 2 : window.innerHeight / 2;
  transitionEl.style.setProperty('--x', x + 'px');
  transitionEl.style.setProperty('--y', y + 'px');

  burst(x, y);
  transitionEl.className = 'covering';

  setTimeout(() => {
    document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo({ top: 0 });
  }, 650);

  setTimeout(() => { transitionEl.className = 'revealing'; }, 1150);

  setTimeout(() => {
    transitionEl.className = '';
    transitioning = false;
  }, 1750);
};

// ===== עמוד 1: כפתור "מעדיף להישאר בבית" בורח =====
const yesBtn = document.querySelector('.yes-btn');
const noBtn = document.querySelector('.no-btn');
const isTouch = window.matchMedia('(hover: none)').matches;
let noBtnEscaped = false;
let noBtnInterval = null;

const initNoBtn = () => {
  if (noBtnEscaped) return;
  const rect = noBtn.getBoundingClientRect();
  document.body.appendChild(noBtn);
  Object.assign(noBtn.style, {
    position: 'fixed',
    margin: '0',
    width: rect.width + 'px',
    left: rect.left + 'px',
    top: rect.top + 'px',
    zIndex: '9999',
    transition: 'left 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
  });
  noBtnEscaped = true;
};

const moveNoBtn = () => {
  const r = noBtn.getBoundingClientRect();
  const angle = Math.random() * 2 * Math.PI;
  const distance = 110 + Math.random() * 90;
  noBtn.style.left = Math.max(10, Math.min(window.innerWidth - r.width - 10,
    r.left + Math.cos(angle) * distance)) + 'px';
  noBtn.style.top = Math.max(10, Math.min(window.innerHeight - r.height - 10,
    r.top + Math.sin(angle) * distance)) + 'px';
};

const escape = (e) => {
  if (e) e.preventDefault();
  initNoBtn();
  moveNoBtn();
};

noBtn.addEventListener('mouseenter', escape);
noBtn.addEventListener('touchstart', escape);
noBtn.addEventListener('click', escape);

// בטלפון הכפתור מתחיל לברוח לבד - רק אחרי שהמעטפה נפתחה
const startNoBtnRunaway = () => {
  if (!isTouch) return;
  setTimeout(() => {
    escape();
    noBtnInterval = setInterval(moveNoBtn, 2000);
  }, 1500);
};

// ===== מסך פתיחה: מעטפה =====
const intro = document.getElementById('intro');
const envelope = intro.querySelector('.envelope');
const page1 = document.getElementById('page-1');
page1.classList.remove('active'); // העמוד הראשון מחכה מאחורי המעטפה

envelope.addEventListener('click', () => {
  if (intro.classList.contains('shaking')) return;
  startMusic();
  intro.classList.add('shaking');

  setTimeout(() => {
    intro.classList.add('opened');
    const r = envelope.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 3, 34);
  }, 750);

  setTimeout(() => intro.classList.add('leaving'), 2300);

  setTimeout(() => {
    intro.remove();
    page1.classList.add('active');
    startNoBtnRunaway();
  }, 2900);
}, { once: false });

yesBtn.addEventListener('click', () => {
  noBtn.style.display = 'none';
  if (noBtnInterval) clearInterval(noBtnInterval);
  showPage('page-2', yesBtn);
});

// ===== עמוד 2: בחירת מוד =====
document.querySelectorAll('.option-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.option-btn').forEach((b) => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('mode-text').textContent = btn.dataset.mode;
    setTimeout(() => showPage('page-3', btn), 300);
  });
});

// ===== עמוד 3: יוצאים למסע =====
const goBtn = document.querySelector('.go-btn');
goBtn.addEventListener('click', () => {
  showPage('page-4', goBtn);
  setTimeout(launchConfetti, 1150);
});

// ===== קונפטי =====
const launchConfetti = () => {
  const emojis = ['🎀', '💖', '🎂', '🌸', '💕', '😘', '🩷', '✨', '🎈'];
  for (let i = 0; i < 40; i++) {
    const el = document.createElement('span');
    el.className = 'confetti';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.animationDuration = 2.5 + Math.random() * 2.5 + 's';
    el.style.animationDelay = Math.random() * 1.2 + 's';
    el.style.fontSize = 18 + Math.random() * 18 + 'px';
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
};
