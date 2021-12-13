import { IDestination } from '../interfaces/i-destination';

export class User implements IDestination {
  constructor() {
    this.username = '';
    this.fullName = '';
  }

  username: string;

  fullName: string;

  getTitle = () => {
    return this.fullName;
  };
  getSubtitle = () => {
    return this.username;
  };

  getKey = () => {
    return this.username;
  };

  getConversationTitle = () => {
    return `${this.fullName} - ${this.username}`;
  };
}
