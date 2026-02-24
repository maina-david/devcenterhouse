import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { QueryPropertiesDto } from './dto/query-properties.dto';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
  ) {}

  async findAll(query: QueryPropertiesDto) {
    const {
      search,
      type,
      county,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      status,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const qb = this.propertyRepo.createQueryBuilder('property');

    if (search) {
      qb.andWhere(
        '(property.title ILIKE :search OR property.address ILIKE :search OR property.city ILIKE :search OR property.county ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (type) {
      qb.andWhere('property.propertyType = :type', { type });
    }

    if (county) {
      qb.andWhere('property.county ILIKE :county', { county: `%${county}%` });
    }

    if (minPrice !== undefined) {
      qb.andWhere('property.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      qb.andWhere('property.price <= :maxPrice', { maxPrice });
    }

    if (bedrooms !== undefined) {
      qb.andWhere('property.bedrooms >= :bedrooms', { bedrooms });
    }

    if (bathrooms !== undefined) {
      qb.andWhere('property.bathrooms >= :bathrooms', { bathrooms });
    }

    if (status) {
      qb.andWhere('property.status = :status', { status });
    }

    const allowedSortFields = ['createdAt', 'price', 'bedrooms', 'areaSqft', 'title'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    qb.orderBy(`property.${safeSortBy}`, sortOrder);

    const offset = (page - 1) * limit;
    qb.skip(offset).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Property> {
    const property = await this.propertyRepo.findOne({ where: { id } });
    if (!property) {
      throw new NotFoundException(`Property #${id} not found`);
    }
    return property;
  }

  async create(dto: CreatePropertyDto): Promise<Property> {
    const property = this.propertyRepo.create(dto);
    return this.propertyRepo.save(property);
  }

  async update(id: number, dto: UpdatePropertyDto): Promise<Property> {
    await this.findOne(id);
    await this.propertyRepo.update(id, dto as Partial<Property>);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.propertyRepo.delete(id);
  }

  async getStats() {
    const total = await this.propertyRepo.count();
    const forRent = await this.propertyRepo.count({ where: { status: 'for_rent' } });
    const forSale = await this.propertyRepo.count({ where: { status: 'for_sale' } });
    const featured = await this.propertyRepo.count({ where: { isFeatured: true } });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newThisMonth = await this.propertyRepo
      .createQueryBuilder('property')
      .where('property.createdAt >= :start', { start: startOfMonth })
      .getCount();

    return { total, forRent, forSale, featured, newThisMonth };
  }

  async seed(): Promise<{ message: string; count: number }> {
    const existing = await this.propertyRepo.count();
    if (existing > 0) {
      return { message: 'Database already has data', count: existing };
    }

    const seedData = this.generateSeedData();
    await this.propertyRepo.save(seedData);
    return { message: 'Seeded successfully', count: seedData.length };
  }

  private generateSeedData(): Partial<Property>[] {
    const types = ['house', 'apartment', 'studio', 'townhouse', 'bungalow'];
    const counties = ['Antrim', 'Dublin', 'Cork', 'Galway', 'Limerick', 'Waterford', 'Kerry', 'Wicklow'];
    const cities = {
      Antrim: ['Antrim', 'Ballymena', 'Lisburn', 'Newtownabbey'],
      Dublin: ['Dublin 1', 'Dublin 2', 'Dublin 4', 'Dún Laoghaire', 'Swords', 'Tallaght'],
      Cork: ['Cork City', 'Cobh', 'Midleton', 'Carrigaline'],
      Galway: ['Galway City', 'Salthill', 'Oranmore', 'Tuam'],
      Limerick: ['Limerick City', 'Castletroy', 'Dooradoyle'],
      Waterford: ['Waterford City', 'Tramore', 'Dungarvan'],
      Kerry: ['Tralee', 'Killarney', 'Kenmare'],
      Wicklow: ['Bray', 'Greystones', 'Wicklow Town'],
    };
    const streets = [
      'Main Street', 'Church Road', 'Park Avenue', 'Oak Lane', 'Maple Drive',
      'Riverside Walk', 'Hillside Close', 'Garden Terrace', 'Manor Way', 'Bay View Road',
    ];
    const descriptions = [
      'A beautifully presented property in a sought-after location. Features modern kitchen, bright living areas and private garden.',
      'Stunning property with superb views. Recently renovated throughout with high-end finishes and excellent transport links.',
      'Charming home in a quiet residential area. Perfect for families with spacious rooms and a lovely garden.',
      'Contemporary property with open-plan living. Walking distance to local amenities, schools and public transport.',
      'Well-maintained property offering comfortable living. Ideal for professionals seeking a convenient base.',
    ];

    const properties: Partial<Property>[] = [];

    for (let i = 1; i <= 40; i++) {
      const county = counties[Math.floor(Math.random() * counties.length)];
      const cityList = cities[county];
      const city = cityList[Math.floor(Math.random() * cityList.length)];
      const propertyType = types[Math.floor(Math.random() * types.length)];
      const bedrooms = propertyType === 'studio' ? 0 : Math.floor(Math.random() * 5) + 1;
      const bathrooms = Math.floor(Math.random() * 3) + 1;
      const basePrice = propertyType === 'studio' ? 800 : bedrooms * 350 + 500;
      const price = basePrice + Math.floor(Math.random() * 500);
      const street = streets[Math.floor(Math.random() * streets.length)];
      const streetNum = Math.floor(Math.random() * 100) + 1;
      const imageId = 100 + i;

      properties.push({
        title: `${bedrooms > 0 ? bedrooms + ' Bed ' : ''}${this.capitalise(propertyType)} in ${city}`,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        price,
        propertyType,
        bedrooms,
        bathrooms,
        areaSqft: bedrooms * 180 + 400 + Math.floor(Math.random() * 200),
        address: `${streetNum} ${street}`,
        city,
        county,
        eircode: this.randomEircode(),
        status: Math.random() > 0.2 ? 'for_rent' : 'for_sale',
        images: [
          `https://picsum.photos/seed/prop${i}/800/600`,
          `https://picsum.photos/seed/prop${i}b/800/600`,
          `https://picsum.photos/seed/prop${i}c/800/600`,
        ],
        latitude: 53.0 + Math.random() * 1.5,
        longitude: -7.0 - Math.random() * 2.5,
        availableFrom: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        isFeatured: i <= 5,
      });
    }

    return properties;
  }

  private capitalise(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private randomEircode(): string {
    const prefixes = ['D01', 'D02', 'D04', 'A94', 'BT1', 'BT2', 'T12', 'H91', 'V94', 'X91'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const suffix = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${prefix} ${suffix}`;
  }
}
