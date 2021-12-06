import { ErrorResponse } from '../interfaces/error';

function transformErrorResponse(errors: ErrorResponse[]): any {
  const errorTransformed: any = {};
  errors.forEach((error) => {
    let errorMessage = '';
    for (const [key, value] of Object.entries(error.constraints)) {
      errorMessage = `${value}\n${errorMessage}`;
    }
    errorTransformed[error.property] = errorMessage;
  });
  return errorTransformed;
}

export { transformErrorResponse };
