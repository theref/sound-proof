
export interface AccessRule {
  type: "public" | "erc20" | "nft";
  contractAddress?: string;
  minBalance?: string;
  tokenId?: string;
}
