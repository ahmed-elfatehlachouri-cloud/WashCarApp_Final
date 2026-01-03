import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { Button, Text, Title } from "react-native-paper";

const { width } = Dimensions.get("window");

export default function ClientOnboarding() {
  const slides = useMemo(
    () => [
      { title: "Choisir un carwash", body: "Choisis un carwash proche et un service (simple, complet, etc.)." },
      { title: "Réserver", body: "Choisis date/heure, adresse/téléphone puis confirme." },
      { title: "Voir le statut", body: "Profil → Mes Réservations: pending / confirmed / canceled." },
      { title: "Après confirmation", body: "Quand l’owner confirme, le statut change dans Mes Réservations." },
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
    await AsyncStorage.setItem("@seenOnboarding_client", "true");
    router.replace("/");
  };

  const progress = x.interpolate({
    inputRange: [0, (slides.length - 1) * width],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      <Title style={styles.header}>Guide Client</Title>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { transform: [{ scaleX: progress }] }]} />
      </View>

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
          await AsyncStorage.setItem("@seenOnboarding_client", "true");
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

  progressTrack: { height: 6, backgroundColor: "#E2E8F0", borderRadius: 99, overflow: "hidden" },
  progressFill: { height: 6, backgroundColor: "#6366F1", width: "100%", transformOrigin: "left" },
});
