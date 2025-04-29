"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { onValue, ref, update } from "firebase/database";
import { db } from "@/lib/firebase";

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

  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
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

          // If the phase is not "questions", redirect
          

          // If player already answered, mark submitted
          if (Array.isArray(playerData?.answers) && playerData.answers.length === questions.length) {
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

    const roomIdString = Array.isArray(roomId) ? roomId[0] : roomId;
    const playerPath = isHost ? "host" : "joinee";

    const updates: any = {};
    updates[`rooms/${roomIdString}/${playerPath}/answers`] = answers;
    updates[`rooms/${roomIdString}/${playerPath}/phase`] = "waiting"; // Move phase to "waiting" after answering

    await update(ref(db), updates);

    setHasSubmitted(true);
    router.push(`/waiting/${roomIdString}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-6">Game - Room {roomId}</h1>

      <div className="w-full max-w-md">
        {questions.map((q, index) => (
          <div key={index} className="mb-6">
            <p className="text-lg mb-3">{q.question}</p>
            {q.options.map((option, optIdx) => (
              <label key={optIdx} className="block mb-2">
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={option}
                  checked={answers[index] === option}
                  onChange={() => {
                    const newAnswers = [...answers];
                    newAnswers[index] = option;
                    setAnswers(newAnswers);
                  }}
                  disabled={hasSubmitted}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmitAnswers}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all mt-4"
        disabled={hasSubmitted}
      >
        {hasSubmitted ? "Submitted" : "Submit"}
      </button>
    </div>
  );
}
