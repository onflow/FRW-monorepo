import { getLocalData, setLocalData } from '@onflow/frw-data-model';

const persistStorage = (name: string, obj: object) => {
  setLocalData(name, obj);
};

interface CreatePersistStoreParams<T> {
  name: string;
  template?: T;
  fromStorage?: boolean;
}

const createPersistStore = async <T extends object>({
  name,
  template = Object.create(null),
  fromStorage = true,
}: CreatePersistStoreParams<T>): Promise<T> => {
  // Always clone the template to avoid mutating the original object
  let tpl = structuredClone(template);
  if (fromStorage) {
    const storageCache = await getLocalData<T>(name);
    tpl = storageCache || template;
    if (!storageCache) {
      await setLocalData(name, tpl);
    }
  }

  const createProxy = <A extends object>(obj: A): A =>
    new Proxy(obj, {
      set(target, prop, value) {
        if (typeof value === 'object' && value !== null) {
          target[prop] = createProxy(value);
        }

        target[prop] = value;

        persistStorage(name, target);

        return true;
      },

      deleteProperty(target, prop) {
        if (Reflect.has(target, prop)) {
          Reflect.deleteProperty(target, prop);

          persistStorage(name, target);
        }

        return true;
      },
    });
  return createProxy<T>(tpl);
};

export default createPersistStore;
