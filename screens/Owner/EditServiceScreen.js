import { MaterialIcons } from "@expo/vector-icons";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db } from "../../services/firebase/config";
import { Theme, scale } from "../../src/theme/Theme";

export default function EditServiceScreen({ route, navigation }) {
  const { service } = route.params || {};

  const [name, setName] = useState(service?.name || "");
  const [price, setPrice] = useState(String(service?.price || ""));
  const [duration, setDuration] = useState(String(service?.duration || ""));
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!name.trim() || !price.trim()) return Alert.alert("Erreur", "Nom et prix requis.");
    try {
      setLoading(true);
      await updateDoc(doc(db, "services", service.id), {
        name: name.trim(),
        price: Number(price),
        duration: duration ? Number(duration) : null,
      });
      Alert.alert("Succès", "Service mis à jour !");
      navigation.goBack();
    } catch (e) { Alert.alert("Erreur", "Mise à jour impossible."); }
    finally { setLoading(false); }
  };

  const handleDelete = () => {
    Alert.alert("Supprimer", "Confirmer la suppression ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: async () => {
          try { await deleteDoc(doc(db, "services", service.id)); navigation.goBack(); }
          catch (e) { Alert.alert("Erreur", "Action impossible."); }
        } 
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={Theme.colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modifier Service</Text>
          <TouchableOpacity onPress={handleDelete}>
            <MaterialIcons name="delete-outline" size={24} color={Theme.colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Nom du service</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
          <Text style={styles.label}>Prix (DA)</Text>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />
          <Text style={styles.label}>Durée estimée (minutes)</Text>
          <TextInput style={styles.input} value={duration} onChangeText={setDuration} keyboardType="numeric" placeholder="Ex: 30" />
          <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Enregistrer les modifications</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, paddingTop: 10 },
  headerTitle: { fontSize: scale(18), fontWeight: 'bold', color: Theme.colors.secondary },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, ...Theme.shadow.medium },
  label: { fontSize: 14, color: Theme.colors.textSub, marginBottom: 8, fontWeight: '700' },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 16 },
  saveBtn: { backgroundColor: Theme.colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});