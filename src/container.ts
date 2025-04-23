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
  bind<ConfigsModule.Configs>(ConfigsModule.CONFIGS)
    .to(ConfigsModule.ConfigsAdapter)
    .inSingletonScope();
  // DB Client
  bind<ClientModule.DbClientModule.DbClient<ClientModule.DbClientModule.SqlDbClientType>>(
    ClientModule.DbClientModule.DB_CLIENT
  )
    .to(ClientModule.DbClientModule.PgClientAdapter)
    .inSingletonScope();
  // LLM Client
  bind<ClientModule.LlmClientModule.LlmClient>(ClientModule.LlmClientModule.LLM_CLIENT)
    .to(ClientModule.LlmClientModule.OllamaClientAdapter)
    .inSingletonScope();
  // PubSub Client
  bind<ClientModule.PubSubClientModule.PubSubClient>(ClientModule.PubSubClientModule.PUBSUB_CLIENT)
    .to(ClientModule.PubSubClientModule.EventEmitterAdapter)
    .inSingletonScope();
  // Search
  bind<ClientModule.SearchClientModule.SearchClient>(
    ClientModule.SearchClientModule.SEARCH_CLIENT
  ).to(ClientModule.SearchClientModule.ElasticSearchClient);

  // Service components
  // Jobs Module
  bind<JobModule.JobRepositoryModule.JobRepository>(
    JobModule.JobRepositoryModule.JOB_REPOSITORY
  ).to(JobModule.JobRepositoryModule.JobRepositoryAdapter);

  //Job UseCases
  bind<JobModule.JobUseCasesModule.NewUseCase>(JobModule.JobUseCasesModule.NEW_JOB_USE_CASE).to(
    JobModule.JobUseCasesModule.NewUseCaseAdapter
  );
  bind<JobModule.JobUseCasesModule.UpdateUseCase>(
    JobModule.JobUseCasesModule.UPDATE_JOB_USE_CASE
  ).to(JobModule.JobUseCasesModule.UpdateUseCaseAdapter);
  bind<JobModule.JobUseCasesModule.ProcessUseCase>(
    JobModule.JobUseCasesModule.PROCESS_JOB_USE_CASE
  ).to(JobModule.JobUseCasesModule.ProcessUseCaseAdapter);
  bind<JobModule.JobUseCasesModule.GetFilterUseCase>(
    JobModule.JobUseCasesModule.GET_FILTER_USE_CASE
  ).to(JobModule.JobUseCasesModule.GetFilterUseCaseAdapter);

  // Job API Controllers
  bind<JobModule.Api.JobApiControllerModule.Controller>(
    JobModule.Api.JobApiControllerModule.JOB_API_CONTROLLERS
  ).to(JobModule.Api.JobApiControllerModule.ControllerAdapter);

  // Job API
  bind<JobModule.Api.ApiComponent>(JobModule.Api.API_COMPONENT).to(JobModule.Api.ApiAdapter);
  // Job pubsub
  bind<JobModule.JobPubSubModule.JobPubSub>(JobModule.JobPubSubModule.JOB_PUBSUB_COMPONENT).to(
    JobModule.JobPubSubModule.JobPubSubAdapter
  );
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
export const searchClient = container.get<ClientModule.SearchClientModule.SearchClient>(
  ClientModule.SearchClientModule.SEARCH_CLIENT
);
export const jobApi = container.get<JobModule.Api.ApiComponent>(JobModule.Api.API_COMPONENT);
export const jobPubSub = container.get<JobModule.JobPubSubModule.JobPubSub>(
  JobModule.JobPubSubModule.JOB_PUBSUB_COMPONENT
);
