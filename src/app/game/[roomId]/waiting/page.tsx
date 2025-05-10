"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";
import SecondaryCard from "@/app/components/cards/secondary_card";

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
    <div className="min-h-full flex justify-center p-6">
      <SecondaryCard className="w-90 max-w-md text-center p-6 rounded-2xl shadow-lg sm:w-screen">
      <h1 className="text-4xl font-bold mb-4">Waiting for Players in Room {roomId}</h1>

      
        <p className="text-xl py-6">Waiting for the other player to complete...</p>
      
      </SecondaryCard>
    </div>
  );
}
