import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Group } from './group.model';
import { Message } from './message.model';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  fullName: string;

  @Column()
  username: string;

  @Column({
    select: false
  })
  password: string;

  @ManyToMany(() => Group, (group) => group.users)
  //@JoinTable({ name: 'users_groups' })
  public groups: Group[];

  @OneToMany(() => Message, (message) => message.origin)
  originMessages: Message[];

  @OneToMany(() => Message, (message) => message.userDestination)
  destinationMessages: Message[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
