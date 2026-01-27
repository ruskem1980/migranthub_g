import request from 'supertest';
import { getTestApp } from './setup';

describe('LegalController (e2e)', () => {
  // ==================== Categories ====================

  describe('GET /api/v1/legal/categories', () => {
    it('should return all categories (public endpoint)', async () => {
      const response = await request(getTestApp().getHttpServer())
        .get('/api/v1/legal/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('description');
      expect(response.body[0]).toHaveProperty('order');
    });

    it('should return categories sorted by order', async () => {
      const response = await request(getTestApp().getHttpServer())
        .get('/api/v1/legal/categories')
        .expect(200);

      const orders = response.body.map((c: { order: number }) => c.order);
      const sortedOrders = [...orders].sort((a, b) => a - b);
      expect(orders).toEqual(sortedOrders);
    });
  });

  describe('GET /api/v1/legal/categories/:id', () => {
    it('should return category by id', async () => {
      const response = await request(getTestApp().getHttpServer())
        .get('/api/v1/legal/categories/registration')
        .expect(200);

      expect(response.body).toHaveProperty('id', 'registration');
      expect(response.body).toHaveProperty('name');
    });

    it('should return 404 for non-existent category', async () => {
      await request(getTestApp().getHttpServer())
        .get('/api/v1/legal/categories/non-existent')
        .expect(404);
    });
  });

  describe('GET /api/v1/legal/categories/:id/items', () => {
    it('should return category items', async () => {
      const response = await request(getTestApp().getHttpServer())
        .get('/api/v1/legal/categories/registration/items')
        .expect(200);

      expect(response.body).toHaveProperty('laws');
      expect(response.body).toHaveProperty('forms');
      expect(response.body).toHaveProperty('faq');
      expect(Array.isArray(response.body.laws)).toBe(true);
      expect(Array.isArray(response.body.forms)).toBe(true);
      expect(Array.isArray(response.body.faq)).toBe(true);
    });
  });

  // ==================== Laws ====================

  describe('GET /api/v1/legal/laws', () => {
    it('should return all laws', async () => {
      const response = await request(getTestApp().getHttpServer())
        .get('/api/v1/legal/laws')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter laws by categoryId', async () => {
      const response = await request(getTestApp().getHttpServer())
        .get('/api/v1/legal/laws')
        .query({ categoryId: 'registration' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((law: { categoryId: string }) => {
        expect(law.categoryId).toBe('registration');
      });
    });

    it('should search laws by text', async () => {
      const response = await request(getTestApp().getHttpServer())
        .get('/api/v1/legal/laws')
        .query({ search: 'иностранных' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // ==================== Forms ====================

  describe('GET /api/v1/legal/forms', () => {
    it('should return all forms', async () => {
      const response = await request(getTestApp().getHttpServer())
        .get('/api/v1/legal/forms')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter forms by categoryId', async () => {
      const response = await request(getTestApp().getHttpServer())
        .get('/api/v1/legal/forms')
        .query({ categoryId: 'registration' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((form: { categoryId: string }) => {
        expect(form.categoryId).toBe('registration');
      });
    });
  });

  // ==================== FAQ ====================

  describe('GET /api/v1/legal/faq', () => {
    it('should return FAQ items', async () => {
      const response = await request(getTestApp().getHttpServer())
        .get('/api/v1/legal/faq')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter FAQ by categoryId', async () => {
      const response = await request(getTestApp().getHttpServer())
        .get('/api/v1/legal/faq')
        .query({ categoryId: 'registration' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((faq: { categoryId: string }) => {
        expect(faq.categoryId).toBe('registration');
      });
    });
  });

  // ==================== Patent Calculator ====================

  describe('GET /api/v1/legal/calculators/patent/regions', () => {
    it('should return patent regions with prices', async () => {
      const response = await request(getTestApp().getHttpServer())
        .get('/api/v1/legal/calculators/patent/regions')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('code');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('monthlyCost');
    });
  });

  describe('POST /api/v1/legal/calculators/patent', () => {
    it('should calculate patent price for Moscow', async () => {
      const response = await request(getTestApp().getHttpServer())
        .post('/api/v1/legal/calculators/patent')
        .send({ regionCode: '77', months: 3 })
        .expect(200);

      expect(response.body).toHaveProperty('regionCode', '77');
      expect(response.body).toHaveProperty('regionName', 'Москва');
      expect(response.body).toHaveProperty('months', 3);
      expect(response.body).toHaveProperty('totalPrice');
      expect(response.body).toHaveProperty('breakdown');
      expect(Array.isArray(response.body.breakdown)).toBe(true);
      expect(response.body.breakdown.length).toBe(3);

      // Verify calculation: Moscow monthly cost = 6502, 3 months = 19506
      expect(response.body.totalPrice).toBe(6502 * 3);
    });

    it('should calculate patent price for single month', async () => {
      const response = await request(getTestApp().getHttpServer())
        .post('/api/v1/legal/calculators/patent')
        .send({ regionCode: '78', months: 1 })
        .expect(200);

      expect(response.body).toHaveProperty('regionName', 'Санкт-Петербург');
      expect(response.body).toHaveProperty('totalPrice', 5275);
    });

    it('should return 404 for invalid region', async () => {
      await request(getTestApp().getHttpServer())
        .post('/api/v1/legal/calculators/patent')
        .send({ regionCode: '99', months: 1 })
        .expect(404);
    });

    it('should reject invalid months value', async () => {
      await request(getTestApp().getHttpServer())
        .post('/api/v1/legal/calculators/patent')
        .send({ regionCode: '77', months: 0 })
        .expect(400);
    });
  });

  // ==================== Stay Calculator ====================

  describe('POST /api/v1/legal/calculators/stay', () => {
    it('should calculate stay period from entry date', async () => {
      const response = await request(getTestApp().getHttpServer())
        .post('/api/v1/legal/calculators/stay')
        .send({
          entryDate: '2024-01-01',
          exitDates: [],
        })
        .expect(200);

      // Check structure - entryDate might differ by timezone
      expect(response.body).toHaveProperty('entryDate');
      expect(response.body).toHaveProperty('daysInRussia');
      expect(response.body).toHaveProperty('daysRemaining');
      expect(response.body).toHaveProperty('maxStayDate');
      expect(response.body).toHaveProperty('isOverstay');
      expect(response.body).toHaveProperty('periods');
      expect(Array.isArray(response.body.periods)).toBe(true);
    });

    it('should calculate stay with exit dates', async () => {
      const response = await request(getTestApp().getHttpServer())
        .post('/api/v1/legal/calculators/stay')
        .send({
          entryDate: '2024-01-01',
          exitDates: ['2024-01-30', '2024-03-15'],
        })
        .expect(200);

      expect(response.body).toHaveProperty('periods');
      expect(response.body.periods.length).toBeGreaterThan(0);
    });

    it('should detect overstay', async () => {
      // Entry date more than 90 days ago
      const entryDate = new Date();
      entryDate.setDate(entryDate.getDate() - 100);

      const response = await request(getTestApp().getHttpServer())
        .post('/api/v1/legal/calculators/stay')
        .send({
          entryDate: entryDate.toISOString().split('T')[0],
          exitDates: [],
        })
        .expect(200);

      expect(response.body.isOverstay).toBe(true);
      expect(response.body.daysRemaining).toBe(0);
    });

    it('should reject invalid date format', async () => {
      await request(getTestApp().getHttpServer())
        .post('/api/v1/legal/calculators/stay')
        .send({
          entryDate: 'invalid-date',
          exitDates: [],
        })
        .expect(400);
    });
  });
});
