import { describe, expect, it, vi } from 'vitest';

import { INITIAL_REGISTER_STATE, registerReducer, STEPS } from '../register-reducer';

vi.mock('bip39', () => ({
  generateMnemonic: () => 'test mnemonic',
}));

describe('Register Reducer', () => {
  describe('Initial State', () => {
    it('should have the correct initial state', () => {
      expect(INITIAL_REGISTER_STATE).toEqual({
        activeTab: STEPS.RECOVERY,
        nickname: '',
        password: undefined,
        mnemonic: '',
        isAddWallet: false,
      });
    });
  });

  describe('Action Handlers', () => {
    it('should set active tab', () => {
      const action = { type: 'SET_ACTIVE_TAB' as const, payload: STEPS.RECOVERY };
      const newState = registerReducer(INITIAL_REGISTER_STATE, action);
      expect(newState.activeTab).toBe(STEPS.RECOVERY);
    });

    it('should set username', () => {
      const action = { type: 'SET_USERNAME' as const, payload: 'testuser' };
      const newState = registerReducer(INITIAL_REGISTER_STATE, action);
      expect(newState.username).toBe('testuser');
    });

    it('should set password', () => {
      const action = { type: 'SET_PASSWORD' as const, payload: 'password123' };
      const newState = registerReducer(INITIAL_REGISTER_STATE, action);
      expect(newState.password).toBe('password123');
    });

    it('should set isAddWallet', () => {
      const action = { type: 'SET_IS_ADD_WALLET' as const, payload: true };
      const newState = registerReducer(INITIAL_REGISTER_STATE, action);
      expect(newState.isAddWallet).toBe(true);
    });

    describe('GO_BACK', () => {
      it('should not change state when going back from RECOVERY (first step)', () => {
        const state = { ...INITIAL_REGISTER_STATE, activeTab: STEPS.RECOVERY };
        const action = { type: 'GO_BACK' as const };
        const newState = registerReducer(state, action);
        expect(newState.activeTab).toBe(STEPS.RECOVERY);
      });

      it('should go back from REPEAT to RECOVERY', () => {
        const state = { ...INITIAL_REGISTER_STATE, activeTab: STEPS.REPEAT };
        const action = { type: 'GO_BACK' as const };
        const newState = registerReducer(state, action);
        expect(newState.activeTab).toBe(STEPS.RECOVERY);
      });

      it('should go back from PASSWORD to REPEAT', () => {
        const state = { ...INITIAL_REGISTER_STATE, activeTab: STEPS.PASSWORD };
        const action = { type: 'GO_BACK' as const };
        const newState = registerReducer(state, action);
        expect(newState.activeTab).toBe(STEPS.REPEAT);
      });

      it('should go back from BACKUP to PASSWORD', () => {
        const state = { ...INITIAL_REGISTER_STATE, activeTab: STEPS.BACKUP };
        const action = { type: 'GO_BACK' as const };
        const newState = registerReducer(state, action);
        expect(newState.activeTab).toBe(STEPS.PASSWORD);
      });

      it('should not change state for other steps', () => {
        const state = { ...INITIAL_REGISTER_STATE, activeTab: STEPS.ALL_SET };
        const action = { type: 'GO_BACK' as const };
        const newState = registerReducer(state, action);
        expect(newState.activeTab).toBe(STEPS.ALL_SET);
      });
    });
  });
});
