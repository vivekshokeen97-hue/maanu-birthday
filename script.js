const intro = document.getElementById("intro");
const birthdayWorld = document.getElementById("birthdayWorld");
const openGift = document.getElementById("openGift");
const soundButton = document.getElementById("soundButton");
const soundLabel = soundButton.querySelector(".sound-button__label");
const progressBar = document.getElementById("progressBar");
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");
const countdown = document.getElementById("countdown");
const countdownKicker = document.getElementById("countdownKicker");
const countdownDays = document.getElementById("countdownDays");
const countdownHours = document.getElementById("countdownHours");
const countdownMinutes = document.getElementById("countdownMinutes");
const countdownSeconds = document.getElementById("countdownSeconds");
const footerTitle = document.getElementById("footerTitle");
const footerCopy = document.getElementById("footerCopy");
const birthdayMoment = new Date("2026-09-10T00:00:00+05:30").getTime();

document.body.classList.add("is-locked");

let audioContext;
let isSoundOn = true;
let musicTimer;
let confettiPieces = [];
let confettiFrame;

function ensureAudio() {
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioContext = new AudioContext();
  }
  if (audioContext?.state === "suspended") audioContext.resume();
}

function playTone(frequency, start, duration, volume = 0.035, type = "sine") {
  if (!isSoundOn || !audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.04);
}

function playChime() {
  ensureAudio();
  if (!audioContext || !isSoundOn) return;
  const now = audioContext.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((note, index) => {
    playTone(note, now + index * 0.12, 0.7, 0.045);
  });
}

function startMusic() {
  if (!isSoundOn || !audioContext) return;
  clearInterval(musicTimer);
  const progression = [
    [261.63, 329.63, 392.0],
    [220.0, 261.63, 329.63],
    [174.61, 220.0, 261.63],
    [196.0, 246.94, 293.66],
  ];
  let chord = 0;
  const playChord = () => {
    if (!isSoundOn || !audioContext) return;
    const now = audioContext.currentTime;
    progression[chord].forEach((note, index) => {
      playTone(note * 2, now + index * 0.08, 2.2, 0.02, "sine");
    });
    chord = (chord + 1) % progression.length;
  };
  window.setTimeout(playChord, 850);
  musicTimer = window.setInterval(playChord, 2500);
}

function twoDigits(value) {
  return String(Math.max(0, value)).padStart(2, "0");
}

function updateCountdown() {
  const distance = birthdayMoment - Date.now();
  if (distance <= 0) {
    countdownDays.textContent = "00";
    countdownHours.textContent = "00";
    countdownMinutes.textContent = "00";
    countdownSeconds.textContent = "00";
    countdown.classList.add("is-birthday");
    countdownKicker.textContent = "The wait is over · 10 September";
    footerTitle.innerHTML = "Happy 28th,<br /><em>Maanu.</em>";
    footerCopy.textContent = "Your first birthday as my wife is finally here—and your happiest year starts now.";
    return;
  }

  const totalSeconds = Math.floor(distance / 1000);
  countdownDays.textContent = twoDigits(Math.floor(totalSeconds / 86400));
  countdownHours.textContent = twoDigits(Math.floor((totalSeconds % 86400) / 3600));
  countdownMinutes.textContent = twoDigits(Math.floor((totalSeconds % 3600) / 60));
  countdownSeconds.textContent = twoDigits(totalSeconds % 60);
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function burstConfetti(amount = 150) {
  resizeCanvas();
  const colors = ["#ff5c8a", "#ffd66b", "#8ad5e6", "#ffffff", "#d58be8"];
  for (let i = 0; i < amount; i += 1) {
    confettiPieces.push({
      x: window.innerWidth * (0.25 + Math.random() * 0.5),
      y: window.innerHeight * (0.25 + Math.random() * 0.18),
      vx: (Math.random() - 0.5) * 14,
      vy: -5 - Math.random() * 9,
      gravity: 0.18 + Math.random() * 0.09,
      drag: 0.985,
      size: 5 + Math.random() * 7,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.24,
      life: 1,
    });
  }
  if (!confettiFrame) animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  confettiPieces = confettiPieces.filter((piece) => piece.life > 0);
  confettiPieces.forEach((piece) => {
    piece.vx *= piece.drag;
    piece.vy += piece.gravity;
    piece.x += piece.vx;
    piece.y += piece.vy;
    piece.rotation += piece.spin;
    if (piece.y > window.innerHeight + 30) piece.life = 0;

    ctx.save();
    ctx.globalAlpha = Math.min(1, piece.life * 2);
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.rotation);
    ctx.fillStyle = piece.color;
    ctx.fillRect(-piece.size / 2, -piece.size / 3, piece.size, piece.size * 0.66);
    ctx.restore();
  });

  if (confettiPieces.length) {
    confettiFrame = requestAnimationFrame(animateConfetti);
  } else {
    cancelAnimationFrame(confettiFrame);
    confettiFrame = null;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

openGift.addEventListener("click", () => {
  ensureAudio();
  playChime();
  startMusic();
  burstConfetti(190);
  intro.classList.add("is-open");
  birthdayWorld.removeAttribute("inert");
  document.body.classList.remove("is-locked");
  window.setTimeout(() => document.getElementById("top").focus?.(), 850);
});

soundButton.addEventListener("click", () => {
  isSoundOn = !isSoundOn;
  soundButton.setAttribute("aria-pressed", String(isSoundOn));
  soundLabel.textContent = isSoundOn ? "Sound on" : "Sound off";
  if (isSoundOn) {
    ensureAudio();
    playChime();
    startMusic();
  } else {
    clearInterval(musicTimer);
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 80}ms`;
  revealObserver.observe(element);
});

window.addEventListener(
  "scroll",
  () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = `${Math.min(progress, 100)}%`;
  },
  { passive: true },
);

document.querySelectorAll(".reason-card").forEach((card) => {
  card.addEventListener("click", () => {
    card.classList.toggle("is-flipped");
    if (card.classList.contains("is-flipped")) playChime();
  });
});

const photoStack = document.getElementById("photoStack");
photoStack.querySelectorAll(".polaroid").forEach((photo) => {
  photo.addEventListener("click", () => {
    const photos = [...photoStack.querySelectorAll(".polaroid")];
    const classNames = photos.map((item) => [...item.classList].find((name) => name.startsWith("polaroid--")));
    photos.forEach((item, index) => {
      item.classList.remove(classNames[index]);
      item.classList.add(classNames[(index + 1) % classNames.length]);
    });
  });
});

const flame = document.getElementById("flame");
const blowCandle = document.getElementById("blowCandle");
const wishMessage = document.getElementById("wishMessage");
let candleTimer;
let candleOut = false;

function beginBlow() {
  if (candleOut) return;
  blowCandle.textContent = "Keep holding…";
  candleTimer = window.setTimeout(() => {
    candleOut = true;
    flame.classList.add("is-out");
    blowCandle.textContent = "Wish made ✦";
    wishMessage.classList.add("is-visible");
    playChime();
    burstConfetti(180);
  }, 1200);
}

function cancelBlow() {
  clearTimeout(candleTimer);
  if (!candleOut) blowCandle.textContent = "Hold to blow out the candle";
}

["pointerdown", "keydown"].forEach((eventName) => {
  blowCandle.addEventListener(eventName, (event) => {
    if (eventName === "keydown" && event.key !== " " && event.key !== "Enter") return;
    if (eventName === "keydown") event.preventDefault();
    beginBlow();
  });
});

["pointerup", "pointerleave", "pointercancel", "keyup"].forEach((eventName) => {
  blowCandle.addEventListener(eventName, cancelBlow);
});

const envelope = document.getElementById("envelope");
envelope.addEventListener("click", () => {
  const willOpen = !envelope.classList.contains("is-open");
  envelope.classList.toggle("is-open", willOpen);
  envelope.setAttribute("aria-expanded", String(willOpen));
  if (willOpen) playChime();
});

document.getElementById("replayConfetti").addEventListener("click", () => {
  playChime();
  burstConfetti(220);
});

let lastTrailAt = 0;
window.addEventListener("pointermove", (event) => {
  if (event.pointerType === "touch" || performance.now() - lastTrailAt < 80) return;
  lastTrailAt = performance.now();
  const heart = document.createElement("span");
  heart.className = "heart-trail";
  heart.textContent = Math.random() > 0.35 ? "♡" : "✦";
  heart.style.left = `${event.clientX}px`;
  heart.style.top = `${event.clientY}px`;
  document.body.appendChild(heart);
  window.setTimeout(() => heart.remove(), 900);
});

window.addEventListener("resize", resizeCanvas);
