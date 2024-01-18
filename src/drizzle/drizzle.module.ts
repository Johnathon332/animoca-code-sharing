import { Module } from '@nestjs/common';
import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from 'pg';
import { PG_CONNECTION } from '../constants';
import * as schema  from './schema';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: PG_CONNECTION,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const connectionString = configService.get<string>('DATABASE_URL');

        const ssl = configService.get<string>('env') === undefined ? false : {
          rejectUnauthorized: false,
        };

        const pool: Pool = new Pool({
          connectionString,
          ssl,
        });

        const db: NodePgDatabase<typeof schema> = drizzle(pool, { schema, logger: true });
        await migrate(db, { migrationsFolder: 'migrations' });
        return db;
      },
    },
  ],
  exports: [PG_CONNECTION],
})
export class DrizzleModule {}