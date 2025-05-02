import Axios, { AxiosInstance } from 'axios';
import { injectable, inject } from 'inversify';
import llamaTokenizer from 'llama-tokenizer-js';

import { ConfigsModule } from '../../configs';
import { LoggerModule } from '../../logger';

import { LlmClient, LlmClientError } from './llm.client.interface';

const TEMPERATURE = 0.1;
const MAX_TOKEN_COUNT = 2048;
@injectable()
export class OllamaClientAdapter implements LlmClient {
  private static llmClient: OllamaClientAdapter | null = null;
  private readonly api: AxiosInstance;

  constructor(
    @inject(ConfigsModule.CONFIGS) private readonly configs: ConfigsModule.Configs,
    @inject(LoggerModule.LOGGER) private readonly logger: LoggerModule.Logger
  ) {
    this.api = Axios.create({
      baseURL: this.configs.get('LLM_API_URL'),
      timeout: 300000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  getClient: LlmClient['getClient'] = () => {
    if (!OllamaClientAdapter.llmClient) {
      throw new LlmClientError(undefined, 'LLM Client not initialized');
    }
    return OllamaClientAdapter.llmClient;
  };

  ask: LlmClient['ask'] = async (prompt: string) => {
    try {
      const response = await this.api.post('/api/generate', {
        model: this.configs.get('LLM_MODEL'),
        prompt,
        temperature: TEMPERATURE,
        stream: false,
      });
      const { data } = response;
      if (!data.response) {
        return new LlmClientError(undefined, 'Invalid response from LLM');
      }

      this.logger.debug({
        message: 'Response received',
        response,
      });
      const parseResult = this.parseResponse(data.response);
      if (LoggerModule.isError(parseResult)) {
        return new LlmClientError(undefined, 'Failed to parse LLM response', parseResult);
      }
      return parseResult;
    } catch (errorRaw) {
      return new LlmClientError(
        undefined,
        'Unable to ask the LLM',
        LoggerModule.convertToError(errorRaw)
      );
    }
  };

  isTooMuchToken: LlmClient['isTooMuchToken'] = (prompt: string) => {
    return llamaTokenizer.encode(prompt).length > MAX_TOKEN_COUNT;
  };

  private parseResponse = (response: string) => {
    const start = response.indexOf('[');
    const end = response.lastIndexOf(']');

    if (start === -1 || end === -1 || end <= start) {
      return new LlmClientError(
        {
          response,
        },
        'No valid JSON array found.'
      );
    }
    const raw = response.slice(start, end + 1);

    try {
      return JSON.parse(raw);
    } catch (errorRaw) {
      return new LlmClientError(
        {
          raw: raw,
        },
        'ailed to parse extracted JSON array.',
        LoggerModule.convertToError(errorRaw)
      );
    }
  };
}
