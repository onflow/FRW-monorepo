import * as fcl from '@onflow/fcl';

export const getTrxStatus = async (txId: string) => {
  return await fcl.send([fcl.getTransactionStatus(txId)]).then(fcl.decode);
};

export const getTrx = async (txId: string) => {
  return await fcl.send([fcl.getTransaction(txId)]).then(fcl.decode);
};

export const getIX = () => {
  return JSON.parse(`{
  "params":{},
  "arguments":{},
  "message": {
    "cadence":null,
    "refBlock":null,
    "computeLimit":null,
    "proposer":null,
    "payer":null,
    "authorizations":[],
    "params":[],
    "arguments":[]
  }
}`);
};

export const isFn = (d: any) => typeof d === 'function';

export const makeArgument = (arg: Record<string, any>, idx) => (ix: any) => {
  const tempId = idx;
  ix.message.arguments.push(tempId);

  ix.arguments[tempId] = JSON.parse(`{
  "tempId":null,
  "value":null,
  "asArgument":null,
  "xform":null,
  "resolve": null,
  "resolveArgument": null
}`);
  ix.arguments[tempId].tempId = tempId;
  ix.arguments[tempId].value = arg.value;
  ix.arguments[tempId].asArgument = arg.asArgument;
  ix.arguments[tempId].xform = arg.xform;
  ix.arguments[tempId].resolve = arg.resolve;
  ix.arguments[tempId].resolveArgument = isFn(arg.resolveArgument)
    ? arg.resolveArgument.bind(arg)
    : arg.resolveArgument;

  return ix;
};

// Helper to mark cross-VM transfers in tests
export const isEvmAddress = (address: string) => address.length > 18;

export const setCrossVM = <T extends { sender: string; receiver: string; isCrossVM?: boolean }>(
  payload: T
) => ({
  ...payload,
  isCrossVM: payload.isCrossVM ?? isEvmAddress(payload.sender) !== isEvmAddress(payload.receiver),
});
