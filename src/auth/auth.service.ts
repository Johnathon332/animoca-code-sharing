import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { BusinessException } from '../exceptions/exception';
import { JwtService } from '@nestjs/jwt';
import { InvitesService } from '../invites/invites.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(PG_CONNECTION) private readonly db: NodePgDatabase<typeof schema>,
    private readonly userService: UsersService,
    private readonly inviteService: InvitesService,
    private readonly jwtService: JwtService
  ) {}

  async register(payload: AuthDto): Promise<Partial<{ access_token: string }>> {

    const found = await this.userService.findByEmail(payload.email);

    if (found) {
      const message: string = `A user with the email ${payload.email} has already registered.`;
      throw new BusinessException('auth', message, message, HttpStatus.FOUND);
    }

    const newUser: schema.NewUser = {
      email: payload.email,
      password: await bcrypt.hash(payload.password, 10)
    }

    try {
      let insertedId: { id: number } | undefined;
      await this.db.transaction(async (tx) => {
        try {
          insertedId = (await this.db.insert(schema.users).values(newUser).returning({ id: schema.users.id }))[0];
          this.inviteService.createCodes(insertedId.id);
        } catch {
          tx.rollback();
        }
      });

      if (!insertedId) {
        throw new BusinessException(
          'auth', 
          'Issue either when inserting user or creating invite codes', 
          'Could not create user, please contact admin for support', 
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      const jwtPayload = { id: insertedId.id, email: payload.email }

      return {
        access_token: await this.jwtService.signAsync(jwtPayload)
      }
    } catch(e) {
      const message: string = 'There was an issue with registraion please contact admin for support';
      throw new BusinessException('auth', JSON.stringify(e), message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async login(payload: AuthDto): Promise<Partial<{ access_token: string }>> {

    const found = await this.userService.findByEmail(payload.email);

    if (!found) {
      const message: string = `No user exists with the email ${payload.email}`;
      throw new BusinessException('auth', message, message, HttpStatus.NOT_FOUND);
    }

    // const hashedPassword: string = await bcrypt.hash(payload.password, 10);

    if (!(await bcrypt.compare(payload.password, found.password))) {
      const message: string = 'The password supplied is incorrect, please try again'
      throw new BusinessException('auth', message, message, HttpStatus.FORBIDDEN);
    }

    const jwtPayload = { id: found.id, email: found.email }

    return {
      access_token: await this.jwtService.signAsync(jwtPayload)
    }
  }
}
