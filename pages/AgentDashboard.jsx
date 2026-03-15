import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_BASE } from '../baseUrl';

const AgentDashboard = () => {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Helper to normalize and set village data
  const handleVillageData = (response) => {
    const finalArray = Array.isArray(response) ? response : response.data;
    setVillages(finalArray || []);
  };

  const getSession = async () => {
    try {
      setLoading(true);
      const savedValue = await AsyncStorage.getItem('loggedAgent');
      if (!savedValue) {
        router.replace('/serveyscreen');
        return;
      }
      const parsed = JSON.parse(savedValue);
      const agentData = parsed.data ? parsed.data : parsed;
      setAgent(agentData);

      if (agentData && (agentData.mandalId || agentData._id)) {
        const id = agentData.mandalId || agentData._id;
        const res = await axios.get(`${API_BASE}/villages/mandal/${id}`);
        handleVillageData(res.data);
      }
    } catch (error) {
      console.error("Dashboard Load Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // REFRESH LOGIC: Works with the latest data structure
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const id = agent.mandalId || agent._id;
      const res = await axios.get(`${API_BASE}/villages/mandal/${id}`);
      handleVillageData(res.data);
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }, [agent]);

  // Calculate Total Surveys for the whole Mandal
  const totalMandalSurveys = useMemo(() => {
    return villages.reduce((total, village) => {
      const villageTotal = village.subagents?.reduce((sum, sub) => sum + (sub.count || 0), 0) || 0;
      return total + villageTotal;
    }, 0);
  }, [villages]);

  const filteredVillages = useMemo(() => {
    if (!searchQuery.trim()) return villages;
    return villages.filter(v => 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.subagents?.some(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, villages]);

  useEffect(() => {
    getSession();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.villageCard}>
      <View style={styles.villageHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.villageIcon}>📍</Text>
          <Text style={styles.villageText}>{item.name}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.subagents?.length || 0} Agents</Text>
        </View>
      </View>

      {item.subagents?.map((sub, index) => (
        <View key={sub._id || index} style={styles.agentRow}>
          <View style={{ flex: 1.5 }}>
            <Text style={styles.userText}>{sub.name || 'Unnamed Agent'}</Text>
            <Text style={styles.phoneText}>📞 {sub.phone || 'N/A'}</Text>
            <Text style={styles.idText}>{sub.surveyorId}</Text>
          </View>
          <View style={{ flex: 1.5 }}>
            <View style={styles.credentialBox}>
              <Text style={styles.credLabel}>User: <Text style={styles.credValue}>{sub.username}</Text></Text>
              <Text style={styles.credLabel}>Pass: <Text style={styles.credValue}>{sub.password}</Text></Text>
            </View>
            <Text style={styles.tokenText}>🔑 {sub.token}</Text>
          </View>
          <View style={{ flex: 0.8, alignItems: 'center' }}>
            <View style={styles.countCircle}><Text style={styles.countNumber}>{sub.count || 0}</Text></View>
            <Text style={styles.subText}>Surveys</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.mandalLabel}>Mandal Head</Text>
          <Text style={styles.title} numberOfLines={1}>{agent?.name || "Loading..."}</Text>
        </View>
        
        <View style={styles.statsHeader}>
          <Text style={styles.totalNum}>{totalMandalSurveys}</Text>
          <Text style={styles.totalLabel}>TOTAL</Text>
        </View>

        <TouchableOpacity 
          style={styles.logoutBtn}
          onPress={async () => {
            await AsyncStorage.removeItem('loggedAgent');
            router.replace('/serveyscreen');
          }}
        >
          <Ionicons name="log-out-outline" size={22} color="#ff4d4f" />
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#999" />
        <TextInput
          placeholder="Search village or agent..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#ccc" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredVillages}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16a34a']} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7f6' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: 50
  },
  mandalLabel: { fontSize: 10, color: '#888', fontWeight: 'bold' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2d3436' },
  statsHeader: { alignItems: 'center', marginHorizontal: 15, paddingLeft: 15, borderLeftWidth: 1, borderLeftColor: '#eee' },
  totalNum: { fontSize: 22, fontWeight: 'bold', color: '#16a34a' },
  totalLabel: { fontSize: 9, color: '#999', fontWeight: 'bold' },
  logoutBtn: { padding: 5 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 45,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#333', outlineStyle: 'none', },
  villageCard: { backgroundColor: '#fff', marginHorizontal: 15, marginVertical: 8, borderRadius: 12, overflow: 'hidden', elevation: 2 },
  villageHeader: { backgroundColor: '#f8fffb', padding: 12, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#efefef' },
  villageText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  badge: { backgroundColor: '#16a34a', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  agentRow: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderColor: '#f9f9f9' },
  userText: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  phoneText: { fontSize: 12, color: '#666', marginTop: 2 },
  idText: { fontSize: 10, color: '#aaa', marginTop: 1 },
  credentialBox: { backgroundColor: '#f9f9f9', padding: 5, borderRadius: 4, marginBottom: 4 },
  credLabel: { fontSize: 10, color: '#888' },
  credValue: { color: '#444', fontWeight: '600' },
  tokenText: { fontSize: 11, color: '#16a34a', fontWeight: 'bold' },
  countCircle: { width: 35, height: 35, borderRadius: 18, backgroundColor: '#f0fff4', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#16a34a' },
  countNumber: { color: '#16a34a', fontWeight: 'bold', fontSize: 14 },
  subText: { fontSize: 9, color: '#bbb', marginTop: 2 }
});

export default AgentDashboard;