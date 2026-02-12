import {
  bindCursorTracking,
  bindExploreButton,
  bindGlobalClickReactions,
  bindGlobalKeys,
  bindHeroInteractions,
  bindNavLogo,
  bindRuleDemos,
  bindRuleInteractions,
  bindScrollTracking,
  bindVisibilityChange,
  handleReturnVisitor,
  initConcepts,
  initConsoleLogs,
  startBoot,
  startHeroTensionTimers,
  startSafetyNetReveal,
} from "./interactions.js";

bindCursorTracking();
initConcepts();
bindHeroInteractions();
bindNavLogo();
bindScrollTracking();
bindRuleInteractions();
bindExploreButton();
bindGlobalKeys();
bindVisibilityChange();
bindGlobalClickReactions();
bindRuleDemos();
startHeroTensionTimers();
startSafetyNetReveal();
handleReturnVisitor();
initConsoleLogs();
startBoot();
