import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { auth } from "../../services/firebase/config";
import { Theme, scale } from "../../src/theme/Theme";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Erreur", "Veuillez remplir tous les champs.");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      Alert.alert("Erreur", "Identifiants incorrects.");
    } finally { setLoading(false); }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert("Attention", "Entrez votre email pour recevoir le lien.");
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => Alert.alert("Email envoyé", "Vérifiez votre boîte de réception."))
      .catch(() => Alert.alert("Erreur", "Email inconnu."));
  };

  return (
    <LinearGradient
      colors={['#BAE6FD', '#FFFFFF', '#F0F9FF']} 
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={{flex: 1}}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={[Theme.colors.primary, Theme.colors.accent]}
                  style={styles.iconCircle}
                >
                  {/* REMPLACEMENT ICI : Icône voiture avec mousse */}
                  <MaterialCommunityIcons name="car-wash" size={scale(60)} color="#fff" />
                </LinearGradient>
              </View>
              
              <Text style={styles.title}>WashCar</Text>
              <Text style={styles.subtitle}>La propreté éclatante pour votre auto</Text>
            </View>

            <View style={styles.form}>
              <TextInput 
                label="Email" mode="outlined" value={email} onChangeText={setEmail} 
                keyboardType="email-address" autoCapitalize="none"
                style={styles.input} 
                outlineColor={Theme.colors.border} 
                activeOutlineColor={Theme.colors.primary}
              />
              
              <View>
                <TextInput 
                  label="Mot de passe" mode="outlined" 
                  secureTextEntry={!showPassword} 
                  value={password} onChangeText={setPassword} 
                  style={styles.input} 
                  outlineColor={Theme.colors.border} 
                  activeOutlineColor={Theme.colors.primary}
                  right={
                    <TextInput.Icon 
                      icon={showPassword ? "eye-off" : "eye"} 
                      onPress={() => setShowPassword(!showPassword)} 
                    />
                  }
                />
                
                <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPass}>
                  <Text style={styles.forgotPassText}>Mot de passe oublié ?</Text>
                </TouchableOpacity>
              </View>
              
              <Button 
                mode="contained" 
                onPress={handleLogin} 
                loading={loading} 
                style={styles.loginBtn} 
                contentStyle={{height: scale(50)}}
                labelStyle={{fontWeight: 'bold', fontSize: 16}}
              >
                Se connecter
              </Button>

              <TouchableOpacity onPress={() => navigation.navigate("Register")} style={styles.link}>
                <Text style={{color: Theme.colors.textSub}}>
                  Pas de compte ? <Text style={{color: Theme.colors.primary, fontWeight: 'bold'}}>S'inscrire</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingBottom: scale(20) },
  header: { alignItems: 'center', marginTop: scale(40) },
  iconContainer: {
    marginBottom: scale(15),
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
  },
  iconCircle: {
    width: scale(110),
    height: scale(110),
    borderRadius: scale(55),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  title: { fontSize: scale(36), fontWeight: '900', color: "#0369A1", marginTop: 10, letterSpacing: 1 },
  subtitle: { color: "#64748B", fontSize: scale(14), fontWeight: '500' },
  form: { padding: scale(24) },
  input: { marginBottom: 10, backgroundColor: '#fff' },
  forgotPass: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotPassText: { color: "#0EA5E9", fontWeight: '700', fontSize: scale(13) },
  loginBtn: { 
    marginTop: 10, 
    borderRadius: 15, 
    backgroundColor: "#0EA5E9", 
    elevation: 6,
    shadowColor: "#0EA5E9",
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  link: { marginTop: 25, alignItems: 'center' }
});