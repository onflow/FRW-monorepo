import { fn } from 'storybook/test';

import * as actual from './useNftHook';

// These are the mock function instances, exported with the names the component expects.
export const useNftCatalogCollections = fn(actual.useCadenceNftCollectionsAndIds).mockName(
  'useNftCatalogCollections'
);
export const useNftCollectionList = fn(actual.useFullCadenceNftCollectionList).mockName(
  'useNftCollectionList'
);
export const useChildAccountNfts = fn(actual.useChildAccountNfts).mockName('useChildAccountNfts');
