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

  // Checkbox state for lines
  const [showLines, setShowLines] = useState({
    open: true,
    close: true,
    high: true,
    low: true,
  });

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

  // Reusable fetch function for stock data
  const fetchStockData = async (stock) => {
    if (!stock) {
      setStockData(emptyData);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/data/${stock}`);
      if (!res.ok) throw new Error(`Error fetching data: ${res.statusText}`);

      const data = await res.json();

      const sortedData = data
        .map((d) => ({
          ...d,
          date: new Date(d.date).toISOString().slice(0, 10),
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

  // Fetch stock data when query changes (on form submit)
  useEffect(() => {
    fetchStockData(query);
  }, [query]);

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setQuery(stockName.trim());
    setShowSuggestions(false);
  };

  // Handle stock selection from dropdown — fetch immediately
  const handleStockSelect = (stock) => {
    setShowSuggestions(false); // hide dropdown
    setStockName(stock);
    setQuery(stock);
    fetchStockData(stock); // immediate fetch here to avoid delay
  };

  // Tooltip formatters
  const volumeTooltipFormatter = (value, name) => {
    return [value.toLocaleString(), "Volume"];
  };
  const priceTooltipFormatter = (value, name) => {
    return [`$${value.toFixed(2)}`, name];
  };

  // Format Y axis for volume
  const volumeLabelFormatter = (value) => {
    return `${(value / 100000).toFixed(0)}`;
  };

  // Handle checkbox toggle
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setShowLines((prev) => ({ ...prev, [name]: checked }));
  };

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
          <div
            style={{
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
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
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
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                >
                  {stock}
                </div>
              ))
            ) : (
              stockName.length > 0 && (
                <div style={{ padding: "8px 12px", color: "#666" }}>No stocks found</div>
              )
            )}
          </div>
        )}
      </form>

      {/* Checkboxes to toggle 4 lines */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ marginRight: 15 }}>
          <input
            type="checkbox"
            name="open"
            checked={showLines.open}
            onChange={handleCheckboxChange}
          />{" "}
          Open
        </label>
        <label style={{ marginRight: 15 }}>
          <input
            type="checkbox"
            name="close"
            checked={showLines.close}
            onChange={handleCheckboxChange}
          />{" "}
          Close
        </label>
        <label style={{ marginRight: 15 }}>
          <input
            type="checkbox"
            name="high"
            checked={showLines.high}
            onChange={handleCheckboxChange}
          />{" "}
          High
        </label>
        <label style={{ marginRight: 15 }}>
          <input
            type="checkbox"
            name="low"
            checked={showLines.low}
            onChange={handleCheckboxChange}
          />{" "}
          Low
        </label>
      </div>

      {loading && <p>Loading data...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {/* Single combined chart with all lines */}
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <LineChart
            data={stockData.length ? stockData : [{ date: "", open: 0, close: 0, high: 0, low: 0, volume: 0 }]}
            margin={{ top: 20, right: 40, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 12 }}
            />
            <YAxis yAxisId="left" label={{ value: "Price ($)", angle: -90, position: "insideLeft", style: { textAnchor: "middle" } }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: "Volume (x 100k)", angle: 90, position: "insideRight", style: { textAnchor: "middle" } }}
              tickFormatter={volumeLabelFormatter}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === "Volume") return volumeTooltipFormatter(value, name);
                else return priceTooltipFormatter(value, name);
              }}
            />
            <Legend verticalAlign="top" height={36} />

            {/* Conditionally render lines based on checkboxes */}
            {showLines.open && <Line yAxisId="left" type="monotone" dataKey="open" stroke="#8884d8" dot={false} name="Open" />}
            {showLines.close && <Line yAxisId="left" type="monotone" dataKey="close" stroke="#82ca9d" dot={false} name="Close" />}
            {showLines.high && <Line yAxisId="left" type="monotone" dataKey="high" stroke="#ff7300" dot={false} name="High" />}
            {showLines.low && <Line yAxisId="left" type="monotone" dataKey="low" stroke="#387908" dot={false} name="Low" />}

            {/* Volume line always visible on right Y-axis */}
            <Line yAxisId="right" type="monotone" dataKey="volume" stroke="#888888" dot={false} name="Volume" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Dashboard;
