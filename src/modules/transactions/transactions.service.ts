import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionType } from './enums/transaction-type.enum';
import { TransactionStatus } from './enums/transaction-status.enum';
import { WalletsService } from '../wallets/wallets.service';
import { LedgerService } from '../ledger/ledger.service';
import { LedgerEntryType } from '../ledger/enums/ledger-entry-type.enum';
import { WalletStatus } from '../wallets/enums/wallet-status.enum';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly walletsService: WalletsService,
    private readonly ledgerService: LedgerService,
    private readonly dataSource: DataSource,
  ) {}

  async p2pTransfer(
    senderWalletId: string,
    receiverReference: string,
    amount: bigint,
    idempotencyKey: string,
    description?: string,
  ): Promise<Transaction> {
    // 1. Check idempotency
    const existingTx = await this.transactionRepository.findOne({ where: { idempotencyKey } });
    if (existingTx) {
      return existingTx;
    }

    if (amount <= 0n) {
      throw new BadRequestException('Amount must be positive');
    }

    // 2. Validate sender wallet
    const senderWallet = await this.walletsService.getWalletById(senderWalletId);
    if (senderWallet.status !== WalletStatus.ACTIVE) {
      throw new BadRequestException('Sender wallet is not active');
    }

    // 3. Validate receiver wallet
    const receiverWallet = await this.dataSource.getRepository('wallets').findOne({ where: { reference: receiverReference } });
    if (!receiverWallet) {
      throw new NotFoundException('Receiver wallet not found');
    }
    if (receiverWallet.status !== WalletStatus.ACTIVE) {
      throw new BadRequestException('Receiver wallet is not active');
    }

    if (senderWallet.id === receiverWallet.id) {
      throw new BadRequestException('Cannot transfer to self');
    }

    // 4. Check balance
    const senderBalance = await this.ledgerService.getBalance(senderWallet.id);
    if (senderBalance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // 5. Execute transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // a. Create transaction record
      const transaction = queryRunner.manager.create(Transaction, {
        idempotencyKey,
        type: TransactionType.P2P_TRANSFER,
        status: TransactionStatus.PENDING,
        senderWalletId: senderWallet.id,
        receiverWalletId: receiverWallet.id,
        amount: amount.toString(),
        description,
      });
      const savedTx = await queryRunner.manager.save(transaction);

      // b. Create debit entry
      const newSenderBalance = senderBalance - amount;
      const debitEntry = queryRunner.manager.create('ledger_entries', {
        transactionId: savedTx.id,
        walletId: senderWallet.id,
        type: LedgerEntryType.DEBIT,
        amount: amount.toString(),
        balanceAfter: newSenderBalance.toString(),
      });
      await queryRunner.manager.save(debitEntry);

      // c. Create credit entry
      const receiverBalance = await this.ledgerService.getBalance(receiverWallet.id);
      const newReceiverBalance = receiverBalance + amount;
      const creditEntry = queryRunner.manager.create('ledger_entries', {
        transactionId: savedTx.id,
        walletId: receiverWallet.id,
        type: LedgerEntryType.CREDIT,
        amount: amount.toString(),
        balanceAfter: newReceiverBalance.toString(),
      });
      await queryRunner.manager.save(creditEntry);

      // d. Finalize transaction
      savedTx.status = TransactionStatus.SUCCEEDED;
      const finalTx = await queryRunner.manager.save(savedTx);

      await queryRunner.commitTransaction();
      return finalTx;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
