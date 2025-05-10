"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ref, onValue, update } from "firebase/database";
import { db } from "@/lib/firebase";
import QuestionViewer from "@/app/components/question_finder";

export default function EvaluationPage() {
  const { roomId } = useParams();
  const router = useRouter();

  const [questions, setQuestions] = useState([
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

  const [otherPlayerAnswers, setOtherPlayerAnswers] = useState<string[]>([]);
  const [currentAnswers, setCurrentAnswers] = useState<string[]>(["", "", ""]);
  const [score, setScore] = useState<number | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [joineePhase, setJoineePhase] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const roomData = snapshot.val();

      if (roomData) {
        const storedId = localStorage.getItem("playerId");
        const hostId = roomData.host.userId;
        const youAreHost = hostId === storedId;
        setIsHost(youAreHost);

        const answersToFetch = youAreHost ? roomData.joinee.answers : roomData.host.answers;
        setOtherPlayerAnswers(answersToFetch || []);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    const joineePhaseRef = ref(db, `rooms/${roomId}/joinee/phase`);
    const unsubscribe = onValue(joineePhaseRef, (snapshot) => {
      const phase = snapshot.val();
      setJoineePhase(phase);
    });

    return () => unsubscribe();
  }, [roomId]);

  const handleSubmit = () => {
    let calculatedScore = 0;

    for (let i = 0; i < questions.length; i++) {
      const correctAnswer = (otherPlayerAnswers[i] || "").trim().toLowerCase();
      const userAnswer = (currentAnswers[i] || "").trim().toLowerCase();

      if (correctAnswer === userAnswer) {
        calculatedScore++;
      }
    }

    localStorage.setItem("latestScore", calculatedScore.toString());
    localStorage.setItem("totalQuestions", questions.length.toString());

    setScore(calculatedScore);
    const roomIdString = Array.isArray(roomId) ? roomId[0] : roomId;

    // Update phase to 'score' in Firebase
    const updates: any = {
      [`rooms/${roomIdString}/${isHost ? "host" : "joinee"}/phase`]: "score",
    };

    update(ref(db), updates)
      .then(
        () => {
          router.push(`/game/${roomId}/score/`)
        }
      )
      .catch((error) => {
        console.error("Failed to update phase:", error);
      });
  };


  const handlePlayAgain = () => {
    if (!roomId || !isHost) return;

    const roomIdString = Array.isArray(roomId) ? roomId[0] : roomId;

    // Reset both host and joinee data
    const updates: any = {
      [`rooms/${roomIdString}/host/phase`]: "lobby",
      [`rooms/${roomIdString}/joinee/phase`]: "lobby",
      [`rooms/${roomIdString}/host/answers`]: [],
      [`rooms/${roomIdString}/joinee/answers`]: [],
    };

    update(ref(db), updates)
      .then(() => {
        router.push(`/game/${roomIdString}/lobby/`);
      })
      .catch((error) => {
        console.error("Failed to reset game:", error);
      });
  };


  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-6">Evaluation</h1>

      <div className="w-full max-w-md">
        <QuestionViewer
          questions={questions}
          answers={currentAnswers}
          setAnswers={setCurrentAnswers}
          hasSubmitted={false}
          onComplete={handleSubmit}
        />
      </div>
    </div>
  );
}
