import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { QueryPropertiesDto } from './dto/query-properties.dto';
import { Property } from './entities/property.entity';

const mockProperty: Partial<Property> = {
  id: 1,
  title: '2 Bed House in Dublin',
  price: 1800,
  propertyType: 'house',
  bedrooms: 2,
  bathrooms: 1,
  city: 'Dublin',
  county: 'Dublin',
  status: 'for_rent',
};

const paginatedResponse = {
  data: [mockProperty],
  meta: { total: 1, page: 1, limit: 12, totalPages: 1 },
};

describe('PropertiesController', () => {
  let controller: PropertiesController;
  let service: jest.Mocked<PropertiesService>;

  beforeEach(async () => {
    const mockService: Partial<jest.Mocked<PropertiesService>> = {
      findAll: jest.fn().mockResolvedValue(paginatedResponse),
      findOne: jest.fn().mockResolvedValue(mockProperty),
      seed: jest.fn().mockResolvedValue({ message: 'Seeded successfully', count: 40 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertiesController],
      providers: [{ provide: PropertiesService, useValue: mockService }],
    }).compile();

    controller = module.get<PropertiesController>(PropertiesController);
    service = module.get(PropertiesService);
  });

  // ─── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should call service.findAll with the query DTO', async () => {
      const query: QueryPropertiesDto = { page: 2, limit: 6, type: 'house' };

      await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return the paginated result from service', async () => {
      const result = await controller.findAll({});

      expect(result).toEqual(paginatedResponse);
    });

    it('should pass search and filter params through to the service', async () => {
      const query: QueryPropertiesDto = {
        search: 'antrim',
        county: 'Antrim',
        minPrice: 500,
        maxPrice: 2000,
        bedrooms: 2,
        bathrooms: 1,
        status: 'for_rent',
      };

      await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  // ─── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should call service.findOne with the parsed integer id', async () => {
      await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return the property from service', async () => {
      const result = await controller.findOne(1);

      expect(result).toEqual(mockProperty);
    });

    it('should propagate NotFoundException from service', async () => {
      service.findOne.mockRejectedValue(new NotFoundException('Property #999 not found'));

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── seed ───────────────────────────────────────────────────────────────────

  describe('seed', () => {
    it('should call service.seed', async () => {
      await controller.seed();

      expect(service.seed).toHaveBeenCalledTimes(1);
    });

    it('should return the seed result from service', async () => {
      const result = await controller.seed();

      expect(result).toEqual({ message: 'Seeded successfully', count: 40 });
    });
  });
});
