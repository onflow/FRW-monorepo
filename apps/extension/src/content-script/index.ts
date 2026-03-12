import { nanoid } from 'nanoid';
import { v4 as uuid } from 'uuid';

import { Message } from '@/extension-shared/messaging';

const channelName = nanoid();
const channelAuthToken = nanoid() + nanoid();
const extensionId = chrome.runtime.id;
const injectProviderScript = (isDefaultWallet: boolean) => {
  const initConfig = {
    channelName,
    channelAuthToken,
    isDefaultWallet,
    uuid: uuid(),
    extensionId,
  };

  const container = document.head || document.documentElement;
  const scriptElement = document.createElement('script');
  scriptElement.id = 'injectedScript';
  scriptElement.setAttribute('src', chrome.runtime.getURL('pageProvider.js'));
  scriptElement.setAttribute('data-frw-config', btoa(JSON.stringify(initConfig)));

  container.insertBefore(scriptElement, container.children[0]);

  return scriptElement;
};

injectProviderScript(true); // Initial call to check and inject if needed

const initListener = (channelName: string, authToken: string) => {
  const { BroadcastChannelMessage, PortMessage } = Message;
  const pm = new PortMessage().connect();
  const bcm = new BroadcastChannelMessage(channelName)
    .setAuthToken(authToken)
    .listen((data) => pm.request(data));

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

initListener(channelName, channelAuthToken);

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

// Listener for messages from window/FCL
window.addEventListener('message', function (event) {
  if (event.source !== window || !event.data || typeof event.data !== 'object') return;
  chrome.runtime.sendMessage(extensionId, event.data);
});

// Listener for Custom Flow Transaction event from FCL send
// window.addEventListener('FLOW::TX', function (event) {
//   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   // @ts-ignore: Event detail
//   chrome.runtime.sendMessage({type: 'FLOW::TX', ...event.detail})
// })

const extMessageHandler = (msg, _sender) => {
  if (msg.type === 'FCL:VIEW:READY') {
    if (window) {
      window.postMessage(JSON.parse(JSON.stringify(msg || {})), '*');
    }
  }

  if (msg.f_type && msg.f_type === 'PollingResponse') {
    if (window) {
      window.postMessage(JSON.parse(JSON.stringify({ ...msg, type: 'FCL:VIEW:RESPONSE' })), '*');
    }
  }

  if (msg.data?.f_type && msg.data?.f_type === 'PreAuthzResponse') {
    if (window) {
      window.postMessage(JSON.parse(JSON.stringify({ ...msg, type: 'FCL:VIEW:RESPONSE' })), '*');
    }
  }

  if (msg.type === 'FCL:VIEW:CLOSE') {
    if (window) {
      window.postMessage(JSON.parse(JSON.stringify(msg || {})), '*');
    }
  }

  if (msg.type === 'FLOW::TX') {
    if (window) {
      window.postMessage(JSON.parse(JSON.stringify(msg || {})), '*');
    }
  }

  if (msg.type === 'LILICO:NETWORK') {
    if (window) {
      window.postMessage(JSON.parse(JSON.stringify(msg || {})), '*');
    }
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
