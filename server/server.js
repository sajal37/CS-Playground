require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "..")));

const PORT = process.env.PORT || 3001;

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "cs_playground",
  waitForConnections: true,
  connectionLimit: 10,
  multipleStatements: true,
});

const CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "New York",
  "London",
  "Tokyo",
  "Sydney",
  "Berlin",
  "Toronto",
  "Dubai",
  "Singapore",
  "Paris",
  "Seoul",
];

const FIRST_NAMES = [
  "Aarav",
  "Priya",
  "Rahul",
  "Ananya",
  "Vikram",
  "Sneha",
  "Arjun",
  "Kavya",
  "Rohan",
  "Ishita",
  "James",
  "Sarah",
  "Alex",
  "Emma",
  "Liam",
  "Yuki",
  "Chen",
  "Fatima",
  "Oliver",
  "Sophia",
];

const LAST_NAMES = [
  "Sharma",
  "Patel",
  "Singh",
  "Kumar",
  "Gupta",
  "Shah",
  "Verma",
  "Rao",
  "Smith",
  "Kim",
  "Chen",
  "Ali",
  "Johnson",
  "Williams",
  "Brown",
  "Garcia",
  "Miller",
  "Wilson",
  "Moore",
  "Taylor",
];

let seed = 42;
function rng() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}
function resetSeed() {
  seed = 42;
}

app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.post("/api/setup", async (req, res) => {
  const ROW_COUNT = 100_000;
  const BATCH_SIZE = 5000;

  try {
    const conn = await pool.getConnection();

    await conn.query("DROP TABLE IF EXISTS users");
    await conn.query(`
      CREATE TABLE users (
        id INT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(200) NOT NULL,
        city VARCHAR(50) NOT NULL,
        created_at DATE NOT NULL
      ) ENGINE=InnoDB
    `);

    resetSeed();
    let inserted = 0;

    for (let batch = 0; batch < ROW_COUNT; batch += BATCH_SIZE) {
      const values = [];
      const end = Math.min(batch + BATCH_SIZE, ROW_COUNT);

      for (let i = batch; i < end; i++) {
        const fn = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
        const ln = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
        const city = CITIES[Math.floor(rng() * CITIES.length)];
        const year = 2022 + Math.floor(rng() * 4);
        const month = String(1 + Math.floor(rng() * 12)).padStart(2, "0");
        const day = String(1 + Math.floor(rng() * 28)).padStart(2, "0");
        const name = `${fn} ${ln}`;
        const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i + 1}@mail.com`;
        const date = `${year}-${month}-${day}`;
        values.push(`(${i + 1},'${name}','${email}','${city}','${date}')`);
      }

      await conn.query("INSERT INTO users VALUES " + values.join(","));
      inserted = end;
    }

    const [countResult] = await conn.query("SELECT COUNT(*) as cnt FROM users");
    const actualCount = countResult[0].cnt;

    const [cityResult] = await conn.query(
      "SELECT COUNT(*) as cnt FROM users WHERE city = 'Mumbai'",
    );
    const cityRows = cityResult[0].cnt;

    conn.release();

    res.json({
      status: "ok",
      totalRows: actualCount,
      mumbaiRows: cityRows,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.post("/api/query", async (req, res) => {
  const { sql } = req.body;
  if (!sql) return res.status(400).json({ error: "sql is required" });

  const trimmed = sql.trim().toUpperCase();
  if (!trimmed.startsWith("SELECT")) {
    return res.status(400).json({ error: "Only SELECT queries allowed" });
  }

  try {
    let plan = "unknown";
    let rowsExamined = 0;
    let accessType = "unknown";
    let keyUsed = "none";
    try {
      const [planRows] = await pool.query("EXPLAIN " + sql);
      if (planRows.length > 0) {
        const row = planRows[0];
        accessType = row.type || "unknown";
        keyUsed = row.key || "none";
        rowsExamined = row.rows || 0;

        if (accessType === "ALL") {
          plan = "FULL TABLE SCAN · " + rowsExamined.toLocaleString() + " rows examined";
        } else if (accessType === "index") {
          plan =
            "FULL INDEX SCAN (" +
            keyUsed +
            ") · " +
            rowsExamined.toLocaleString() +
            " rows examined";
        } else if (accessType === "range") {
          plan =
            "INDEX RANGE SCAN (" +
            keyUsed +
            ") · " +
            rowsExamined.toLocaleString() +
            " rows examined";
        } else if (accessType === "ref") {
          plan =
            "INDEX LOOKUP (" + keyUsed + ") · " + rowsExamined.toLocaleString() + " rows examined";
        } else {
          plan =
            accessType + " · key: " + keyUsed + " · " + rowsExamined.toLocaleString() + " rows";
        }
      }
    } catch (e) {
      plan = "explain failed";
    }

    let mysqlTime = null;
    try {
      const [analyzeRows] = await pool.query("EXPLAIN ANALYZE " + sql);

      const firstLine = analyzeRows[0] ? Object.values(analyzeRows[0])[0] : "";
      const match = firstLine.match(/actual time=([\d.]+)\.\.([\d.]+)/);
      if (match) {
        mysqlTime = parseFloat(match[2]);
      }
    } catch (e) {
      mysqlTime = null;
    }

    const t0 = performance.now();
    const [rows, fields] = await pool.query(sql);
    const t1 = performance.now();
    const wallTime = t1 - t0;

    const time = mysqlTime !== null ? mysqlTime : wallTime;

    const columns = fields ? fields.map((f) => f.name) : [];

    res.json({
      time: parseFloat(time.toFixed(2)),
      plan,
      columns,
      rows: rows.slice(0, 100),
      rowCount: rows.length,
      rowsExamined,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/index/create", async (req, res) => {
  const { column } = req.body;
  if (!column) return res.status(400).json({ error: "column is required" });

  const allowed = ["city", "name", "created_at"];
  if (!allowed.includes(column)) {
    return res.status(400).json({ error: "invalid column" });
  }

  try {
    const t0 = performance.now();
    await pool.query(`CREATE INDEX idx_${column} ON users(${column})`);
    const t1 = performance.now();

    res.json({ status: "ok", time: parseFloat((t1 - t0).toFixed(2)) });
  } catch (err) {
    if (err.code === "ER_DUP_KEYNAME") {
      res.json({ status: "ok", time: 0, note: "already exists" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

app.post("/api/index/drop", async (req, res) => {
  const { column } = req.body;
  if (!column) return res.status(400).json({ error: "column is required" });

  const allowed = ["city", "name", "created_at"];
  if (!allowed.includes(column)) {
    return res.status(400).json({ error: "invalid column" });
  }

  try {
    await pool.query(`DROP INDEX idx_${column} ON users`);
    res.json({ status: "ok" });
  } catch (err) {
    if (err.code === "ER_CANT_DROP_FIELD_OR_KEY") {
      res.json({ status: "ok", note: "did not exist" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

app.post("/api/reset", async (req, res) => {
  try {
    const allowed = ["city", "name", "created_at"];
    for (const col of allowed) {
      try {
        await pool.query(`DROP INDEX idx_${col} ON users`);
      } catch (e) {
        void e;
      }
    }
    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/write-test", async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const WRITE_COUNT = 5000;

    const [maxResult] = await conn.query("SELECT MAX(id) as maxId FROM users");
    const startId = (maxResult[0].maxId || 100000) + 1;

    const values = [];
    for (let i = 0; i < WRITE_COUNT; i++) {
      const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      const name = `${fn} ${ln}`;
      const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${startId + i}@mail.com`;
      const month = String(1 + (i % 12)).padStart(2, "0");
      const day = String(1 + (i % 28)).padStart(2, "0");
      const date = `2025-${month}-${day}`;
      values.push(`(${startId + i},'${name}','${email}','${city}','${date}')`);
    }
    const insertSQL = "INSERT INTO users VALUES " + values.join(",");

    const [indexInfo] = await conn.query("SHOW INDEX FROM users WHERE Key_name != 'PRIMARY'");
    const existingIndexes = [...new Set(indexInfo.map((r) => r.Key_name))];

    for (const idx of existingIndexes) {
      await conn.query(`DROP INDEX ${idx} ON users`);
    }

    const t0 = performance.now();
    await conn.query(insertSQL);
    const t1 = performance.now();
    const timeWithout = t1 - t0;

    await conn.query(`DELETE FROM users WHERE id >= ${startId}`);

    await conn.query("CREATE INDEX idx_city ON users(city)");
    await conn.query("CREATE INDEX idx_name ON users(name)");
    await conn.query("CREATE INDEX idx_created_at ON users(created_at)");

    const t2 = performance.now();
    await conn.query(insertSQL);
    const t3 = performance.now();
    const timeWith = t3 - t2;

    await conn.query(`DELETE FROM users WHERE id >= ${startId}`);
    await conn.query("DROP INDEX idx_city ON users").catch(() => null);
    await conn.query("DROP INDEX idx_name ON users").catch(() => null);
    await conn.query("DROP INDEX idx_created_at ON users").catch(() => null);

    for (const idx of existingIndexes) {
      const col = idx.replace("idx_", "");
      try {
        await conn.query(`CREATE INDEX ${idx} ON users(${col})`);
      } catch (e) {
        void e;
      }
    }

    conn.release();

    res.json({
      timeWithout: parseFloat(timeWithout.toFixed(2)),
      timeWith: parseFloat(timeWith.toFixed(2)),
      rowCount: WRITE_COUNT,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/qo/setup", async (req, res) => {
  const USER_COUNT = 100_000;
  const ORDER_COUNT = 200_000;
  const BATCH_SIZE = 5000;
  const PRODUCTS = [
    "Laptop",
    "Phone",
    "Headphones",
    "Keyboard",
    "Mouse",
    "Monitor",
    "Tablet",
    "Camera",
    "Speaker",
    "Watch",
    "Charger",
    "Cable",
    "Case",
    "Stand",
    "Light",
    "Mic",
    "Webcam",
    "SSD",
    "RAM",
    "GPU",
  ];

  try {
    const conn = await pool.getConnection();
    await conn.query("DROP TABLE IF EXISTS orders");
    await conn.query("DROP TABLE IF EXISTS users");

    await conn.query(`CREATE TABLE users (
      id INT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(200) NOT NULL,
      city VARCHAR(50) NOT NULL,
      created_at DATE NOT NULL
    ) ENGINE=InnoDB`);

    await conn.query(`CREATE TABLE orders (
      id INT PRIMARY KEY,
      user_id INT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      product VARCHAR(100) NOT NULL,
      order_date DATE NOT NULL
    ) ENGINE=InnoDB`);

    resetSeed();
    for (let batch = 0; batch < USER_COUNT; batch += BATCH_SIZE) {
      const values = [];
      const end = Math.min(batch + BATCH_SIZE, USER_COUNT);
      for (let i = batch; i < end; i++) {
        const fn = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
        const ln = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
        const city = CITIES[Math.floor(rng() * CITIES.length)];
        const year = 2015 + Math.floor(rng() * 11);
        const month = String(1 + Math.floor(rng() * 12)).padStart(2, "0");
        const day = String(1 + Math.floor(rng() * 28)).padStart(2, "0");
        const name = `${fn} ${ln}`;
        const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i + 1}@mail.com`;
        const date = `${year}-${month}-${day}`;
        values.push(`(${i + 1},'${name}','${email}','${city}','${date}')`);
      }
      await conn.query("INSERT INTO users VALUES " + values.join(","));
    }

    for (let batch = 0; batch < ORDER_COUNT; batch += BATCH_SIZE) {
      const values = [];
      const end = Math.min(batch + BATCH_SIZE, ORDER_COUNT);
      for (let i = batch; i < end; i++) {
        const userId = 1 + Math.floor(rng() * USER_COUNT);
        const amount = (5 + rng() * 495).toFixed(2);
        const product = PRODUCTS[Math.floor(rng() * PRODUCTS.length)];
        const year = 2023 + Math.floor(rng() * 3);
        const month = String(1 + Math.floor(rng() * 12)).padStart(2, "0");
        const day = String(1 + Math.floor(rng() * 28)).padStart(2, "0");
        const date = `${year}-${month}-${day}`;
        values.push(`(${i + 1},${userId},${amount},'${product}','${date}')`);
      }
      await conn.query("INSERT INTO orders VALUES " + values.join(","));
    }

    await conn.query("CREATE INDEX idx_city ON users(city)");
    await conn.query("CREATE INDEX idx_created_at ON users(created_at)");
    await conn.query("CREATE INDEX idx_name ON users(name)");
    await conn.query("CREATE INDEX idx_user_id ON orders(user_id)");
    await conn.query("CREATE INDEX idx_order_date ON orders(order_date)");

    const [uc] = await conn.query("SELECT COUNT(*) as c FROM users");
    const [oc] = await conn.query("SELECT COUNT(*) as c FROM orders");
    conn.release();

    res.json({ status: "ok", users: uc[0].c, orders: oc[0].c, indexes: 5 });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(
    `\n  {CS} Playground Server\n  ──────────────────────\n  http://localhost:${PORT}\n  http://localhost:${PORT}/concepts/db-indexing/\n  http://localhost:${PORT}/concepts/query-optimization/\n  MySQL: ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || "cs_playground"}\n`,
  );
});
