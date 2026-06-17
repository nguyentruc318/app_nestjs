import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { RefreshTokenEntity } from './refresh-token.entity';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.sessions, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  ipAddress: string;

  @Column()
  userAgent: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => RefreshTokenEntity, (refreshToken) => refreshToken.session)
  refreshTokens: RefreshTokenEntity[];

  @UpdateDateColumn()
  lastActiveAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
