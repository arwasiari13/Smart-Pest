import { ComponentProps, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { DemoRoute } from './DemoNavigator';
import { AdminFarmer } from './AdminDashboard';
import { registerPushToken, listenForNotifications, IncomingNotification } from '../services/pushNotifications';
import { apiRequest } from '../services/api';

type FeatherIconName = ComponentProps<typeof Feather>['name'];
type Severity = 'HIGH' | 'MEDIUM' | 'LOW';

type FarmerAlert = {
  id: string;
  severity: Severity;
  gpsLat: number;
  gpsLng: number;
  createdAt: string;
  title: string;
};

type StatCardProps = {
  icon: FeatherIconName;
  value: string;
  label: string;
  tone: 'red' | 'blue' | 'green';
  compact: boolean;
};

type FarmerDashboardProps = {
  farmer: AdminFarmer;
  onNavigate: (path: DemoRoute) => void;
};

const severityStyles = {
  HIGH: {
    label: 'high',
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
    color: '#b91c1c',
    iconBackground: '#fee2e2',
    iconColor: '#dc2626',
  },
  MEDIUM: {
    label: 'medium',
    backgroundColor: '#ffedd5',
    borderColor: '#fed7aa',
    color: '#c2410c',
    iconBackground: '#ffedd5',
    iconColor: '#ea580c',
  },
  LOW: {
    label: 'low',
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
    color: '#a16207',
    iconBackground: '#fef3c7',
    iconColor: '#ca8a04',
  },
};

const toneStyles = {
  red: { backgroundColor: '#fee2e2', color: '#dc2626' },
  blue: { backgroundColor: '#dbeafe', color: '#2563eb' },
  green: { backgroundColor: '#dcfce7', color: '#16a34a' },
};

function StatCard({ icon, value, label, tone, compact }: StatCardProps) {
  const colors = toneStyles[tone];

  return (
    <View style={[styles.statCard, compact ? styles.statCardCompact : styles.statCardWide]}>
      <View style={[styles.statIcon, { backgroundColor: colors.backgroundColor }]}>
        <Feather name={icon} size={18} color={colors.color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ProfileInfo({ farmer }: { farmer: AdminFarmer }) {
  const statusStyle = farmer.status === 'validated' ? styles.statusValidated : styles.statusPending;

  return (
    <View style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatar}>
          <Feather name="user" size={22} color="#15803d" />
        </View>
        <View style={styles.profileTitleBlock}>
          <Text style={styles.profileName} numberOfLines={1}>
            {farmer.name}
          </Text>
          <Text style={styles.profileMeta} numberOfLines={1}>
            {farmer.email}
          </Text>
        </View>
        <View style={[styles.statusBadge, statusStyle]}>
          <Text style={styles.statusText}>{farmer.status}</Text>
        </View>
      </View>

      <View style={styles.profileDetails}>
        <View style={styles.profileDetail}>
          <Feather name="phone" size={16} color="#6b7280" />
          <Text style={styles.profileDetailText}>{farmer.phone}</Text>
        </View>
        <View style={styles.profileDetail}>
          <Feather name="map-pin" size={16} color="#6b7280" />
          <Text style={styles.profileDetailText}>{farmer.territory}</Text>
        </View>
        <View style={styles.profileDetail}>
          <Feather name="calendar" size={16} color="#6b7280" />
          <Text style={styles.profileDetailText}>Registered {farmer.registeredDate}</Text>
        </View>
      </View>
    </View>
  );
}

function TerritoryMap({ territory }: { territory: string }) {
  return (
    <View style={styles.mapPanel}>
      <View style={styles.panelHeader}>
        <View style={styles.panelTitleRow}>
          <Feather name="map" size={21} color="#16a34a" />
          <Text style={styles.panelTitle}>My Territory</Text>
        </View>
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>Active</Text>
        </View>
      </View>

      <View style={styles.mapCanvas}>
        {[1, 2, 3, 4, 5, 6].map((line) => (
          <View key={`h-${line}`} style={[styles.mapGridHorizontal, { top: `${line * 14.3}%` }]} />
        ))}
        {[1, 2, 3, 4, 5, 6, 7].map((line) => (
          <View key={`v-${line}`} style={[styles.mapGridVertical, { left: `${line * 12.5}%` }]} />
        ))}

        <View style={[styles.pathSegment, styles.pathSegmentOne]} />
        <View style={[styles.pathSegment, styles.pathSegmentTwo]} />
        <View style={[styles.pathSegment, styles.pathSegmentThree]} />

        <View style={styles.mapCenter}>
          <Feather name="map" size={42} color="#15803d" />
          <Text style={styles.mapTitle}>Territory View</Text>
          <Text style={styles.mapSubtitle}>{territory}</Text>
        </View>

        <View style={styles.coverageCard}>
          <Text style={styles.coverageLabel}>Robot Coverage</Text>
          <Text style={styles.coverageValue}>87%</Text>
        </View>

        <View style={styles.robotsBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.robotsText}>2 Robots Active</Text>
        </View>
      </View>
    </View>
  );
}

function AlertRow({ alert }: { alert: FarmerAlert }) {
  const severity = severityStyles[alert.severity] ?? severityStyles.LOW;
  const location = `${alert.gpsLat.toFixed(4)}° N, ${Math.abs(alert.gpsLng).toFixed(4)}° W`;
  const time = new Date(alert.createdAt).toLocaleString();

  return (
    <View style={styles.alertRow}>
      <View style={[styles.alertIcon, { backgroundColor: severity.iconBackground }]}>
        <Feather name="alert-triangle" size={21} color={severity.iconColor} />
      </View>

      <View style={styles.alertTextBlock}>
        <View style={styles.alertTitleRow}>
          <Text style={styles.alertTitle} numberOfLines={1}>
            {alert.title}
          </Text>
          <View style={[styles.severityBadge, { backgroundColor: severity.backgroundColor, borderColor: severity.borderColor }]}>
            <Text style={[styles.severityText, { color: severity.color }]}>{severity.label}</Text>
          </View>
        </View>
        <Text style={styles.alertLocation}>
          <Feather name="map-pin" size={12} color="#6b7280" /> {location}
        </Text>
        <Text style={styles.alertTime}>{time}</Text>
      </View>
    </View>
  );
}

function NotificationBanner({ notif, onDismiss }: { notif: IncomingNotification; onDismiss: () => void }) {
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.notifBanner, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.notifIcon}>
        <Feather name="alert-triangle" size={20} color="#ffffff" />
      </View>
      <View style={styles.notifText}>
        <Text style={styles.notifTitle}>{notif.title}</Text>
        <Text style={styles.notifBody} numberOfLines={2}>{notif.body}</Text>
      </View>
      <Pressable onPress={onDismiss}>
        <Feather name="x" size={18} color="#ffffff" />
      </Pressable>
    </Animated.View>
  );
}

export default function FarmerDashboard({ farmer, onNavigate }: FarmerDashboardProps) {
  const { width } = useWindowDimensions();
  const compactStats = width < 520;
  const [alerts, setAlerts] = useState<FarmerAlert[]>([]);
  const [liveNotif, setLiveNotif] = useState<IncomingNotification | null>(null);

  useEffect(() => {
    // Register push token so FCM can deliver notifications to this device
    registerPushToken().catch(() => {});

    // Load real alerts from backend
    apiRequest<{ alerts: FarmerAlert[] }>('/alerts')
      .then((res) => setAlerts(res.alerts ?? []))
      .catch(() => {});

    // Listen for incoming push notifications while app is open
    const unsub = listenForNotifications((notif) => {
      setLiveNotif(notif);
      // Refresh alert list when new detection arrives
      apiRequest<{ alerts: FarmerAlert[] }>('/alerts')
        .then((res) => setAlerts(res.alerts ?? []))
        .catch(() => {});
    });

    return unsub;
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {liveNotif && (
        <NotificationBanner notif={liveNotif} onDismiss={() => setLiveNotif(null)} />
      )}

      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <View style={styles.logo}>
            <Feather name="wind" size={26} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Farmer Dashboard</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {farmer.name} - Fellah
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Logout"
          onPress={() => onNavigate('/login')}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <Feather name="log-out" size={22} color="#4b5563" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ProfileInfo farmer={farmer} />
        <TerritoryMap territory={farmer.territory} />

        <View style={styles.statsGrid}>
          <StatCard icon="alert-triangle" value={String(alerts.length)} label="Active Alerts" tone="red" compact={compactStats} />
          <StatCard icon="activity" value="Online" label="Robot Status" tone="green" compact={compactStats} />
          <StatCard icon="bell" value={String(alerts.filter(a => a.severity === 'HIGH').length)} label="High Severity" tone="blue" compact={compactStats} />
        </View>

        <View style={styles.alertPanel}>
          <View style={styles.panelHeader}>
            <View style={styles.panelTitleRow}>
              <Feather name="bell" size={21} color="#ef4444" />
              <Text style={styles.panelTitle}>Recent Alerts</Text>
            </View>
          </View>

          <View style={styles.alertList}>
            {alerts.length === 0 ? (
              <View style={styles.emptyAlerts}>
                <Feather name="check-circle" size={32} color="#16a34a" />
                <Text style={styles.emptyAlertsText}>No snails detected — your territory is clear</Text>
              </View>
            ) : (
              alerts.slice(0, 10).map((alert) => (
                <AlertRow key={alert.id} alert={alert} />
              ))
            )}
          </View>
        </View>

        <View style={styles.imagesPanel}>
          <Text style={styles.imagesTitle}>Latest Captured Images</Text>
          <View style={styles.imageGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((image) => (
              <View key={image} style={styles.imageTile}>
                <Feather name="image" size={22} color="#4ade80" />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: 14,
    padding: 16,
    paddingBottom: 96,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  profileMeta: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 3,
  },
  statusBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusValidated: {
    backgroundColor: '#dcfce7',
    borderColor: '#bbf7d0',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
  },
  statusText: {
    color: '#374151',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  profileDetails: {
    borderTopColor: '#f3f4f6',
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
  },
  profileDetail: {
    flexBasis: 170,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: 8,
  },
  profileDetailText: {
    color: '#374151',
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  mapPanel: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  panelHeader: {
    borderBottomColor: '#f3f4f6',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 16,
  },
  panelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  panelTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  activeBadge: {
    backgroundColor: '#dcfce7',
    borderColor: '#bbf7d0',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  activeBadgeText: {
    color: '#15803d',
    fontSize: 12,
    fontWeight: '700',
  },
  mapCanvas: {
    aspectRatio: 16 / 9,
    backgroundColor: '#dcfce7',
    overflow: 'hidden',
    position: 'relative',
  },
  mapGridHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(22, 163, 74, 0.22)',
  },
  mapGridVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(22, 163, 74, 0.22)',
  },
  pathSegment: {
    position: 'absolute',
    height: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(22, 163, 74, 0.65)',
  },
  pathSegmentOne: {
    left: '15%',
    top: '29%',
    width: '24%',
    transform: [{ rotate: '18deg' }],
  },
  pathSegmentTwo: {
    left: '37%',
    top: '44%',
    width: '25%',
    transform: [{ rotate: '-12deg' }],
  },
  pathSegmentThree: {
    left: '58%',
    top: '40%',
    width: '28%',
    transform: [{ rotate: '15deg' }],
  },
  mapCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapTitle: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 7,
  },
  mapSubtitle: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 3,
  },
  coverageCard: {
    position: 'absolute',
    right: 14,
    top: 14,
    backgroundColor: '#ffffff',
    borderRadius: 13,
    paddingHorizontal: 12,
    paddingVertical: 9,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  coverageLabel: {
    color: '#6b7280',
    fontSize: 11,
  },
  coverageValue: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  robotsBadge: {
    position: 'absolute',
    left: 14,
    bottom: 14,
    backgroundColor: '#ffffff',
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22c55e',
  },
  robotsText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    minHeight: 116,
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 16,
    borderWidth: 1,
    padding: 15,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  statCardWide: {
    flex: 1,
  },
  statCardCompact: {
    flexBasis: '30%',
    flexGrow: 1,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    color: '#111827',
    fontSize: 25,
    fontWeight: '800',
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  alertPanel: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  viewAllText: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '700',
  },
  alertList: {
    paddingVertical: 2,
  },
  alertRow: {
    borderBottomColor: '#f3f4f6',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  alertIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  alertTitle: {
    color: '#111827',
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  severityBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'lowercase',
  },
  alertLocation: {
    color: '#6b7280',
    fontSize: 12,
  },
  alertTime: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 3,
  },
  imagesPanel: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  imagesTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageTile: {
    aspectRatio: 1,
    backgroundColor: '#f0fdf4',
    borderColor: '#dcfce7',
    borderRadius: 10,
    borderWidth: 1,
    flexBasis: '22%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
  notifBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  notifIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifText: {
    flex: 1,
  },
  notifTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  notifBody: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  emptyAlerts: {
    alignItems: 'center',
    padding: 28,
    gap: 12,
  },
  emptyAlertsText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
  },
});
