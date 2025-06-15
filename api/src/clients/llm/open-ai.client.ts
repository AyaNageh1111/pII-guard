import { injectable, inject } from 'inversify';
import llamaTokenizer from 'llama-tokenizer-js';
import OpenAI from 'openai';

import { ConfigsModule } from '../../configs';
import { LoggerModule } from '../../logger';

import { LlmClient, LlmClientError } from './llm.client.interface';

const MAX_TOKEN_COUNT = 2048;
@injectable()
export class OpenAIClientAdapter implements LlmClient {
  private static llmClient: OpenAIClientAdapter | null = null;
  private readonly openai: OpenAI;

  constructor(
    @inject(ConfigsModule.CONFIGS) private readonly configs: ConfigsModule.Configs,
    @inject(LoggerModule.LOGGER) private readonly logger: LoggerModule.Logger
  ) {
    this.openai = new OpenAI({
      apiKey: this.configs.get('LLM_API_KEY'),
    });
    this.logger.info({
      message: 'OpenAI Client initialized',
    });
  }

  getClient: LlmClient['getClient'] = () => {
    if (!OpenAIClientAdapter.llmClient) {
      throw new LlmClientError(undefined, 'LLM Client not initialized');
    }
    return OpenAIClientAdapter.llmClient;
  };

  ask: LlmClient['ask'] = async (prompt: string) => {
    this.logger.info({
      message: 'Asking OpenAI LLM',
    });
    this.logger.debug({
      message: 'Prompt being sent to OpenAI',
      prompt,
    });

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o', // or 'gpt-3.5-turbo'
        messages: [
          { role: 'system', content: 'You are a GDPR compliance assistant.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0,
        response_format: {
          type: 'json_object',
        },
      });
      this.logger.debug({
        message: 'Response received from OpenAI',
        response,
      });
      if (!response.choices || response.choices.length === 0) {
        return new LlmClientError(undefined, 'Invalid response from LLM');
      }
      const content = response.choices[0]?.message.content;
      if (!content) {
        return new LlmClientError(undefined, 'No content in LLM response');
      }
      return JSON.parse(content);
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
}
