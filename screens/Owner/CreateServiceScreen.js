import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../services/firebase/config";

export default function CreateServiceScreen({ route, navigation }) {
  const { carwash } = route.params || {};
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");      // string -> convert number
  const [duration, setDuration] = useState(""); // minutes
  const [saving, setSaving] = useState(false);

  const onCreate = async () => {
    if (!user) return Alert.alert("Erreur", "Utilisateur non connecté.");
    if (!carwash?.id) return Alert.alert("Erreur", "Carwash manquant.");
    if (!name.trim()) return Alert.alert("Champ requis", "Nom du service requis.");

    const priceNumber = Number(price);
    if (Number.isNaN(priceNumber)) return Alert.alert("Champ requis", "Prix invalide.");

    const durationNumber = duration ? Number(duration) : null;
    if (duration && Number.isNaN(durationNumber)) return Alert.alert("Champ requis", "Durée invalide.");

    try {
      setSaving(true);

      await addDoc(collection(db, "services"), {
        carwashId: carwash.id,
        ownerId: user.uid, // utile pour règles après
        name: name.trim(),
        price: priceNumber,
        duration: durationNumber, // optionnel
        createdAt: serverTimestamp(),
        isActive: true,
      });

      Alert.alert("Succès", "Service créé.");
      navigation.goBack();
    } catch (e) {
      console.log("CreateService error:", e?.message);
      Alert.alert("Erreur", "Impossible de créer le service.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un service</Text>
      <Text style={styles.sub}>Carwash: {carwash?.name || "—"}</Text>

      <TextInput value={name} onChangeText={setName} placeholder="Nom (ex: Lavage Premium)" style={styles.input} />
      <TextInput value={price} onChangeText={setPrice} placeholder="Prix (DA)" keyboardType="numeric" style={styles.input} />
      <TextInput value={duration} onChangeText={setDuration} placeholder="Durée (min) optionnel" keyboardType="numeric" style={styles.input} />

      <TouchableOpacity style={[styles.btn, saving && { opacity: 0.7 }]} onPress={onCreate} disabled={saving}>
        <Text style={styles.btnText}>{saving ? "Création..." : "Créer"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F8FAFC", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 6 },
  sub: { textAlign: "center", color: "#64748B", marginBottom: 14 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, padding: 12, marginBottom: 12 },
  btn: { backgroundColor: "#6366F1", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "800" },
});