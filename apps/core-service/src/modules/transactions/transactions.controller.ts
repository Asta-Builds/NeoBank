import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles, CurrentUser, Role } from '@neobank/common';
import { User } from '../users/entities/user.entity';
import { TransferDto } from './dto/transfer.dto';
import { WalletsService } from '../wallets/wallets.service';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly walletsService: WalletsService,
  ) {}

  @Post('transfer')
  @ApiOperation({ summary: 'Perform P2P transfer' })
  @ApiResponse({ status: 201, description: 'Transfer successful' })
  @ApiResponse({
    status: 400,
    description: 'Insufficient balance or invalid destination',
  })
  async p2pTransfer(
    @CurrentUser() user: User,
    @Body() transferDto: TransferDto,
  ) {
    const wallet = await this.walletsService.getWalletByUserId(user.id);
    return this.transactionsService.p2pTransfer(
      wallet.id,
      transferDto.receiverReference,
      BigInt(transferDto.amount),
      transferDto.idempotencyKey,
      transferDto.description,
    );
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user transaction history' })
  @ApiResponse({ status: 200, description: 'Transaction history' })
  async getMyTransactions(@CurrentUser() user: User) {
    const wallet = await this.walletsService.getWalletByUserId(user.id);
    return this.transactionsService.findByWallet(wallet.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction details by ID' })
  @ApiResponse({ status: 200, description: 'Transaction details' })
  async getTransaction(@Param('id') id: string, @CurrentUser() user: User) {
    return this.transactionsService.findOne(id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Get all transactions (Admin/Compliance only)' })
  @ApiResponse({ status: 200, description: 'All transactions' })
  async getAllTransactions(@Query() query: any) {
    return this.transactionsService.findAll(query);
  }
}
