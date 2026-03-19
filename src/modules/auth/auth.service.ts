import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OtpService } from './otp/otp.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, phone, password } = registerDto;
    
    const passwordHash = await bcrypt.hash(password, 12);
    
    const user = await this.usersService.create({
      email,
      phone,
      passwordHash,
    });

    this.otpService.generate(email);

    return {
      message: 'Registration successful. Please verify your email.',
      userId: user.id,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new BadRequestException('Email not verified');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async verifyEmail(email: string, code: string) {
    const isValid = this.otpService.verify(email, code);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const user = await this.usersService.findByEmail(email);
    if (user) {
      await this.usersService.update(user.id, { emailVerified: true });
    }
    
    return { message: 'Email verified successfully' };
  }
}
