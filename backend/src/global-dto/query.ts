import { IsDefined } from 'class-validator';

export class QueryFilter {
  @IsDefined()
  take: number;
  @IsDefined()
  skip: number;
}