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
  stateName:string,
  villageId:string,
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

const CollapsibleQuestion = ({ id, question, activeId, onToggle, children }) => {
  const isOpen = activeId === id;

  return (
    <View style={styles.collapsibleWrapper}>
      <TouchableOpacity 
        style={styles.questionHeader} 
        onPress={() => onToggle(id)}
        activeOpacity={0.7}
      >
        <Text style={styles.questionText}>{question}</Text>
        <Ionicons 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={isOpen ? "#007bff" : "#666"} 
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.optionsContainer}>
          {children}
        </View>
      )}
    </View>
  );
};


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
      stateName:'',
      villageId:'',
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
  const [activeQuestion, setActiveQuestion] = useState(null);

const toggleQuestion = (id) => {
  // If the same question is clicked, close it. Otherwise, open the new one.
  setActiveQuestion(activeQuestion === id ? null : id);
};
  const [isSubmitted, setIsSubmitted] = useState(false);
  const phoneRegex = /^[0-9]{10}$/;
  const doorRegex = /^[A-Za-z0-9\-\/]+$/;
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
  const REGEX = {
  // Starts with 6-9, followed by exactly 9 digits
  mobile: /^[6-9]\d{9}$/, 
  wardArea: /^[a-zA-Z0-9\s\-\/]{3,50}$/,
};

  const getMaxFromRange = (value: string): number | null => {
    if (!value) return null;
    const nums = value.match(/\d+/g)?.map(Number);
    if (!nums) return null;
    return Math.max(...nums);
  };

  const handleSubmit = async () => {

    // Required fields validation
    // if (!form.surveyorId.trim()) return Alert.alert("Validation", "Surveyor ID is required");
    if (!form.wardArea.trim()) return Alert.alert("Validation", "Ward / Area Name is required");
    if (!form.doorNumber.trim()) return Alert.alert("Validation", "Door Number is required");
    if (!form.familyHead.trim()) return Alert.alert("Validation", "Family Head Name is required");
    if (!form.familyMembers) return Alert.alert("Validation", "Select number of family members");
    if (!form.familyType) return Alert.alert("Validation", "Select family type");
    if (!form.occupation) return Alert.alert("Validation", "Select occupation");
    if (!form.grocerySource) return Alert.alert("Validation", "Select grocery source");
    if (!form.monthlySpending) return Alert.alert("Validation", "Select monthly spending");
    if (!form.purchaseFrequency) return Alert.alert("Validation", "Select purchase frequency");
    if (!form.brandedPreference) return Alert.alert("Validation", "Select branded preference");
    if (!form.productType) return Alert.alert("Validation", "Select product type");
    if (!form.cheaperOption) return Alert.alert("Validation", "Select cheaper option");
    if (!form.orderMethod) return Alert.alert("Validation", "Select order method");

    // Phone validation
    if (form.mobile && !REGEX.mobile.test(form.mobile)) {
      return Alert.alert("Validation", "Mobile number must be exactly 10 digits");
    }

    // Address validation
    if (!form.wardArea.trim()) {
      return Alert.alert("Validation", "Ward / Area Name is required");
    }

    if (!doorRegex.test(form.doorNumber)) {
      return Alert.alert("Validation", "Door number can contain only letters, numbers, - or /");
    }

    setIsSubmitting(true);

    const formattedConsumption: Record<string, ConsumptionItem | null> = {};

    Object.entries(form.consumption).forEach(([key, val]) => {
      formattedConsumption[key] = parseConsumption(val as string);
    });

    const payload = {
      ...form,
      stateName:agentData?.stateName,
      villageId:agentData?.villageId,
      surveyorId: agentData?.SurveyorId,
      districtName: agentData?.districtName,
      MandalName: agentData?.mandalName,
      VillageName: agentData?.villageName,
      familyMembersMax:
        form.familyMembers === "More than 8"
          ? Number(form.familyMembersOther)
          : getMaxFromRange(form.familyMembers),
      monthlySpendingMax:
        form.monthlySpending === "More than 10000"
          ? Number(form.monthlySpendingOther)
          : getMaxFromRange(form.monthlySpending),
      consumption: formattedConsumption,
    };

    try {
      await axios.post(`${ API_BASE }/surveys/form`, payload);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
      Alert.alert("Error", "Failed to submit survey");
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
          stateName:agent?.stateName || "",
          villageId:agent?.villageId || "",
          districtName: agent?.districtName || "",
          mandalName: agent?.mandalName || "",
          villageName: agent?.villageName || "",
          SurveyorId:agent?.SurveyorId || ""
        });
      } catch (error) {
        console.log("Error loading agent data:", error);
      }
    };

    loadAgentData();
  }, []);

  const resetForm = () => {
    setForm({
      stateName:'',
      villageId:'',
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
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <View style={styles.logoutInner}>
            <Ionicons name="log-out-outline" size={18} color="red" />
            <Text style={styles.logoutText}>Logout</Text>
          </View>
        </TouchableOpacity>

        <Ionicons name="clipboard-outline" size={40} color="#007bff" />
        <Text style={styles.title}>Village Digital Supermarket Survey</Text>
        <Text style={styles.subtitle}>Help us understand your grocery needs</Text>
      </View>

      <View style={styles.formContainer}>
        
        {/* SECTION 1: BASIC INFORMATION (Always Visible or Collapsible) */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader} 
            onPress={() => toggleQuestion('basicInfo')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="person-outline" size={24} color="#007bff" />
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>
            <Ionicons name={activeQuestion === 'basicInfo' ? "chevron-up" : "chevron-down"} size={20} color="#666" />
          </TouchableOpacity>

          {activeQuestion === 'basicInfo' && (
            <View style={{ marginTop: 10 }}>
              <View style={styles.inputRow}>
                <Ionicons name="id-card-outline" size={20} color="#666" />
                <TextInput style={styles.input} placeholder="Surveyor ID" value={agentData?.SurveyorId} aria-disabled={true} onChangeText={(text) => handleChange('surveyorId', text)} />
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
                <TextInput style={styles.input} placeholder="Mobile Number (Optional)" value={form.mobile} onChangeText={(text) => handleChange('mobile', text)} keyboardType="phone-pad" maxLength={10} />
              </View>
            </View>
          )}
        </View>

        {/* SECTION 2: FAMILY DETAILS */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderStatic}>
            <Ionicons name="people-circle-outline" size={24} color="#007bff" />
            <Text style={styles.sectionTitle}>Family Details</Text>
          </View>

          <CollapsibleQuestion id="q6" question="6. Number of family members:" activeId={activeQuestion} onToggle={toggleQuestion}>
            <RadioGroup name="familyMembers" value={form.familyMembers} onChange={handleChange}>
              <RadioButton value="1-2" label="1 – 2" />
              <RadioButton value="3-4" label="3 – 4" />
              <RadioButton value="5-6" label="5 – 6" />
              <RadioButton value="6-8" label="6 – 8" />
              <RadioButton value="More than 8" label="More than 8 (Please specify)" />
            </RadioGroup>
            {form.familyMembers === 'More than 8' && (
              <TextInput style={styles.input} placeholder="Specify number" value={form.familyMembersOther} onChangeText={(text) => handleChange('familyMembersOther', text)} keyboardType="numeric" />
            )}
          </CollapsibleQuestion>

          <CollapsibleQuestion id="q11" question="11. Type of family" activeId={activeQuestion} onToggle={toggleQuestion}>
            <RadioGroup name="familyType" value={form.familyType} onChange={handleChange}>
              <RadioButton value="Nuclear Family" label="Nuclear Family" />
              <RadioButton value="Joint Family" label="Joint Family" />
            </RadioGroup>
          </CollapsibleQuestion>

          <CollapsibleQuestion id="q12" question="12. Main occupation" activeId={activeQuestion} onToggle={toggleQuestion}>
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
          </CollapsibleQuestion>
        </View>

        {/* SECTION 3: SHOPPING HABITS */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderStatic}>
            <Ionicons name="storefront-outline" size={24} color="#007bff" />
            <Text style={styles.sectionTitle}>Shopping Habits</Text>
          </View>

          <CollapsibleQuestion id="q13" question="13. Where do you usually buy groceries?" activeId={activeQuestion} onToggle={toggleQuestion}>
            <RadioGroup name="grocerySource" value={form.grocerySource} onChange={handleChange}>
              <RadioButton value="Local Kirana shop" label="Local Kirana shop" />
              <RadioButton value="Weekly market" label="Weekly market" />
              <RadioButton value="Town supermarket" label="Town supermarket" />
              <RadioButton value="Online" label="Online" />
              <RadioButton value="Other" label="Other (Please specify)" />
            </RadioGroup>
            {form.grocerySource === 'Other' && (
              <TextInput style={styles.input} placeholder="Specify source" value={form.grocerySourceOther} onChangeText={(text) => handleChange('grocerySourceOther', text)} />
            )}
          </CollapsibleQuestion>

          <CollapsibleQuestion id="q14" question="14. Monthly grocery spending" activeId={activeQuestion} onToggle={toggleQuestion}>
            <RadioGroup name="monthlySpending" value={form.monthlySpending} onChange={handleChange}>
              <RadioButton value="1000-2000" label="₹1000 – ₹2000" />
              <RadioButton value="2000-3000" label="₹2000 – ₹3000" />
              <RadioButton value="3000-4000" label="₹3000 – ₹4000" />
              <RadioButton value="More than 10000" label="More than ₹10000" />
            </RadioGroup>
            {form.monthlySpending === 'More than 10000' && (
              <TextInput style={styles.input} placeholder="Specify amount" value={form.monthlySpendingOther} onChangeText={(text) => handleChange('monthlySpendingOther', text)} keyboardType="numeric" />
            )}
          </CollapsibleQuestion>

          <CollapsibleQuestion id="q15" question="15. How often do you buy groceries?" activeId={activeQuestion} onToggle={toggleQuestion}>
            <RadioGroup name="purchaseFrequency" value={form.purchaseFrequency} onChange={handleChange}>
              <RadioButton value="Daily" label="Daily" />
              <RadioButton value="Weekly" label="Weekly" />
              <RadioButton value="Once a month" label="Once a month" />
              <RadioButton value="Other" label="Other (Please specify)" />
            </RadioGroup>
          </CollapsibleQuestion>
        </View>

        {/* SECTION 4: MONTHLY CONSUMPTION (Grid stays as is but inside collapsible) */}
        <View style={styles.section}>
          <CollapsibleQuestion id="q16" question="16. Monthly Consumption Details" activeId={activeQuestion} onToggle={toggleQuestion}>
            <Text style={styles.instruction}>Mention quantity with unit (e.g., 20kg, 5 litres)</Text>
            <View style={styles.consumptionGrid}>
              {consumptionItems.map(item => (
                <View key={item.key} style={styles.consumptionItem}>
                  <Text style={styles.consumptionLabel}>{item.label}</Text>
                  <TextInput
                    style={styles.consumptionInput}
                    placeholder="e.g., 2kg"
                    value={form.consumption[item.key] || ''}
                    onChangeText={(text) => handleConsumptionChange(item.key, text)}
                  />
                </View>
              ))}
            </View>
          </CollapsibleQuestion>
        </View>

        {/* SECTION 5: PREFERENCES */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderStatic}>
            <Ionicons name="heart-outline" size={24} color="#007bff" />
            <Text style={styles.sectionTitle}>Preferences</Text>
          </View>

          <CollapsibleQuestion id="q17" question="17. Packaged branded products?" activeId={activeQuestion} onToggle={toggleQuestion}>
            <RadioGroup name="brandedPreference" value={form.brandedPreference} onChange={handleChange}>
              <RadioButton value="Yes" label="Yes" />
              <RadioButton value="No" label="No" />
              <RadioButton value="Sometimes" label="Sometimes" />
            </RadioGroup>
          </CollapsibleQuestion>

          <CollapsibleQuestion id="q18" question="18. Loose vs Packaged?" activeId={activeQuestion} onToggle={toggleQuestion}>
            <RadioGroup name="productType" value={form.productType} onChange={handleChange}>
              <RadioButton value="Loose products" label="Loose products" />
              <RadioButton value="Packaged products" label="Packaged products" />
            </RadioGroup>
          </CollapsibleQuestion>

          <CollapsibleQuestion id="q19" question="19. Use digital supermarket?" activeId={activeQuestion} onToggle={toggleQuestion}>
            <RadioGroup name="cheaperOption" value={form.cheaperOption} onChange={handleChange}>
              <RadioButton value="Yes" label="Yes" />
              <RadioButton value="No" label="No" />
            </RadioGroup>
          </CollapsibleQuestion>

          <CollapsibleQuestion id="q20" question="20. How to place orders?" activeId={activeQuestion} onToggle={toggleQuestion}>
            <RadioGroup name="orderMethod" value={form.orderMethod} onChange={handleChange}>
              <RadioButton value="Mobile App" label="Mobile App" />
              <RadioButton value="WhatsApp" label="WhatsApp" />
              <RadioButton value="Phone Call" label="Phone Call" />
            </RadioGroup>
          </CollapsibleQuestion>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.button, isSubmitting && styles.buttonDisabled]} 
          onPress={handleSubmit} 
          disabled={isSubmitting}
        >
          <View style={styles.buttonContent}>
            <Ionicons name={isSubmitting ? "hourglass-outline" : "send-outline"} size={20} color="#fff" />
            <Text style={styles.buttonText}>{isSubmitting ? "Submitting..." : "Submit Survey"}</Text>
          </View>
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
    textAlign: 'center',
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
  collapsibleWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1, // Ensures text doesn't overlap the icon
  },
  optionsContainer: {
    paddingBottom: 15,
    paddingLeft: 10,
    backgroundColor: '#f9f9f9', // Light background to distinguish options
    borderRadius: 8,
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
  sectionHeaderStatic: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logoutInner: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff5f5', 
    padding: 8, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffebeb'
  },
  logoutText: {
    color: 'red', 
    fontWeight: 'bold', 
    marginLeft: 5 
  },
  // If you use the grid inside the collapse:
  consumptionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  consumptionItem: {
    width: '48%',
    marginBottom: 12,
  },
  consumptionLabel: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
    fontWeight: 'bold'
  },
  consumptionInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#fff'
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