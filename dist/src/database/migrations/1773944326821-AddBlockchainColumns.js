"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddBlockchainColumns1773944326821 = void 0;
class AddBlockchainColumns1773944326821 {
    name = 'AddBlockchainColumns1773944326821';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "wallets" ADD "blockchainAddress" character varying`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "UQ_0ad86a87f542f4839e96a4d55fa" UNIQUE ("blockchainAddress")`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD "encryptedMnemonic" character varying`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD "encryptedPrivateKey" character varying`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "encryptedPrivateKey"`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "encryptedMnemonic"`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "UQ_0ad86a87f542f4839e96a4d55fa"`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "blockchainAddress"`);
    }
}
exports.AddBlockchainColumns1773944326821 = AddBlockchainColumns1773944326821;
//# sourceMappingURL=1773944326821-AddBlockchainColumns.js.map