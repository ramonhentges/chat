import { plainToInstance } from 'class-transformer';
import { injectable } from 'inversify';
import {
  ClassConstructor,
  PlainClassConverter
} from '../ports/PlainClassConverter';

@injectable()
export class ClassTransformerPlainClassConverter
  implements PlainClassConverter
{
  plainToClass = <T, V>(cls: ClassConstructor<T>, plain: V) => {
    return plainToInstance(cls, plain);
  };
  plainToClassArray = <T, V>(cls: ClassConstructor<T>, plain: V[]) => {
    return plainToInstance(cls, plain);
  };
}
