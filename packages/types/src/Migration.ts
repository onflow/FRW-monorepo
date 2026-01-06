export interface TransactionDatas {
  addresses: string[];
  values: string[];
  datas: number[][];
}

export interface Erc20Asset {
  address: string;
  amount: string;
}

export interface Erc721Asset {
  address: string;
  id: string;
}

export interface Erc1155Asset {
  address: string;
  id: string;
  amount: string;
}

export interface MigrationAssetsData {
  erc20: Erc20Asset[];
  erc721: Erc721Asset[];
  erc1155: Erc1155Asset[];
}
