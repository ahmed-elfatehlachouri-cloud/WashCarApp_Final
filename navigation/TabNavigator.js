import { MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import HomeScreen from "../screens/Home/HomeScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import { auth, db } from "../services/firebase/config";
import { Theme } from "../src/theme/Theme"; // Import de ton nouveau thème aquatique
import AdminNavigator from "./AdminNavigator";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const loadRole = async () => {
      const user = auth.currentUser;
      if (!user) return setRole("client");

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        setRole(snap.exists() ? snap.data()?.role || "client" : "client");
      } catch (e) {
        if (__DEV__) console.log("TabNavigator loadRole error:", e?.message);
        setRole("client");
      }
    };

    loadRole();
  }, []);

  const screenOptions = ({ route }) => ({
    headerShown: false,
    tabBarIcon: ({ color, size }) => {
      let iconName = "home";
      if (route.name === "Accueil") iconName = "home";
      if (route.name === "Profil") iconName = "person";
      if (route.name === "Admin") iconName = "admin-panel-settings";
      return <MaterialIcons name={iconName} color={color} size={size} />;
    },
    // CHANGEMENT ICI : Couleurs aquatiques
    tabBarActiveTintColor: Theme.colors.primary,   // Bleu Eau vive #0EA5E9
    tabBarInactiveTintColor: "#9CA3AF",           // Gris calme
    tabBarStyle: {
      backgroundColor: "#FFFFFF",
      borderTopWidth: 1,
      borderTopColor: Theme.colors.border,        // Bordure bleu ciel #BAE6FD
      height: 60,
      paddingBottom: 8,
    },
    tabBarLabelStyle: {
      fontWeight: "700",
      fontSize: 12,
    }
  });

  if (role === null) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Theme.colors.background }}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  const isOwner = role === "owner";
  const isAdmin = role === "admin";
  const isManager = isOwner || isAdmin;

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Accueil" component={HomeScreen} />
      {/* On garde Profil au milieu ou on peut le déplacer à la fin selon tes préférences */}
      <Tab.Screen name="Profil" component={ProfileScreen} />
      {isManager && <Tab.Screen name="Admin" component={AdminNavigator} />}
    </Tab.Navigator>
  );
}