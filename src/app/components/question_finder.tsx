"use client";

import { useEffect, useState } from "react";

export default function QuestionViewer({
  questions,
  answers,
  setAnswers,
  hasSubmitted,
  onComplete,
}: {
  questions: { question: string; options: string[] }[];
  answers: string[];
  setAnswers: (answers: string[]) => void;
  hasSubmitted: boolean;
  onComplete: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState(10);

  useEffect(() => {
    if (currentIndex >= questions.length) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          handleNext(); // go to next if time's up
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimer(10);
    } else {
      onComplete();
    }
  };

  const handleAnswer = (option: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = option;
    setAnswers(updatedAnswers);
    handleNext(); // immediately go to next question
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div>
      <p className="text-white mb-2">Time left: {timer}s</p>
      <p className="text-lg mb-4 text-white font-semibold">
        {currentQuestion.question}
      </p>

      <div className="grid gap-3">
        {currentQuestion.options.map((option, idx) => (
          <button
            key={idx}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all disabled:opacity-50"
            onClick={() => handleAnswer(option)}
            disabled={hasSubmitted}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
