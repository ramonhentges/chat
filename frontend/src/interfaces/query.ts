export class QueryFilter {
  constructor(take: number, skip: number) {
    this.take = take;
    this.skip = skip;
  }

  take: number;

  skip: number;
}
