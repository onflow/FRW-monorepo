import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import { Box, Typography, Drawer, Stack, Grid, CardMedia, IconButton, Button } from '@mui/material';
import BN from 'bignumber.js';
import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { type TransactionState } from '@/shared/types/transaction-types';
import SlideRelative from '@/ui/FRWComponent/SlideRelative';
import StorageExceededAlert from '@/ui/FRWComponent/StorageExceededAlert';
import { WarningStorageLowSnackbar } from '@/ui/FRWComponent/WarningStorageLowSnackbar';
import { useStorageCheck } from '@/ui/utils/useStorageCheck';
import IconNext from 'ui/FRWAssets/svg/next.svg';
import { LLSpinner, LLProfile, FRWTargetProfile } from 'ui/FRWComponent';
import { stripFinalAmount, useWallet } from 'ui/utils';

interface ToEthConfirmationProps {
  isConfirmationOpen: boolean;
  transactionState: TransactionState;
  handleCloseIconClicked: () => void;
  handleCancelBtnClicked: () => void;
  handleAddBtnClicked: () => void;
}

const FlowToEVMConfirmation = ({
  transactionState,
  isConfirmationOpen,
  handleCloseIconClicked,
  handleCancelBtnClicked,
  handleAddBtnClicked,
}: ToEthConfirmationProps) => {
  const wallet = useWallet();
  const history = useHistory();
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);

  const [occupied, setOccupied] = useState(false);
  const [tid, setTid] = useState<string>('');
  const [count, setCount] = useState(0);
  const { sufficient: isSufficient, sufficientAfterAction } = useStorageCheck({
    transferAmount: 0,
    coin: transactionState?.coinInfo?.coin,
    // the transfer is within the EVM network, the flag should be false
    movingBetweenEVMAndFlow: false,
  });

  const isLowStorage = isSufficient !== undefined && !isSufficient; // isSufficient is undefined when the storage check is not yet completed
  const isLowStorageAfterAction = sufficientAfterAction !== undefined && !sufficientAfterAction;

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
    if (transactionState.toAddress) {
      intervalId = setInterval(function () {
        count++;
        if (count === 7) {
          count = 0;
        }
        setCount(count);
      }, 500);
    } else if (!transactionState.toAddress) {
      clearInterval(intervalId);
    }
  }, [transactionState.toAddress]);

  const getPending = useCallback(async () => {
    const pending = await wallet.getPendingTx();
    if (pending.length > 0) {
      setOccupied(true);
    }
  }, [wallet]);

  const updateOccupied = useCallback(() => {
    setOccupied(false);
  }, []);

  const transferFlowFromCadenceToEvm = useCallback(async () => {
    const amount = new BN(transactionState.amount).decimalPlaces(8, BN.ROUND_DOWN).toString();
    if (stripFinalAmount(amount, 8) !== stripFinalAmount(transactionState.amount, 8)) {
      throw new Error('Amount entered does not match required precision');
    }
    wallet
      .transferFlowEvm(transactionState.toAddress, amount)
      .then(async (txId) => {
        await wallet.setRecent(transactionState.toContact);
        wallet.listenTransaction(
          txId,
          true,
          `${transactionState.amount} ${transactionState.coinInfo.coin} Sent`,
          `You have sent ${transactionState.amount} ${transactionState.selectedToken?.symbol} to ${transactionState.toContact?.contact_name}. \nClick to view this transaction.`,
          transactionState.coinInfo.icon
        );
        handleCloseIconClicked();
        await wallet.setDashIndex(0);
        setSending(false);
        setTid(txId);
        history.push(`/dashboard?activity=1&txId=${txId}`);
      })
      .catch(() => {
        setSending(false);
        setFailed(true);
      });
    // Depending on history is probably not great
  }, [history, transactionState, wallet, handleCloseIconClicked]);

  const transferFTFromCadenceToEvm = useCallback(async () => {
    setSending(true);

    const amount = new BN(transactionState.amount).decimalPlaces(8, BN.ROUND_DOWN).toString();
    if (stripFinalAmount(amount, 8) !== stripFinalAmount(transactionState.amount, 8)) {
      throw new Error('Amount entered does not match required precision');
    }
    const address = transactionState.selectedToken!.address.startsWith('0x')
      ? transactionState.selectedToken!.address.slice(2)
      : transactionState.selectedToken!.address;

    wallet
      .transferFTToEvmV2(
        `A.${address}.${transactionState.selectedToken!.contractName}.Vault`,
        amount,
        transactionState.toAddress
      )
      .then(async (txId) => {
        await wallet.setRecent(transactionState.toContact);
        wallet.listenTransaction(
          txId,
          true,
          `${transactionState.amount} ${transactionState.coinInfo.coin} Sent`,
          `You have sent ${transactionState.amount} ${transactionState.selectedToken?.symbol} to ${transactionState.toContact?.contact_name}. \nClick to view this transaction.`,
          transactionState.coinInfo.icon
        );
        handleCloseIconClicked();
        await wallet.setDashIndex(0);
        setSending(false);
        setTid(txId);
        history.push(`/dashboard?activity=1&txId=${txId}`);
      })
      .catch((err) => {
        console.error('transfer error: ', err);
        setSending(false);
        setFailed(true);
      });
    // Depending on history is probably not great
  }, [
    handleCloseIconClicked,
    history,
    transactionState.amount,
    transactionState.coinInfo.coin,
    transactionState.coinInfo.icon,
    transactionState.selectedToken,
    transactionState.toAddress,
    transactionState.toContact,
    wallet,
  ]);

  const transferTokens = useCallback(async () => {
    try {
      setSending(true);
      switch (transactionState.currentTxState) {
        case 'FlowFromCadenceToEvm':
          await transferFlowFromCadenceToEvm();
          break;
        case 'FTFromCadenceToEvm':
          await transferFTFromCadenceToEvm();
          break;
        default:
          throw new Error(`Unsupported transaction state: ${transactionState.currentTxState}`);
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      setFailed(true);
    }
  }, [transferFlowFromCadenceToEvm, transferFTFromCadenceToEvm, transactionState.currentTxState]);

  const transactionDoneHandler = useCallback(
    (request) => {
      if (request.msg === 'transactionDone') {
        updateOccupied();
      }
      // Handle error
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

  const renderContent = () => (
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
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: '16px' }}
      >
        {transactionState.fromNetwork === 'Evm' ? (
          <FRWTargetProfile contact={transactionState.fromContact} fromEvm={'sendEth'} />
        ) : (
          <LLProfile contact={transactionState.fromContact} />
        )}
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
                  sx={{ height: '5px', width: '5px', borderRadius: '5px', backgroundColor: color }}
                />
              )}
            </Box>
          ))}
        </Box>
        <LLProfile contact={transactionState.toContact} />
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
          {transactionState.coinInfo.icon && (
            <CardMedia
              sx={{ width: '24px', height: '24px' }}
              image={transactionState.coinInfo.icon}
            />
          )}
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
          <InfoIcon fontSize="medium" color="primary" style={{ margin: '0px 12px auto 12px' }} />
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
  );

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
        {renderContent()}
      </Drawer>
      <StorageExceededAlert open={errorCode === 1103} onClose={() => setErrorCode(null)} />
    </>
  );
};

export default FlowToEVMConfirmation;
