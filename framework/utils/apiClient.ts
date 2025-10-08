import type { APIRequestContext, APIResponse } from '@playwright/test';

type QueryOptions = NonNullable<Parameters<APIRequestContext['get']>[1]>;
type DeleteOptions = NonNullable<Parameters<APIRequestContext['delete']>[1]>;
type MutationOptions = NonNullable<Parameters<APIRequestContext['post']>[1]>;

export class ApiClient {
  constructor(private readonly request: APIRequestContext, private readonly baseURL: string) {}

  async get<TResponse = unknown>(endpoint: string, options?: QueryOptions): Promise<TResponse> {
    const response = await this.request.get(this.resolveUrl(endpoint), options);
    return this.parseResponse<TResponse>(response, 'GET', endpoint);
  }

  async delete<TResponse = unknown>(endpoint: string, options?: DeleteOptions): Promise<TResponse> {
    const response = await this.request.delete(this.resolveUrl(endpoint), options);
    return this.parseResponse<TResponse>(response, 'DELETE', endpoint);
  }

  async post<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: MutationOptions
  ): Promise<TResponse> {
    const response = await this.request.post(
      this.resolveUrl(endpoint),
      this.mergeBody(options, body)
    );
    return this.parseResponse<TResponse>(response, 'POST', endpoint);
  }

  async put<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: MutationOptions
  ): Promise<TResponse> {
    const response = await this.request.put(
      this.resolveUrl(endpoint),
      this.mergeBody(options, body)
    );
    return this.parseResponse<TResponse>(response, 'PUT', endpoint);
  }

  async patch<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: MutationOptions
  ): Promise<TResponse> {
    const response = await this.request.patch(
      this.resolveUrl(endpoint),
      this.mergeBody(options, body)
    );
    return this.parseResponse<TResponse>(response, 'PATCH', endpoint);
  }

  async head(endpoint: string, options?: QueryOptions): Promise<APIResponse> {
    const response = await this.request.head(this.resolveUrl(endpoint), options);
    await this.ensureSuccess(response, 'HEAD', endpoint);
    return response;
  }

  private resolveUrl(endpoint: string): string {
    if (/^https?:/i.test(endpoint)) {
      return endpoint;
    }

    const trimmed = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.baseURL.replace(/\/?$/, '/')}${trimmed}`;
  }

  private async parseResponse<T>(response: APIResponse, method: string, endpoint: string): Promise<T> {
    await this.ensureSuccess(response, method, endpoint);

    if (this.isJson(response)) {
      return (await response.json()) as T;
    }

    return (await response.text()) as unknown as T;
  }

  private async ensureSuccess(response: APIResponse, method: string, endpoint: string): Promise<void> {
    if (response.ok()) {
      return;
    }

    const body = await this.safeBody(response);
    throw new Error(
      `${method} ${endpoint} failed with status ${response.status()} ${response.statusText()}\n${body}`
    );
  }

  private isJson(response: APIResponse): boolean {
    const contentType = response.headers()['content-type'];
    return Boolean(contentType && contentType.includes('application/json'));
  }

  private mergeBody<TBody>(
    options: MutationOptions | undefined,
    body: TBody | undefined
  ): MutationOptions | undefined {
    if (body === undefined) {
      return options;
    }

    return {
      ...(options ?? {}),
      data: body as unknown,
    } as MutationOptions;
  }

  private async safeBody(response: APIResponse): Promise<string> {
    try {
      if (this.isJson(response)) {
        return JSON.stringify(await response.json(), null, 2);
      }

      return await response.text();
    } catch (error) {
      return `Unable to read response body: ${String(error)}`;
    }
  }
}
