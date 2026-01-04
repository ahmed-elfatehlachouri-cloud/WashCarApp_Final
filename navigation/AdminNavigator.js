import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import OwnerCarwashesScreen from "../screens/Admin/OwnerCarwashesScreen";
import OwnerReservationsScreen from "../screens/Admin/OwnerReservationsScreen";
import CreateCarwashScreen from "../screens/Owner/CreateCarwashScreen";

// AJOUT DES ÉCRANS MANQUANTS
import CreateServiceScreen from "../screens/Owner/CreateServiceScreen";
import OwnerServicesScreen from "../screens/Owner/OwnerServicesScreen";

const Stack = createNativeStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 1. Liste des carwashes du proprio */}
      <Stack.Screen name="OwnerCarwashes" component={OwnerCarwashesScreen} />
      
      {/* 2. Formulaire de création de carwash */}
      <Stack.Screen name="CreateCarwash" component={CreateCarwashScreen} />
      
      {/* 3. Liste des réservations (Dashboard) */}
      <Stack.Screen name="OwnerReservations" component={OwnerReservationsScreen} />

      {/* 4. Gestion des services pour un carwash spécifique */}
      <Stack.Screen name="OwnerServices" component={OwnerServicesScreen} />

      {/* 5. Formulaire de création de service (C'est lui qui manquait !) */}
      <Stack.Screen name="CreateService" component={CreateServiceScreen} />
    </Stack.Navigator>
  );
}