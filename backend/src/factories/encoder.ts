import { BcryptEncoder } from '@/external/bcrypt-encoder';
import { Encoder } from '@/ports/encoder';

export const makeEncoder = {
  provide: 'ENCODER',
  useFactory: (): Encoder => {
    return new BcryptEncoder();
  }
};
