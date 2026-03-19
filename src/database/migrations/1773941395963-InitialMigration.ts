import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1773941395963 implements MigrationInterface {
    name = 'InitialMigration1773941395963'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('CUSTOMER', 'SUPPORT', 'COMPLIANCE_OFFICER', 'ADMIN')`);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'BLOCKED')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "phone" character varying NOT NULL, "passwordHash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'CUSTOMER', "status" "public"."users_status_enum" NOT NULL DEFAULT 'PENDING_VERIFICATION', "emailVerified" boolean NOT NULL DEFAULT false, "phoneVerified" boolean NOT NULL DEFAULT false, "mfaEnabled" boolean NOT NULL DEFAULT false, "mfaSecret" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."wallets_status_enum" AS ENUM('PENDING', 'ACTIVE', 'FROZEN', 'SUSPENDED', 'CLOSED')`);
        await queryRunner.query(`CREATE TABLE "wallets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "reference" character varying NOT NULL, "status" "public"."wallets_status_enum" NOT NULL DEFAULT 'PENDING', "currency" character varying NOT NULL DEFAULT 'MAD', "dailySpendLimit" bigint NOT NULL DEFAULT '0', "monthlySpendLimit" bigint NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c0eab91ba98188cf049cd9e3ffd" UNIQUE ("reference"), CONSTRAINT "REL_2ecdb33f23e9a6fc392025c0b9" UNIQUE ("userId"), CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_type_enum" AS ENUM('TOP_UP', 'P2P_TRANSFER', 'CARD_PAYMENT', 'REVERSAL', 'FEE')`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_status_enum" AS ENUM('INITIATED', 'PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REVERSED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "idempotencyKey" character varying NOT NULL, "type" "public"."transactions_type_enum" NOT NULL, "status" "public"."transactions_status_enum" NOT NULL DEFAULT 'INITIATED', "senderWalletId" uuid, "receiverWalletId" uuid, "amount" bigint NOT NULL, "currency" character varying NOT NULL DEFAULT 'MAD', "fee" bigint NOT NULL DEFAULT '0', "description" character varying, "metadata" jsonb, "failureReason" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_86238dd0ae2d79be941104a5842" UNIQUE ("idempotencyKey"), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."ledger_entries_type_enum" AS ENUM('DEBIT', 'CREDIT')`);
        await queryRunner.query(`CREATE TABLE "ledger_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "transactionId" character varying NOT NULL, "walletId" uuid NOT NULL, "type" "public"."ledger_entries_type_enum" NOT NULL, "amount" bigint NOT NULL, "balanceAfter" bigint NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6efcb84411d3f08b08450ae75d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."kyc_cases_status_enum" AS ENUM('NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED', 'REQUIRES_ACTION', 'EXPIRED')`);
        await queryRunner.query(`CREATE TYPE "public"."kyc_cases_documenttype_enum" AS ENUM('CIN', 'PASSPORT', 'RESIDENCY_PERMIT')`);
        await queryRunner.query(`CREATE TABLE "kyc_cases" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "providerCaseId" character varying, "status" "public"."kyc_cases_status_enum" NOT NULL DEFAULT 'NOT_STARTED', "documentType" "public"."kyc_cases_documenttype_enum", "documentNumber" character varying, "reviewedBy" uuid, "reviewNote" text, "submittedAt" TIMESTAMP, "resolvedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_a67c29bf36be9e32be8faf7336" UNIQUE ("userId"), CONSTRAINT "PK_3b69197a5c81a33177dec6b7e98" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "actorId" uuid, "actorRole" character varying NOT NULL, "action" character varying NOT NULL, "targetEntity" character varying NOT NULL, "targetId" character varying, "ipAddress" character varying, "userAgent" character varying, "payload" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_234520b8d2b63e97a7875b66abf" FOREIGN KEY ("senderWalletId") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_ffdc7a29d1be1b4e3aff2919df0" FOREIGN KEY ("receiverWalletId") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ledger_entries" ADD CONSTRAINT "FK_df977c08d98fab6543724d74859" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "kyc_cases" ADD CONSTRAINT "FK_a67c29bf36be9e32be8faf7336f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "kyc_cases" ADD CONSTRAINT "FK_bc6a66480eea641c58d14359d7a" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_2dc33f7f3c22e2e7badafca1d12" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_2dc33f7f3c22e2e7badafca1d12"`);
        await queryRunner.query(`ALTER TABLE "kyc_cases" DROP CONSTRAINT "FK_bc6a66480eea641c58d14359d7a"`);
        await queryRunner.query(`ALTER TABLE "kyc_cases" DROP CONSTRAINT "FK_a67c29bf36be9e32be8faf7336f"`);
        await queryRunner.query(`ALTER TABLE "ledger_entries" DROP CONSTRAINT "FK_df977c08d98fab6543724d74859"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_ffdc7a29d1be1b4e3aff2919df0"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_234520b8d2b63e97a7875b66abf"`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TABLE "kyc_cases"`);
        await queryRunner.query(`DROP TYPE "public"."kyc_cases_documenttype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."kyc_cases_status_enum"`);
        await queryRunner.query(`DROP TABLE "ledger_entries"`);
        await queryRunner.query(`DROP TYPE "public"."ledger_entries_type_enum"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
        await queryRunner.query(`DROP TABLE "wallets"`);
        await queryRunner.query(`DROP TYPE "public"."wallets_status_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
