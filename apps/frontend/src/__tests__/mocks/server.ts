/**
 * Mock helpers for fetch API testing
 */

interface MockResponse {
  data?: unknown;
  status?: number;
  ok?: boolean;
  headers?: Record<string, string>;
}

/**
 * Create a mock fetch response
 */
export const createMockResponse = ({
  data = {},
  status = 200,
  ok = true,
  headers = {},
}: MockResponse = {}): Response => {
  const responseHeaders = new Headers({
    'Content-Type': 'application/json',
    ...headers,
  });

  return {
    ok,
    status,
    headers: responseHeaders,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
    clone: jest.fn().mockReturnThis(),
  } as unknown as Response;
};

/**
 * Mock global fetch with successful response
 */
export const mockFetch = (data: unknown, status = 200): jest.Mock => {
  const mock = jest.fn().mockResolvedValue(
    createMockResponse({
      data,
      status,
      ok: status >= 200 && status < 300,
    })
  );
  global.fetch = mock;
  return mock;
};

/**
 * Mock global fetch with error response
 */
export const mockFetchError = (
  message: string,
  statusCode = 500
): jest.Mock => {
  const mock = jest.fn().mockResolvedValue(
    createMockResponse({
      data: { message, statusCode },
      status: statusCode,
      ok: false,
    })
  );
  global.fetch = mock;
  return mock;
};

/**
 * Mock global fetch to reject with network error
 */
export const mockFetchNetworkError = (errorMessage: string): jest.Mock => {
  const mock = jest.fn().mockRejectedValue(new Error(errorMessage));
  global.fetch = mock;
  return mock;
};

/**
 * Mock global fetch with multiple sequential responses
 */
export const mockFetchSequence = (responses: MockResponse[]): jest.Mock => {
  const mock = jest.fn();
  responses.forEach((response) => {
    const status = response.status ?? 200;
    const isOk = response.ok ?? (status >= 200 && status < 300);
    mock.mockResolvedValueOnce(
      createMockResponse({
        data: response.data,
        status,
        ok: isOk,
      })
    );
  });
  global.fetch = mock;
  return mock;
};

/**
 * Mock global fetch with empty response (204 No Content)
 */
export const mockFetchEmpty = (): jest.Mock => {
  const mock = jest.fn().mockResolvedValue({
    ok: true,
    status: 204,
    headers: new Headers(),
    json: jest.fn().mockRejectedValue(new Error('No content')),
    text: jest.fn().mockResolvedValue(''),
    clone: jest.fn().mockReturnThis(),
  } as unknown as Response);
  global.fetch = mock;
  return mock;
};

/**
 * Restore global fetch
 */
export const restoreFetch = (): void => {
  jest.restoreAllMocks();
};

/**
 * Get the last call arguments to fetch
 */
export const getLastFetchCall = (): [string, RequestInit] | undefined => {
  const mockFn = global.fetch as jest.Mock;
  const calls = mockFn.mock?.calls;
  return calls?.[calls.length - 1];
};

/**
 * Get all fetch call arguments
 */
export const getAllFetchCalls = (): [string, RequestInit][] => {
  const mockFn = global.fetch as jest.Mock;
  return mockFn.mock?.calls ?? [];
};
