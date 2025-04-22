import { z } from 'zod';

import { LoggerModule } from '../logger';

export const CONFIGS = Symbol.for('CONFIGS');
const DEFAULT_WEB_PORT = 6000;
export class ConfigsError extends LoggerModule.BaseError {
  constructor(cause: Error) {
    super('[Configs: ConfigError]', cause);
  }
}

export const ConfigurationSchema = z.object({
  APP_ENV: z.string().default('local'),
  DB_CONNECTION_STRING: z.string(),
  LLM_API_URL: z.string(),
  NEW_JOB_CREATED_TOPIC: z.string(),
  JOB_STATUS_UPDATED_TOPIC: z.string(),
  ELASTICSEARCH_URL: z.string(),
  JOB_ELASTICSEARCH_INDEX: z.string(),
  HTTP_PORT: z.preprocess(Number, z.number()).default(DEFAULT_WEB_PORT),
});

export type ConfigurationsType = z.infer<typeof ConfigurationSchema>;
export type ConfigurationsKeys = keyof ConfigurationsType;

export interface Configs {
  get: <Key extends ConfigurationsKeys>(key: Key) => ConfigurationsType[Key];
}
