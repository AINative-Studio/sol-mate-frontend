import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../constants/theme';
import {
  BrowseScreen,
  MessagesScreen,
  SettingsScreen,
  ChatScreen,
  CheckInScreen,
  MintNFTScreen,
} from '../screens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Bottom tab icons (simple text for MVP)
function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Browse: '🔍',
    Messages: '💬',
    Settings: '⚙️',
  };

  return (
    <View style={styles.tabIcon}>
      <Text style={styles.tabIconText}>{icons[label] || '●'}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

function MainTabs({ navigation }: any) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Browse"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Browse" focused={focused} />
          ),
        }}
      >
        {() => (
          <BrowseScreen
            onRequestMatch={(persona) => {
              // Navigate to stake confirmation or chat
              navigation.navigate('Chat', {
                matchId: 'pending',
                partnerName: persona.display_name,
              });
            }}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Messages"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Messages" focused={focused} />
          ),
        }}
      >
        {() => (
          <MessagesScreen
            onSelectChat={(matchId) => {
              navigation.navigate('Chat', { matchId });
            }}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Settings" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Chat">
        {({ route, navigation }: any) => (
          <ChatScreen
            matchId={route.params?.matchId || ''}
            partnerName={route.params?.partnerName || 'Partner'}
            onCheckIn={() =>
              navigation.navigate('CheckIn', {
                matchId: route.params?.matchId,
                partnerName: route.params?.partnerName,
              })
            }
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="CheckIn">
        {({ route, navigation }: any) => (
          <CheckInScreen
            matchId={route.params?.matchId || ''}
            partnerName={route.params?.partnerName || 'Partner'}
            onSuccess={() =>
              navigation.replace('MintNFT', {
                matchId: route.params?.matchId,
                partnerName: route.params?.partnerName,
              })
            }
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="MintNFT">
        {({ route, navigation }: any) => (
          <MintNFTScreen
            matchId={route.params?.matchId || ''}
            partnerName={route.params?.partnerName || 'Partner'}
            onComplete={() => navigation.navigate('Main', { screen: 'Settings' })}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(13,13,13,0.08)',
    height: 80,
    paddingBottom: 20,
    paddingTop: 10,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconText: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: Fonts.nunito.semiBold,
    color: 'rgba(13,13,13,0.5)',
  },
  tabLabelActive: {
    color: Colors.pink,
  },
});
