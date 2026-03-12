import React, { useEffect, useState } from 'react';
import { useNavigate } from 'expo-router';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  Easing
} from 'react-native';
import { Check } from 'lucide-react-native';
import { useCart } from '../context/CartContext';

/**
 * OrderSuccess Component
 * Refactored to JSX (JavaScript)
 */
export function OrderSuccess({ orderId }) {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  // State for explosion particles (Type annotation removed)
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate explosion particles
    const newParticles = Array.from({
      length: 30
    }).map((_, i) => ({
      id: i,
      angle: Math.random() * Math.PI * 2,
      distance: 50 + Math.random() * 150,
      delay: Math.random() * 0.2
    }));
    setParticles(newParticles);
  }, []);

  const handleContinue = () => {
    clearCart();
    navigate('/');
  };

  const deliveryTime = new Date(Date.now() + 15 * 60000).toLocaleTimeString(
    [],
    {
      hour: '2-digit',
      minute: '2-digit'
    }
  );

  return (
    <View style={styles.overlay}>
      <View style={styles.contentContainer}>
        
        {/* Explosion Particles (Static mapping for Native) */}
        <View style={styles.particleContainer}>
          {particles.map((p) => (
            <View
              key={p.id}
              style={[
                styles.particle,
                {
                  transform: [
                    { translateX: Math.cos(p.angle) * p.distance },
                    { translateY: Math.sin(p.angle) * p.distance }
                  ],
                  opacity: 0.6 // Simplified for Native
                }
              ]} 
            />
          ))}
        </View>

        {/* Checkmark Circle */}
        <View style={styles.checkmarkCircle}>
          <Check size={48} color="#16a34a" strokeWidth={3} />
        </View>

        <Text style={styles.title}>Order Placed!</Text>

        <Text style={styles.subtitle}>
          Delivering in 15 minutes 🚀
        </Text>

        <Text style={styles.orderInfo}>
          Order #{orderId} • Arriving by {deliveryTime}
        </Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.outlineBtn}>
            <Text style={styles.outlineBtnText}>Track Order 📍</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.solidBtn} onPress={handleContinue}>
            <Text style={styles.solidBtnText}>Continue Shopping →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  particleContainer: {
    position: 'absolute',
    top: '30%', // Positioned behind the checkmark
    width: 0,
    height: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#16a34a',
    borderRadius: 3,
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    // Shadow for iOS
    shadowColor: '#16a34a',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    // Elevation for Android
    elevation: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1A1C1E',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  orderInfo: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  solidBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  solidBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  outlineBtn: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  outlineBtnText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});