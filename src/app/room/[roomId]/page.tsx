// app/room/[roomId]/page.tsx

"use client";

import { useParams, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { ref, update, onValue } from "firebase/database";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function GamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const player = searchParams.get("player");
  const name = searchParams.get("name");
  const roomId = params.roomId as string;

  const [isGameStarted, setIsGameStarted] = useState(false);
  const [player1Finished, setPlayer1Finished] = useState(false);
  const [player2Finished, setPlayer2Finished] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [questions] = useState([
    "What is your favorite color?", 
    "What is your favorite movie?", 
    "Where did you meet your partner?",
  ]);

  const finishAnswering = async () => {
    if (!answer) return;

    const updates: any = {};
    if (player === "1") {
      updates[`player1Answers/question${questionIndex}`] = answer;
      updates["player1Finished"] = true;
      setPlayer1Finished(true);
    } else {
      updates[`player2Answers/question${questionIndex}`] = answer;
      updates["player2Finished"] = true;
      setPlayer2Finished(true);
    }

    await update(ref(db, `rooms/${roomId}`), updates);
    setAnswer("");

    if (questionIndex + 1 < questions.length) {
      setQuestionIndex(questionIndex + 1);
    }
  };

  const nextQuestion = async () => {
    if (!answer) return;

    const updates: any = {};
    if (player === "1") {
      updates[`player1Answers/question${questionIndex}`] = answer;
    } else {
      updates[`player2Answers/question${questionIndex}`] = answer;
    }

    await update(ref(db, `rooms/${roomId}`), updates);
    setAnswer("");
    setQuestionIndex(questionIndex + 1);
  };

  useEffect(() => {
    const roomRef = ref(db, `rooms/${roomId}`);
    onValue(roomRef, (snapshot) => {
      const data = snapshot.val();

      setPlayer1Finished(data.player1Finished);
      setPlayer2Finished(data.player2Finished);

      if (data.player1Connected && data.player2Connected && !isGameStarted) {
        setIsGameStarted(true);
      }

      if (data.player1Finished && data.player2Finished) {
        router.push(`/room/${roomId}/score`);
      }
    });
  }, [roomId, isGameStarted, router]);

  if (!isGameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
        <h2 className="text-2xl font-semibold">Waiting for your partner...</h2>
        <div className="mt-4">
          <p className="text-lg">Player 1: {player1Finished ? "Finished" : "Not Finished"}</p>
          <p className="text-lg">Player 2: {player2Finished ? "Finished" : "Not Finished"}</p>
        </div>
      </div>
    );
  }

  if (!player1Finished || !player2Finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
        <h1 className="text-2xl font-semibold">{player === "1" ? "Player 1" : "Player 2"}'s Turn</h1>
        <h2 className="text-xl mt-4">{questions[questionIndex]}</h2>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Your answer..."
          className="mt-4 w-full max-w-md p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="mt-6 flex space-x-4">
          <button
            onClick={nextQuestion}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
          >
            Next
          </button>
          <button
            onClick={finishAnswering}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
          >
            Finish Answering
          </button>
        </div>
      </div>
    );
  }

  return null;
}
