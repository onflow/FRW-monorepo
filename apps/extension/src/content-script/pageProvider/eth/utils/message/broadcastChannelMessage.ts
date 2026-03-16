import Message from './index';

export default class BroadcastChannelMessage extends Message {
  private _channel: BroadcastChannel;
  private _authToken = '';

  constructor(name?: string) {
    super();
    if (!name) {
      throw new Error('the broadcastChannel name is missing');
    }
    this._channel = new BroadcastChannel(name);
  }

  setAuthToken = (authToken: string) => {
    this._authToken = authToken;
    return this;
  };

  connect = () => {
    if (!this._authToken) {
      throw new Error('the broadcastChannel auth token is missing');
    }
    this._channel.onmessage = ({ data }) => {
      if (!data || data.authToken !== this._authToken) {
        return;
      }
      const { type, data: payload } = data;
      if (type === 'message') {
        this.emit('message', payload);
      } else if (type === 'response') {
        this.onResponse(payload);
      }
    };

    return this;
  };

  listen = (listenCallback) => {
    if (!this._authToken) {
      throw new Error('the broadcastChannel auth token is missing');
    }
    this.listenCallback = listenCallback;

    this._channel.onmessage = ({ data }) => {
      if (!data || data.authToken !== this._authToken) {
        return;
      }
      const { type, data: payload } = data;
      if (type === 'request') {
        this.onRequest(payload);
      }
    };

    return this;
  };

  send = (type, data) => {
    if (!this._authToken) {
      throw new Error('the broadcastChannel auth token is missing');
    }
    this._channel.postMessage({
      type,
      data,
      authToken: this._authToken,
    });
  };

  dispose = () => {
    this._dispose();
    this._channel.close();
  };
}
