import { Ionicons } from '@expo/vector-icons';
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loginMode, setLoginMode] = useState(null);
  const [step, setStep] = useState(1);
  const router = useRouter();
  
  // Data Arrays
  const [states, setStates] = useState([]); 
  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]);

  const [isActionLoading, setIsActionLoading] = useState(false);
  const [loading, setLoading] = useState({ state: false, dist: false, mandal: false, village: false });
  
  const [selection, setSelection] = useState({
    stateName: '', stateId: '',
    districtName: '', districtId: '',
    mandalName: '', mandalId: '',
    villageName: ''
  });

  const [creds, setCreds] = useState({ username: '', password: '', token: '' });

  // 1. Fetch States when modal opens
  useEffect(() => {
    if (showTypeModal) {
      setLoading(prev => ({ ...prev, state: true }));
      axios.get(`${API_BASE}/states`)
        .then(res => {
          setStates(res.data.data || res.data);
        })
        .catch(() => Alert.alert("Error", "Failed to load states"))
        .finally(() => setLoading(prev => ({ ...prev, state: false })));
    }
  }, [showTypeModal]);

  // 2. Handle State Change -> Fetch Districts
  const handleStateChange = (item) => {
    setSelection({
      stateName: item.name,
      stateId: item._id,
      districtName: '',
      districtId: '',
      mandalName: '',
      mandalId: '',
      villageName: ''
    });
    setDistricts([]);
    setMandals([]);
    setVillages([]);

    setLoading(prev => ({ ...prev, dist: true }));
    axios.get(`${API_BASE}/districts/state/${item._id}`)
      .then(res => setDistricts(res.data.data || res.data))
      .catch(() => Alert.alert("Error", "Failed to load districts for this state"))
      .finally(() => setLoading(prev => ({ ...prev, dist: false })));
  };

  // 3. Handle District Change -> Load Mandals
  const handleDistrictChange = (item) => {
    setSelection(prev => ({
      ...prev,
      districtName: item.name,
      districtId: item._id,
      mandalName: '',
      mandalId: '',
      villageName: ''
    }));
    setMandals([]);
    setVillages([]);

    setLoading(prev => ({ ...prev, mandal: true }));
    axios.get(`${API_BASE}/mandals/${item._id}`)
      .then(res => setMandals(res.data.data || res.data))
      .catch(() => Alert.alert("Error", "Failed to load mandals"))
      .finally(() => setLoading(prev => ({ ...prev, mandal: false })));
  };

  // 4. Handle Mandal Change -> Load Villages
  const handleMandalChange = (item) => {
    setSelection(prev => ({
      ...prev,
      mandalName: item.name,
      mandalId: item._id,
      villageName: ''
    }));
    
    if (loginMode === 'subagent') {
      setLoading(prev => ({ ...prev, village: true }));
      axios.get(`${API_BASE}/Villages/${item._id}`)
        .then(res => setVillages(res.data.data || res.data))
        .catch(() => setVillages([]))
        .finally(() => setLoading(prev => ({ ...prev, village: false })));
    }
  };

  const handleProceed = async () => {
    if (!selection.stateId || !selection.districtId || !selection.mandalId) {
      Alert.alert("Error", "Please complete the State, District, and Mandal selection.");
      return;
    }

    if (!creds.username || !creds.password) {
      Alert.alert("Error", "Credentials are required.");
      return;
    }

    if (loginMode === 'subagent') {
      if (!selection.villageName || !creds.token) {
        Alert.alert("Error", "Village and Token are required.");
        return;
      }
    }

    const finalData = {
      role: loginMode,
      state: selection.stateName,
      district: selection.districtName,
      mandal: selection.mandalName,
      village: loginMode === 'subagent' ? selection.villageName : 'N/A',
      mandalId: selection.mandalId,
      username: creds.username.trim(),
      password: creds.password,
      token: loginMode === 'subagent' ? creds.token.trim() : 'N/A'
    };

    setIsActionLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, finalData);
      
      if (res.data.success) {
        const coreData = {
          ...res.data.data,
          agentType: loginMode 
        };

        await AsyncStorage.setItem('loggedAgent', JSON.stringify(coreData));
        setShowTypeModal(false);

        if (loginMode === 'agent') {
          router.replace('/agent-dashboard');
        } else {
          router.replace('/survey');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed.";
      Alert.alert("Error", msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedValue = await AsyncStorage.getItem('loggedAgent');
        if (savedValue) {
          const agentData = JSON.parse(savedValue);
          if (agentData.agentType === "agent") {
            router.replace('/agent-dashboard');
          } else if (agentData.agentType === "subagent") {
            router.replace('/survey');
          }
        }
      } catch (error) {
        console.error("Session restoration failed", error);
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
                  label="Select State"
                  data={states}
                  loading={loading.state}
                  selectedValue={selection.stateName}
                  onValueChange={handleStateChange}
                  placeholder="Choose State..."
                />

                <SearchablePicker
                  label="Select District"
                  data={districts}
                  loading={loading.dist}
                  selectedValue={selection.districtName}
                  onValueChange={handleDistrictChange}
                  placeholder={selection.stateName ? "Choose District..." : "Select State First"}
                />

                <SearchablePicker
                  label="Select Mandal"
                  data={mandals}
                  loading={loading.mandal}
                  selectedValue={selection.mandalName}
                  onValueChange={handleMandalChange}
                  placeholder={selection.districtName ? "Choose Mandal..." : "Select District First"}
                />

                {loginMode === 'subagent' && (
                  <SearchablePicker
                    label="Select Village"
                    data={villages}
                    loading={loading.village}
                    selectedValue={selection.villageName}
                    onValueChange={(item) => setSelection({ ...selection, villageName: typeof item === 'string' ? item : item.name })}
                    placeholder={selection.mandalName ? "Choose Village..." : "Select Mandal First"}
                  />
                )}

                <TextInput
                  placeholder="Username"
                  placeholderTextColor="#888888"
                  style={styles.input}
                  autoCapitalize="none"
                  onChangeText={(val) => setCreds({ ...creds, username: val })}
                />
                
                <View style={styles.inputWrapper}>
                    <TextInput
                      placeholder="Password"
                      placeholderTextColor="#888888"
                      secureTextEntry={!isPasswordVisible}
                      style={styles.inputPassword}
                      onChangeText={(val) => setCreds({ ...creds, password: val })}
                    />
                    <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                      <Ionicons
                        name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color="#000"
                      />
                    </TouchableOpacity>
                </View>

                {loginMode === 'subagent' && (
                  <TextInput
                    placeholder="Enter Surveyor Token"
                    placeholderTextColor="#888888"
                    style={styles.input}
                    autoCapitalize="characters"
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
  modalContent: { backgroundColor: 'white', margin: 20, padding: 25, borderRadius: 25, maxHeight: '85%' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#16a34a' },
  mainBtn: { backgroundColor: '#16a34a', padding: 20, borderRadius: 15 },
  mainBtnText: { color: 'white', fontWeight: 'bold' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 5, marginTop: 10 },
  pickerTrigger: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, backgroundColor: '#f9f9f9' },
  placeholderText: { color: '#888888' },
  selectedText: { color: '#333', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  searchModal: { backgroundColor: 'white', borderRadius: 15, padding: 15, height: 400 },
  searchInput: { borderBottomWidth: 1, borderColor: '#16a34a', padding: 10, marginBottom: 10 },
  itemRow: { padding: 15, borderBottomWidth: 0.5, borderColor: '#eee' },
  input: { backgroundColor: '#FFFFFF',outlineStyle: 'none', color: '#000000', borderBottomWidth: 1, borderColor: '#ddd', marginTop: 15, padding: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#ddd', marginTop: 15, backgroundColor: '#FFFFFF' },
  inputPassword: { flex: 1,outlineStyle: 'none', color: '#000000', padding: 8 },
  eyeIcon: { padding: 8 },
  loginBtn: { backgroundColor: '#16a34a', padding: 16, borderRadius: 12, marginTop: 25, alignItems: 'center' },
  choiceBtn: { padding: 15, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, marginBottom: 10, alignItems: 'center' },
  choiceText: { fontWeight: '600' },
  closeBtn: { marginTop: 20, alignItems: 'center' }
});

export default SurveyScreen;