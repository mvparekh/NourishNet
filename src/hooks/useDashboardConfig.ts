import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { UserDashboardConfig, NotificationPreferences } from '../types/dashboard';
import {
  getDefaultDashboardConfig,
  DEFAULT_NOTIFICATION_PREFERENCES,
  getAvailableWidgetsForUser,
} from '../services/dashboardConfig';

const STORAGE_PREFIX = 'nourishnet_dashboard_config_';
const NOTIF_PREFIX = 'nourishnet_notif_prefs_';

export function useDashboardConfig(currentUser: User | null) {
  const [config, setConfig] = useState<UserDashboardConfig>(() => {
    if (!currentUser) {
      return {
        visibleWidgets: [],
        widgetOrder: [],
        collapsedWidgets: {},
        focusMode: false,
        hasCompletedFocusOnboarding: false,
        dismissedTips: {},
      };
    }

    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${currentUser.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure no newly added valid widgets are missing from available list
        const available = getAvailableWidgetsForUser(currentUser).map((w) => w.id);
        const mergedOrder = [
          ...(parsed.widgetOrder || []).filter((id: string) => available.includes(id)),
          ...available.filter((id) => !(parsed.widgetOrder || []).includes(id)),
        ];
        return {
          ...parsed,
          widgetOrder: mergedOrder,
        };
      }
    } catch (e) {
      console.error('Failed to load dashboard config from storage', e);
    }

    return getDefaultDashboardConfig(currentUser);
  });

  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>(() => {
    if (!currentUser) return DEFAULT_NOTIFICATION_PREFERENCES;
    try {
      const stored = localStorage.getItem(`${NOTIF_PREFIX}${currentUser.id}`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load notif prefs', e);
    }
    return DEFAULT_NOTIFICATION_PREFERENCES;
  });

  // Reload when currentUser changes
  useEffect(() => {
    if (!currentUser) return;
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${currentUser.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        const available = getAvailableWidgetsForUser(currentUser).map((w) => w.id);
        const mergedOrder = [
          ...(parsed.widgetOrder || []).filter((id: string) => available.includes(id)),
          ...available.filter((id) => !(parsed.widgetOrder || []).includes(id)),
        ];
        setConfig({
          ...parsed,
          widgetOrder: mergedOrder,
        });
      } else {
        setConfig(getDefaultDashboardConfig(currentUser));
      }
    } catch (e) {
      setConfig(getDefaultDashboardConfig(currentUser));
    }
  }, [currentUser?.id, currentUser?.role]);

  const saveConfig = useCallback(
    (newConfig: UserDashboardConfig) => {
      if (!currentUser) return;
      setConfig(newConfig);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${currentUser.id}`, JSON.stringify(newConfig));
      } catch (e) {
        console.error('Failed to save dashboard config', e);
      }
    },
    [currentUser]
  );

  const saveNotificationPreferences = useCallback(
    (newPrefs: NotificationPreferences) => {
      if (!currentUser) return;
      setNotifPrefs(newPrefs);
      try {
        localStorage.setItem(`${NOTIF_PREFIX}${currentUser.id}`, JSON.stringify(newPrefs));
      } catch (e) {
        console.error('Failed to save notif prefs', e);
      }
    },
    [currentUser]
  );

  const toggleCollapse = useCallback(
    (widgetId: string) => {
      setConfig((prev) => {
        const updated = {
          ...prev,
          collapsedWidgets: {
            ...prev.collapsedWidgets,
            [widgetId]: !prev.collapsedWidgets[widgetId],
          },
        };
        if (currentUser) {
          localStorage.setItem(`${STORAGE_PREFIX}${currentUser.id}`, JSON.stringify(updated));
        }
        return updated;
      });
    },
    [currentUser]
  );

  const toggleFocusMode = useCallback(() => {
    setConfig((prev) => {
      const updated = {
        ...prev,
        focusMode: !prev.focusMode,
      };
      if (currentUser) {
        localStorage.setItem(`${STORAGE_PREFIX}${currentUser.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  }, [currentUser]);

  const applyPreset = useCallback(
    (recommendedWidgets: string[], presetLabel: string) => {
      if (!currentUser) return;
      const updated: UserDashboardConfig = {
        ...config,
        visibleWidgets: recommendedWidgets,
        focusPreset: presetLabel,
        hasCompletedFocusOnboarding: true,
      };
      saveConfig(updated);
    },
    [config, currentUser, saveConfig]
  );

  const resetToDefault = useCallback(() => {
    if (!currentUser) return;
    const defaultConf = getDefaultDashboardConfig(currentUser);
    saveConfig(defaultConf);
  }, [currentUser, saveConfig]);

  return {
    config,
    saveConfig,
    notifPrefs,
    saveNotificationPreferences,
    toggleCollapse,
    toggleFocusMode,
    applyPreset,
    resetToDefault,
  };
}
