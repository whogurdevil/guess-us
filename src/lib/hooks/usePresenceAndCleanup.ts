"use client";

import { useEffect } from "react";
import { ref, onValue, onDisconnect, set, remove } from "firebase/database";
import { db } from "@/lib/firebase";

export default function usePresenceAndCleanup(roomIdRaw: string | string[] | undefined) {
  useEffect(() => {
    const roomId = Array.isArray(roomIdRaw) ? roomIdRaw[0] : roomIdRaw;
    if (!roomId) return;

    // We assume you'll have stored these in localStorage when user joined/created the room.
    const playerId = localStorage.getItem("playerId");
    const playerRole = localStorage.getItem("playerRole"); // "host" or "joinee"
    if (!playerId || !playerRole) return;

    const roomRef = ref(db, `rooms/${roomId}`);
    const presenceRef = ref(db, `rooms/${roomId}/${playerRole}/connected`);

    // When this client connects, write `true`; when it disconnects, write `false`.
    onValue(ref(db, ".info/connected"), (snap) => {
      if (snap.val() === true) {
        // Mark connected = true
        set(presenceRef, true);
        // When this client disconnects, set connected = false and phase = "disconnected"
        onDisconnect(presenceRef).set(false);
        onDisconnect(ref(db, `rooms/${roomId}/${playerRole}/phase`)).set("disconnected");
      }
    });

    // Watch the room to decide if it should be deleted
    const cleanupUnsub = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const hostConn = data.host?.connected;
      const joineeConn = data.joinee?.connected;
      const hostPhase = data.host?.phase;
      const joineePhase = data.joinee?.phase;

      // Define conditions for deletion:
      // If either side is disconnected (connection=false or phase="disconnected")
      // AND the other side is idle (still in "lobby" or already disconnected),
      // delete after a short delay to avoid accidental quick deletes.
      const hostDisconnected = hostConn === false || hostPhase === "disconnected";
      const joineeDisconnected = joineeConn === false || joineePhase === "disconnected";

      const hostIdle = hostConn === false || hostPhase === "lobby";
      const joineeIdle = joineeConn === false || joineePhase === "lobby";

      const shouldDelete =
        (hostDisconnected && joineeIdle) ||
        (joineeDisconnected && hostIdle);

      if (shouldDelete) {
        setTimeout(() => {
          remove(roomRef);
        }, 5000);
      }
    });

    return () => {
      cleanupUnsub();
    };
  }, [roomIdRaw]);
}
