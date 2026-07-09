import { Controller, Get, Patch, Delete, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from '../../common/user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Obter perfil (demo)' })
  getProfile() {
    return this.usersService.getProfile('demo-user');
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Atualizar perfil' })
  updateProfile(@Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile('demo-user', dto);
  }

  @Delete('account')
  @ApiOperation({ summary: 'Excluir conta (LGPD)' })
  deleteAccount() {
    return this.usersService.deleteAccount('demo-user');
  }
}
