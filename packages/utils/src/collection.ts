import { type CollectionModel } from '@onflow/frw-types';

import { convertedSVGURL } from './svgToPng';

export function getCollectionLogo(collection: CollectionModel): string {
  if (collection.logo) {
    return convertedSVGURL(collection.logo);
  }
  return '';
}
