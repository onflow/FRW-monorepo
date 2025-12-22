import { nanoid } from 'nanoid';
import { v4 as uuid } from 'uuid';

import { Message } from '@/extension-shared/messaging';

const channelName = nanoid();
const extensionId = chrome.runtime.id;

const DEPLOYMENT_ENV = process.env.DEPLOYMENT_ENV;
const IS_BETA = process.env.IS_BETA === 'true';

const channelPrefix = IS_BETA ? 'frw-beta:' : DEPLOYMENT_ENV === 'production' ? 'frw:' : 'frw-dev:';
const injectProviderScript = (isDefaultWallet: boolean) => {
  // Set local storage variables
  localStorage.setItem(`${channelPrefix}channelName`, channelName);
  localStorage.setItem(`${channelPrefix}isDefaultWallet`, isDefaultWallet.toString());
  localStorage.setItem(`${channelPrefix}uuid`, uuid());
  localStorage.setItem(`${channelPrefix}extensionId`, extensionId);

  const container = document.head || document.documentElement;
  const scriptElement = document.createElement('script');
  scriptElement.id = 'injectedScript';
  scriptElement.setAttribute('src', chrome.runtime.getURL('pageProvider.js'));

  container.insertBefore(scriptElement, container.children[0]);

  return scriptElement;
};

injectProviderScript(true); // Initial call to check and inject if needed

const initListener = (channelName: string) => {
  const { BroadcastChannelMessage, PortMessage } = Message;
  const pm = new PortMessage().connect();
  const bcm = new BroadcastChannelMessage(channelName).listen((data) => pm.request(data));

  // background notification
  pm.on('message', (data) => bcm.send('message', data));

  // pm.request({
  //   type: EVENTS.UIToBackground,
  //   method: 'getScreen',
  //   params: { availHeight: screen.availHeight },
  // });

  document.addEventListener('beforeunload', () => {
    bcm.dispose();
    pm.dispose();
  });
};

initListener(channelName);

// Security: Removed DOM attributes to prevent public identifier exposure
// These identifiers are now only accessible through the extension's secure message channel
// If needed for FCL compatibility, they can be accessed via localStorage with the channelPrefix
// setTimeout(() => {
//   document.body.setAttribute('data-channel-name', channelName);
//   document.body.setAttribute('data-extension-id', extensionId);
// }, 0);

/**
 * Inject script
 */
// Listener for messages from window/FCL

function injectScript(file_path, tag) {
  const node = document.getElementsByTagName(tag)[0];
  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', file_path);
  node.appendChild(script);
  chrome.runtime.sendMessage({ type: 'LILICO:CS:LOADED' });
}

injectScript(chrome.runtime.getURL('script.js'), 'body');

// Allowed FCL message types for security validation
const ALLOWED_FCL_MESSAGE_TYPES = [
  'FCL:VIEW:READY',
  'FCL:VIEW:RESPONSE',
  'FCL:VIEW:CLOSE',
  'FLOW::TX',
  'LILICO:NETWORK',
  'FCW:CS:LOADED',
];

// Store origin for each message to respond to the correct origin
const messageOriginMap = new Map<number, string>();

// Listener for messages from window/FCL
window.addEventListener('message', function (event) {
  // Security: Validate origin to prevent cross-origin attacks
  // Allow same origin (dapp page) and null origin (file:// URLs, sandboxed contexts)
  // Block cross-origin messages from malicious extensions or websites
  const isValidOrigin =
    event.origin === window.location.origin || event.origin === 'null' || event.origin === '';

  if (!isValidOrigin) {
    // Log blocked attempts for security monitoring
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Flow Wallet] Blocked message from unauthorized origin:', event.origin);
    }
    return;
  }

  if (event.data && typeof event.data === 'object') {
    // Validate message type to only allow expected FCL message types
    const messageType = event.data.type || event.data.f_type;

    // For messages without a type, check if they have FCL service structure
    const hasServiceStructure = event.data.f_type === 'Service' || event.data.service;

    if (messageType && !hasServiceStructure) {
      const isAllowedType = ALLOWED_FCL_MESSAGE_TYPES.some((allowed) =>
        messageType.includes(allowed)
      );

      if (!isAllowedType) {
        // Allow service discovery messages (no type but has service structure)
        // Block other unauthorized message types
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[Flow Wallet] Blocked unauthorized message type:', messageType);
        }
        return;
      }
    }

    // Store origin for response routing (use current origin if event.origin is null/empty)
    const responseOrigin =
      event.origin && event.origin !== 'null' && event.origin !== ''
        ? event.origin
        : window.location.origin;

    if (event.data.ident !== undefined) {
      messageOriginMap.set(event.data.ident, responseOrigin);
    }

    chrome.runtime.sendMessage(extensionId, event.data);
  }
});

// Listener for Custom Flow Transaction event from FCL send
// window.addEventListener('FLOW::TX', function (event) {
//   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   // @ts-ignore: Event detail
//   chrome.runtime.sendMessage({type: 'FLOW::TX', ...event.detail})
// })

const extMessageHandler = (msg, _sender) => {
  // Security: Determine target origin for postMessage
  // Use stored origin if available, otherwise use current page origin
  let targetOrigin = window.location.origin;
  if (msg.ident !== undefined && messageOriginMap.has(msg.ident)) {
    targetOrigin = messageOriginMap.get(msg.ident)!;
    // Clean up after use
    messageOriginMap.delete(msg.ident);
  }

  const sendMessage = (data: any) => {
    if (window) {
      // Security: Send to specific origin instead of wildcard '*'
      window.postMessage(JSON.parse(JSON.stringify(data || {})), targetOrigin);
    }
  };

  if (msg.type === 'FCL:VIEW:READY') {
    sendMessage(msg);
  }

  if (msg.f_type && msg.f_type === 'PollingResponse') {
    sendMessage({ ...msg, type: 'FCL:VIEW:RESPONSE' });
  }

  if (msg.data?.f_type && msg.data?.f_type === 'PreAuthzResponse') {
    sendMessage({ ...msg, type: 'FCL:VIEW:RESPONSE' });
  }

  if (msg.type === 'FCL:VIEW:CLOSE') {
    sendMessage(msg);
  }

  if (msg.type === 'FLOW::TX') {
    sendMessage(msg);
  }

  if (msg.type === 'LILICO:NETWORK') {
    sendMessage(msg);
  }
};

/**
 * Fired when a message is sent from either an extension process or another content script.
 */
chrome.runtime.onMessage.addListener(extMessageHandler);

const wakeup = function () {
  setTimeout(function () {
    chrome.runtime.sendMessage(extensionId, 'ping', function () {
      return false;
    });
    wakeup();
  }, 2000);
};
wakeup();
