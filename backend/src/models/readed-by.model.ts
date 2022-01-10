import { CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Message, User } from '.';

@Entity({ name: 'readed_by' })
export class ReadedBy {
  @PrimaryGeneratedColumn()
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Message, message => message.readedBy)
  message: Message;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  readedAt: Date;
}
