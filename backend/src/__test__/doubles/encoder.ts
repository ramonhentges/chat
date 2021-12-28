import { Encoder } from '@/ports/encoder';

export class DoubleEncoder implements Encoder {
  async encode(plain: string): Promise<string> {
    return `Hashed-${plain}`;
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return `Hashed-${plain}` === hashed;
  }
}
