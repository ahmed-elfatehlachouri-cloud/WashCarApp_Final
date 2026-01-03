import * as Location from "expo-location";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../services/firebase/config";

export default function CreateCarwashScreen({ navigation }) {
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);

  // ✅ AJOUT: état geoloc
  const [locLoading, setLocLoading] = useState(false);

  const fillAddressFromGPS = async () => {
    try {
      setLocLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission refusée", "Active la localisation pour remplir l’adresse.");
        return;
      }

      const pos = await Location.getCurrentPositionAsync({});
      const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };

      const results = await Location.reverseGeocodeAsync(coords);
      if (!results || results.length === 0) {
        Alert.alert("Info", "Adresse introuvable. Écris-la manuellement.");
        return;
      }

      const a = results[0];
      const line = [
        a.streetNumber,
        a.street,
        a.district,
        a.city,
        a.region,
        a.postalCode,
      ]
        .filter(Boolean)
        .join(" ");

      if (!line) {
        Alert.alert("Info", "Adresse introuvable. Écris-la manuellement.");
        return;
      }

      setAddress(line);
    } catch (e) {
      if (__DEV__) console.log("fillAddressFromGPS error:", e?.message);
      Alert.alert("Erreur", "Impossible de récupérer l’adresse depuis la position.");
    } finally {
      setLocLoading(false);
    }
  };

  const onCreate = async () => {
    if (!user) return Alert.alert("Erreur", "Utilisateur non connecté.");
    if (!name.trim()) return Alert.alert("Champ requis", "Nom du carwash requis.");
    if (!address.trim()) return Alert.alert("Champ requis", "Adresse requise.");

    try {
      setSaving(true);

      await addDoc(collection(db, "carwashes"), {
        name: name.trim(),
        address: address.trim(),
        description: description.trim(),
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        isActive: true,
      });

      Alert.alert("Succès", "Carwash créé.");
      navigation.goBack();
    } catch (e) {
      if (__DEV__) console.log("CreateCarwash error:", e?.message);
      Alert.alert("Erreur", "Impossible de créer le carwash.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer mon carwash</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Nom (ex: WashCar Annaba)"
        style={styles.input}
        editable={!saving && !locLoading}
      />

      <TextInput
        value={address}
        onChangeText={setAddress}
        placeholder="Adresse"
        style={styles.input}
        editable={!saving}
      />

      {/* ✅ AJOUT: bouton geoloc */}
      <TouchableOpacity
        style={[styles.geoBtn, (saving || locLoading) && { opacity: 0.7 }]}
        onPress={fillAddressFromGPS}
        disabled={saving || locLoading}
      >
        {locLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.geoBtnText}>Utiliser ma position</Text>
        )}
      </TouchableOpacity>

      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Description (optionnel)"
        style={[styles.input, { height: 90 }]}
        multiline
        editable={!saving && !locLoading}
      />

      <TouchableOpacity
        style={[styles.btn, (saving || locLoading) && { opacity: 0.7 }]}
        onPress={onCreate}
        disabled={saving || locLoading}
      >
        <Text style={styles.btnText}>{saving ? "Création..." : "Créer"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
  },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 14 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  geoBtn: {
    backgroundColor: "#0f766e",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  geoBtnText: { color: "#fff", fontWeight: "800" },
  btn: { backgroundColor: "#6366F1", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "800" },
});