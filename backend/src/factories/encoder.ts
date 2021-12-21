import { BcryptEncoder } from 'src/external/bcrypt-encoder';
import { Encoder } from 'src/ports/encoder';

export const makeEncoder = {
  provide: 'ENCODER',
  useFactory: (): Encoder => {
    return new BcryptEncoder();
  }
};
