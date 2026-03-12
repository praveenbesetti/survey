import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

const categoryList = [
  { id: 1, name: 'Vegetables', path: '/shop', icon: '🥦', color: '#F0FDF4', desc: 'Fresh from Farm' },
  { id: 2, name: 'Fruits', path: '/shop', icon: '🍎', color: '#FEF2F2', desc: 'Sweet & Juicy' },
  { id: 3, name: 'Milk & Dairy', path: '/shop', icon: '🥛', color: '#EFF6FF', desc: 'Fresh Milk & Paneer' },
  { id: 4, name: 'Oil & Ghee', path: '/shop', icon: '🧈', color: '#FEFCE8', desc: 'Cooking Essentials' },
  { id: 5, name: 'Ice Cream', path: '/shop', icon: '🍦', color: '#FDF2F7', desc: 'Frozen Delights' },
  { id: 6, name: 'Rice & Grains', path: '/shop', icon: '🌾', color: '#FFF7ED', desc: 'Premium Quality' },
  { id: 7, name: 'Atta & Dal', path: '/shop', icon: '🍞', color: '#FFFBEB', desc: 'Daily Staples' },
  { id: 8, name: 'Beverages', path: '/shop', icon: '🥤', color: '#FAF5FF', desc: 'Juices & Soda' },
];

export function Categories() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>What are you looking for?</Text>
        <Text style={styles.subtitle}>Order items in minutes</Text>
      </View>

      <View style={styles.grid}>
        {categoryList.map((cat) => (
          <Link key={cat.id} href={cat.path} asChild>
            <TouchableOpacity style={styles.card}>
              <View style={[styles.iconContainer, { backgroundColor: cat.color }]}>
                <Text style={styles.iconText}>{cat.icon}</Text>
              </View>
              <Text style={styles.catName}>{cat.name}</Text>
              <Text style={styles.catDesc}>{cat.desc}</Text>
            </TouchableOpacity>
          </Link>
        ))}
      </View>

      <View style={styles.banner}>
        <View>
          <Text style={styles.bannerTitle}>Superfast Delivery</Text>
          <Text style={styles.bannerSubtitle}>Get your groceries in 15 mins</Text>
        </View>
        <Text style={styles.bolt}>⚡</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  content: { padding: 16, paddingTop: 60, paddingBottom: 40 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '900', color: '#1A1C1E', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { 
    backgroundColor: 'white', 
    width: '48%', 
    borderRadius: 20, 
    padding: 16, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
    elevation: 2
  },
  iconContainer: { 
    width: '100%', 
    aspectRatio: 1, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 12
  },
  iconText: { fontSize: 40 },
  catName: { fontSize: 14, fontWeight: 'bold', color: '#1A1C1E', marginBottom: 2 },
  catDesc: { fontSize: 10, color: '#999', fontWeight: '600', textTransform: 'uppercase' },
  banner: { 
    marginTop: 20, 
    backgroundColor: '#DCFCE7', 
    borderRadius: 20, 
    padding: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#BBF7D0'
  },
  bannerTitle: { color: '#16a34a', fontWeight: 'bold', fontSize: 18 },
  bannerSubtitle: { color: '#666', fontSize: 12 },
  bolt: { fontSize: 24 }
});