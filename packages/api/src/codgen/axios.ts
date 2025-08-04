import axios from 'axios';

import { serviceOptions as goServiceOptions } from './goService';
import { serviceOptions } from './service';
import { getJwtToken } from './utils';

const instance = axios.create({
  baseURL: 'https://test.lilico.app', // todo dev var
  timeout: 1000,
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
  baseURL: 'https://dev.lilico.app', // todo dev var
  timeout: 1000,
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
