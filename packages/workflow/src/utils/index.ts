import * as fcl from '@onflow/fcl';

export const getTrxStatus = async (txId: string) => {
  return await fcl.send([fcl.getTransactionStatus(txId)]).then(fcl.decode);
};

export const getTrx = async (txId: string) => {
  return await fcl.send([fcl.getTransaction(txId)]).then(fcl.decode);
};
