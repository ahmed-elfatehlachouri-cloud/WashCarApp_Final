import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../services/firebase/config";
import { Theme, scale } from "../../src/theme/Theme";

export default function AdminScreen({ navigation }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  const fetchReservations = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const cwQuery = query(collection(db, "carwashes"), where("ownerId", "==", user.uid));
      const cwSnap = await getDocs(cwQuery);
      const myCarwashIds = cwSnap.docs.map((d) => d.id);

      if (myCarwashIds.length === 0) {
        setReservations([]);
        return;
      }

      const resQuery = query(collection(db, "reservations"), where("carwashId", "in", myCarwashIds));
      const resSnap = await getDocs(resQuery);
      
      const list = resSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setReservations(list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    } catch (e) {
      Alert.alert("Erreur", "Impossible de charger les réservations.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateStatus = async (id, newStatus) => {
    const actionLabel = newStatus === "confirmed" ? "CONFIRMER" : "ANNULER";
    
    Alert.alert(
      "Action requise",
      `Voulez-vous vraiment ${actionLabel} cette réservation ?`,
      [
        { text: "Retour", style: "cancel" },
        { 
          text: "Confirmer", 
          onPress: async () => {
            try {
              const resRef = doc(db, "reservations", id);
              await updateDoc(resRef, {
                status: newStatus,
                isSeenByClient: false, // <-- AJOUTÉ ICI
                updatedAt: serverTimestamp(),
              });
              Alert.alert("Succès", `Réservation ${newStatus === "confirmed" ? "validée" : "annulée"}.`);
              fetchReservations();
            } catch (e) {
              Alert.alert("Erreur", "Le changement de statut a échoué.");
            }
          } 
        }
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchReservations();
    }, [fetchReservations])
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.serviceName}>{item.serviceName}</Text>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons name="phone" size={18} color={Theme.colors.primary} />
        <Text style={styles.infoText}> Client : {item.userPhone || "N/A"}</Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons name="event" size={18} color={Theme.colors.primary} />
        <Text style={styles.infoText}> Date : {item.date} à {item.time}</Text>
      </View>

      {item.status === "pending" && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.btnAction, { backgroundColor: Theme.colors.success }]}
            onPress={() => updateStatus(item.id, "confirmed")}
          >
            <MaterialIcons name="check-circle" size={20} color="#fff" />
            <Text style={styles.btnActionText}>Valider</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnAction, { backgroundColor: Theme.colors.error }]}
            onPress={() => updateStatus(item.id, "canceled")}
          >
            <MaterialIcons name="cancel" size={20} color="#fff" />
            <Text style={styles.btnActionText}>Refuser</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={22} color={Theme.colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tableau de bord</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Aucune demande en attente.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case "confirmed": return Theme.colors.success;
    case "canceled": return Theme.colors.error;
    default: return "#F59E0B";
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: "row", alignItems: "center", paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: "#fff" },
  headerTitle: { fontSize: scale(22), fontWeight: "900", color: Theme.colors.secondary },
  listContent: { padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 16, marginBottom: 15, elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  serviceName: { fontSize: scale(17), fontWeight: "bold", color: Theme.colors.secondary },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "bold", textTransform: "uppercase" },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  infoText: { color: "#475569", fontSize: scale(14), marginLeft: 8 },
  actionRow: { flexDirection: "row", gap: 12, marginTop: 15, borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 15 },
  btnAction: { flex: 1, flexDirection: "row", height: 45, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  btnActionText: { color: "#fff", fontWeight: "bold", marginLeft: 6 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
  emptyText: { color: "#94A3B8", fontSize: 16 },
  backBtn: { marginRight: 15 }
});