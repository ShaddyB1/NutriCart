import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import store
import { store } from './src/store/store';

// Import screens and components
import OnboardingScreen from './src/screens/OnboardingScreen';
import MainTabNavigator from './src/components/MainTabNavigator';

const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor="#667eea" />
          <Stack.Navigator
            initialRouteName="Main"
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: '#f8f9fa' },
            }}
          >
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Main" component={MainTabNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
