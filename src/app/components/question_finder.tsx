"use client";

import { useEffect, useState } from "react";
import RandomColorButton from "./buttons/random_color_button";
import CircularProgress from "./loading/circular_progress";
import SecondaryCard from "./cards/secondary_card";

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
  const [timer, setTimer] = useState(15);

  const colorVariants = ["sunset", "ocean", "forest", "royal"];

  useEffect(() => {
    if (currentIndex >= questions.length) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          handleNext();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimer(15);
    } else {
      onComplete();
    }
  };

  const handleAnswer = (option: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = option;
    setAnswers(updatedAnswers);
    handleNext();
  };

  const currentQuestion = questions[currentIndex];

  return (
    <SecondaryCard className="p-8">
      {/* Timer Centered */}
      <div className="flex justify-center mb-6">
      <CircularProgress time={timer} size={70} />

      </div>

      {/* Question */}
      <p className="text-lg font-semibold text-center mb-6">
        {currentQuestion.question}
      </p>

      {/* Options */}
      <div className="grid gap-3">
        {currentQuestion.options.map((option, idx) => (
          <RandomColorButton
            key={idx}
            onClick={() => handleAnswer(option)}
            disabled={hasSubmitted}
            variant={colorVariants[idx % colorVariants.length]}
          >
            {option}
          </RandomColorButton>
        ))}
      </div>
    </SecondaryCard>
  );
}
