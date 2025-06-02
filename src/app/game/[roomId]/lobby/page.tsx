"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { getRandomQuestions } from "@/lib/getUniqueQuestions"; // Make sure this exists
import PrimaryCard from "@/app/components/cards/primary_card";
import PrimaryButton from "@/app/components/buttons/primary_button";
import SecondaryCard from "@/app/components/cards/secondary_card";

export default function LobbyPage() {
  const { roomId } = useParams();
  const [name, setName] = useState("");
  const [hostName, setHostName] = useState("");
  const [joineeName, setJoineeName] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [dots, setDots] = useState("");
  const [category, setCategory] = useState("friends"); // NEW
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

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length === 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

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

        if (phase === "questions") {
          router.push(`/game/${roomId}`);
        }
      }
    });
  };

  const handleStartGame = async () => {
    if (!roomId) return;

    const roomIdString = Array.isArray(roomId) ? roomId[0] : roomId;

    try {
      const questions = await getRandomQuestions(category);
      console.log(questions)

      const updates: any = {
        [`rooms/${roomIdString}/host/phase`]: "questions",
        [`rooms/${roomIdString}/joinee/phase`]: "questions",
        [`rooms/${roomIdString}/questions`]: questions,
      };

      await update(ref(db), updates);
      router.push(`/game/${roomIdString}`);
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  return (
    <div className="min-h-full flex justify-center p-4">
      <SecondaryCard className="w-90 max-w-md text-center p-6 rounded-2xl shadow-lg sm:w-screen">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Game Lobby</h1>

        <div className="space-y-4 text-lg text-gray-700">
          <p>
            <span className="font-semibold">Host:</span> {hostName}
          </p>
          <p>
            <span className="font-semibold">Joinee:</span>{" "}
            {joineeName === "Waiting for Joinee..." ? (
              <span className="italic text-gray-500">
                Waiting for player to join{dots}
              </span>
            ) : (
              joineeName
            )}
          </p>
        </div>

        {isHost && (
          <>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Select Category
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="friends">Friends</option>
                <option value="couples">Couples</option>
                <option value="siblings">Siblings</option>
              </select>
            </div>

            <div className="mt-8">
              <PrimaryButton
                onClick={handleStartGame}
                disabled={joineeName === "Waiting for Joinee..."}
              >
                {joineeName === "Waiting for Joinee..." ? "Waiting for Joinee..." : "Start Game"}
              </PrimaryButton>
            </div>
          </>
        )}

        {!isHost && (
          <div className="mt-8 flex justify-center items-center h-16">
            <span className="italic text-gray-500">
              Waiting for the host to start{dots}
            </span>
          </div>
        )}
      </SecondaryCard>
    </div>
  );
}
