import dotenv from 'dotenv';
dotenv.config();

const accounts = {
  main: {
    address: process.env.TEST_MAIN_ACCOUNT_ADDRESS || '',
    pub: process.env.TEST_MAIN_ACCOUNT_PUBKEY,
    evmAddr: process.env.TEST_MAIN_ACCOUNT_COA,
    key: {
      type: 'hex',
      index: process.env.TEST_MAIN_ACCOUNT_KEY_INDEX,
      signatureAlgorithm: 'ECDSA_P256',
      hashAlgorithm: 'SHA3_256',
      privateKey: process.env.TEST_MAIN_ACCOUNT_KEY,
    },
  },
};

export { accounts };
