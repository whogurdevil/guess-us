"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { onValue, ref, update } from "firebase/database";
import { db } from "@/lib/firebase";
import QuestionViewer from "@/app/components/question_finder";

export default function GamePage() {
  const { roomId } = useParams();
  const router = useRouter();

  // Start with empty questions, will fetch from DB
  const [questions, setQuestions] = useState<
    { question: string; options: string[] }[]
  >([]);

  // answers array should match questions length
  const [answers, setAnswers] = useState<string[]>([]);
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
          // Set host status
          const isHostPlayer = roomData.host?.userId === storedId;
          setIsHost(isHostPlayer);

          // Set questions fetched from DB
          if (Array.isArray(roomData.questions)) {
            setQuestions(roomData.questions);

            // Initialize answers array once questions are fetched
            setAnswers(Array(roomData.questions.length).fill("0"));
          }

          // Check if answers already submitted
          const playerPath = isHostPlayer ? "host" : "joinee";
          const playerData = roomData[playerPath];

          if (
            Array.isArray(playerData?.answers) &&
            playerData.answers.length === (roomData.questions?.length || 0)
          ) {
            setHasSubmitted(true);
          }
        }
      });
    }
  }, [roomId, router]);

  const handleSubmitAnswers = async () => {
    const storedId = localStorage.getItem("playerId");

    if (!storedId || !roomId) {
      router.push("/");
      return;
    }

    const roomIdString = Array.isArray(roomId) ? roomId[0] : roomId;
    const playerPath = isHost ? "host" : "joinee";

    const updates: any = {};
    updates[`rooms/${roomIdString}/${playerPath}/answers`] = answers;
    updates[`rooms/${roomIdString}/${playerPath}/phase`] = "waiting";

    await update(ref(db), updates);

    setHasSubmitted(true);
    router.push(`/game/${roomIdString}/waiting/`);
  };

  // Render only if questions are loaded
  if (questions.length === 0) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-500">
        Loading questions...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center bg-transparent p-6">
      <div className="w-full max-w-md shadow-lg">
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
