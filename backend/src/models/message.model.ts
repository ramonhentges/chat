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
  id: number;

  @Column()
  uuid: string;

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
}
