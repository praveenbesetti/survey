import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { API_BASE } from '../baseUrl';
 

const AgentDashboard = () => {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState(null);
  const router = useRouter();

  useEffect(() => {
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

        // Using mandalId to fetch the specific JSON structure you shared
        if (agentData && (agentData.mandalId || agentData._id)) {
          const id = agentData.mandalId || agentData._id;
          const targetUrl = `${API_BASE}/subagents/${id}`;
          
          const res = await axios.get(targetUrl);
          setVillages(res.data);
        }
      } catch (error) {
        console.error("Dashboard Load Error:", error.message);
        Alert.alert("Error", "Failed to load sub-agent data");
      } finally {
        setLoading(false); // ✅ Stop spinner
      }
    };

    getSession();
  }, []);

  const renderItem = ({ item }) => {
    // According to your JSON, the sub-agent info is in details[0]
    const info = item.details && item.details[0];

    return (
      <View style={styles.row}>
        <View style={{ flex: 2 }}>
          <Text style={styles.villageText}>{item.villageName}</Text>
          <Text style={styles.userText}>{info?.username || 'N/A'}</Text>
        </View>
        <Text style={[styles.cell, { flex: 1.5, color: '#16a34a', fontWeight: 'bold' }]}>
          {info?.token || 'N/A'}
        </Text>
        <Text style={[styles.cell, { flex: 1, textAlign: 'center' }]}>
          {info?.count || 0}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mandal: {agent?.mandalName || "Loading..."}</Text>
        <TouchableOpacity onPress={async () => {
          await AsyncStorage.removeItem('loggedAgent');
          router.replace('/serveyscreen');
        }}>
          <Text style={{ color: 'red' }}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 2 }]}>Village / User</Text>
        <Text style={[styles.headerCell, { flex: 1.5 }]}>Token</Text>
        <Text style={[styles.headerCell, { flex: 1, textAlign: 'center' }]}>Count</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={villages}
          keyExtractor={(item) => item.villageId}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>No sub-agents found.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#16a34a' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 5 },
  headerCell: { fontWeight: 'bold', fontSize: 12, color: '#444' },
  row: { flexDirection: 'row', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'center' },
  villageText: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  userText: { fontSize: 11, color: '#666' },
  cell: { fontSize: 14 },
  empty: { textAlign: 'center', marginTop: 30, color: '#999' }
});

export default AgentDashboard;