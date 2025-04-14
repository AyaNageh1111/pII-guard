export class BaseError extends Error {
  public additionalInfo?: Record<string, unknown>;
  constructor(message: string, readonly cause?: Error, readonly causes?: Error[]) {
    super(message);
  }

  toJSON(): Record<string, unknown> {
    return {
      cause: this.cause ? this.getCauseOutput(this.cause) : null,
      causes: this.causes ? this.causes.map(this.getCauseOutput) : null,
    };
  }

  override toString(): string {
    return JSON.stringify(this.toJSON());
  }

  private getCauseOutput(cause: Error) {
    const causesOutput: Record<string, unknown> = {
      message: cause.message,
      stack: cause.stack,
    };

    if ('metaData' in cause && cause.metaData) {
      causesOutput.metaData = this.hasJsonMethod(cause.metaData)
        ? cause.metaData.toJSON()
        : cause.metaData;
    }

    if (this.hasJsonMethod(cause)) {
      const causeJson = cause.toJSON();
      return {
        ...causesOutput,
        ...causeJson,
      };
    }

    return causesOutput;
  }

  private hasJsonMethod(value: unknown): value is { toJSON: () => Record<string, unknown> } {
    return (
      typeof value === 'object' &&
      value !== null &&
      'toJSON' in value &&
      typeof value.toJSON === 'function'
    );
  }
}

type ConvertToError = (errorRaw: unknown) => BaseError;
export const convertToError: ConvertToError = (errorRaw) => {
  if (errorRaw instanceof BaseError) {
    return errorRaw;
  }

  if (typeof errorRaw === 'string') {
    return new BaseError(errorRaw);
  }

  return new BaseError(`Unknown error: ${errorRaw}`);
};

type IsBaseErrorError = (data: unknown) => data is Error;
export const isError: IsBaseErrorError = (data): data is BaseError => data instanceof BaseError;
