import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthorizationGuard } from 'src/guards/authorization.guard';

@Controller('users')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(['admin'])
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(['admin', 'user'])
  findOne(@Param('id') id: string, @Request() req) {
    const user = req.user.user_id;
    const role = req.user.role;
    if (role === 'user' && user !== id) {
      throw new UnauthorizedException('You are not authorized to access this resource');
    }
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(['admin', 'user'])
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    const user = req.user.user_id;
    const role = req.user.role;
    if (role === 'user' && user !== id) {
      throw new UnauthorizedException('You are not authorized to update this resource');
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(['admin'])
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
