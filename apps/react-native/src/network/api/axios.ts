import NativeFRWBridge from '@/bridge/NativeFRWBridge';
import axios from 'axios';
import { serviceOptions as goServiceOptions } from './goService';
import { serviceOptions } from './service';

const instance = axios.create({
  baseURL: __DEV__ ? 'https://web-dev.api.wallet.flow.com' : 'https://web.api.wallet.flow.com',
  timeout: 10000,
});

instance.interceptors.request.use(
  async config => {
    const token = await NativeFRWBridge.getJWT();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('[API Debug] WARNING: No JWT token available for API request!');
    }
    config.headers.network = NativeFRWBridge.getNetwork();
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor to debug server responses
instance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    return Promise.reject(error);
  }
);

serviceOptions.axios = instance;

// go service
const goInstance = axios.create({
  baseURL: 'https://dev.lilico.app', // todo dev var
  timeout: 10000,
});

goInstance.interceptors.request.use(
  async config => {
    const token = await NativeFRWBridge.getJWT();
    console.log(`[Go API Debug] JWT Token length: ${token?.length || 0}`);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('[Go API Debug] WARNING: No JWT token available for Go API request!');
    }
    config.headers.network = NativeFRWBridge.getNetwork();
    return config;
  },
  error => Promise.reject(error)
);

goServiceOptions.axios = goInstance;
