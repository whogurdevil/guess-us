"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";

export default function WaitingPage() {
  const router = useRouter();
  const { roomId } = useParams();
  const [hostWaiting, setHostWaiting] = useState(true);
  const [joineeWaiting, setJoineeWaiting] = useState(true);
  const [hostPhase, setHostPhase] = useState("");
  const [joineePhase, setjoineePhase] = useState("");

  useEffect(() => {
    if (!roomId) return;

    const roomIdString = Array.isArray(roomId) ? roomId[0] : roomId;
    const roomRef = ref(db, `rooms/${roomIdString}`);

    const unsubscribe = onValue(roomRef, (snapshot) => {
      const roomData = snapshot.val();
      if (roomData) {
        const newHostPhase = roomData.host?.phase;
        const newJoineePhase = roomData.joinee?.phase;
        setHostPhase(newHostPhase)
        setjoineePhase(newJoineePhase)


        setHostWaiting(hostPhase !== "waiting" ? false : true);
        setJoineeWaiting(joineePhase !== "waiting" ? false : true);

        if ((newHostPhase === "waiting" && newJoineePhase === "waiting") || (newHostPhase === "evaluation" || newJoineePhase === "evaluation")) {
          const updates: any = {
            [`rooms/${roomIdString}/host/phase`]: "evaluation",
            [`rooms/${roomIdString}/joinee/phase`]: "evaluation",
          };
        
          update(ref(db), updates)
            .then(() => {
              router.push(`/game/${roomIdString}/evaluation/`);
            })
            .catch((error) => {
              console.error("Failed to update phases to evaluation:", error);
            });
        }
        
      }
    });

    return () => unsubscribe();
  }, [roomId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-4">Waiting for Players in Room {roomId}</h1>

      {hostWaiting || joineeWaiting ? (
        <p className="text-xl">Waiting for the other player to complete...</p>
      ) : (
        <p className="text-xl">Both players completed! Redirecting...</p>
      )}
    </div>
  );
}
