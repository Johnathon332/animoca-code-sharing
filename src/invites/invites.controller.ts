import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { RedeemDto } from './dto/redeem.dto';

@Controller('invites')
export class InvitesController {
  constructor(private readonly inviteService: InvitesService) {}

  @HttpCode(HttpStatus.OK)
  @Post('redeem')
  redeem(@Req() req: UserPayload, @Body() redeemDto: RedeemDto) {
    console.log(req.user);
    return this.inviteService.redeemCode(req.user.id, redeemDto.code);
  }
}
