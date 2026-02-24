import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { Property } from './entities/property.entity';
import { QueryPropertiesDto } from './dto/query-properties.dto';

const makeProperty = (overrides: Partial<Property> = {}): Property =>
  ({
    id: 1,
    title: '2 Bed House in Antrim',
    description: 'A lovely house',
    price: 1200,
    propertyType: 'house',
    bedrooms: 2,
    bathrooms: 1,
    areaSqft: 900,
    address: '10 Main Street',
    city: 'Antrim',
    county: 'Antrim',
    eircode: 'BT1 1AA',
    status: 'for_rent',
    images: ['https://picsum.photos/seed/1/800/600'],
    latitude: 54.7,
    longitude: -6.2,
    availableFrom: '2025-06-01',
    isFeatured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as Property;

describe('PropertiesService', () => {
  let service: PropertiesService;
  let mockQb: Record<string, jest.Mock>;
  let mockRepo: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockQb = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };

    mockRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQb),
      findOne: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      save: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        { provide: getRepositoryToken(Property), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
  });

  // ─── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return paginated data with correct meta when no filters are applied', async () => {
      const props = [makeProperty({ id: 1 }), makeProperty({ id: 2 })];
      mockQb.getManyAndCount.mockResolvedValue([props, 2]);

      const result = await service.findAll({});

      expect(result.data).toEqual(props);
      expect(result.meta).toEqual({ total: 2, page: 1, limit: 12, totalPages: 1 });
    });

    it('should apply ILIKE search on title, address, city, and county', async () => {
      mockQb.getManyAndCount.mockResolvedValue([[], 0]);
      const query: QueryPropertiesDto = { search: 'antrim' };

      await service.findAll(query);

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE :search'),
        { search: '%antrim%' },
      );
    });

    it('should filter by property type', async () => {
      mockQb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ type: 'house' });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'property.propertyType = :type',
        { type: 'house' },
      );
    });

    it('should filter by county using ILIKE', async () => {
      mockQb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ county: 'Dublin' });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'property.county ILIKE :county',
        { county: '%Dublin%' },
      );
    });

    it('should apply minPrice filter', async () => {
      mockQb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ minPrice: 500 });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'property.price >= :minPrice',
        { minPrice: 500 },
      );
    });

    it('should apply maxPrice filter', async () => {
      mockQb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ maxPrice: 2000 });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'property.price <= :maxPrice',
        { maxPrice: 2000 },
      );
    });

    it('should apply both minPrice and maxPrice when both are provided', async () => {
      mockQb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ minPrice: 500, maxPrice: 1500 });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'property.price >= :minPrice',
        { minPrice: 500 },
      );
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'property.price <= :maxPrice',
        { maxPrice: 1500 },
      );
    });

    it('should filter by minimum bedrooms', async () => {
      mockQb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ bedrooms: 2 });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'property.bedrooms >= :bedrooms',
        { bedrooms: 2 },
      );
    });

    it('should filter by minimum bathrooms', async () => {
      mockQb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ bathrooms: 1 });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'property.bathrooms >= :bathrooms',
        { bathrooms: 1 },
      );
    });

    it('should filter by status', async () => {
      mockQb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ status: 'for_rent' });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'property.status = :status',
        { status: 'for_rent' },
      );
    });

    it('should calculate pagination offset correctly for page 2', async () => {
      mockQb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 2, limit: 10 });

      expect(mockQb.skip).toHaveBeenCalledWith(10); // (2-1)*10
      expect(mockQb.take).toHaveBeenCalledWith(10);
    });

    it('should calculate totalPages correctly', async () => {
      mockQb.getManyAndCount.mockResolvedValue([[], 35]);

      const result = await service.findAll({ page: 1, limit: 12 });

      expect(result.meta.totalPages).toBe(3); // ceil(35/12)
      expect(result.meta.total).toBe(35);
    });

    it('should use createdAt DESC sorting by default', async () => {
      mockQb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({});

      expect(mockQb.orderBy).toHaveBeenCalledWith('property.createdAt', 'DESC');
    });

    it('should apply valid sortBy field', async () => {
      mockQb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ sortBy: 'price', sortOrder: 'ASC' });

      expect(mockQb.orderBy).toHaveBeenCalledWith('property.price', 'ASC');
    });

    it('should fall back to createdAt for invalid sortBy to prevent SQL injection', async () => {
      mockQb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ sortBy: 'DROP TABLE properties;--' } as QueryPropertiesDto);

      expect(mockQb.orderBy).toHaveBeenCalledWith('property.createdAt', 'DESC');
    });

    it('should not call andWhere when no filters are set', async () => {
      mockQb.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({});

      expect(mockQb.andWhere).not.toHaveBeenCalled();
    });
  });

  // ─── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return a property when found', async () => {
      const property = makeProperty({ id: 5 });
      mockRepo.findOne.mockResolvedValue(property);

      const result = await service.findOne(5);

      expect(result).toEqual(property);
      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 5 } });
    });

    it('should throw NotFoundException when property is not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Property #999 not found');
    });
  });

  // ─── seed ───────────────────────────────────────────────────────────────────

  describe('seed', () => {
    it('should seed properties when the database is empty', async () => {
      mockRepo.count.mockResolvedValue(0);
      mockRepo.save.mockResolvedValue([]);

      const result = await service.seed();

      expect(mockRepo.save).toHaveBeenCalledTimes(1);
      expect(result.message).toBe('Seeded successfully');
      expect(result.count).toBeGreaterThan(0);
    });

    it('should not seed when data already exists', async () => {
      mockRepo.count.mockResolvedValue(40);

      const result = await service.seed();

      expect(mockRepo.save).not.toHaveBeenCalled();
      expect(result.message).toBe('Database already has data');
      expect(result.count).toBe(40);
    });

    it('should generate at least 30 seed properties', async () => {
      mockRepo.count.mockResolvedValue(0);

      const result = await service.seed();

      // seed() calls save with the seed array and returns the length
      const savedArgs = mockRepo.save.mock.calls[0][0] as unknown[];
      expect(savedArgs.length).toBeGreaterThanOrEqual(30);
      expect(result.count).toBe(savedArgs.length);
    });

    it('generated seed data should have required fields', async () => {
      mockRepo.count.mockResolvedValue(0);
      await service.seed();

      const seedData = mockRepo.save.mock.calls[0][0] as Partial<Property>[];
      const sample = seedData[0];

      expect(sample).toHaveProperty('title');
      expect(sample).toHaveProperty('price');
      expect(sample).toHaveProperty('propertyType');
      expect(sample).toHaveProperty('county');
      expect(sample).toHaveProperty('images');
      expect(Array.isArray(sample.images)).toBe(true);
    });
  });
});
