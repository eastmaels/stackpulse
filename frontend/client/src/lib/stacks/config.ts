import { StacksTestnet, StacksMainnet } from '@stacks/network';

export type NetworkType = 'testnet' | 'mainnet';

export const DEFAULT_NETWORK: NetworkType =
  (import.meta.env.VITE_DEFAULT_NETWORK as NetworkType) || 'testnet';

export const NETWORKS = {
  testnet: {
    network: new StacksTestnet(),
    explorerUrl: 'https://explorer.stacks.co/?chain=testnet',
    apiUrl: 'https://api.testnet.hiro.so',
    contractAddress: import.meta.env.VITE_POLL_CONTRACT_ADDRESS_TESTNET || '',
  },
  mainnet: {
    network: new StacksMainnet(),
    explorerUrl: 'https://explorer.stacks.co',
    apiUrl: 'https://api.hiro.so',
    contractAddress: import.meta.env.VITE_POLL_CONTRACT_ADDRESS_MAINNET || '',
  },
} as const;

export function getNetworkConfig(networkType: NetworkType) {
  return NETWORKS[networkType];
}

export function getExplorerTxUrl(txId: string, networkType: NetworkType) {
  const config = getNetworkConfig(networkType);
  const baseUrl = config.explorerUrl.replace('?chain=testnet', '');
  const chainParam = networkType === 'testnet' ? '?chain=testnet' : '';
  return `${baseUrl}/txid/${txId}${chainParam}`;
}
