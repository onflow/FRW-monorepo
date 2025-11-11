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
      // TODO: Add debug logging when context is available
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Debug logging for registration endpoint
        if (config.url?.includes('/v3/register')) {
          console.log('[API] /v3/register - Token present, length:', token.length);
        }
        // Debug logging for address creation endpoints
        if (config.url?.includes('/v1/user/address')) {
          console.log('[API] /v1/user/address - Token present, length:', token.length);
          console.log('[API] /v1/user/address - Full URL:', config.baseURL + config.url);
          console.log('[API] /v1/user/address - Method:', config.method);
        }
        if (config.url?.includes('/v2/user/address')) {
          console.log('[API] /v2/user/address - Token present, length:', token.length);
          console.log('[API] /v2/user/address - Full URL:', config.baseURL + config.url);
          console.log('[API] /v2/user/address - Method:', config.method);
        }
      } else {
        // Endpoints that require authentication
        const requiresAuth =
          config.url?.includes('/v3/register') ||
          config.url?.includes('/v3/login') ||
          config.url?.includes('/v3/');

        if (requiresAuth) {
          const errorMessage =
            `No authentication token available for ${config.url}. ` +
            `Firebase Auth ID token is required for this endpoint. ` +
            `This usually indicates a network connectivity issue preventing Firebase Auth from signing in anonymously. ` +
            `Please check device/emulator internet connection and Firebase configuration.`;
          console.error('[API]', errorMessage);
          return Promise.reject(new Error(errorMessage));
        }

        // Log warning for address creation endpoints if no token
        if (config.url?.includes('/v1/user/address')) {
          console.warn('[API] /v1/user/address - No token available, request will likely fail');
          console.warn('[API] /v1/user/address - Full URL:', config.baseURL + config.url);
        }
        if (config.url?.includes('/v2/user/address')) {
          console.warn('[API] /v2/user/address - No token available, request will likely fail');
          console.warn('[API] /v2/user/address - Full URL:', config.baseURL + config.url);
        }

        // TODO: Replace with proper logger when context is available
        if (config.url?.includes('/v3/register')) {
          console.warn('[API] /v3/register - No token available, request will likely fail');
        }
      }
      config.headers.network = getNetwork();

      // Log request body for debugging (especially for /v3/register)
      if (config.url?.includes('/v3/register') && config.data) {
        try {
          const requestBody =
            typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
          console.log('[API] /v3/register request body:', JSON.stringify(requestBody, null, 2));
        } catch (e) {
          console.log('[API] /v3/register request data (raw):', config.data);
        }
      }

      // Log request details for address creation endpoints
      if (config.url?.includes('/v1/user/address')) {
        console.log('[API] /v1/user/address request details:', {
          url: config.baseURL + config.url,
          method: config.method,
          headers: {
            Authorization: config.headers.Authorization ? 'Bearer [token]' : 'none',
            network: config.headers.network,
          },
        });
      }
      if (config.url?.includes('/v2/user/address')) {
        console.log('[API] /v2/user/address request details:', {
          url: config.baseURL + config.url,
          method: config.method,
          headers: {
            Authorization: config.headers.Authorization ? 'Bearer [token]' : 'none',
            network: config.headers.network,
          },
        });
      }

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
