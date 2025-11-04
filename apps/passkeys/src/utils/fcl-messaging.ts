type MessageTarget = Window | null;

import { logger } from '@onflow/frw-context';

const findTarget = (): MessageTarget => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (window.opener && !window.opener.closed) {
    return window.opener;
  }

  if (window.parent && window.parent !== window) {
    return window.parent;
  }

  return null;
};

const postToParent = (type: string, body?: Record<string, unknown>) => {
  const target = findTarget();
  if (!target) {
    return;
  }

  const message = body ? { type, ...body } : { type };
  try {
    target.postMessage(message, '*');
  } catch (error) {
    logger.warn('Failed to post message to parent window', error);
  }
};

export const notifyViewReady = () => {
  postToParent('FCL:VIEW:READY');
};

export const sendApprove = (data: unknown) => {
  postToParent('FCL:VIEW:RESPONSE', {
    f_type: 'PollingResponse',
    f_vsn: '1.0.0',
    status: 'APPROVED',
    reason: null,
    data,
  });
};

export const sendDecline = (reason: string) => {
  postToParent('FCL:VIEW:RESPONSE', {
    f_type: 'PollingResponse',
    f_vsn: '1.0.0',
    status: 'DECLINED',
    reason,
  });
};

export const requestClose = () => {
  postToParent('FCL:VIEW:CLOSE');
};
