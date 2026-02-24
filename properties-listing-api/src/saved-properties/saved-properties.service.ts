import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedProperty } from './entities/saved-property.entity';

@Injectable()
export class SavedPropertiesService {
  constructor(
    @InjectRepository(SavedProperty)
    private readonly repo: Repository<SavedProperty>,
  ) {}

  async findByUser(userId: number) {
    return this.repo.find({
      where: { userId },
      relations: ['property'],
      order: { createdAt: 'DESC' },
    });
  }

  async getSavedIds(userId: number): Promise<number[]> {
    const saved = await this.repo.find({ where: { userId }, select: ['propertyId'] });
    return saved.map((s) => s.propertyId);
  }

  async save(userId: number, propertyId: number) {
    const existing = await this.repo.findOne({ where: { userId, propertyId } });
    if (existing) return existing;
    const entry = this.repo.create({ userId, propertyId });
    return this.repo.save(entry);
  }

  async remove(userId: number, propertyId: number) {
    await this.repo.delete({ userId, propertyId });
  }
}
