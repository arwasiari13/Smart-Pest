import { ComponentProps, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { DemoRoute } from './DemoNavigator';

type Severity = 'low' | 'medium' | 'high';
type SeverityFilter = 'all' | Severity;
type FeatherIconName = ComponentProps<typeof Feather>['name'];

type Pesticide = {
  id: number;
  name: string;
  type: string;
  severity: Severity;
  dosage: string;
  applicationMethod: string;
  effectiveness: number;
  price: string;
  safetyLevel: string;
  description: string;
};

type PesticideManagementProps = {
  onNavigate: (path: DemoRoute) => void;
};

const initialPesticides: Pesticide[] = [
  {
    id: 1,
    name: 'Métaldéhyde 5%',
    type: 'Molluscicide granulé',
    severity: 'high',
    dosage: '5-7 kg/hectare',
    applicationMethod: 'Épandage au sol',
    effectiveness: 95,
    price: '450 MAD/sac de 10kg',
    safetyLevel: 'Toxique - Port EPI obligatoire',
    description: 'Très efficace contre les escargots et limaces. Action rapide.',
  },
  {
    id: 2,
    name: 'Phosphate de fer 1.5%',
    type: 'Molluscicide écologique',
    severity: 'medium',
    dosage: '3-5 kg/hectare',
    applicationMethod: 'Épandage localisé',
    effectiveness: 85,
    price: '380 MAD/sac de 10kg',
    safetyLevel: 'Faible toxicité - Utilisable en agriculture bio',
    description: 'Solution écologique, sans danger pour les animaux domestiques.',
  },
  {
    id: 3,
    name: 'Helicidine Bio',
    type: 'Répulsif naturel',
    severity: 'low',
    dosage: '2-3 L/hectare',
    applicationMethod: 'Pulvérisation',
    effectiveness: 70,
    price: '250 MAD/5L',
    safetyLevel: 'Non toxique - Produit naturel',
    description: "Répulsif à base d'extraits végétaux. Préventif.",
  },
  {
    id: 4,
    name: 'Carbamate 10%',
    type: 'Molluscicide concentré',
    severity: 'high',
    dosage: '6-8 kg/hectare',
    applicationMethod: 'Épandage mécanique',
    effectiveness: 92,
    price: '520 MAD/sac de 10kg',
    safetyLevel: 'Très toxique - Formation requise',
    description: 'Puissant molluscicide pour infestations sévères.',
  },
  {
    id: 5,
    name: 'Barrière Cuivre',
    type: 'Répulsif minéral',
    severity: 'low',
    dosage: '1-2 kg/hectare',
    applicationMethod: 'Bordures et périmètre',
    effectiveness: 65,
    price: '180 MAD/kg',
    safetyLevel: 'Non toxique',
    description: 'Barrière physique à base de sulfate de cuivre.',
  },
  {
    id: 6,
    name: 'Thiodicarbe 6%',
    type: 'Molluscicide systémique',
    severity: 'medium',
    dosage: '4-6 kg/hectare',
    applicationMethod: 'Épandage au sol',
    effectiveness: 88,
    price: '410 MAD/sac de 10kg',
    safetyLevel: 'Toxicité modérée - EPI recommandés',
    description: 'Action prolongée, efficace en conditions humides.',
  },
];

const severityStyles = {
  high: {
    label: 'Danger Élevé',
    color: '#b91c1c',
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
    iconColor: '#dc2626',
    activeColor: '#dc2626',
  },
  medium: {
    label: 'Danger Moyen',
    color: '#c2410c',
    backgroundColor: '#ffedd5',
    borderColor: '#fed7aa',
    iconColor: '#ea580c',
    activeColor: '#ea580c',
  },
  low: {
    label: 'Danger Faible',
    color: '#a16207',
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
    iconColor: '#ca8a04',
    activeColor: '#ca8a04',
  },
};

function InfoLine({
  icon,
  label,
  value,
  valueColor = '#111827',
}: {
  icon?: FeatherIconName;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.infoLine}>
      <View style={styles.infoLabelWrap}>
        {icon ? <Feather name={icon} size={16} color="#2563eb" /> : null}
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

function FilterButton({
  label,
  active,
  count,
  color,
  onPress,
}: {
  label: string;
  active: boolean;
  count: number;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterButton,
        active ? { backgroundColor: color } : styles.filterButtonIdle,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.filterText, active && styles.filterTextActive]}>
        {label} ({count})
      </Text>
    </Pressable>
  );
}

function PesticideCard({ pesticide }: { pesticide: Pesticide }) {
  const severity = severityStyles[pesticide.severity];

  return (
    <View style={styles.pesticideCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.severityIcon, { backgroundColor: severity.backgroundColor }]}>
          <Feather name="alert-triangle" size={22} color={severity.iconColor} />
        </View>
        <View style={styles.cardTitleBlock}>
          <Text style={styles.pesticideName}>{pesticide.name}</Text>
          <Text style={styles.pesticideType}>{pesticide.type}</Text>
          <View style={[styles.severityBadge, { backgroundColor: severity.backgroundColor, borderColor: severity.borderColor }]}>
            <Text style={[styles.severityBadgeText, { color: severity.color }]}>{severity.label}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.description}>{pesticide.description}</Text>

      <View style={styles.detailsBox}>
        <InfoLine icon="droplet" label="Dosage" value={pesticide.dosage} />
        <InfoLine label="Application" value={pesticide.applicationMethod} />
        <InfoLine label="Efficacité" value={`${pesticide.effectiveness}%`} valueColor="#15803d" />
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pesticide.effectiveness}%` }]} />
        </View>
        <View style={styles.divider} />
        <InfoLine label="Prix" value={pesticide.price} />
        <View style={styles.safetyRow}>
          <Feather name="shield" size={16} color="#9ca3af" />
          <Text style={styles.safetyText}>{pesticide.safetyLevel}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <Pressable
          accessibilityRole="button"
          onPress={() => Alert.alert('Modifier', `${pesticide.name} prêt à être modifié.`)}
          style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
        >
          <Feather name="edit-2" size={17} color="#1d4ed8" />
          <Text style={styles.editText}>Modifier</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => Alert.alert('Supprimer', `${pesticide.name} prêt à être supprimé.`)}
          style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
        >
          <Feather name="trash-2" size={17} color="#b91c1c" />
          <Text style={styles.deleteText}>Supprimer</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function PesticideManagement({ onNavigate }: PesticideManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityFilter>('all');
  const [pesticides] = useState<Pesticide[]>(initialPesticides);

  const counts = useMemo(
    () => ({
      all: pesticides.length,
      low: pesticides.filter((pesticide) => pesticide.severity === 'low').length,
      medium: pesticides.filter((pesticide) => pesticide.severity === 'medium').length,
      high: pesticides.filter((pesticide) => pesticide.severity === 'high').length,
    }),
    [pesticides],
  );

  const filteredPesticides = useMemo(() => {
    if (selectedSeverity === 'all') {
      return pesticides;
    }

    return pesticides.filter((pesticide) => pesticide.severity === selectedSeverity);
  }, [pesticides, selectedSeverity]);

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
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>Gestion des Pesticides</Text>
          <Text style={styles.headerSubtitle}>Recommandations par niveau de danger</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add pesticide"
          onPress={() => setShowAddForm(true)}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
        >
          <Feather name="plus" size={22} color="#ffffff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.filterPanel}>
          <Text style={styles.panelTitle}>Filtrer par niveau de danger</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            <FilterButton
              label="Tous"
              active={selectedSeverity === 'all'}
              count={counts.all}
              color="#16a34a"
              onPress={() => setSelectedSeverity('all')}
            />
            <FilterButton
              label="Danger Faible"
              active={selectedSeverity === 'low'}
              count={counts.low}
              color={severityStyles.low.activeColor}
              onPress={() => setSelectedSeverity('low')}
            />
            <FilterButton
              label="Danger Moyen"
              active={selectedSeverity === 'medium'}
              count={counts.medium}
              color={severityStyles.medium.activeColor}
              onPress={() => setSelectedSeverity('medium')}
            />
            <FilterButton
              label="Danger Élevé"
              active={selectedSeverity === 'high'}
              count={counts.high}
              color={severityStyles.high.activeColor}
              onPress={() => setSelectedSeverity('high')}
            />
          </ScrollView>
        </View>

        <View style={styles.list}>
          {filteredPesticides.map((pesticide) => (
            <PesticideCard key={pesticide.id} pesticide={pesticide} />
          ))}
        </View>

        {filteredPesticides.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="wind" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>Aucun pesticide trouvé pour ce niveau de danger</Text>
          </View>
        ) : null}
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
        <Pressable
          accessibilityRole="button"
          onPress={() => onNavigate('/admin/robots')}
          style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}
        >
          <Feather name="cpu" size={21} color="#6b7280" />
          <Text style={styles.tabText}>Robots</Text>
        </Pressable>
        <Pressable accessibilityRole="button" style={styles.tabButton}>
          <Feather name="droplet" size={21} color="#0d9488" />
          <Text style={[styles.tabText, styles.activeTabText]}>Pesticides</Text>
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

      <Modal transparent visible={showAddForm} animationType="fade" onRequestClose={() => setShowAddForm(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>Ajouter un Pesticide</Text>
              <TextInput style={styles.modalInput} placeholder="Nom du produit" placeholderTextColor="#9ca3af" />
              <TextInput style={styles.modalInput} placeholder="Type" placeholderTextColor="#9ca3af" />
              <View style={styles.modalSeverityRow}>
                {(['low', 'medium', 'high'] as Severity[]).map((severity) => (
                  <View key={severity} style={[styles.modalSeverityBadge, { backgroundColor: severityStyles[severity].backgroundColor }]}>
                    <Text style={[styles.modalSeverityText, { color: severityStyles[severity].color }]}>
                      {severityStyles[severity].label}
                    </Text>
                  </View>
                ))}
              </View>
              <TextInput style={styles.modalInput} placeholder="Dosage" placeholderTextColor="#9ca3af" />
              <TextInput
                multiline
                style={[styles.modalInput, styles.modalTextarea]}
                placeholder="Décrivez le produit..."
                placeholderTextColor="#9ca3af"
              />
              <View style={styles.modalActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setShowAddForm(false)}
                  style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
                >
                  <Text style={styles.cancelText}>Annuler</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setShowAddForm(false);
                    Alert.alert('Ajouter', 'Formulaire prêt à être connecté à la base de données.');
                  }}
                  style={({ pressed }) => [styles.modalAddButton, pressed && styles.pressed]}
                >
                  <Text style={styles.modalAddText}>Ajouter</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    minHeight: 68,
    backgroundColor: '#ffffff',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextBlock: { flex: 1, minWidth: 0 },
  headerTitle: { color: '#111827', fontSize: 18, fontWeight: '800' },
  headerSubtitle: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { gap: 14, padding: 16, paddingBottom: 104 },
  filterPanel: {
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
  panelTitle: { color: '#111827', fontSize: 15, fontWeight: '800', marginBottom: 12 },
  filterRow: { gap: 8 },
  filterButton: {
    borderRadius: 12,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  filterButtonIdle: { backgroundColor: '#f3f4f6' },
  filterText: { color: '#374151', fontSize: 13, fontWeight: '700' },
  filterTextActive: { color: '#ffffff' },
  list: { gap: 12 },
  pesticideCard: {
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
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  severityIcon: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardTitleBlock: { flex: 1, minWidth: 0 },
  pesticideName: { color: '#111827', fontSize: 15, fontWeight: '800' },
  pesticideType: { color: '#6b7280', fontSize: 12, marginTop: 4, marginBottom: 8 },
  severityBadge: { alignSelf: 'flex-start', borderRadius: 999, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 4 },
  severityBadgeText: { fontSize: 11, fontWeight: '800' },
  description: { color: '#374151', fontSize: 14, lineHeight: 20, marginBottom: 12 },
  detailsBox: { backgroundColor: '#f9fafb', borderRadius: 12, gap: 8, padding: 12, marginBottom: 12 },
  infoLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  infoLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  infoLabel: { color: '#6b7280', fontSize: 12 },
  infoValue: { flex: 1, fontSize: 12, fontWeight: '700', textAlign: 'right' },
  progressTrack: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: '#16a34a', borderRadius: 999 },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginTop: 3 },
  safetyRow: { borderTopColor: '#e5e7eb', borderTopWidth: 1, flexDirection: 'row', gap: 8, paddingTop: 9 },
  safetyText: { color: '#374151', flex: 1, fontSize: 12, lineHeight: 18 },
  cardActions: { flexDirection: 'row', gap: 8 },
  editButton: {
    flex: 1,
    minHeight: 42,
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  editText: { color: '#1d4ed8', fontSize: 13, fontWeight: '800' },
  deleteButton: {
    flex: 1,
    minHeight: 42,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  deleteText: { color: '#b91c1c', fontSize: 13, fontWeight: '800' },
  emptyCard: { backgroundColor: '#ffffff', borderRadius: 16, alignItems: 'center', padding: 28 },
  emptyText: { color: '#6b7280', fontSize: 14, marginTop: 10, textAlign: 'center' },
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
  activeTabText: { color: '#0d9488' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: { width: '100%', maxWidth: 430, maxHeight: '90%', backgroundColor: '#ffffff', borderRadius: 18 },
  modalContent: { gap: 13, padding: 22 },
  modalTitle: { color: '#111827', fontSize: 21, fontWeight: '800', marginBottom: 3 },
  modalInput: {
    minHeight: 48,
    borderColor: '#d1d5db',
    borderRadius: 12,
    borderWidth: 1,
    color: '#111827',
    fontSize: 14,
    paddingHorizontal: 13,
  },
  modalTextarea: { minHeight: 88, paddingTop: 12, textAlignVertical: 'top' },
  modalSeverityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modalSeverityBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  modalSeverityText: { fontSize: 11, fontWeight: '800' },
  modalActions: { flexDirection: 'row', gap: 10, paddingTop: 8 },
  cancelButton: {
    flex: 1,
    minHeight: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { color: '#374151', fontSize: 14, fontWeight: '800' },
  modalAddButton: {
    flex: 1,
    minHeight: 48,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAddText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.72 },
});
