import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import OwnerCarwashesScreen from "../screens/Admin/OwnerCarwashesScreen";
import OwnerReservationsScreen from "../screens/Admin/OwnerReservationsScreen";
import CreateCarwashScreen from "../screens/Owner/CreateCarwashScreen"; // ✅ chemin à vérifier

const Stack = createNativeStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OwnerCarwashes" component={OwnerCarwashesScreen} />
      <Stack.Screen name="CreateCarwash" component={CreateCarwashScreen} />
      <Stack.Screen name="OwnerReservations" component={OwnerReservationsScreen} />
    </Stack.Navigator>
  );
}