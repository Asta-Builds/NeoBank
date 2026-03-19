import { ConfigService } from '@nestjs/config';
export declare class CryptoUtil {
    private readonly configService;
    private readonly algorithm;
    private readonly key;
    private readonly ivLength;
    constructor(configService: ConfigService);
    encrypt(text: string): string;
    decrypt(text: string): string;
}
