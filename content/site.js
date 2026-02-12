export const BOOT_MESSAGES = [
  { text: "> initializing playground...", delay: 0 },
  { text: "> loading consequence engine", delay: 400 },
  {
    text: "> checking your patience... <span class='warn'>low</span>",
    delay: 900,
  },
  {
    text: "> connecting neurons............. <span class='ok'>ok</span>",
    delay: 1500,
  },
  { text: "> safety nets? <span class='fail'>none</span>", delay: 2100 },
  { text: "> ready.", delay: 2700 },
];

export const PRESENCE_POOL = {
  idle: [
    "waiting...",
    "still here.",
    "...",
    "you thinking?",
    "take your time. or don't.",
    "the button won't click itself.",
    "this feels wrong...",
    "bold strategy. doing nothing.",
    "okay. silence works too.",
  ],
  watching: [
    "watching.",
    "every move.",
    "cursor tracked.",
    "go on.",
    "interesting pattern.",
    "we see you.",
    "hmm.",
    "okay, keep going.",
    "this feels right...",
    "noted.",
  ],
  postBreak: [
    "that happened.",
    "recovering...",
    "noted.",
    "told you.",
    "still alive. barely.",
    "damage report: survivable.",
    "yeah, that's on you.",
    "was it worth it?",
    "hold on. processing.",
  ],
  concepts: [
    "choose wisely.",
    "all locked. for now.",
    "patience.",
    "not ready yet.",
    "soon.",
    "curiosity noted.",
    "exploring?",
    "this is the right section.",
  ],
  philosophy: [
    "read carefully.",
    "these matter.",
    "rules are rules.",
    "enforced.",
    "no exceptions.",
    "this is serious.",
    "non-negotiable.",
    "pay attention.",
  ],
  impatient: ["c'mon.", "move.", "next.", "okay. next.", "let's go.", "still on this screen?"],
};

export const MOMENTUM_WINS = [
  { text: "you're exploring. good.", mood: "success" },
  { text: "okay, you know your way around.", mood: "online" },
  { text: "respect.", mood: "success" },
  { text: "you're not leaving, are you?", mood: "thinking" },
];

export const INTERACTION_VALIDATIONS = [
  "not bad.",
  "right instinct.",
  "you didn't mess that up.",
  "clean.",
  "keep going.",
];

export const MOUSE_RETURN_MESSAGES = ["there you are.", "missed you.", "back already?"];

export const FAKE_LAG_RECOVERIES = [
  "recovered.",
  "that wasn't us.",
  "weird.",
  "pretend that didn't happen.",
];

export const WHISPERS = [
  "something is listening.",
  "consequences are loading.",
  "nothing is safe here.",
  "break something already.",
  "the engine is patient. you aren't.",
  "every click matters.",
  "this feels wrong...",
  "yeah, this is about to hurt.",
  "hold on. watch this.",
  "i see what you're trying.",
];

export const BEHAVIOR_INTERRUPT = {
  rapidScroll: [
    "slow down. you're missing things.",
    "scrolling fast won't help.",
    "take your time.",
  ],
  staleScreen: ["you can scroll, you know.", "there's more below.", "explore."],
};

export const HERO_RECOVERY_MESSAGES = [
  "recovered. nice.",
  "you survived. barely.",
  "damage: minimal.",
  "still intact. somehow.",
  "that was close.",
  "rebuilt. don't do that again.",
];

export const HERO_TAKEAWAYS = [
  "See? That's how you learn.",
  "Break first. Understand after.",
  "Now you know what happens.",
  "Consequences > explanations.",
];

export const HERO_SATISFACTIONS = ["that felt right.", "momentum.", "good instinct."];

export const HERO_HOVER_REACTIONS = [
  "go on.",
  "do it.",
  "this might hurt.",
  "you sure?",
  "no going back.",
  "last chance.",
];

export const LOCKED_RESPONSES = {
  normal: [
    "locked.",
    "still locked.",
    "what part of 'locked' is unclear?",
    "stop.",
    "seriously?",
    "we admire the persistence.",
  ],
  rare: [
    "...almost. nah, still locked.",
    "you thought that would work?",
    "bold choice.",
    "noted. still no.",
    "trying a different one might help. it won't, but try.",
  ],
};

export const RULE_REACTIONS = {
  1: "cause and effect. the core.",
  2: "toggle everything.",
  3: "we encourage chaos.",
  4: "show, don't tell. always.",
  5: "earn your words.",
  6: "focus.",
  7: "one thing at a time.",
  8: "reset is learning.",
  9: "real or nothing.",
  10: "this is the vibe.",
};

export const EMPTY_CLICK_REACTIONS = [
  "you clicked nothing.",
  "that wasn't a button.",
  "interesting target.",
  "the void doesn't respond.",
];

export const RULE_DEMO_RESULTS = [
  "see? you caused this.",
  "action → reaction.",
  "again? okay.",
  "you get the idea.",
  "now apply this to everything.",
];

export const RETURN_GREETINGS = [
  "you came back. that says something.",
  "back again. good.",
  "returning user detected. respect.",
];
