import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { invites, usersToInvites } from '../drizzle/schema';
import { PG_CONNECTION } from '../constants';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { BusinessException } from '../exceptions/exception';

@Injectable()
export class InvitesService {

  constructor(@Inject(PG_CONNECTION) private readonly db: NodePgDatabase<typeof schema>) {}

  /**
   * Creates the codes for the user, for now we will just create one with a length of 7.  
   * To change this we would could store in the db in a config table where it's easy to change
   * the length of the code and the number of codes to be created.
   * @param user The user to attach the codes to.
   * @returns An array of codes
   */
  async createCodes(userId: number): Promise<string[]> {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codes: string[] = []
    let code: string;
    do {
      code = '';
      for (let i = 0; i < 7; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
      }
    } while (await this.db.query.invites.findFirst({ where: eq(invites.code, code)})); 
    // Instead of actually reading from db it may be better to read from redis. This all depends on the performance when we hit higher load.
    
    codes.push(code);
    
    // We need a transaction here to make sure that if we fail to insert into both of these tables we rollback, so we don't get bad state.
    await this.db.transaction(async(tx) => {
      try {
        const insertedIds: { id: number }[] = await this.db.insert(invites).values(codes.map(x => ({ code: x }))).returning({ id: invites.id });
        await this.db.insert(usersToInvites).values(insertedIds.map(x => ({ belongsToUserId: userId, inviteId: x.id })));
      } catch(e) {
        tx.rollback();
        throw new BusinessException(
          'invites', 
          JSON.stringify(e), 
          'There was an error creating an invite code for you, please contact admin for support', 
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      }
    })

    return codes;
  }

  async redeemCode(userId: number, code: string): Promise<{success: boolean, message: string }> {
    // Has the code been redeemed?
    try {
      const invite = await this.db.query.invites.findFirst({ where: eq(invites.code, code), with: { usersToInvites: true } });
      console.log(invite?.usersToInvites);
      if (invite?.usersToInvites?.claimedById) {
        const message: string = `The code ${invite.code} has already been claimed.`
        return {
          success: false,
          message
        }
      }
      
      if (invite?.usersToInvites?.belongsToUserId === userId) {
        return {
          success: false,
          message: 'You cannot claim your own code.'
        }
      }

      // has the user claimed already?
      const claimed = await this.db.query.usersToInvites.findFirst({ where: eq(usersToInvites.claimedById, userId)});
      if (claimed) {
        return {
          success: false,
          message: 'You have already claimed'
        }
      }
      
      await this.db.update(usersToInvites).set({ claimedById: userId }).where(eq(usersToInvites.inviteId, invite?.id!));
  
      return {
        success: true,
        message: 'Code has been successfully redeemed.'
      };
    } catch (e) {
      console.error(e);
      throw new BusinessException(
        'invites', 
        e,
        'Could not redeem code at this moment, please try again later or contact admin for support', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
