import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { KycService } from './kyc.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles, CurrentUser, Role } from '@neobank/common';
import { User } from '../users/entities/user.entity';

@ApiTags('KYC')
@ApiBearerAuth()
@Controller('kyc')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('submit')
  @ApiOperation({ summary: 'Submit KYC case' })
  @ApiResponse({ status: 201, description: 'KYC case created' })
  async submitKyc(@CurrentUser() user: User) {
    return this.kycService.createCase(user.id);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get current user KYC status' })
  @ApiResponse({ status: 200, description: 'KYC status found' })
  async getStatus(@CurrentUser() user: User) {
    return this.kycService.getCaseByUserId(user.id);
  }

  @Post(':id/approve')
  @Roles(Role.ADMIN, Role.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Approve KYC case (Admin/Compliance only)' })
  @ApiResponse({
    status: 200,
    description: 'KYC case approved and wallet activated',
  })
  async approveKyc(@Param('id') id: string) {
    return this.kycService.approveCase(id);
  }
}
