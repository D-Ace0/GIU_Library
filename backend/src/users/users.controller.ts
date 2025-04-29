import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
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
      throw new UnauthorizedException(
        'You are not authorized to access this resource',
      );
    }
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(['admin', 'user'])
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    const user = req.user.user_id;
    const role = req.user.role;
    if (role === 'user' && user !== id) {
      throw new UnauthorizedException(
        'You are not authorized to update this resource',
      );
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(['admin'])
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
  // get saved books
  @Get(':id/saved-books')
  @Roles(['admin', 'user'])
  getSavedBooks(@Param('id') id: string, @Request() req) {
    const user = req.user.user_id;
    const role = req.user.role;
    if (role === 'user' && user !== id) {
      throw new UnauthorizedException(
        'You are not authorized to access this resource',
      );
    }
    return this.usersService.getSavedBooks(id);
  }
  //get reviews
  @Get(':id/reviews')
  @Roles(['admin', 'user'])
  getReviews(@Param('id') id: string, @Request() req) {
    const user = req.user.user_id;
    const role = req.user.role;
    if (role === 'user' && user !== id) {
      throw new UnauthorizedException(
        'You are not authorized to access this resource',
      );
    }
    return this.usersService.getReviews(id);
  }

  //update image url
  @Patch(':id/image')
  @Roles(['admin', 'user'])
  updateImage(
    @Param('id') id: string,
    @Body() UpdateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    const user = req.user.user_id;
    const role = req.user.role;
    if (role === 'user' && user !== id) {
      throw new UnauthorizedException(
        'You are not authorized to update this resource',
      );
    }
    if (!UpdateUserDto.image_url) {
      throw new UnauthorizedException('Image URL is required');
    }
    return this.usersService.updateImage(id, UpdateUserDto.image_url);
  }
}
