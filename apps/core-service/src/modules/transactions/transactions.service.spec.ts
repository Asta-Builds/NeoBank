import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import { TransactionsService } from './transactions.service';
import { Transaction } from './entities/transaction.entity';
import { WalletsService } from '../wallets/wallets.service';
import { LedgerService } from '../ledger/ledger.service';
import { WalletStatus } from '../wallets/enums/wallet-status.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TransactionStatus } from './enums/transaction-status.enum';
import { FraudService } from '../fraud/fraud.service';

describe('TransactionsService (P2P SAGA)', () => {
  let service: TransactionsService;
  let walletsService: WalletsService;
  let ledgerService: LedgerService;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;

  const mockTransactionRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockWalletsService = {
    getWalletById: jest.fn(),
  };

  const mockLedgerService = {
    getBalance: jest.fn(),
  };

  const mockFraudService = {
    evaluateTransaction: jest.fn().mockResolvedValue(true),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      create: jest.fn(),
      save: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn(),
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: WalletsService,
          useValue: mockWalletsService,
        },
        {
          provide: LedgerService,
          useValue: mockLedgerService,
        },
        {
          provide: FraudService,
          useValue: mockFraudService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    walletsService = module.get<WalletsService>(WalletsService);
    ledgerService = module.get<LedgerService>(LedgerService);
    dataSource = module.get<DataSource>(DataSource);
    queryRunner = mockQueryRunner as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('p2pTransfer', () => {
    const senderId = 'sender-uuid';
    const receiverRef = 'NB-1234-5678';
    const amount = 500n;
    const idempotencyKey = 'unique-key';

    it('should complete a successful P2P transfer', async () => {
      // Setup mocks
      mockTransactionRepository.findOne.mockResolvedValue(null);
      mockWalletsService.getWalletById.mockResolvedValue({
        id: senderId,
        status: WalletStatus.ACTIVE,
      });
      mockDataSource.getRepository('wallets').findOne.mockResolvedValue({
        id: 'receiver-uuid',
        status: WalletStatus.ACTIVE,
      });
      mockLedgerService.getBalance.mockImplementation((id) =>
        id === senderId ? 1000n : 200n,
      );

      mockQueryRunner.manager.create.mockImplementation((entity, data) => data);
      mockQueryRunner.manager.save.mockImplementation((data) => ({
        ...data,
        id: 'tx-uuid',
      }));

      const result = await service.p2pTransfer(
        senderId,
        receiverRef,
        amount,
        idempotencyKey,
      );

      expect(result.status).toBe(TransactionStatus.SUCCEEDED);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should throw error if balance is insufficient', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(null);
      mockWalletsService.getWalletById.mockResolvedValue({
        id: senderId,
        status: WalletStatus.ACTIVE,
      });
      mockDataSource.getRepository('wallets').findOne.mockResolvedValue({
        id: 'receiver-uuid',
        status: WalletStatus.ACTIVE,
      });
      mockLedgerService.getBalance.mockResolvedValue(100n); // Less than 500n

      await expect(
        service.p2pTransfer(senderId, receiverRef, amount, idempotencyKey),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle idempotency correctly', async () => {
      const existingTx = { id: 'existing-id', idempotencyKey };
      mockTransactionRepository.findOne.mockResolvedValue(existingTx);

      const result = await service.p2pTransfer(
        senderId,
        receiverRef,
        amount,
        idempotencyKey,
      );

      expect(result).toEqual(existingTx);
      expect(mockWalletsService.getWalletById).not.toHaveBeenCalled();
    });

    it('should rollback transaction on failure during ledger updates', async () => {
      mockTransactionRepository.findOne.mockResolvedValue(null);
      mockWalletsService.getWalletById.mockResolvedValue({
        id: senderId,
        status: WalletStatus.ACTIVE,
      });
      mockDataSource.getRepository('wallets').findOne.mockResolvedValue({
        id: 'receiver-uuid',
        status: WalletStatus.ACTIVE,
      });
      mockLedgerService.getBalance.mockResolvedValue(1000n);

      mockQueryRunner.manager.save.mockRejectedValueOnce(
        new Error('DB connection lost'),
      );

      await expect(
        service.p2pTransfer(senderId, receiverRef, amount, idempotencyKey),
      ).rejects.toThrow();

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });
});
