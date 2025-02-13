import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import { Box, Typography, Drawer, Stack, Grid, CardMedia, IconButton, Button } from '@mui/material';
import BN from 'bignumber.js';
import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { type Contract } from 'web3';

import { type TransactionState } from '@/shared/types/transaction-types';
import { ensureEvmAddressPrefix, isValidEthereumAddress } from '@/shared/utils/address';
import SlideRelative from '@/ui/FRWComponent/SlideRelative';
import StorageExceededAlert from '@/ui/FRWComponent/StorageExceededAlert';
import { WarningStorageLowSnackbar } from '@/ui/FRWComponent/WarningStorageLowSnackbar';
import { useContactHook } from '@/ui/hooks/useContactHook';
import { useWeb3 } from '@/ui/hooks/useWeb3';
import { useStorageCheck } from '@/ui/utils/useStorageCheck';
import erc20ABI from 'background/utils/erc20.abi.json';
import IconNext from 'ui/FRWAssets/svg/next.svg';
import { LLSpinner } from 'ui/FRWComponent';
import { Profile } from 'ui/FRWComponent/Send/Profile';
import { useWallet } from 'ui/utils';

interface TransferConfirmationProps {
  transactionState: TransactionState;
  isConfirmationOpen: boolean;
  handleCloseIconClicked: () => void;
}

const TransferConfirmation = ({
  transactionState,
  isConfirmationOpen,
  handleCloseIconClicked,
}: TransferConfirmationProps) => {
  const wallet = useWallet();
  const history = useHistory();
  const { useContact } = useContactHook();
  const fromContactData =
    useContact(transactionState.fromContact?.address || '') || transactionState.fromContact;
  const toContactData =
    useContact(transactionState.toContact?.address || '') || transactionState.toContact;
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);

  const [occupied, setOccupied] = useState(false);
  const [tid, setTid] = useState<string>('');
  const [count, setCount] = useState(0);

  const web3Instance = useWeb3();
  const [erc20Contract, setErc20Contract] = useState<Contract<typeof erc20ABI> | null>(null);

  useEffect(() => {
    if (
      isConfirmationOpen &&
      web3Instance &&
      isValidEthereumAddress(transactionState.selectedToken?.address)
    ) {
      const contractInstance = new web3Instance.eth.Contract(
        erc20ABI,
        transactionState.selectedToken.address
      );
      setErc20Contract(contractInstance);
    }
  }, [web3Instance, transactionState.selectedToken.address, isConfirmationOpen]);

  const transferAmount = transactionState.amount ? parseFloat(transactionState.amount) : undefined;

  // Check if the transfer is between EVM and Flow networks
  const movingBetweenEVMAndFlow =
    (transactionState.fromNetwork === 'Evm' && transactionState.toNetwork !== 'Evm') ||
    (transactionState.fromNetwork !== 'Evm' && transactionState.toNetwork === 'Evm');

  const { sufficient: isSufficient, sufficientAfterAction: isSufficientAfterAction } =
    useStorageCheck({
      transferAmount,
      coin: transactionState.coinInfo?.coin,
      movingBetweenEVMAndFlow,
    });

  const isLowStorage = isSufficient !== undefined && !isSufficient; // isSufficient is undefined when the storage check is not yet completed
  const isLowStorageAfterAction = isSufficientAfterAction !== undefined && !isSufficientAfterAction; // isSufficientAfterAction is undefined when the storage check is not yet completed
  const colorArray = [
    '#32E35529',
    '#32E35540',
    '#32E35559',
    '#32E35573',
    '#41CC5D',
    '#41CC5D',
    '#41CC5D',
  ];

  const startCount = useCallback(() => {
    let count = 0;
    let intervalId;
    if (isConfirmationOpen && transactionState.toAddress) {
      intervalId = setInterval(function () {
        count++;
        if (count === 7) {
          count = 0;
        }
        setCount(count);
      }, 500);
    } else if (!isConfirmationOpen || !transactionState.toAddress) {
      clearInterval(intervalId);
    }
  }, [transactionState.toAddress, isConfirmationOpen]);

  const getPending = useCallback(async () => {
    const pending = await wallet.getPendingTx();
    if (pending.length > 0) {
      setOccupied(true);
    }
  }, [wallet]);

  const updateOccupied = useCallback(() => {
    setOccupied(false);
  }, []);

  const transferTokensOnCadence = useCallback(async () => {
    return wallet.transferInboxTokens(
      transactionState.selectedToken.symbol,
      transactionState.toAddress,
      transactionState.amount
    );
  }, [transactionState, wallet]);

  const transferTokensFromChildToCadence = useCallback(async () => {
    return wallet.sendFTfromChild(
      transactionState.fromAddress,
      transactionState.toAddress,
      'flowTokenProvider',
      transactionState.amount,
      transactionState.selectedToken.symbol
    );
  }, [transactionState, wallet]);

  const transferFlowFromEvmToCadence = useCallback(async () => {
    return wallet.withdrawFlowEvm(transactionState.amount, transactionState.toAddress);
  }, [wallet, transactionState]);

  const transferFTFromEvmToCadence = useCallback(async () => {
    return wallet.transferFTFromEvm(
      transactionState.selectedToken['flowIdentifier'],
      transactionState.amount,
      transactionState.toAddress,
      transactionState.selectedToken
    );
  }, [wallet, transactionState]);

  const transferTokensOnEvm = useCallback(async () => {
    // the amount is always stored as a string in the transaction state
    const amountStr: string = transactionState.amount;
    // TODO: check if the amount is a valid number
    // Create an integer string based on the required token decimals
    const amountBN = new BN(amountStr.replace('.', ''));

    const decimalsCount = amountStr.split('.')[1]?.length || 0;
    const decimalDifference = transactionState.selectedToken.decimals - decimalsCount;
    if (decimalDifference < 0) {
      throw new Error('Too many decimal places have been provided');
    }
    const scaleFactor = new BN(10).pow(decimalDifference);
    const integerAmount = amountBN.multipliedBy(scaleFactor);
    const integerAmountStr = integerAmount.integerValue(BN.ROUND_DOWN).toFixed();

    let address, gas, value, data;

    if (transactionState.selectedToken.symbol.toLowerCase() === 'flow') {
      address = transactionState.toAddress;
      gas = '1';
      // const amountBN = new BN(transactionState.amount).multipliedBy(new BN(10).pow(18));
      // the amount is always stored as a string in the transaction state
      value = integerAmount.toString(16);
      data = '0x';
    } else {
      const encodedData = erc20Contract!.methods
        .transfer(ensureEvmAddressPrefix(transactionState.toAddress), integerAmountStr)
        .encodeABI();
      gas = '1312d00';
      address = ensureEvmAddressPrefix(transactionState.selectedToken.address);
      value = '0x0'; // Zero value as hex
      data = encodedData.startsWith('0x') ? encodedData : `0x${encodedData}`;
    }

    // Send the transaction
    return wallet.sendEvmTransaction(address, gas, value, data);
  }, [transactionState, erc20Contract, wallet]);

  const transferFlowFromCadenceToEvm = useCallback(async () => {
    return wallet.transferFlowEvm(transactionState.toAddress, transactionState.amount);
  }, [transactionState, wallet]);

  const transferFTFromCadenceToEvm = useCallback(async () => {
    const address = transactionState.selectedToken!.address.startsWith('0x')
      ? transactionState.selectedToken!.address.slice(2)
      : transactionState.selectedToken!.address;

    return wallet.transferFTToEvmV2(
      `A.${address}.${transactionState.selectedToken!.contractName}.Vault`,
      transactionState.amount,
      transactionState.toAddress
    );
  }, [transactionState, wallet]);

  const transferTokens = useCallback(async () => {
    try {
      // Set the sending state to true
      setSending(true);

      // Initialize the transaction ID
      let txId: string;

      // Switch on the current transaction state
      switch (transactionState.currentTxState) {
        case 'FTFromEvmToCadence':
          txId = await transferFTFromEvmToCadence();
          break;
        case 'FlowFromEvmToCadence':
          txId = await transferFlowFromEvmToCadence();
          break;
        case 'FTFromChildToCadence':
        case 'FlowFromChildToCadence':
          txId = await transferTokensFromChildToCadence();
          break;
        case 'FTFromCadenceToCadence':
        case 'FlowFromCadenceToCadence':
          txId = await transferTokensOnCadence();
          break;
        case 'FlowFromEvmToEvm':
        case 'FTFromEvmToEvm':
          txId = await transferTokensOnEvm();
          break;
        case 'FlowFromCadenceToEvm':
          txId = await transferFlowFromCadenceToEvm();
          break;
        case 'FTFromCadenceToEvm':
          txId = await transferFTFromCadenceToEvm();
          break;
        default:
          throw new Error(`Unsupported transaction state: ${transactionState.currentTxState}`);
      }
      // Set the transaction ID so we can show that we're processing
      setTid(txId);

      // Listen for the transaction - this is async but don't wait for it to be completed
      wallet.listenTransaction(
        txId,
        true,
        `${transactionState.amount} ${transactionState.coinInfo.coin} Sent`,
        `You have sent ${transactionState.amount} ${transactionState.selectedToken?.symbol} to ${transactionState.toContact?.contact_name}. \nClick to view this transaction.`,
        transactionState.coinInfo.icon
      );
      // Record the recent contact
      await wallet.setRecent(transactionState.toContact);

      // Update the dash index
      await wallet.setDashIndex(0);

      // Redirect to the dashboard activity tab
      history.push(`/dashboard?activity=1&txId=${txId}`);
    } catch (error) {
      console.error('Transaction failed:', error);
      // Set the failed state to true so we can show the error message
      setFailed(true);
    } finally {
      // Set the sending state to false regardless of whether the transaction was successful or not
      setSending(false);
    }
  }, [
    transactionState,
    wallet,
    history,
    transferFTFromEvmToCadence,
    transferFlowFromEvmToCadence,
    transferTokensFromChildToCadence,
    transferTokensOnCadence,
    transferTokensOnEvm,
    transferFlowFromCadenceToEvm,
    transferFTFromCadenceToEvm,
  ]);

  const transactionDoneHandler = useCallback(
    (request) => {
      if (request.msg === 'transactionDone') {
        updateOccupied();
      }
      if (request.msg === 'transactionError') {
        setFailed(true);
        setErrorMessage(request.errorMessage);
        setErrorCode(request.errorCode);
      }
      return true;
    },
    [updateOccupied]
  );

  useEffect(() => {
    startCount();
    getPending();
    chrome.runtime.onMessage.addListener(transactionDoneHandler);

    return () => {
      chrome.runtime.onMessage.removeListener(transactionDoneHandler);
    };
  }, [getPending, startCount, transactionDoneHandler]);

  return (
    <>
      <Drawer
        anchor="bottom"
        open={isConfirmationOpen}
        transitionDuration={300}
        PaperProps={{
          sx: {
            width: '100%',
            height: '65%',
            bgcolor: 'background.paper',
            borderRadius: '18px 18px 0px 0px',
          },
        }}
      >
        <Box
          px="18px"
          sx={{
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            flexDirection: 'column',
            display: 'flex',
          }}
        >
          <Grid
            container
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Grid item xs={1}></Grid>
            <Grid item xs={10}>
              {tid ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="h1" align="center" py="14px" fontSize="20px">
                    {chrome.i18n.getMessage('Transaction_created')}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="h1" align="center" py="14px" fontWeight="bold" fontSize="20px">
                  {!sending
                    ? chrome.i18n.getMessage('Confirmation')
                    : chrome.i18n.getMessage('Processing')}
                </Typography>
              )}
            </Grid>
            <Grid item xs={1}>
              <IconButton onClick={handleCloseIconClicked}>
                <CloseIcon fontSize="medium" sx={{ color: 'icon.navi', cursor: 'pointer' }} />
              </IconButton>
            </Grid>
          </Grid>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: '16px',
            }}
          >
            {/* Need some generic card here that renders the contact card based on the network */}

            <Profile contact={fromContactData} />
            <Box
              sx={{
                marginLeft: '-15px',
                marginRight: '-15px',
                marginTop: '-32px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {colorArray.map((color, index) => (
                <Box sx={{ mx: '5px' }} key={index}>
                  {count === index ? (
                    <CardMedia sx={{ width: '8px', height: '12px' }} image={IconNext} />
                  ) : (
                    <Box
                      key={index}
                      sx={{
                        height: '5px',
                        width: '5px',
                        borderRadius: '5px',
                        backgroundColor: color,
                      }}
                    />
                  )}
                </Box>
              ))}
            </Box>
            <Profile contact={toContactData} />
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              px: '13px',
              py: '16px',
              backgroundColor: '#333333',
              borderRadius: '16px',
              my: '10px',
            }}
          >
            <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}>
              <CardMedia
                sx={{ width: '24px', height: '24px' }}
                image={transactionState.coinInfo.icon}
              />
              <Typography variant="body1" sx={{ fontSize: '18px', fontWeight: 'semi-bold' }}>
                {transactionState.coinInfo.coin}
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Typography
                variant="body1"
                sx={{ fontSize: '18px', fontWeight: '400', textAlign: 'end' }}
              >
                {transactionState.amount} {transactionState.coinInfo.unit}
              </Typography>
            </Stack>
            <Stack direction="column" spacing={1}>
              <Typography
                variant="body1"
                color="info"
                sx={{ fontSize: '14px', fontWeight: 'semi-bold', textAlign: 'end' }}
              >
                $ {transactionState.fiatAmount}
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ flexGrow: 1 }} />
          <SlideRelative direction="down" show={occupied}>
            <Box
              sx={{
                width: '95%',
                backgroundColor: 'error.light',
                mx: 'auto',
                borderRadius: '12px 12px 0 0',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                py: '8px',
              }}
            >
              {/* <CardMedia style={{ color:'#E54040', width:'24px',height:'24px', margin: '0 12px 0' }} image={empty} />   */}
              <InfoIcon
                fontSize="medium"
                color="primary"
                style={{ margin: '0px 12px auto 12px' }}
              />
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '12px' }}>
                {chrome.i18n.getMessage('Your_address_is_currently_processing_another_transaction')}
              </Typography>
            </Box>
          </SlideRelative>
          <WarningStorageLowSnackbar
            isLowStorage={isLowStorage}
            isLowStorageAfterAction={isLowStorageAfterAction}
          />

          <Button
            onClick={transferTokens}
            disabled={sending || occupied}
            variant="contained"
            color="success"
            size="large"
            sx={{
              height: '50px',
              width: '100%',
              borderRadius: '12px',
              textTransform: 'capitalize',
              display: 'flex',
              gap: '12px',
              marginBottom: '33px',
            }}
          >
            {sending ? (
              <>
                <LLSpinner size={28} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="text.primary">
                  {chrome.i18n.getMessage('Sending')}
                </Typography>
              </>
            ) : (
              <>
                {failed ? (
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="text.primary">
                    {chrome.i18n.getMessage('Transaction__failed')}
                  </Typography>
                ) : (
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="text.primary">
                    {chrome.i18n.getMessage('Send')}
                  </Typography>
                )}
              </>
            )}
          </Button>
        </Box>
      </Drawer>
      <StorageExceededAlert open={errorCode === 1103} onClose={() => setErrorCode(null)} />
    </>
  );
};

export default TransferConfirmation;
