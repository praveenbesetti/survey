import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions
} from 'react-native';
import { Link, useRouter } from 'expo-router'; // Added useRouter

const { width } = Dimensions.get('window');

const floatingVeg = ['🥬', '🥕', '🥒', '🥦', '🍅', '🍆'];

const categories = [
  { name: 'Leafy', emoji: '🥬', img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop' },
  { name: 'Root', emoji: '🥕', img: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop' },
  { name: 'Gourds', emoji: '🥒', img: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&h=300&fit=crop' },
  { name: 'Exotic', emoji: '🥦', img: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop' }
];

// CHANGED: Use named export to prevent "undefined" import errors
export function Landing() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* HERO SECTION */}
      <View style={styles.heroSection}>
        {floatingVeg.map((emoji, i) => (
          <Text key={i} style={[styles.floatingEmoji, {
            top: 50 + (i * 60),
            left: (i % 2 === 0) ? 20 : width - 60
          }]}>
            {emoji}
          </Text>
        ))}

        <View style={styles.heroContent}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>⚡ 15 Min Delivery</Text>
          </View>

          <Text style={styles.heroTitle}>
            <Text style={styles.titleMagic}>Fresh Magic{"\n"}</Text>
            <Text style={styles.titleSub}>Delivered in 15 Minutes</Text>
          </Text>

          <Text style={styles.heroDescription}>
            Experience the enchantment of farm-fresh vegetables arriving at your
            doorstep faster than you can say Hariyali.
          </Text>

          <View style={styles.heroButtons}>
            <Link href="/shop" asChild>
              <TouchableOpacity style={styles.glowBtn}>
                <Text style={styles.glowBtnText}>Shop Now →</Text>
              </TouchableOpacity>
            </Link>
            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={() => router.push('/offers')} // Example usage of router
            >
              <Text style={styles.outlineBtnText}>View Offers</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* FEATURES SECTION */}
      <View style={styles.featuresSection}>
        <FeatureCard
          emoji="⚡"
          title="15 Min Delivery"
          desc="From farm to your door faster than you can say vegetables."
        />
        <FeatureCard
          emoji="🌱"
          title="100% Farm Fresh"
          desc="Sourced directly from verified local farms every morning."
        />
        <FeatureCard
          emoji="💰"
          title="Best Price"
          desc="Farm-direct pricing means you save up to 40% vs supermarkets."
        />
      </View>

      {/* CATEGORIES PREVIEW */}
      <View style={styles.categoryGrid}>
        {categories.map((cat) => (
          <Link key={cat.name} href={{ pathname: "/shop", params: { category: cat.name } }} asChild>
            <TouchableOpacity style={styles.categoryCard}>
              <ImageBackground source={{ uri: cat.img }} style={styles.catImage} imageStyle={{ borderRadius: 16 }}>
                <View style={styles.catOverlay}>
                  <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  <Text style={styles.catName}>{cat.name}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          </Link>
        ))}
      </View>

      {/* TESTIMONIALS */}
      <View style={styles.testimonialSection}>
        <Text style={styles.sectionTitle}>Customer Stories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20 }}>
          <TestimonialCard stars="⭐⭐⭐⭐⭐" text="Freshest vegetables I've ever had delivered!" author="Priya S." />
          <TestimonialCard stars="⭐⭐⭐⭐⭐" text="15 minutes is real! I timed it." author="Rahul M." />
        </ScrollView>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.footerBrand}>🌿 HariyaliMart</Text>
        <Text style={styles.footerText}>Fresh from farm to your door, with a little magic.</Text>
        <Text style={styles.copyright}>© {new Date().getFullYear()} HariyaliMart</Text>
      </View>
    </ScrollView>
  );
}

const FeatureCard = ({ emoji, title, desc }) => (
  <View style={styles.glassCard}>
    <Text style={styles.featureEmoji}>{emoji}</Text>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDesc}>{desc}</Text>
  </View>
);

const TestimonialCard = ({ stars, text, author }) => (
  <View style={styles.testimonialCard}>
    <Text style={styles.stars}>{stars}</Text>
    <Text style={styles.testiText}>{text}</Text>
    <Text style={styles.testiAuthor}>— {author}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  heroSection: { minHeight: 500, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60 },
  floatingEmoji: { position: 'absolute', fontSize: 40, opacity: 0.1 },
  heroContent: { alignItems: 'center', zIndex: 10 },
  badge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.2)',
    marginBottom: 20
  },
  badgeText: { color: '#16a34a', fontWeight: 'bold', fontSize: 12 },
  heroTitle: { textAlign: 'center', marginBottom: 20 },
  titleMagic: { fontSize: 48, color: '#16a34a', fontWeight: '900' },
  titleSub: { fontSize: 28, color: '#1A1C1E', fontWeight: 'bold' },
  heroDescription: { textAlign: 'center', fontSize: 16, color: '#6B7280', lineHeight: 24, marginBottom: 30 },
  heroButtons: { width: '100%', gap: 12 },
  glowBtn: { backgroundColor: '#16a34a', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  glowBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold', width:'50%' },
  outlineBtn: { borderWidth: 2, borderColor: '#16a34a', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  outlineBtnText: { color: '#16a34a', fontSize: 18, fontWeight: 'bold' },
  featuresSection: { padding: 20, gap: 16 },
  glassCard: { backgroundColor: '#F9FAFB', padding: 24, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  featureEmoji: { fontSize: 40, marginBottom: 12 },
  featureTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1C1E', marginBottom: 8 },
  featureDesc: { textAlign: 'center', color: '#6B7280', fontSize: 14 },
  categorySection: { padding: 20 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, color: '#1A1C1E' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: { width: '48%', height: 160, marginBottom: 16 },
  catImage: { flex: 1, justifyContent: 'flex-end' },
  catOverlay: { backgroundColor: 'rgba(0,0,0,0.4)', padding: 12, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  catEmoji: { fontSize: 20 },
  catName: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  testimonialSection: { paddingVertical: 40, backgroundColor: '#F8F9FB' },
  testimonialCard: { backgroundColor: 'white', padding: 20, borderRadius: 20, marginRight: 16, width: width * 0.7, borderWidth: 1, borderColor: '#EEE' },
  stars: { marginBottom: 8 },
  testiText: { fontSize: 14, fontStyle: 'italic', color: '#1A1C1E', marginBottom: 10 },
  testiAuthor: { fontWeight: 'bold', color: '#6B7280' },
  footer: { padding: 60, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EEE' },
  footerBrand: { fontSize: 22, fontWeight: 'bold', color: '#16a34a', marginBottom: 10 },
  footerText: { textAlign: 'center', color: '#6B7280', marginBottom: 20 },
  copyright: { fontSize: 12, color: '#9CA3AF' }
});