import { Encoder } from 'src/ports/encoder';
import { hash, compare, genSaltSync } from 'bcrypt';

export class BcryptEncoder implements Encoder {
  encode(plain: string): Promise<string> {
    return hash(plain, genSaltSync());
  }
  compare(plain: string, hashed: string): Promise<boolean> {
    return compare(plain, hashed);
  }
}
