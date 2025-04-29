"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";

export default function ScorePage() {
  const { roomId } = useParams();
  const router = useRouter();

  const [score, setScore] = useState<number | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [joineePhase, setJoineePhase] = useState<string | null>(null);

  const roomIdString = Array.isArray(roomId) ? roomId[0] : roomId;

  useEffect(() => {
    const latestScore = localStorage.getItem("latestScore");
    const totalQ = localStorage.getItem("totalQuestions");

    if (latestScore) setScore(parseInt(latestScore));
    if (totalQ) setTotalQuestions(parseInt(totalQ));
  }, []);

  useEffect(() => {
    if (!roomIdString) return;
  
    const roomRef = ref(db, `rooms/${roomIdString}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const roomData = snapshot.val();
      if (!roomData) return;
  
      const storedId = localStorage.getItem("playerId");
      const hostId = roomData.host?.userId;
      const isCurrentHost = hostId === storedId;
      setIsHost(isCurrentHost);
  
      const joineePhaseVal = roomData.joinee?.phase || null;
      setJoineePhase(joineePhaseVal);
  
      // 👉 Redirect joinee if host started a new game
      const currentPlayerPhase = isCurrentHost ? roomData.host?.phase : roomData.joinee?.phase;
      if (!isCurrentHost && currentPlayerPhase === "lobby") {
        router.push(`/lobby/${roomIdString}`);
      }
    });
  
    return () => unsubscribe();
  }, [roomIdString, router]);
  

  const handlePlayAgain = () => {
    if (!roomIdString || !isHost) return;

    const updates: any = {
      [`rooms/${roomIdString}/host/answers`]: [],
      [`rooms/${roomIdString}/joinee/answers`]: [],
      [`rooms/${roomIdString}/host/phase`]: "lobby",
      [`rooms/${roomIdString}/joinee/phase`]: "lobby",
      };

    update(ref(db), updates)
      .then(() => {
        router.push(`/lobby/${roomIdString}`);
      })
      .catch((error) => {
        console.error("Failed to reset game:", error);
      });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-100 p-6">
      <h1 className="text-4xl font-bold mb-4">Final Score</h1>
      <p className="text-2xl mb-2">You scored: {score} / {totalQuestions}</p>

      <button
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
        onClick={() => router.push("/")}
      >
        Go to Home
      </button>

      {isHost && joineePhase === "score" && (
        <button
          className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
          onClick={handlePlayAgain}
        >
          Play Again
        </button>
      )}
    </div>
  );
}
