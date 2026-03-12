import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useInAppNotifications } from '@/context/in-app-notifications.context';

type DataPayload = { variant?: string; [key: string]: unknown };

/**
 * Subscribes to Expo notification received events (foreground). When a notification
 * is received, shows the matching in-app toast (snackbar or banner) based on
 * content.data.variant. Defaults to banner for price alerts.
 */
export function NotificationsForegroundListener() {
  const { showSnackbar, showBanner } = useInAppNotifications();

  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      const content = notification.request.content;
      const title = content.title ?? 'Notification';
      const message = content.body ?? '';
      const data = (content.data as DataPayload) ?? {};
      const variant = typeof data.variant === 'string' ? data.variant.toLowerCase() : 'banner';

      if (variant === 'snackbar') {
        showSnackbar({ title, message, icon: 'check' });
      } else {
        showBanner({ title, message, icon: 'bell' });
      }
    });

    return () => sub.remove();
  }, [showSnackbar, showBanner]);

  return null;
}
