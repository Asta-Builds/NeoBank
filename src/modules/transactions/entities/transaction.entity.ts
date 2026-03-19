import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Wallet } from '../../wallets/entities/wallet.entity';
import { TransactionType } from '../enums/transaction-type.enum';
import { TransactionStatus } from '../enums/transaction-status.enum';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  idempotencyKey: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.INITIATED,
  })
  status: TransactionStatus;

  @Column({ nullable: true })
  senderWalletId: string;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'senderWalletId' })
  senderWallet: Wallet;

  @Column({ nullable: true })
  receiverWalletId: string;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'receiverWalletId' })
  receiverWallet: Wallet;

  @Column({ type: 'bigint' })
  amount: string;

  @Column({ default: 'MAD' })
  currency: string;

  @Column({ type: 'bigint', default: 0 })
  fee: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ nullable: true })
  failureReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
