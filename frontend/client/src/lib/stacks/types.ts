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

// Helper to unwrap {type, value} wrapper from cvToValue
function unwrapCV(val: any): any {
  if (val === null || val === undefined) return val;
  if (typeof val === 'object' && 'value' in val && 'type' in val) {
    return unwrapCV(val.value);
  }
  return val;
}

// Helper to convert Clarity response to Poll
export function clarityToPoll(pollId: number, rawData: ClarityPollResponse | { type: string; value: any }): Poll {
  console.log('[clarityToPoll] Raw data:', rawData);

  // cvToValue may return {type: '...', value: {...}} wrapper - unwrap the top level
  const data = unwrapCV(rawData);
  console.log('[clarityToPoll] Unwrapped data:', data);

  // Unwrap each field individually since they may also be wrapped
  const creator = unwrapCV(data.creator);
  const title = unwrapCV(data.title);
  const optionCount = unwrapCV(data['option-count']);
  const deadline = unwrapCV(data.deadline);
  const isClosed = unwrapCV(data['is-closed']);
  const totalVotes = unwrapCV(data['total-votes']);
  const createdAt = unwrapCV(data['created-at']);

  console.log('[clarityToPoll] Fields:', { creator, title, optionCount, deadline, isClosed, totalVotes, createdAt });

  return {
    pollId,
    creator: String(creator || 'Unknown'),
    title: String(title || 'Untitled'),
    optionCount: Number(optionCount) || 0,
    deadline: Number(deadline) || 0,
    isClosed: Boolean(isClosed),
    totalVotes: Number(totalVotes) || 0,
    createdAt: Number(createdAt) || 0,
  };
}

// Helper to convert Clarity option response
export function clarityToOption(rawData: ClarityOptionResponse | { type: string; value: ClarityOptionResponse }): PollOption {
  // cvToValue may return {type: '...', value: {...}} wrapper - unwrap if needed
  const data = unwrapCV(rawData);

  return {
    text: String(unwrapCV(data.text) || ''),
    voteCount: Number(unwrapCV(data['vote-count'])) || 0,
  };
}
