import { Response } from 'express';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const sendOk = <T>(res: Response, data: T, message?: string): void => {
  res.status(200).json({ data, ...(message ? { message } : {}) });
};

export const sendCreated = <T>(res: Response, data: T, message?: string): void => {
  res.status(201).json({ data, ...(message ? { message } : {}) });
};

export const sendPaginated = <T>(res: Response, result: PaginatedResult<T>): void => {
  res.status(200).json(result);
};

export const parsePagination = (
  query: Record<string, unknown>,
): { page: number; limit: number; offset: number } => {
  const page = Math.max(1, parseInt(String(query.page ?? '1'), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit ?? '20'), 10)));
  return { page, limit, offset: (page - 1) * limit };
};
