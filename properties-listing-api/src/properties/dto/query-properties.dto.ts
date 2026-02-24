import {
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
  Min,
  Max,
  MaxLength,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

const PROPERTY_TYPES = ['house', 'apartment', 'studio', 'townhouse', 'bungalow'] as const;
const SORT_FIELDS = ['createdAt', 'price', 'bedrooms', 'areaSqft', 'title'] as const;

@ValidatorConstraint({ name: 'maxPriceGteMinPrice', async: false })
class MaxPriceGteMinPriceConstraint implements ValidatorConstraintInterface {
  validate(maxPrice: number, args: ValidationArguments) {
    const dto = args.object as QueryPropertiesDto;
    if (dto.minPrice !== undefined && maxPrice !== undefined) {
      return maxPrice >= dto.minPrice;
    }
    return true;
  }
  defaultMessage() {
    return 'maxPrice must be greater than or equal to minPrice';
  }
}

export class QueryPropertiesDto {
  @ApiPropertyOptional({ description: 'Full-text search across title, address, city, county' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @ApiPropertyOptional({ enum: PROPERTY_TYPES })
  @IsOptional()
  @IsIn(PROPERTY_TYPES)
  type?: string;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  county?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Validate(MaxPriceGteMinPriceConstraint)
  maxPrice?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bathrooms?: number;

  @ApiPropertyOptional({ enum: ['for_rent', 'for_sale'] })
  @IsOptional()
  @IsIn(['for_rent', 'for_sale'])
  status?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 12, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 12;

  @ApiPropertyOptional({ enum: SORT_FIELDS, default: 'createdAt' })
  @IsOptional()
  @IsIn(SORT_FIELDS)
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
