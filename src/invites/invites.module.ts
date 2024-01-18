import { Module } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { InvitesController } from './invites.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  providers: [InvitesService],
  controllers: [InvitesController]
})
export class InvitesModule {}
