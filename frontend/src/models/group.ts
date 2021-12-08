import { Type } from 'class-transformer';

export class Group {
  constructor() {
    this.id = '';
    this.name = '';
    this.description = '';
    this.createdAt = new Date();
  }
  id: string;
  name: string;
  description: string;

  @Type(() => Date)
  createdAt: Date;
  getTitle = () => {
    return this.name;
  };
  getSubtitle = () => {
    return this.description;
  };

  getKey = () => {
    return this.id;
  };

  getConversationTitle = () => {
    return this.name;
  };
}
