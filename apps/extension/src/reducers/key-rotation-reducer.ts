import type { NewKeyInfo } from '@onflow/frw-types';

import { STEPS, type StepType } from './register-reducer';

export interface KeyRotationState {
  activeTab: StepType;
  mnemonic: string;
  newKeyInfo: NewKeyInfo | null;
  address: string;
  password: string;
  errMessage: string;
  showError: boolean;
  isSubmitting: boolean;
}

export const INITIAL_KEY_ROTATION_STATE: KeyRotationState = {
  activeTab: STEPS.RECOVERY,
  mnemonic: '',
  newKeyInfo: null,
  address: '',
  password: '',
  errMessage: '',
  showError: false,
  isSubmitting: false,
};

export type KeyRotationAction =
  | { type: 'SET_ACTIVE_TAB'; payload: StepType }
  | { type: 'SET_MNEMONIC'; payload: string }
  | { type: 'SET_NEW_KEY_INFO'; payload: NewKeyInfo | null }
  | { type: 'SET_ADDRESS'; payload: string }
  | { type: 'SET_PASSWORD'; payload: string }
  | { type: 'SET_ERROR'; payload: { message: string; show: boolean } }
  | { type: 'SET_IS_SUBMITTING'; payload: boolean }
  | { type: 'GO_BACK' };

export const keyRotationReducer = (
  state: KeyRotationState,
  action: KeyRotationAction
): KeyRotationState => {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_MNEMONIC':
      return { ...state, mnemonic: action.payload };
    case 'SET_NEW_KEY_INFO':
      return { ...state, newKeyInfo: action.payload };
    case 'SET_ADDRESS':
      return { ...state, address: action.payload };
    case 'SET_PASSWORD':
      return { ...state, password: action.payload };
    case 'SET_ERROR':
      return { ...state, errMessage: action.payload.message, showError: action.payload.show };
    case 'SET_IS_SUBMITTING':
      return { ...state, isSubmitting: action.payload };
    case 'GO_BACK': {
      switch (state.activeTab) {
        case STEPS.REPEAT:
          return { ...state, activeTab: STEPS.RECOVERY };
        case STEPS.PASSWORD:
          return { ...state, activeTab: STEPS.REPEAT };
        default:
          return state;
      }
    }
    default:
      return state;
  }
};
