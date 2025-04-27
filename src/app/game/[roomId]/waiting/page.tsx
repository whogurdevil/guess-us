"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";

export default function WaitingPage() {
  const router = useRouter();
  const { roomId } = useParams(); // Correct way in app directory
  const [isHostCompleted, setIsHostCompleted] = useState(false);
  const [isJoineeCompleted, setIsJoineeCompleted] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const roomRef = ref(db, `rooms/${roomId}`);
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const roomData = snapshot.val();

      if (roomData) {
        const hostData = roomData.host;
        const joineeData = roomData.joinee;

        setIsHostCompleted(hostData?.isCompleted || false);
        setIsJoineeCompleted(joineeData?.isCompleted || false);

        if (hostData?.isCompleted && joineeData?.isCompleted) {
          router.push(`/game/${roomId}/evaluation`);
        }
      }
    });

    return () => unsubscribe(); // Clean up listener when unmounting
  }, [roomId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-4">Waiting for Players in Room {roomId}</h1>

      {!isHostCompleted || !isJoineeCompleted ? (
        <p className="text-xl">Waiting for the other player to complete...</p>
      ) : (
        <p className="text-xl">Both players completed! Redirecting...</p>
      )}
    </div>
  );
}
