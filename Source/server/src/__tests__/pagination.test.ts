import { describe, it, expect } from 'vitest';
import { parsePagination } from '../utils/pagination';

function mockRequest(query: Record<string, string>) {
  return { query } as any;
}

describe('parsePagination', () => {
  it('returns defaults when no params', () => {
    const result = parsePagination(mockRequest({}));
    expect(result).toEqual({ page: 1, limit: 20, offset: 0 });
  });

  it('calculates offset from page and limit', () => {
    const result = parsePagination(mockRequest({ page: '3', limit: '10' }));
    expect(result).toEqual({ page: 3, limit: 10, offset: 20 });
  });

  it('clamps page to minimum 1', () => {
    const result = parsePagination(mockRequest({ page: '-5' }));
    expect(result.page).toBe(1);
    expect(result.offset).toBe(0);
  });

  it('clamps limit to maximum 100', () => {
    const result = parsePagination(mockRequest({ limit: '999' }));
    expect(result.limit).toBe(100);
  });

  it('falls back to default limit for zero', () => {
    const result = parsePagination(mockRequest({ limit: '0' }));
    expect(result.limit).toBe(20);
  });

  it('clamps limit to minimum 1', () => {
    const result = parsePagination(mockRequest({ limit: '-5' }));
    expect(result.limit).toBe(1);
  });
});
