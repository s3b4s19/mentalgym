/**
 * Device feedback and screen wake lock.
 * Every capability is feature-detected and fails silently: the app must keep
 * working on a device that exposes neither API.
 */

let sentinel = null;
let wanted = false;

const canVibrate = () => typeof navigator !== 'undefined' && 'vibrate' in navigator;

export const haptic = {
  get supported() {
    return canVibrate();
  },

  confirm(enabled) {
    if (!enabled || !canVibrate()) return;
    try {
      navigator.vibrate([50]);
    } catch (error) {
      /* Vibration can be blocked by policy; ignore. */
    }
  },

  timeout(enabled) {
    if (!enabled || !canVibrate()) return;
    try {
      navigator.vibrate([100, 50, 100]);
    } catch (error) {
      /* Ignore. */
    }
  },
};

export const screenLock = {
  get supported() {
    return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  },

  async hold() {
    if (!this.supported) return false;
    wanted = true;
    try {
      sentinel = await navigator.wakeLock.request('screen');
      sentinel.addEventListener('release', () => {
        sentinel = null;
      });
      return true;
    } catch (error) {
      sentinel = null;
      return false;
    }
  },

  async reacquire() {
    if (!wanted || sentinel) return;
    if (document.visibilityState !== 'visible') return;
    await this.hold();
  },

  release() {
    wanted = false;
    if (!sentinel) return;
    try {
      sentinel.release();
    } catch (error) {
      /* Ignore. */
    }
    sentinel = null;
  },
};

document.addEventListener('visibilitychange', () => {
  screenLock.reacquire();
});
