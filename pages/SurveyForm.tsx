import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_BASE } from '../baseUrl';
interface RadioButtonProps {
  label: string;
  value: string;
  selected?: boolean;
  onPress?: () => void;
}

interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  children: React.ReactNode;
}

interface ConsumptionItem {
  value: number;
  unit: string;
  originalInput: string;
}

interface FormState {
  surveyorId: string;
  wardArea: string;
  doorNumber: string;
  familyHead: string;
  mobile: string;
  familyMembers: string;
  familyMembersOther: string;
  familyType: string;
  occupation: string;
  occupationOther: string;
  grocerySource: string;
  grocerySourceOther: string;
  monthlySpending: string;
  monthlySpendingOther: string;
  purchaseFrequency: string;
  purchaseFrequencyOther: string;
  brandedPreference: string;
  productType: string;
  cheaperOption: string;
  orderMethod: string;
  consumption: Record<string, string>;
}

const consumptionItems = [
  { key: 'rice', label: 'Rice' },
  { key: 'wheat', label: 'Wheat / Atta' },
  { key: 'toorDal', label: 'Toor Dal' },
  { key: 'moongDal', label: 'Moong Dal' },
  { key: 'chanaDal', label: 'Chana Dal' },
  { key: 'oil', label: 'Cooking Oil' },
  { key: 'sugar', label: 'Sugar' },
  { key: 'salt', label: 'Salt' },
  { key: 'tea', label: 'Tea Powder' },
  { key: 'milk', label: 'Milk' },
  { key: 'eggs', label: 'Eggs' },
  { key: 'bathSoap', label: 'Bath Soap' },
  { key: 'shampoo', label: 'Shampoo' },
  { key: 'detergent', label: 'Detergent Powder' },
  { key: 'dishWash', label: 'Dish Wash' },
  { key: 'toothpaste', label: 'Toothpaste' },
  { key: 'other', label: 'Other (if any product used monthly)' }
];

const RadioGroup = ({ name, value, onChange, children }: RadioGroupProps) => {
  return (
    <View>
      {React.Children.map(children, child =>
        React.isValidElement<RadioButtonProps>(child) ? React.cloneElement(child, { selected: child.props.value === value, onPress: () => onChange(name, child.props.value) }) : child
      )}
    </View>
  );
};

const RadioButton = ({ label, value, selected = false, onPress }: RadioButtonProps) => (
  <TouchableOpacity onPress={onPress} style={styles.radioButton}>
    <View style={[styles.radioCircle, selected && styles.selected]} />
    <Text style={styles.radioLabel}>{label}</Text>
  </TouchableOpacity>
);

const App = () => {

  const router = useRouter();
  const [agentData, setAgentData] = useState(null);
  const [form, setForm] = useState<FormState>({
    
    surveyorId: '',
    wardArea: '',
    doorNumber: '',
    familyHead: '',
    mobile: '',
    familyMembers: '',
    familyMembersOther: '',
    familyType: '',
    occupation: '',
    occupationOther: '',
    grocerySource: '',
    grocerySourceOther: '',
    monthlySpending: '',
    monthlySpendingOther: '',
    purchaseFrequency: '',
    purchaseFrequencyOther: '',
    brandedPreference: '',
    productType: '',
    cheaperOption: '',
    orderMethod: '',
    consumption: {}
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (name: string, value: string) => setForm({ ...form, [name]: value });

  const handleConsumptionChange = (name: string, value: string) => {
    setForm({
      ...form,
      consumption: {
        ...form.consumption,
        [name]: value
      }
    });
  };

  const parseConsumption = (input: string): ConsumptionItem | null => {
    if (!input) return null;
    const originalInput = input.trim().toLowerCase();
    const nums = originalInput.match(/[\d.]+/g)?.map(Number) || [];
    const value = nums.length > 1 ? Math.max(...nums) : nums[0] || 0;
    let unit = 'unit';
    if (originalInput.includes('kg')) unit = 'kg';
    else if (originalInput.includes('g')) unit = 'g';
    else if (originalInput.includes('ml')) unit = 'ml';
    else if (originalInput.includes('litre') || originalInput.includes('l')) unit = 'L';
    else if (originalInput.includes('packet')) unit = 'packet';
    else if (originalInput.includes('piece')) unit = 'piece';
    else if (originalInput.includes('nos') || originalInput.includes('no')) unit = 'nos';
    else if (originalInput.includes('bottle')) unit = 'bottle';
    else if (originalInput.includes('bar') || originalInput.includes('soap')) unit = 'bar';
    else if (originalInput.includes('tube')) unit = 'tube';
    else if (originalInput.includes('pcs') || originalInput.includes('piece')) unit = 'piece';
    else if (originalInput.includes('egg')) unit = 'piece';
    return { value, unit, originalInput };
  };

  const getMaxFromRange = (value: string): number | null => {
    if (!value) return null;
    const nums = value.match(/\d+/g)?.map(Number);
    if (!nums) return null;
    return Math.max(...nums);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const formattedConsumption: Record<string, ConsumptionItem | null> = {};
    Object.entries(form.consumption).forEach(([key, val]) => {
      formattedConsumption[key] = parseConsumption(val as string);
    });
    console.log(agentData);
    const payload = {
      ...form,
      districtName: agentData?.districtName,
    MandalName: agentData?.mandalName,
    VillageName: agentData?.villageName,
      familyMembersMax: form.familyMembers === 'More than 8' ? Number(form.familyMembersOther) : getMaxFromRange(form.familyMembers),
      monthlySpendingMax: form.monthlySpending === 'More than 10000' ? Number(form.monthlySpendingOther) : getMaxFromRange(form.monthlySpending),
      consumption: formattedConsumption
    };
    try {
      await axios.post(`${API_BASE}/api/form`, payload);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to submit survey: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };


  useEffect(() => {
    const loadAgentData = async () => {
      try {
        const savedValue = await AsyncStorage.getItem("loggedAgent");

        if (!savedValue) {
          router.replace("/serveyscreen"); // redirect to login
          return;
        }
        const agent = JSON.parse(savedValue);
        setAgentData({
          districtName: agent?.districtName || "",
          mandalName: agent?.mandalName || "",
          villageName: agent?.villageName || "",
        });
      } catch (error) {
        console.log("Error loading agent data:", error);
      }
    };

    loadAgentData();
  }, []);

  const resetForm = () => {
    setForm({
      surveyorId: '',
      wardArea: '',
      doorNumber: '',
      familyHead: '',
      mobile: '',
      familyMembers: '',
      familyMembersOther: '',
      familyType: '',
      occupation: '',
      occupationOther: '',
      grocerySource: '',
      grocerySourceOther: '',
      monthlySpending: '',
      monthlySpendingOther: '',
      purchaseFrequency: '',
      purchaseFrequencyOther: '',
      brandedPreference: '',
      productType: '',
      cheaperOption: '',
      orderMethod: '',
      consumption: {}
    });
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successCard}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          <Text style={styles.successTitle}>Survey Submitted Successfully!</Text>
          <Text style={styles.successMessage}>
            Thank you for your valuable input. Your responses will help us improve our digital supermarket services.
          </Text>
          <TouchableOpacity style={styles.newSurveyButton} onPress={resetForm}>
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.newSurveyButtonText}>Start New Survey</Text>
          </TouchableOpacity>
        </View>

      </View>

    );
  }
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("loggedAgent");
      router.replace("/serveyscreen");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            handleLogout();
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff5f5', padding: 8, borderRadius: 8 }}>
            <Ionicons name="log-out-outline" size={18} color="red" />
            <Text style={{ color: 'red', fontWeight: 'bold', marginLeft: 5 }}>Logout</Text>
          </View>
        </TouchableOpacity>

        <Ionicons name="clipboard-outline" size={40} color="#007bff" />
        <Text style={styles.title}>Village Digital Supermarket Survey</Text>
        <Text style={styles.subtitle}>Help us understand your grocery needs</Text>

      </View>

      <View style={styles.formContainer}>
        {/* Q1–Q5 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={24} color="#007bff" />
            <Text style={styles.sectionTitle}>Basic Information</Text>
          </View>
          <View style={styles.inputRow}>
            <Ionicons name="id-card-outline" size={20} color="#666" />
            <TextInput style={styles.input} placeholder="Surveyor ID" value={form.surveyorId} onChangeText={(text) => handleChange('surveyorId', text)} />
          </View>

          <View style={styles.inputRow}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <TextInput style={styles.input} placeholder="Ward / Area Name" value={form.wardArea} onChangeText={(text) => handleChange('wardArea', text)} />
          </View>

          <View style={styles.inputRow}>
            <Ionicons name="home-outline" size={20} color="#666" />
            <TextInput style={styles.input} placeholder="House Door Number" value={form.doorNumber} onChangeText={(text) => handleChange('doorNumber', text)} />
          </View>

          <View style={styles.inputRow}>
            <Ionicons name="people-outline" size={20} color="#666" />
            <TextInput style={styles.input} placeholder="Name of the Family Head" value={form.familyHead} onChangeText={(text) => handleChange('familyHead', text)} />
          </View>

          <View style={styles.inputRow}>
            <Ionicons name="call-outline" size={20} color="#666" />
            <TextInput style={styles.input} placeholder="Mobile Number (Optional)" value={form.mobile} onChangeText={(text) => handleChange('mobile', text)} keyboardType="phone-pad" />
          </View>
        </View>

        {/* Q6, Q11, Q12 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-circle-outline" size={24} color="#007bff" />
            <Text style={styles.sectionTitle}>Family Details</Text>
          </View>
          <Text style={styles.question}>6. Number of family members:</Text>
          <RadioGroup name="familyMembers" value={form.familyMembers} onChange={handleChange}>
            <RadioButton value="1-2" label="1 – 2" />
            <RadioButton value="3-4" label="3 – 4" />
            <RadioButton value="5-6" label="5 – 6" />
            <RadioButton value="6-8" label="6 – 8" />
            <RadioButton value="More than 8" label="More than 8 (Please specify)" />
          </RadioGroup>
          {form.familyMembers === 'More than 8' && (
            <TextInput style={styles.input} placeholder="Specify number of family members" value={form.familyMembersOther} onChangeText={(text) => handleChange('familyMembersOther', text)} keyboardType="numeric" />
          )}

          <Text style={styles.question}>11. Type of family</Text>
          <RadioGroup name="familyType" value={form.familyType} onChange={handleChange}>
            <RadioButton value="Nuclear Family" label="Nuclear Family" />
            <RadioButton value="Joint Family" label="Joint Family" />
          </RadioGroup>

          <Text style={styles.question}>12. Main occupation</Text>
          <RadioGroup name="occupation" value={form.occupation} onChange={handleChange}>
            <RadioButton value="Farming" label="Farming" />
            <RadioButton value="Daily wage worker" label="Daily wage worker" />
            <RadioButton value="Private job" label="Private job" />
            <RadioButton value="Government job" label="Government job" />
            <RadioButton value="Business" label="Business" />
            <RadioButton value="Other" label="Other (Please specify)" />
          </RadioGroup>
          {form.occupation === 'Other' && (
            <TextInput style={styles.input} placeholder="Specify occupation" value={form.occupationOther} onChangeText={(text) => handleChange('occupationOther', text)} />
          )}
        </View>

        {/* Q13, Q14, Q15 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="storefront-outline" size={24} color="#007bff" />
            <Text style={styles.sectionTitle}>Shopping Habits</Text>
          </View>
          <Text style={styles.question}>13. Where do you usually buy groceries?</Text>
          <RadioGroup name="grocerySource" value={form.grocerySource} onChange={handleChange}>
            <RadioButton value="Local Kirana shop" label="Local Kirana shop" />
            <RadioButton value="Weekly market" label="Weekly market" />
            <RadioButton value="Town supermarket" label="Town supermarket" />
            <RadioButton value="Online" label="Online" />
            <RadioButton value="Other" label="Other (Please specify)" />
          </RadioGroup>
          {form.grocerySource === 'Other' && (
            <TextInput style={styles.input} placeholder="Specify grocery source" value={form.grocerySourceOther} onChangeText={(text) => handleChange('grocerySourceOther', text)} />
          )}

          <Text style={styles.question}>14. Approximate monthly grocery spending</Text>
          <RadioGroup name="monthlySpending" value={form.monthlySpending} onChange={handleChange}>
            <RadioButton value="1000-2000" label="₹1000 – ₹2000" />
            <RadioButton value="2000-3000" label="₹2000 – ₹3000" />
            <RadioButton value="3000-4000" label="₹3000 – ₹4000" />
            <RadioButton value="4000-5000" label="₹4000 – ₹5000" />
            <RadioButton value="5000-6000" label="₹5000 – ₹6000" />
            <RadioButton value="6000-7000" label="₹6000 – ₹7000" />
            <RadioButton value="7000-8000" label="₹7000 – ₹8000" />
            <RadioButton value="8000-9000" label="₹8000 – ₹9000" />
            <RadioButton value="9000-10000" label="₹9000 – ₹10000" />
            <RadioButton value="More than 10000" label="More than ₹10000 (Please specify)" />
          </RadioGroup>
          {form.monthlySpending === 'More than 10000' && (
            <TextInput style={styles.input} placeholder="Specify amount" value={form.monthlySpendingOther} onChangeText={(text) => handleChange('monthlySpendingOther', text)} keyboardType="numeric" />
          )}

          <Text style={styles.question}>15. How often do you buy groceries?</Text>
          <RadioGroup name="purchaseFrequency" value={form.purchaseFrequency} onChange={handleChange}>
            <RadioButton value="Daily" label="Daily" />
            <RadioButton value="Weekly" label="Weekly" />
            <RadioButton value="Twice a month" label="Twice a month" />
            <RadioButton value="Once a month" label="Once a month" />
            <RadioButton value="Other" label="Other (Please specify)" />
          </RadioGroup>
          {form.purchaseFrequency === 'Other' && (
            <TextInput style={styles.input} placeholder="Specify purchase frequency" value={form.purchaseFrequencyOther} onChangeText={(text) => handleChange('purchaseFrequencyOther', text)} />
          )}
        </View>

        {/* Q16 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="basket-outline" size={24} color="#007bff" />
            <Text style={styles.sectionTitle}>Monthly Consumption</Text>
          </View>
          <Text style={styles.instruction}>Please mention quantity with unit like: 20kg, 500g, 2 packets, 10 pieces, 5 litres</Text>
          <View style={styles.consumptionGrid}>
            {consumptionItems.map(item => (
              <View key={item.key} style={styles.consumptionItem}>
                <Text style={styles.consumptionLabel}>{item.label}</Text>
                <TextInput
                  style={styles.consumptionInput}
                  placeholder="e.g., 20kg"
                  value={form.consumption[item.key] || ''}
                  onChangeText={(text) => handleConsumptionChange(item.key, text)}
                />
              </View>
            ))}
          </View>
          <Text style={styles.note}>Surveyor note: If the exact quantity is not known, please write an approximate value.</Text>
        </View>

        {/* Q17, Q18, Q19, Q20 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart-outline" size={24} color="#007bff" />
            <Text style={styles.sectionTitle}>Preferences</Text>
          </View>
          <Text style={styles.question}>17. Do you prefer packaged branded products?</Text>
          <RadioGroup name="brandedPreference" value={form.brandedPreference} onChange={handleChange}>
            <RadioButton value="Yes" label="Yes" />
            <RadioButton value="No" label="No" />
            <RadioButton value="Sometimes" label="Sometimes" />
          </RadioGroup>

          <Text style={styles.question}>18. Do you buy loose products or packaged products more often?</Text>
          <RadioGroup name="productType" value={form.productType} onChange={handleChange}>
            <RadioButton value="Loose products" label="Loose products" />
            <RadioButton value="Packaged products" label="Packaged products" />
            <RadioButton value="Both equally" label="Both equally" />
          </RadioGroup>

          <Text style={styles.question}>19. If groceries are cheaper than local shops, will you buy from a digital supermarket?</Text>
          <RadioGroup name="cheaperOption" value={form.cheaperOption} onChange={handleChange}>
            <RadioButton value="Yes" label="Yes" />
            <RadioButton value="No" label="No" />
            <RadioButton value="Maybe" label="Maybe" />
          </RadioGroup>

          <Text style={styles.question}>20. How would you like to place orders?</Text>
          <RadioGroup name="orderMethod" value={form.orderMethod} onChange={handleChange}>
            <RadioButton value="Mobile App" label="Mobile App" />
            <RadioButton value="WhatsApp" label="WhatsApp" />
            <RadioButton value="Phone Call" label="Phone Call" />
            <RadioButton value="Visiting store" label="Visiting store" />
          </RadioGroup>
        </View>

        <TouchableOpacity style={[styles.button, isSubmitting && styles.buttonDisabled]} onPress={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <View style={styles.buttonContent}>
              <Ionicons name="hourglass-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Submitting...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <Ionicons name="send-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Submit Survey</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  logoutBtn: {
    position: "absolute",
    left: 15,
    top: 15,
    padding: 8,
    zIndex: 10
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginLeft: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#333',
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginVertical: 12,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 4,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007bff',
    marginRight: 12,
  },
  selected: {
    backgroundColor: '#007bff',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  consumptionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  consumptionItem: {
    width: '48%',
    marginBottom: 15,
  },
  consumptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  consumptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  note: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    width: '100%',
    maxWidth: 400,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  newSurveyButton: {
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  newSurveyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default App;