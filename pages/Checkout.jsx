import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router'; // Changed from useNavigate
import { useCart } from '../context/CartContext';
import { OrderSuccess } from '../components/OrderSuccess';

export function Checkout() {
  const router = useRouter();
  const { cart, cartCount, grandTotal } = useCart();
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    address: '',
    pincode: '',
    deliveryTime: 'express',
    timeSlot: 'morning'
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [upiId, setUpiId] = useState('');
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    if (cartCount === 0 && !orderPlaced) {
      router.push('/shop');
    }
  }, [cartCount, orderPlaced]);

  // FIXED: Removed e.target logic since React Native sends raw value
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (formData.fullName.length < 2) newErrors.fullName = 'Name too short';
    if (!/^[6-9]\d{9}$/.test(formData.mobile)) newErrors.mobile = 'Invalid mobile';
    if (formData.address.length < 10) newErrors.address = 'Address too short';
    if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Invalid pincode';
    if (!paymentMethod) newErrors.payment = 'Select payment method';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = () => {
    if (validate()) {
      setIsProcessing(true);
      setTimeout(() => {
        setOrderId('HM' + Math.floor(100000 + Math.random() * 900000));
        setIsProcessing(false);
        setOrderPlaced(true);
      }, 2000);
    }
  };

  if (orderPlaced) return <OrderSuccess orderId={orderId} />;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Delivery Details</Text>
          <View style={styles.glassCard}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={formData.fullName}
              onChangeText={(val) => handleInputChange('fullName', val)}
            />
            {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

            <TextInput
              style={[styles.input, { marginTop: 12 }]}
              placeholder="Mobile Number"
              keyboardType="phone-pad"
              value={formData.mobile}
              onChangeText={(val) => handleInputChange('mobile', val)}
            />
            {errors.mobile && <Text style={styles.errorText}>{errors.mobile}</Text>}

            <TextInput
              style={[styles.input, styles.textArea, { marginTop: 12 }]}
              placeholder="Address"
              multiline
              value={formData.address}
              onChangeText={(val) => handleInputChange('address', val)}
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

            <TextInput
              style={[styles.input, { marginTop: 12 }]}
              placeholder="Pincode"
              keyboardType="number-pad"
              value={formData.pincode}
              onChangeText={(val) => handleInputChange('pincode', val)}
            />
            {errors.pincode && <Text style={styles.errorText}>{errors.pincode}</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Payment</Text>
          <TouchableOpacity 
            style={[styles.paymentCard, paymentMethod === 'cod' && styles.paymentCardActive]}
            onPress={() => setPaymentMethod('cod')}
          >
            <Text style={styles.paymentTitle}>Cash on Delivery</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.placeOrderBtn, isProcessing && styles.btnDisabled]} 
          onPress={handlePlaceOrder}
          disabled={isProcessing}
        >
          {isProcessing ? <ActivityIndicator color="white" /> : <Text style={styles.placeOrderText}>Place Order 🌿</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  content: { padding: 16, paddingTop: 60, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1C1E', marginBottom: 12 },
  glassCard: { backgroundColor: 'white', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#EEE' },
  input: { backgroundColor: '#F9FAFB', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  textArea: { height: 80, textAlignVertical: 'top' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  paymentCard: { backgroundColor: 'white', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#EEE' },
  paymentCardActive: { borderColor: '#16a34a', backgroundColor: '#F0FDF4' },
  paymentTitle: { fontWeight: 'bold' },
  placeOrderBtn: { backgroundColor: '#16a34a', padding: 18, borderRadius: 16, alignItems: 'center' },
  placeOrderText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  btnDisabled: { opacity: 0.7 }
});