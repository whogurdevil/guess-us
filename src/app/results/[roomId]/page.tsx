"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ref, onValue, set, update } from "firebase/database";
import { db } from "@/lib/firebase";

const questions = [
  { question: "What's your partner's favorite color?", id: "q1" },
  { question: "What's your partner's favorite movie?", id: "q2" },
  { question: "What's your partner's favorite food?", id: "q3" },
];

export default function GamePage() {
  const router = useRouter();
  const { roomId } = useParams<{ roomId: string }>();
  const [name, setName] = useState("");
  const [currentPhase, setCurrentPhase] = useState("phase1");
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [guesses, setGuesses] = useState<{ [key: string]: string }>({});
  const [score, setScore] = useState(0);
  const [bothPlayersFinished, setBothPlayersFinished] = useState(false);

  useEffect(() => {
    // Get player name from URL params
    const nameParam = new URLSearchParams(window.location.search).get("name");
    if (nameParam) setName(nameParam);
  }, []);

  useEffect(() => {
    // Listen for room data (answers and phase)
    const roomRef = ref(db, `rooms/${roomId}`);
    onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        router.push("/"); // Go back if no room exists
        return;
      }

      // Check if both players have finished Phase 1
      const player1Finished = data.answers?.player1;
      const player2Finished = data.answers?.player2;

      if (player1Finished && player2Finished && data.phase === "phase1") {
        setBothPlayersFinished(true); // Both players are ready for Phase 2
      }

      // If it's Phase 2, proceed with guesses
      if (data.phase === "phase2") {
        setCurrentPhase("phase2");
      }
    });
  }, [roomId, router]);

  const handleAnswerSubmit = () => {
    if (!name || Object.keys(answers).length === 0) return;

    // Save the answers to Firebase
    const roomRef = ref(db, `rooms/${roomId}`);
    const newAnswers = { ...answers };
    set(roomRef, { answers: { ...newAnswers, [name]: newAnswers } });

    // Change phase to phase2 when both players have submitted their answers
    update(roomRef, { phase: "phase2" });

    setCurrentPhase("phase2"); // Change phase locally
  };

  const handleGuessSubmit = () => {
    // Save the guesses to Firebase
    const roomRef = ref(db, `rooms/${roomId}`);
    const newGuesses = { ...guesses };
    set(roomRef, { guesses: { ...newGuesses, [name]: newGuesses } });

    // Calculate score by comparing guesses with answers
    let newScore = 0;
    for (const questionId of Object.keys(guesses)) {
      if (guesses[questionId] === answers[questionId]) {
        newScore += 1;
      }
    }

    setScore(newScore); // Set score based on correct guesses
    update(roomRef, { score: newScore });

    router.push(`/results/${roomId}?name=${name}&score=${newScore}`);
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>, questionId: string) => {
    setAnswers({ ...answers, [questionId]: e.target.value });
  };

  const handleGuessChange = (e: React.ChangeEvent<HTMLInputElement>, questionId: string) => {
    setGuesses({ ...guesses, [questionId]: e.target.value });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100 p-6">
      <h1 className="text-4xl font-bold mb-4">Game: Room {roomId}</h1>
      <h2 className="text-xl mb-6">Hello, {name}!</h2>

      {currentPhase === "phase1" ? (
        <div>
          <h2 className="text-2xl mb-4">Phase 1: Answer for Your Partner</h2>
          {questions.map((question) => (
            <div key={question.id} className="mb-4">
              <label className="text-lg">{question.question}</label>
              <input
                type="text"
                onChange={(e) => handleAnswerChange(e, question.id)}
                className="p-2 border border-gray-300 rounded-lg"
                placeholder="Your answer"
              />
            </div>
          ))}
          <button
            onClick={handleAnswerSubmit}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Submit Answers
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl mb-4">Phase 2: Guess Your Partner's Answers</h2>
          {questions.map((question) => (
            <div key={question.id} className="mb-4">
              <label className="text-lg">{question.question}</label>
              <input
                type="text"
                onChange={(e) => handleGuessChange(e, question.id)}
                className="p-2 border border-gray-300 rounded-lg"
                placeholder="Your guess"
              />
            </div>
          ))}
          <button
            onClick={handleGuessSubmit}
            className="mt-4 px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            Submit Guesses
          </button>
        </div>
      )}
    </div>
  );
}
