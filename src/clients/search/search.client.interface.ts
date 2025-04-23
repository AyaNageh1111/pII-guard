import { LoggerModule } from '../../logger';

export const SEARCH_CLIENT = Symbol.for('SEARCH_CLIENT');

export class SearchClientError extends LoggerModule.BaseError {
  constructor(
    readonly metaData?: Record<string, unknown>,
    additionalMessage?: string,
    cause?: Error
  ) {
    const message = additionalMessage
      ? `[SearchClient: SearchClientError]:${additionalMessage}`
      : '[SearchClient: SearchClientError]';
    super(message, cause);
  }
}

export interface SearchClient {
  getClient: () => SearchClient;
  upsert: (id: string, document: unknown, index: string) => Promise<null | SearchClientError>;
  search: <Response>(
    searchTerms: Record<string, unknown>,
    index: string
  ) => Promise<Array<Response> | SearchClientError>;
  createIndex: (
    index: string,
    mapping: Record<string, unknown>
  ) => Promise<null | SearchClientError>;
}
