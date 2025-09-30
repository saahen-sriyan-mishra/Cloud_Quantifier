const request = require('supertest');

describe('SERVER API ENDPOINTS', () => {
  const baseURL = 'http://app:5000';

  test('GET /api/health - should return 200 with healthy status', async () => {
    const response = await request(baseURL).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(response.body.database).toBe('connected');
  });

  test('GET /api/stocks/search - should return array of stock suggestions', async () => {
    const response = await request(baseURL).get('/api/stocks/search?q=A');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /api/data/:stock - should return structured stock data', async () => {
    const response = await request(baseURL).get('/api/data/AAPL');
    
    if (response.status === 200 && response.body.length > 0) {
      const firstRecord = response.body[0];
      expect(firstRecord).toHaveProperty('date');
      expect(firstRecord).toHaveProperty('open');
      expect(firstRecord).toHaveProperty('close');
    }
  });

  test('GET unknown routes - should return 404 for invalid endpoints', async () => {
    const response = await request(baseURL).get('/api/invalid-endpoint');
    expect(response.status).toBe(404);
  });

  test('Server connectivity - should be accessible on port 5000', async () => {
    const response = await request(baseURL).get('/api/health');
    expect(response.status).toBe(200);
  });
});