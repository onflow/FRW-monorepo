import { CURRENT_ID_KEY, getUserData } from '@onflow/frw-data-model';

export const returnCurrentProfileId = async (): Promise<string | undefined> => {
  return await getUserData<string>(CURRENT_ID_KEY);
};

export const getCurrentProfileId = async (): Promise<string> => {
  const currentId = await returnCurrentProfileId();
  if (!currentId) {
    throw new Error('Current id is not set.');
  }
  return currentId;
};
