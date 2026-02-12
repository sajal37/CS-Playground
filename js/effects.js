import { $$, refs } from "./dom.js";
import { setEmotionalPhase, state } from "./state.js";
import {
  BOOT_MESSAGES,
  FAKE_LAG_RECOVERIES,
  HERO_RECOVERY_MESSAGES,
  HERO_SATISFACTIONS,
  HERO_TAKEAWAYS,
  PRESENCE_POOL,
  WHISPERS,
} from "../content/site.js";

export function showReaction(text, mood) {
  const inlineReaction = refs.inlineReaction;
  if (!inlineReaction) return;
  if (text === state.lastReaction && mood === state.lastReactionMood) return;
  state.lastReaction = text;
  state.lastReactionMood = mood;

  clearTimeout(state.reactionTimer);

  inlineReaction.className = "inline-reaction";
  inlineReaction.textContent = text;
  if (mood) inlineReaction.classList.add("mood-" + mood);

  void inlineReaction.offsetWidth;
  inlineReaction.classList.add("show");

  state.reactionTimer = setTimeout(() => {
    inlineReaction.classList.remove("show");
  }, 2500);
}

export function setStatus(mood, text) {
  showReaction(text, mood);
}

export function triggerGlitch() {
  if (state.glitchCooldown) return;
  state.glitchCooldown = true;

  const overlay = refs.glitchOverlay;
  if (overlay) {
    overlay.classList.add("active");
    setTimeout(() => overlay.classList.remove("active"), 200);
  }

  setTimeout(() => {
    state.glitchCooldown = false;
  }, 8000);
}

export function flashSystemMessage(text) {
  const flash = refs.sysFlash;
  if (!flash) return;
  flash.textContent = text;
  flash.classList.remove("show");
  void flash.offsetWidth;
  flash.classList.add("show");
  setTimeout(() => flash.classList.remove("show"), 1600);
}

export function triggerFakeLag() {
  document.body.classList.add("fake-freeze");
  setStatus("danger", "lag spike.");
  setTimeout(() => {
    document.body.classList.remove("fake-freeze");
    setStatus(
      "online",
      FAKE_LAG_RECOVERIES[Math.floor(Math.random() * FAKE_LAG_RECOVERIES.length)],
    );
  }, 800);
}

export function triggerStatusFlicker() {
  showReaction("—", "danger");
  setTimeout(() => {
    showReaction("all clear.", "online");
  }, 400);
}

export function triggerNavNervous() {
  refs.navLogo?.classList.add("nervous");
  setTimeout(() => refs.navLogo?.classList.remove("nervous"), 600);
}

export function startAmbientWhispers() {
  setInterval(() => {
    if (!state.booted) return;
    if (state.currentScreen === "philosophy") return;
    if (Math.random() < 0.3) {
      flashSystemMessage(WHISPERS[Math.floor(Math.random() * WHISPERS.length)]);
    }
  }, 45000);
}

function getPresenceMessage() {
  let pool;

  const screenTime = Date.now() - (state.screenEnteredAt || Date.now());
  if (screenTime > 30000 && Math.random() < 0.4) {
    pool = PRESENCE_POOL.impatient;
  } else if (state.heroClicked) {
    pool = PRESENCE_POOL.postBreak;
  } else if (state.currentScreen === "concepts") {
    pool = PRESENCE_POOL.concepts;
  } else if (state.currentScreen === "philosophy") {
    pool = PRESENCE_POOL.philosophy;
  } else if (state.mouseIdle) {
    pool = PRESENCE_POOL.idle;
  } else {
    pool = PRESENCE_POOL.watching;
  }

  if (Math.random() < 0.15) {
    const keys = Object.keys(PRESENCE_POOL);
    pool = PRESENCE_POOL[keys[Math.floor(Math.random() * keys.length)]];
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

export function startPresence() {
  function tick() {
    if (!state.booted) return;
    setStatus(state.heroClicked ? "thinking" : "online", getPresenceMessage());
    setTimeout(tick, state.speedrun ? 3000 : 5000 + Math.random() * 3000);
  }
  setTimeout(tick, state.speedrun ? 3000 : 5000 + Math.random() * 3000);
}

export function runBootSequence() {
  const container = refs.bootLines;
  if (!container) return;

  if (state.speedrun) {
    BOOT_MESSAGES.forEach((msg) => {
      const line = document.createElement("div");
      line.className = "boot-line visible";
      line.innerHTML = msg.text;
      container.appendChild(line);
    });
    revealHero();
    return;
  }

  BOOT_MESSAGES.forEach((msg, i) => {
    setTimeout(() => {
      const line = document.createElement("div");
      line.className = "boot-line";
      line.innerHTML = msg.text;
      container.appendChild(line);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => line.classList.add("visible"));
      });

      if (i === BOOT_MESSAGES.length - 1) {
        setTimeout(() => revealHero(), 600);
      }
    }, msg.delay);
  });
}

export function revealHero() {
  state.booted = true;
  setEmotionalPhase("curiosity");

  if (refs.bootSequence) {
    refs.bootSequence.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    refs.bootSequence.style.opacity = "0";
    refs.bootSequence.style.transform = "translateY(-10px)";
    setTimeout(() => {
      refs.bootSequence.style.display = "none";
    }, 500);
  }

  const reveals = [
    { el: refs.heroTagline, delay: state.speedrun ? 0 : 100 },
    { el: refs.heroSubline, delay: state.speedrun ? 0 : 400 },
    { el: refs.heroCta, delay: state.speedrun ? 0 : 700 },
    { el: refs.scrollHint, delay: state.speedrun ? 0 : 1200 },
  ];

  reveals.forEach(({ el, delay }) => {
    if (el) {
      setTimeout(() => {
        el.style.transition =
          "opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)";
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, delay);
    }
  });

  setStatus("online", "systems nominal");
  setTimeout(() => triggerGlitch(), state.speedrun ? 1000 : 4000);
  setTimeout(() => startPresence(), state.speedrun ? 500 : 2000);
}

export function revealConcepts() {
  if (state.conceptsRevealed) return;
  state.conceptsRevealed = true;

  refs.conceptsTitle?.classList.add("in-view");

  setTimeout(() => {
    refs.systemPulse?.classList.add("in-view");
  }, 150);

  setTimeout(() => {
    showReaction("okay. here we go.", "thinking");
  }, 400);

  setTimeout(() => {
    refs.conceptsSubtitle?.classList.add("in-view");
  }, 200);

  setTimeout(() => {
    refs.categoryFilter?.classList.add("in-view");
  }, 300);

  const cards = $$(".concept-card");
  const revealBatch = Math.min(cards.length, 12);
  cards.forEach((card, i) => {
    if (i < revealBatch) {
      setTimeout(
        () => {
          card.classList.add("in-view");
        },
        state.speedrun ? 10 * i : 200 + i * 40,
      );
    } else {
      setTimeout(
        () => card.classList.add("in-view"),
        state.speedrun ? 200 : 200 + revealBatch * 40,
      );
    }
  });

  setTimeout(
    () => {
      refs.conceptsWhisper?.classList.add("in-view");
    },
    state.speedrun ? 200 : 200 + revealBatch * 40 + 200,
  );

  setTimeout(() => {
    if (state.heroClicked) {
      setStatus("online", "you're getting somewhere.");
    }
  }, 2000);
}

export function revealPhilosophy() {
  if (state.philRevealed) return;
  state.philRevealed = true;

  refs.philTitle?.classList.add("in-view");

  setTimeout(() => {
    refs.philThreat?.classList.add("in-view");
  }, 300);

  const rules = $$(".rule-item");
  const delays = state.speedrun
    ? rules.length > 0
      ? Array.from(rules, (_, i) => 100 + i * 50)
      : []
    : [500, 650, 850, 1100, 1300, 1500, 1700, 1900, 2100, 2300];

  rules.forEach((rule, i) => {
    setTimeout(
      () => {
        rule.classList.add("visible");
      },
      delays[i] || 500 + i * 150,
    );
  });

  setTimeout(
    () => {
      refs.philFooter?.classList.add("in-view");
    },
    (delays[rules.length - 1] || 2300) + 600,
  );

  setTimeout(
    () => {
      setStatus("online", "rules enforced.");
    },
    (delays[rules.length - 1] || 2300) + 1000,
  );
}

export function applyHeroRecovery() {
  refs.nav?.classList.remove("alert");
  refs.cursorGlow?.classList.remove("danger");
  refs.cursorGlow?.classList.add("success");

  const msg = HERO_RECOVERY_MESSAGES[Math.floor(Math.random() * HERO_RECOVERY_MESSAGES.length)];
  showReaction(msg, "success");

  setTimeout(() => {
    setEmotionalPhase("satisfaction");
    flashSystemMessage(HERO_SATISFACTIONS[Math.floor(Math.random() * HERO_SATISFACTIONS.length)]);
  }, 1500);

  setTimeout(() => {
    refs.cursorGlow?.classList.remove("success");
  }, 2000);
}

export function applyHeroTakeaway(btnText, btnIcon) {
  btnText.textContent = HERO_TAKEAWAYS[Math.floor(Math.random() * HERO_TAKEAWAYS.length)];
  btnIcon.textContent = "↓";
  refs.heroBtn.style.background = "linear-gradient(135deg, #22c55e, #16a34a)";

  if (refs.heroWhisper) {
    refs.heroWhisper.textContent = "scroll down.";
    refs.heroWhisper.classList.remove("loud");
  }
}
