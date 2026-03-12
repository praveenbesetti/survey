import { View } from "react-native";
import { CartProvider } from "../context/CartContext";
import {Navbar} from "../components/Navbar";
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
// 1. Prevent the splash screen from hiding automatically
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const NAVBAR_HEIGHT = 109; // 45 padding + 64 header
useEffect(() => {
    // 2. This runs AFTER the bundle is loaded and the component mounts
    const prepare = async () => {
      try {
        // You can load fonts or API data here if needed
      } catch (e) {
        console.warn(e);
      } finally {
        // 3. Hide the splash screen only when everything is ready
        await SplashScreen.hideAsync();
      }
    };
    prepare();
  }, []);

  return (
    // 1. CartProvider MUST be at the very top level
    <CartProvider>
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        
        {/* 2. Navbar is now INSIDE the provider, so useCart() will work */}
        <Navbar />
        
        {/* 3. The Page Stack stays pushed down below the Nav */}
        <View style={{ flex: 1, marginTop: NAVBAR_HEIGHT }}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
        
      </View>
    </CartProvider>
  );
}