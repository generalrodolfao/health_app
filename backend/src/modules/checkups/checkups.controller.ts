import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CheckupsService } from './checkups.service';
import { CreateCheckupDto } from './dto/create-checkup.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { User } from '../../common/user.decorator';

@ApiTags('Checkups')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('checkups')
export class CheckupsController {
  constructor(private readonly checkupsService: CheckupsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar checkups do usuário' })
  findAll(@User('id') userId: string) {
    return this.checkupsService.findByUser(userId);
  }

  @Get('timeline')
  @ApiOperation({ summary: 'Linha do tempo de checkups' })
  timeline(@User('id') userId: string) {
    return this.checkupsService.getTimeline(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do checkup' })
  findOne(@Param('id') id: string, @User('id') userId: string) {
    return this.checkupsService.findById(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo checkup anual' })
  create(@User('id') userId: string, @Body() dto: CreateCheckupDto) {
    return this.checkupsService.create(userId, dto);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Atualizar item do checkup' })
  updateItem(
    @Param('itemId') itemId: string,
    @User('id') userId: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.checkupsService.updateItem(itemId, userId, dto);
  }
}
