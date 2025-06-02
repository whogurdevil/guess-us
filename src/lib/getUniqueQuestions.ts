import { doc, getDoc } from "firebase/firestore";
import { firestore } from "./firebase"; // Import your Firestore instance

type Question = {
  question: string;
  options: string[];
};

function getRandomSubset<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export async function getRandomQuestions(category: string): Promise<Question[]> {
  try {
    const docRef = doc(firestore, "categories", category);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error(`No questions found for category: ${category}`);
    }

    const questions: Question[] = docSnap.data().questions;

    return getRandomSubset(questions, 10);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
}
