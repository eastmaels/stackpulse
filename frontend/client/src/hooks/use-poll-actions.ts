import { useState, useCallback } from 'react';
import {
  stringAsciiCV,
  uintCV,
  listCV,
  PostConditionMode,
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { useStacks } from '@/context/stacks-context';
import { getNetworkConfig, getPollContract, CONTRACT_FUNCTIONS } from '@/lib/stacks';
import { TransactionState } from '@/lib/stacks/types';

export function usePollActions() {
  const { wallet, networkType, userSession } = useStacks();
  const [txState, setTxState] = useState<TransactionState>({
    status: 'idle',
    txId: null,
    error: null,
  });

  const createPoll = useCallback(
    async (title: string, options: string[], durationSeconds: number) => {
      console.log('[createPoll] Starting...', { title, options, durationSeconds, networkType, wallet });

      if (!wallet.isConnected) {
        console.log('[createPoll] Error: Wallet not connected');
        setTxState({
          status: 'error',
          txId: null,
          error: 'Wallet not connected',
        });
        return;
      }

      const contract = getPollContract(networkType);
      console.log('[createPoll] Contract info:', contract);

      if (!contract.address) {
        console.log('[createPoll] Error: Contract address is empty/undefined');
        setTxState({
          status: 'error',
          txId: null,
          error: 'Contract address not configured for this network',
        });
        return;
      }

      setTxState({ status: 'pending', txId: null, error: null });

      try {
        const config = getNetworkConfig(networkType);
        await openContractCall({
          network: config.network,
          contractAddress: contract.address,
          contractName: contract.name,
          functionName: CONTRACT_FUNCTIONS.CREATE_POLL,
          functionArgs: [
            stringAsciiCV(title),
            listCV(options.map((opt) => stringAsciiCV(opt))),
            uintCV(durationSeconds),
          ],
          postConditionMode: PostConditionMode.Deny,
          postConditions: [],
          onFinish: (data) => {
            setTxState({
              status: 'success',
              txId: data.txId,
              error: null,
            });
          },
          onCancel: () => {
            setTxState({ status: 'idle', txId: null, error: null });
          },
        });
      } catch (error) {
        setTxState({
          status: 'error',
          txId: null,
          error: error instanceof Error ? error.message : 'Transaction failed',
        });
      }
    },
    [wallet.isConnected, networkType]
  );

  const vote = useCallback(
    async (pollId: number, optionIndex: number) => {
      if (!wallet.isConnected) {
        setTxState({
          status: 'error',
          txId: null,
          error: 'Wallet not connected',
        });
        return;
      }

      const contract = getPollContract(networkType);
      if (!contract.address) {
        setTxState({
          status: 'error',
          txId: null,
          error: 'Contract address not configured for this network',
        });
        return;
      }

      setTxState({ status: 'pending', txId: null, error: null });

      try {
        const config = getNetworkConfig(networkType);
        await openContractCall({
          network: config.network,
          contractAddress: contract.address,
          contractName: contract.name,
          functionName: CONTRACT_FUNCTIONS.VOTE,
          functionArgs: [uintCV(pollId), uintCV(optionIndex)],
          postConditionMode: PostConditionMode.Deny,
          postConditions: [],
          onFinish: (data) => {
            setTxState({
              status: 'success',
              txId: data.txId,
              error: null,
            });
          },
          onCancel: () => {
            setTxState({ status: 'idle', txId: null, error: null });
          },
        });
      } catch (error) {
        setTxState({
          status: 'error',
          txId: null,
          error: error instanceof Error ? error.message : 'Transaction failed',
        });
      }
    },
    [wallet.isConnected, networkType]
  );

  const closePoll = useCallback(
    async (pollId: number) => {
      if (!wallet.isConnected) {
        setTxState({
          status: 'error',
          txId: null,
          error: 'Wallet not connected',
        });
        return;
      }

      const contract = getPollContract(networkType);
      if (!contract.address) {
        setTxState({
          status: 'error',
          txId: null,
          error: 'Contract address not configured for this network',
        });
        return;
      }

      setTxState({ status: 'pending', txId: null, error: null });

      try {
        const config = getNetworkConfig(networkType);
        await openContractCall({
          network: config.network,
          contractAddress: contract.address,
          contractName: contract.name,
          functionName: CONTRACT_FUNCTIONS.CLOSE_POLL,
          functionArgs: [uintCV(pollId)],
          postConditionMode: PostConditionMode.Deny,
          postConditions: [],
          onFinish: (data) => {
            setTxState({
              status: 'success',
              txId: data.txId,
              error: null,
            });
          },
          onCancel: () => {
            setTxState({ status: 'idle', txId: null, error: null });
          },
        });
      } catch (error) {
        setTxState({
          status: 'error',
          txId: null,
          error: error instanceof Error ? error.message : 'Transaction failed',
        });
      }
    },
    [wallet.isConnected, networkType]
  );

  const resetTxState = useCallback(() => {
    setTxState({ status: 'idle', txId: null, error: null });
  }, []);

  return {
    createPoll,
    vote,
    closePoll,
    txState,
    resetTxState,
  };
}
