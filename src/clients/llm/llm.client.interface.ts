import { LoggerModule } from '../../logger';

export const LLM_CLIENT = Symbol.for('LLM_CLIENT');

export interface LlmClient {
  getClient: () => LlmClient;
  ask<Response>(prompt: string): Promise<Response | LlmClientError>;
  buildPrompt(additionalData: Array<unknown>): string;
}

export class LlmClientError extends LoggerModule.BaseError {
  constructor(
    readonly metaData?: Record<string, unknown>,
    additionalMessage?: string,
    cause?: Error
  ) {
    const message = additionalMessage
      ? `[LlmClient: LlmClientError]:${additionalMessage}`
      : '[LlmClient: LlmClientError]';
    super(message, cause);
  }
}
