import 'reflect-metadata';
/**
 * Warning: This is one huge container. :| :( :D
 */
import { Container, ContainerModule } from 'inversify';

import { ClientModule } from './clients';
import { ConfigsModule } from './configs';
import { JobModule } from './jobs';
import { LoggerModule } from './logger';

const containerModule = new ContainerModule((bind) => {
  // Common components
  // Logger
  bind<LoggerModule.Logger>(LoggerModule.LOGGER).to(LoggerModule.LoggerAdapter);
  // Configs

  // Clients
  bind<ConfigsModule.Configs>(ConfigsModule.CONFIGS).to(ConfigsModule.ConfigsAdapter);
  // DB Client
  bind<ClientModule.DbClientModule.DbClient<ClientModule.DbClientModule.SqlDbClientType>>(
    ClientModule.DbClientModule.DB_CLIENT
  ).to(ClientModule.DbClientModule.PgClientAdapter);
  // LLM Client
  bind<ClientModule.LlmClientModule.LlmClient>(ClientModule.LlmClientModule.LLM_CLIENT).to(
    ClientModule.LlmClientModule.OllamaClientAdapter
  );
  // PubSub Client
  bind<ClientModule.PubSubClientModule.PubSubClient>(
    ClientModule.PubSubClientModule.PUBSUB_CLIENT
  ).to(ClientModule.PubSubClientModule.EventEmitterAdapter);

  // Service components
  // Jobs Module
  bind<JobModule.JobRepositoryModule.JobRepository>(
    JobModule.JobRepositoryModule.JOB_REPOSITORY
  ).to(JobModule.JobRepositoryModule.JobRepositoryAdapter);
});

export const container = new Container({
  autoBindInjectable: true,
});

container.load(containerModule);

export const logger = container.get<LoggerModule.Logger>(LoggerModule.LOGGER);
export const config = container.get<ConfigsModule.Configs>(ConfigsModule.CONFIGS);
export const dbClient = container.get<
  ClientModule.DbClientModule.DbClient<ClientModule.DbClientModule.SqlDbClientType>
>(ClientModule.DbClientModule.DB_CLIENT);
