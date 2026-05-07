import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connectWallet, disconnectWallet, WalletAuthResult } from '../services/walletService';
import { API_CONFIG } from '../config/api';

interface WalletContextType {
  publicKey: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const result: WalletAuthResult = await connectWallet('SOLmate');

      setPublicKey(result.publicKey);

      // Send to backend for verification
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ONBOARD}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: result.publicKey,
          signature: result.signatureBase58,
          nonce: result.nonce,
        }),
      });

      if (!response.ok) {
        throw new Error('Backend verification failed');
      }

      const { access_token } = await response.json();

      // Store JWT token in secure storage
      await AsyncStorage.setItem('auth_token', access_token);
      await AsyncStorage.setItem('wallet_address', result.publicKey);

      console.log('✅ Wallet connected:', result.publicKey);
      console.log('Account label:', result.accountLabel);
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Wallet connection failed:', err);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await disconnectWallet();
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('wallet_address');
      setPublicKey(null);
      setError(null);
      console.log('✅ Wallet disconnected');
    } catch (err: any) {
      console.error('❌ Disconnect failed:', err);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        isConnected: !!publicKey,
        isConnecting,
        error,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
