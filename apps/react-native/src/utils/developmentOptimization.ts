// Development mode optimizations to reduce unnecessary re-renders and logs
import React from 'react';

// Check if we're in development mode
export const isDevelopment = __DEV__;

// Debounce function to prevent too frequent calls
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Console log throttling to prevent log spam
const logThrottleMap = new Map<string, number>();
const LOG_THROTTLE_DELAY = 1000; // 1 second

export const throttledLog = (key: string, message: string, ...args: any[]) => {
  const now = Date.now();
  const lastLog = logThrottleMap.get(key) || 0;
  
  if (now - lastLog > LOG_THROTTLE_DELAY) {
    console.log(message, ...args);
    logThrottleMap.set(key, now);
  }
};

// Prevent duplicate function calls within a short time frame
const callThrottleMap = new Map<string, number>();
const CALL_THROTTLE_DELAY = 500; // 500ms

export const throttledCall = <T extends (...args: any[]) => any>(
  key: string,
  func: T,
  delay: number = CALL_THROTTLE_DELAY
): ((...args: Parameters<T>) => void) => {
  return (...args: Parameters<T>) => {
    const now = Date.now();
    const lastCall = callThrottleMap.get(key) || 0;
    
    if (now - lastCall > delay) {
      func(...args);
      callThrottleMap.set(key, now);
    }
  };
};

// React development mode optimization
export const withDevOptimization = <T extends React.ComponentType<any>>(
  Component: T,
  displayName?: string
): T => {
  if (!isDevelopment) {
    return Component;
  }

  const OptimizedComponent = React.memo(Component) as T;
  if (displayName) {
    (OptimizedComponent as any).displayName = displayName;
  }
  
  return OptimizedComponent;
};