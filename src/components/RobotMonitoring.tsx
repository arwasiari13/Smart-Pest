import { ComponentProps, useMemo } from 'react';
import {
  Alert,
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

type RobotStatus = 'active' | 'inactive' | 'maintenance';
type FeatherIconName = ComponentProps<typeof Feather>['name'];

type Robot = {
  id: number;
  name: string;
  status: RobotStatus;
  battery: number;
  location: string;
  territory: string;
  trajectory: string;
  lastUpdate: string;
  imagesCapture: number;
  alertsGenerated: number;
};

type RobotMonitoringProps = {
  onNavigate: (path: DemoRoute) => void;
};

type StatCardProps = {
  icon: FeatherIconName;
  value: number;
  label: string;
  tone: 'blue' | 'green' | 'gray' | 'orange';
  compact: boolean;
};

const robots: Robot[] = [
  {
    id: 1,
    name: 'Robot-Alpha-01',
    status: 'active',
    battery: 87,
    location: '33.5731° N, 7.5898° W',
    territory: 'Mohamed Alami - Zone A',
    trajectory: 'Route-A1',
    lastUpdate: '2 mins ago',
    imagesCapture: 156,
    alertsGenerated: 8,
  },
  {
    id: 2,
    name: 'Robot-Alpha-02',
    status: 'active',
    battery: 92,
    location: '33.5745° N, 7.5902° W',
    territory: 'Mohamed Alami - Zone B',
    trajectory: 'Route-A2',
    lastUpdate: '1 min ago',
    imagesCapture: 143,
    alertsGenerated: 5,
  },
  {
    id: 3,
    name: 'Robot-Beta-01',
    status: 'inactive',
    battery: 15,
    location: '33.5722° N, 7.5885° W',
    territory: 'Fatima Zahra - Zone A',
    trajectory: 'Route-B1',
    lastUpdate: '45 mins ago',
    imagesCapture: 89,
    alertsGenerated: 3,
  },
  {
    id: 4,
    name: 'Robot-Beta-02',
    status: 'maintenance',
    battery: 0,
    location: 'Service Center',
    territory: 'Not Assigned',
    trajectory: 'N/A',
    lastUpdate: '2 hours ago',
    imagesCapture: 0,
    alertsGenerated: 0,
  },
  {
    id: 5,
    name: 'Robot-Gamma-01',
    status: 'active',
    battery: 68,
    location: '33.5738° N, 7.5891° W',
    territory: 'Ahmed Bennani - Zone A',
    trajectory: 'Route-C1',
    lastUpdate: '5 mins ago',
    imagesCapture: 201,
    alertsGenerated: 12,
  },
];

const statusStyles = {
  active: {
    label: 'Active',
    icon: 'activity' as const,
    color: '#15803d',
    backgroundColor: '#dcfce7',
    borderColor: '#bbf7d0',
  },
  inactive: {
    label: 'Inactive',
    icon: 'alert-circle' as const,
    color: '#374151',
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  maintenance: {
    label: 'Maintenance',
    icon: 'tool' as const,
    color: '#c2410c',
    backgroundColor: '#ffedd5',
    borderColor: '#fed7aa',
  },
};

const toneStyles = {
  blue: { backgroundColor: '#dbeafe', color: '#2563eb' },
  green: { backgroundColor: '#dcfce7', color: '#16a34a' },
  gray: { backgroundColor: '#f3f4f6', color: '#4b5563' },
  orange: { backgroundColor: '#ffedd5', color: '#ea580c' },
};

function getBatteryColor(battery: number) {
  if (battery >= 60) return '#16a34a';
  if (battery >= 30) return '#ea580c';
  return '#dc2626';
}

function StatCard({ icon, value, label, tone, compact }: StatCardProps) {
  const colors = toneStyles[tone];

  return (
    <View style={[styles.statCard, compact ? styles.statCardHalf : styles.statCardQuarter]}>
      <View style={[styles.statIcon, { backgroundColor: colors.backgroundColor }]}>
        <Feather name={icon} size={21} color={colors.color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function StatusBadge({ status }: { status: RobotStatus }) {
  const statusStyle = statusStyles[status];

  return (
    <View
      style={[
        styles.statusBadge,
        { backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor },
      ]}
    >
      <Feather name={statusStyle.icon} size={13} color={statusStyle.color} />
      <Text style={[styles.statusText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
    </View>
  );
}

function RobotInfo({
  icon,
  label,
  value,
}: {
  icon: FeatherIconName;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.robotInfo}>
      <Feather name={icon} size={17} color="#9ca3af" />
      <View style={styles.robotInfoText}>
        <Text style={styles.robotInfoLabel}>{label}</Text>
        <Text style={styles.robotInfoValue}>{value}</Text>
      </View>
    </View>
  );
}

function RobotCard({ robot }: { robot: Robot }) {
  const status = statusStyles[robot.status];
  const batteryColor = getBatteryColor(robot.battery);

  return (
    <View style={styles.robotCard}>
      <View style={styles.robotHeader}>
        <View style={styles.robotIdentity}>
          <View style={[styles.robotIcon, { backgroundColor: status.backgroundColor }]}>
            <Feather name="cpu" size={26} color={status.color} />
          </View>
          <View style={styles.robotTitleBlock}>
            <Text style={styles.robotName}>{robot.name}</Text>
            <Text style={styles.robotTerritory}>{robot.territory}</Text>
          </View>
        </View>
        <StatusBadge status={robot.status} />
      </View>

      <View style={styles.robotInfoGrid}>
        <RobotInfo icon="map-pin" label="Location" value={robot.location} />
        <RobotInfo icon="navigation" label="Trajectory" value={robot.trajectory} />
      </View>

      <View style={styles.metricsBox}>
        <View style={styles.batteryLine}>
          <View style={styles.batteryLabelWrap}>
            <Feather name="battery" size={17} color={batteryColor} />
            <Text style={styles.metricLabel}>Battery</Text>
          </View>
          <Text style={[styles.batteryValue, { color: batteryColor }]}>{robot.battery}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${robot.battery}%`, backgroundColor: batteryColor }]} />
        </View>

        <View style={styles.metricGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Images</Text>
            <Text style={styles.metricValue}>{robot.imagesCapture}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Alerts</Text>
            <Text style={styles.metricValue}>{robot.alertsGenerated}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Updated</Text>
            <Text style={styles.metricValue}>{robot.lastUpdate}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => Alert.alert('Robot Details', `${robot.name} details are ready to connect.`)}
          style={({ pressed }) => [styles.detailsButton, pressed && styles.pressed]}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => Alert.alert('Edit Route', `${robot.trajectory} route editor is ready to connect.`)}
          style={({ pressed }) => [styles.routeButton, pressed && styles.pressed]}
        >
          <Text style={styles.routeButtonText}>Edit Route</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function RobotMonitoring({ onNavigate }: RobotMonitoringProps) {
  const { width } = useWindowDimensions();
  const compactStats = width < 720;
  const stats = useMemo(
    () => ({
      total: robots.length,
      active: robots.filter((robot) => robot.status === 'active').length,
      inactive: robots.filter((robot) => robot.status === 'inactive').length,
      maintenance: robots.filter((robot) => robot.status === 'maintenance').length,
    }),
    [],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to admin dashboard"
          onPress={() => onNavigate('/admin/dashboard')}
          style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
        >
          <Feather name="arrow-left" size={22} color="#4b5563" />
        </Pressable>
        <Text style={styles.headerTitle}>Robot Monitoring</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <StatCard icon="cpu" value={stats.total} label="Total Robots" tone="blue" compact={compactStats} />
          <StatCard icon="check-circle" value={stats.active} label="Active" tone="green" compact={compactStats} />
          <StatCard icon="alert-circle" value={stats.inactive} label="Inactive" tone="gray" compact={compactStats} />
          <StatCard icon="tool" value={stats.maintenance} label="Maintenance" tone="orange" compact={compactStats} />
        </View>

        <View style={styles.listPanel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>All Robots</Text>
          </View>
          <View style={styles.robotList}>
            {robots.map((robot) => (
              <RobotCard key={robot.id} robot={robot} />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomTabs}>
        <Pressable
          accessibilityRole="button"
          onPress={() => onNavigate('/admin/dashboard')}
          style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}
        >
          <Feather name="grid" size={21} color="#6b7280" />
          <Text style={styles.tabText}>Dashboard</Text>
        </Pressable>
        <Pressable accessibilityRole="button" style={styles.tabButton}>
          <Feather name="cpu" size={21} color="#ea580c" />
          <Text style={[styles.tabText, styles.activeTabText]}>Robots</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => onNavigate('/admin/pesticides')}
          style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}
        >
          <Feather name="droplet" size={21} color="#6b7280" />
          <Text style={styles.tabText}>Pesticides</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => onNavigate('/login')}
          style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}
        >
          <Feather name="log-out" size={21} color="#6b7280" />
          <Text style={styles.tabText}>Logout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    minHeight: 64,
    backgroundColor: '#ffffff',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#111827', fontSize: 18, fontWeight: '800' },
  content: { gap: 14, padding: 16, paddingBottom: 104 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    minHeight: 112,
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
  statCardHalf: { flexBasis: '47%', flexGrow: 1 },
  statCardQuarter: { flexBasis: '22%', flexGrow: 1 },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },
  statValue: { color: '#111827', fontSize: 26, fontWeight: '800' },
  statLabel: { color: '#6b7280', fontSize: 12, marginTop: 3 },
  listPanel: {
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
  panelHeader: { borderBottomColor: '#e5e7eb', borderBottomWidth: 1, padding: 16 },
  panelTitle: { color: '#111827', fontSize: 15, fontWeight: '800' },
  robotList: { paddingVertical: 2 },
  robotCard: { borderBottomColor: '#e5e7eb', borderBottomWidth: 1, padding: 16 },
  robotHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
  },
  robotIdentity: { flex: 1, minWidth: 0, flexDirection: 'row', gap: 12 },
  robotIcon: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  robotTitleBlock: { flex: 1, minWidth: 0 },
  robotName: { color: '#111827', fontSize: 15, fontWeight: '800', marginBottom: 4 },
  robotTerritory: { color: '#6b7280', fontSize: 12 },
  statusBadge: {
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: { fontSize: 12, fontWeight: '800' },
  robotInfoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 13 },
  robotInfo: { flexBasis: '46%', flexGrow: 1, flexDirection: 'row', gap: 8 },
  robotInfoText: { flex: 1, minWidth: 0 },
  robotInfoLabel: { color: '#6b7280', fontSize: 12, marginBottom: 2 },
  robotInfoValue: { color: '#111827', fontSize: 12, fontWeight: '700' },
  metricsBox: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, gap: 8 },
  batteryLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  batteryLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  metricLabel: { color: '#6b7280', fontSize: 12 },
  batteryValue: { fontSize: 14, fontWeight: '800' },
  progressTrack: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 999 },
  metricGrid: {
    borderTopColor: '#e5e7eb',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
  },
  metricItem: { flex: 1 },
  metricValue: { color: '#111827', fontSize: 14, fontWeight: '800', marginTop: 3 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  detailsButton: {
    flex: 1,
    minHeight: 42,
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsButtonText: { color: '#1d4ed8', fontSize: 13, fontWeight: '800' },
  routeButton: {
    flex: 1,
    minHeight: 42,
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeButtonText: { color: '#15803d', fontSize: 13, fontWeight: '800' },
  bottomTabs: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 74,
    backgroundColor: '#ffffff',
    borderTopColor: '#e5e7eb',
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabButton: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  tabText: { color: '#6b7280', fontSize: 11, fontWeight: '700' },
  activeTabText: { color: '#ea580c' },
  pressed: { opacity: 0.72 },
});
