"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { onValue, ref, update } from "firebase/database";
import { db } from "@/lib/firebase";
import QuestionViewer from "@/app/components/question_finder";

export default function GamePage() {
  const { roomId } = useParams();
  const router = useRouter();

  const [questions] = useState([
    {
      question: "What is the capital of France?",
      options: ["Paris", "London", "Rome", "Berlin"],
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Earth", "Mars", "Venus", "Jupiter"],
    },
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
    },
  ]);

  const [answers, setAnswers] = useState<string[]>(
    Array(questions.length).fill("0")
  );

  const [isHost, setIsHost] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem("playerName");
    const storedId = localStorage.getItem("playerId");

    if (!storedName || !storedId) {
      router.push("/");
      return;
    }

    if (roomId) {
      const roomIdString = Array.isArray(roomId) ? roomId[0] : roomId;
      const roomRef = ref(db, `rooms/${roomIdString}`);

      onValue(roomRef, (snapshot) => {
        const roomData = snapshot.val();
        if (roomData) {
          const isHostPlayer = roomData.host?.userId === storedId;
          setIsHost(isHostPlayer);

          const playerPath = isHostPlayer ? "host" : "joinee";
          const playerData = roomData[playerPath];

          if (
            Array.isArray(playerData?.answers) &&
            playerData.answers.length === questions.length
          ) {
            setHasSubmitted(true);
          }
        }
      });
    }
  }, [roomId, router, questions.length]);

  const handleSubmitAnswers = async () => {
    const storedId = localStorage.getItem("playerId");

    if (!storedId || !roomId) {
      router.push("/");
      return;
    }

    alert("test")

    const roomIdString = Array.isArray(roomId) ? roomId[0] : roomId;
    const playerPath = isHost ? "host" : "joinee";

    const updates: any = {};
    updates[`rooms/${roomIdString}/${playerPath}/answers`] = answers;
    updates[`rooms/${roomIdString}/${playerPath}/phase`] = "waiting";

    // await update(ref(db), updates);

    // setHasSubmitted(true);
    // router.push(`/game/${roomIdString}/waiting/`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-transparent p-6">
      <h1 className="text-4xl font-bold mb-6 text-white">Game - Room {roomId}</h1>

      <div className="w-full max-w-md bg-black rounded-xl p-6 shadow-lg">
        <QuestionViewer
          questions={questions}
          answers={answers}
          setAnswers={setAnswers}
          hasSubmitted={hasSubmitted}
          onComplete={handleSubmitAnswers}
        />
      </div>
    </div>
  );
}
