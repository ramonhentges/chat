import { BcryptEncoder } from '@/external/bcrypt-encoder';
import { Encoder } from '@/ports/encoder';
import { TYPES } from './types';

export const makeEncoder = {
  provide: TYPES.Encoder,
  useFactory: (): Encoder => {
    return new BcryptEncoder();
  }
};
