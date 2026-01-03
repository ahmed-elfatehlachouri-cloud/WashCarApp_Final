import { MaterialIcons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Avatar, Badge, Button, Card, Text } from "react-native-paper";
import { auth, db } from "../../services/firebase/config";
import { Theme, scale } from "../../src/theme/Theme";

export default function ProfileScreen() {
  const [reservations, setReservations] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    // PRUDENCE : Le listener onSnapshot met à jour l'écran dès que l'Admin valide
    const q = query(collection(db, "reservations"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setReservations(list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });
    return () => unsub();
  }, [user]);

  const cancelReservation = (id) => {
    Alert.alert(
      "Annuler le rendez-vous", 
      "Êtes-vous sûr ? Le centre de lavage sera immédiatement prévenu.", 
      [
        { text: "Garder le RDV", style: "cancel" },
        { 
          text: "Oui, annuler", 
          onPress: async () => {
            try {
              await updateDoc(doc(db, "reservations", id), { 
                status: "canceled", 
                updatedAt: serverTimestamp() 
              });
              Alert.alert("Terminé", "Réservation annulée avec succès.");
            } catch (e) { 
              Alert.alert("Erreur", "Impossible d'annuler."); 
            }
          }
        }
      ]
    );
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case "confirmed": return { color: Theme.colors.success, label: "Confirmé" };
      case "canceled": return { color: Theme.colors.error, label: "Annulé" };
      default: return { color: "#F59E0B", label: "En attente" };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Icon size={scale(70)} icon="account" style={{backgroundColor: Theme.colors.primary}} color="#fff" />
        <Text style={styles.email}>{user?.email}</Text>
        <TouchableOpacity onPress={() => signOut(auth)} style={styles.logoutBtn}>
          <MaterialIcons name="power-settings-new" size={20} color={Theme.colors.error} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Historique de lavage</Text>
        <FlatList
          data={reservations}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const status = getStatusStyle(item.status);
            return (
              <Card style={styles.resCard}>
                <Card.Content>
                  <View style={styles.resHeader}>
                    <Text style={styles.resService}>{item.serviceName}</Text>
                    <Badge style={{ backgroundColor: status.color, color: '#fff', paddingHorizontal: 8 }}>
                      {status.label}
                    </Badge>
                  </View>
                  <Text style={styles.resSub}>📍 {item.carwashName}</Text>
                  <Text style={styles.resSub}>🕒 {item.date} à {item.time}</Text>
                  
                  {item.status === "pending" && (
                    <Button 
                      mode="text" 
                      onPress={() => cancelReservation(item.id)} 
                      textColor={Theme.colors.error}
                      style={styles.cancelBtn}
                    >
                      Annuler
                    </Button>
                  )}
                </Card.Content>
              </Card>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { alignItems: 'center', padding: 30, backgroundColor: '#fff', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 4 },
  email: { fontSize: scale(16), fontWeight: 'bold', marginTop: 12, color: Theme.colors.secondary },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 10, padding: 8 },
  logoutText: { color: Theme.colors.error, marginLeft: 6, fontWeight: '700' },
  listSection: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: scale(18), fontWeight: '900', marginBottom: 15, color: Theme.colors.secondary },
  resCard: { marginBottom: 15, backgroundColor: '#fff', borderRadius: 15, elevation: 2 },
  resHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  resService: { fontWeight: 'bold', fontSize: scale(15) },
  resSub: { color: '#64748B', fontSize: scale(13), marginTop: 4 },
  cancelBtn: { alignSelf: 'flex-end', marginTop: -10 }
});