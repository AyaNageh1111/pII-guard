import { Hono, Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { injectable, inject } from 'inversify';

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
    @inject(LoggerModule.LOGGER) private readonly logger: LoggerModule.Logger
  ) {
    this.route = new Hono();
    this.route.post('/', this.createJobHandler.bind(this));
    this.route.get('/', this.filterJobs.bind(this));
    this.route.get('/:id', this.getJobById.bind(this));
    this.route.post('/dump', this.dumpLog.bind(this));
  }

  getRoute = () => this.route;

  private createJobHandler = async (c: Context) => {
    const body = await c.req.json();

    this.logger.info({
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
    this.logger.info({
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

  private dumpLog = async (c: Context) => {
    const body = await await c.req.json();
    console.log(JSON.stringify(body, null, 2));

    return c.json({}, 200);
  };

  private filterJobs = async (c: Context) => {
    const query = c.req.query();
    this.logger.info({
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
}
