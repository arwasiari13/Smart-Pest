import { ComponentProps, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export type DemoRoute =
  | '/login'
  | '/register'
  | '/farmer/dashboard'
  | '/farmer/alert/1'
  | '/admin/dashboard'
  | '/admin/validate/1'
  | '/admin/robots'
  | '/admin/pesticides';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

type DemoPage = {
  label: string;
  path: DemoRoute;
  icon: FeatherIconName;
  color: string;
};

type DemoPageGroup = {
  group: string;
  items: DemoPage[];
};

type DemoNavigatorProps = {
  currentPath: DemoRoute;
  onNavigate: (path: DemoRoute) => void;
};

const pages: DemoPageGroup[] = [
  {
    group: 'Auth',
    items: [
      { label: 'Login', path: '/login', icon: 'wind', color: '#16a34a' },
      { label: 'Farmer Registration', path: '/register', icon: 'user', color: '#2563eb' },
    ],
  },
  {
    group: 'Farmer (Fellah)',
    items: [
      { label: 'Farmer Dashboard', path: '/farmer/dashboard', icon: 'grid', color: '#16a34a' },
      { label: 'Alert Details', path: '/farmer/alert/1', icon: 'bell', color: '#dc2626' },
    ],
  },
  {
    group: 'Admin',
    items: [
      { label: 'Admin Dashboard', path: '/admin/dashboard', icon: 'shield', color: '#9333ea' },
      { label: 'Farmer Validation', path: '/admin/validate/1', icon: 'user-check', color: '#2563eb' },
      { label: 'Robot Monitoring', path: '/admin/robots', icon: 'cpu', color: '#ea580c' },
      { label: 'Pesticide Management', path: '/admin/pesticides', icon: 'droplet', color: '#0d9488' },
    ],
  },
];

export default function DemoNavigator({ currentPath, onNavigate }: DemoNavigatorProps) {
  const [open, setOpen] = useState(false);

  const currentLabel = useMemo(() => {
    for (const group of pages) {
      const page = group.items.find((item) => item.path === currentPath);
      if (page) {
        return page.label;
      }
    }

    return 'Current Page';
  }, [currentPath]);

  const handleNav = (path: DemoRoute) => {
    onNavigate(path);
    setOpen(false);
  };

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {open ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close demo navigator"
          onPress={() => setOpen(false)}
          style={styles.backdrop}
        />
      ) : null}

      {open ? (
        <View style={styles.panel}>
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          <View style={styles.panelHeader}>
            <View style={styles.brandIcon}>
              <Feather name="wind" size={21} color="#ffffff" />
            </View>
            <View style={styles.headerTextBlock}>
              <Text style={styles.panelTitle}>Snail Detection System</Text>
              <Text style={styles.panelSubtitle}>Demo Navigator - All Pages</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={() => setOpen(false)}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <Feather name="x" size={21} color="#6b7280" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.pageList} showsVerticalScrollIndicator={false}>
            {pages.map((group) => (
              <View key={group.group} style={styles.group}>
                <Text style={styles.groupLabel}>{group.group}</Text>
                <View style={styles.groupItems}>
                  {group.items.map((page) => {
                    const isActive = page.path === currentPath;

                    return (
                      <Pressable
                        accessibilityRole="button"
                        key={page.path}
                        onPress={() => handleNav(page.path)}
                        style={({ pressed }) => [
                          styles.pageButton,
                          isActive && styles.pageButtonActive,
                          pressed && styles.pressed,
                        ]}
                      >
                        <View style={[styles.pageIcon, isActive ? styles.pageIconActive : styles.pageIconIdle]}>
                          <Feather name={page.icon} size={18} color={isActive ? '#16a34a' : page.color} />
                        </View>
                        <Text style={[styles.pageLabel, isActive && styles.pageLabelActive]} numberOfLines={1}>
                          {page.label}
                        </Text>
                        {isActive ? (
                          <View style={styles.currentBadge}>
                            <Text style={styles.currentBadgeText}>Current</Text>
                          </View>
                        ) : (
                          <Feather name="chevron-right" size={17} color="#9ca3af" />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}

            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>Quick Login Tips</Text>
              <Text style={styles.tipsText}>Use admin@... email to open Admin Dashboard</Text>
              <Text style={styles.tipsText}>Use any other email to open Farmer Dashboard</Text>
            </View>
          </ScrollView>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={open ? 'Close demo navigator' : `Open demo navigator. Current page: ${currentLabel}`}
        onPress={() => setOpen((value) => !value)}
        style={({ pressed }) => [styles.floatingButton, pressed && styles.floatingPressed]}
      >
        <Feather name={open ? 'x' : 'menu'} size={26} color="#ffffff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 40,
  },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '80%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 16,
    zIndex: 50,
  },
  handleWrap: {
    alignItems: 'center',
    paddingBottom: 5,
    paddingTop: 12,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#d1d5db',
  },
  panelHeader: {
    borderBottomColor: '#f3f4f6',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  brandIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  panelTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  panelSubtitle: {
    color: '#16a34a',
    fontSize: 12,
    marginTop: 3,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageList: {
    gap: 18,
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 14,
  },
  group: {
    gap: 8,
  },
  groupLabel: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
  },
  groupItems: {
    gap: 5,
  },
  pageButton: {
    minHeight: 58,
    borderColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
  },
  pageButtonActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  pageIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageIconIdle: {
    backgroundColor: '#f3f4f6',
  },
  pageIconActive: {
    backgroundColor: '#dcfce7',
  },
  pageLabel: {
    color: '#1f2937',
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  pageLabelActive: {
    color: '#15803d',
  },
  currentBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  currentBadgeText: {
    color: '#16a34a',
    fontSize: 11,
    fontWeight: '700',
  },
  tipsCard: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderRadius: 16,
    borderWidth: 1,
    padding: 15,
  },
  tipsTitle: {
    color: '#92400e',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  tipsText: {
    color: '#b45309',
    fontSize: 12,
    lineHeight: 18,
  },
  floatingButton: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 60,
  },
  floatingPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
  pressed: {
    opacity: 0.72,
  },
});
