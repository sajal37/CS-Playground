import { $, $$, refs } from "./dom.js";
import { setEmotionalPhase, state } from "./state.js";
import {
  applyHeroRecovery,
  applyHeroTakeaway,
  flashSystemMessage,
  revealConcepts,
  revealPhilosophy,
  runBootSequence,
  setStatus,
  showReaction,
  startAmbientWhispers,
  triggerGlitch,
} from "./effects.js";
import {
  getCategoryMeta,
  renderCategoryTabs,
  renderConceptCards,
  setActiveCategory,
} from "./rendering.js";
import {
  BEHAVIOR_INTERRUPT,
  EMPTY_CLICK_REACTIONS,
  HERO_HOVER_REACTIONS,
  INTERACTION_VALIDATIONS,
  LOCKED_RESPONSES,
  MOMENTUM_WINS,
  MOUSE_RETURN_MESSAGES,
  RETURN_GREETINGS,
  RULE_DEMO_RESULTS,
  RULE_REACTIONS,
} from "../content/site.js";

let pendingMouseX = -200;
let pendingMouseY = -200;
let cursorRafPending = false;

function updateCursorGlow() {
  if (refs.cursorGlow) {
    refs.cursorGlow.style.translate = `${pendingMouseX - 200}px ${pendingMouseY - 200}px`;
  }
  cursorRafPending = false;
}

export function bindCursorTracking() {
  document.addEventListener("mousemove", (e) => {
    pendingMouseX = e.clientX;
    pendingMouseY = e.clientY;
    if (!cursorRafPending) {
      cursorRafPending = true;
      requestAnimationFrame(updateCursorGlow);
    }
    state.lastMouseMove = Date.now();

    if (state.mouseIdle) {
      state.mouseIdle = false;
      onMouseReturn();
    }
    clearTimeout(state.idleTimer);
    state.idleTimer = setTimeout(() => {
      state.mouseIdle = true;
      onMouseIdle();
    }, 20000);
  });
}

export function startBoot() {
  setTimeout(runBootSequence, 300);
  startAmbientWhispers();
}

export function trackInteraction(type) {
  state.interactions++;

  if (state.momentumIndex < state.momentumHits.length) {
    if (state.interactions === state.momentumHits[state.momentumIndex]) {
      const win = MOMENTUM_WINS[state.momentumIndex];
      showReaction(win.text, win.mood);
      state.momentumIndex++;
    }
  }

  if (type === "scroll" && state.interactions === 3) {
    showReaction("that was clean.", "success");
  }
  if (type === "explore" && state.interactions > 8) {
    if (Math.random() < 0.25) {
      showReaction(
        INTERACTION_VALIDATIONS[Math.floor(Math.random() * INTERACTION_VALIDATIONS.length)],
        "success",
      );
    }
  }

  if (type === "category" && state.categoriesExplored.size === 3) {
    showReaction("you're thorough. nice.", "success");
  }
  if (type === "category" && state.categoriesExplored.size === 6) {
    showReaction("covering all the bases.", "thinking");
  }

  if (type === "rule-view") {
    state.rulesViewed++;
    if (state.rulesViewed === 3) {
      showReaction("you get it.", "success");
    }
  }

  if (state.interactions === 3 && state.emotionalPhase === "curiosity") {
    setEmotionalPhase("tension");
  } else if (state.interactions === 10 && state.emotionalPhase === "tension") {
    setEmotionalPhase("relief");
  } else if (state.interactions === 20 && state.emotionalPhase === "relief") {
    setEmotionalPhase("satisfaction");
  } else if (state.interactions === 35) {
    setEmotionalPhase("confidence");
  }
}

function onMouseIdle() {
  if (!state.booted) return;

  setTimeout(() => {
    if (state.mouseIdle) showReaction("you still there?", "thinking");
  }, 3000);
  setTimeout(() => {
    if (state.mouseIdle) showReaction("...hello?", "thinking");
  }, 10000);
  setTimeout(() => {
    if (state.mouseIdle) {
      showReaction("the cursor is lonely.", "danger");
    }
  }, 20000);
}

function onMouseReturn() {
  if (!state.booted) return;
  const gone = Date.now() - state.lastMouseMove;
  if (gone > 30000) {
    showReaction("finally.", "success");
  } else if (gone > 15000) {
    showReaction("welcome back.", "online");
  } else if (gone > 8000) {
    setStatus(
      "online",
      MOUSE_RETURN_MESSAGES[Math.floor(Math.random() * MOUSE_RETURN_MESSAGES.length)],
    );
  }
  trackInteraction("return");
}

let lastInterruptTime = 0;
function maybeBehaviorInterrupt(reason) {
  if (!state.booted) return;
  if (state.currentScreen === "philosophy") return;
  const now = Date.now();
  if (now - lastInterruptTime < 20000) return;
  lastInterruptTime = now;

  if (reason === "rapid-scroll") {
    const msgs = BEHAVIOR_INTERRUPT.rapidScroll;
    showReaction(msgs[Math.floor(Math.random() * msgs.length)], "thinking");
  } else if (reason === "locked-spam") {
    triggerGlitch();
    showReaction("persistence. noted.", "danger");
  } else if (reason === "stale-screen") {
    const msgs = BEHAVIOR_INTERRUPT.staleScreen;
    showReaction(msgs[Math.floor(Math.random() * msgs.length)], "thinking");
  }
}

export function bindHeroInteractions() {
  refs.heroBtn?.addEventListener("click", () => {
    if (state.heroClicked) return;
    state.heroClicked = true;
    trackInteraction("hero-break");

    const btnText = refs.heroBtn.querySelector(".btn-text");
    const btnIcon = refs.heroBtn.querySelector(".btn-icon");

    setEmotionalPhase("tension");
    btnText.textContent = "...";
    refs.heroBtn.classList.add("hesitate");
    setStatus("thinking", "processing...");

    setTimeout(() => {
      refs.heroBtn.classList.remove("hesitate");

      btnText.textContent = "Oh no.";
      btnIcon.textContent = "✕";
      refs.heroBtn.classList.remove("btn-danger");
      refs.heroBtn.style.background = "linear-gradient(135deg, #6366f1, #8b5cf6)";
      refs.heroBtn.style.pointerEvents = "none";

      refs.cursorGlow?.classList.add("danger");

      document.body.classList.add("shake-heavy");
      setTimeout(() => document.body.classList.remove("shake-heavy"), 700);

      refs.nav?.classList.add("alert");
      setStatus("danger", "SOMETHING BROKE");
      showReaction("something broke.", "danger");

      triggerGlitch();
      setTimeout(() => {
        state.glitchCooldown = false;
        triggerGlitch();
      }, 300);

      if (refs.ambientGrid) {
        refs.ambientGrid.classList.add("danger-flash");
        setTimeout(() => refs.ambientGrid.classList.remove("danger-flash"), 1500);
      }

      if (refs.heroWhisper) {
        refs.heroWhisper.textContent = "...told you.";
        refs.heroWhisper.classList.add("loud");
      }

      flashSystemMessage("you broke it.");

      setTimeout(() => {
        setEmotionalPhase("relief");
        applyHeroRecovery();
        applyHeroTakeaway(btnText, btnIcon);
      }, 2200);

      setTimeout(() => {
        setEmotionalPhase("confidence");
        if (refs.scrollContainer) {
          const conceptsSection = refs.scrollContainer.querySelector("#concepts");
          if (conceptsSection) {
            refs.scrollContainer.scrollTo({
              top: conceptsSection.offsetTop,
              behavior: "smooth",
            });
          }
        }
      }, 4500);
    }, 500);
  });

  refs.heroBtn?.addEventListener("mouseenter", () => {
    if (state.heroClicked) return;
    state.heroHovers++;
    trackInteraction("hover");

    if (refs.heroWhisper) {
      const msg =
        state.heroHovers >= HERO_HOVER_REACTIONS.length
          ? HERO_HOVER_REACTIONS[HERO_HOVER_REACTIONS.length - 1]
          : HERO_HOVER_REACTIONS[state.heroHovers - 1];
      refs.heroWhisper.textContent = msg;
    }

    if (state.heroHovers === 1) {
      setEmotionalPhase("tension");
      setStatus("thinking", "hovering...");
    } else if (state.heroHovers === 3) {
      setStatus("thinking", "just click it already.");
    } else if (state.heroHovers >= 5) {
      setStatus("danger", "CLICK. IT.");
    }

    clearTimeout(state.heroHoverTimer);
    state.heroHoverTimer = setTimeout(() => {
      if (state.heroClicked) return;
      const btnText = refs.heroBtn?.querySelector(".btn-text");
      if (!btnText) return;

      if (state.heroHovers >= 4 && !state.heroTextChanged) {
        state.heroTextChanged = true;
        btnText.style.transition = "opacity 0.15s ease";
        btnText.style.opacity = "0";
        setTimeout(() => {
          btnText.textContent = "I dare you.";
          btnText.style.opacity = "1";
        }, 150);
      } else if (state.heroHovers === 2) {
        btnText.style.transition = "opacity 0.15s ease";
        btnText.style.opacity = "0";
        setTimeout(() => {
          btnText.textContent = "Break something";
          btnText.style.opacity = "1";
        }, 150);
      }
    }, 700);
  });

  refs.heroBtn?.addEventListener("mouseleave", () => {
    if (state.heroClicked) return;
    clearTimeout(state.heroHoverTimer);

    if (refs.heroWhisper) {
      refs.heroWhisper.textContent = "go on.";
    }

    if (state.heroTextChanged) {
      const btnText = refs.heroBtn?.querySelector(".btn-text");
      if (btnText) {
        btnText.style.transition = "opacity 0.15s ease";
        btnText.style.opacity = "0";
        setTimeout(() => {
          btnText.textContent = "Break something";
          btnText.style.opacity = "1";
          state.heroTextChanged = false;
        }, 150);
      }
    }

    if (state.heroHovers < 5) {
      setStatus("online", "waiting...");
    }
  });
}

export function initConcepts() {
  renderCategoryTabs();
  renderConceptCards();
  bindCategoryTabs();
  bindCardBehaviors();
}

export function bindCategoryTabs() {
  if (!refs.categoryFilter) return;
  refs.categoryFilter.querySelectorAll(".cat-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      setActiveCategory(tab.dataset.cat);
      refs.categoryFilter.querySelectorAll(".cat-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      renderConceptCards();
      bindCardBehaviors();
      trackInteraction("explore");

      if (state.activeCategory !== "all") {
        state.categoriesExplored.add(state.activeCategory);
        trackInteraction("category");
      }

      if (state.activeCategory !== "all") {
        const catMeta = getCategoryMeta(state.activeCategory);
        if (catMeta) {
          setStatus("thinking", `${catMeta.label.toLowerCase()}. interesting.`);
        }
      }
    });
  });
}

export function bindCardBehaviors() {
  $$(".concept-available").forEach((card) => {
    const navigateCard = () => {
      const href = card.dataset.href;
      if (href) {
        card.style.transform = "scale(0.97)";
        trackInteraction("explore");
        setTimeout(() => {
          window.location.href = href;
        }, 150);
      }
    };
    card.addEventListener("click", navigateCard);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        navigateCard();
      }
    });
  });

  $$(".concept-locked").forEach((card) => {
    const concept = card.dataset.concept;

    card.addEventListener("click", () => {
      card.classList.add("in-view");

      if (!state.lockedClickCount[concept]) state.lockedClickCount[concept] = 0;
      state.lockedClickCount[concept]++;
      const clicks = state.lockedClickCount[concept];
      trackInteraction("locked-click");

      card.style.animation = "none";
      void card.offsetWidth;
      card.style.animation = "locked-reject 0.4s ease";
      setTimeout(() => {
        card.style.animation = "";
      }, 450);

      let msg;
      if (Math.random() < 0.2 && clicks > 1) {
        msg = LOCKED_RESPONSES.rare[Math.floor(Math.random() * LOCKED_RESPONSES.rare.length)];
      } else {
        msg =
          clicks > LOCKED_RESPONSES.normal.length
            ? LOCKED_RESPONSES.normal[LOCKED_RESPONSES.normal.length - 1]
            : LOCKED_RESPONSES.normal[clicks - 1];
      }
      setStatus("thinking", msg);

      if (clicks <= 3) {
        showReaction(msg, "thinking");
      }

      state.totalLockedClicks++;
      if (state.totalLockedClicks % 6 === 0) {
        maybeBehaviorInterrupt("locked-spam");
      }

      if (clicks === 3) {
        triggerGlitch();
        showReaction("patience.", "danger");
      }
      if (clicks === 5) {
        showReaction("patience is a virtue you don't have.", "danger");
        setTimeout(() => {
          setStatus("danger", "...fine. unlocking—");
          setTimeout(() => {
            setStatus("thinking", "just kidding.");
            triggerGlitch();
          }, 1200);
        }, 500);
      }
      if (clicks === 8) {
        showReaction("okay, we respect the grind.", "success");
      }
    });

    card.addEventListener("mouseenter", () => {
      card.style.transition = "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)";
      card.style.borderColor = "rgba(239, 68, 68, 0.15)";
      trackInteraction("explore");
    });

    card.addEventListener("mouseleave", () => {
      card.style.borderColor = "";
    });
  });
}

export function bindNavLogo() {
  let logoClickCount = 0;
  let logoClickTimer = null;

  refs.navLogo?.addEventListener("click", () => {
    logoClickCount++;
    clearTimeout(logoClickTimer);

    if (logoClickCount >= 3) {
      state.speedrun = !state.speedrun;
      logoClickCount = 0;

      if (state.speedrun) {
        document.body.classList.add("speedrun");
      } else {
        document.body.classList.remove("speedrun");
      }
      flashSystemMessage(state.speedrun ? "speedrun mode: on" : "speedrun mode: off");
      setStatus("online", state.speedrun ? "fast mode. respect." : "back to normal.");
      trackInteraction("speedrun");
      return;
    }

    logoClickTimer = setTimeout(() => {
      if (logoClickCount === 1) {
        refs.scrollContainer?.scrollTo({ top: 0, behavior: "smooth" });
        flashSystemMessage("home.");
        triggerGlitch();
      }
      if (logoClickCount === 2) {
        flashSystemMessage("nice find.");
        setStatus("thinking", "i see what you're trying.");
        trackInteraction("explore");
      }
      logoClickCount = 0;
    }, 350);
  });
}

function checkVisibleSections() {
  const container = refs.scrollContainer;
  if (!container) return;

  const containerRect = container.getBoundingClientRect();

  $$(".screen").forEach((section) => {
    const rect = section.getBoundingClientRect();
    const inView = rect.top < containerRect.bottom - 40 && rect.bottom > containerRect.top + 40;

    if (!inView) return;

    const id = section.id;
    if (state.currentScreen !== id) {
      state.screenEnteredAt = Date.now();
    }

    if (id === "hero") {
      state.currentScreen = "hero";
    } else if (id === "concepts") {
      if (state.currentScreen !== "concepts") trackInteraction("scroll");
      state.currentScreen = "concepts";
      revealConcepts();
    } else if (id === "philosophy") {
      if (state.currentScreen !== "philosophy") trackInteraction("scroll");
      state.currentScreen = "philosophy";
      revealPhilosophy();
    }
  });
}

export function bindScrollTracking() {
  refs.scrollContainer?.addEventListener(
    "scroll",
    () => {
      checkVisibleSections();
      const y = refs.scrollContainer.scrollTop;
      if (y > 80 && refs.scrollHint) {
        refs.scrollHint.style.opacity = "0";
        refs.scrollHint.style.pointerEvents = "none";
      }
      const scrollDelta = Math.abs(y - state.lastScrollY);
      state.lastScrollY = y;
      if (scrollDelta > 400) {
        state.scrollSpeed++;
        if (state.scrollSpeed > 3) {
          maybeBehaviorInterrupt("rapid-scroll");
          state.scrollSpeed = 0;
        }
      } else {
        state.scrollSpeed = Math.max(0, state.scrollSpeed - 1);
      }
    },
    { passive: true },
  );

  checkVisibleSections();
  setTimeout(checkVisibleSections, 100);
  setTimeout(checkVisibleSections, 500);
}

export function startSafetyNetReveal() {
  setTimeout(() => {
    if (!state.conceptsRevealed) {
      revealConcepts();
    }
    if (!state.philRevealed) {
      revealPhilosophy();
    }
  }, 5000);
}

export function bindRuleInteractions() {
  $$(".rule-item").forEach((rule) => {
    rule.addEventListener("mouseenter", () => {
      trackInteraction("explore");

      const ruleNum = rule.dataset.rule;
      if (RULE_REACTIONS[ruleNum] && Math.random() < 0.5) {
        showReaction(RULE_REACTIONS[ruleNum], "thinking");
      }
      trackInteraction("rule-view");
    });

    rule.addEventListener("click", (e) => {
      if (e.target.closest(".rule-demo")) return;
      rule.classList.toggle("expanded");
      trackInteraction("explore");
      if (rule.classList.contains("expanded")) {
        showReaction("going deeper.", "thinking");
      }
    });
  });
}

export function bindExploreButton() {
  refs.exploreBtn?.addEventListener("click", () => {
    const conceptsSection = refs.scrollContainer?.querySelector("#concepts");
    if (conceptsSection && refs.scrollContainer) {
      refs.scrollContainer.scrollTo({
        top: conceptsSection.offsetTop,
        behavior: "smooth",
      });
    }
    setStatus("online", "back to the concepts.");
    trackInteraction("explore");
  });
}

export function startHeroTensionTimers() {
  setTimeout(() => {
    if (!state.heroClicked && refs.heroBtn) {
      refs.heroBtn.style.boxShadow =
        "0 0 50px rgba(239, 68, 68, 0.3), 0 8px 40px rgba(239, 68, 68, 0.25)";
      setTimeout(() => {
        if (!state.heroClicked && refs.heroBtn) {
          refs.heroBtn.style.boxShadow = "";
        }
      }, 800);
    }
  }, 5000);

  setTimeout(() => {
    if (!state.heroClicked) {
      showReaction("the button is right there.", "thinking");
      if (refs.heroBtn) {
        refs.heroBtn.style.boxShadow =
          "0 0 60px rgba(239, 68, 68, 0.35), 0 10px 50px rgba(239, 68, 68, 0.3)";
        setTimeout(() => {
          if (!state.heroClicked && refs.heroBtn) refs.heroBtn.style.boxShadow = "";
        }, 1000);
      }
    }
  }, 10000);

  setTimeout(() => {
    if (!state.heroClicked) {
      showReaction("we're waiting.", "danger");
    }
  }, 18000);
}

export function bindGlobalKeys() {
  let konamiBuffer = [];
  const konamiCode = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];
  document.addEventListener("keydown", (e) => {
    konamiBuffer.push(e.key);
    if (konamiBuffer.length > 10) konamiBuffer.shift();
    if (konamiBuffer.join(",") === konamiCode.join(",")) {
      flashSystemMessage("cheat codes don't work here.");
      triggerGlitch();
      setStatus("danger", "nice try.");
      konamiBuffer = [];
      trackInteraction("easter-egg");
    }
  });
}

export function bindVisibilityChange() {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      return;
    }
    if (state.booted) {
      const gone = Date.now() - state.lastMouseMove;
      if (gone > 30000) {
        showReaction("you left for a while.", "thinking");
        setTimeout(() => {
          showReaction("welcome back. we noticed.", "online");
        }, 2000);
      } else if (gone > 10000) {
        showReaction("you left.", "thinking");
        setTimeout(() => {
          showReaction("welcome back.", "online");
        }, 2000);
      }
      trackInteraction("return");
    }
  });
}

export function bindGlobalClickReactions() {
  document.addEventListener("click", (e) => {
    if (!state.booted) return;
    if (
      Math.random() < 0.05 &&
      !e.target.closest("button, .concept-card, .nav-logo, .nav-link, .rule-item")
    ) {
      setStatus(
        "thinking",
        EMPTY_CLICK_REACTIONS[Math.floor(Math.random() * EMPTY_CLICK_REACTIONS.length)],
      );
    }
  });

  document.addEventListener("contextmenu", () => {
    if (!state.booted) return;
    if (Math.random() < 0.3) {
      showReaction("inspecting, huh?", "thinking");
      trackInteraction("explore");
    }
  });
}

export function bindRuleDemos() {
  const ruleDemoBtn1 = $("#ruleDemoBtn1");
  const ruleDemoResult1 = $("#ruleDemoResult1");
  let rule1Clicks = 0;
  ruleDemoBtn1?.addEventListener("click", (e) => {
    e.stopPropagation();
    rule1Clicks++;
    const msg = RULE_DEMO_RESULTS[Math.min(rule1Clicks - 1, RULE_DEMO_RESULTS.length - 1)];
    if (ruleDemoResult1) {
      ruleDemoResult1.textContent = msg;
      ruleDemoResult1.classList.add("show");
    }
    showReaction(msg, "success");
    ruleDemoBtn1.textContent = rule1Clicks > 2 ? "okay, enough" : "click me";
    trackInteraction("rule-demo");
  });

  const toggleSwitch2 = $("#toggleSwitch2");
  const ruleDemoResult2 = $("#ruleDemoResult2");
  let rule2On = false;
  toggleSwitch2?.addEventListener("click", (e) => {
    e.stopPropagation();
    rule2On = !rule2On;
    toggleSwitch2.classList.toggle("on", rule2On);
    toggleSwitch2.setAttribute("aria-checked", rule2On);
    if (ruleDemoResult2) {
      ruleDemoResult2.textContent = rule2On ? "fast. instant." : "slow. painful.";
      ruleDemoResult2.classList.add("show");
    }
    showReaction(rule2On ? "see the difference?" : "feel that?", "thinking");
    trackInteraction("rule-demo");
  });

  const ruleDemoBtn3 = $("#ruleDemoBtn3");
  const ruleDemoResult3 = $("#ruleDemoResult3");
  ruleDemoBtn3?.addEventListener("click", (e) => {
    e.stopPropagation();
    const ruleItem = ruleDemoBtn3.closest(".rule-item");
    ruleItem?.classList.add("shake-heavy");
    setTimeout(() => ruleItem?.classList.remove("shake-heavy"), 500);
    triggerGlitch();
    if (ruleDemoResult3) {
      ruleDemoResult3.textContent = "it broke. good.";
      ruleDemoResult3.classList.add("show");
    }
    showReaction("it broke. good.", "danger");
    ruleDemoBtn3.textContent = "break it again";
    trackInteraction("rule-demo");
  });

  const ruleDemoBtn8 = $("#ruleDemoBtn8");
  const ruleDemoResult8 = $("#ruleDemoResult8");
  ruleDemoBtn8?.addEventListener("click", (e) => {
    e.stopPropagation();

    rule1Clicks = 0;
    if (ruleDemoBtn1) ruleDemoBtn1.textContent = "click me";
    if (ruleDemoResult1) {
      ruleDemoResult1.textContent = "";
      ruleDemoResult1.classList.remove("show");
    }

    rule2On = false;
    toggleSwitch2?.classList.remove("on");
    toggleSwitch2?.setAttribute("aria-checked", "false");
    if (ruleDemoResult2) {
      ruleDemoResult2.textContent = "slow. painful.";
    }

    if (ruleDemoBtn3) ruleDemoBtn3.textContent = "break this rule";
    if (ruleDemoResult3) {
      ruleDemoResult3.textContent = "";
      ruleDemoResult3.classList.remove("show");
    }

    if (ruleDemoResult8) {
      ruleDemoResult8.textContent = "reset complete.";
      ruleDemoResult8.classList.add("show");
      setTimeout(() => ruleDemoResult8.classList.remove("show"), 2000);
    }
    showReaction("everything reset. try again.", "success");
    trackInteraction("rule-demo");
  });
}

export function handleReturnVisitor() {
  if (state.returnVisitor) {
    setTimeout(() => {
      showReaction(
        RETURN_GREETINGS[Math.floor(Math.random() * RETURN_GREETINGS.length)],
        "success",
      );
    }, 3500);
  }
  localStorage.setItem("cs-playground-visited", "1");
}

export function initConsoleLogs() {
  console.log(
    "%c{CS} Playground",
    "font-size: 28px; font-weight: bold; color: #6366f1; text-shadow: 0 0 10px rgba(99,102,241,0.5);",
  );
  console.log(
    "%cYou opened the console. Respect.",
    "font-size: 13px; color: #8a8a8d; font-style: italic;",
  );
  console.log(
    "%cThis isn't a course. It's a consequence engine.",
    "font-size: 11px; color: #555558;",
  );
}
