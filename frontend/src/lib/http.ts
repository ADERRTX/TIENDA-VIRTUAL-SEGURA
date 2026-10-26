export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiResponse<T, M = unknown> {
  data: T;
  meta?: M;
}

export async function http<T, M = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T, M>> {
  const url = endpoint.startsWith('http') ? endpoint : `/api/v1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // for HttpOnly JWT cookie
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorPayload = data?.error;
    const code = errorPayload?.code || `HTTP_${response.status}`;
    const message = errorPayload?.message || 'Ocurrió un error en la solicitud';
    throw new ApiError(code, message, response.status);
  }

  return data as ApiResponse<T, M>;
}
