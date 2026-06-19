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
import { registerFarmer } from '../services/firebaseAuth';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

type FormData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  territoryName: string;
  areaHectare: string;
};

type FarmerRegistrationProps = {
  onNavigate: (path: DemoRoute) => void;
  onRegister?: (farmer: { name: string; email: string; phone: string; territory: string }) => void;
};

type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  icon: FeatherIconName;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  secureTextEntry?: boolean;
};

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  password: '',
  territoryName: '',
  areaHectare: '',
};

function FormField({
  label,
  placeholder,
  value,
  icon,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <Feather name={icon} size={21} color="#9ca3af" style={styles.inputIcon} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
          style={styles.input}
        />
      </View>
    </View>
  );
}

function SuccessState({ onNavigate }: Pick<FarmerRegistrationProps, 'onNavigate'>) {
  return (
    <SafeAreaView style={styles.gradientScreen}>
      <StatusBar style="dark" />
      <View style={styles.centerContent}>
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Feather name="check-circle" size={38} color="#16a34a" />
          </View>
          <Text style={styles.successTitle}>Registration Submitted!</Text>
          <Text style={styles.successText}>
            Your account has been created and is awaiting admin validation. You will be notified once your account is approved.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => onNavigate('/login')}
            style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}
          >
            <Text style={styles.submitButtonText}>Back to Login</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function FarmerRegistration({ onNavigate, onRegister }: FarmerRegistrationProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    if (error) setError(null);
  };

  const validate = (): string | null => {
    if (!formData.firstName.trim() || formData.firstName.trim().length < 2)
      return 'First name must be at least 2 characters.';
    if (!formData.lastName.trim() || formData.lastName.trim().length < 2)
      return 'Last name must be at least 2 characters.';
    if (!formData.phone.trim() || formData.phone.trim().length < 8)
      return 'Enter a valid phone number.';
    if (!formData.email.trim() || !formData.email.includes('@'))
      return 'Enter a valid email address.';
    if (!formData.password || formData.password.length < 6)
      return 'Password must be at least 6 characters.';
    if (!formData.territoryName.trim() || formData.territoryName.trim().length < 2)
      return 'Enter a territory name.';
    const area = parseFloat(formData.areaHectare);
    if (!formData.areaHectare || isNaN(area) || area <= 0)
      return 'Enter a valid area in hectares (e.g. 5.0).';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await registerFarmer({
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        territory: {
          name: formData.territoryName.trim(),
          areaHectare: parseFloat(formData.areaHectare),
          centerLat: 33.5731,
          centerLng: -7.5898,
        },
      });

      onRegister?.({
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        territory: `${formData.areaHectare} hectares`,
      });

      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('email-already-in-use')) {
        setError('This email is already registered. Please log in instead.');
      } else if (msg.includes('weak-password')) {
        setError('Password is too weak. Use at least 6 characters.');
      } else if (msg.includes('invalid-email')) {
        setError('Invalid email address.');
      } else {
        setError(`Error: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return <SuccessState onNavigate={onNavigate} />;
  }

  return (
    <SafeAreaView style={styles.gradientScreen}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.heading}>
              <View style={styles.logo}>
                <Feather name="wind" size={34} color="#ffffff" />
              </View>
              <Text style={styles.title}>Farmer Registration</Text>
              <Text style={styles.subtitle}>Join our smart agriculture network</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.nameRow}>
                <View style={styles.nameField}>
                  <FormField
                    label="First Name"
                    placeholder="First name"
                    value={formData.firstName}
                    icon="user"
                    onChangeText={(value) => updateField('firstName', value)}
                  />
                </View>
                <View style={styles.nameField}>
                  <FormField
                    label="Last Name"
                    placeholder="Last name"
                    value={formData.lastName}
                    icon="user"
                    onChangeText={(value) => updateField('lastName', value)}
                  />
                </View>
              </View>

              <FormField
                label="Phone Number"
                placeholder="+212 600 000 000"
                value={formData.phone}
                icon="phone"
                keyboardType="phone-pad"
                onChangeText={(value) => updateField('phone', value)}
              />

              <FormField
                label="Email"
                placeholder="Enter your email"
                value={formData.email}
                icon="mail"
                keyboardType="email-address"
                onChangeText={(value) => updateField('email', value)}
              />

              <FormField
                label="Password"
                placeholder="Create a password (min. 6 characters)"
                value={formData.password}
                icon="lock"
                secureTextEntry
                onChangeText={(value) => updateField('password', value)}
              />

              <View style={styles.nameRow}>
                <View style={styles.nameField}>
                  <FormField
                    label="Territory Name"
                    placeholder="e.g. Ferme Nord"
                    value={formData.territoryName}
                    icon="map"
                    onChangeText={(value) => updateField('territoryName', value)}
                  />
                </View>
                <View style={styles.nameField}>
                  <FormField
                    label="Area (hectares)"
                    placeholder="e.g. 5.0"
                    value={formData.areaHectare}
                    icon="maximize"
                    keyboardType="numeric"
                    onChangeText={(value) => updateField('areaHectare', value)}
                  />
                </View>
              </View>

              {error && (
                <View style={styles.errorBox}>
                  <Feather name="alert-circle" size={16} color="#dc2626" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Pressable
                accessibilityRole="button"
                onPress={handleSubmit}
                disabled={loading}
                style={({ pressed }) => [
                  styles.submitButton,
                  (pressed || loading) && styles.pressed,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Registration</Text>
                )}
              </Pressable>
            </View>

            <View style={styles.loginPrompt}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Pressable accessibilityRole="button" onPress={() => onNavigate('/login')}>
                <Text style={styles.loginLink}>Login</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  gradientScreen: {
    flex: 1,
    backgroundColor: '#ecfdf5',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    padding: 16,
    paddingBottom: 96,
    paddingTop: 28,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 720,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  successCard: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
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
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    gap: 18,
  },
  nameRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  nameField: {
    flexBasis: 260,
    flexGrow: 1,
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    flex: 1,
  },
  submitButton: {
    minHeight: 50,
    backgroundColor: '#16a34a',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  loginPrompt: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#6b7280',
    fontSize: 14,
  },
  loginLink: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '800',
  },
  successIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  successText: {
    color: '#6b7280',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    marginTop: 10,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
