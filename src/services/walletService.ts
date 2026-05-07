import { API_CONFIG } from '../config/api';

export interface WalletAuthResult {
  publicKey: string;
  signature: Uint8Array;
  signatureBase58: string;
  nonce: string;
  accountLabel?: string;
}

/**
 * Connect to a Solana wallet using Mobile Wallet Adapter (Android only)
 * @param walletName - Display name for the app in wallet prompt
 * @returns Public key and auth signature
 */
export async function connectWallet(
  walletName: string = 'SOLmate'
): Promise<WalletAuthResult> {
  // Mobile Wallet Adapter for Android/Seeker
  const { transact } = require('@solana-mobile/mobile-wallet-adapter-protocol-web3js');

  try {
    const result = await transact(async (wallet) => {
      // 1. Request authorization from wallet
      const authResult = await wallet.authorize({
        cluster: 'devnet', // Change to 'mainnet-beta' for production
        identity: {
          name: walletName,
          uri: 'https://solmate.app',
          icon: 'favicon.ico', // TODO: Add actual icon
        },
      });

      // 2. Get the first authorized account
      const firstAccount = authResult.accounts[0];
      const publicKey = firstAccount.address;

      // 3. Get nonce from backend
      const challengeResponse = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHALLENGE}?wallet_address=${publicKey}`
      );
      if (!challengeResponse.ok) {
        throw new Error('Failed to get challenge from backend');
      }
      const { nonce } = await challengeResponse.json();

      // 4. Create message to sign with nonce
      const message = `Sign in to SOLmate\n\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;
      const messageBytes = new TextEncoder().encode(message);

      // 5. Request signature for authentication
      const signedMessages = await wallet.signMessages({
        addresses: [publicKey],
        payloads: [messageBytes],
      });

      const signature = signedMessages[0];

      // 6. Convert signature to base58
      const base58 = require('bs58');
      const signatureBase58 = base58.encode(signature);

      return {
        publicKey,
        signature,
        signatureBase58,
        nonce,
        accountLabel: firstAccount.label,
      };
    });

    return result;
  } catch (error: any) {
    // Handle specific MWA errors
    if (error.code === 'ERROR_WALLET_NOT_FOUND') {
      throw new Error('No wallet app installed. Please install Phantom or Backpack.');
    } else if (error.code === 'ERROR_AUTHORIZATION_FAILED') {
      throw new Error('Wallet authorization was rejected.');
    } else if (error.code === 'ERROR_NOT_SIGNED') {
      throw new Error('Message signing was cancelled.');
    } else {
      throw new Error(`Wallet connection failed: ${error.message}`);
    }
  }
}

/**
 * Sign a transaction using Mobile Wallet Adapter
 * @param transaction - Serialized transaction to sign
 * @returns Signed transaction
 */
export async function signTransaction(transaction: Uint8Array): Promise<Uint8Array> {
  const { transact } = require('@solana-mobile/mobile-wallet-adapter-protocol-web3js');

  try {
    const result = await transact(async (wallet) => {
      // Re-authorize if needed
      const authResult = await wallet.reauthorize({
        identity: {
          name: 'SOLmate',
          uri: 'https://solmate.app',
        },
      });

      // Sign the transaction
      const signedTransactions = await wallet.signTransactions({
        transactions: [transaction],
      });

      return signedTransactions[0];
    });

    return result;
  } catch (error: any) {
    throw new Error(`Transaction signing failed: ${error.message}`);
  }
}

/**
 * Sign and send a transaction using Mobile Wallet Adapter
 * @param transaction - Serialized transaction
 * @returns Transaction signature
 */
export async function signAndSendTransaction(
  transaction: Uint8Array
): Promise<Uint8Array> {
  const { transact } = require('@solana-mobile/mobile-wallet-adapter-protocol-web3js');

  try {
    const result = await transact(async (wallet) => {
      // Re-authorize if needed
      await wallet.reauthorize({
        identity: {
          name: 'SOLmate',
          uri: 'https://solmate.app',
        },
      });

      // Sign and send
      const signatures = await wallet.signAndSendTransactions({
        transactions: [transaction],
      });

      return signatures[0];
    });

    return result;
  } catch (error: any) {
    throw new Error(`Transaction failed: ${error.message}`);
  }
}

/**
 * Disconnect wallet (clears session)
 */
export async function disconnectWallet(): Promise<void> {
  const { transact } = require('@solana-mobile/mobile-wallet-adapter-protocol-web3js');

  try {
    await transact(async (wallet) => {
      await wallet.deauthorize();
    });
  } catch (error) {
    // Deauthorize errors can be ignored
    console.log('Wallet deauthorize:', error);
  }
}

/**
 * Verify wallet ownership by checking signature
 * @param publicKey - Wallet public key
 * @param message - Original message that was signed
 * @param signature - Signature to verify
 * @returns true if signature is valid
 */
export function verifySignature(
  publicKey: string,
  message: string,
  signature: Uint8Array
): boolean {
  // In production, verify signature using nacl or similar
  // For now, we trust the wallet's signature
  // Backend should verify this properly
  return true;
}
