// screens/Home/HomeScreen.js
import { MaterialIcons } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context"; // Correction Warning
import { auth, db } from "../../services/firebase/config";
import { Theme, scale } from "../../src/theme/Theme";

const CARWASH_IMAGES = {
  "Home of carwashes": require("../../assets/images/carwashes/home_of_carwashes.png"),
  "Lavage Annaba Kouba": require("../../assets/images/carwashes/kouba.png"),
  "Lavage Annaba Centre": require("../../assets/images/carwashes/lavage_annaba_centre.png"),
};
const DEFAULT_IMAGE = require("../../assets/images/carwashes/Gemini_Generated_Image_vhjoj3vhjoj3vhjo.png");

export default function HomeScreen({ navigation }) {
  const [carwashes, setCarwashes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDocs(collection(db, "carwashes"));
        setCarwashes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetch();
  }, []);

const handlePress = (item) => {
  const user = auth.currentUser;
  
  if (user && item.ownerId === user.uid) {
    console.log("👉 Direction OWNER OK");
    // On appelle directement le nom défini dans AppStack
    navigation.navigate("OwnerServices", { carwash: item }); 
  } else {
    console.log("👉 Direction CLIENT OK");
    navigation.navigate("Services", { carwash: item });
  }
};

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handlePress(item)} activeOpacity={0.8}>
      <Image source={CARWASH_IMAGES[item.name] || DEFAULT_IMAGE} style={styles.image} />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{item.name}</Text>
          {auth.currentUser?.uid === item.ownerId && (
            <MaterialIcons name="stars" size={20} color={Theme.colors.primary} />
          )}
        </View>
        <View style={styles.locRow}>
          <MaterialIcons name="location-on" size={16} color={Theme.colors.primary} />
          <Text style={styles.address}>{item.address}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>WashCar</Text>
        <Text style={styles.subtitle}>Sélectionnez un centre de lavage</Text>
      </View>
      {loading ? (
        <ActivityIndicator style={{marginTop: 50}} color={Theme.colors.primary} />
      ) : (
        <FlatList data={carwashes} renderItem={renderItem} keyExtractor={item => item.id} contentContainerStyle={styles.list} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { paddingHorizontal: Theme.spacing.lg, paddingTop: 10 },
  title: { fontSize: scale(28), fontWeight: "800", color: Theme.colors.secondary },
  subtitle: { fontSize: scale(14), color: Theme.colors.textSub },
  list: { padding: Theme.spacing.md },
  card: { backgroundColor: "#fff", borderRadius: Theme.radius.lg, marginBottom: Theme.spacing.lg, ...Theme.shadow.medium, overflow: 'hidden' },
  image: { width: '100%', height: scale(160) },
  info: { padding: Theme.spacing.md },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: scale(18), fontWeight: 'bold', color: Theme.colors.secondary },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  address: { color: Theme.colors.textSub, marginLeft: 4, fontSize: scale(12) }
});