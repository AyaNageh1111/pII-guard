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
      timeout: 10000,
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
      const response = await this.api.post('/ask', {
        prompt,
      });
      return response.data;
    } catch (errorRaw) {
      return new LlmClientError(
        undefined,
        'Unable to ask the LLM',
        LoggerModule.convertToError(errorRaw)
      );
    }
  };

  buildPrompt: LlmClient['buildPrompt'] = (additionalData: Array<unknown>) => {
    return `Please provide a response based on the following data: ${JSON.stringify(
      additionalData
    )}`;
  };
}
