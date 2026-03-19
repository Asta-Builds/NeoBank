export declare class OtpService {
    private otps;
    generate(email: string): string;
    verify(email: string, code: string): boolean;
}
