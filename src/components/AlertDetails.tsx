import { ComponentProps } from 'react';
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

type FeatherIconName = ComponentProps<typeof Feather>['name'];

type PesticideRecommendation = {
  id: number;
  name: string;
  type: string;
  dosage: string;
  effectiveness: number;
  price: string;
  safetyLevel: string;
};

type InfoRowProps = {
  icon: FeatherIconName;
  tone: 'blue' | 'purple' | 'orange' | 'green';
  label: string;
  value: string;
  detail?: string;
};

const alertId = '1';

const pesticideRecommendations: PesticideRecommendation[] = [
  {
    id: 1,
    name: 'Métaldéhyde 5%',
    type: 'Molluscicide granulé',
    dosage: '5-7 kg/hectare',
    effectiveness: 95,
    price: '450 MAD/sac de 10kg',
    safetyLevel: 'Toxique - Port EPI obligatoire',
  },
  {
    id: 2,
    name: 'Carbamate 10%',
    type: 'Molluscicide concentré',
    dosage: '6-8 kg/hectare',
    effectiveness: 92,
    price: '520 MAD/sac de 10kg',
    safetyLevel: 'Très toxique - Formation requise',
  },
];

const toneStyles = {
  blue: { backgroundColor: '#dbeafe', color: '#2563eb' },
  purple: { backgroundColor: '#f3e8ff', color: '#9333ea' },
  orange: { backgroundColor: '#ffedd5', color: '#ea580c' },
  green: { backgroundColor: '#dcfce7', color: '#16a34a' },
};

function showActionMessage(action: string) {
  Alert.alert('Action', `${action} is ready to connect when app logic is added.`);
}

function InfoRow({ icon, tone, label, value, detail }: InfoRowProps) {
  const colors = toneStyles[tone];

  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: colors.backgroundColor }]}>
        <Feather name={icon} size={21} color={colors.color} />
      </View>
      <View style={styles.infoTextBlock}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
        {detail ? <Text style={styles.infoDetail}>{detail}</Text> : null}
      </View>
    </View>
  );
}

function PesticideCard({ pesticide }: { pesticide: PesticideRecommendation }) {
  return (
    <View style={styles.pesticideCard}>
      <View style={styles.pesticideHeader}>
        <View style={styles.pesticideTitleBlock}>
          <Text style={styles.pesticideName}>{pesticide.name}</Text>
          <Text style={styles.pesticideType}>{pesticide.type}</Text>
        </View>
        <View style={styles.effectivenessBadge}>
          <Text style={styles.effectivenessText}>{pesticide.effectiveness}%</Text>
        </View>
      </View>

      <View style={styles.pesticideMeta}>
        <View style={styles.metaLine}>
          <Text style={styles.metaLabel}>Dosage</Text>
          <Text style={styles.metaValue}>{pesticide.dosage}</Text>
        </View>
        <View style={styles.metaLine}>
          <Text style={styles.metaLabel}>Prix</Text>
          <Text style={styles.metaValue}>{pesticide.price}</Text>
        </View>
      </View>

      <View style={styles.safetyRow}>
        <Feather name="shield" size={14} color="#ea580c" />
        <Text style={styles.safetyText}>{pesticide.safetyLevel}</Text>
      </View>
    </View>
  );
}

export default function AlertDetails({ onBack }: { onBack?: () => void }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack ?? (() => showActionMessage('Back navigation'))}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressedButton]}
        >
          <Feather name="arrow-left" size={22} color="#4b5563" />
        </Pressable>
        <Text style={styles.headerTitle}>Alert Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.alertCard}>
          <View style={styles.alertHero}>
            <View style={styles.alertHeroRow}>
              <View style={styles.alertIcon}>
                <Feather name="alert-triangle" size={26} color="#ffffff" />
              </View>
              <View style={styles.alertTitleBlock}>
                <Text style={styles.alertTitle}>Harmful Snail Detected</Text>
                <View style={styles.badgeRow}>
                  <View style={styles.severityBadge}>
                    <Text style={styles.severityText}>High Severity</Text>
                  </View>
                  <View style={styles.alertIdBadge}>
                    <Text style={styles.alertIdText}>Alert #{alertId}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.imagePlaceholder}>
            <Feather name="image" size={58} color="#9ca3af" />
            <View style={styles.imageBadge}>
              <Text style={styles.imageBadgeText}>Captured Image</Text>
            </View>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Alert Information</Text>
          <View style={styles.infoList}>
            <InfoRow icon="map-pin" tone="blue" label="GPS Location" value="33.5731° N, 7.5898° W" />
            <InfoRow icon="calendar" tone="purple" label="Date" value="April 24, 2026" />
            <InfoRow icon="clock" tone="orange" label="Time" value="14:32:18" />
            <InfoRow
              icon="cpu"
              tone="green"
              label="Detected By"
              value="Robot-Alpha-01"
              detail="Status: Active • Battery: 87%"
            />
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Detection Analysis</Text>
          <View style={styles.analysisList}>
            <View style={styles.analysisLine}>
              <Text style={styles.analysisLabel}>Confidence Level</Text>
              <Text style={styles.analysisValue}>94.2%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
            <View style={[styles.analysisLine, styles.analysisLineSpacing]}>
              <Text style={styles.analysisLabel}>Threat Level</Text>
              <Text style={styles.threatValue}>High</Text>
            </View>
            <View style={styles.analysisLine}>
              <Text style={styles.analysisLabel}>Species</Text>
              <Text style={styles.analysisValue}>Helix aspersa</Text>
            </View>
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.recommendationTitleRow}>
            <Feather name="droplet" size={21} color="#16a34a" />
            <Text style={styles.panelTitle}>Pesticides Recommandés</Text>
          </View>
          <Text style={styles.recommendationIntro}>Recommandations basées sur le niveau de danger élevé</Text>

          <View style={styles.pesticideList}>
            {pesticideRecommendations.map((pesticide) => (
              <PesticideCard key={pesticide.id} pesticide={pesticide} />
            ))}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => showActionMessage('Map location')}
          style={({ pressed }) => [styles.mapButton, pressed && styles.pressedButton]}
        >
          <Feather name="map" size={21} color="#ffffff" />
          <Text style={styles.mapButtonText}>View Location on Map</Text>
        </Pressable>

        <View style={styles.bottomActions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => showActionMessage('Mark as Resolved')}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressedButton]}
          >
            <Text style={styles.secondaryButtonText}>Mark as Resolved</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => showActionMessage('Take Action')}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressedButton]}
          >
            <Text style={styles.primaryButtonText}>Take Action</Text>
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
    fontWeight: '600',
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 28,
  },
  alertCard: {
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
  alertHero: {
    backgroundColor: '#fef2f2',
    borderBottomColor: '#fee2e2',
    borderBottomWidth: 1,
    padding: 16,
  },
  alertHeroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  alertIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  alertTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  severityBadge: {
    backgroundColor: '#dc2626',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  severityText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  alertIdBadge: {
    backgroundColor: '#ffffff',
    borderColor: '#fecaca',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  alertIdText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '700',
  },
  imagePlaceholder: {
    aspectRatio: 16 / 9,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  imageBadge: {
    position: 'absolute',
    right: 14,
    top: 14,
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 2,
  },
  imageBadgeText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
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
    fontWeight: '700',
  },
  infoList: {
    gap: 14,
    marginTop: 15,
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
    fontWeight: '600',
  },
  infoDetail: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  analysisList: {
    marginTop: 14,
  },
  analysisLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  analysisLineSpacing: {
    marginTop: 15,
    marginBottom: 12,
  },
  analysisLabel: {
    color: '#6b7280',
    fontSize: 14,
  },
  analysisValue: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  threatValue: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    width: '94.2%',
    height: 8,
    backgroundColor: '#16a34a',
    borderRadius: 999,
  },
  recommendationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recommendationIntro: {
    color: '#6b7280',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  pesticideList: {
    gap: 12,
    marginTop: 15,
  },
  pesticideCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 13,
  },
  pesticideHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  pesticideTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  pesticideName: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  pesticideType: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 3,
  },
  effectivenessBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  effectivenessText: {
    color: '#15803d',
    fontSize: 12,
    fontWeight: '700',
  },
  pesticideMeta: {
    gap: 7,
    marginTop: 12,
    marginBottom: 12,
  },
  metaLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  metaLabel: {
    color: '#6b7280',
    fontSize: 12,
  },
  metaValue: {
    color: '#111827',
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  safetyRow: {
    borderTopColor: '#e5e7eb',
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    paddingTop: 10,
  },
  safetyText: {
    color: '#374151',
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  mapButton: {
    minHeight: 50,
    backgroundColor: '#2563eb',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 50,
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  primaryButton: {
    flex: 1,
    minHeight: 50,
    backgroundColor: '#16a34a',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  pressedButton: {
    opacity: 0.72,
  },
});
