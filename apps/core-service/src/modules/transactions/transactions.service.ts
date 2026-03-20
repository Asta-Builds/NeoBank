import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Transaction } from './entities/transaction.entity';
import { TransactionType } from './enums/transaction-type.enum';
import { TransactionStatus } from './enums/transaction-status.enum';
import { WalletsService } from '../wallets/wallets.service';
import { LedgerService } from '../ledger/ledger.service';
import { LedgerEntryType } from '../ledger/enums/ledger-entry-type.enum';
import { WalletStatus } from '../wallets/enums/wallet-status.enum';
import { FraudService } from '../fraud/fraud.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly walletsService: WalletsService,
    private readonly ledgerService: LedgerService,
    private readonly dataSource: DataSource,
    private readonly fraudService: FraudService,
    @Inject('TRANSACTION_SERVICE') private readonly client: ClientProxy,
  ) {}

  async findAll(query: any): Promise<[Transaction[], number]> {
    return await this.transactionRepository.findAndCount({
      ...query,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Transaction> {
    const tx = await this.transactionRepository.findOne({ where: { id } });
    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }
    return tx;
  }

  async findByWallet(walletId: string): Promise<Transaction[]> {
    return await this.transactionRepository.find({
      where: [{ senderWalletId: walletId }, { receiverWalletId: walletId }],
      order: { createdAt: 'DESC' },
    });
  }

  async p2pTransfer(
    senderWalletId: string,
    receiverReference: string,
    amount: bigint,
    idempotencyKey: string,
    description?: string,
  ): Promise<Transaction> {
    // 1. Check idempotency
    const existingTx = await this.transactionRepository.findOne({
      where: { idempotencyKey },
    });
    if (existingTx) {
      return existingTx;
    }

    if (amount <= 0n) {
      throw new BadRequestException('Amount must be positive');
    }

    // 2. Validate sender wallet
    const senderWallet =
      await this.walletsService.getWalletById(senderWalletId);
    if (senderWallet.status !== WalletStatus.ACTIVE) {
      throw new BadRequestException('Sender wallet is not active');
    }

    // 3. Validate receiver wallet
    const receiverWallet = await this.dataSource
      .getRepository('wallets')
      .findOne({ where: { reference: receiverReference } });
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

    // 5. Emit 'transaction.initiated' event
    this.client.emit('transaction.initiated', {
      senderWalletId: senderWallet.id,
      receiverWalletId: receiverWallet.id,
      amount: amount.toString(),
      type: TransactionType.P2P_TRANSFER,
      idempotencyKey,
    });

    // 6. Fraud evaluation (Pre-transaction)
    const tempTx = this.transactionRepository.create({
      senderWalletId: senderWallet.id,
      receiverWalletId: receiverWallet.id,
      amount: amount.toString(),
      type: TransactionType.P2P_TRANSFER,
    });

    // In a real scenario, evaluateTransaction might throw or return false to block
    // For MVP, we just create the alert and proceed for now unless we decide to block
    await this.fraudService.evaluateTransaction(tempTx);

    // 7. Execute transaction
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
      const receiverBalance = await this.ledgerService.getBalance(
        receiverWallet.id,
      );
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

      // 8. Emit 'transaction.succeeded' event
      this.client.emit('transaction.succeeded', {
        transactionId: finalTx.id,
        senderWalletId: senderWallet.id,
        receiverWalletId: receiverWallet.id,
        amount: amount.toString(),
      });

      return finalTx;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Emit 'transaction.failed' event
      this.client.emit('transaction.failed', {
        idempotencyKey,
        senderWalletId: senderWallet.id,
        receiverWalletId: receiverWallet.id,
        amount: amount.toString(),
        error: error.message,
      });

      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
