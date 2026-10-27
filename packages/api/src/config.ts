import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

type RetriableConfig = InternalAxiosRequestConfig & { _authRetried?: boolean };

/**
 * On HTTP 401, ask the platform for a fresh token (refresh or re-mint) and retry once.
 * A reused signed login token cannot be fixed by retrying, so that case is passed through.
 */
function retryOnUnauthorized(
  instance: AxiosInstance,
  getJWT: (forceRefresh?: boolean) => Promise<string>
) {
  return async (error: AxiosError<{ code?: string }>) => {
    const config = error.config as RetriableConfig | undefined;
    if (
      !config ||
      config._authRetried ||
      error.response?.status !== 401 ||
      error.response?.data?.code === 'signed_token_reused'
    ) {
      return Promise.reject(error);
    }
    config._authRetried = true;
    const token = await getJWT(true);
    config.headers.Authorization = `Bearer ${token}`;
    return instance.request(config);
  };
}

import { serviceOptions as goServiceOptions } from './codegen/goService.generated';
import { serviceOptions } from './codegen/service.generated';

/**
 * Configure API endpoints and authentication dynamically
 * This function should be called during application initialization
 */
export function configureApiEndpoints(
  apiEndpoint: string,
  goApiEndpoint: string,
  getJWT: (forceRefresh?: boolean) => Promise<string>,
  getNetwork: () => string
): void {
  // Configure main API service
  const instance = axios.create({
    baseURL: apiEndpoint,
    timeout: 30000, // 30 seconds timeout
  });

  instance.interceptors.request.use(
    async (config) => {
      const token = await getJWT();
      config.headers.Authorization = `Bearer ${token}`;
      config.headers.network = getNetwork();
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add response interceptor to debug server responses
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    retryOnUnauthorized(instance, getJWT)
  );

  serviceOptions.axios = instance;

  // Configure Go API service
  const goInstance = axios.create({
    baseURL: goApiEndpoint,
    timeout: 30000, // 30 seconds timeout
  });

  goInstance.interceptors.request.use(
    async (config) => {
      const token = await getJWT();
      config.headers.Authorization = `Bearer ${token}`;
      config.headers.network = getNetwork();
      return config;
    },
    (error) => Promise.reject(error)
  );

  goInstance.interceptors.response.use(
    (response) => response,
    retryOnUnauthorized(goInstance, getJWT)
  );

  goServiceOptions.axios = goInstance;
}

/**
 * Check if API endpoints have been configured
 */
export function isApiConfigured(): boolean {
  return !!(serviceOptions.axios && goServiceOptions.axios);
}
