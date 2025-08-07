import dotenv from 'dotenv';
dotenv.config();

const accounts = {
  main: {
    address: '0xf380b22ef386ac7e',
    pub: 'f8d4fbffb4b97500888c15ebd7ad9221b17d575b6c093b0434361aa9bd9cd04a7290d4b6574c5b732f5fb9f461e312a69a93091b2a030165947b6ea4f467c7a7',
    evmAddr: '0x00000000000000000000000266ddb89aaaae0ca0',
    key: {
      type: 'hex',
      index: 6,
      signatureAlgorithm: 'ECDSA_P256',
      hashAlgorithm: 'SHA3_256',
      privateKey: process.env.MAIN_ACCOUNT_KEY,
    },
  },
  child1: {
    address: '0x707adbad1428c624',
    key: process.env.CHILD_ACCCOUNT_ONE_KEY,
    pub: '25bda455f2f765a2375732e44ed34eb52a611b3b14607e43b2766c6c07a3f7b0abbd2fc38543f874cbaec50f53f0b6d685e85f78dbb5ffd81c66d9ba8c67b404',
    evmAddr: '0x000000000000000000000002b8424bb6936756e3',
  },
  child2: {
    address: '0xe7aded0979f825d0',
    key: {
      type: 'hex',
      index: 0,
      signatureAlgorithm: 'ECDSA_secp256k1',
      hashAlgorithm: 'SHA2_256',
      privateKey: process.env.CHILD_ACCCOUNT_TWO_KEY,
    },
  },
};

export { accounts };
