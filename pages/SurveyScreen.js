import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { API_BASE } from '../baseUrl';

const SearchablePicker = ({ label, data, selectedValue, onValueChange, placeholder, loading }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    return data.filter(item =>
      (typeof item === 'string' ? item : item.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  return (
    <View style={styles.pickerWrapper}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.pickerTrigger}
        onPress={() => { setModalVisible(true); setSearchQuery(''); }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#16a34a" />
        ) : (
          <Text style={selectedValue ? styles.selectedText : styles.placeholderText}>
            {selectedValue || placeholder}
          </Text>
        )}
        <Text style={{ color: '#16a34a' }}>▼</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.searchModal}>
            <TextInput
              autoFocus
              placeholder="Type to search..."
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <FlatList
              data={filteredData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => {
                const name = typeof item === 'string' ? item : item.name;
                return (
                  <TouchableOpacity
                    style={styles.itemRow}
                    onPress={() => { onValueChange(item); setModalVisible(false); }}
                  >
                    <Text>{name}</Text>
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={{ color: 'red', fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const SurveyScreen = () => {
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [loginMode, setLoginMode] = useState(null);
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]); // Added for Sub-Agent
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [loading, setLoading] = useState({ dist: false, mandal: false, village: false });
  const [selection, setSelection] = useState({
    districtName: '', districtId: '',
    mandalName: '', mandalId: '',
    villageName: ''
  });

  const [creds, setCreds] = useState({ username: '', password: '', token: '' });

  // 1. Fetch Districts
  useEffect(() => {
    if (showTypeModal) {
      setLoading(prev => ({ ...prev, dist: true }));
      axios.get(`${API_BASE}/districts`)
        .then(res => setDistricts(res.data))
        .catch(() => Alert.alert("Error", "Failed to load districts"))
        .finally(() => setLoading(prev => ({ ...prev, dist: false })));
    }
  }, [showTypeModal]);
  const handleDistrictChange = (item) => {
    setSelection({ districtName: item.name, districtId: item._id, mandalName: '', mandalId: '', villageName: '' });
    setLoading(prev => ({ ...prev, mandal: true }));
    axios.get(`${API_BASE}/mandals/${item._id}`)
      .then(res => setMandals(res.data))
      .catch(() => Alert.alert("Error", "Failed to load mandals"))
      .finally(() => setLoading(prev => ({ ...prev, mandal: false })));
  };

  const handleMandalChange = (item) => {
    setSelection({ ...selection, mandalName: item.name, mandalId: item._id, villageName: '' });
    if (loginMode === 'subagent') {
      setLoading(prev => ({ ...prev, village: true }));
      axios.get(`${API_BASE}/Villages/${item._id}`)
        .then(res => setVillages(res.data))
        .catch(() => setVillages(["Village A", "Village B", "Village C"])) // Fallback to duplicate data if API fails
        .finally(() => setLoading(prev => ({ ...prev, village: false })));
    }
  };

  // 4. Submit and Console Log Everything
  const handleProceed = async () => {
    // 1. FRONTEND VALIDATION
    if (!selection.districtId || !selection.mandalId) {
      Alert.alert("Error", "Please select both District and Mandal.");
      return;
    }

    if (!creds.username || !creds.password) {
      Alert.alert("Error", "Username and Password are required.");
      return;
    }

    if (loginMode === 'subagent') {
      if (!selection.villageName) {
        Alert.alert("Error", "Please select a Village.");
        return;
      }
      if (!creds.token) {
        Alert.alert("Error", "Please enter your Surveyor Token.");
        return;
      }
    }

    // 2. PREPARE DATA
    const finalData = {
      role: loginMode,
      mandalId: selection.mandalId,
      district: selection.districtName,
      mandal: selection.mandalName,
      village: loginMode === 'subagent' ? selection.villageName : 'N/A',
      username: creds.username,
      password: creds.password,
      token: loginMode === 'subagent' ? creds.token : 'N/A'
    };

    console.log("--- ATTEMPTING SUBMISSION ---", finalData);

    setIsActionLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/survey/submit`, finalData);

      if (res.data.success) {
        try {
          setShowTypeModal(false);

          // 1. Correctly check for villageName inside res.data.data
          const coreData = {
            ...res.data.data,
            name: res.data.data.villageName ? "subagent" : "agent"
          };

          // 2. Save to AsyncStorage
          await AsyncStorage.setItem('loggedAgent', JSON.stringify(coreData));
          console.log("Session stored locally as:", coreData.name);

        } catch (e) {
          console.error("Failed to save session data", e);
        }

        Alert.alert("Success", res.data.message);

        // 3. Navigation Logic
        if (loginMode === 'agent') {
          router.push('/agent-dashboard');
        } else {
          router.push('/survey');
        }
      }
    } catch (err) {
      console.error("Submission Error:", err);
      const msg = err.response?.data?.error || "Authentication failed. Check your data.";
      Alert.alert("Error", msg);
    } finally {
      setIsActionLoading(false);
    }
  };
  useEffect(() => {
    // 1. Define an internal async function
    const checkSession = async () => {
      try {
        const savedValue = await AsyncStorage.getItem('loggedAgent');

        if (savedValue) {
          // 2. You MUST parse the string back into an object
          const agentData = JSON.parse(savedValue);

          // 3. Check the parsed object's property
          if (agentData.name === "agent") {
            router.replace('/agent-dashboard');
          } else if (agentData.name === "subagent") {
            router.replace('/survey');
          }
        }
      } catch (error) {
        console.error("Session check failed", error);
      }
    };

    checkSession();
  }, []);
  return (
    <View style={styles.container}>
      <Modal transparent visible={isActionLoading}>
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#16a34a" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.mainBtn} onPress={() => setShowTypeModal(true)}>
        <Text style={styles.mainBtnText}>OPEN SURVEY SYSTEM</Text>
      </TouchableOpacity>

      <Modal visible={showTypeModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {step === 1 ? (
              <>
                <Text style={styles.title}>Select Login Type</Text>
                <TouchableOpacity onPress={() => { setLoginMode('agent'); setStep(2); }} style={styles.choiceBtn}>
                  <Text style={styles.choiceText}>Agent (Mandal Head)</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setLoginMode('subagent'); setStep(2); }} style={styles.choiceBtn}>
                  <Text style={styles.choiceText}>Sub-Agent (Village Level)</Text>
                </TouchableOpacity>
              </>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>{loginMode === 'agent' ? 'Agent Login' : 'Sub-Agent Login'}</Text>

                <SearchablePicker
                  label="Select District"
                  data={districts}
                  loading={loading.dist}
                  selectedValue={selection.districtName}
                  onValueChange={handleDistrictChange}
                  placeholder="Choose District..."
                />

                <SearchablePicker
                  label="Select Mandal"
                  data={mandals}
                  loading={loading.mandal}
                  selectedValue={selection.mandalName}
                  onValueChange={handleMandalChange}
                  placeholder="Choose Mandal..."
                />

                {loginMode === 'subagent' && (
                  <SearchablePicker
                    label="Select Village"
                    data={villages}
                    loading={loading.village}
                    selectedValue={selection.villageName}
                    onValueChange={(item) => setSelection({ ...selection, villageName: typeof item === 'string' ? item : item.name })}
                    placeholder="Choose Village..."
                  />
                )}

                <TextInput
                  placeholder="Username"
                  style={styles.input}
                  onChangeText={(val) => setCreds({ ...creds, username: val })}
                />
                <TextInput
                  placeholder="Password"
                  secureTextEntry
                  style={styles.input}
                  onChangeText={(val) => setCreds({ ...creds, password: val })}
                />

                {loginMode === 'subagent' && (
                  <TextInput
                    placeholder="Enter Surveyor Token"
                    style={styles.input}
                    onChangeText={(val) => setCreds({ ...creds, token: val })}
                  />
                )}

                <TouchableOpacity
                  style={styles.loginBtn}
                  onPress={handleProceed}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>PROCEED →</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={() => { setShowTypeModal(false); setStep(1); }}>
              <Text style={{ color: '#999' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  loadingCard: { backgroundColor: 'white', padding: 30, borderRadius: 20, alignItems: 'center' },
  loadingText: { marginTop: 15, fontWeight: 'bold', color: '#16a34a' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center' },
  modalContent: { backgroundColor: 'white', margin: 20, padding: 25, borderRadius: 25, maxHeight: '80%' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#16a34a' },
  mainBtn: { backgroundColor: '#16a34a', padding: 20, borderRadius: 15 },
  mainBtnText: { color: 'white', fontWeight: 'bold' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 5, marginTop: 10 },
  pickerTrigger: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, backgroundColor: '#f9f9f9' },
  placeholderText: { color: '#999' },
  selectedText: { color: '#333', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  searchModal: { backgroundColor: 'white', borderRadius: 15, padding: 15, height: 400 },
  searchInput: { borderBottomWidth: 1, borderColor: '#16a34a', padding: 10, marginBottom: 10 },
  itemRow: { padding: 15, borderBottomWidth: 0.5, borderColor: '#eee' },
  input: { borderBottomWidth: 1, borderColor: '#ddd', marginTop: 15, padding: 8 },
  loginBtn: { backgroundColor: '#16a34a', padding: 16, borderRadius: 12, marginTop: 25, alignItems: 'center' },
  choiceBtn: { padding: 15, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, marginBottom: 10, alignItems: 'center' },
  choiceText: { fontWeight: '600' },
  closeBtn: { marginTop: 20, alignItems: 'center' }
});

export default SurveyScreen;