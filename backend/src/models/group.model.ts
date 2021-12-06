import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Message } from './message.model';
import { User } from './user.model';

@Entity({ name: 'groups' })
export class Group {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToMany(() => User, (user) => user.groups)
  @JoinTable({ name: 'users_groups' })
  public users: User[];

  @OneToMany(() => Message, (message) => message.groupDestination)
  destinationMessages: Message[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
