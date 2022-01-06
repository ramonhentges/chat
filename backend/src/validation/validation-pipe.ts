import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ValidationError } from 'class-validator';
import { transformErrorResponse } from './transform-error';

export const getValidationPipe = (type: 'api' | 'websocket') => {
  const exceptionFactory = {
    api: (errors: ValidationError[]) =>
      new UnprocessableEntityException(transformErrorResponse(errors)),
    websocket: (errors: ValidationError[]) =>
      new WsException(transformErrorResponse(errors))
  };

  return new ValidationPipe({
    whitelist: true,
    validationError: {
      target: false,
      value: false
    },
    exceptionFactory: exceptionFactory[type]
  });
};
