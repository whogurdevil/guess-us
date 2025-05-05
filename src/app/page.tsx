"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { get, ref, set, update } from "firebase/database";
import { db } from "@/lib/firebase";

import PrimaryInput from "./components/inputs/primary_input";
import PrimaryButton from "./components/buttons/primary_button";
import SecondaryButton from "./components/buttons/seconday_button";
import PrimaryCard from "./components/cards/primary_card";

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
        phase: "lobby",
        answers: [],
      }
    });

    router.push(`/game/${newRoomId}/lobby/`);
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
          phase: "lobby",
          answers: [],
        }
      });

      router.push(`/game/${roomId}/lobby/`);
    } else {
      alert("Room not found.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 transition-all">
      <PrimaryCard>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-800 mb-6 text-center drop-shadow-sm">
          🎮 Guess Us!
        </h1>

        <div className="w-full max-w-md">
          <div className="mb-4">
            <PrimaryInput
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          {joinRoom && (
            <div className="mb-4">
              <PrimaryInput
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter Room ID"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-4 space-y-4 sm:space-y-0 mt-4 text-center">
            <PrimaryButton onClick={handleCreateRoom}>
              Create Room
            </PrimaryButton>

            <span className="text-gray-600 hidden sm:inline">or</span>

            <SecondaryButton
              onClick={() => {
                if (!joinRoom) {
                  setJoinRoom(true);
                } else {
                  handleJoinRoom();
                }
              }}
            >
              {joinRoom ? "Join Room" : "Enter Code"}
            </SecondaryButton>
          </div>
        </div>
      </PrimaryCard>
    </div>
  );
}
