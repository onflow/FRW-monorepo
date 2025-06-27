import { fn } from 'storybook/test';

import * as actual from './useProfileHook';

// Mock for useProfiles hook that uses the global mock
export const useProfiles = fn().mockName('useProfiles');
