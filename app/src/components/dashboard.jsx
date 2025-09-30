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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Fetch stock suggestions based on input
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (stockName.length > 0) {
        setLoadingSuggestions(true);
        try {
          const res = await fetch(`/api/stocks/search?q=${stockName}`);
          if (res.ok) {
            const suggestions = await res.json();
            setFilteredStocks(suggestions);
            setShowSuggestions(true);
          }
        } catch (err) {
          console.error("Error fetching suggestions:", err);
          setFilteredStocks([]);
        } finally {
          setLoadingSuggestions(false);
        }
      } else {
        setFilteredStocks([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [stockName]);

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
    setShowSuggestions(false);
  };

  // Handle stock selection from dropdown
  const handleStockSelect = (stock) => {
    setStockName(stock);
    setQuery(stock);
    setShowSuggestions(false);
  };

  // Custom tooltip for volume (show "Volume: actual number")
  const volumeTooltipFormatter = (value, name) => {
    return [value.toLocaleString(), "Volume"];
  };

  // Custom tooltip for prices
  const priceTooltipFormatter = (value, name) => {
    return [`$${value.toFixed(2)}`, name];
  };

  // Custom label formatter for volume (show in 100k units on axis)
  const volumeLabelFormatter = (value) => {
    return `${(value / 100000).toFixed(0)}`;
  };

  // Chart component helper
  const StockChart = ({ dataKey, color, yLabel, tooltipFormatter, isVolume = false }) => (
    <div style={{ width: "100%", height: 200, marginBottom: 30 }}>
      <ResponsiveContainer>
        <LineChart data={stockData.length ? stockData : [{ date: "", [dataKey]: 0 }]}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            angle={-45}
            textAnchor="end"
            height={60}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            label={{ 
              value: yLabel, 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' }
            }}
            tickFormatter={isVolume ? volumeLabelFormatter : undefined}
          />
          <Tooltip formatter={tooltipFormatter} />
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
    <div style={{ maxWidth: 900, margin: "30px auto", padding: 20, position: "relative" }}>
      <h1>Stock Profile Dashboard</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20, position: "relative" }}>
        <input
          type="text"
          placeholder="Enter stock name (e.g. AAPL)"
          value={stockName}
          onChange={(e) => setStockName(e.target.value.toUpperCase())}
          onFocus={() => stockName.length > 0 && setShowSuggestions(true)}
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

        {/* Stock Suggestions Dropdown */}
        {showSuggestions && (
          <div style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: 250,
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            maxHeight: "200px",
            overflowY: "auto",
            zIndex: 1000,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            {loadingSuggestions ? (
              <div style={{ padding: "8px 12px", color: "#666" }}>Loading...</div>
            ) : filteredStocks.length > 0 ? (
              filteredStocks.map((stock, index) => (
                <div
                  key={index}
                  onClick={() => handleStockSelect(stock)}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    borderBottom: "1px solid #f0f0f0",
                    backgroundColor: "transparent",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#f5f5f5"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                >
                  {stock}
                </div>
              ))
            ) : (
              stockName.length > 0 && (
                <div style={{ padding: "8px 12px", color: "#666" }}>
                  No stocks found
                </div>
              )
            )}
          </div>
        )}
      </form>

      {loading && <p>Loading data...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {/* 5 charts: open, close, high, low, volume */}
      <StockChart 
        dataKey="open" 
        color="#8884d8" 
        yLabel="Open Price ($)" 
        tooltipFormatter={priceTooltipFormatter}
      />
      <StockChart 
        dataKey="close" 
        color="#82ca9d" 
        yLabel="Close Price ($)" 
        tooltipFormatter={priceTooltipFormatter}
      />
      <StockChart 
        dataKey="high" 
        color="#ff7300" 
        yLabel="High Price ($)" 
        tooltipFormatter={priceTooltipFormatter}
      />
      <StockChart 
        dataKey="low" 
        color="#387908" 
        yLabel="Low Price ($)" 
        tooltipFormatter={priceTooltipFormatter}
      />
      <StockChart 
        dataKey="volume" 
        color="#888888" 
        yLabel="Volume (x 100k)" 
        tooltipFormatter={volumeTooltipFormatter}
        isVolume={true}
      />
    </div>
  );
}

export default Dashboard;