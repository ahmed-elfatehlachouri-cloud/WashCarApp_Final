import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { notifyInApp } from "./inAppNotify";

async function fetchOwnerCarwashIds(uid) {
  const qCw = query(collection(db, "carwashes"), where("ownerId", "==", uid));
  const snap = await getDocs(qCw);
  return snap.docs.map((d) => d.id);
}

async function getRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data()?.role || null) : null;
}

export function startGlobalWatchers() {
  const user = auth.currentUser;
  if (!user) return () => {};

  const unsubs = [];
  let stopped = false;

  const onSnapError = (label) => (err) => {
    // ✅ logout / stop -> ignore
    if (stopped || !auth.currentUser) return;
    console.log("SNAP_ERR", label, err?.code, err?.message);
  };

  (async () => {
    try {
      const role = await getRole(user.uid);
      if (stopped) return;
      if (!role) return;

      if (role === "client") {
        const qRes = query(collection(db, "reservations"), where("userId", "==", user.uid));
        let ready = false;

        const unsub = onSnapshot(
          qRes,
          (snap) => {
            if (stopped) return;
            if (!ready) { ready = true; return; }

            snap.docChanges().forEach((ch) => {
              if (ch.type !== "modified") return;
              const data = ch.doc.data() || {};
              if (data.status === "confirmed") notifyInApp("Réservation", "Confirmée.");
              if (data.status === "canceled") notifyInApp("Réservation", "Annulée.");
            });
          },
          onSnapError("GLOBAL_CLIENT")
        );

        unsubs.push(unsub);
      }

      if (role === "owner") {
        const cwIds = await fetchOwnerCarwashIds(user.uid);
        if (stopped) return;
        if (!cwIds || cwIds.length === 0) return;
        if (cwIds.length > 10) return;

        const qRes = query(collection(db, "reservations"), where("carwashId", "in", cwIds));
        let ready = false;

        const unsubOwner = onSnapshot(
          qRes,
          (snap) => {
            if (stopped) return;
            if (!ready) { ready = true; return; }

            snap.docChanges().forEach((ch) => {
              if (ch.type !== "added") return;
              const data = ch.doc.data() || {};
              notifyInApp(
                "Nouvelle réservation",
                `${data.carwashName || "Carwash"} • ${data.serviceName || "Service"}`
              );
            });
          },
          onSnapError("GLOBAL_OWNER")
        );

        unsubs.push(unsubOwner);
      }
    } catch (e) {
      if (!stopped && auth.currentUser) console.log("GlobalWatchers init error:", e?.message);
    }
  })();

  return () => {
    stopped = true;
    unsubs.forEach((u) => u && u());
  };
}