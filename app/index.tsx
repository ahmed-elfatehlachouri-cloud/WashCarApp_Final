import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import AppNavigator from "../navigation/AppNavigator";
import { auth, db } from "../services/firebase/config";
import { startGlobalWatchers } from "../services/notifications/globalWatchers";

export default function App() {
  const [role, setRole] = useState("client");

  // charger le rôle une fois
  useEffect(() => {
    const run = async () => {
      const user = auth.currentUser;
      if (!user) return setRole("client");
      const snap = await getDoc(doc(db, "users", user.uid));
      setRole(snap.exists() ? (snap.data()?.role || "client") : "client");
    };
    run();
  }, []);

  // démarrer listeners globaux
  useEffect(() => {
    const stop = startGlobalWatchers({ role });
    return () => stop();
  }, [role]);

  return <AppNavigator />;
}
