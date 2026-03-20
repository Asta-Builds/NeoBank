import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles, CurrentUser, Role } from '@neobank/common';
import { User } from '../users/entities/user.entity';
import { WalletStatus } from './enums/wallet-status.enum';

@ApiTags('Wallets')
@ApiBearerAuth()
@Controller('wallets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user wallet' })
  @ApiResponse({ status: 200, description: 'User wallet found' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async getMyWallet(@CurrentUser() user: User) {
    return this.walletsService.getWalletByUserId(user.id);
  }

  @Post('create')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new wallet (Admin only)' })
  @ApiResponse({ status: 201, description: 'Wallet created' })
  async createWallet(@Body('userId') userId: string) {
    return this.walletsService.createWallet(userId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPPORT)
  @ApiOperation({ summary: 'Get wallet details by ID (Admin/Support only)' })
  @ApiResponse({ status: 200, description: 'Wallet found' })
  async getWallet(@Param('id') id: string) {
    return this.walletsService.getWalletById(id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Update wallet status (Admin/Compliance only)' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: WalletStatus,
  ) {
    return this.walletsService.updateStatus(id, status);
  }
}
