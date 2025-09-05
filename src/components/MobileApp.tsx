import { useState } from "react";
import SplashScreen from "@/pages/SplashScreen";
import LoginScreen from "@/pages/LoginScreen";
import HomeScreen from "@/pages/HomeScreen";
import MapScreen from "@/pages/MapScreen";
import ItineraryScreen from "@/pages/ItineraryScreen";
import EmergencyScreen from "@/pages/EmergencyScreen";
import ProfileScreen from "@/pages/ProfileScreen";
import SettingsScreen from "@/pages/SettingsScreen";
import BottomNavigation from "@/components/BottomNavigation";

type AppState = 'splash' | 'login' | 'app';
type ActiveTab = 'home' | 'map' | 'itinerary' | 'profile' | 'settings' | 'emergency';

const MobileApp = () => {
  const [appState, setAppState] = useState<AppState>('splash');
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  const handleSplashComplete = () => {
    setAppState('login');
  };

  const handleLogin = () => {
    setAppState('app');
  };

  const handleNavigate = (page: string) => {
    setActiveTab(page as ActiveTab);
  };

  if (appState === 'splash') {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (appState === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} />;
      case 'map':
        return <MapScreen />;
      case 'itinerary':
        return <ItineraryScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'emergency':
        return <EmergencyScreen />;
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="pb-16">
        {renderActiveScreen()}
      </div>
      {activeTab !== 'emergency' && (
        <BottomNavigation activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as ActiveTab)} />
      )}
    </div>
  );
};

export default MobileApp;