import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AlertDetails from './src/components/AlertDetails';
import AdminDashboard, { AdminFarmer, initialAdminFarmers } from './src/components/AdminDashboard';
import DemoNavigator, { DemoRoute } from './src/components/DemoNavigator';
import FarmerDashboard from './src/components/FarmerDashboard';
import FarmerRegistration from './src/components/FarmerRegistration';
import FarmerValidation from './src/components/FarmerValidation';
import Login from './src/components/Login';
import PesticideManagement from './src/components/PesticideManagement';
import RobotMonitoring from './src/components/RobotMonitoring';

export default function App() {
  const [currentPath, setCurrentPath] = useState<DemoRoute>('/login');
  const [farmers, setFarmers] = useState<AdminFarmer[]>(initialAdminFarmers);
  const [currentFarmer, setCurrentFarmer] = useState<AdminFarmer>(initialAdminFarmers[0]);

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
      return <FarmerDashboard farmer={currentFarmer} onNavigate={setCurrentPath} />;
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
