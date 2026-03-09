/**
 * Expo Notifications setup for StockPulse.
 * - Requests notification permission on app startup
 * - Sets handler so notifications show when app is in foreground
 * - Android: creates default channel (required for Android 13+)
 * - Registers background task for headless notifications (expo-task-manager)
 * @see https://docs.expo.dev/versions/latest/sdk/notifications/
 */

import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

const DEFAULT_CHANNEL_ID = 'default';
export const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

/**
 * How to present notifications when app is in foreground.
 * Call this before requesting permissions.
 */
export function setNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Create Android default notification channel. Required on Android 13+
 * before getPermissionsAsync/requestPermissionsAsync so the prompt can appear.
 */
export async function setupAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
    name: 'Default',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2196F3',
  });
}

/**
 * Whether the user has effectively granted notification permission.
 * On iOS use ios.status (AUTHORIZED or PROVISIONAL = granted); on Android use root status.
 */
function isGranted(result: Notifications.NotificationPermissionsStatus): boolean {
  if (Platform.OS === 'ios' && result.ios?.status != null) {
    return (
      result.ios.status === Notifications.IosAuthorizationStatus.AUTHORIZED ||
      result.ios.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    );
  }
  return result.status === Notifications.PermissionStatus.GRANTED;
}

/**
 * Whether we should show the permission dialog (user not yet asked).
 * On iOS use ios.status === NOT_DETERMINED; on Android use root status === UNDETERMINED.
 */
function isUndetermined(result: Notifications.NotificationPermissionsStatus): boolean {
  if (Platform.OS === 'ios' && result.ios?.status != null) {
    return result.ios.status === Notifications.IosAuthorizationStatus.NOT_DETERMINED;
  }
  return result.status === Notifications.PermissionStatus.UNDETERMINED;
}

/**
 * Request notification permissions. Call once on app startup.
 * Only shows the system dialog the first time (when status is undetermined).
 * On Android 13+ a channel must exist first (use setupAndroidChannel).
 * On iOS, uses ios.status for accurate authorization state per Expo docs.
 */
export async function requestNotificationPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
  await setupAndroidChannel();

  if (!Device.isDevice) {
    return {
      status: Notifications.PermissionStatus.UNDETERMINED,
      expires: 'never',
      canAskAgain: true,
      granted: false,
    };
  }

  const existing = await Notifications.getPermissionsAsync();

  // Only request (show dialog) when user has not been asked yet (first time)
  if (!isUndetermined(existing)) {
    return { ...existing, granted: isGranted(existing) };
  }

  const result = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });

  return { ...result, granted: isGranted(result) };
}

/**
 * Run once on app load to register the background notification task.
 * Must be called from a module that loads early (e.g. before RootProvider).
 */
export function registerBackgroundNotificationTask(): void {
  TaskManager.defineTask<
    Notifications.NotificationTaskPayload
  >(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
    if (error) {
      return;
    }
    // Handle notification data when app is in background/terminated.
    // data.dataString contains the payload as JSON string when present.
    const payload = data as { dataString?: string; notification?: unknown };
    if (payload?.dataString) {
      try {
        const parsed = JSON.parse(payload.dataString) as Record<string, unknown>;
        // Optional: sync state, update badge, etc.
        if (__DEV__) {
          console.log('[Notifications] Background payload:', parsed);
        }
      } catch {
        // ignore
      }
    }
    // iOS: return Notifications.BackgroundNotificationResult.NoData for background fetch
  });

  Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
}

/**
 * Schedule a local notification (e.g. for price alerts).
 * Uses the default channel on Android.
 */
export async function scheduleLocalNotification(
  content: Notifications.NotificationContentInput,
  trigger: Notifications.NotificationTriggerInput = null
): Promise<string> {
  const payload = {
    content: Platform.OS === 'android' ? { ...content, channelId: DEFAULT_CHANNEL_ID } : content,
    trigger,
  };
  return Notifications.scheduleNotificationAsync(payload);
}

/**
 * Cancel a scheduled notification by identifier.
 */
export async function cancelScheduledNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

// Run once when this module is first imported (early in app lifecycle)
setNotificationHandler();
registerBackgroundNotificationTask();
