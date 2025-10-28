import { Box, Stack } from '@mui/material';
import { SurgeFeeSection, SurgeWarning } from '@onflow/frw-ui';
import React, { useCallback, useEffect, useState } from 'react';

import { getSurgeData } from '@/bridge/PlatformImpl';
import { MAINNET_CHAIN_ID } from '@/shared/constant';
import { consoleError } from '@/shared/utils';
import { LLPrimaryButton, LLSecondaryButton } from '@/ui/components';
import { useApproval } from '@/ui/hooks/use-approval';
import { useWallet } from '@/ui/hooks/use-wallet';
import { useNetwork } from '@/ui/hooks/useNetworkHook';

import { DefaultBlock } from './DefaultBlock';
import { TransactionBlock } from './TransactionBlock';
interface ConnectProps {
  params: any;
}

const EthConfirm = ({ params }: ConnectProps) => {
  const [, resolveApproval, rejectApproval] = useApproval();
  const usewallet = useWallet();
  const { network: currentNetwork } = useNetwork();
  const [requestParams, setParams] = useState<any>({
    method: '',
    data: [],
    origin: '',
    name: '',
    icon: '',
  });

  const [lilicoEnabled, setLilicoEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [decodedCall, setDecodedCall] = useState<DecodedCall | null>(null);

  const [surgeData, setSurgeData] = useState<{
    maxFee?: string;
    multiplier?: number;
    active?: boolean;
  } | null>(null);
  const [isSurgeDataLoading, setIsSurgeDataLoading] = useState(false);
  const [isSurgeWarningVisible, setIsSurgeWarningVisible] = useState(false);

  interface DecodedParam {
    name?: string;
    value: string;
  }

  interface DecodedFunction {
    function: string;
    params: string[];
  }

  interface DecodedData {
    name?: string;
    params?: DecodedParam[];
    allPossibilities?: DecodedFunction[];
  }

  interface DecodedCall {
    abi: any[];
    name: string;
    is_verified: boolean;
    decodedData: DecodedData;
    status?: number;
  }

  const loadSurgeData = useCallback(async () => {
    if (isSurgeDataLoading) return;

    setIsSurgeDataLoading(true);
    try {
      const surgeData = await getSurgeData(currentNetwork);
      setSurgeData({
        maxFee: surgeData?.maxFee || '0.002501',
        multiplier: surgeData?.multiplier || 1.0,
        active: surgeData?.active || false,
      });
    } catch (error) {
      setSurgeData({
        maxFee: '0.002501',
        multiplier: 1.0,
        active: false,
      });
    } finally {
      setIsSurgeDataLoading(false);
    }
  }, [currentNetwork]);

  const extractData = useCallback(
    async (obj) => {
      if (!obj) return;
      const { method = '', data = [], session: { origin = '', name = '', icon = '' } = {} } = obj;
      const params = { origin, name, icon, method, data };
      setParams(params);
      try {
        if (!data[0]?.data) return;

        const res = await usewallet.decodeEvmCall(data[0].data, data[0].to);
        if (res.status === 200) {
          const { abi, status, ...decodedData } = res;
          setDecodedCall(decodedData);
        }
      } catch (error) {
        consoleError('Error extracting data:', error);
      }
    },
    [usewallet]
  );

  const handleCancel = () => {
    rejectApproval('User rejected the request.');
  };

  const handleAllow = async () => {
    const dontCloseWindow = params.method === 'eth_sendTransaction';

    resolveApproval(
      {
        defaultChain: MAINNET_CHAIN_ID,
        signPermission: 'MAINNET_AND_TESTNET',
      },
      dontCloseWindow
    ); // Keep window open during transaction
  };

  const loadPayer = useCallback(async () => {
    const isEnabled = await usewallet.allowLilicoPay();
    setLilicoEnabled(isEnabled);
  }, [usewallet]);

  useEffect(() => {
    if (params) {
      loadPayer();
      loadSurgeData();
      extractData(params);
    }
  }, [loadPayer, extractData, params, loadSurgeData]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Box
        sx={{
          margin: '18px 18px',
          padding: '18px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, rgba(40, 40, 40, 0.00) 88.24%)',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {requestParams.method === 'personal_sign' ? (
          <DefaultBlock
            title={requestParams.name || ''}
            host={requestParams.origin || ''}
            data={requestParams.data || []}
            logo={requestParams.icon || ''}
          />
        ) : (
          <TransactionBlock
            title={requestParams.name || ''}
            data={requestParams.data || []}
            logo={requestParams.icon || ''}
            lilicoEnabled={lilicoEnabled}
            decodedCall={decodedCall}
            surgeData={surgeData}
          />
        )}

        <Box sx={{ flexGrow: 1 }} />
      </Box>
      <Box
        sx={{
          padding: '0 18px',
        }}
      >
        <SurgeFeeSection
          transactionFee={surgeData?.maxFee || '0.002501'}
          showWarning={requestParams.method === 'personal_sign' ? false : isSurgeWarningVisible}
          surgeMultiplier={surgeData?.multiplier || 1.0}
          isSurgePricingActive={surgeData?.active || false}
        />
      </Box>
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          padding: '18px',
        }}
      >
        <Stack direction="row" spacing={1}>
          <LLSecondaryButton
            label={chrome.i18n.getMessage('Cancel')}
            fullWidth
            onClick={handleCancel}
          />
          {!loading ? (
            <LLPrimaryButton
              label={chrome.i18n.getMessage('Approve')}
              fullWidth
              type="submit"
              onClick={handleAllow}
            />
          ) : (
            <LLSecondaryButton label={chrome.i18n.getMessage('Loading')} fullWidth />
          )}
        </Stack>
      </Box>
      <SurgeWarning
        message={
          surgeData?.active && surgeData?.multiplier
            ? `Due to high network activity, transaction fees are elevated. Current network fees are ${Number(
                surgeData?.multiplier
              )
                .toFixed(2)
                .replace(
                  /\.?0+$/,
                  ''
                )}× higher than usual and your free allowance will not cover the fee for this transaction.`
            : 'Transaction fee information'
        }
        title="Surge pricing"
        variant="warning"
        visible={requestParams.method === 'personal_sign' ? false : isSurgeWarningVisible}
        onClose={() => setIsSurgeWarningVisible(false)}
        onButtonPress={() => {
          setIsSurgeWarningVisible(false);
        }}
        surgeMultiplier={surgeData?.multiplier || 1.0}
      />
    </Box>
  );
};

export default EthConfirm;
