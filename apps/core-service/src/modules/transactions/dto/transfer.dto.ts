import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

export class TransferDto {
  @IsString()
  @IsNotEmpty()
  receiverReference: string;

  @IsInt()
  @Min(100) // Minimum 1 MAD (100 centimes)
  amount: number;

  @IsUUID()
  @IsNotEmpty()
  idempotencyKey: string;

  @IsString()
  @IsOptional()
  description?: string;
}
