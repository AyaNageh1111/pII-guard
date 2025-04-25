import { injectable, inject } from 'inversify';
import { chunk } from 'lodash';

import { LoggerModule } from '../../logger';
import { SchemaModule } from '../../schemas';
import { JobDto } from '../dtos/';

import { FlushUseCase } from './flush.interface';
import { NEW_JOB_USE_CASE, NewUseCase } from './new.usecase.interface';

const DEFAULT_SERVICE = 'unknown_service';

type ServiceLogsTupleType = [service: string, logs: Array<string>];

@injectable()
export class FlushAdapter implements FlushUseCase {
  constructor(
    @inject(NEW_JOB_USE_CASE) private readonly newUseCase: NewUseCase,
    @inject(LoggerModule.LOGGER) private readonly logger: LoggerModule.Logger
  ) {}

  execute: FlushUseCase['execute'] = async (logsToFlush) => {
    const logsByServices = this.getGroupedLogs(logsToFlush);
    const batches = this.getBatches(logsByServices);

    await Promise.allSettled(batches.map((batch) => this.processSingleBatch(batch)));
  };

  private getGroupedLogs(logsToFlush: Array<string>): Map<string, Array<string>> {
    return logsToFlush.reduce((acc, log): Map<string, Array<string>> => {
      const service = this.extractServiceFromLog(log);
      if (acc.has(service)) {
        const logCollection = acc.get(service);
        if (logCollection) {
          logCollection.push(log);
          acc.set(service, logCollection);
        }
      } else {
        acc.set(service, [log]);
      }
      return acc;
    }, new Map<string, Array<string>>());
  }

  private extractServiceFromLog(logEntry: string): string {
    try {
      const log = JSON.parse(logEntry);
      if ('service' in log && typeof log.service === 'string' && log.service.trim()) {
        return log.service;
      }

      return DEFAULT_SERVICE;
    } catch {
      return DEFAULT_SERVICE;
    }
  }

  private getBatches(serviceMapLog: Map<string, Array<string>>): Array<ServiceLogsTupleType> {
    const allBatches: Array<ServiceLogsTupleType> = [];
    for (const [service, logs] of serviceMapLog) {
      const logChunks = chunk(logs, SchemaModule.V1.MAX_LOGS_PER_JOB);
      for (const logChunk of logChunks) {
        allBatches.push([service, logChunk]);
      }
    }

    return allBatches;
  }

  private async processSingleBatch(batch: ServiceLogsTupleType): Promise<void> {
    const [service, logs] = batch;
    const newJobCreateRequestResult = JobDto.createdJobDtoToV1({
      version: SchemaModule.V1.Version,
      tags: [service],
      logs,
    });

    if (LoggerModule.isError(newJobCreateRequestResult)) {
      this.logger.debug({
        message: 'invalid log creation request',
        error: newJobCreateRequestResult,
      });

      return;
    }

    const executionResult = await this.newUseCase.execute(newJobCreateRequestResult);
    if (LoggerModule.isError(executionResult)) {
      this.logger.error(executionResult);
    }
  }
}
