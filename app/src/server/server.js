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
app.use(express.json());

// Database path - now from environment variable
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "../../../../database/stocks_data.db");

console.log("🔍 Looking for database at:", dbPath);

// Connect to SQLite with retry logic for container startup
function connectDatabase(retries = 5, delay = 3000) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                if (retries > 0) {
                    console.log(`Database connection failed, ${retries} retries left...`);
                    setTimeout(() => {
                        connectDatabase(retries - 1, delay).then(resolve).catch(reject);
                    }, delay);
                } else {
                    reject(err);
                }
            } else {
                console.log("Connected to SQLite database successfully!");
                resolve(db);
            }
        });
    });
}

let db;

// Initialize database connection
connectDatabase().then(database => {
    db = database;
}).catch(err => {
    console.error("Failed to connect to database after retries:", err.message);
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    if (!db) {
        return res.status(503).json({ status: "unhealthy", error: "Database not connected" });
    }
    
    db.get("SELECT 1 as health", (err) => {
        if (err) {
            res.status(500).json({ status: "unhealthy", error: err.message });
        } else {
            res.json({ 
                status: "healthy", 
                database: "connected",
                path: dbPath 
            });
        }
    });
});

// Route: Get rows by stock name
app.get("/api/data/:name", (req, res) => {
    if (!db) {
        return res.status(503).json({ error: "Database not available" });
    }

    const name = req.params.name;
    console.log(`📈 Fetching data for stock: ${name}`);

    const query = `SELECT * FROM market_data WHERE Name = ? ORDER BY date`;

    db.all(query, [name], (err, rows) => {
        if (err) {
            console.error("Query failed:", err.message);
            res.status(500).json({ error: err.message });
        } else {
            console.log(`Found ${rows.length} records for ${name}`);
            res.json(rows);
        }
    });
});

// Route: Search for stock names
app.get("/api/stocks/search", (req, res) => {
    if (!db) {
        return res.status(503).json({ error: "Database not available" });
    }

    const query = req.query.q;
    console.log(`🔍 Searching stocks with query: ${query}`);

    if (!query) {
        return res.json([]);
    }

    const searchQuery = `
        SELECT DISTINCT Name FROM market_data 
        WHERE Name LIKE ? OR Name LIKE ?
        ORDER BY 
            CASE 
                WHEN Name LIKE ? THEN 0
                WHEN Name LIKE ? THEN 1
                ELSE 2
            END,
            LENGTH(Name),
            Name
        LIMIT 50
    `;

    db.all(searchQuery, 
        [`${query}%`, `%${query}%`, `${query}%`, `%${query}%`], 
        (err, rows) => {
        if (err) {
            console.error("Search query failed:", err.message);
            res.status(500).json({ error: err.message });
        } else {
            const stockNames = rows.map(row => row.Name);
            console.log(`Found ${stockNames.length} suggestions for "${query}"`);
            res.json(stockNames);
        }
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
    console.log(`Database path: ${dbPath}`);
});