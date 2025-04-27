"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; // Use useParams for dynamic routing
import { onValue, ref, update } from "firebase/database";
import { db } from "@/lib/firebase";

export default function GamePage() {
  const { roomId } = useParams();
  const [questions, setQuestions] = useState(["Question 1", "Question 2", "Question 3"]);
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  const [isHost, setIsHost] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);  // Track if the user has already submitted
  const router = useRouter();

  useEffect(() => {
    const storedId = localStorage.getItem("playerId"); // Get player ID from localStorage
    if (!storedId) {
      router.push("/"); // Redirect to homepage if no playerId found
      return;
    }

    // Fetch room data to check if the current user is the host
    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const roomData = snapshot.val();
      if (roomData) {
        setIsHost(roomData.host.userId === storedId);  // Set isHost based on storedId
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [roomId, router]);

  useEffect(() => {
    if (!isHost) return;  // Only fetch player data if the user is the host

    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const roomData = snapshot.val();
      if (roomData) {
        const playerData = isHost ? roomData.host : roomData.joinee;

        // Check if the player has already submitted answers
        if (playerData?.isCompleted) {
          setHasSubmitted(true);  // Set state if already submitted
        }
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [roomId, isHost]);

  // Handle submit answers and mark the user as completed
  const handleSubmitAnswers = async () => {
    const storedId = localStorage.getItem("playerId");
    if (storedId) {
      // Determine the player path based on whether the user is the host or joinee
      const playerPath = isHost ? "host" : "joinee"; // Set the correct path based on isHost

      const roomRef = ref(db, `rooms/${roomId}`);
      await update(roomRef, {
        [`${playerPath}/answers`]: answers,
        [`${playerPath}/isCompleted`]: true,  // Mark player as completed
      });

      setHasSubmitted(true); // Update the local state to reflect submission

      // Redirect to waiting page
      router.push(`/game/${roomId}/waiting`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-4">Game - Room {roomId}</h1>

      <div className="w-full max-w-md mb-4">
        {questions.map((question, index) => (
          <div key={index}>
            <p>{question}</p>
            <input
              type="text"
              value={answers[index]}
              onChange={(e) => {
                const newAnswers = [...answers];
                newAnswers[index] = e.target.value;
                setAnswers(newAnswers);
              }}
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
              disabled={hasSubmitted}  // Disable inputs if already submitted
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmitAnswers}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
        disabled={hasSubmitted}  // Disable the submit button if already submitted
      >
        {hasSubmitted ? "Submitted" : "Submit"}
      </button>
    </div>
  );
}
