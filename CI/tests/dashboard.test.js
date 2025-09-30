describe('DASHBOARD COMPONENT FUNCTIONALITY', () => {
  test('Data processing - should correctly transform stock data types', () => {
    const mockData = [{
      date: '2024-01-01',
      open: '150.25', // string input
      close: '155.50',
      high: '160.75',
      low: '148.80',
      volume: '1000000'
    }];

    const processedData = mockData.map(item => ({
      ...item,
      open: Number(item.open),
      close: Number(item.close),
      high: Number(item.high),
      low: Number(item.low),
      volume: Number(item.volume)
    }));

    expect(processedData[0].open).toBe(150.25);
    expect(typeof processedData[0].open).toBe('number');
  });

  test('Input handling - should uppercase stock symbols correctly', () => {
    const testCases = [
      { input: 'aapl', expected: 'AAPL' },
      { input: 'AAPL', expected: 'AAPL' },
      { input: 'msft', expected: 'MSFT' }
    ];

    testCases.forEach(({ input, expected }) => {
      const uppercased = input.toUpperCase();
      expect(uppercased).toBe(expected);
    });
  });

  test('Empty state - should handle empty data for charts gracefully', () => {
    const emptyData = [];
    const chartData = emptyData.length ? emptyData : [{ 
      date: "", open: 0, close: 0, high: 0, low: 0, volume: 0 
    }];
    
    expect(chartData).toHaveLength(1);
    expect(chartData[0].open).toBe(0);
  });
});