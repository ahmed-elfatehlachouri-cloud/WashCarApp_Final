import { MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import HomeScreen from "../screens/Home/HomeScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import { auth, db } from "../services/firebase/config";
import { Theme } from "../src/theme/Theme";
import AdminNavigator from "./AdminNavigator";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const [role, setRole] = useState(null);
  const [pendingCount, setPendingCount] = useState(0); 
  const [clientUpdateCount, setClientUpdateCount] = useState(0); 

  const currentUser = auth.currentUser;

  useEffect(() => {
    const loadRole = async () => {
      if (!currentUser) return setRole("client");
      try {
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        setRole(snap.exists() ? snap.data()?.role || "client" : "client");
      } catch (e) {
        if (__DEV__) console.log("TabNavigator loadRole error:", e?.message);
        setRole("client");
      }
    };
    loadRole();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !role) return;

    let q;
    if (role === "owner" || role === "admin") {
      q = query(
        collection(db, "reservations"),
        where("ownerId", "==", currentUser.uid),
        where("status", "==", "pending")
      );
    } else {
      q = query(
        collection(db, "reservations"),
        where("userId", "==", currentUser.uid),
        where("status", "in", ["confirmed", "canceled"]),
        where("isSeenByClient", "==", false) 
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (role === "owner" || role === "admin") {
        setPendingCount(snapshot.size);
      } else {
        setClientUpdateCount(snapshot.size);
      }
    }, (error) => {
      console.log("❌ Erreur Badge Listener:", error.message);
    });

    return () => unsubscribe();
  }, [currentUser, role]);

  const screenOptions = ({ route }) => ({
    headerShown: false,
    tabBarIcon: ({ color, size }) => {
      let iconName = "home";
      if (route.name === "Accueil") iconName = "home";
      if (route.name === "Profil") iconName = "person";
      if (route.name === "Admin") iconName = "admin-panel-settings";
      return <MaterialIcons name={iconName} color={color} size={size} />;
    },
    tabBarActiveTintColor: Theme.colors.primary,
    tabBarInactiveTintColor: "#9CA3AF",
    tabBarStyle: {
      backgroundColor: "#FFFFFF",
      borderTopWidth: 1,
      borderTopColor: Theme.colors.border,
      height: 60,
      paddingBottom: 8,
    },
    tabBarLabelStyle: { fontWeight: "700", fontSize: 12 }
  });

  if (role === null) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Theme.colors.background }}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  const isManager = role === "owner" || role === "admin";

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Accueil" component={HomeScreen} />
      
      <Tab.Screen 
        name="Profil" 
        component={ProfileScreen} 
        options={{
          tabBarBadge: (role === "client" && clientUpdateCount > 0) ? clientUpdateCount : null,
          tabBarBadgeStyle: {
            backgroundColor: Theme.colors.primary,
            color: "white",
            fontSize: 10,
          }
        }}
      />

      {isManager && (
        <Tab.Screen 
          name="Admin" 
          component={AdminNavigator} 
          options={{
            tabBarBadge: pendingCount > 0 ? pendingCount : null,
            tabBarBadgeStyle: {
              backgroundColor: "#EF4444",
              color: "white",
              fontSize: 10,
            }
          }}
        />
      )}
    </Tab.Navigator>
  );
}