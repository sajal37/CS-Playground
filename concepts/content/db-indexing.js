export const SAMPLE_CITY = "Mumbai";

export const QUERIES = {
  city: "SELECT * FROM users WHERE city = '" + SAMPLE_CITY + "'",
  name: "SELECT * FROM users WHERE name LIKE 'Aarav%'",
  date: "SELECT * FROM users WHERE created_at > '2025-01-01'",
  compound: "SELECT * FROM users WHERE city = '" + SAMPLE_CITY + "' AND created_at > '2024-06-01'",
};

export const PLAYGROUND_SLOW_REACTIONS = [
  "every single row. every one.",
  "that took a while, huh?",
  "your users are still waiting.",
  "full table scan. the long way around.",
];

export const PLAYGROUND_FAST_REACTIONS = [
  "there it is.",
  "fast. as it should be.",
  "the index knew exactly where to look.",
  "like flipping straight to the right page.",
];
