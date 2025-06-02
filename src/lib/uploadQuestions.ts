// src/scripts/uploadQuestions.ts

import { firestore } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import questions from "./questions.json";

// Define the structure for type safety (optional)
interface Question {
  question: string;
  options: string[];
}

async function uploadCategoryQuestions() {
  try {
    const categoryName = "friends"; // 👈 category name for Firestore doc ID
    const questionsArray: Question[] = questions;

    const data = {
      category: categoryName,
      questions: questionsArray,
    };

    // Upload under "categories" collection with document ID "couples"
    await setDoc(doc(firestore, "categories", categoryName), data);

    console.log(`✅ Uploaded ${questionsArray.length} questions under "${categoryName}" category`);
  } catch (error) {
    console.error("❌ Error uploading questions:", error);
  }
}

export default uploadCategoryQuestions
