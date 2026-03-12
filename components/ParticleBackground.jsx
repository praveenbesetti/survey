import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export function ParticleBackground() {
  const particles = useMemo(() => {
  return Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    left: Math.random() * width,        // numeric position
    duration: 8000 + Math.random() * 7000, // ms
    delay: Math.random() * 8000,        // ms
    size: 2 + Math.random() * 3,        // numeric size
    opacity: 0.2 + Math.random() * 0.4
  }));
}, []);
  return (
    <View 
      style={styles.container} 
      pointerEvents="none" // Matches pointer-events-none
    >
      {particles.map((p) => (
        <View
          key={p.id}
          style={[
            styles.particle,
            {
              left: p.left,
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              opacity: p.opacity,
              // Note: Animations in Native require 'Animated' or 'Reanimated'
              // For a simple static conversion, we position them at the bottom
              bottom: 0, 
            }
          ]} 
        />
      ))}
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject, // Matches fixed inset-0
    zIndex: 0,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#fbbf24', // Matches bg-accent-warm
    // iOS Shadow (Matches your boxShadow)
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    // Android Shadow
    elevation: 5,
  },
});