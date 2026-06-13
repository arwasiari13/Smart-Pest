import { ComponentProps, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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
import { signIn, AppUser } from '../services/firebaseAuth';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

type LoginProps = {
  onNavigate: (path: DemoRoute) => void;
  onFarmerLogin: (email?: string) => void;
  onAuthSuccess?: (user: AppUser) => void;
};

type QuickAccessCardProps = {
  icon: FeatherIconName;
  title: string;
  subtitle: string;
  tone: 'purple' | 'green';
  onPress: () => void;
};

const toneStyles = {
  purple: {
    backgroundColor: '#faf5ff',
    borderColor: '#e9d5ff',
    iconBackground: '#f3e8ff',
    color: '#9333ea',
    textColor: '#7e22ce',
    subtitleColor: '#a855f7',
  },
  green: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    iconBackground: '#dcfce7',
    color: '#16a34a',
    textColor: '#15803d',
    subtitleColor: '#22c55e',
  },
};

function QuickAccessCard({ icon, title, subtitle, tone, onPress }: QuickAccessCardProps) {
  const colors = toneStyles[tone];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickCard,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.quickIcon, { backgroundColor: colors.iconBackground }]}>
        <Feather name={icon} size={22} color={colors.color} />
      </View>
      <Text style={[styles.quickTitle, { color: colors.textColor }]}>{title}</Text>
      <Text style={[styles.quickSubtitle, { color: colors.subtitleColor }]}>{subtitle}</Text>
    </Pressable>
  );
}

export default function Login({ onNavigate, onFarmerLogin, onAuthSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await signIn(email, password);
      onAuthSuccess?.(user);
      if (user.role === 'ADMIN') {
        onNavigate('/admin/dashboard');
      } else {
        onFarmerLogin(user.email);
        onNavigate('/farmer/dashboard');
      }
    } catch (err: any) {
      setError(err?.message ?? 'Sign-in failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.heading}>
              <View style={styles.logo}>
                <Feather name="wind" size={34} color="#ffffff" />
              </View>
              <Text style={styles.title}>Snail Detection System</Text>
              <Text style={styles.subtitle}>Smart Agriculture Monitoring</Text>
            </View>

            <View style={styles.quickAccess}>
              <Text style={styles.sectionKicker}>Quick Demo Access</Text>
              <View style={styles.quickGrid}>
                <QuickAccessCard
                  icon="shield"
                  title="Admin"
                  subtitle="Full control"
                  tone="purple"
                  onPress={() => onNavigate('/admin/dashboard')}
                />
                <QuickAccessCard
                  icon="user"
                  title="Farmer"
                  subtitle="Field view"
                  tone="green"
                  onPress={() => {
                    onFarmerLogin();
                    onNavigate('/farmer/dashboard');
                  }}
                />
              </View>
            </View>

            <View style={styles.dividerWrap}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or sign in manually</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Email</Text>
                <View style={styles.inputWrap}>
                  <Feather name="mail" size={21} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="admin@example.com"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Password</Text>
                <View style={styles.inputWrap}>
                  <Feather name="lock" size={21} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                    style={styles.input}
                  />
                </View>
              </View>

              {!!error && <Text style={styles.errorText}>{error}</Text>}

              <Pressable
                accessibilityRole="button"
                onPress={handleLogin}
                disabled={loading}
                style={({ pressed }) => [styles.signInButton, pressed && styles.pressed, loading && styles.disabled]}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.signInText}>Sign In</Text>
                )}
              </Pressable>
            </View>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>New farmer? </Text>
              <Pressable accessibilityRole="button" onPress={() => onNavigate('/register')}>
                <Text style={styles.registerLink}>Register here</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.tipText}>Sign in with your SmartPest account or use Quick Demo Access above.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ecfdf5',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
    paddingBottom: 96,
  },
  card: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 28,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  heading: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    color: '#111827',
    fontSize: 25,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  quickAccess: {
    marginBottom: 24,
  },
  sectionKicker: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickCard: {
    flex: 1,
    minHeight: 126,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  quickSubtitle: {
    fontSize: 12,
    marginTop: 3,
    textAlign: 'center',
  },
  dividerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    position: 'relative',
  },
  dividerLine: {
    backgroundColor: '#e5e7eb',
    height: 1,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  dividerText: {
    backgroundColor: '#ffffff',
    color: '#9ca3af',
    fontSize: 12,
    paddingHorizontal: 12,
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
  },
  inputWrap: {
    position: 'relative',
  },
  inputIcon: {
    left: 14,
    position: 'absolute',
    top: 14,
    zIndex: 1,
  },
  input: {
    minHeight: 50,
    borderColor: '#d1d5db',
    borderRadius: 12,
    borderWidth: 1,
    color: '#111827',
    fontSize: 15,
    paddingLeft: 45,
    paddingRight: 14,
  },
  signInButton: {
    minHeight: 50,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  signInText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
  registerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  registerLink: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  tipText: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 16,
    maxWidth: 430,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
  disabled: {
    opacity: 0.6,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 4,
  },
});
