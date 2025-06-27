import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Import screens
import GroceryListScreen from '../screens/GroceryListScreen';
import MealPlanScreen from '../screens/MealPlanScreen';
import NutritionScreen from '../screens/NutritionScreen';
import InfluencerMealPlansScreen from '../screens/InfluencerMealPlansScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Import theme
import { COLORS } from '../constants/theme';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={styles.tabBarContainer}>
      <LinearGradient
        colors={COLORS.gradientPrimary}
        style={styles.tabBarGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.tabBar}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const getIconName = (routeName: string) => {
              switch (routeName) {
                case 'GroceryList':
                  return 'basket';
                case 'MealPlan':
                  return 'restaurant';
                case 'Nutrition':
                  return 'fitness';
                case 'Influencers':
                  return 'people';
                case 'Profile':
                  return 'person';
                default:
                  return 'home';
              }
            };

            return (
              <View key={index} style={styles.tabItem}>
                <View style={[styles.tabButton, isFocused && styles.tabButtonActive]}>
                  <Ionicons
                    name={getIconName(route.name) as any}
                    size={24}
                    color={isFocused ? COLORS.textWhite : 'rgba(255, 255, 255, 0.6)'}
                    onPress={onPress}
                  />
                  <Text style={[
                    styles.tabLabel,
                    { color: isFocused ? COLORS.textWhite : 'rgba(255, 255, 255, 0.6)' }
                  ]}>
                    {label}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="GroceryList" 
        component={GroceryListScreen}
        options={{ tabBarLabel: 'Grocery' }}
      />
      <Tab.Screen 
        name="MealPlan" 
        component={MealPlanScreen}
        options={{ tabBarLabel: 'Meals' }}
      />
      <Tab.Screen 
        name="Nutrition" 
        component={NutritionScreen}
        options={{ tabBarLabel: 'Nutrition' }}
      />
      <Tab.Screen 
        name="Influencers" 
        component={InfluencerMealPlansScreen}
        options={{ tabBarLabel: 'Influencers' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabBarGradient: {
    paddingTop: 10,
    paddingBottom: 34, // Extra padding for iPhone home indicator
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    minHeight: 50,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default MainTabNavigator; 