import { injectable } from 'inversify';

import { LoggerModule } from '../logger';

import {
  type Configs,
  type ConfigurationsType,
  ConfigurationSchema,
  ConfigsError,
} from './configs.interface';

@injectable()
export class ConfigsAdapter implements Configs {
  private readonly configs: ConfigurationsType;

  constructor() {
    const configRaw = Object.keys(ConfigurationSchema.shape).reduce((acc, key) => {
      acc[key] = process.env[key];
      return acc;
    }, <Record<string, unknown>>{});

    try {
      this.configs = ConfigurationSchema.parse(configRaw);
    } catch (errorRaw) {
      const error = LoggerModule.convertToError(errorRaw);
      throw new ConfigsError(error);
    }
  }

  get: Configs['get'] = (key) => {
    return this.configs[key];
  };
}
