"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { get, ref, set, update } from "firebase/database";
import { db } from "@/lib/firebase";

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8);
}

function generateUserId() {
  return `user_${Math.random().toString(36).substring(2, 9)}`;
}

export default function HomePage() {
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [joinRoom, setJoinRoom] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedName = localStorage.getItem("playerName");
    const storedUserId = localStorage.getItem("playerId");

    if (storedName) setName(storedName);

    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = generateUserId();
      setUserId(newUserId);
      localStorage.setItem("playerId", newUserId);
    }
  }, []);

  const handleCreateRoom = async () => {
    if (!name) {
      alert("Please enter your name.");
      return;
    }

    localStorage.setItem("playerName", name);

    const newRoomId = generateRoomCode();

    await set(ref(db, `rooms/${newRoomId}`), {
      host: {
        name: name,
        userId: userId,
        isCompleted: false,
        phase: "lobby",   // <- add phase field
        answers: [],
      }
    });

    router.push(`/lobby/${newRoomId}`);
  };

  const handleJoinRoom = async () => {
    if (!roomId || !name) {
      alert("Please enter your name and room ID.");
      return;
    }

    localStorage.setItem("playerName", name);
    localStorage.setItem("playerId", userId);

    const roomRef = ref(db, `rooms/${roomId}`);
    const roomSnapshot = await get(roomRef);

    if (roomSnapshot.exists()) {
      await update(roomRef, {
        joinee: {
          name: name,
          userId: userId,
          isCompleted: false,
          phase: "lobby",   // <- add phase field
          answers: [],
        }
      });

      router.push(`/lobby/${roomId}`);
    } else {
      alert("Room not found.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-4">Welcome to the Couples Game!</h1>

      <div className="w-full max-w-md mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={handleCreateRoom}
        className="px-6 py-2 mb-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
      >
        Create Room
      </button>

      <button
        onClick={() => setJoinRoom(true)}
        className="px-6 py-2 mb-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
      >
        Join Room
      </button>

      {joinRoom && (
        <div className="mt-4 flex flex-col items-center">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleJoinRoom}
            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all"
          >
            Join Room
          </button>
        </div>
      )}

      <div className="mt-4">
        <p>Your Player ID: {userId}</p>
        <p>Your Name: {name}</p>
      </div>
    </div>
  );
}
