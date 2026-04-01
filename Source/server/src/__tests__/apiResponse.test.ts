import { describe, it, expect, vi } from 'vitest';
import { success, paginated, error } from '../utils/apiResponse';

function mockResponse() {
  const res: any = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res;
}

describe('apiResponse', () => {
  describe('success', () => {
    it('returns 200 with success envelope', () => {
      const res = mockResponse();
      success(res, { id: '1' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: '1' } });
    });

    it('supports custom status code', () => {
      const res = mockResponse();
      success(res, { id: '1' }, 201);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('paginated', () => {
    it('returns paginated envelope', () => {
      const res = mockResponse();
      paginated(res, [{ id: '1' }], 50, 1, 10);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [{ id: '1' }],
        total: 50,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('error', () => {
    it('returns error envelope with 400 default', () => {
      const res = mockResponse();
      error(res, 'Bad input');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Bad input' });
    });
  });
});
