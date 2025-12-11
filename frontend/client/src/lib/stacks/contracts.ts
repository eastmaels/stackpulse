import { getNetworkConfig, NetworkType } from './config';

export const POLL_CONTRACT_NAME = 'poll';

export function getPollContract(networkType: NetworkType) {
  const config = getNetworkConfig(networkType);
  const contract = {
    address: config.contractAddress,
    name: POLL_CONTRACT_NAME,
  };
  console.log('[getPollContract] Network:', networkType, 'Contract:', contract);
  return contract;
}

export const CONTRACT_FUNCTIONS = {
  // Write functions
  CREATE_POLL: 'create-poll',
  VOTE: 'vote',
  CLOSE_POLL: 'close-poll',
  // Read functions
  GET_POLL: 'get-poll',
  GET_POLL_OPTION: 'get-poll-option',
  GET_CURRENT_TIME: 'get-current-time',
  HAS_VOTED: 'has-voted',
  GET_VOTE: 'get-vote',
  GET_POLL_COUNT: 'get-poll-count',
  IS_POLL_EXPIRED: 'is-poll-expired',
  IS_POLL_ACTIVE: 'is-poll-active',
  GET_POLL_STATUS: 'get-poll-status',
} as const;
