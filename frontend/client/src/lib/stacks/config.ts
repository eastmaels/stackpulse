import { STACKS_TESTNET, STACKS_MAINNET, StacksNetwork } from '@stacks/network';

export type NetworkType = 'testnet' | 'mainnet';

export const DEFAULT_NETWORK: NetworkType =
  (import.meta.env.VITE_DEFAULT_NETWORK as NetworkType) || 'testnet';

export const NETWORKS: Record<NetworkType, {
  network: StacksNetwork;
  explorerUrl: string;
  apiUrl: string;
  contractAddress: string;
}> = {
  testnet: {
    network: STACKS_TESTNET,
    explorerUrl: 'https://explorer.stacks.co/?chain=testnet',
    apiUrl: 'https://api.testnet.hiro.so',
    contractAddress: import.meta.env.VITE_POLL_CONTRACT_ADDRESS_TESTNET || '',
  },
  mainnet: {
    network: STACKS_MAINNET,
    explorerUrl: 'https://explorer.stacks.co',
    apiUrl: 'https://api.hiro.so',
    contractAddress: import.meta.env.VITE_POLL_CONTRACT_ADDRESS_MAINNET || '',
  },
};

export function getNetworkConfig(networkType: NetworkType) {
  return NETWORKS[networkType];
}

export function getExplorerTxUrl(txId: string, networkType: NetworkType) {
  const config = getNetworkConfig(networkType);
  const baseUrl = config.explorerUrl.replace('?chain=testnet', '');
  const chainParam = networkType === 'testnet' ? '?chain=testnet' : '';
  return `${baseUrl}/txid/${txId}${chainParam}`;
}
