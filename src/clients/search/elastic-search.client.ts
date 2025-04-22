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

  upsert: SearchClient['upsert'] = async (id: string, document: unknown, index: string) => {
    try {
      const exists = await this.esClient.indices.exists({ index });
      if (!exists) {
        await this.esClient.indices.create({ index });
      }
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
}
