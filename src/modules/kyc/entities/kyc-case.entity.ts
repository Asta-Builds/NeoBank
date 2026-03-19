import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { KycStatus } from '../enums/kyc-status.enum';
import { KycDocumentType } from '../enums/kyc-document-type.enum';

@Entity('kyc_cases')
export class KycCase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  providerCaseId: string;

  @Column({
    type: 'enum',
    enum: KycStatus,
    default: KycStatus.NOT_STARTED,
  })
  status: KycStatus;

  @Column({
    type: 'enum',
    enum: KycDocumentType,
    nullable: true,
  })
  documentType: KycDocumentType;

  @Column({ nullable: true })
  documentNumber: string; // encrypted

  @Column({ nullable: true })
  reviewedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewedBy' })
  reviewer: User;

  @Column({ type: 'text', nullable: true })
  reviewNote: string;

  @Column({ nullable: true })
  submittedAt: Date;

  @Column({ nullable: true })
  resolvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
