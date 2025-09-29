import dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const PORT = process.env.PORT || 5000;

console.log('Finnhub API Key:', FINNHUB_API_KEY ? 'Loaded' : 'Missing');

const app = express();
app.use(cors());

// Allowed stock symbols
const allowedSymbols = ['AAPL', 'MSFT', 'TSLA', 'AMZN', 'GOOGL'];

/**
 * GET /api/quarter_report/:symbol
 * Returns up to 4 quarters of earnings surprise data for the symbol
 */
app.get('/api/quarter_report/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  if (!allowedSymbols.includes(symbol)) {
    return res.status(403).json({ error: `Symbol '${symbol}' not supported.` });
  }

  try {
    const url = 'https://finnhub.io/api/v1/stock/earnings';

    const response = await axios.get(url, {
      params: {
        symbol,
        token: FINNHUB_API_KEY,
        limit: 4  // Free tier supports last 4 quarters
      }
    });

    const data = response.data;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(404).json({ error: `No earnings data found for symbol ${symbol}` });
    }

    res.json({
      symbol,
      earningsSurprises: data.map(entry => ({
        actual: entry.actual,
        estimate: entry.estimate,
        period: entry.period,
        quarter: entry.quarter,
        surprise: entry.surprise,
        surprisePercent: entry.surprisePercent,
        year: entry.year
      }))
    });
  } catch (error) {
    console.error(`Error fetching earnings for ${symbol}:`, error.message);
    res.status(500).json({ error: 'Server error', detail: error.message });
  }
});


/**
 * NEW:
 * GET /api/quarter_report
 * Returns earnings surprise data for all allowed symbols
 */
app.get('/api/quarter_report', async (req, res) => {
  try {
    const earningsPromises = allowedSymbols.map(async (symbol) => {
      const url = 'https://finnhub.io/api/v1/stock/earnings';

      const response = await axios.get(url, {
        params: {
          symbol,
          token: FINNHUB_API_KEY,
          limit: 4
        }
      });

      const data = response.data;

      return {
        symbol,
        earningsSurprises: Array.isArray(data) ? data.map(entry => ({
          actual: entry.actual,
          estimate: entry.estimate,
          period: entry.period,
          quarter: entry.quarter,
          surprise: entry.surprise,
          surprisePercent: entry.surprisePercent,
          year: entry.year
        })) : []
      };
    });

    const results = await Promise.all(earningsPromises);

    res.json({ results });

  } catch (error) {
    console.error('Error fetching earnings for all symbols:', error.message);
    res.status(500).json({ error: 'Server error', detail: error.message });
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('Finnhub earnings surprise API running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
