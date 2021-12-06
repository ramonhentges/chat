import { User } from "./user";

export interface UserMessage {
  id: string;
  message: string;
  deleted: boolean;
  createdAt: Date;
  origin: User;
  userDestination: User;
}
