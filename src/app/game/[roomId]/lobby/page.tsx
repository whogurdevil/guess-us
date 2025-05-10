"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";
import PrimaryCard from "@/app/components/cards/primary_card";
import PrimaryButton from "@/app/components/buttons/primary_button";
import SecondaryCard from "@/app/components/cards/secondary_card";
import LoadingLoop from "@/app/components/loading/loading-loop";

export default function LobbyPage() {
  const { roomId } = useParams();
  const [name, setName] = useState("");
  const [hostName, setHostName] = useState("");
  const [joineeName, setJoineeName] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [dots, setDots] = useState(""); // For managing the animated dots
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

  // Handle the animation of dots (waiting effect)
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length === 3) {
          return ""; // Reset after 3 dots
        }
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval); // Cleanup interval when component unmounts
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
          <div className="mt-8">
            <PrimaryButton
              onClick={handleStartGame}
              disabled={joineeName === "Waiting for Joinee..."}
            >
              {joineeName === "Waiting for Joinee..." ? "Waiting for Joinee..." : "Start Game"}
            </PrimaryButton>
          </div>
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
