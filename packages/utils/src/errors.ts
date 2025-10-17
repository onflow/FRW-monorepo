import { bridge } from '@onflow/frw-context';
import { FRWError } from '@onflow/frw-types';

export const showError = (error: any, t: any) => {
  if (error instanceof FRWError) {
    bridge.showToast?.(
      t ? t('common.error') : 'Error',
      error.code && t ? t(`errors.${error.code}`) : error.message,
      'error'
    );
  } else {
    bridge.showToast!('Error', error.message, 'error');
  }
};
