import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AlertDetails from './src/components/AlertDetails';
import AdminDashboard, { AdminFarmer, initialAdminFarmers } from './src/components/AdminDashboard';
import DemoNavigator, { DemoRoute } from './src/components/DemoNavigator';
import FarmerDashboard from './src/components/FarmerDashboard';
import FarmerRegistration from './src/components/FarmerRegistration';
import FarmerValidation from './src/components/FarmerValidation';
import Login from './src/components/Login';
import PesticideManagement from './src/components/PesticideManagement';
import RobotMonitoring from './src/components/RobotMonitoring';
import { onAuthStateChange, AppUser } from './src/services/firebaseAuth';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [currentPath, setCurrentPath] = useState<DemoRoute>('/login');
  const [farmers, setFarmers] = useState<AdminFarmer[]>(initialAdminFarmers);
  const [currentFarmer, setCurrentFarmer] = useState<AdminFarmer>(initialAdminFarmers[0]);
  const [firebaseUser, setFirebaseUser] = useState<AppUser | null>(null);

  useEffect(() => {
    // Auth Firebase
    const unsub = onAuthStateChange((user) => setFirebaseUser(user));

    // Configuration notifications
    async function setupNotifications() {
      if (!Device.isDevice) {
        console.log('Les notifications nécessitent un vrai appareil !');
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permission notifications refusée !');
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: '99bac276-6dda-4ad5-8d62-2b05b1aeed77'
      });

      console.log('==================================');
      console.log('EXPO PUSH TOKEN:', token.data);
      console.log('==================================');
    }

    setupNotifications();

    // Recevoir notification quand app est en premier plan
    const foregroundSub = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification reçue en premier plan:', notification);
    });

    // Clic sur notification
    const responseSub = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification cliquée:', response);
      setCurrentPath('/farmer/dashboard');
    });

    return () => {
      unsub();
      foregroundSub.remove();
      responseSub.remove();
    };
  }, []);

  const registerFarmer = (farmer: Omit<AdminFarmer, 'id' | 'status' | 'registeredDate'>) => {
    const newFarmer: AdminFarmer = {
      ...farmer,
      id: Math.max(0, ...farmers.map((existingFarmer) => existingFarmer.id)) + 1,
      status: 'pending',
      registeredDate: new Date().toISOString().slice(0, 10),
    };
    setCurrentFarmer(newFarmer);
    setFarmers((currentFarmers) => [newFarmer, ...currentFarmers]);
  };

  const selectFarmerForLogin = (email?: string) => {
    const normalizedEmail = email?.trim().toLowerCase();
    const matchingFarmer = normalizedEmail
      ? farmers.find((farmer) => farmer.email.toLowerCase() === normalizedEmail)
      : undefined;
    setCurrentFarmer(matchingFarmer ?? currentFarmer ?? initialAdminFarmers[0]);
  };

  const renderScreen = () => {
    if (currentPath === '/admin/dashboard') {
      return <AdminDashboard farmers={farmers} onNavigate={setCurrentPath} />;
    }
    if (currentPath === '/farmer/alert/1') {
      return <AlertDetails onBack={() => setCurrentPath('/farmer/dashboard')} />;
    }
    if (currentPath === '/farmer/dashboard') {
      const userId = firebaseUser?.uid ?? 'demo-farmer-uid-001';
      return <FarmerDashboard farmer={currentFarmer} userId={userId} onNavigate={setCurrentPath} />;
    }
    if (currentPath === '/register') {
      return <FarmerRegistration onNavigate={setCurrentPath} onRegister={registerFarmer} />;
    }
    if (currentPath === '/admin/validate/1') {
      return <FarmerValidation onNavigate={setCurrentPath} />;
    }
    if (currentPath === '/login') {
      return <Login onFarmerLogin={selectFarmerForLogin} onNavigate={setCurrentPath} />;
    }
    if (currentPath === '/admin/pesticides') {
      return <PesticideManagement onNavigate={setCurrentPath} />;
    }
    if (currentPath === '/admin/robots') {
      return <RobotMonitoring onNavigate={setCurrentPath} />;
    }
    return <Login onFarmerLogin={selectFarmerForLogin} onNavigate={setCurrentPath} />;
  };

  return (
    <View style={styles.appShell}>
      {renderScreen()}
      <DemoNavigator currentPath={currentPath} onNavigate={setCurrentPath} />
    </View>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
  },
});