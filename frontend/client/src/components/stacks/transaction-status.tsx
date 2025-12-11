import { Spinner } from '@/components/ui/spinner';
import { CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { useStacks } from '@/context/stacks-context';
import { getExplorerTxUrl } from '@/lib/stacks/config';
import { TransactionState } from '@/lib/stacks/types';
import { Button } from '@/components/ui/button';

interface TransactionStatusProps {
  state: TransactionState;
  onClose?: () => void;
}

export function TransactionStatus({ state, onClose }: TransactionStatusProps) {
  const { networkType } = useStacks();

  if (state.status === 'idle') return null;

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
      {state.status === 'pending' && (
        <>
          <Spinner className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="font-medium">Transaction Pending</p>
            <p className="text-sm text-muted-foreground">
              Please confirm in your wallet...
            </p>
          </div>
        </>
      )}

      {state.status === 'success' && state.txId && (
        <>
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <div className="flex-1">
            <p className="font-medium text-green-500">Transaction Submitted!</p>
            <p className="text-sm text-muted-foreground">
              Your transaction has been broadcast to the network.
            </p>
          </div>
          <a
            href={getExplorerTxUrl(state.txId, networkType)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View
            <ExternalLink className="w-3 h-3" />
          </a>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Dismiss
            </Button>
          )}
        </>
      )}

      {state.status === 'error' && (
        <>
          <XCircle className="w-5 h-5 text-destructive" />
          <div className="flex-1">
            <p className="font-medium text-destructive">Transaction Failed</p>
            <p className="text-sm text-muted-foreground">{state.error}</p>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Dismiss
            </Button>
          )}
        </>
      )}
    </div>
  );
}
