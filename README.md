# NutriCart React Native 📱🥗

A comprehensive **React Native mobile app** for smart nutrition tracking and grocery planning, converted from the original Flutter app with modern Cooper AI styling.

## 🚀 Features

### ✅ **Implemented**
- **🎨 Cooper AI Theme**: Modern purple-blue gradient design
- **📱 Native Mobile Experience**: True React Native app (not web-based)
- **🔐 User Authentication & Onboarding**: Complete profile setup
- **🏠 Dashboard**: Beautiful home screen with stats and quick actions
- **📊 Redux State Management**: Centralized app state with AsyncStorage
- **🎯 Navigation**: Tab-based navigation with stack navigation
- **📱 Cross-Platform**: Works on both iOS and Android

### 🚧 **Coming Soon** (Ready to Implement)
- **🛒 Grocery List Management**: Add, edit, and organize grocery items
- **🍽️ Meal Planning**: Weekly meal planning with nutrition tracking
- **📈 Nutrition Tracking**: Daily calorie and macro tracking
- **👥 Influencer Meal Plans**: Follow fitness influencers and their meal plans
- **💰 Budget Alternatives**: Smart cost-saving suggestions
- **📍 Location Services**: Find nearby stores with price comparison
- **🏆 Achievement System**: Gamification with progress tracking
- **🔄 Offline Support**: Works without internet connection

## 🛠️ Tech Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build tools
- **TypeScript**: Type-safe development
- **Redux Toolkit**: State management
- **React Navigation**: Navigation library
- **AsyncStorage**: Local data persistence
- **Expo Linear Gradient**: Beautiful gradient backgrounds
- **Expo Vector Icons**: Comprehensive icon library

## 📱 Installation & Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Studio

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd NutriCartNative
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   # or
   npx expo start
   ```

4. **Run on device/simulator:**
   - **iOS**: Press `i` in terminal or scan QR code with Camera app
   - **Android**: Press `a` in terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in terminal (for testing only)

## 📁 Project Structure

```
NutriCartNative/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── MainTabNavigator.tsx
│   │   ├── LoadingScreen.tsx
│   │   ├── OnboardingScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── GroceryListScreen.tsx
│   │   ├── MealPlanScreen.tsx
│   │   ├── NutritionScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── store/              # Redux store and slices
│   │   ├── store.ts
│   │   └── slices/
│   │       ├── userSlice.ts
│   │       ├── groceryListSlice.ts
│   │       └── ...
│   ├── services/           # API and business logic
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── constants/          # App constants and theme
│   │   └── theme.ts
│   └── utils/              # Utility functions
├── assets/                 # Images, fonts, etc.
├── App.tsx                 # Main app component
└── package.json
```

## 🎨 Design System

### Cooper AI Theme
- **Primary**: Purple to blue gradient (#667eea → #764ba2)
- **Secondary**: Pink to coral gradient (#f093fb → #f5576c)
- **Accent**: Blue to cyan gradient (#4facfe → #00f2fe)

### Typography
- **Display**: 48px (Headers)
- **XXL**: 32px (Titles)
- **XL**: 24px (Section headers)
- **LG**: 20px (Body large)
- **MD**: 16px (Body)
- **SM**: 14px (Caption)

### Spacing
- **XS**: 4px
- **SM**: 8px
- **MD**: 16px
- **LG**: 24px
- **XL**: 32px
- **XXL**: 48px

## 📱 App Flow

1. **Loading Screen**: App initialization and data loading
2. **Onboarding**: New user profile setup (skipped if completed)
3. **Home Dashboard**: Main app interface with navigation tabs
4. **Tab Navigation**: 
   - Home (Dashboard)
   - Grocery (Shopping lists)
   - Meals (Meal planning)
   - Nutrition (Tracking)
   - Profile (Settings)

## 🔧 Development

### Running the App
```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web (for testing)
npm run web
```

### Building for Production
```bash
# Build for iOS
npx expo build:ios

# Build for Android
npx expo build:android

# Create standalone apps
npx expo export
```

## 📊 State Management

The app uses **Redux Toolkit** with the following slices:
- `userSlice`: User authentication and profile
- `groceryListSlice`: Shopping list management
- `mealPlanSlice`: Meal planning and recipes
- `nutritionSlice`: Nutrition tracking and goals
- `recipeSlice`: Recipe database and favorites
- `influencerSlice`: Influencer following and meal plans
- `budgetSlice`: Budget tracking and alternatives
- `achievementSlice`: Gamification and progress
- `locationSlice`: Location services and stores
- `offlineSlice`: Offline data synchronization

## 🔄 Migration from Web to React Native

This app was converted from a React web application to React Native with the following changes:

### ✅ **Completed Migrations**
- **UI Components**: Web divs → React Native Views
- **Styling**: CSS → StyleSheet
- **Navigation**: React Router → React Navigation
- **Storage**: LocalStorage → AsyncStorage
- **Icons**: Web icons → Expo Vector Icons
- **Gradients**: CSS gradients → Expo Linear Gradient

### 🚧 **Pending Migrations**
- Service layer conversion (grocery, meal planning, etc.)
- Location services with native GPS
- Push notifications
- Camera integration for food scanning
- Biometric authentication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Next Steps

1. **Complete Feature Migration**: Implement all features from the web version
2. **Native Integrations**: Add camera, GPS, and push notifications
3. **Performance Optimization**: Optimize for mobile performance
4. **App Store Deployment**: Prepare for iOS App Store and Google Play Store
5. **Testing**: Add comprehensive unit and integration tests

---

**Built with ❤️ using React Native and Expo**

For questions or support, please open an issue on GitHub. 