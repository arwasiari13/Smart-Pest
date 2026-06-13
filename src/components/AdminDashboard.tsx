import { ComponentProps, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { DemoRoute } from './DemoNavigator';

export type FarmerStatus = 'pending' | 'validated' | 'rejected';
type FeatherIconName = ComponentProps<typeof Feather>['name'];

export type AdminFarmer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: FarmerStatus;
  territory: string;
  registeredDate: string;
};

type StatTone = 'blue' | 'yellow' | 'green' | 'red';

export const initialAdminFarmers: AdminFarmer[] = [
  {
    id: 1,
    name: 'Mohamed Alami',
    email: 'mohamed.alami@email.com',
    phone: '+212 600 111 222',
    status: 'pending',
    territory: '12.5 hectares',
    registeredDate: '2026-04-20',
  },
  {
    id: 2,
    name: 'Fatima Zahra',
    email: 'fatima.zahra@email.com',
    phone: '+212 600 333 444',
    status: 'validated',
    territory: '8.3 hectares',
    registeredDate: '2026-04-15',
  },
  {
    id: 3,
    name: 'Ahmed Bennani',
    email: 'ahmed.bennani@email.com',
    phone: '+212 600 555 666',
    status: 'validated',
    territory: '15.7 hectares',
    registeredDate: '2026-04-10',
  },
  {
    id: 4,
    name: 'Samira El Amrani',
    email: 'samira.elamrani@email.com',
    phone: '+212 600 777 888',
    status: 'pending',
    territory: '10.2 hectares',
    registeredDate: '2026-04-22',
  },
  {
    id: 5,
    name: 'Youssef Alaoui',
    email: 'youssef.alaoui@email.com',
    phone: '+212 600 999 000',
    status: 'rejected',
    territory: '5.1 hectares',
    registeredDate: '2026-04-18',
  },
];

const statusStyles = {
  pending: {
    label: 'Pending',
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
    color: '#a16207',
  },
  validated: {
    label: 'Validated',
    backgroundColor: '#dcfce7',
    borderColor: '#bbf7d0',
    color: '#15803d',
  },
  rejected: {
    label: 'Rejected',
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
    color: '#b91c1c',
  },
} satisfies Record<FarmerStatus, { label: string; backgroundColor: string; borderColor: string; color: string }>;

const toneStyles = {
  blue: { backgroundColor: '#dbeafe', color: '#2563eb' },
  yellow: { backgroundColor: '#fef3c7', color: '#ca8a04' },
  green: { backgroundColor: '#dcfce7', color: '#16a34a' },
  red: { backgroundColor: '#fee2e2', color: '#dc2626' },
} satisfies Record<StatTone, { backgroundColor: string; color: string }>;

function StatusBadge({ status }: { status: FarmerStatus }) {
  const badge = statusStyles[status];

  return (
    <View style={[styles.statusBadge, { backgroundColor: badge.backgroundColor, borderColor: badge.borderColor }]}>
      <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
  compact,
}: {
  icon: FeatherIconName;
  label: string;
  value: number;
  tone: StatTone;
  compact: boolean;
}) {
  const toneStyle = toneStyles[tone];

  return (
    <View style={[styles.statCard, compact ? styles.halfCard : styles.quarterCard]}>
      <View style={[styles.statIcon, { backgroundColor: toneStyle.backgroundColor }]}>
        <Feather name={icon} size={18} color={toneStyle.color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickNavCard({
  icon,
  title,
  subtitle,
  tone,
  onPress,
}: {
  icon: FeatherIconName;
  title: string;
  subtitle: string;
  tone: 'orange' | 'teal';
  onPress: () => void;
}) {
  const color = tone === 'orange' ? '#ea580c' : '#0d9488';
  const backgroundColor = tone === 'orange' ? '#ffedd5' : '#ccfbf1';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.quickCard, pressed && styles.pressedCard]}
    >
      <View style={[styles.quickIcon, { backgroundColor }]}>
        <Feather name={icon} size={22} color={color} />
      </View>
      <Text style={styles.quickTitle}>{title}</Text>
      <View style={styles.quickMeta}>
        <Text style={styles.quickSubtitle}>{subtitle}</Text>
        <Feather name="chevron-right" size={14} color="#9ca3af" />
      </View>
    </Pressable>
  );
}

function FarmerCard({
  farmer,
  onNavigate,
}: {
  farmer: AdminFarmer;
  onNavigate: (path: DemoRoute) => void;
}) {
  return (
    <View style={styles.farmerCard}>
      <View style={styles.farmerHeader}>
        <View style={styles.farmerIdentity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{farmer.name.charAt(0)}</Text>
          </View>
          <View style={styles.farmerTextBlock}>
            <Text style={styles.farmerName}>{farmer.name}</Text>
            <Text numberOfLines={1} style={styles.farmerEmail}>
              {farmer.email}
            </Text>
          </View>
        </View>
        <StatusBadge status={farmer.status} />
      </View>

      <View style={styles.farmerMeta}>
        <Text style={styles.metaText}>{farmer.territory}</Text>
        <Text style={styles.metaDot}>.</Text>
        <Text style={styles.metaText}>{farmer.registeredDate}</Text>
      </View>

      <View style={styles.actionRow}>
        {farmer.status === 'pending' ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => onNavigate('/admin/validate/1')}
            style={({ pressed }) => [styles.actionButton, styles.validateButton, pressed && styles.pressedButton]}
          >
            <Feather name="check-circle" size={15} color="#ffffff" />
            <Text style={styles.validateButtonText}>Validate</Text>
          </Pressable>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={() => Alert.alert('Edit farmer', `${farmer.name} is ready to edit.`)}
          style={({ pressed }) => [styles.actionButton, styles.editButton, pressed && styles.pressedButton]}
        >
          <Feather name="edit-2" size={15} color="#1d4ed8" />
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => Alert.alert('Delete farmer', `${farmer.name} is ready to delete.`)}
          style={({ pressed }) => [styles.actionButton, styles.deleteButton, pressed && styles.pressedButton]}
        >
          <Feather name="trash-2" size={15} color="#b91c1c" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function AdminDashboard({
  farmers = initialAdminFarmers,
  onNavigate,
}: {
  farmers?: AdminFarmer[];
  onNavigate: (path: DemoRoute) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const { width } = useWindowDimensions();
  const compactStats = width < 720;

  const filteredFarmers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return farmers;
    }

    return farmers.filter(
      (farmer) =>
        farmer.name.toLowerCase().includes(query) ||
        farmer.email.toLowerCase().includes(query) ||
        farmer.phone.toLowerCase().includes(query),
    );
  }, [farmers, searchQuery]);

  const stats = useMemo(
    () => ({
      total: farmers.length,
      pending: farmers.filter((farmer) => farmer.status === 'pending').length,
      validated: farmers.filter((farmer) => farmer.status === 'validated').length,
      rejected: farmers.filter((farmer) => farmer.status === 'rejected').length,
    }),
    [farmers],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <View style={styles.logo}>
            <Feather name="wind" size={26} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>System Administrator</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Logout"
          onPress={() => onNavigate('/login')}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressedButton]}
        >
          <Feather name="log-out" size={22} color="#4b5563" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsGrid}>
          <StatCard icon="users" label="Total Farmers" value={stats.total} tone="blue" compact={compactStats} />
          <StatCard icon="clock" label="Pending" value={stats.pending} tone="yellow" compact={compactStats} />
          <StatCard icon="check-circle" label="Validated" value={stats.validated} tone="green" compact={compactStats} />
          <StatCard icon="x-circle" label="Rejected" value={stats.rejected} tone="red" compact={compactStats} />
        </View>

        <View style={styles.quickGrid}>
          <QuickNavCard
            icon="cpu"
            title="Robot Monitoring"
            subtitle="5 robots"
            tone="orange"
            onPress={() => onNavigate('/admin/robots')}
          />
          <QuickNavCard
            icon="droplet"
            title="Pesticides"
            subtitle="6 products"
            tone="teal"
            onPress={() => onNavigate('/admin/pesticides')}
          />
        </View>

        <View style={styles.listPanel}>
          <View style={styles.panelHeader}>
            <View style={styles.panelTitleRow}>
              <Feather name="users" size={22} color="#2563eb" />
              <Text style={styles.panelTitle}>Farmer Accounts</Text>
            </View>
          </View>

          <View style={styles.searchWrap}>
            <Feather name="search" size={21} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search farmers..."
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              style={styles.searchInput}
            />
          </View>

          <View style={styles.farmersList}>
            {filteredFarmers.map((farmer) => (
              <FarmerCard key={farmer.id} farmer={farmer} onNavigate={onNavigate} />
            ))}

            {filteredFarmers.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No farmers found</Text>
                <Text style={styles.emptyText}>Try another name, email, or phone number.</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomTabs}>
        <Pressable accessibilityRole="button" style={styles.tabButton}>
          <Feather name="grid" size={21} color="#16a34a" />
          <Text style={[styles.tabText, styles.activeTabText]}>Dashboard</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => onNavigate('/admin/robots')}
          style={({ pressed }) => [styles.tabButton, pressed && styles.pressedButton]}
        >
          <Feather name="cpu" size={21} color="#6b7280" />
          <Text style={styles.tabText}>Robots</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => onNavigate('/admin/pesticides')}
          style={({ pressed }) => [styles.tabButton, pressed && styles.pressedButton]}
        >
          <Feather name="droplet" size={21} color="#6b7280" />
          <Text style={styles.tabText}>Pesticides</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => onNavigate('/login')}
          style={({ pressed }) => [styles.tabButton, pressed && styles.pressedButton]}
        >
          <Feather name="log-out" size={21} color="#6b7280" />
          <Text style={styles.tabText}>Logout</Text>
        </Pressable>
      </View>
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
    fontWeight: '600',
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
    padding: 16,
    paddingBottom: 104,
    gap: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    minHeight: 120,
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  halfCard: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  quarterCard: {
    flexBasis: '22%',
    flexGrow: 1,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    color: '#111827',
    fontSize: 26,
    fontWeight: '600',
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickCard: {
    flex: 1,
    minHeight: 136,
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  quickMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 2,
  },
  quickSubtitle: {
    color: '#6b7280',
    fontSize: 12,
  },
  listPanel: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  panelHeader: {
    borderBottomColor: '#f3f4f6',
    borderBottomWidth: 1,
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
    fontWeight: '600',
  },
  searchWrap: {
    margin: 16,
    marginBottom: 0,
    position: 'relative',
  },
  searchIcon: {
    left: 14,
    position: 'absolute',
    top: 12,
    zIndex: 1,
  },
  searchInput: {
    minHeight: 46,
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 14,
    borderWidth: 1,
    color: '#111827',
    fontSize: 15,
    paddingLeft: 44,
    paddingRight: 14,
  },
  farmersList: {
    paddingTop: 8,
  },
  farmerCard: {
    borderBottomColor: '#f3f4f6',
    borderBottomWidth: 1,
    padding: 16,
  },
  farmerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  farmerIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  farmerTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  farmerName: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },
  farmerEmail: {
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
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  farmerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 9,
    paddingLeft: 54,
  },
  metaText: {
    color: '#6b7280',
    fontSize: 12,
  },
  metaDot: {
    color: '#9ca3af',
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 8,
  },
  validateButton: {
    backgroundColor: '#16a34a',
  },
  validateButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  editButton: {
    backgroundColor: '#eff6ff',
  },
  editButtonText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
  },
  deleteButtonText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  emptyTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 13,
    marginTop: 5,
    textAlign: 'center',
  },
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
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabText: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#16a34a',
  },
  pressedCard: {
    borderColor: '#86efac',
    transform: [{ scale: 0.99 }],
  },
  pressedButton: {
    opacity: 0.72,
  },
});
