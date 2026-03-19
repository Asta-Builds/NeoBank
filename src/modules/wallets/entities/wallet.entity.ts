import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WalletStatus } from '../enums/wallet-status.enum';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ unique: true })
  reference: string;

  @Column({ unique: true, nullable: true })
  blockchainAddress: string;

  @Column({ select: false, nullable: true })
  encryptedMnemonic: string;

  @Column({ select: false, nullable: true })
  encryptedPrivateKey: string;

  @Column({
    type: 'enum',
    enum: WalletStatus,
    default: WalletStatus.PENDING,
  })
  status: WalletStatus;

  @Column({ default: 'MAD' })
  currency: string;

  @Column({ type: 'bigint', default: 0 })
  dailySpendLimit: string; // TypeORM maps bigint to string in JS

  @Column({ type: 'bigint', default: 0 })
  monthlySpendLimit: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
