import { Hono } from 'hono';
export const API_COMPONENT = Symbol.for('JOB_API_COMPONENT');

export interface ApiComponent {
  getApi: () => Hono;
}
