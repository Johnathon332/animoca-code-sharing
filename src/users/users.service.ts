import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { User, users } from './entities/users.entity';
import * as schema from '../drizzle/schema';
import { eq, inArray } from 'drizzle-orm';
import { ProfileDto } from './dto/profile.dto';
import { invites } from '../drizzle/schema';

@Injectable()
export class UsersService {
  constructor(@Inject(PG_CONNECTION) private readonly db: NodePgDatabase<typeof schema>) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.db.query.users.findFirst({
      where: eq(users.email, email)
    })
  }

  async getProfile(user: { id: number, email: string }): Promise<ProfileDto | undefined> {
    try {
      const rawProfile = await this.db.query.users.findFirst({
        where: eq(users.id, user.id),
        with: {
          claimedBy: true
        }
      });
  
      const referrer = await this.db.query.users.findFirst({
        where: eq(users.id, rawProfile?.claimedBy?.belongsToUserId!)
      });
  
      const claimed = await this.db.query.invites.findFirst({
        where: eq(invites.id, rawProfile?.claimedBy?.inviteId!)
      });

      const rawUserCodeMapping = await this.db.query.usersToInvites.findMany({
        where: eq(schema.usersToInvites.belongsToUserId, user.id),
      });
  
      const inviteIds = rawUserCodeMapping.map(x => x.inviteId);
      console.log(inviteIds);
      
      const foundInvites: { id: number, code: string}[] = [];
      
      if (inviteIds.length > 0) {
        foundInvites.push(...await this.db
          .select({ id: invites.id, code: invites.code })
          .from(invites)
          .where(inArray(invites.id, inviteIds)));
      }
  
      return {
        id: rawProfile?.id!,
        email: rawProfile?.email!,
        codes: foundInvites,
        referrer: {
          code: claimed?.code!,
          email: referrer?.email!
        }
      }  
    } catch(e) {
      console.error(e);
    }
  }
}
