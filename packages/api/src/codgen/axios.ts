import axios from 'axios';

import { serviceOptions as goServiceOptions } from './goService.generated';
import { serviceOptions } from './service.generated';
import { getJwtToken } from './utils';

const instance = axios.create({
  baseURL: NativeFRWBridge.getEnvKeys().NODE_API_URL,
  timeout: 30000,
});

instance.interceptors.request.use(
  async (config) => {
    const token = await getJwtToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

serviceOptions.axios = instance;

// go service
const goInstance = axios.create({
  baseURL: NativeFRWBridge.getEnvKeys().NODE_API_URL,
  timeout: 30000,
});

goInstance.interceptors.request.use(
  async (config) => {
    const token = await getJwtToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

goServiceOptions.axios = goInstance;
