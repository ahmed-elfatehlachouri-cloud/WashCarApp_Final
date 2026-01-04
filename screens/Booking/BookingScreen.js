// screens/Booking/BookingScreen.js
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { auth, db } from "../../services/firebase/config";
import { Theme, scale } from "../../src/theme/Theme";

const pad2 = (n) => String(n).padStart(2, "0");

const formatDateFR = (dateObj) => {
  const d = pad2(dateObj.getDate());
  const m = pad2(dateObj.getMonth() + 1);
  const y = dateObj.getFullYear();
  return `${d}/${m}/${y}`;
};

const formatTimeHHMM = (dateObj) => {
  const h = pad2(dateObj.getHours());
  const min = pad2(dateObj.getMinutes());
  return `${h}:${min}`;
};

export default function BookingScreen({ route, navigation }) {
  const { carwash, service } = route.params || {};
  const user = auth.currentUser;

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [userCoords, setUserCoords] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [dateValue, setDateValue] = useState(new Date());
  const [timeValue, setTimeValue] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const dateStr = useMemo(() => formatDateFR(dateValue), [dateValue]);
  const timeStr = useMemo(() => formatTimeHHMM(timeValue), [timeValue]);

  const handleGetLocation = async () => {
    try {
      setLocLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission refusée", "Activez la localisation pour continuer.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setUserCoords(coords);

      const reverse = await Location.reverseGeocodeAsync(coords);
      if (reverse && reverse.length > 0) {
        const a = reverse[0];
        const line = [a.streetNumber, a.street, a.city].filter(Boolean).join(" ");
        if (line) setAddress(line);
      }
    } catch (e) {
      Alert.alert("Erreur", "Impossible de récupérer la position.");
    } finally {
      setLocLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!phone.trim() || !address.trim()) {
      Alert.alert("Champs requis", "Veuillez remplir le téléphone et l'adresse.");
      return;
    }

    try {
      setSaving(true);

      // --- MISE À JOUR ICI ---
      // On s'assure d'inclure ownerId pour que le badge fonctionne !
      const reservationData = {
        userId: user.uid,
        carwashId: String(carwash.id),
        ownerId: carwash.ownerId, // INDISPENSABLE pour le badge Admin
        
        carwashName: carwash.name,
        serviceName: service.name,
        serviceId: String(service.id),
        price: Number(service.price) || 0,
        
        userPhone: phone.trim(),
        userAddress: address.trim(),
        userLatitude: userCoords?.latitude ?? null,
        userLongitude: userCoords?.longitude ?? null,
        
        date: dateStr,
        time: timeStr,
        
        status: "pending",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "reservations"), reservationData);
      Alert.alert("Succès", "Réservation créée avec succès.");
      navigation.goBack();
    } catch (e) {
      console.error("Détail Erreur Firebase:", e);
      Alert.alert("Erreur", "Action refusée par le serveur.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.mainTitle}>Finaliser la réservation</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <MaterialIcons name="local-car-wash" size={24} color={Theme.colors.primary} />
            <Text style={styles.summaryText}>Détails du service</Text>
          </View>
          <Text style={styles.carwashName}>{carwash?.name}</Text>
          <Text style={styles.serviceName}>{service?.name}</Text>
          <Text style={styles.price}>{service?.price} DA</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Téléphone</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="05XX XX XX XX"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <Text style={styles.label}>Adresse de prise en charge</Text>
          <View style={styles.addressContainer}>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Votre adresse complète"
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
            />
            <TouchableOpacity 
              style={styles.geoBtn} 
              onPress={handleGetLocation}
              disabled={locLoading}
            >
              {locLoading ? <ActivityIndicator color="#fff" size="small" /> : <MaterialIcons name="my-location" size={22} color="#fff" />}
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Date & Heure</Text>
          <View style={styles.pickerRow}>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowDatePicker(true)}>
              <MaterialIcons name="event" size={20} color={Theme.colors.primary} />
              <Text style={styles.pickerBtnText}>{dateStr}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowTimePicker(true)}>
              <MaterialIcons name="access-time" size={20} color={Theme.colors.primary} />
              <Text style={styles.pickerBtnText}>{timeStr}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={dateValue}
            mode="date"
            display="default"
            onChange={(event, date) => { setShowDatePicker(false); if (date) setDateValue(date); }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={timeValue}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={(event, date) => { setShowTimePicker(false); if (date) setTimeValue(date); }}
          />
        )}

        <TouchableOpacity 
          style={[styles.confirmBtn, saving && { opacity: 0.7 }]} 
          onPress={handleConfirm}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Confirmer le rendez-vous</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  scrollContent: { padding: Theme.spacing.md },
  mainTitle: { fontSize: scale(22), fontWeight: "800", color: Theme.colors.secondary, marginBottom: scale(20), textAlign: "center" },
  summaryCard: { backgroundColor: "#fff", borderRadius: Theme.radius.md, padding: Theme.spacing.md, ...Theme.shadow.medium, marginBottom: scale(20) },
  summaryHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  summaryText: { marginLeft: 8, fontWeight: "700", color: Theme.colors.textSub },
  carwashName: { fontSize: scale(18), fontWeight: "bold", color: Theme.colors.secondary },
  serviceName: { fontSize: scale(15), color: Theme.colors.textSub, marginVertical: 4 },
  price: { fontSize: scale(20), fontWeight: "900", color: Theme.colors.primary, marginTop: 5 },
  formGroup: { marginTop: 10 },
  label: { fontSize: scale(14), fontWeight: "700", color: Theme.colors.secondary, marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: "#fff", borderRadius: Theme.radius.sm, padding: scale(12), borderWidth: 1, borderColor: Theme.colors.border, fontSize: scale(14) },
  addressContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  geoBtn: { backgroundColor: Theme.colors.primary, padding: scale(12), borderRadius: Theme.radius.sm, justifyContent: "center", alignItems: "center" },
  pickerRow: { flexDirection: "row", gap: 10, marginTop: 5 },
  pickerBtn: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: scale(12), borderRadius: Theme.radius.sm, borderWidth: 1, borderColor: Theme.colors.border, gap: 10 },
  pickerBtnText: { fontWeight: "600", color: Theme.colors.textMain },
  confirmBtn: { backgroundColor: Theme.colors.secondary, padding: scale(16), borderRadius: Theme.radius.md, alignItems: "center", marginTop: scale(30), ...Theme.shadow.medium },
  confirmBtnText: { color: "#fff", fontWeight: "800", fontSize: scale(16) }
});