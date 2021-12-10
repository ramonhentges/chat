import { MINUTES_TO_DELETE_MESSAGE } from '../constants/constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Group } from './group.model';
import { User } from './user.model';

@Entity({ name: 'messages' })
export class Message {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => User, (origin) => origin.originMessages)
  origin: User;

  @ManyToOne(
    () => User,
    (userDestination) => userDestination.destinationMessages
  )
  userDestination: User;

  @ManyToOne(
    () => Group,
    (groupDestination) => groupDestination.destinationMessages
  )
  groupDestination: Group;

  @Column()
  message: string;

  @Column()
  deleted: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  canDelete(): boolean {
    const endDate = new Date(this.createdAt);
    endDate.setMinutes(this.createdAt.getMinutes() + MINUTES_TO_DELETE_MESSAGE);
    if (endDate > new Date()) {
      return true;
    }
    return false;
  }
}
