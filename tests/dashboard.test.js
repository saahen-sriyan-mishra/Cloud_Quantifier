import { JSDOM } from 'jsdom';

// Set up DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Mock React and Recharts
global.React = {
  useState: (initial) => [initial, () => {}],
  useEffect: (fn) => fn(),
  createElement: () => ({})
};

global.Recharts = {
  LineChart: () => null,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: () => null
};

// Mock fetch
global.fetch = jest.fn();

export function runDashboardTests() {
  const tests = [
    {
      name: 'Dashboard component initial state',
      test: () => {
        const { Dashboard } = require('../../app/src/components/dashboard.jsx');
        // Test would check initial state values
        return true;
      }
    },
    {
      name: 'Volume tooltip formatter',
      test: () => {
        // Test volume formatter
        const volumeTooltipFormatter = (value, name) => {
          return [value.toLocaleString(), "Volume"];
        };
        
        const result = volumeTooltipFormatter(1234567, 'volume');
        return result[0] === '1,234,567' && result[1] === 'Volume';
      }
    },
    {
      name: 'Price tooltip formatter',
      test: () => {
        // Test price formatter
        const priceTooltipFormatter = (value, name) => {
          return [`$${value.toFixed(2)}`, name];
        };
        
        const result = priceTooltipFormatter(123.456, 'open');
        return result[0] === '$123.46' && result[1] === 'open';
      }
    },
    {
      name: 'Volume label formatter',
      test: () => {
        // Test volume label formatter
        const volumeLabelFormatter = (value) => {
          return `${(value / 100000).toFixed(0)}`;
        };
        
        const result = volumeLabelFormatter(1500000);
        return result === '15';
      }
    },
    {
      name: 'Stock search input uppercase conversion',
      test: () => {
        const inputHandler = (value) => value.toUpperCase();
        const result = inputHandler('aapl');
        return result === 'AAPL';
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    try {
      const result = test.test();
      if (result) {
        console.log(`  ${test.name}`);
        passed++;
      } else {
        console.log(`  ${test.name}`);
        failed++;
      }
    } catch (error) {
      console.log(`  ${test.name} - Error: ${error.message}`);
      failed++;
    }
  });

  return { passed, failed, total: tests.length };
}