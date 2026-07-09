import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CheckupsService } from './checkups.service';
import { CreateCheckupDto } from './dto/create-checkup.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@ApiTags('Checkups')
@Controller('checkups')
export class CheckupsController {
  constructor(private readonly checkupsService: CheckupsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar checkups do usuário demo' })
  findAll() { return this.checkupsService.findByUser('demo-user'); }

  @Get('timeline')
  @ApiOperation({ summary: 'Linha do tempo de checkups' })
  timeline() { return this.checkupsService.getTimeline('demo-user'); }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do checkup' })
  findOne(@Param('id') id: string) { return this.checkupsService.findById(id, 'demo-user'); }

  @Post()
  @ApiOperation({ summary: 'Criar checkup anual' })
  create(@Body() dto: CreateCheckupDto) { return this.checkupsService.create('demo-user', dto); }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Atualizar item do checkup (concluir, agendar, etc)' })
  updateItem(@Param('itemId') itemId: string, @Body() dto: UpdateItemDto) {
    return this.checkupsService.updateItem(itemId, 'demo-user', dto);
  }
}