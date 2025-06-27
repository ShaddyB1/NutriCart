import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../constants/theme';
import { RootState } from '../store/store';
import {
  addItem,
  updateItem,
  removeItem,
  toggleItemCompleted,
  clearCompletedItems,
  setFilters,
  setSorting,
  setBudget,
  GroceryItem,
} from '../store/slices/groceryListSlice';

const GroceryListScreen: React.FC = () => {
  const dispatch = useDispatch();
  const {
    items,
    categories,
    totalBudget,
    currentTotal,
    filters,
    sortBy,
    sortOrder,
    isLoading,
  } = useSelector((state: RootState) => state.groceryList);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: categories[0],
    quantity: 1,
    unit: 'pcs',
    price: 0,
    notes: '',
  });
  const [budgetInput, setBudgetInput] = useState(totalBudget.toString());
  const [refreshing, setRefreshing] = useState(false);

  // Filter and sort items
  const filteredItems = items
    .filter(item => {
      if (filters.category && item.category !== filters.category) return false;
      if (filters.completed !== null && item.isCompleted !== filters.completed) return false;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'price':
          comparison = (a.price || 0) - (b.price || 0);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const completedItems = items.filter(item => item.isCompleted);
  const pendingItems = items.filter(item => !item.isCompleted);
  const budgetPercentage = totalBudget > 0 ? (currentTotal / totalBudget) * 100 : 0;

  const handleAddItem = () => {
    if (!newItem.name.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    dispatch(addItem({
      name: newItem.name.trim(),
      category: newItem.category,
      quantity: newItem.quantity,
      unit: newItem.unit,
      price: newItem.price,
      notes: newItem.notes.trim() || undefined,
    }));

    setNewItem({
      name: '',
      category: categories[0],
      quantity: 1,
      unit: 'pcs',
      price: 0,
      notes: '',
    });
    setShowAddModal(false);
  };

  const handleToggleItem = (id: string) => {
    dispatch(toggleItemCompleted(id));
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => dispatch(removeItem(id)) },
      ]
    );
  };

  const handleClearCompleted = () => {
    if (completedItems.length === 0) return;
    
    Alert.alert(
      'Clear Completed',
      `Remove ${completedItems.length} completed items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => dispatch(clearCompletedItems()) },
      ]
    );
  };

  const handleUpdateBudget = () => {
    const budget = parseFloat(budgetInput);
    if (isNaN(budget) || budget < 0) {
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }
    dispatch(setBudget(budget));
    setShowBudgetModal(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderItem = ({ item }: { item: GroceryItem }) => (
    <View style={[styles.itemContainer, item.isCompleted && styles.completedItem]}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => handleToggleItem(item.id)}
      >
        <Ionicons
          name={item.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={item.isCompleted ? COLORS.success : COLORS.textSecondary}
        />
      </TouchableOpacity>
      
      <View style={styles.itemContent}>
        <Text style={[styles.itemName, item.isCompleted && styles.completedText]}>
          {item.name}
        </Text>
        <View style={styles.itemDetails}>
          <Text style={styles.itemQuantity}>
            {item.quantity} {item.unit}
          </Text>
          <Text style={styles.itemCategory}>{item.category}</Text>
          {item.price && (
            <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
          )}
        </View>
        {item.notes && (
          <Text style={styles.itemNotes}>{item.notes}</Text>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteItem(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Grocery List</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={() => setShowFilters(true)}>
            <Ionicons name="filter" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => setShowAddModal(true)}>
            <Ionicons name="add" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Budget Summary */}
      <TouchableOpacity style={styles.budgetCard} onPress={() => setShowBudgetModal(true)}>
        <View style={styles.budgetHeader}>
          <Text style={styles.budgetTitle}>Monthly Budget</Text>
          <Text style={styles.budgetAmount}>${currentTotal.toFixed(2)} / ${totalBudget.toFixed(2)}</Text>
        </View>
        <View style={styles.budgetBar}>
          <View
            style={[
              styles.budgetProgress,
              {
                width: `${Math.min(budgetPercentage, 100)}%`,
                backgroundColor: budgetPercentage > 100 ? COLORS.error : 
                                budgetPercentage > 80 ? COLORS.warning : COLORS.success,
              },
            ]}
          />
        </View>
        <Text style={styles.budgetPercentage}>
          {budgetPercentage.toFixed(1)}% used
        </Text>
      </TouchableOpacity>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{pendingItems.length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{completedItems.length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{items.length}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
      </View>

      {/* Action Buttons */}
      {completedItems.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClearCompleted}>
          <Text style={styles.clearButtonText}>Clear {completedItems.length} Completed</Text>
        </TouchableOpacity>
      )}

      {/* Items List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="basket-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Your grocery list is empty</Text>
            <Text style={styles.emptySubtext}>Add items to get started</Text>
          </View>
        }
      />

      {/* Add Item Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Item</Text>
            <TouchableOpacity onPress={handleAddItem}>
              <Text style={styles.modalSave}>Add</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Item Name *</Text>
              <TextInput
                style={styles.textInput}
                value={newItem.name}
                onChangeText={(text) => setNewItem({ ...newItem, name: text })}
                placeholder="Enter item name"
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryContainer}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        newItem.category === category && styles.categoryChipSelected,
                      ]}
                      onPress={() => setNewItem({ ...newItem, category })}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          newItem.category === category && styles.categoryChipTextSelected,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.sm }]}>
                <Text style={styles.inputLabel}>Quantity</Text>
                <TextInput
                  style={styles.textInput}
                  value={newItem.quantity.toString()}
                  onChangeText={(text) => setNewItem({ ...newItem, quantity: parseInt(text) || 1 })}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: SPACING.sm }]}>
                <Text style={styles.inputLabel}>Unit</Text>
                <TextInput
                  style={styles.textInput}
                  value={newItem.unit}
                  onChangeText={(text) => setNewItem({ ...newItem, unit: text })}
                  placeholder="pcs, kg, lbs"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Estimated Price</Text>
              <TextInput
                style={styles.textInput}
                value={newItem.price.toString()}
                onChangeText={(text) => setNewItem({ ...newItem, price: parseFloat(text) || 0 })}
                keyboardType="decimal-pad"
                placeholder="0.00"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newItem.notes}
                onChangeText={(text) => setNewItem({ ...newItem, notes: text })}
                placeholder="Additional notes (optional)"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Budget Modal */}
      <Modal visible={showBudgetModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowBudgetModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Set Budget</Text>
            <TouchableOpacity onPress={handleUpdateBudget}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Monthly Budget</Text>
              <TextInput
                style={styles.textInput}
                value={budgetInput}
                onChangeText={setBudgetInput}
                keyboardType="decimal-pad"
                placeholder="Enter budget amount"
              />
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: SPACING.md,
  },
  budgetCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  budgetTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  budgetAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  budgetBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  budgetProgress: {
    height: '100%',
    borderRadius: 4,
  },
  budgetPercentage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  clearButton: {
    backgroundColor: COLORS.error,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  list: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  completedItem: {
    opacity: 0.6,
  },
  checkbox: {
    marginRight: SPACING.md,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginRight: SPACING.md,
  },
  itemCategory: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: SPACING.md,
  },
  itemPrice: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.success,
  },
  itemNotes: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },
  deleteButton: {
    marginLeft: SPACING.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
  },
  categoryChip: {
    backgroundColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  categoryChipTextSelected: {
    color: COLORS.surface,
  },
});

export default GroceryListScreen;
