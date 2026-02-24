import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedProperty } from './entities/saved-property.entity';
import { SavedPropertiesService } from './saved-properties.service';
import { SavedPropertiesController } from './saved-properties.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SavedProperty])],
  controllers: [SavedPropertiesController],
  providers: [SavedPropertiesService],
})
export class SavedPropertiesModule {}
