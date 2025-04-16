import { injectable, inject } from 'inversify';
import knex, { type Knex as SqlDbClient } from 'knex';

import { ConfigsModule } from '../../configs';
import { LoggerModule } from '../../logger';

import { DbClient, DbClientError } from './db.client.interface';

export type SqlDbClientType = SqlDbClient;

@injectable()
export class DbClientAdapter implements DbClient<SqlDbClient> {
  private static dbClient: SqlDbClient | null = null;
  private dbName: string;
  constructor(@inject(ConfigsModule.CONFIG) private readonly configs: ConfigsModule.Configs) {
    const { pathname } = new URL(this.configs.get('DB_CONNECTION_STRING'));
    this.dbName = pathname.replace('/', '');
  }

  init: DbClient<SqlDbClientType>['init'] = async () => {
    try {
      if (!DbClientAdapter.dbClient) {
        DbClientAdapter.dbClient = knex({
          client: 'pg',
          connection: { connectionString: this.configs.get('DB_CONNECTION_STRING') },
          pool: {
            min: 1,
            max: 5,
          },
        });
      }

      await DbClientAdapter.dbClient.raw('SELECT 1');
    } catch (errorRaw) {
      throw new DbClientError(
        undefined,
        'Unable to initialize the DB client',
        LoggerModule.convertToError(errorRaw)
      );
    }
  };

  getClient: DbClient<SqlDbClientType>['getClient'] = () => {
    if (!DbClientAdapter.dbClient) {
      throw new DbClientError(undefined, 'Database Client not initialized');
    }
    return DbClientAdapter.dbClient;
  };

  disconnect = async (): Promise<void> => {
    if (!DbClientAdapter.dbClient) {
      throw new DbClientError(undefined, 'DB Client not initialized');
    }

    await DbClientAdapter.dbClient.destroy();
  };

  getDatabaseName = (): string => this.dbName;
}
