import { fn } from 'storybook/test';

import * as actual from './use-feature-flags';

// Mock implementation that can be controlled via global variables
export const useFeatureFlag = fn(actual.useFeatureFlag).mockName('useFeatureFlag');
export const useFeatureFlags = fn(actual.useFeatureFlags).mockName('useFeatureFlags');
export const useLatestVersion = fn(actual.useLatestVersion).mockName('useLatestVersion');
