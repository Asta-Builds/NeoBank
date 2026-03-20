import { Injectable, Logger } from '@nestjs/common';
import { Wallet as EthersWallet, HDNodeWallet } from 'ethers';
import * as bip39 from 'bip39';
import { CryptoUtil } from '@neobank/common';

export interface GeneratedWallet {
  mnemonic: string;
  address: string;
  privateKey: string;
}

@Injectable()
export class KeyManagementService {
  private readonly logger = new Logger(KeyManagementService.name);

  constructor(private readonly cryptoUtil: CryptoUtil) {}

  /**
   * Generates a new BIP-39 mnemonic and derives the first HD wallet.
   */
  async createNewWallet(): Promise<GeneratedWallet> {
    const mnemonic = bip39.generateMnemonic(); // 12 words default
    const wallet = HDNodeWallet.fromPhrase(mnemonic);

    return {
      mnemonic,
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  }

  /**
   * Encrypts sensitive wallet data before storage.
   */
  encryptWalletData(data: string): string {
    return this.cryptoUtil.encrypt(data);
  }

  /**
   * Decrypts sensitive wallet data for transaction signing.
   */
  decryptWalletData(encryptedData: string): string {
    return this.cryptoUtil.decrypt(encryptedData);
  }

  /**
   * Re-derives a wallet from an existing mnemonic.
   */
  async getWalletFromMnemonic(mnemonic: string): Promise<HDNodeWallet> {
    return HDNodeWallet.fromPhrase(mnemonic);
  }

  /**
   * Derives a wallet from a private key.
   */
  async getWalletFromPrivateKey(privateKey: string): Promise<EthersWallet> {
    return new EthersWallet(privateKey);
  }
}
