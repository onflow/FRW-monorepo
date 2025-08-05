import BroadcastChannelMessage from './message/broadcastChannelMessage';
import PortMessage from './message/portMessage';

const Message = {
  BroadcastChannelMessage,
  PortMessage,
};

export { Message };
export { default as eventBus } from './message/eventBus';
export * from './message';
