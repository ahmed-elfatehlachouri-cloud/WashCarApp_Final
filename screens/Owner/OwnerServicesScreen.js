import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../services/firebase/config";
import { Theme, scale } from "../../src/theme/Theme";

export default function OwnerServicesScreen({ route, navigation }) {
  const { carwash } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);

  const load = useCallback(async () => {
    if (!carwash?.id) return;
    try {
      setLoading(true);
      const q = query(collection(db, "services"), where("carwashId", "==", carwash.id));
      const snap = await getDocs(q);
      setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } finally { setLoading(false); }
  }, [carwash?.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Sécurité supplémentaire : vérifier que c'est bien l'owner
  if (auth.currentUser?.uid !== carwash?.ownerId) {
    return <View style={styles.center}><Text>Accès non autorisé</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Theme.colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Gestion de mes Services</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.carwashName}>{carwash?.name}</Text>
        <TouchableOpacity 
          style={styles.addBtn} 
          onPress={() => navigation.navigate("CreateService", { carwash })}
        >
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Nouveau Service</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.primary} style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              // ✅ ICI : On force l'édition du service sélectionné
              onPress={() => {
                console.log("Édition du service:", item.name);
                navigation.navigate("EditService", { service: item, carwash });
              }}
            >
              <View>
                <Text style={styles.nameText}>{item.name}</Text>
                <Text style={styles.priceText}>{item.price} DA</Text>
              </View>
              <View style={styles.editCircle}>
                 <MaterialIcons name="edit" size={18} color={Theme.colors.primary} />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Aucun service enregistré.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md },
  backBtn: { padding: 8 },
  title: { fontSize: scale(18), fontWeight: "800", color: Theme.colors.secondary, marginLeft: 10 },
  summaryCard: { margin: Theme.spacing.md, padding: Theme.spacing.md, backgroundColor: '#fff', borderRadius: 16, ...Theme.shadow.medium },
  carwashName: { fontSize: scale(16), fontWeight: "bold", color: Theme.colors.textSub, marginBottom: 12 },
  addBtn: { flexDirection: 'row', backgroundColor: Theme.colors.primary, padding: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: "#fff", fontWeight: "bold", marginLeft: 8 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 20, marginHorizontal: Theme.spacing.md, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...Theme.shadow.medium },
  nameText: { fontSize: 17, fontWeight: "bold", color: Theme.colors.secondary },
  priceText: { color: Theme.colors.primary, fontWeight: '700', marginTop: 4, fontSize: 16 },
  editCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: Theme.colors.primary + '10', justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', color: Theme.colors.textSub, marginTop: 40 },
  center: { flex:1, justifyContent:'center', alignItems:'center'}
});