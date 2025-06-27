import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Switch,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../constants/theme';
import { RootState } from '../store/store';
import { logout, updateUserProfile } from '../store/slices/authSlice';

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { currentUser, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { achievements, totalPoints, currentLevel } = useSelector((state: RootState) => state.achievement);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [editForm, setEditForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    height: '',
    weight: '',
    age: '',
    activityLevel: 'moderate',
    dietaryGoals: 'maintain',
  });

  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    metricUnits: true,
    syncWithHealth: false,
    shareProgress: true,
    weeklyReports: true,
  });

  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const progressToNext = currentLevel > 0 ? ((totalPoints % 100) / 100) * 100 : 0;

  const handleSaveProfile = () => {
    dispatch(updateUserProfile({
      name: editForm.name,
      email: editForm.email,
    }));
    setShowEditProfile(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) },
      ]
    );
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={24} color={COLORS.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />}
    </TouchableOpacity>
  );

  const renderStatCard = (title: string, value: string | number, icon: string) => (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons name={icon as any} size={24} color={COLORS.primary} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
                       <Image
             source={{
               uri: currentUser?.avatar || 'https://via.placeholder.com/100x100/667eea/ffffff?text=U'
             }}
             style={styles.avatar}
           />
           <TouchableOpacity style={styles.editAvatarButton}>
             <Ionicons name="camera" size={16} color={COLORS.textWhite} />
           </TouchableOpacity>
         </View>
         
         <Text style={styles.userName}>{currentUser?.name || 'User'}</Text>
         <Text style={styles.userEmail}>{currentUser?.email || 'user@example.com'}</Text>
          
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => setShowEditProfile(true)}
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Level Progress */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <Text style={styles.levelTitle}>Level {currentLevel}</Text>
            <Text style={styles.levelPoints}>{totalPoints} points</Text>
          </View>
          <View style={styles.levelProgressBar}>
            <View
              style={[
                styles.levelProgressFill,
                { width: `${progressToNext}%` },
              ]}
            />
          </View>
          <Text style={styles.levelProgressText}>
            {100 - (totalPoints % 100)} points to level {currentLevel + 1}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            {renderStatCard('Achievements', unlockedAchievements.length, 'trophy')}
            {renderStatCard('Streak', '7 days', 'flame')}
            {renderStatCard('Meals Planned', '24', 'restaurant')}
            {renderStatCard('Recipes Tried', '12', 'book')}
          </View>
        </View>

        {/* Recent Achievements */}
        <View style={styles.achievementsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.achievementsList}>
              {unlockedAchievements.slice(0, 5).map((achievement) => (
                <View key={achievement.id} style={styles.achievementCard}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementPoints}>{achievement.points} pts</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Settings */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          {renderSettingItem(
            'notifications',
            'Notifications',
            'Meal reminders, achievements',
            () => setShowNotifications(true)
          )}
          
          {renderSettingItem(
            'settings',
            'General Settings',
            'Units, theme, language',
            () => setShowSettings(true)
          )}
          
          {renderSettingItem(
            'shield-checkmark',
            'Privacy & Security',
            'Data sharing, account security',
            () => setShowPrivacy(true)
          )}
          
          {renderSettingItem(
            'help-circle',
            'Help & Support',
            'FAQ, contact support'
          )}
          
          {renderSettingItem(
            'information-circle',
            'About',
            'Version 1.0.0'
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditProfile} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditProfile(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.name}
                onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                placeholder="Enter your name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.email}
                onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                placeholder="Enter your email"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.sm }]}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.height}
                  onChangeText={(text) => setEditForm({ ...editForm, height: text })}
                  placeholder="170"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: SPACING.sm }]}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.weight}
                  onChangeText={(text) => setEditForm({ ...editForm, weight: text })}
                  placeholder="70"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.age}
                onChangeText={(text) => setEditForm({ ...editForm, age: text })}
                placeholder="25"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Activity Level</Text>
              <View style={styles.pickerContainer}>
                {['sedentary', 'light', 'moderate', 'active', 'very_active'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.pickerOption,
                      editForm.activityLevel === level && styles.pickerOptionSelected,
                    ]}
                    onPress={() => setEditForm({ ...editForm, activityLevel: level })}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        editForm.activityLevel === level && styles.pickerOptionTextSelected,
                      ]}
                    >
                      {level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Dietary Goals</Text>
              <View style={styles.pickerContainer}>
                {['lose_weight', 'maintain', 'gain_weight', 'build_muscle'].map((goal) => (
                  <TouchableOpacity
                    key={goal}
                    style={[
                      styles.pickerOption,
                      editForm.dietaryGoals === goal && styles.pickerOptionSelected,
                    ]}
                    onPress={() => setEditForm({ ...editForm, dietaryGoals: goal })}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        editForm.dietaryGoals === goal && styles.pickerOptionTextSelected,
                      ]}
                    >
                      {goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={showSettings} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Text style={styles.modalCancel}>Done</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Settings</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          <ScrollView style={styles.modalContent}>
            {renderSettingItem(
              'moon',
              'Dark Mode',
              undefined,
              undefined,
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => setSettings({ ...settings, darkMode: value })}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            )}
            
            {renderSettingItem(
              'speedometer',
              'Metric Units',
              'Use kg, cm instead of lbs, ft',
              undefined,
              <Switch
                value={settings.metricUnits}
                onValueChange={(value) => setSettings({ ...settings, metricUnits: value })}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            )}
            
            {renderSettingItem(
              'fitness',
              'Sync with Health App',
              'Import data from Apple Health',
              undefined,
              <Switch
                value={settings.syncWithHealth}
                onValueChange={(value) => setSettings({ ...settings, syncWithHealth: value })}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            )}
            
            {renderSettingItem(
              'share',
              'Share Progress',
              'Allow sharing achievements',
              undefined,
              <Switch
                value={settings.shareProgress}
                onValueChange={(value) => setSettings({ ...settings, shareProgress: value })}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Notifications Modal */}
      <Modal visible={showNotifications} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowNotifications(false)}>
              <Text style={styles.modalCancel}>Done</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Notifications</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          <ScrollView style={styles.modalContent}>
            {renderSettingItem(
              'notifications',
              'Push Notifications',
              'Enable all notifications',
              undefined,
              <Switch
                value={settings.notifications}
                onValueChange={(value) => setSettings({ ...settings, notifications: value })}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            )}
            
            {renderSettingItem(
              'restaurant',
              'Meal Reminders',
              'Remind me to log meals'
            )}
            
            {renderSettingItem(
              'water',
              'Water Reminders',
              'Remind me to drink water'
            )}
            
            {renderSettingItem(
              'trophy',
              'Achievement Alerts',
              'Notify when I unlock achievements'
            )}
            
            {renderSettingItem(
              'calendar',
              'Weekly Reports',
              'Send weekly progress summary',
              undefined,
              <Switch
                value={settings.weeklyReports}
                onValueChange={(value) => setSettings({ ...settings, weeklyReports: value })}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
              />
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.surface,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.border,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  editProfileButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  editProfileText: {
    color: COLORS.textWhite,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  levelCard: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  levelTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  levelPoints: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  levelProgressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  levelProgressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  seeAllText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
  },
  statsContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: COLORS.surface,
    width: '48%',
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  statTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  achievementsContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  achievementsList: {
    flexDirection: 'row',
    paddingRight: SPACING.lg,
  },
  achievementCard: {
    backgroundColor: COLORS.surface,
    width: 120,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  achievementTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  achievementPoints: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  settingsContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingIcon: {
    marginRight: SPACING.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  settingSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  modalCancel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  modalSave: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalHeaderSpacer: {
    width: 50,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
  },
  row: {
    flexDirection: 'row',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pickerOption: {
    backgroundColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  pickerOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  pickerOptionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  pickerOptionTextSelected: {
    color: COLORS.textWhite,
  },
});

export default ProfileScreen;
