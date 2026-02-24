import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('properties')
@Index('idx_properties_county_status', ['county', 'status'])
@Index('idx_properties_type_status', ['propertyType', 'status'])
@Index('idx_properties_price_created', ['price', 'createdAt'])
export class Property {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Index('idx_properties_price')
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Index('idx_properties_type')
  @Column({ length: 50 })
  propertyType: string;

  @Index('idx_properties_bedrooms')
  @Column({ nullable: true })
  bedrooms: number;

  @Column({ nullable: true })
  bathrooms: number;

  @Column({ nullable: true })
  areaSqft: number;

  @Column({ length: 255 })
  address: string;

  @Column({ length: 100 })
  city: string;

  @Index('idx_properties_county')
  @Column({ length: 100 })
  county: string;

  @Column({ length: 20, nullable: true })
  eircode: string;

  @Index('idx_properties_status')
  @Column({ length: 20, default: 'for_rent' })
  status: string;

  @Column('text', { array: true, default: [] })
  images: string[];

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  longitude: number;

  @Column({ type: 'date', nullable: true })
  availableFrom: string;

  @Index('idx_properties_featured')
  @Column({ default: false })
  isFeatured: boolean;

  @Index('idx_properties_created')
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
