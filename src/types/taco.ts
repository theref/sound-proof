
export type ConditionType = 'erc20' | 'erc721';

export interface TacoCondition {
  contractAddress: string;
  chain: number;
  returnValueTest: {
    comparator: ">=" | ">" | "<=" | "<" | "==" | "!=";
    value: number;
  };
}

// Extended classes that match the TACo library structure
export class ERC20Balance {
  public contractAddress: string;
  public chain: number;
  public returnValueTest: TacoCondition['returnValueTest'];
  public method = 'balanceOf';
  public parameters = [':userAddress'];
  public standardContractType = 'ERC20';

  constructor(params: TacoCondition) {
    this.contractAddress = params.contractAddress;
    this.chain = params.chain;
    this.returnValueTest = params.returnValueTest;
  }
}

export class ERC721Balance {
  public contractAddress: string;
  public chain: number;
  public returnValueTest: TacoCondition['returnValueTest'];
  public method = 'balanceOf';
  public parameters = [':userAddress'];
  public standardContractType = 'ERC721';

  constructor(params: TacoCondition) {
    this.contractAddress = params.contractAddress;
    this.chain = params.chain;
    this.returnValueTest = params.returnValueTest;
  }
}
