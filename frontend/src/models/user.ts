import { DestinationFunctions } from '../interfaces/destination-functions';

export class User implements DestinationFunctions {
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
