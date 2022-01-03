import axios from 'axios';
import { injectable } from 'inversify';
import { HttpService } from '../../../ports/services/HttpService';
import { HttpResponse } from '../../../types/HttpResponse';
import { ResponseType } from '../../../types/ResponseType';

type T = any;

const { REACT_APP_BASE_API_URL } = process.env;

@injectable()
export class AxiosHttpService implements HttpService {
  private api;
  constructor() {
    this.api = axios.create({ baseURL: REACT_APP_BASE_API_URL });
  }

  get = (
    url: string,
    responseType?: ResponseType,
    headers?: Record<string, string>
  ) => {
    return this.api({ method: 'GET', url, responseType, headers });
  };
  delete = (
    url: string,
    responseType?: ResponseType,
    headers?: Record<string, string>
  ) => {
    return this.api({ method: 'DELETE', url, responseType, headers });
  };
  post = (
    url: string,
    data: any,
    responseType?: ResponseType,
    headers?: Record<string, string>
  ) => {
    return this.api({ method: 'POST', url, data, responseType, headers });
  };
  put = (
    url: string,
    data: any,
    responseType?: ResponseType,
    headers?: Record<string, string>
  ) => {
    return this.api({ method: 'PUT', url, data, responseType, headers });
  };
  patch = (
    url: string,
    data: any,
    responseType?: ResponseType,
    headers?: Record<string, string>
  ) => {
    return this.api({ method: 'PATCH', url, data, responseType, headers });
  };
  setAuthenticationToken = (token: string) => {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  addResponseInterceptor = (
    onFulfilled?: ((value: HttpResponse) => T | Promise<T>) | undefined,
    onRejected?: ((error: any) => any) | undefined
  ) => {
    return this.api.interceptors.response.use(onFulfilled, onRejected);
  };

  removeResponseInterceptor = (id: number) => {
    this.api.interceptors.response.eject(id);
  };
}
