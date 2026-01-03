// screens/Services/ServicesScreen.js
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Surface, Text } from "react-native-paper";
import { db } from "../../services/firebase/config";
import { Theme, scale } from "../../src/theme/Theme";

export default function ServicesScreen({ route, navigation }) {
  const { carwash } = route.params;
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const q = query(collection(db, "services"), where("carwashId", "==", carwash.id));
      const snap = await getDocs(q);
      setServices(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetch();
  }, []);

  const renderItem = ({ item }) => (
    <Surface style={styles.serviceCard} elevation={1}>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.duration}>🕒 {item.duration || "45"} min</Text>
      </View>
      <View style={styles.actionRow}>
        <Text style={styles.price}>{item.price} DA</Text>
        <TouchableOpacity 
          style={styles.bookBtn}
          onPress={() => navigation.navigate("Booking", { carwash, service: item })}
        >
          <Text style={styles.bookBtnText}>Réserver</Text>
        </TouchableOpacity>
      </View>
    </Surface>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{carwash.name}</Text>
        <Text style={styles.subtitle}>Sélectionnez un type de lavage</Text>
      </View>
      <FlatList 
        data={services} 
        renderItem={renderItem} 
        keyExtractor={item => item.id}
        contentContainerStyle={{padding: Theme.spacing.md}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { padding: scale(20) },
  title: { fontSize: scale(22), fontWeight: 'bold', color: Theme.colors.secondary },
  subtitle: { color: Theme.colors.textSub },
  serviceCard: { backgroundColor: '#fff', padding: scale(16), borderRadius: Theme.radius.md, marginBottom: 15 },
  serviceName: { fontSize: scale(17), fontWeight: 'bold', color: Theme.colors.secondary },
  duration: { color: Theme.colors.textSub, fontSize: scale(12), marginTop: 4 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, borderTopWidth: 1, borderTopColor: Theme.colors.border, paddingTop: 10 },
  price: { fontSize: scale(18), fontWeight: '800', color: Theme.colors.primary },
  bookBtn: { backgroundColor: Theme.colors.secondary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: Theme.radius.sm },
  bookBtnText: { color: '#fff', fontWeight: 'bold' }
});