import { ValidationError } from 'class-validator';

export const transformErrorResponse = (errors: ValidationError[]): any => {
  const errorTransformed: any = {};
  errors.forEach((error) => {
    let errorMessage = '';
    if (error.constraints) {
      for (const [, value] of Object.entries(error.constraints)) {
        errorMessage = `${value}\n${errorMessage}`;
      }
      errorTransformed[error.property] = errorMessage.slice(0, -1);
    } else {
      errorTransformed[error.property] = transformErrorResponse(error.children);
    }
  });
  return errorTransformed;
};
