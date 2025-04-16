import { z } from 'zod';

import { LoggerModule } from '../logger';

export const CONFIG = Symbol.for('CONFIGS');

export class ConfigsError extends LoggerModule.BaseError {
  constructor(cause: Error) {
    super('[Configs: ConfigError]', cause);
  }
}

export const ConfigurationSchema = z.object({
  APP_ENV: z.string().default('local'),
  DB_CONNECTION_STRING: z.string(),
});

export type ConfigurationsType = z.infer<typeof ConfigurationSchema>;
export type ConfigurationsKeys = keyof ConfigurationsType;

export interface Configs {
  get: <Key extends ConfigurationsKeys>(key: Key) => ConfigurationsType[Key];
}
