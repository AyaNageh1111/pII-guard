import { Hono } from 'hono';

export const JOB_API_CONTROLLERS = Symbol.for('JOB_API_CONTROLLERS');

export interface Controller {
  getRoute: () => Hono;
}
