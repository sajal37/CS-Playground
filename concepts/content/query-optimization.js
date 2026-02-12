export const ROUNDS = {
  r1: {
    bad: "SELECT COUNT(*) FROM users WHERE YEAR(created_at) = 2025",
    good: "SELECT COUNT(*) FROM users WHERE created_at >= '2025-01-01' AND created_at < '2026-01-01'",
  },
  r2: {
    bad: "SELECT * FROM users WHERE name LIKE '%Aarav%'",
    good: "SELECT * FROM users WHERE name LIKE 'Aarav%'",
  },
  r3: {
    bad: "SELECT * FROM orders ORDER BY order_date DESC",
    good: "SELECT * FROM orders ORDER BY order_date DESC LIMIT 20",
  },
};

export const PLAYGROUND = [
  {
    label: "Function: YEAR() vs range",
    bad: "SELECT COUNT(*) FROM users WHERE YEAR(created_at) = 2025",
    good: "SELECT COUNT(*) FROM users WHERE created_at >= '2025-01-01' AND created_at < '2026-01-01'",
  },
  {
    label: "Wildcard: %prefix vs prefix%",
    bad: "SELECT * FROM users WHERE name LIKE '%Aarav%'",
    good: "SELECT * FROM users WHERE name LIKE 'Aarav%'",
  },
  {
    label: "Limit: all rows vs LIMIT 20",
    bad: "SELECT * FROM orders ORDER BY order_date DESC",
    good: "SELECT * FROM orders ORDER BY order_date DESC LIMIT 20",
  },
  {
    label: "Date function on orders",
    bad: "SELECT COUNT(*) FROM orders WHERE YEAR(order_date) = 2025",
    good: "SELECT COUNT(*) FROM orders WHERE order_date >= '2025-01-01' AND order_date < '2026-01-01'",
  },
  {
    label: "Wildcard: %keyboard% vs keyboard%",
    bad: "SELECT * FROM orders WHERE product LIKE '%Keyboard%'",
    good: "SELECT * FROM orders WHERE product = 'Keyboard'",
  },
];

export const SLOW_MSGS = [
  "you wrote that on purpose?",
  "full table scan. the index is crying.",
  "the database did exactly what you asked. badly.",
  "every. single. row.",
  "the index was right there. you ignored it.",
  "that's not a query. that's a punishment.",
];

export const FAST_MSGS = [
  "better.",
  "see? the index was waiting.",
  "same data. you just asked correctly.",
  "that's what competent SQL looks like.",
  "the database thanks you.",
];
