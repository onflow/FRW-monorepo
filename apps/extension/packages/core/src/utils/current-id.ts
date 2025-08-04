import { CURRENT_ID_KEY, getLocalData } from '@onflow/frw-data-model';

export const returnCurrentProfileId = async (): Promise<string | undefined> => {
  return await getLocalData<string>(CURRENT_ID_KEY);
};

export const getCurrentProfileId = async (): Promise<string> => {
  const currentId = await returnCurrentProfileId();
  if (!currentId) {
    throw new Error('Current id is not set.');
  }
  return currentId;
};
