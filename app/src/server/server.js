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

// New Route: Search for stock names
/*app.get("/api/stocks/search", (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.json([]);
    }

    // Use UNION to get two sets: ones that start with query, then ones that contain query
    const searchQuery = `
        SELECT DISTINCT Name FROM market_data 
        WHERE Name LIKE ? 
        ORDER BY 
            CASE WHEN Name LIKE ? THEN 0 ELSE 1 END, -- Priority to stocks starting with query
            LENGTH(Name), -- Then by length (shorter first)
            Name -- Then alphabetically
        LIMIT 50
    `;

    db.all(searchQuery, [`${query}%`, `${query}%`], (err, rows) => {
        if (err) {
            console.error("❌ Search query failed:", err.message);
            res.status(500).json({ error: err.message });
        } else {
            const stockNames = rows.map(row => row.Name);
            res.json(stockNames);
        }
    });
});
*/
app.get("/api/stocks/search", (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.json([]);
    }

    const searchQuery = `
        SELECT DISTINCT Name FROM market_data 
        WHERE Name LIKE ? OR Name LIKE ?
        ORDER BY 
            CASE 
                WHEN Name LIKE ? THEN 0  -- Exact start with query (highest priority)
                WHEN Name LIKE ? THEN 1  -- Contains query anywhere (lower priority)
                ELSE 2
            END,
            LENGTH(Name), -- Then by length (shorter first)
            Name -- Then alphabetically
        LIMIT 50
    `;

    db.all(searchQuery, 
        [`${query}%`, `%${query}%`, `${query}%`, `%${query}%`], 
        (err, rows) => {
        if (err) {
            console.error("❌ Search query failed:", err.message);
            res.status(500).json({ error: err.message });
        } else {
            const stockNames = rows.map(row => row.Name);
            res.json(stockNames);
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});