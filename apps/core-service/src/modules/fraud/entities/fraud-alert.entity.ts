import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Wallet } from '../../wallets/entities/wallet.entity';
import { User } from '../../users/entities/user.entity';
import {
  FraudAlertType,
  FraudSeverity,
  FraudStatus,
} from '../enums/fraud-enums';

@Entity('fraud_alerts')
export class FraudAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  transactionId: string;

  @ManyToOne(() => Transaction)
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @Column()
  walletId: string;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @Column({
    type: 'enum',
    enum: FraudAlertType,
  })
  alertType: FraudAlertType;

  @Column({
    type: 'enum',
    enum: FraudSeverity,
    default: FraudSeverity.MEDIUM,
  })
  severity: FraudSeverity;

  @Column({
    type: 'enum',
    enum: FraudStatus,
    default: FraudStatus.OPEN,
  })
  status: FraudStatus;

  @Column()
  ruleTriggered: string;

  @Column({ nullable: true })
  reviewedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewedById' })
  reviewedBy: User;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
