import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchCallReadOnlyFunction,
  cvToValue,
  uintCV,
  principalCV,
} from '@stacks/transactions';
import { useStacks } from '@/context/stacks-context';
import {
  getNetworkConfig,
  getPollContract,
  CONTRACT_FUNCTIONS,
  Poll,
  PollOption,
  clarityToPoll,
  clarityToOption,
} from '@/lib/stacks';

// Fetch poll count
async function fetchPollCount(
  networkType: 'testnet' | 'mainnet'
): Promise<number> {
  const config = getNetworkConfig(networkType);
  const contract = getPollContract(networkType);

  if (!contract.address) {
    return 0;
  }

  try {
    const result = await fetchCallReadOnlyFunction({
      network: config.network,
      contractAddress: contract.address,
      contractName: contract.name,
      functionName: CONTRACT_FUNCTIONS.GET_POLL_COUNT,
      functionArgs: [],
      senderAddress: contract.address,
    });

    const value = cvToValue(result);
    return Number(value);
  } catch (error) {
    console.error('Error fetching poll count:', error);
    return 0;
  }
}

// Fetch single poll
async function fetchPoll(
  pollId: number,
  networkType: 'testnet' | 'mainnet'
): Promise<Poll | null> {
  const config = getNetworkConfig(networkType);
  const contract = getPollContract(networkType);

  if (!contract.address) {
    return null;
  }

  try {
    const result = await fetchCallReadOnlyFunction({
      network: config.network,
      contractAddress: contract.address,
      contractName: contract.name,
      functionName: CONTRACT_FUNCTIONS.GET_POLL,
      functionArgs: [uintCV(pollId)],
      senderAddress: contract.address,
    });

    const value = cvToValue(result);
    if (!value) return null;

    return clarityToPoll(pollId, value);
  } catch (error) {
    console.error(`Error fetching poll ${pollId}:`, error);
    return null;
  }
}

// Fetch poll option
async function fetchPollOption(
  pollId: number,
  optionIndex: number,
  networkType: 'testnet' | 'mainnet'
): Promise<PollOption | null> {
  const config = getNetworkConfig(networkType);
  const contract = getPollContract(networkType);

  if (!contract.address) {
    return null;
  }

  try {
    const result = await fetchCallReadOnlyFunction({
      network: config.network,
      contractAddress: contract.address,
      contractName: contract.name,
      functionName: CONTRACT_FUNCTIONS.GET_POLL_OPTION,
      functionArgs: [uintCV(pollId), uintCV(optionIndex)],
      senderAddress: contract.address,
    });

    const value = cvToValue(result);
    if (!value) return null;

    return clarityToOption(value);
  } catch (error) {
    console.error(`Error fetching option ${optionIndex} for poll ${pollId}:`, error);
    return null;
  }
}

// Check if user has voted
async function fetchHasVoted(
  pollId: number,
  voter: string,
  networkType: 'testnet' | 'mainnet'
): Promise<boolean> {
  const config = getNetworkConfig(networkType);
  const contract = getPollContract(networkType);

  if (!contract.address) {
    return false;
  }

  try {
    const result = await fetchCallReadOnlyFunction({
      network: config.network,
      contractAddress: contract.address,
      contractName: contract.name,
      functionName: CONTRACT_FUNCTIONS.HAS_VOTED,
      functionArgs: [uintCV(pollId), principalCV(voter)],
      senderAddress: contract.address,
    });

    return cvToValue(result) === true;
  } catch (error) {
    console.error(`Error checking vote status for poll ${pollId}:`, error);
    return false;
  }
}

// Hooks

export function usePollCount() {
  const { networkType } = useStacks();
  const contract = getPollContract(networkType);

  return useQuery({
    queryKey: ['poll-count', networkType],
    queryFn: () => fetchPollCount(networkType),
    enabled: !!contract.address,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function usePoll(pollId: number) {
  const { networkType } = useStacks();
  const contract = getPollContract(networkType);

  return useQuery({
    queryKey: ['poll', pollId, networkType],
    queryFn: () => fetchPoll(pollId, networkType),
    enabled: pollId > 0 && !!contract.address,
    staleTime: 10000,
  });
}

export function usePollOptions(pollId: number, optionCount: number) {
  const { networkType } = useStacks();
  const contract = getPollContract(networkType);

  return useQuery({
    queryKey: ['poll-options', pollId, optionCount, networkType],
    queryFn: async () => {
      const options: PollOption[] = [];
      for (let i = 0; i < optionCount; i++) {
        const option = await fetchPollOption(pollId, i, networkType);
        if (option) {
          options.push(option);
        }
      }
      return options;
    },
    enabled: pollId > 0 && optionCount > 0 && !!contract.address,
    staleTime: 10000,
  });
}

export function useAllPolls() {
  const { networkType } = useStacks();
  const { data: pollCount } = usePollCount();
  const contract = getPollContract(networkType);

  return useQuery({
    queryKey: ['all-polls', pollCount, networkType],
    queryFn: async () => {
      if (!pollCount) return [];
      const polls: Poll[] = [];
      for (let i = 1; i <= pollCount; i++) {
        const poll = await fetchPoll(i, networkType);
        if (poll) {
          polls.push(poll);
        }
      }
      return polls;
    },
    enabled: !!pollCount && pollCount > 0 && !!contract.address,
    staleTime: 30000,
  });
}

export function useHasVoted(pollId: number) {
  const { wallet, networkType } = useStacks();
  const contract = getPollContract(networkType);

  return useQuery({
    queryKey: ['has-voted', pollId, wallet.address, networkType],
    queryFn: () => fetchHasVoted(pollId, wallet.address!, networkType),
    enabled: !!wallet.address && pollId > 0 && !!contract.address,
    staleTime: 5000,
  });
}

// Hook to invalidate poll queries after voting
export function useInvalidatePolls() {
  const queryClient = useQueryClient();
  const { networkType } = useStacks();

  return {
    invalidatePoll: (pollId: number) => {
      queryClient.invalidateQueries({ queryKey: ['poll', pollId, networkType] });
      queryClient.invalidateQueries({ queryKey: ['poll-options', pollId] });
      queryClient.invalidateQueries({ queryKey: ['has-voted', pollId] });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ['all-polls'] });
      queryClient.invalidateQueries({ queryKey: ['poll-count'] });
    },
  };
}
