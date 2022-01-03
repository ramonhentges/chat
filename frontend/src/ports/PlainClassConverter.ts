export interface PlainClassConverter {
  plainToClass: <T, V>(cls: ClassConstructor<T>, plain: V) => T;
  plainToClassArray: <T, V>(cls: ClassConstructor<T>, plain: V[]) => T[];
}

export type ClassConstructor<T> = {
  new (...args: any[]): T;
};
