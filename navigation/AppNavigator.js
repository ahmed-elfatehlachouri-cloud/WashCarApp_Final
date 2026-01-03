import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { auth } from "../services/firebase/config";

// --- IMPORT DE LA SCALABILITÉ & DU THÈME ---
import { Theme } from "../src/theme/Theme";

// --- IMPORTS DES ÉCRANS ---
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import SplashScreen from "../screens/Auth/SplashScreen";
import TabNavigator from "./TabNavigator";

// Écrans Clients
import BookingScreen from "../screens/Booking/BookingScreen";
import ServicesScreen from "../screens/Services/ServicesScreen";

// Écrans Propriétaires / Admin
import AdminScreen from "../screens/Admin/AdminScreen";
import EditServiceScreen from "../screens/Owner/EditServiceScreen";
import OwnerServicesScreen from "../screens/Owner/OwnerServicesScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setInitializing(false);
    });
    return subscriber; // Se désabonne à la fermeture
  }, []);

  // --- NOTIFICATION DE CHARGEMENT SCALABLE ---
  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // --- STACK UTILISATEUR CONNECTÉ ---
        <Stack.Group>
          <Stack.Screen name="Main" component={TabNavigator} />
          
          {/* Écrans de navigation fluide */}
          <Stack.Screen name="Services" component={ServicesScreen} />
          <Stack.Screen name="Booking" component={BookingScreen} />
          
          {/* Gestion Admin/Owner */}
          <Stack.Screen name="OwnerServices" component={OwnerServicesScreen} />
          <Stack.Screen name="EditService" component={EditServiceScreen} />
          <Stack.Screen name="ManageReservations" component={AdminScreen} />
        </Stack.Group>
      ) : (
        // --- STACK AUTHENTIFICATION ---
        <Stack.Group>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: Theme.colors.background || "#F0F9FF" 
  },
});