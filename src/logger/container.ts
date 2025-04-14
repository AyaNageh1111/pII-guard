import 'reflect-metadata';

import { Container, ContainerModule } from 'inversify';

import { LoggerAdapter } from './logger.adapter';
import { LOGGER, Logger } from './logger.interface';

const loggerContainerModule = new ContainerModule((bind) => {
  bind<Logger>(LOGGER).to(LoggerAdapter);
});

export const loggerContainer = new Container({
  defaultScope: 'Singleton',
  autoBindInjectable: true,
});

loggerContainer.load(loggerContainerModule);
