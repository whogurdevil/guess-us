"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";
import SecondaryButton from "@/app/components/buttons/seconday_button";
import SecondaryCard from "@/app/components/cards/secondary_card";
import PrimaryButton from "@/app/components/buttons/primary_button";

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
        router.push(`/game/${roomIdString}/lobby/`);
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
      [`rooms/${roomIdString}/questions`]: [],
      };

    update(ref(db), updates)
      .then(() => {
        router.push(`/game/${roomIdString}/lobby/`);
      })
      .catch((error) => {
        console.error("Failed to reset game:", error);
      });
  };

  return (
    <div className="flex flex-col items-center min-h-full p-6">
      <SecondaryCard className="w-90 max-w-md text-center p-6 rounded-2xl shadow-lg sm:w-screen">
      
      <h1 className="text-4xl font-bold mb-4">Final Score</h1>
      <p className="text-2xl mb-2 py-5">You scored: {score} / {totalQuestions}</p>

      {isHost && joineePhase === "score" && (
        <PrimaryButton
          onClick={handlePlayAgain}
          disabled={false}
        >
          Play Again
        </PrimaryButton>
      )}
      </SecondaryCard>
    </div>
  );
}
