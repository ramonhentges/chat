import { User } from "./user";

export interface UserMessage {
  uuid: string;
  message: string;
  deleted: boolean;
  createdAt: Date;
  origin: User;
  userDestination: User;
}
