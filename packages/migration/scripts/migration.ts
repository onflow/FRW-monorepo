import { accounts } from '../__tests__/utils/accounts';
import { convertAssetsToCalldata } from '../src/utils';

const main = async () => {
  const assets = {
    erc20: [
      {
        // flow
        address: '0x0000000000000000000000000000000000000000',
        amount: '0.05',
      },
      {
        // USDF
        address: '0x2aabea2058b5ac2d339b163c6ab6f2b6d53aabed',
        amount: '300000',
      },
      {
        // WFLOW
        address: '0xd3bf53dac106a0290b0483ecbc89d40fcc961f3e',
        amount: '30000',
      },
      {
        // USDC.e
        address: '0x7f27352d5f83db87a5a3e00f4b07cc2138d8ee52',
        amount: '3000',
      },
      {
        // BETA
        address: '0xd8ad8ae8375aa31bff541e17dc4b4917014ebdaa',
        amount: '30000',
      },
      {
        // FROTH
        address: '0xb73bf8e6a4477a952e0338e6cc00cc0ce5ad04ba',
        amount: '30000',
      },
      {
        // DUCAT
        address: '0x8b2f3a6e7ad5f971ff5d4e597a4ebc58b2d2758e',
        amount: '30000',
      },
      {
        // BOB
        address: '0x2a35485524563ffd64a438d0e31668580ae39399',
        amount: '30000',
      },
      {
        // MUSKY
        address: '0x507dc543efdd9f3381602fba97d4dbfcf8900619',
        amount: '30000',
      },
      {
        // XENA
        address: '0x732d59fc051c852fc0bfeb8afc20a6cd8d80432b',
        amount: '30000',
      },
      {
        // RTP
        address: '0x9f938fb1f7a7081dfe22f354905ab50ed3ff9f3c',
        amount: '30000',
      },
      {
        // PUSS
        address: '0xcd2336c1a78662c1302eb916ff3d49a073af2056',
        amount: '30000',
      },
    ],
    erc721: [
      {
        // trado swap
        address: '0x19b683a2f45012318d9b2ae1280d68d3ec54d663',
        id: '236',
      },
      {
        address: '0x19b683a2f45012318d9b2ae1280d68d3ec54d663',
        id: '235',
      },
      {
        // FLOAT
        address: '0x2b7cfe0f24c18690a4e34a154e313859b7c6e342',
        id: '271579374106096',
      },
      {
        address: '0x2b7cfe0f24c18690a4e34a154e313859b7c6e342',
        id: '122045792977586',
      },
      {
        // kitty
        address: '0x38861c69e9a9ddd0cb37b833e93ccb9042f5e5f7',
        id: '68',
      },
      {
        // reward
        address: '0x45fd22727acd6e7dce5c8f5d5b929d0f82f567ee',
        id: '184717954484270',
      },
      {
        // topshot
        address: '0x84c6a2e6765e88427c41bb38c82a78b570e24709',
        id: '4053461',
      },
      {
        // topshot
        address: '0x84c6a2e6765e88427c41bb38c82a78b570e24709',
        id: '39962880',
      },
      {
        // topshot
        address: '0x84c6a2e6765e88427c41bb38c82a78b570e24709',
        id: '37072632',
      },
      {
        // topshot
        address: '0x84c6a2e6765e88427c41bb38c82a78b570e24709',
        id: '11027469',
      },
      {
        // topshot
        address: '0x84c6a2e6765e88427c41bb38c82a78b570e24709',
        id: '10700581',
      },
    ],
    erc1155: [
      {
        // BOB
        address: '0x3e00930ed9db5b78d2c1b470cf9dc635bb405f39',
        id: '1',
        amount: '2',
      },
    ],
  };

  const sender = accounts.tester.coaAddr;
  const receiver = accounts.tester.eoaAddr;

  const callDatas = convertAssetsToCalldata(assets, sender, receiver);

  console.log(callDatas);
};

main();
