import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CheckupsService } from './checkups.service';
import { CreateCheckupDto } from './dto/create-checkup.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { User } from '../../common/user.decorator';

@ApiTags('Checkups')
@ApiBearerAuth()
@Controller('checkups')
export class CheckupsController {
  constructor(private readonly checkupsService: CheckupsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar checkups (mock user)' })
  findAll() {
    return this.checkupsService.findByUser('demo-user');
  }

  @Get('timeline')
  @ApiOperation({ summary: 'Linha do tempo de checkups' })
  timeline() {
    return this.checkupsService.getTimeline('demo-user');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do checkup' })
  findOne(@Param('id') id: string) {
    return this.checkupsService.findById(id, 'demo-user');
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo checkup anual' })
  create(@Body() dto: CreateCheckupDto) {
    return this.checkupsService.create('demo-user', dto);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Atualizar item do checkup' })
  updateItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.checkupsService.updateItem(itemId, 'demo-user', dto);
  }
}
