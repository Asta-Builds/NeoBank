import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBlockchainColumns1773944326821 implements MigrationInterface {
  name = 'AddBlockchainColumns1773944326821';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD "blockchainAddress" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD CONSTRAINT "UQ_0ad86a87f542f4839e96a4d55fa" UNIQUE ("blockchainAddress")`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD "encryptedMnemonic" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD "encryptedPrivateKey" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wallets" DROP COLUMN "encryptedPrivateKey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" DROP COLUMN "encryptedMnemonic"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" DROP CONSTRAINT "UQ_0ad86a87f542f4839e96a4d55fa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" DROP COLUMN "blockchainAddress"`,
    );
  }
}
