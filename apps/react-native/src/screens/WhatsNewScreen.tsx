import { UpdateDialog, type WhatsNewAction as UpdateDialogAction } from '@onflow/frw-ui';
import React, { useMemo } from 'react';

import { platform } from '@/bridge/PlatformImpl';

export interface WhatsNewAction {
  text: string;
  url?: string;
  type?: 'external' | 'internal' | 'deeplink' | string;
  style?: Record<string, unknown>;
}

export interface WhatsNewData {
  title?: string;
  content?: string;
  version?: string;
  language?: string;
  platform?: string;
  actions?: WhatsNewAction[];
}

interface WhatsNewScreenProps {
  data?: WhatsNewData;
}

const WhatsNewScreen: React.FC<WhatsNewScreenProps> = ({ data }) => {
  const title = useMemo(() => {
    if (data?.title?.trim()) {
      return data.title.trim();
    }

    if (data?.version?.trim()) {
      return `What's New ${data.version.trim()}`;
    }

    return "What's New";
  }, [data?.title, data?.version]);

  const content = data?.content ?? '';
  const actions = useMemo<UpdateDialogAction[]>(() => {
    const sourceActions = Array.isArray(data?.actions) ? data.actions : [];

    return sourceActions
      .filter(action => Boolean(action?.text?.trim()))
      .map(action => ({
        text: action.text.trim(),
        url: action.url,
        type: action.type === 'internal' || action.type === 'deeplink' ? action.type : 'external',
        style: action.style,
      }));
  }, [data?.actions]);

  const onClose = () => {
    platform.closeRN();
  };

  return (
    <UpdateDialog
      visible
      title={title}
      updateContent={content}
      actions={actions}
      buttonText="OK"
      onButtonClick={onClose}
      onClose={onClose}
    />
  );
};

export default WhatsNewScreen;
