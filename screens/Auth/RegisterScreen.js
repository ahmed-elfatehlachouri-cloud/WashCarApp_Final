import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Avatar, Button, SegmentedButtons, Text, TextInput } from "react-native-paper";
import { auth, db } from "../../services/firebase/config";
import { Theme, scale } from "../../src/theme/Theme";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client"); // État pour le rôle (client ou owner)
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      
      // On enregistre l'utilisateur avec le rôle choisi (client ou owner)
      await setDoc(doc(db, "users", cred.user.uid), {
        email: email,
        role: role, // Sauvegarde "client" ou "owner"
        createdAt: new Date(),
      });
      
    } catch (e) {
      Alert.alert("Erreur", "Inscription impossible. L'email est peut-être déjà utilisé.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Avatar.Icon size={scale(70)} icon="account-plus" style={{backgroundColor: Theme.colors.primary}} color="#fff" />
            <Text style={styles.title}>Inscription</Text>
            <Text style={styles.subtitle}>Créez votre compte WashCar</Text>
          </View>

          <View style={styles.form}>
            {/* SÉLECTEUR DE RÔLE MODERNE */}
            <Text style={styles.label}>Je suis un :</Text>
            <SegmentedButtons
              value={role}
              onValueChange={setRole}
              buttons={[
                { value: 'client', label: 'Client', icon: 'account' },
                { value: 'owner', label: 'Propriétaire', icon: 'store' },
              ]}
              style={styles.rolePicker}
            />

            <TextInput 
              label="Email" mode="outlined" value={email} onChangeText={setEmail} 
              keyboardType="email-address" autoCapitalize="none"
              style={styles.input} outlineColor={Theme.colors.border} activeOutlineColor={Theme.colors.primary}
            />
            
            <TextInput 
              label="Mot de passe" mode="outlined" 
              secureTextEntry={!showPassword} 
              value={password} onChangeText={setPassword} 
              style={styles.input} outlineColor={Theme.colors.border} activeOutlineColor={Theme.colors.primary}
              right={
                <TextInput.Icon 
                  icon={showPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowPassword(!showPassword)} 
                />
              }
            />

            <Button 
              mode="contained" onPress={handleRegister} loading={loading} 
              style={styles.registerBtn} contentStyle={{height: scale(50)}}
            >
              S'inscrire
            </Button>

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.link}>
              <Text style={{color: Theme.colors.textSub}}>
                Déjà inscrit ? <Text style={{color: Theme.colors.primary, fontWeight: 'bold'}}>Se connecter</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  scroll: { flexGrow: 1, paddingBottom: 30 },
  header: { alignItems: 'center', marginTop: scale(40) },
  title: { fontSize: scale(28), fontWeight: '900', color: Theme.colors.secondary, marginTop: 10 },
  subtitle: { color: Theme.colors.textSub, fontSize: scale(14) },
  form: { padding: Theme.spacing.lg, marginTop: scale(20) },
  label: { marginBottom: 10, fontWeight: 'bold', color: Theme.colors.secondary, fontSize: 16 },
  rolePicker: { marginBottom: 20 },
  input: { marginBottom: 15, backgroundColor: '#fff' },
  registerBtn: { marginTop: 10, borderRadius: Theme.radius.md, backgroundColor: Theme.colors.primary },
  link: { marginTop: 25, alignItems: 'center' }
});