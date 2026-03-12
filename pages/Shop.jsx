import React, { useMemo, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput 
} from 'react-native';
import { Search } from 'lucide-react-native';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';

export function Shop() {
  const { category } = useLocalSearchParams();
  const initialCategory = category || 'All';
  const { cart, addToCart, updateQuantity } = useCart();
  
  // FIXED: Changed useSyncExternalStore to useState
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = ['All', 'Leafy', 'Root', 'Gourds', 'Exotic'];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

 return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER BAR */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Fresh Vegetables</Text>
          <Text style={styles.floatingEmoji}>🌿</Text>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search fresh veggies..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* CATEGORY TABS */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContent}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[
              styles.tabButton,
              selectedCategory === cat ? styles.activeTabButton : styles.inactiveTabButton
            ]}
          >
            <Text style={[
              styles.tabText,
              selectedCategory === cat ? styles.activeTabText : styles.inactiveTabText
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* PRODUCT GRID */}
      {filteredProducts.length > 0 ? (
        <View style={styles.productGrid}>
          {filteredProducts.map((product) => {
            const cartItem = cart.find((item) => item.id === product.id);
            return (
              <View key={product.id} style={styles.gridItem}>
                <ProductCard
                  product={product}
                  isInCart={!!cartItem}
                  cartQuantity={cartItem?.quantity || 0}
                  onAdd={addToCart}
                  onUpdateQuantity={updateQuantity}
                />
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No vegetables found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your search or category filter.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1,  backgroundColor: '#F8F9FB' },
  contentContainer: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 100 },
  header: { marginBottom: 24 },
  titleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1A1C1E', marginRight: 8 },
  floatingEmoji: { fontSize: 28 },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    borderRadius: 12, 
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 48, fontSize: 16, color: '#1A1C1E' },
  tabsScroll: { marginBottom: 24, marginHorizontal: -16 },
  tabsContent: { paddingHorizontal: 16, gap: 10 },
  tabButton: { px: 20, py: 10, borderRadius: 25, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 8 },
  activeTabButton: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  inactiveTabButton: { backgroundColor: 'white', borderColor: '#E5E7EB' },
  tabText: { fontWeight: '600' },
  activeTabText: { color: 'white' },
  inactiveTabText: { color: '#6B7280' },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '48%', marginBottom: 16 }, // 2-column layout
  emptyState: { alignItems: 'center', paddingVertical: 60, backgroundColor: 'white', borderRadius: 20 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1C1E', marginBottom: 8 },
  emptySubtitle: { color: '#6B7280', textAlign: 'center' }
});