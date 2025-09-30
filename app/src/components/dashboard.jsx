import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const emptyData = [];

function Dashboard() {
  const [stockName, setStockName] = useState("");
  const [query, setQuery] = useState("");
  const [stockData, setStockData] = useState(emptyData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch stock data when query changes (on form submit)
  useEffect(() => {
    if (!query) {
      setStockData(emptyData);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/data/${query}`);
        if (!res.ok) throw new Error(`Error fetching data: ${res.statusText}`);

        const data = await res.json();

        // Convert date strings to Date objects if needed
        // Also sort by date ascending for chart x-axis
        const sortedData = data
          .map((d) => ({
            ...d,
            date: new Date(d.date).toISOString().slice(0, 10), // format yyyy-mm-dd
            open: Number(d.open),
            close: Number(d.close),
            high: Number(d.high),
            low: Number(d.low),
            volume: Number(d.volume),
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setStockData(sortedData);
      } catch (err) {
        setError(err.message);
        setStockData(emptyData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query]);

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setQuery(stockName.trim());
  };

  // Chart component helper
  const StockChart = ({ dataKey, color, yLabel }) => (
    <div style={{ width: "100%", height: 200, marginBottom: 30 }}>
      <ResponsiveContainer>
        <LineChart data={stockData.length ? stockData : [{ date: "", [dataKey]: 0 }]}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            dot={false}
            name={yLabel}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 20 }}>
      <h1>Stock Profile Dashboard</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Enter stock name (e.g. AAPL)"
          value={stockName}
          onChange={(e) => setStockName(e.target.value.toUpperCase())}
          style={{ padding: 8, width: 250, fontSize: 16 }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 15px",
            marginLeft: 10,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </form>

      {loading && <p>Loading data...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {/* 5 charts: open, close, high, low, volume */}
      <StockChart dataKey="open" color="#8884d8" yLabel="Open Price" />
      <StockChart dataKey="close" color="#82ca9d" yLabel="Close Price" />
      <StockChart dataKey="high" color="#ff7300" yLabel="High Price" />
      <StockChart dataKey="low" color="#387908" yLabel="Low Price" />
      <StockChart dataKey="volume" color="#888888" yLabel="Volume" />
    </div>
  );
}

export default Dashboard;
