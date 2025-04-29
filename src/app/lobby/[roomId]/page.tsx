"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";

export default function LobbyPage() {
  const { roomId } = useParams();
  const [name, setName] = useState("");
  const [hostName, setHostName] = useState("");
  const [joineeName, setJoineeName] = useState("");
  const [isHost, setIsHost] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedName = localStorage.getItem("playerName");
    if (storedName) {
      setName(storedName);
    }

    if (roomId) {
      const roomIdString = Array.isArray(roomId) ? roomId[0] : roomId;
      fetchRoomData(roomIdString);
    }
  }, [roomId]);

  const fetchRoomData = (roomId: string) => {
    const roomRef = ref(db, `rooms/${roomId}`);
    onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setHostName(data.host?.name || "Host");
        setJoineeName(data.joinee?.name || "Waiting for Joinee...");

        const storedId = localStorage.getItem("playerId");
        const isCurrentHost = data.host?.userId === storedId;
        setIsHost(isCurrentHost);

        const currentUser = isCurrentHost ? data.host : data.joinee;
        const phase = currentUser?.phase || "lobby";

        // 🚀 Redirect based on current user's phase
        if (phase === "questions") {
          router.push(`/game/${roomId}`);
        } 
        // else stay on lobby
      }
    });
  };

  const handleStartGame = () => {
    if (!roomId) return;

    const roomIdString = Array.isArray(roomId) ? roomId[0] : roomId;

    // Update both host and joinee phase to "questions"
    const updates: any = {};
    updates[`rooms/${roomIdString}/host/phase`] = "questions";
    updates[`rooms/${roomIdString}/joinee/phase`] = "questions";

    update(ref(db), updates)
      .then(() => {
        router.push(`/game/${roomIdString}`);
      })
      .catch((error) => {
        console.error("Failed to start game:", error);
      });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-4">Lobby - Room {roomId}</h1>
      <p className="text-xl mb-2">Host: {hostName}</p>
      <p className="text-xl mb-2">Joinee: {joineeName}</p>

      {isHost && (
        <button
          onClick={handleStartGame}
          className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
          disabled={joineeName === "Waiting for Joinee..."}
        >
          {joineeName === "Waiting for Joinee..." ? "Waiting for Joinee..." : "Start Game"}
        </button>
      )}
    </div>
  );
}
