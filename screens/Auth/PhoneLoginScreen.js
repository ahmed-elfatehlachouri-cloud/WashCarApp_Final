import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function PhoneLoginScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion par téléphone (désactivée)</Text>
      <Text style={styles.text}>
        Cette fonctionnalité est temporairement désactivée car expo-firebase-recaptcha n'est pas disponible.
      </Text>
      <Button title="Retour" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  text: { marginBottom: 15, color: "#444" },
});