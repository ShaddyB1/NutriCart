import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  followInfluencer,
  unfollowInfluencer,
  updateInfluencerProfile,
  purchaseMealPlan,
} from '../store/slices/influencerSlice';
import { selectCurrentUser, selectCanEditProfile } from '../store/slices/authSlice';

const { width, height } = Dimensions.get('window');

interface InfluencerProfileModalProps {
  visible: boolean;
  influencer: any;
  onClose: () => void;
}

const InfluencerProfileModal: React.FC<InfluencerProfileModalProps> = ({
  visible,
  influencer,
  onClose,
}) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const canEdit = useSelector((state: any) => selectCanEditProfile(state, influencer?.id));
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(influencer);

  // Only allow editing if:
  // 1. User is logged in
  // 2. User is an influencer
  // 3. User is editing their own profile
  // 4. User is verified
  const canEditProfile = canEdit && currentUser?.isVerified;

  useEffect(() => {
    setEditedProfile(influencer);
  }, [influencer]);

  const handleSave = () => {
    if (!canEditProfile) {
      Alert.alert('Permission Denied', 'Only verified influencers can edit their profiles.');
      return;
    }

    dispatch(updateInfluencerProfile({
      id: influencer.id,
      updates: editedProfile,
    }));
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleFollow = () => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please log in to follow influencers.');
      return;
    }
    dispatch(followInfluencer(influencer.id));
  };

  const handleUnfollow = () => {
    dispatch(unfollowInfluencer(influencer.id));
  };

  const handlePurchase = (mealPlanId: string) => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please log in to purchase meal plans.');
      return;
    }
    dispatch(purchaseMealPlan(mealPlanId));
  };

  if (!influencer) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.modalHeader}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          
          {canEditProfile && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
            >
              <Ionicons 
                name={isEditing ? "checkmark" : "pencil"} 
                size={20} 
                color="white" 
              />
              <Text style={styles.editButtonText}>
                {isEditing ? "Save" : "Edit"}
              </Text>
            </TouchableOpacity>
          )}
          
          {!currentUser?.isVerified && currentUser?.id === influencer.id && (
            <View style={styles.verificationBadge}>
              <Ionicons name="time" size={16} color="orange" />
              <Text style={styles.verificationText}>Pending Verification</Text>
            </View>
          )}
        </LinearGradient>

        <ScrollView style={styles.modalContent}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: influencer.avatar }}
                style={styles.profileAvatar}
              />
              {influencer.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                </View>
              )}
            </View>
            
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={editedProfile.name}
                onChangeText={(text) => 
                  setEditedProfile({ ...editedProfile, name: text })
                }
                placeholder="Name"
              />
            ) : (
              <View style={styles.nameContainer}>
                <Text style={styles.profileName}>{influencer.name}</Text>
                {influencer.isVerified && (
                  <Text style={styles.verifiedText}>Verified Influencer</Text>
                )}
              </View>
            )}

            <View style={styles.profileStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{influencer.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{influencer.mealPlans?.length || 0}</Text>
                <Text style={styles.statLabel}>Meal Plans</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{influencer.rating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>

            {currentUser?.id !== influencer.id && (
              <TouchableOpacity
                style={[
                  styles.followButton,
                  influencer.isFollowing && styles.followingButton
                ]}
                onPress={influencer.isFollowing ? handleUnfollow : handleFollow}
              >
                <Text style={[
                  styles.followButtonText,
                  influencer.isFollowing && styles.followingButtonText
                ]}>
                  {influencer.isFollowing ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* About Section */}
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>About</Text>
            {isEditing ? (
              <TextInput
                style={styles.editTextArea}
                value={editedProfile.bio}
                onChangeText={(text) => 
                  setEditedProfile({ ...editedProfile, bio: text })
                }
                placeholder="Tell your followers about yourself..."
                multiline
                numberOfLines={4}
              />
            ) : (
              <Text style={styles.aboutText}>
                {influencer.bio || "No bio available"}
              </Text>
            )}
          </View>

          {/* Specialties */}
          <View style={styles.specialtiesSection}>
            <Text style={styles.sectionTitle}>Specialties</Text>
            <View style={styles.specialtyTags}>
              {influencer.specialties?.map((specialty: string, index: number) => (
                <View key={index} style={styles.specialtyTag}>
                  <Text style={styles.specialtyText}>{specialty}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Achievements */}
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            {influencer.achievements?.map((achievement: any, index: number) => (
              <View key={index} style={styles.achievementItem}>
                <Ionicons name="trophy" size={20} color="#FFD700" />
                <Text style={styles.achievementText}>{achievement.title}</Text>
              </View>
            ))}
          </View>

          {/* Meal Plans */}
          <View style={styles.mealPlansSection}>
            <Text style={styles.sectionTitle}>Meal Plans</Text>
            {influencer.mealPlans?.map((plan: any, index: number) => (
              <View key={index} style={styles.mealPlanCard}>
                <Image source={{ uri: plan.image }} style={styles.mealPlanImage} />
                <View style={styles.mealPlanInfo}>
                  <Text style={styles.mealPlanTitle}>{plan.title}</Text>
                  <Text style={styles.mealPlanDescription}>{plan.description}</Text>
                  <View style={styles.mealPlanFooter}>
                    <Text style={styles.mealPlanPrice}>
                      {plan.price === 0 ? "Free" : `$${plan.price}`}
                    </Text>
                    <TouchableOpacity
                      style={styles.purchaseButton}
                      onPress={() => handlePurchase(plan.id)}
                    >
                      <Text style={styles.purchaseButtonText}>
                        {plan.price === 0 ? "Get Free" : "Purchase"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {isEditing && (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsEditing(false);
                setEditedProfile(influencer);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const InfluencerMealPlansScreen: React.FC = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const { influencers, followedInfluencers } = useSelector((state: any) => state.influencer);
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Fitness', 'Vegan', 'Keto', 'Mediterranean', 'Asian', 'Family'];

  const filteredInfluencers = influencers.filter((influencer: any) => {
    const matchesSearch = influencer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
      influencer.specialties?.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleInfluencerPress = (influencer: any) => {
    setSelectedInfluencer(influencer);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Influencer Meal Plans</Text>
        <Text style={styles.headerSubtitle}>
          Discover and follow nutrition experts
        </Text>
        
        {currentUser && (
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>
              Welcome, {currentUser.name}
            </Text>
            <Text style={styles.roleText}>
              {currentUser.role === 'influencer' ? '🌟 Influencer' : '👤 User'}
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search influencers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategoryButton
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.selectedCategoryText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Influencers Grid */}
      <ScrollView style={styles.influencersContainer}>
        <View style={styles.influencersGrid}>
          {filteredInfluencers.map((influencer: any) => (
            <TouchableOpacity
              key={influencer.id}
              style={styles.influencerCard}
              onPress={() => handleInfluencerPress(influencer)}
            >
              <Image
                source={{ uri: influencer.avatar }}
                style={styles.influencerAvatar}
              />
              <Text style={styles.influencerName}>{influencer.name}</Text>
              <Text style={styles.influencerFollowers}>
                {influencer.followers} followers
              </Text>
              <View style={styles.influencerSpecialties}>
                {influencer.specialties?.slice(0, 2).map((specialty: string, index: number) => (
                  <Text key={index} style={styles.specialtyChip}>
                    {specialty}
                  </Text>
                ))}
              </View>
              <View style={styles.influencerRating}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{influencer.rating}</Text>
              </View>
              {followedInfluencers.includes(influencer.id) && (
                <View style={styles.followingBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.followingText}>Following</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Profile Modal */}
      <InfluencerProfileModal
        visible={modalVisible}
        influencer={selectedInfluencer}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchContainer: {
    padding: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 15,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedCategoryButton: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: 'white',
  },
  influencersContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  influencersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  influencerCard: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  influencerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  influencerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  influencerFollowers: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  influencerSpecialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  specialtyChip: {
    fontSize: 10,
    color: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    margin: 2,
  },
  influencerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  followingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  followingText: {
    fontSize: 10,
    color: '#4CAF50',
    marginLeft: 4,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  closeButton: {
    padding: 5,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  verifiedText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginTop: 5,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  followButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  followButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#667eea',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  aboutSection: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  specialtiesSection: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  specialtyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialtyTag: {
    backgroundColor: '#667eea',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 5,
  },
  specialtyText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  achievementsSection: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  achievementText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  mealPlansSection: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  mealPlanCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  mealPlanImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  mealPlanInfo: {
    flex: 1,
  },
  mealPlanTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  mealPlanDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  mealPlanFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealPlanPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  purchaseButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  editInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#667eea',
    paddingVertical: 5,
    marginBottom: 15,
    textAlign: 'center',
  },
  editTextArea: {
    fontSize: 16,
    color: '#666',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#667eea',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  verificationText: {
    color: 'orange',
    fontSize: 12,
    marginLeft: 5,
    fontWeight: '500',
  },
  userInfo: {
    alignItems: 'center',
    marginTop: 10,
  },
  welcomeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  roleText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
  },
});

export default InfluencerMealPlansScreen; 