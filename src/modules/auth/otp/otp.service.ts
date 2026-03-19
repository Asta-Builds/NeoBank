import { Injectable } from '@nestjs/common';

@Injectable()
export class OtpService {
  private otps = new Map<string, { code: string; expires: number }>();

  generate(email: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 min
    this.otps.set(email, { code, expires });
    console.log(`[OTP] Generated for ${email}: ${code}`);
    return code;
  }

  verify(email: string, code: string): boolean {
    const otp = this.otps.get(email);
    if (!otp) return false;
    if (Date.now() > otp.expires) {
      this.otps.delete(email);
      return false;
    }
    if (otp.code !== code) return false;
    this.otps.delete(email);
    return true;
  }
}
