import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { notifyInApp } from "../../services/notifications/inAppNotify";

export default function OwnerReservationsScreen({ navigation }) {
  const user = auth.currentUser;

  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [carwashIds, setCarwashIds] = useState([]);

  const initialLoadedRef = useRef(false);
  const unsubRef = useRef(null);

  const fetchOwnerCarwashIds = async () => {
    const qCw = query(collection(db, "carwashes"), where("ownerId", "==", user.uid));
    const snap = await getDocs(qCw);
    return snap.docs.map((d) => d.id);
  };

  const startRealtimeListener = (cwIds) => {
    if (unsubRef.current) unsubRef.current();

    if (!cwIds || cwIds.length === 0) {
      setReservations([]);
      setLoading(false);
      return;
    }

    // in max 10
    if (cwIds.length > 10) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const qRes = query(collection(db, "reservations"), where("carwashId", "in", cwIds));

    unsubRef.current = onSnapshot(
      qRes,
      (snap) => {
        const res = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        res.sort((a, b) => {
          const ap = (a.status || "pending") === "pending" ? 0 : 1;
          const bp = (b.status || "pending") === "pending" ? 0 : 1;
          return ap - bp;
        });

        setReservations(res);
        setLoading(false);

        if (initialLoadedRef.current) {
          const added = snap.docChanges().filter((c) => c.type === "added");
          for (const ch of added) {
            const data = ch.doc.data() || {};
            notifyInApp(
              "Nouvelle réservation",
              `${data.carwashName || "Carwash"} • ${data.serviceName || "Service"} • ${data.userPhone || ""}`
            );
          }
        } else {
          initialLoadedRef.current = true;
        }
      },
      (err) => {
        console.log("SNAP_ERR", "OWNER_RESERVATIONS", err?.code, err?.message);
        setLoading(false);
      }
    );
  };

  const getReservationsForCarwashIdsBatched = async (ids) => {
    const chunks = [];
    for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));

    const all = [];
    for (const batch of chunks) {
      const qRes = query(collection(db, "reservations"), where("carwashId", "in", batch));
      const snap = await getDocs(qRes);
      all.push(...snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    return all;
  };

  const reload = async () => {
    if (!user) return;

    try {
      setLoading(true);
      initialLoadedRef.current = false;

      const ids = await fetchOwnerCarwashIds();
      setCarwashIds(ids);

      startRealtimeListener(ids);

      // ✅ Safe fallback si >10
      if (ids.length > 10) {
        const all = await getReservationsForCarwashIdsBatched(ids);

        all.sort((a, b) => {
          const ap = (a.status || "pending") === "pending" ? 0 : 1;
          const bp = (b.status || "pending") === "pending" ? 0 : 1;
          return ap - bp;
        });

        setReservations(all);
        setLoading(false);
      }
    } catch (e) {
      console.log("OwnerReservations reload error:", e?.message);
      setReservations([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  const setStatus = async (reservationId, status) => {
    try {
      await updateDoc(doc(db, "reservations", reservationId), {
        status,
        updatedAt: serverTimestamp(),
      });

      if (carwashIds.length > 10) await reload();
    } catch (e) {
      console.log("setStatus error:", e?.message);
      Alert.alert("Erreur", "Impossible de changer le statut.");
    }
  };

  const confirmAction = (reservationId, nextStatus) => {
    const label = nextStatus === "confirmed" ? "Confirmer" : "Annuler";
    Alert.alert(label, `Voulez-vous ${label.toLowerCase()} cette réservation ?`, [
      { text: "Non", style: "cancel" },
      { text: "Oui", style: "destructive", onPress: () => setStatus(reservationId, nextStatus) },
    ]);
  };

  const emptyText = useMemo(() => {
    if (!user) return "Connexion requise";
    if (!loading && carwashIds.length === 0) return "Aucun carwash (owner).";
    if (!loading && reservations.length === 0) return "Aucune réservation pour tes carwashes.";
    return "";
  }, [user, loading, carwashIds.length, reservations.length]);

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>Connexion requise</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Chargement des réservations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={[styles.btnSmall, styles.btnNeutral]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.btnTextDark}>← Carwashes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btnSmall, styles.btnPrimary]} onPress={reload}>
          <Text style={styles.btnText}>Rafraîchir</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Réservations (Owner)</Text>

      {reservations.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: "#64748B", textAlign: "center" }}>{emptyText}</Text>
        </View>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {item.carwashName || item.carwashId} • {item.serviceName || item.serviceId}
              </Text>
              <Text style={styles.cardSub}>
                {item.date || "??/??/????"} à {item.time || "--:--"} • {item.price || 0} DA
              </Text>
              <Text style={styles.cardSub}>
                Client: {item.userPhone || "N/A"} • {item.userAddress || "N/A"}
              </Text>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.status || "pending"}</Text>
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnOk]}
                  onPress={() => confirmAction(item.id, "confirmed")}
                >
                  <Text style={styles.btnText}>Confirmer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.btnDanger]}
                  onPress={() => confirmAction(item.id, "canceled")}
                >
                  <Text style={styles.btnText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F8FAFC" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },

  topRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 12 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
  },
  cardTitle: { fontWeight: "bold", color: "#0F172A", marginBottom: 6 },
  cardSub: { color: "#64748B", marginBottom: 4 },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#111827",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 10,
  },
  badgeText: { color: "#fff", fontWeight: "800" },

  row: { flexDirection: "row", gap: 10 },

  btn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  btnSmall: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, alignItems: "center" },

  btnPrimary: { backgroundColor: "#0066FF" },
  btnOk: { backgroundColor: "#16A34A" },
  btnDanger: { backgroundColor: "#DC2626" },
  btnNeutral: { backgroundColor: "#E2E8F0" },

  btnText: { color: "#fff", fontWeight: "800" },
  btnTextDark: { color: "#0F172A", fontWeight: "800" },
});