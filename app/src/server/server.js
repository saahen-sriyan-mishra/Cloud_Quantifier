import express from "express";
import sqlite3Pkg from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

// Setup ES module variables
const sqlite3 = sqlite3Pkg.verbose();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());

// SQLite database path
const dbPath = path.join(__dirname, "../../../database/stocks_data.db");

// Connect to SQLite
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error("❌ Failed to connect to database:", err.message);
    } else {
        console.log("✅ Connected to SQLite database.");
    }
});

// Route: Get rows by stock name
app.get("/api/data/:name", (req, res) => {
    const name = req.params.name;

    const query = `SELECT * FROM market_data WHERE Name = ?`;

    db.all(query, [name], (err, rows) => {
        if (err) {
            console.error("❌ Query failed:", err.message);
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
