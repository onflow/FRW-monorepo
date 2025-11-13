import axios from 'axios';

import { serviceOptions as goServiceOptions } from './codegen/goService.generated';
import { serviceOptions } from './codegen/service.generated';

/**
 * Configure API endpoints and authentication dynamically
 * This function should be called during application initialization
 */
export function configureApiEndpoints(
  apiEndpoint: string,
  goApiEndpoint: string,
  getJWT: () => Promise<string>,
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
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // TODO: Replace with proper logger when context is available
      }
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
    (error) => {
      return Promise.reject(error);
    }
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
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Endpoints that require authentication
        const requiresAuth =
          config.url?.includes('/v3/register') ||
          config.url?.includes('/v3/login') ||
          config.url?.includes('/v3/');

        if (requiresAuth) {
          return Promise.reject(new Error(`Authentication required for ${config.url}`));
        }
      }
      config.headers.network = getNetwork();

      return config;
    },
    (error) => Promise.reject(error)
  );

  goServiceOptions.axios = goInstance;

  // TODO: Add debug logging when context is available
  // logger.debug('Configured API endpoints', { apiEndpoint, goApiEndpoint });
}

/**
 * Check if API endpoints have been configured
 */
export function isApiConfigured(): boolean {
  return !!(serviceOptions.axios && goServiceOptions.axios);
}
