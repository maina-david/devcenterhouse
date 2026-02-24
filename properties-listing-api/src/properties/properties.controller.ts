import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { QueryPropertiesDto } from './dto/query-properties.dto';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get property statistics (admin)' })
  getStats() {
    return this.propertiesService.getStats();
  }

  @Get()
  @ApiOperation({ summary: 'Get all properties with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of properties' })
  findAll(@Query() query: QueryPropertiesDto) {
    return this.propertiesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single property by ID' })
  @ApiResponse({ status: 200, description: 'Property found' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.propertiesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new property (admin)' })
  @ApiResponse({ status: 201, description: 'Property created' })
  create(@Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a property (admin)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePropertyDto) {
    return this.propertiesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a property (admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.propertiesService.remove(id);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed the database with mock properties' })
  seed() {
    return this.propertiesService.seed();
  }
}
