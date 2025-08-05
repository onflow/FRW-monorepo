import axios from 'axios';
import { serviceOptions as goServiceOptions } from './codgen/goService';
import { serviceOptions } from './codgen/service';

/**
 * Configure API endpoints and authentication dynamically
 * This function should be called during application initialization
 */
export function configureApiEndpoints(
  apiEndpoint: string,
  goApiEndpoint: string,
  getJWT: () => Promise<string>,
  getNetwork: () => string
) {
  // Configure main API service
  const instance = axios.create({
    baseURL: apiEndpoint,
    timeout: 10000,
  });

  instance.interceptors.request.use(
    async (config) => {
      const token = await getJWT();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('[API Debug] WARNING: No JWT token available for API request!');
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
    timeout: 10000,
  });

  goInstance.interceptors.request.use(
    async (config) => {
      const token = await getJWT();
      console.log(`[Go API Debug] JWT Token length: ${token?.length || 0}`);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('[Go API Debug] WARNING: No JWT token available for Go API request!');
      }
      config.headers.network = getNetwork();
      return config;
    },
    (error) => Promise.reject(error)
  );

  goServiceOptions.axios = goInstance;

  console.log('[API Config] Configured API endpoints:', {
    apiEndpoint,
    goApiEndpoint,
  });
}

/**
 * Check if API endpoints have been configured
 */
export function isApiConfigured(): boolean {
  return !!(serviceOptions.axios && goServiceOptions.axios);
}