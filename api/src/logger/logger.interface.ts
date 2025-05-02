export const LOGGER = Symbol.for('LOGGER');

type ErrorWithMetaDataAndId = Error & { errorId?: string; metaData?: Record<string, unknown> };
export interface Logger {
  error: (error: ErrorWithMetaDataAndId) => void;
  info: (payload: Record<string, unknown>) => void;
  debug: (payload: Record<string, unknown>) => void;
  warn: (payload: Record<string, unknown>) => void;
}
