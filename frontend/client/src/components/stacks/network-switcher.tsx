import { useStacks } from '@/context/stacks-context';
import { NetworkType } from '@/lib/stacks/config';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function NetworkSwitcher() {
  const { networkType, switchNetwork, wallet, connectWallet } = useStacks();

  const handleNetworkChange = (value: string) => {
    const newNetwork = value as NetworkType;
    switchNetwork(newNetwork);

    // If wallet is connected, prompt reconnection to switch Leather network
    if (wallet.isConnected) {
      // Re-connecting with the new network will prompt Leather to switch
      connectWallet();
    }
  };

  return (
    <Select value={networkType} onValueChange={handleNetworkChange}>
      <SelectTrigger className="w-[130px] h-9">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="testnet">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            Testnet
          </span>
        </SelectItem>
        <SelectItem value="mainnet">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Mainnet
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
