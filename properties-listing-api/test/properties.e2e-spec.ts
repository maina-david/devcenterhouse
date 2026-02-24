import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PropertiesController } from '../src/properties/properties.controller';
import { PropertiesService } from '../src/properties/properties.service';
import { Property } from '../src/properties/entities/property.entity';

// ─── Shared Fixtures ─────────────────────────────────────────────────────────

const makeProperty = (overrides: Partial<Property> = {}): Property =>
  ({
    id: 1,
    title: '2 Bed Apartment in Dublin',
    description: 'Modern city-centre apartment',
    price: 2200,
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    areaSqft: 750,
    address: '5 O\'Connell Street',
    city: 'Dublin',
    county: 'Dublin',
    eircode: 'D01 AB12',
    status: 'for_rent',
    images: ['https://picsum.photos/seed/1/800/600'],
    isFeatured: true,
    availableFrom: '2025-07-01',
    latitude: 53.349,
    longitude: -6.260,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  }) as Property;

const paginatedResult = (properties: Partial<Property>[], total = 1) => ({
  data: properties,
  meta: { total, page: 1, limit: 12, totalPages: Math.ceil(total / 12) },
});

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('Properties API (e2e)', () => {
  let app: INestApplication<App>;
  let mockService: jest.Mocked<Pick<PropertiesService, 'findAll' | 'findOne' | 'seed'>>;

  beforeEach(async () => {
    mockService = {
      findAll: jest.fn().mockResolvedValue(paginatedResult([makeProperty()])),
      findOne: jest.fn().mockResolvedValue(makeProperty()),
      seed: jest.fn().mockResolvedValue({ message: 'Seeded successfully', count: 40 }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PropertiesController],
      providers: [{ provide: PropertiesService, useValue: mockService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  // ─── GET /api/properties ──────────────────────────────────────────────────

  describe('GET /api/properties', () => {
    it('should return 200 with paginated data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/properties')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toMatchObject({ page: 1, limit: 12 });
    });

    it('should pass search param to service', async () => {
      await request(app.getHttpServer())
        .get('/api/properties?search=dublin')
        .expect(200);

      expect(mockService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'dublin' }),
      );
    });

    it('should pass type, county, price range params to service', async () => {
      await request(app.getHttpServer())
        .get('/api/properties?type=house&county=Cork&minPrice=800&maxPrice=2000')
        .expect(200);

      expect(mockService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'house',
          county: 'Cork',
          minPrice: 800,
          maxPrice: 2000,
        }),
      );
    });

    it('should pass bedrooms and bathrooms params to service', async () => {
      await request(app.getHttpServer())
        .get('/api/properties?bedrooms=2&bathrooms=1')
        .expect(200);

      expect(mockService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ bedrooms: 2, bathrooms: 1 }),
      );
    });

    it('should pass pagination params to service', async () => {
      await request(app.getHttpServer())
        .get('/api/properties?page=3&limit=6')
        .expect(200);

      expect(mockService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 3, limit: 6 }),
      );
    });

    it('should pass sortBy and sortOrder to service', async () => {
      await request(app.getHttpServer())
        .get('/api/properties?sortBy=price&sortOrder=ASC')
        .expect(200);

      expect(mockService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: 'price', sortOrder: 'ASC' }),
      );
    });

    it('should return 400 for invalid status value', async () => {
      await request(app.getHttpServer())
        .get('/api/properties?status=invalid_status')
        .expect(400);
    });

    it('should return 400 for invalid sortOrder value', async () => {
      await request(app.getHttpServer())
        .get('/api/properties?sortOrder=RANDOM')
        .expect(400);
    });

    it('should return 400 when page is less than 1', async () => {
      await request(app.getHttpServer())
        .get('/api/properties?page=0')
        .expect(400);
    });
  });

  // ─── GET /api/properties/:id ──────────────────────────────────────────────

  describe('GET /api/properties/:id', () => {
    it('should return 200 with the property', async () => {
      const property = makeProperty({ id: 1 });
      mockService.findOne.mockResolvedValue(property);

      const response = await request(app.getHttpServer())
        .get('/api/properties/1')
        .expect(200);

      expect(response.body).toMatchObject({ id: 1, title: property.title });
    });

    it('should return 404 when property is not found', async () => {
      mockService.findOne.mockRejectedValue(new NotFoundException('Property #999 not found'));

      await request(app.getHttpServer())
        .get('/api/properties/999')
        .expect(404);
    });

    it('should return 400 for a non-integer id', async () => {
      await request(app.getHttpServer())
        .get('/api/properties/not-a-number')
        .expect(400);
    });
  });

  // ─── POST /api/properties/seed ───────────────────────────────────────────

  describe('POST /api/properties/seed', () => {
    it('should return 201 with seed result', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/properties/seed')
        .expect(201);

      expect(response.body).toMatchObject({ message: 'Seeded successfully', count: 40 });
    });

    it('should call service.seed once', async () => {
      await request(app.getHttpServer())
        .post('/api/properties/seed')
        .expect(201);

      expect(mockService.seed).toHaveBeenCalledTimes(1);
    });
  });
});
