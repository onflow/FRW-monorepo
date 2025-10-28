import dotenv from 'dotenv';
dotenv.config();

const accounts = {
  // main: {
  //   address: process.env.TEST_MAIN_ACCOUNT_ADDRESS || '',
  //   pub: process.env.TEST_MAIN_ACCOUNT_PUBKEY,
  //   evmAddr: process.env.TEST_MAIN_ACCOUNT_COA,
  //   key: {
  //     type: 'hex',
  //     index: process.env.TEST_MAIN_ACCOUNT_KEY_INDEX,
  //     signatureAlgorithm: 'ECDSA_P256',
  //     hashAlgorithm: 'SHA3_256',
  //     privateKey: process.env.TEST_MAIN_ACCOUNT_KEY,
  //   },
  // },
  main: {
    address: process.env.TEST_MAIN_EOA_ACCOUNT_ADDRESS || '',
    pub: process.env.TEST_MAIN_EOA_ACCOUNT_PUBKEY,
    evmAddr: process.env.TEST_MAIN_EOA_ACCOUNT_COA,
    eoaAddr: process.env.TEST_MAIN_EOA_ACCOUNT_EOA || '',
    key: {
      type: 'hex',
      index: 0,
      signatureAlgorithm: 'ECDSA_secp256k1',
      hashAlgorithm: 'SHA2_256',
      privateKey: process.env.TEST_MAIN_EOA_ACCOUNT_KEY,
    },
    mnemonic: process.env.TEST_MAIN_EOA_ACCOUNT_MNEMONIC,
  },
  child1: {
    address: process.env.TEST_CHILD_ACCOUNT_ONE_ADDR,
    key: process.env.CHILD_ACCOUNT_ONE_KEY || '',
    pub: '25bda455f2f765a2375732e44ed34eb52a611b3b14607e43b2766c6c07a3f7b0abbd2fc38543f874cbaec50f53f0b6d685e85f78dbb5ffd81c66d9ba8c67b404',
    evmAddr: '0x000000000000000000000002b8424bb6936756e3',
  },
  child2: {
    address: process.env.TEST_CHILD_ACCOUNT_TWO_ADDR,
    key: {
      type: 'hex',
      index: 0,
      signatureAlgorithm: 'ECDSA_secp256k1',
      hashAlgorithm: 'SHA2_256',
      privateKey: process.env.CHILD_ACCOUNT_TWO_KEY || '',
    },
  },
  payer: {
    addr: process.env.PAYER_ADDRESS,
    key: process.env.PAYER_ACCOUNT_KEY,
  },
};

export { accounts };
