import { ComponentProps, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { DemoRoute } from './DemoNavigator';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

type InfoRowProps = {
  icon: FeatherIconName;
  tone: 'blue' | 'green' | 'purple' | 'orange';
  label: string;
  value: string;
};

type FarmerValidationProps = {
  onNavigate: (path: DemoRoute) => void;
};

const farmer = {
  id: '1',
  name: 'Mohamed Alami',
  email: 'mohamed.alami@email.com',
  phone: '+212 600 111 222',
  territory: '12.5 hectares',
  registeredDate: '2026-04-20',
  location: '33.5731° N, 7.5898° W',
};

const toneStyles = {
  blue: { backgroundColor: '#dbeafe', color: '#2563eb' },
  green: { backgroundColor: '#dcfce7', color: '#16a34a' },
  purple: { backgroundColor: '#f3e8ff', color: '#9333ea' },
  orange: { backgroundColor: '#ffedd5', color: '#ea580c' },
};

function InfoRow({ icon, tone, label, value }: InfoRowProps) {
  const colors = toneStyles[tone];

  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: colors.backgroundColor }]}>
        <Feather name={icon} size={21} color={colors.color} />
      </View>
      <View style={styles.infoTextBlock}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function SummaryLine({ label, complete }: { label: string; complete: boolean }) {
  return (
    <View style={styles.summaryLine}>
      <Text style={styles.summaryText}>{label}</Text>
      <Feather name={complete ? 'check-circle' : 'x-circle'} size={21} color={complete ? '#16a34a' : '#9ca3af'} />
    </View>
  );
}

export default function FarmerValidation({ onNavigate }: FarmerValidationProps) {
  const [robotCount, setRobotCount] = useState(2);
  const [trajectoryDrawn, setTrajectoryDrawn] = useState(false);

  const handleReject = () => {
    Alert.alert('Reject registration', 'Are you sure you want to reject this farmer registration?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => onNavigate('/admin/dashboard'),
      },
    ]);
  };

  const handleValidate = () => {
    if (trajectoryDrawn) {
      onNavigate('/admin/dashboard');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to admin dashboard"
          onPress={() => onNavigate('/admin/dashboard')}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Feather name="arrow-left" size={22} color="#4b5563" />
        </Pressable>
        <Text style={styles.headerTitle}>Validate Farmer</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Farmer Information</Text>
          <View style={styles.infoList}>
            <InfoRow icon="user" tone="blue" label="Full Name" value={farmer.name} />
            <InfoRow icon="mail" tone="green" label="Email Address" value={farmer.email} />
            <InfoRow icon="phone" tone="purple" label="Phone Number" value={farmer.phone} />
            <InfoRow icon="map-pin" tone="orange" label="Territory Size" value={farmer.territory} />
          </View>
        </View>

        <View style={styles.mapPanel}>
          <View style={styles.mapHeader}>
            <Text style={styles.panelTitle}>Selected Territory Map</Text>
          </View>
          <View style={styles.mapCanvas}>
            <View style={styles.gpsCard}>
              <Text style={styles.gpsLabel}>GPS Location</Text>
              <Text style={styles.gpsValue}>{farmer.location}</Text>
            </View>

            {trajectoryDrawn ? (
              <>
                <View style={[styles.routeLine, styles.routeLineOne]} />
                <View style={[styles.routeLine, styles.routeLineTwo]} />
                <View style={[styles.routeLine, styles.routeLineThree]} />
              </>
            ) : null}

            <View style={styles.mapCenter}>
              <Feather name="map-pin" size={50} color="#15803d" />
              <Text style={styles.mapTitle}>Farmer's Territory</Text>
              <Text style={styles.mapSubtitle}>12.5 hectares</Text>
            </View>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Robot Assignment</Text>

          <View style={styles.robotSection}>
            <Text style={styles.sectionLabel}>Number of Robots</Text>
            <View style={styles.stepperRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Decrease robot count"
                onPress={() => setRobotCount((value) => Math.max(1, value - 1))}
                style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}
              >
                <Text style={styles.stepperText}>-</Text>
              </Pressable>

              <View style={styles.robotCountBox}>
                <Feather name="cpu" size={22} color="#16a34a" />
                <Text style={styles.robotCount}>{robotCount}</Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Increase robot count"
                onPress={() => setRobotCount((value) => Math.min(5, value + 1))}
                style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}
              >
                <Text style={styles.stepperText}>+</Text>
              </Pressable>
            </View>
            <Text style={styles.recommendationText}>Recommended: {Math.ceil(12.5 / 6)} robots for optimal coverage</Text>
          </View>

          <View style={styles.trajectorySection}>
            <Text style={styles.sectionLabel}>Define Robot Trajectory</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setTrajectoryDrawn((value) => !value)}
              style={({ pressed }) => [
                styles.trajectoryButton,
                trajectoryDrawn ? styles.trajectoryButtonActive : styles.trajectoryButtonIdle,
                pressed && styles.pressed,
              ]}
            >
              <Feather name="navigation" size={21} color={trajectoryDrawn ? '#15803d' : '#374151'} />
              <Text style={[styles.trajectoryButtonText, trajectoryDrawn && styles.trajectoryButtonTextActive]}>
                {trajectoryDrawn ? 'Trajectory Defined' : 'Draw Trajectory on Map'}
              </Text>
            </Pressable>
            {trajectoryDrawn ? <Text style={styles.successText}>Patrol route configured successfully</Text> : null}
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Validation Summary</Text>
          <View style={styles.summaryList}>
            <SummaryLine label="Farmer verified" complete />
            <SummaryLine label="Territory mapped" complete />
            <SummaryLine label="Robots assigned" complete />
            <SummaryLine label="Trajectory configured" complete={trajectoryDrawn} />
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            accessibilityRole="button"
            onPress={handleReject}
            style={({ pressed }) => [styles.rejectButton, pressed && styles.pressed]}
          >
            <Feather name="x-circle" size={21} color="#ffffff" />
            <Text style={styles.actionButtonText}>Reject</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={!trajectoryDrawn}
            onPress={handleValidate}
            style={({ pressed }) => [
              styles.validateButton,
              trajectoryDrawn ? styles.validateButtonReady : styles.validateButtonDisabled,
              pressed && trajectoryDrawn && styles.pressed,
            ]}
          >
            <Feather name="check-circle" size={21} color={trajectoryDrawn ? '#ffffff' : '#6b7280'} />
            <Text style={[styles.actionButtonText, !trajectoryDrawn && styles.disabledButtonText]}>Validate</Text>
          </Pressable>
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
    minHeight: 64,
    backgroundColor: '#ffffff',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    gap: 14,
    padding: 16,
    paddingBottom: 96,
  },
  panel: {
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
  panelTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
  },
  infoList: {
    gap: 14,
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  infoLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
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
  mapHeader: {
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
    padding: 16,
  },
  mapCanvas: {
    aspectRatio: 16 / 9,
    backgroundColor: '#bbf7d0',
    overflow: 'hidden',
    position: 'relative',
  },
  gpsCard: {
    position: 'absolute',
    left: 14,
    top: 14,
    zIndex: 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  gpsLabel: {
    color: '#6b7280',
    fontSize: 11,
  },
  gpsValue: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  routeLine: {
    position: 'absolute',
    height: 3,
    borderRadius: 999,
    backgroundColor: '#10b981',
  },
  routeLineOne: {
    left: '14%',
    top: '28%',
    width: '28%',
    transform: [{ rotate: '24deg' }],
  },
  routeLineTwo: {
    left: '38%',
    top: '48%',
    width: '26%',
    transform: [{ rotate: '20deg' }],
  },
  routeLineThree: {
    left: '61%',
    top: '64%',
    width: '25%',
    transform: [{ rotate: '-14deg' }],
  },
  mapCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapTitle: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 8,
  },
  mapSubtitle: {
    color: '#6b7280',
    fontSize: 13,
    marginTop: 3,
  },
  robotSection: {
    marginTop: 16,
  },
  sectionLabel: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperButton: {
    width: 44,
    height: 44,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    color: '#374151',
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 30,
  },
  robotCountBox: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  robotCount: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '800',
  },
  recommendationText: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 9,
    textAlign: 'center',
  },
  trajectorySection: {
    borderTopColor: '#e5e7eb',
    borderTopWidth: 1,
    marginTop: 18,
    paddingTop: 16,
  },
  trajectoryButton: {
    minHeight: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
  },
  trajectoryButtonIdle: {
    backgroundColor: '#f3f4f6',
  },
  trajectoryButtonActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
    borderWidth: 2,
  },
  trajectoryButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '800',
  },
  trajectoryButtonTextActive: {
    color: '#15803d',
  },
  successText: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 9,
    textAlign: 'center',
  },
  summaryList: {
    gap: 11,
    marginTop: 14,
  },
  summaryLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  summaryText: {
    color: '#6b7280',
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 2,
  },
  rejectButton: {
    flex: 1,
    minHeight: 52,
    backgroundColor: '#dc2626',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  validateButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  validateButtonReady: {
    backgroundColor: '#16a34a',
  },
  validateButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  disabledButtonText: {
    color: '#6b7280',
  },
  pressed: {
    opacity: 0.72,
  },
});
