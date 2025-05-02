import { Client } from '@elastic/elasticsearch';
import { injectable, inject } from 'inversify';

import { ConfigsModule } from '../../configs';
import { LoggerModule } from '../../logger';

import { SearchClient, SearchClientError } from './search.client.interface';

@injectable()
export class ElasticSearchClient implements SearchClient {
  private static searchClient: ElasticSearchClient;
  private readonly esClient: Client;

  constructor(@inject(ConfigsModule.CONFIGS) private readonly configs: ConfigsModule.Configs) {
    if (!ElasticSearchClient.searchClient) {
      ElasticSearchClient.searchClient = this;
    }

    this.esClient = new Client({
      node: this.configs.get('ELASTICSEARCH_URL'),
    });
  }

  getClient: SearchClient['getClient'] = () => {
    if (!ElasticSearchClient.searchClient) {
      throw new SearchClientError(undefined, 'Elasitcserach Client not initialized');
    }
    return ElasticSearchClient.searchClient;
  };

  createIndex: SearchClient['createIndex'] = async (index, mapping) => {
    try {
      const exists = await this.esClient.indices.exists({ index });
      if (exists) {
        return null;
      }

      await this.esClient.indices.create({ index, body: mapping });
      await this.esClient.indices.refresh({ index });
      return null;
    } catch (errorRaw) {
      return new SearchClientError(
        {
          errorRaw,
        },
        'Error on creating index',
        LoggerModule.convertToError(errorRaw)
      );
    }
  };
  upsert: SearchClient['upsert'] = async (id: string, document: unknown, index: string) => {
    try {
      await this.esClient.update({
        index,
        id,
        doc: document,
        doc_as_upsert: true,
      });
      await this.esClient.indices.refresh({ index });
      return null;
    } catch (errorRaw) {
      return new SearchClientError(
        {
          errorRaw,
        },
        'Error on upsert document',
        LoggerModule.convertToError(errorRaw)
      );
    }
  };

  async search<Response>(
    searchTerms: Record<string, unknown>,
    index: string
  ): Promise<Array<Response> | SearchClientError> {
    try {
      const data = await this.esClient.search<Response>({
        index,
        ...searchTerms,
      });

      const results = data.hits.hits.map((hit): Response | undefined => hit._source);
      return results.filter((result): result is Response => result !== undefined);
    } catch (errorRaw) {
      return new SearchClientError(
        {
          errorRaw,
          searchTerms,
          index,
        },
        'Error on searching document',
        LoggerModule.convertToError(errorRaw)
      );
    }
  }
}
