import { UserRole, AdminPermissions } from './index';

export type WidgetLevel = 1 | 2 | 3 | 4;

export type WidgetCategory = 'ACTION' | 'OPERATIONAL' | 'INFO' | 'ANALYTICS';

export interface WidgetDefinition {
  id: string;
  title: string;
  subtitle: string;
  level: WidgetLevel; // 1: Action, 2: Operational Context, 3: Information, 4: Analytics
  roles: UserRole[];
  requiredPermission?: keyof AdminPermissions;
  explanation: string;
  whyAmISeeingThis: string;
  defaultVisible: boolean;
  category: WidgetCategory;
  badge?: string;
}

export interface UserDashboardConfig {
  visibleWidgets: string[];
  widgetOrder: string[];
  collapsedWidgets: Record<string, boolean>;
  focusMode: boolean;
  focusPreset?: string;
  hasCompletedFocusOnboarding: boolean;
  dismissedTips: Record<string, boolean>;
}

export interface NotificationPreferences {
  pickupStartingSoon: boolean;
  assignmentReceived: boolean;
  listingReserved: boolean;
  listingExpiringSoon: boolean;
  verificationCompleted: boolean;
  incidentReported: boolean;
  weeklyImpactSummary: boolean;
}

export interface AttentionItem {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  actionLabel?: string;
  actionType?: 'VIEW_PICKUP' | 'ASSIGN_COURIER' | 'VERIFY_QR' | 'REVIEW_APP' | 'RESOLVE_ISSUE' | 'LIST_SURPLUS' | 'VIEW_MATCHES' | 'VIEW_QR';
  targetId?: string;
  deadlineMinutes?: number;
}
