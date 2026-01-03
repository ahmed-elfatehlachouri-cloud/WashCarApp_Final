import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../services/firebase/config";
import { Theme, scale } from "../../src/theme/Theme";

export default function OwnerCarwashesScreen({ navigation }) {
  const user = auth.currentUser;
  const [carwashes, setCarwashes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");

  const resetForm = () => { setEditingId(null); setName(""); setDescription(""); setAddress(""); };

  const fetchMyCarwashes = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const q = query(collection(db, "carwashes"), where("ownerId", "==", user.uid));
      const snap = await getDocs(q);
      setCarwashes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) { setCarwashes([]); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMyCarwashes(); }, []);

  const fillAddressFromGPS = async () => {
    try {
      setLocLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return Alert.alert("Erreur", "Activez la localisation.");
      const pos = await Location.getCurrentPositionAsync({});
      const results = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      if (results?.length > 0) {
        const a = results[0];
        setAddress([a.streetNumber, a.street, a.city].filter(Boolean).join(" "));
      }
    } finally { setLocLoading(false); }
  };

  const onSubmit = async () => {
    if (!name.trim() || !address.trim()) return Alert.alert("Erreur", "Nom et adresse requis.");
    try {
      setSaving(true);
      const data = { name: name.trim(), description: description.trim(), address: address.trim(), updatedAt: serverTimestamp() };
      if (!editingId) {
        await addDoc(collection(db, "carwashes"), { ...data, ownerId: user.uid, createdAt: serverTimestamp() });
      } else {
        await updateDoc(doc(db, "carwashes", editingId), data);
      }
      resetForm();
      fetchMyCarwashes();
    } finally { setSaving(false); }
  };

  const confirmDelete = (cwId) => {
    Alert.alert("Supprimer", "Cela supprimera les services associés.", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: async () => {
          const batch = writeBatch(db);
          batch.delete(doc(db, "carwashes", cwId));
          await batch.commit();
          fetchMyCarwashes();
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tableau de bord Propriétaire</Text>

      <TouchableOpacity 
        style={styles.bigBtn} 
        onPress={() => navigation.navigate("ManageReservations")}
      >
        <MaterialIcons name="event-available" size={24} color="#fff" />
        <Text style={styles.bigBtnText}>Gérer les réservations</Text>
      </TouchableOpacity>

      <View style={styles.form}>
        <Text style={styles.formTitle}>{editingId ? "Modifier" : "Ajouter"} un centre</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Nom du carwash" style={styles.input} />
        <TextInput value={address} onChangeText={setAddress} placeholder="Adresse" style={styles.input} />
        <TouchableOpacity style={styles.geoBtn} onPress={fillAddressFromGPS} disabled={locLoading}>
          {locLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.geoBtnText}>Ma position actuelle</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={saving}>
          <Text style={styles.btnText}>{editingId ? "Mettre à jour" : "Créer WashCar"}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={carwashes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSub}>{item.address}</Text>
            </View>
            <View style={styles.rowWrap}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Theme.colors.primary }]}
                onPress={() => navigation.navigate("OwnerServices", { carwash: item })}
              >
                <MaterialIcons name="settings" size={16} color="#fff" />
                <Text style={styles.btnTextSmall}>Gérer services</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionBtnNeutral} 
                onPress={() => { setEditingId(item.id); setName(item.name); setAddress(item.address); }}
              >
                <MaterialIcons name="edit" size={16} color={Theme.colors.secondary} />
                <Text style={styles.btnTextDark}>Modifier</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtnDanger} onPress={() => confirmDelete(item.id)}>
                <MaterialIcons name="delete" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

// L'OBJET STYLES ÉTAIT MANQUANT ICI :
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: Theme.colors.background },
  title: { fontSize: scale(20), fontWeight: "800", textAlign: "center", marginBottom: 15, color: Theme.colors.secondary },
  bigBtn: { backgroundColor: Theme.colors.secondary, borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  bigBtnText: { color: "#fff", fontWeight: "bold", marginLeft: 10 },
  form: { backgroundColor: "#fff", borderRadius: 16, padding: 15, ...Theme.shadow.medium, marginBottom: 20 },
  formTitle: { fontWeight: "bold", marginBottom: 10 },
  input: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, padding: 12, marginBottom: 10 },
  geoBtn: { backgroundColor: "#0f766e", padding: 10, borderRadius: 10, alignItems: "center", marginBottom: 10 },
  geoBtnText: { color: "#fff", fontWeight: "700" },
  submitBtn: { backgroundColor: Theme.colors.primary, padding: 14, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "bold" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 15, marginBottom: 12, ...Theme.shadow.small },
  cardTitle: { fontWeight: "bold", fontSize: 16 },
  cardSub: { color: "#64748B", marginBottom: 12 },
  rowWrap: { flexDirection: "row", gap: 8 },
  actionBtn: { flexDirection: 'row', padding: 10, borderRadius: 8, alignItems: 'center', gap: 5 },
  actionBtnNeutral: { flexDirection: 'row', backgroundColor: "#E2E8F0", padding: 10, borderRadius: 8, alignItems: 'center', gap: 5 },
  actionBtnDanger: { backgroundColor: "#DC2626", padding: 10, borderRadius: 8, justifyContent: 'center' },
  btnTextSmall: { color: "#fff", fontSize: 12, fontWeight: "700" },
  btnTextDark: { color: Theme.colors.secondary, fontSize: 12, fontWeight: "700" },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});