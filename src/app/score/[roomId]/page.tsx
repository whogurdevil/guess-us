// app/room/[roomId]/score.tsx

"use client";

import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ScorePage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const router = useRouter();

  const [player1Finished, setPlayer1Finished] = useState(false);
  const [player2Finished, setPlayer2Finished] = useState(false);

  useEffect(() => {
    const roomRef = ref(db, `rooms/${roomId}`);
    onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      setPlayer1Finished(data.player1Finished);
      setPlayer2Finished(data.player2Finished);
    });
  }, [roomId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-semibold mb-4">Scores</h1>
      {player1Finished && player2Finished ? (
        <div>
          <h2 className="text-lg">Player 1: Finished</h2>
          <h2 className="text-lg">Player 2: Finished</h2>
        </div>
      ) : (
        <div className="text-xl">Waiting for both players to finish...</div>
      )}
    </div>
  );
}
