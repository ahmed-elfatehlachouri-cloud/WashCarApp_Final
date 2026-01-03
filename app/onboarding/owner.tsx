import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { Button, Text, Title } from "react-native-paper";

const { width } = Dimensions.get("window");

export default function OwnerOnboarding() {
  const slides = useMemo(
    () => [
      { title: "Créer ton carwash", body: "Ajoute le nom, l’adresse, localisation et infos." },
      { title: "Ajouter les services", body: "Crée tes services + prix (simple, complet, etc.)." },
      { title: "Recevoir des réservations", body: "Les clients réservent tes services depuis l’app." },
      { title: "Gérer les réservations", body: "Admin → Réservations (Owner) puis Confirmer / Annuler." },
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const x = useRef(new Animated.Value(0)).current;

  const goTo = (i: number) => {
    Animated.timing(x, { toValue: i * width, duration: 280, useNativeDriver: true }).start();
    setIndex(i);
  };

  const next = async () => {
    if (index < slides.length - 1) return goTo(index + 1);
    await AsyncStorage.setItem("@seenOnboarding_owner", "true");
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Title style={styles.header}>Guide Owner</Title>

      <Animated.View style={[styles.row, { transform: [{ translateX: Animated.multiply(x, -1) }] }]}>
        {slides.map((s, i) => (
          <View key={i} style={styles.slide}>
            <Title style={{ textAlign: "center" }}>{s.title}</Title>
            <Text style={{ textAlign: "center", marginTop: 12 }}>{s.body}</Text>
          </View>
        ))}
      </Animated.View>

      <Button mode="contained" onPress={next} style={{ marginTop: 16 }}>
        {index === slides.length - 1 ? "Commencer" : "Suivant"}
      </Button>

      <Button
        mode="text"
        onPress={async () => {
          await AsyncStorage.setItem("@seenOnboarding_owner", "true");
          router.replace("/");
        }}
      >
        Passer
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 20, justifyContent: "center" },
  header: { textAlign: "center", marginBottom: 16 },

  row: { flexDirection: "row", width: width * 4 },
  slide: { width, padding: 18, alignItems: "center" },
});
