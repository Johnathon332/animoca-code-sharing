import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { UsersService } from '../users/users.service';
import { InvitesService } from '../invites/invites.service';
import { InvitesModule } from '../invites/invites.module';

@Module({
  imports: [
    DrizzleModule,
    UsersModule,
    InvitesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
            expiresIn: '7d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    UsersService,
    InvitesService,
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ]
})
export class AuthModule {}
