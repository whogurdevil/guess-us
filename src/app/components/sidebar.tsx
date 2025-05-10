"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import SecondaryCard from "./cards/secondary_card";
import Image from "next/image";

type Player = {
  isCompleted: boolean;
  name: string;
  phase: string;
  userId: string;
};

type RoomInfo = {
  host: Player;
  joinee: Player;
};

export default function Sidebar() {
  const { roomId } = useParams();
  const roomIdString = Array.isArray(roomId) ? roomId[0] : roomId;

  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("playerId");
    if (id) setCurrentUserId(id);
  }, []);

  useEffect(() => {
    if (!roomIdString) return;

    const roomRef = ref(db, `rooms/${roomIdString}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setRoomInfo(data);
    });

    return () => unsubscribe();
  }, [roomIdString]);

  const isYou = (userId: string) => currentUserId === userId;

  return (
    <aside className="flex flex-col w-full lg:w-80 text-white p-6 rounded-lg">
      {/* Room Code */}
      <SecondaryCard className="mb-6">
        <p className="text-lg text-black text-center font-semibold p-2">
          Room Code: {roomIdString}
        </p>
      </SecondaryCard>

      {/* Players */}
      <div className="grid grid-cols-2 gap-6 items-stretch md:grid-cols-2 lg:grid-cols-1">
        {/* Host */}
        <SecondaryCard className="text-black h-full flex flex-col justify-center items-start p-4 gap-2">
          <div className="flex items-center gap-2">
            <p className={`text-md ${isYou(roomInfo?.host?.userId) ? "font-bold" : ""}`}>
              {roomInfo?.host?.name ?? "Loading..."}
              {isYou(roomInfo?.host?.userId) ? " (You)" : ""}
            </p>
            {roomInfo?.host?.userId && (
              <Image
                src="/crown-host.svg"
                alt="Host Joined"
                width={20}
                height={20}
              />
            )}
          </div>
          <p className="text-sm">Level: {roomInfo?.host?.phase ?? "Loading..."}</p>
        </SecondaryCard>

        {/* Joinee */}
        <SecondaryCard className="text-black h-full flex flex-col justify-center items-start p-4 gap-2">
          <p className={`text-md ${isYou(roomInfo?.joinee?.userId) ? "font-bold" : ""}`}>
            {roomInfo?.joinee?.name ?? "Joinee awaited..."}
            {isYou(roomInfo?.joinee?.userId) ? " (You)" : ""}
          </p>
          <p className="text-sm">Level: {roomInfo?.joinee?.phase ?? "awaiting..."}</p>
        </SecondaryCard>
      </div>
    </aside>
  );
}
