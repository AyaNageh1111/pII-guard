import { Hono, Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { injectable, inject } from 'inversify';

import { ClientModule } from '../../../clients';
import { LoggerModule } from '../../../logger';
import { JobDto } from '../../dtos';
import { JobUseCasesModule } from '../../usecases';

import { Controller } from './controller.interface';

@injectable()
export class ControllerAdapter implements Controller {
  private readonly route: Hono;
  constructor(
    @inject(JobUseCasesModule.GET_FILTER_USE_CASE)
    private readonly getFilterUseCase: JobUseCasesModule.GetFilterUseCase,
    @inject(JobUseCasesModule.NEW_JOB_USE_CASE)
    private readonly createJobUseCase: JobUseCasesModule.NewUseCase,
    @inject(JobUseCasesModule.FLUSH_USE_CASE)
    private readonly flushUseCase: JobUseCasesModule.FlushUseCase,
    @inject(JobUseCasesModule.SEARCH_JOB_USE_CASE)
    private readonly searchJobUseCase: JobUseCasesModule.SearchUseCase,
    @inject(LoggerModule.LOGGER) private readonly logger: LoggerModule.Logger,
    @inject(ClientModule.CollectAndFlushClient.COLLECT_AND_FLUSH_CLIENT)
    private readonly collectAndFlush: ClientModule.CollectAndFlushClient.CollectAndFlush
  ) {
    this.collectAndFlush.setSink(this.flushUseCase.execute.bind(this.flushUseCase));
    this.collectAndFlush.start();

    this.route = new Hono();
    this.route.post('/', this.createJobHandler.bind(this));
    this.route.get('/', this.filterJobs.bind(this));
    this.route.get('/:id', this.getJobById.bind(this));
    this.route.get('/search/:term', this.searchJob.bind(this));
    this.route.post('/flush', this.flush.bind(this));
  }

  getRoute = () => this.route;

  private createJobHandler = async (c: Context) => {
    const body = await c.req.json();

    this.logger.debug({
      message: 'Received request to create job',
      body,
    });
    const jobDtoResult = JobDto.createdJobDtoToV1(body);
    if (LoggerModule.isError(jobDtoResult)) {
      throw new HTTPException(400, { cause: jobDtoResult, message: 'Invalid request body' });
    }

    const result = await this.createJobUseCase.execute(body);

    if (this.createJobUseCase.isJobAlreadyExistsError(result)) {
      return c.json({ error: result.message }, 409);
    }

    if (this.createJobUseCase.isInvalidJobDataError(result)) {
      return c.json({ error: result.message }, 400);
    }

    if (this.createJobUseCase.isNewUseCaseError(result)) {
      return c.json({ error: result.message }, 500);
    }

    return c.json(result, 201);
  };

  private getJobById = async (c: Context) => {
    const id = c.req.param('id');
    this.logger.debug({
      message: 'Received request to create job',
      id,
    });

    const jobDtoResult = JobDto.getJobByIdDtoToV1({ id });
    if (LoggerModule.isError(jobDtoResult)) {
      throw new HTTPException(400, { cause: jobDtoResult, message: 'Invalid request body' });
    }

    const result = await this.getFilterUseCase.executeGet(jobDtoResult);

    if (this.getFilterUseCase.isInvalidJobDataError(result)) {
      return c.json({ error: result.message }, 400);
    }

    if (this.getFilterUseCase.isJobNotFoundError(result)) {
      return c.json({ error: `${id} is not found` }, 404);
    }

    if (this.getFilterUseCase.isGetFilterUseCaseError(result)) {
      return c.json({ error: result.message }, 500);
    }

    return c.json(result, 200);
  };

  private filterJobs = async (c: Context) => {
    const query = c.req.query();
    this.logger.debug({
      message: 'Received request to filter jobs',
      query,
    });

    const jobDtoResult = JobDto.filterJobsDtoToV1(query);
    if (LoggerModule.isError(jobDtoResult)) {
      throw new HTTPException(400, { cause: jobDtoResult, message: 'Invalid request body' });
    }

    const result = await this.getFilterUseCase.executeFilter(jobDtoResult);

    if (this.getFilterUseCase.isInvalidJobDataError(result)) {
      return c.json({ error: result.message }, 400);
    }

    if (this.getFilterUseCase.isGetFilterUseCaseError(result)) {
      return c.json({ error: result.message }, 500);
    }

    return c.json(result, 200);
  };

  private searchJob = async (c: Context) => {
    const query = c.req.param('term');
    this.logger.debug({
      message: 'Received request to search jobs',
      query,
    });
    const jobDtoResult = JobDto.searchDtoToV1(query);
    if (LoggerModule.isError(jobDtoResult)) {
      throw new HTTPException(400, { cause: jobDtoResult, message: 'Invalid request body' });
    }
    const result = await this.searchJobUseCase.execute(jobDtoResult);
    if (this.searchJobUseCase.isInvalidJobDataError(result)) {
      return c.json({ error: result.message }, 400);
    }
    if (this.searchJobUseCase.isSearchUseCaseError(result)) {
      return c.json({ error: result.message }, 500);
    }
    return c.json(result, 200);
  };

  private flush = async (c: Context) => {
    const logEntry = await c.req.text();
    await this.collectAndFlush.collect(logEntry);

    return c.body(null, 204);
  };
}
