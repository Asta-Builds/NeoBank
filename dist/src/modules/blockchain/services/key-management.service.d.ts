import { Wallet as EthersWallet, HDNodeWallet } from 'ethers';
import { CryptoUtil } from '../../../common/utils/crypto.util';
export interface GeneratedWallet {
    mnemonic: string;
    address: string;
    privateKey: string;
}
export declare class KeyManagementService {
    private readonly cryptoUtil;
    private readonly logger;
    constructor(cryptoUtil: CryptoUtil);
    createNewWallet(): Promise<GeneratedWallet>;
    encryptWalletData(data: string): string;
    decryptWalletData(encryptedData: string): string;
    getWalletFromMnemonic(mnemonic: string): Promise<HDNodeWallet>;
    getWalletFromPrivateKey(privateKey: string): Promise<EthersWallet>;
}
