import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { showConnect, UserSession } from '@stacks/connect';
import { NetworkType, DEFAULT_NETWORK } from '@/lib/stacks/config';
import { WalletState } from '@/lib/stacks/types';
import { userSession } from '@/lib/stacks/user-session';

interface StacksContextType {
  wallet: WalletState;
  networkType: NetworkType;
  userSession: UserSession;
  connectWallet: () => void;
  disconnectWallet: () => void;
  switchNetwork: (network: NetworkType) => void;
}

const StacksContext = createContext<StacksContextType | null>(null);

// Helper to get address for network
function getAddressForNetwork(userData: any, network: NetworkType): string | null {
  if (!userData?.profile?.stxAddress) return null;
  return network === 'mainnet'
    ? userData.profile.stxAddress.mainnet
    : userData.profile.stxAddress.testnet;
}

export function StacksProvider({ children }: { children: React.ReactNode }) {
  // Initialize network from localStorage or default
  const [networkType, setNetworkType] = useState<NetworkType>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('stackpolls-network');
      if (stored === 'testnet' || stored === 'mainnet') {
        return stored;
      }
    }
    return DEFAULT_NETWORK;
  });

  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
  });

  // Check if user is already signed in on mount
  useEffect(() => {
    try {
      if (userSession.isUserSignedIn()) {
        const userData = userSession.loadUserData();
        setWallet({
          isConnected: true,
          address: getAddressForNetwork(userData, networkType),
        });
      }
    } catch (error) {
      // Clear stale session data if version mismatch
      console.warn('Clearing stale session data:', error);
      localStorage.removeItem('blockstack-session');
      userSession.signUserOut();
    }
  }, [networkType]);

  const connectWallet = useCallback(() => {
    showConnect({
      appDetails: {
        name: 'StackPolls',
        icon: window.location.origin + '/favicon.png',
      },
      redirectTo: '/',
      onFinish: () => {
        window.location.reload();
      },
      onCancel: () => {
        console.log('User cancelled wallet connection');
      },
      userSession,
    });
  }, []);

  const disconnectWallet = useCallback(() => {
    userSession.signUserOut();
    setWallet({
      isConnected: false,
      address: null,
    });
  }, []);

  const switchNetwork = useCallback((newNetwork: NetworkType) => {
    setNetworkType(newNetwork);

    // Update address if wallet is connected
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setWallet((prev) => ({
        ...prev,
        address: getAddressForNetwork(userData, newNetwork),
      }));
    }

    // Store preference
    localStorage.setItem('stackpolls-network', newNetwork);
  }, []);

  const value: StacksContextType = {
    wallet,
    networkType,
    userSession,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  };

  return (
    <StacksContext.Provider value={value}>
      {children}
    </StacksContext.Provider>
  );
}

export function useStacks() {
  const context = useContext(StacksContext);
  if (!context) {
    throw new Error('useStacks must be used within a StacksProvider');
  }
  return context;
}
