import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CheckupsService } from './checkups.service';
import { CreateCheckupDto } from './dto/create-checkup.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CurrentUser } from '../../common/current-user.decorator';

@ApiTags('Checkups')
@Controller('checkups')
export class CheckupsController {
  constructor(private readonly svc: CheckupsService) {}

  @Get() findAll(@CurrentUser() user: any) { return this.svc.findByUser(user.id); }

  @Get('timeline') timeline(@CurrentUser() user: any) { return this.svc.getTimeline(user.id); }

  @Get(':id') findOne(@Param('id') id: string, @CurrentUser() user: any) { return this.svc.findById(id, user.id); }

  @Post() create(@Body() dto: CreateCheckupDto, @CurrentUser() user: any) { return this.svc.create(user.id, dto); }

  @Post(':id/items') addItem(@Param('id') id: string, @Body() dto: { examType: string; professionalType: string; category: string }, @CurrentUser() user: any) {
    return this.svc.addItem(id, user.id, dto);
  }

  @Patch('items/:itemId') updateItem(@Param('itemId') id: string, @Body() dto: UpdateItemDto, @CurrentUser() user: any) {
    return this.svc.updateItem(id, user.id, dto);
  }
}