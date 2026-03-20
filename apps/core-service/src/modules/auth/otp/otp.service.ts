import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly OTP_EXPIRY = 600; // 10 minutes in seconds

  constructor(@InjectRedis() private readonly redis: Redis) {}

  async generate(email: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Redis: key = otp:email, value = code, EX = expiry in seconds
    await this.redis.set(`otp:${email}`, code, 'EX', this.OTP_EXPIRY);

    this.logger.log(`[OTP] Generated for ${email}: ${code}`);
    return code;
  }

  async verify(email: string, code: string): Promise<boolean> {
    const key = `otp:${email}`;
    const storedCode = await this.redis.get(key);

    if (!storedCode) {
      return false;
    }

    if (storedCode !== code) {
      return false;
    }

    // Delete OTP after successful verification
    await this.redis.del(key);
    return true;
  }
}
