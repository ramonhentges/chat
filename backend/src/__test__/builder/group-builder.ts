import { Group } from 'src/models/group.model';

export default class GroupBuilder {
  private group = new Group();

  constructor() {
    this.group.id = '515fe823-25e0-40de-a46a-d71284a45fe6';
    this.group.name = 'My Group';
    this.group.description = 'Cool Group';
    this.group.createdAt = new Date();
  }

  public static aGroup(): GroupBuilder {
    return new GroupBuilder();
  }

  public build(): Group {
    return this.group;
  }
}
