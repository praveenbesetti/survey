import { Link, usePathname } from 'expo-router'; // 1. Added usePathname
import { Menu, ShoppingCart, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCart } from '../context/CartContext';

export function Navbar() {
  const { cartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 2. Define the current path
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    {name: 'Cart', path: '/cart' },
    { name: 'SurveyScreen', path: '/serveyscreen' }
  ];

  return (
    <View style={styles.navContainer}>
      <View style={styles.headerContent}>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🌿</Text>
            <Text style={styles.logoText}>HariyaliMart</Text>
          </TouchableOpacity>
        </Link>

        <View style={styles.actionContainer}>
          <Link href="/cart" asChild>
            <TouchableOpacity style={styles.cartButton}>
              <ShoppingCart size={24} color="#374151" />
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </Link>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} color="#374151" /> : <Menu size={24} color="#374151" />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <View style={styles.mobileMenu}>
          {navLinks.map((link) => {
            // 3. Use 'pathname' instead of 'currentPath'
            const isActive = pathname === link.path;

            return (
              <Link key={link.name} href={link.path} asChild>

                <TouchableOpacity
                  style={{ ...styles.menuItem, ...(isActive ? styles.menuItemActive : {}) }}
                  onPress={() => setIsMobileMenuOpen(false)}
                >
                  <Text style={[styles.menuItemText, isActive ? styles.menuItemTextActive : null]}>
                    {link.name}
                  </Text>
                </TouchableOpacity>
              </Link>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ... rest of your styles stay the same

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 45, // Handles the notch/status bar area
  },
  headerContent: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 24,
    marginRight: 8, // Replaces gap
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16a34a',
    letterSpacing: 0.5,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartButton: {
    padding: 8,
    position: 'relative',
    marginRight: 12, // Replaces gap between Cart and Menu
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  menuButton: {
    padding: 8,
  },
  mobileMenu: {
    backgroundColor: 'white',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    // Elevation for Android
    elevation: 5,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuItemActive: {
    backgroundColor: '#F0FDF4',
  },
  menuItemText: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '500',
  },
  menuItemTextActive: {
    color: '#16a34a',
    fontWeight: '700',
  },
});