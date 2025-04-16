import 'reflect-metadata';
/**
 * Warning: This is one huge container. :| :( :D
 */
import { Container, ContainerModule } from 'inversify';

import { ClientModule } from './clients';
import { ConfigsModule } from './configs';
import { LoggerModule } from './logger';

const containerModule = new ContainerModule((bind) => {
  // Logger
  bind<LoggerModule.Logger>(LoggerModule.LOGGER).to(LoggerModule.LoggerAdapter);
  // Configs
  bind<ConfigsModule.Configs>(ConfigsModule.CONFIG).to(ConfigsModule.ConfigsAdapter);
  // DB Client
  bind<ClientModule.DbClientModule.DbClient<ClientModule.DbClientModule.SqlDbClientType>>(
    ClientModule.DbClientModule.DB_CLIENT
  ).to(ClientModule.DbClientModule.DbClientAdapter);
});

export const container = new Container({
  autoBindInjectable: true,
});

container.load(containerModule);

export const logger = container.get<LoggerModule.Logger>(LoggerModule.LOGGER);
export const config = container.get<ConfigsModule.Configs>(ConfigsModule.CONFIG);
export const dbClient = container.get<
  ClientModule.DbClientModule.DbClient<ClientModule.DbClientModule.SqlDbClientType>
>(ClientModule.DbClientModule.DB_CLIENT);
