import { FRWError } from '@onflow/frw-types';

export const showError = (error: any, bridge: any, title?: string, t?: any) => {
  if (error instanceof FRWError) {
    bridge.showToast?.(
      title ? title : t ? t('common.error') : 'Error',
      error.code && t ? t(`errors.${error.code}`) : error.message,
      'error'
    );
  } else {
    bridge.showToast?.(title ? title : 'Error', error.message, 'error');
  }
};
