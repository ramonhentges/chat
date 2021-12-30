import { HttpStatus } from '../enum/http-status.enum';

type T = any;

export type HttpResponse = {
  data: T;
  status: HttpStatus;
};
