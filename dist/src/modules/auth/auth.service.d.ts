import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OtpService } from './otp/otp.service';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly otpService;
    constructor(usersService: UsersService, jwtService: JwtService, otpService: OtpService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        userId: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
    }>;
    verifyEmail(email: string, code: string): Promise<{
        message: string;
    }>;
}
