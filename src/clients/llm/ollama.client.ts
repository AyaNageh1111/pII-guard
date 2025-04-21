import Axios, { AxiosInstance } from 'axios';
import { injectable, inject } from 'inversify';

import { ConfigsModule } from '../../configs';
import { LoggerModule } from '../../logger';

import { LlmClient, LlmClientError } from './llm.client.interface';

@injectable()
export class OllamaClientAdapter implements LlmClient {
  private static llmClient: OllamaClientAdapter | null = null;
  private readonly api: AxiosInstance;

  constructor(@inject(ConfigsModule.CONFIGS) private readonly configs: ConfigsModule.Configs) {
    this.api = Axios.create({
      baseURL: this.configs.get('LLM_API_URL'),
      timeout: 100000,
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
        model: 'llama3:latest',
        prompt,
        temperature: 0.1,
        stream: false,
      });
      const { data } = response;
      if (!data.response) {
        return new LlmClientError(undefined, 'Invalid response from LLM');
      }
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
        undefined,
        'ailed to parse extracted JSON array.',
        LoggerModule.convertToError(errorRaw)
      );
    }
  };
}
