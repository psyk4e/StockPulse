import { create } from 'zustand';
import { storage } from '@/config/plugins/mmkv.plugin';

const FACE_ID_ENABLED_KEY = 'security_face_id_enabled';
const PASSCODE_KEY = 'security_passcode';

function getStoredFaceIdEnabled(): boolean {
  try {
    return storage.getString(FACE_ID_ENABLED_KEY) === 'true';
  } catch {
    return false;
  }
}

function getStoredPasscode(): string | null {
  try {
    return storage.getString(PASSCODE_KEY) ?? null;
  } catch {
    return null;
  }
}

export interface SecurityState {
  faceIdEnabled: boolean;
  passcode: string | null;
  isLocked: boolean;

  setFaceIdEnabled: (enabled: boolean) => void;
  setPasscode: (code: string | null) => void;
  lock: () => void;
  unlock: () => void;
  hasPasscode: () => boolean;
  isSecurityEnabled: () => boolean;
  clear: () => void;
}

export const useSecurityStore = create<SecurityState>((set, get) => ({
  faceIdEnabled: getStoredFaceIdEnabled(),
  passcode: getStoredPasscode(),
  isLocked: getStoredFaceIdEnabled() || getStoredPasscode() != null,

  setFaceIdEnabled: (enabled) => {
    storage.set(FACE_ID_ENABLED_KEY, String(enabled));
    set({ faceIdEnabled: enabled });
  },

  setPasscode: (code) => {
    if (code) {
      storage.set(PASSCODE_KEY, code);
    } else {
      storage.set(PASSCODE_KEY, '');
    }
    set({ passcode: code });
  },

  lock: () => set({ isLocked: true }),

  unlock: () => set({ isLocked: false }),

  hasPasscode: () => {
    const p = get().passcode;
    return p != null && p.length === 4;
  },

  isSecurityEnabled: () => {
    const state = get();
    return state.faceIdEnabled || (state.passcode != null && state.passcode.length === 4);
  },

  clear: () => {
    storage.set(FACE_ID_ENABLED_KEY, 'false');
    storage.set(PASSCODE_KEY, '');
    set({ faceIdEnabled: false, passcode: null, isLocked: false });
  },
}));
