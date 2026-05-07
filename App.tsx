import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Font from 'expo-font';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WalletProvider } from './src/contexts/WalletContext';
import { Colors } from './src/constants/theme';
import SplashScreen from './src/screens/SplashScreen';
import WalletConnectScreen from './src/screens/WalletConnectScreen';
import ProfileSetupScreen from './src/screens/ProfileSetupScreen';
import AppNavigator from './src/navigation/AppNavigator';

const Stack = createNativeStackNavigator();

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string>('Splash');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const personaId = await AsyncStorage.getItem('current_persona_id');

      if (token && personaId) {
        // User is authenticated and has profile
        setInitialRoute('App');
      } else if (token) {
        // User is authenticated but no profile
        setInitialRoute('ProfileSetup');
      } else {
        // Not authenticated
        setInitialRoute('Splash');
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setInitialRoute('Splash');
    } finally {
      setIsReady(true);
    }
  };

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.pink }}>
        <ActivityIndicator size="large" color={Colors.white} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash">
          {({ navigation }) => (
            <SplashScreen onComplete={() => navigation.replace('WalletConnect')} />
          )}
        </Stack.Screen>
        <Stack.Screen name="WalletConnect">
          {({ navigation }) => (
            <WalletConnectScreen
              onWalletConnected={() => navigation.replace('ProfileSetup')}
              onExploreAnonymously={() => navigation.replace('App')}
              onBack={() => navigation.goBack()}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="ProfileSetup">
          {({ navigation }) => (
            <ProfileSetupScreen onComplete={() => navigation.replace('App')} />
          )}
        </Stack.Screen>
        <Stack.Screen name="App" component={AppNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          Nunito_400Regular,
          Nunito_600SemiBold,
          Nunito_800ExtraBold,
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Failed to load fonts:', error);
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.pink }}>
        <ActivityIndicator size="large" color={Colors.white} />
      </View>
    );
  }

  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}
