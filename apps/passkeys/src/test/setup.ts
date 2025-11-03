import '@testing-library/jest-dom';

// Mock WebAuthn API
Object.defineProperty(window, 'PublicKeyCredential', {
  writable: true,
  value: jest.fn(() => ({
    create: jest.fn(),
    get: jest.fn(),
    isUserVerifyingPlatformAuthenticatorAvailable: jest.fn(() => Promise.resolve(true)),
  })),
});

Object.defineProperty(navigator, 'credentials', {
  writable: true,
  value: {
    create: jest.fn(),
    get: jest.fn(),
  },
});

// Mock crypto.getRandomValues
Object.defineProperty(window, 'crypto', {
  writable: true,
  value: {
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  },
});
