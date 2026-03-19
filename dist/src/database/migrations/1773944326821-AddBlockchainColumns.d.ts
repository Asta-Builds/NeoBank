import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddBlockchainColumns1773944326821 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
