import { Interface } from '@ethersproject/abi';
import { parseUnits } from '@ethersproject/units';
import type { TransactionDatas, MigrationAssetsData } from '@onflow/frw-types';
import { isValidEthereumAddress } from '@onflow/frw-utils';
import { validateEvmAddress } from '@onflow/frw-workflow';

export const converHexToArr = (callData: string): number[] => {
  const hexString = callData.slice(2); // Remove '0x' prefix
  const dataArray = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    dataArray[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
  }
  const regularArray = Array.from(dataArray);

  return regularArray;
};

export const encodeContractCallData = (
  type: string,
  receiver: string,
  amount: string | number,
  sender: string,
  id?: string
): string => {
  let callData = '0x';

  if (type === 'erc20') {
    const abi = ['function transfer(address to, uint256 value)'];
    const iface = new Interface(abi);
    const valueBig = parseUnits(amount.toString());
    callData = iface.encodeFunctionData('transfer', [receiver, valueBig]);
  } else if (type === 'erc721') {
    const abi = ['function safeTransferFrom(address from, address to, uint256 tokenId)'];
    const iface = new Interface(abi);

    // Encode function call data
    callData = iface.encodeFunctionData('safeTransferFrom', [sender, receiver, id]);
  } else if (type === 'erc1155') {
    // todo
  } else {
    // todo
  }

  return callData;
};

export const convertAssetsToCalldata = (
  assets: MigrationAssetsData,
  sender: string,
  receiver: string
): TransactionDatas => {
  if (!isValidEthereumAddress(receiver)) {
    throw new Error('Invalid receiver address');
  }

  const { erc20 = [], erc721 = [], erc1155 = [] } = assets;

  const addresses: string[] = [];
  const values: string[] = [];
  const calldatas: string[] = []; // call data strings

  const datas: number[][] = []; // call datas arr

  for (const asset of erc20) {
    const { address, amount } = asset;

    if (!validateEvmAddress(address)) {
      throw new Error('Invalid erc20 EVM address');
    }
    if (Number(amount) <= 0) {
      throw new Error('Invalid erc20 amount');
    }
    // Flow token todo as gas fee token, need remain the
    if (address === '0x0000000000000000000000000000000000000000') {
      calldatas.push('0x');
      addresses.push(receiver);
      values.push(parseUnits(amount.toString()).toString());
    } else {
      calldatas.push(encodeContractCallData('erc20', receiver, amount, sender));
      values.push('0');
      addresses.push(address);
    }

    values.push(parseUnits(amount.toString()).toString());
  }

  for (const asset of erc721) {
    const { address, id } = asset;
    if (!validateEvmAddress(address)) {
      throw new Error('Invalid EVM address');
    }
    addresses.push(address);
    values.push('0.0');
    calldatas.push(encodeContractCallData('erc721', receiver, 0, sender, id));
  }

  for (const asset of erc1155) {
    const { address, id, amount } = asset;
    if (!validateEvmAddress(asset.address)) {
      throw new Error('Invalid erc1155 address');
    }
    if (Number(amount) <= 0) {
      throw new Error('Invalid erc1155 amount');
    }
    addresses.push(address);
    values.push('0.0');
    calldatas.push(encodeContractCallData('erc1155', receiver, Number(amount), sender, id));
  }

  // conver data to arr
  for (const data of calldatas) {
    datas.push(converHexToArr(data));
  }
  return {
    addresses,
    values,
    datas,
  };
};
