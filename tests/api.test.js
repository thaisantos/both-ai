const request = require('supertest');
const app = require('../index');

describe('Both AI v1 - API Tests', () => {
  
  describe('Health Check Endpoint', () => {
    it('should return 200 with OK status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Service Status Endpoint', () => {
    it('should return 200 with service status', async () => {
      const response = await request(app)
        .get('/api/v1/status')
        .expect(200);
      
      expect(response.body).toHaveProperty('service', 'Both AI');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body).toHaveProperty('environment');
    });
  });

  describe('Process Endpoint', () => {
    it('should process input successfully', async () => {
      const testInput = 'test data';
      const response = await request(app)
        .post('/api/v1/process')
        .send({ input: testInput })
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('input', testInput);
      expect(response.body).toHaveProperty('processed', true);
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return 400 when input is missing', async () => {
      const response = await request(app)
        .post('/api/v1/process')
        .send({})
        .expect(400);
      
      expect(response.body).toHaveProperty('error', 'Input is required');
    });

    it('should return 400 when input is null', async () => {
      const response = await request(app)
        .post('/api/v1/process')
        .send({ input: null })
        .expect(400);
      
      expect(response.body).toHaveProperty('error', 'Input is required');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown endpoint', async () => {
      const response = await request(app)
        .get('/api/v1/unknown')
        .expect(404);
      
      expect(response.body).toHaveProperty('error', 'Not Found');
    });
  });

  describe('Content-Type', () => {
    it('should return JSON content type', async () => {
      const response = await request(app)
        .get('/health');
      
      expect(response.type).toBe('application/json');
    });
  });
});
