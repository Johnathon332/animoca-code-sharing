import { Controller, Get, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  getProfile(@Req() req: UserPayload) {
    return this.userService.getProfile(req.user);
  }
}
