"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ref, onValue, set } from "firebase/database";
import { db } from "@/lib/firebase";

export default function LobbyPage() {
  const { roomId } = useParams(); // Use dynamic routing parameter
  const [name, setName] = useState("");
  const [hostName, setHostName] = useState("");  // Store the host name
  const [joineeName, setJoineeName] = useState("");  // Store the joinee name
  const [isHost, setIsHost] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedName = localStorage.getItem("playerName");
    if (storedName) {
      setName(storedName);
    }

    // Ensure roomId is a string (handle case when it might be string[])
    if (roomId) {
      const roomIdString = Array.isArray(roomId) ? roomId[0] : roomId; // If roomId is an array, use the first element
      fetchRoomData(roomIdString); // Fetch room data with the correct roomId
    }
  }, [roomId]);

  const fetchRoomData = (roomId: string) => {
    const roomRef = ref(db, `rooms/${roomId}`);
    onValue(roomRef, (snapshot) => {
      const roomData = snapshot.val();
      console.log(roomData)
      if (roomData) {
        // Set the host and joinee data
        setHostName(roomData.host.name);
        setJoineeName(roomData.joinee ? roomData.joinee.name : "Waiting for joinee...");

        // Check if current player's id matches the host
        const storedId = localStorage.getItem("playerId")
        
        setIsHost(roomData.host.userId === storedId);
        setGameStarted(roomData.started || false);

        // Redirect if the game has already started
        if (roomData.started) {
          router.push(`/game/${roomId}`); // Redirect to game page
        }
      }
    });
  };

  const handleStartGame = () => {
    if (roomId) {
      const roomRef = ref(db, `rooms/${roomId}/started`);
      set(roomRef, true); // Mark the game as started in Firebase
      router.push(`/game/${roomId}`); // Redirect to game page
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-4">Lobby - Room {roomId}</h1>
      <p className="text-xl mb-4">Host: {hostName}</p>
      <p className="text-xl mb-4">Joinee: {joineeName}</p>

      <button
        onClick={handleStartGame}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg"
        hidden={gameStarted || !isHost}  // Disable button if game has started or if not the host
      >
        {gameStarted ? "Game Started" : "Start Game"}
      </button>
    </div>
  );
}
