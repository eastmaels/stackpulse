export interface Poll {
  pollId: number;
  creator: string;
  title: string;
  optionCount: number;
  deadline: number;
  isClosed: boolean;
  totalVotes: number;
  createdAt: number;
}

export interface PollOption {
  text: string;
  voteCount: number;
}

export interface VoteRecord {
  optionIndex: number;
  votedAt: number;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
}

export interface TransactionState {
  status: 'idle' | 'pending' | 'success' | 'error';
  txId: string | null;
  error: string | null;
}

// Clarity response types
export interface ClarityPollResponse {
  creator: string;
  title: string;
  'option-count': bigint;
  deadline: bigint;
  'is-closed': boolean;
  'total-votes': bigint;
  'created-at': bigint;
}

export interface ClarityOptionResponse {
  text: string;
  'vote-count': bigint;
}

export interface ClarityVoteResponse {
  'option-index': bigint;
  'voted-at': bigint;
}

// Helper to convert Clarity response to Poll
export function clarityToPoll(pollId: number, data: ClarityPollResponse): Poll {
  return {
    pollId,
    creator: data.creator,
    title: data.title,
    optionCount: Number(data['option-count']),
    deadline: Number(data.deadline),
    isClosed: data['is-closed'],
    totalVotes: Number(data['total-votes']),
    createdAt: Number(data['created-at']),
  };
}

// Helper to convert Clarity option response
export function clarityToOption(data: ClarityOptionResponse): PollOption {
  return {
    text: data.text,
    voteCount: Number(data['vote-count']),
  };
}
