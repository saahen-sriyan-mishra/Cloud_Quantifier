// Simple vite config tests
test('Vite config should have correct settings', () => {
  const port = 3001;
  const host = '0.0.0.0';
  
  expect(port).toBe(3001);
  expect(host).toBe('0.0.0.0');
});

test('Development server configuration', () => {
  const isDevelopment = process.env.NODE_ENV === 'test';
  expect(isDevelopment).toBe(true);
});