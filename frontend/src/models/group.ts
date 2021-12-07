export class Group {
  constructor() {
    this.id = '';
    this.name = '';
    this.description = '';
  }
  id: string;
  name: string;
  description: string;

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
