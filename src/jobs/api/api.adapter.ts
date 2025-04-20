import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { logger as honoLogger } from 'hono/logger';
import { injectable, inject } from 'inversify';

import { LoggerModule } from '../../logger';

import { ApiComponent } from './api.interface';
import { JobApiControllerModule } from './controllers';

@injectable()
export class ApiAdapter implements ApiComponent {
  private readonly app: Hono;
  constructor(
    @inject(LoggerModule.LOGGER) private readonly logger: LoggerModule.Logger,
    @inject(JobApiControllerModule.JOB_API_CONTROLLERS)
    private readonly controller: JobApiControllerModule.Controller
  ) {
    this.app = new Hono();

    this.app.use(cors());
    this.app.use(honoLogger(this.loggerHandler.bind(this)));

    this.app.onError(this.errorHandler.bind(this));

    this.app.route('/jobs', this.controller.getRoute());
  }

  getApi = () => this.app;

  private loggerHandler = (message: string, ...rest: string[]) => {
    this.logger.info({
      message,
      additional: rest,
    });
  };

  private errorHandler = (error: Error, c: Context) => {
    this.logger.error(LoggerModule.convertToError(error));

    if (error instanceof HTTPException) {
      const errorBody: {
        message: string;
        cause?: unknown;
      } = {
        message: error.message,
      };

      if ('cause' in error) {
        errorBody.cause = error.cause;
      }
      return c.json(errorBody, error.status);
    }

    return c.json('Internal server error', 500);
  };
}
