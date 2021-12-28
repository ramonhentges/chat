import { Message } from '@/models/message.model';

export default class MessageBuilder {
  private message = new Message();

  constructor() {
    this.message.message = 'testing';
    this.message.deleted = false;
  }

  public static aMessage(): MessageBuilder {
    return new MessageBuilder();
  }

  public build(): Message {
    return this.message;
  }
}
