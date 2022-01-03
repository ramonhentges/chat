import { HttpResponse } from '../types/HttpResponse';
import { ResponseType } from '../types/ResponseType';

type T = any;

export interface HttpService {
  get: (
    url: string,
    responseType?: ResponseType,
    headers?: Record<string, string>
  ) => Promise<HttpResponse>;

  delete: (
    url: string,
    responseType?: ResponseType,
    headers?: Record<string, string>
  ) => Promise<HttpResponse>;

  post: (
    url: string,
    data: T,
    responseType?: ResponseType,
    headers?: Record<string, string>
  ) => Promise<HttpResponse>;

  put: (
    url: string,
    data: T,
    responseType?: ResponseType,
    headers?: Record<string, string>
  ) => Promise<HttpResponse>;

  patch: (
    url: string,
    data: T,
    responseType?: ResponseType,
    headers?: Record<string, string>
  ) => Promise<HttpResponse>;

  setAuthenticationToken: (token: string) => void;

  addResponseInterceptor: (
    onFulfilled?: ((value: HttpResponse) => T | Promise<T>) | undefined,
    onRejected?: ((error: any) => any) | undefined
  ) => number;

  removeResponseInterceptor: (id: number) => void;
}
