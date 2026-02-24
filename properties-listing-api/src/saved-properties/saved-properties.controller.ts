import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SavedPropertiesService } from './saved-properties.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('saved-properties')
@Controller('saved-properties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class SavedPropertiesController {
  constructor(private readonly service: SavedPropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'List saved properties for current user' })
  findAll(@CurrentUser() user: { id: number }) {
    return this.service.findByUser(user.id);
  }

  @Get('ids')
  @ApiOperation({ summary: 'Get IDs of saved properties' })
  getIds(@CurrentUser() user: { id: number }) {
    return this.service.getSavedIds(user.id);
  }

  @Post(':propertyId')
  @ApiOperation({ summary: 'Save a property' })
  save(@CurrentUser() user: { id: number }, @Param('propertyId', ParseIntPipe) propertyId: number) {
    return this.service.save(user.id, propertyId);
  }

  @Delete(':propertyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a saved property' })
  remove(@CurrentUser() user: { id: number }, @Param('propertyId', ParseIntPipe) propertyId: number) {
    return this.service.remove(user.id, propertyId);
  }
}
