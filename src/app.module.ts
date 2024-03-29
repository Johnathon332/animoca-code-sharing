import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrizzleModule } from './drizzle/drizzle.module';
import { InvitesModule } from './invites/invites.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [DrizzleModule, InvitesModule, UsersModule, ConfigModule.forRoot({ isGlobal: true }), AuthModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
