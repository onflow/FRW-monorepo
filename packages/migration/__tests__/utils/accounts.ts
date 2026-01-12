import dotenv from 'dotenv';
dotenv.config();

const accounts = {
  main: {
    address: process.env.TEST_MAIN_ACCOUNT_ADDRESS || '',
    pub: process.env.TEST_MAIN_ACCOUNT_PUBKEY || '',
    evmAddr: process.env.TEST_MAIN_ACCOUNT_COA || '',
    eoaAddr: process.env.TEST_MAIN_ACCOUNT_EOA || '',
    key: {
      type: 'hex',
      index: process.env.TEST_MAIN_ACCOUNT_KEY_INDEX,
      signatureAlgorithm: 'ECDSA_P256',
      hashAlgorithm: 'SHA3_256',
      privateKey: process.env.TEST_MAIN_ACCOUNT_KEY,
    },
  },
  receiver: {
    address: process.env.TEST_CHILD_ACCOUNT_ONE_ADDR,
    key: process.env.CHILD_ACCOUNT_ONE_KEY || '',
    pub: '25bda455f2f765a2375732e44ed34eb52a611b3b14607e43b2766c6c07a3f7b0abbd2fc38543f874cbaec50f53f0b6d685e85f78dbb5ffd81c66d9ba8c67b404',
    evmAddr: '0x000000000000000000000002b8424bb6936756e3',
  },
};

export { accounts };
