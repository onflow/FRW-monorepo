import { type FirebaseApp, type FirebaseOptions, initializeApp } from 'firebase/app';
// This should work for both web and extension
import {
  getAuth,
  indexedDBLocalPersistence,
  setPersistence,
  signInAnonymously,
  signInWithCustomToken,
  signOut,
  type Unsubscribe,
  onAuthStateChanged,
  type User,
} from 'firebase/auth/web-extension';
import { getId, getInstallations } from 'firebase/installations';

import { consoleLog } from '@onflow/frw-shared/utils';

import { analyticsService } from './analytics';

export class AuthenticationService {
  private app: FirebaseApp | null;
  constructor() {
    this.app = null;
  }

  init(firebaseConfig: FirebaseOptions) {
    this.app = initializeApp(firebaseConfig);
    const auth = this.getAuth();
    onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        // const uid = user.uid;
        if (user.isAnonymous) {
          consoleLog('User is anonymous');
        } else {
          if (analyticsService) {
            analyticsService.identify(user.uid, user.displayName ?? user.uid);
          }
          consoleLog('User is signed in');
        }
      } else {
        // User is signed out
        consoleLog('User is signed out');
      }
    });
  }

  getAuth() {
    if (!this.app) {
      return getAuth();
    }
    return getAuth(this.app);
  }

  waitForAuthInit = async () => {
    let unsubscribe: Unsubscribe;
    const auth = this.getAuth();
    await new Promise<void>((resolve) => {
      unsubscribe = auth.onAuthStateChanged((_user) => resolve());
    });
    (await unsubscribe!)();
  };

  signInAnonymously = async () => {
    const auth = this.getAuth();
    await signInAnonymously(auth);
  };

  signInWithCustomToken = async (token: string) => {
    const auth = this.getAuth();
    // This might be extension specific
    await setPersistence(auth, indexedDBLocalPersistence);
    await signInWithCustomToken(auth, token);
  };
  // NOTE: Use signInAnonymously to sign out the user
  signOut = async () => {
    const auth = this.getAuth();
    await signOut(auth);
  };
  getInstallationId = async () => {
    if (!this.app) {
      throw new Error('Firebase app not initialized');
    }
    const installations = getInstallations(this.app);
    const id = await getId(installations);
    return id;
  };
}

export default new AuthenticationService();
