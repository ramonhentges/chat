import { IMessage } from '../../../interfaces/i-message';

export const sortLastMessages = (a: IMessage, b: IMessage): number => {
  return a.createdAt > b.createdAt ? -1 : a.createdAt === b.createdAt ? 0 : 1;
};
