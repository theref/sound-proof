
import { useEffect, useState } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { conditions } from '@nucypher/taco';
import { ConditionType, ERC20Balance, ERC721Balance } from '@/types/taco';

const DEFAULT_CONTRACT_ADDRESS = '0x46abDF5aD1726ba700794539C3dB8fE591854729';
const DEFAULT_MIN_BALANCE = '1';
const DEFAULT_CHAIN_ID = '11155111'; // Sepolia as string

interface TacoConditionsFormProps {
  onChange: (condition: conditions.condition.Condition | null) => void;
  disabled?: boolean;
}

export const TacoConditionsForm = ({ onChange, disabled }: TacoConditionsFormProps) => {
  const [conditionType, setConditionType] = useState<ConditionType>('erc20');
  const [contractAddress, setContractAddress] = useState(DEFAULT_CONTRACT_ADDRESS);
  const [minBalance, setMinBalance] = useState(DEFAULT_MIN_BALANCE);
  const [chainId, setChainId] = useState(DEFAULT_CHAIN_ID);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const createCondition = () => {
    if (!isInitialized || !contractAddress || !minBalance) {
      onChange(null);
      return;
    }

    const chainIdNumber = parseInt(chainId, 10);
    const minBalanceNumber = parseFloat(minBalance);

    if (isNaN(chainIdNumber) || isNaN(minBalanceNumber)) {
      console.error('Invalid chain ID or minimum balance value');
      onChange(null);
      return;
    }

    try {
      let condition;
      const params = {
        contractAddress,
        chain: chainIdNumber,
        returnValueTest: {
          comparator: ">=" as const,
          value: minBalanceNumber
        }
      };

      if (conditionType === 'erc20') {
        condition = new conditions.base.contract.ContractCondition({
          method: 'balanceOf',
          parameters: [':userAddress'],
          standardContractType: 'ERC20',
          contractAddress: params.contractAddress,
          chain: params.chain,
          returnValueTest: params.returnValueTest,
        });
      } else {
        condition = new conditions.base.contract.ContractCondition({
          method: 'balanceOf',
          parameters: [':userAddress'],
          standardContractType: 'ERC721',
          contractAddress: params.contractAddress,
          chain: params.chain,
          returnValueTest: {
            comparator: '>',
            value: 0,
          },
        });
      }

      console.log('Created condition:', condition);
      onChange(condition);
    } catch (error) {
      console.error('Error creating condition:', error);
      onChange(null);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      createCondition();
    }
  }, [contractAddress, minBalance, chainId, conditionType, isInitialized]);

  return (
    <ScrollArea className="h-[400px] rounded-md border-2 border-taco-black p-4">
      <div className="space-y-4 pr-4">
        <div className="space-y-2">
          <Label className="taco-ui-text text-taco-black">Condition Type</Label>
          <Select value={conditionType} onValueChange={(value) => setConditionType(value as ConditionType)}>
            <SelectTrigger className="border-2 border-taco-black bg-white text-taco-black taco-ui-text">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-2 border-taco-black bg-white">
              <SelectItem value="erc20" className="taco-ui-text">erc20 balance</SelectItem>
              <SelectItem value="erc721" className="taco-ui-text">nft ownership</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="taco-ui-text text-taco-black">Chain</Label>
          <Select value={chainId} onValueChange={setChainId}>
            <SelectTrigger className="border-2 border-taco-black bg-white text-taco-black taco-ui-text">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-2 border-taco-black bg-white">
              <SelectItem value="11155111" className="taco-ui-text">Sepolia Testnet</SelectItem>
              <SelectItem value="1" className="taco-ui-text">Ethereum Mainnet</SelectItem>
              <SelectItem value="137" className="taco-ui-text">Polygon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="taco-ui-text text-taco-black">Contract Address</Label>
          <Input
            placeholder="0x..."
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            disabled={disabled}
            className="border-2 border-taco-black bg-white text-taco-black taco-ui-text font-mono"
          />
        </div>

        {conditionType === 'erc20' && (
          <div className="space-y-2">
            <Label className="taco-ui-text text-taco-black">Minimum Balance</Label>
            <Input
              type="number"
              min="0"
              step="any"
              placeholder="Enter minimum balance"
              value={minBalance}
              onChange={(e) => setMinBalance(e.target.value)}
              disabled={disabled}
              className="border-2 border-taco-black bg-white text-taco-black taco-ui-text"
            />
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
