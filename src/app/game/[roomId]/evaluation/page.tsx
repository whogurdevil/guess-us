"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";

export default function EvaluationPage() {
  const { roomId } = useParams();
  const router = useRouter();

  const [questions, setQuestions] = useState(["Question 1", "Question 2", "Question 3"]);
  const [otherPlayerAnswers, setOtherPlayerAnswers] = useState<string[]>([]);
  const [currentAnswers, setCurrentAnswers] = useState<string[]>(["", "", ""]);
  const [score, setScore] = useState<number | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);

  useEffect(() => {
    const storedId = localStorage.getItem("playerId");

    if (!storedId) {
      router.push("/");
      return;
    }

    const roomRef = ref(db, `rooms/${roomId}`);
    onValue(roomRef, (snapshot) => {
      const roomData = snapshot.val();

      if (roomData) {
        const hostId = roomData.host.userId;
        const joineeId = roomData.joinee.userId;

        const youAreHost = hostId === storedId;
        setIsHost(youAreHost);

        if (youAreHost) {
          setOtherPlayerAnswers(roomData.joinee.answers || []);
        } else {
          setOtherPlayerAnswers(roomData.host.answers || []);
        }
      }
    });
  }, [roomId, router]);

  const handleSubmit = () => {
    let calculatedScore = 0;

    for (let i = 0; i < questions.length; i++) {
      const correctAnswer = (otherPlayerAnswers[i] || "").trim().toLowerCase();
      const userAnswer = (currentAnswers[i] || "").trim().toLowerCase();

      if (correctAnswer === userAnswer) {
        calculatedScore++;
      }
    }

    setScore(calculatedScore);
  };

  if (score !== null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-100 p-6">
        <h1 className="text-4xl font-bold mb-4">Evaluation Complete!</h1>
        <p className="text-2xl mb-2">Your Score: {score} / {questions.length}</p>
        <button
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
          onClick={() => router.push("/")} // Or you can redirect elsewhere
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-4">Evaluation</h1>

      <div className="w-full max-w-md mb-4">
        {questions.map((question, index) => (
          <div key={index} className="mb-4">
            <p className="mb-2">{question}</p>
            <input
              type="text"
              value={currentAnswers[index]}
              onChange={(e) => {
                const newAnswers = [...currentAnswers];
                newAnswers[index] = e.target.value;
                setCurrentAnswers(newAnswers);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
      >
        Submit Answers
      </button>
    </div>
  );
}
