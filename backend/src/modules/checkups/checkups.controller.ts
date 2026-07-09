import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CheckupsService } from './checkups.service';
import { CreateCheckupDto } from './dto/create-checkup.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@ApiTags('Checkups')
@Controller('checkups')
export class CheckupsController {
  constructor(private readonly svc: CheckupsService) {}

  @Get() findAll() { return this.svc.findByUser('demo-user'); }

  @Get('timeline') timeline() { return this.svc.getTimeline('demo-user'); }

  @Get(':id') findOne(@Param('id') id: string) { return this.svc.findById(id, 'demo-user'); }

  @Post() create(@Body() dto: CreateCheckupDto) { return this.svc.create('demo-user', dto); }

  @Post(':id/items') addItem(@Param('id') id: string, @Body() dto: { examType: string; professionalType: string; category: string }) {
    return this.svc.addItem(id, 'demo-user', dto);
  }

  @Patch('items/:itemId') updateItem(@Param('itemId') id: string, @Body() dto: UpdateItemDto) {
    return this.svc.updateItem(id, 'demo-user', dto);
  }
}