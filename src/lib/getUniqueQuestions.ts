import { ref, get, set } from "firebase/database";
import { db } from "@/lib/firebase";

interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string;
}

const getUniqueQuestions = async (
  hostId: string,
  totalNumber: number
): Promise<Question[]> => {
  const allQuestionsRes = await fetch("/questions.json");
  const allQuestions: Question[] = await allQuestionsRes.json();

  const usedRef = ref(db, `usedQuestions/${hostId}`);
  const usedSnapshot = await get(usedRef);
  const usedIds: string[] = usedSnapshot.exists() ? usedSnapshot.val() : [];

  const unusedQuestions = allQuestions.filter(q => !usedIds.includes(q.id));

  if (unusedQuestions.length < totalNumber) {
    console.warn("Not enough unique questions left. Recycling pool.");
    await set(usedRef, []); // Reset used list
    return getUniqueQuestions(hostId, totalNumber); // Retry with fresh pool
  }

  const selectedQuestions: Question[] = [];

  while (selectedQuestions.length < totalNumber) {
    const randomIndex = Math.floor(Math.random() * unusedQuestions.length);
    const selected = unusedQuestions.splice(randomIndex, 1)[0];
    selectedQuestions.push(selected);
  }

  const newUsedIds = [...usedIds, ...selectedQuestions.map(q => q.id)];
  await set(usedRef, newUsedIds);

  return selectedQuestions;
};

export default getUniqueQuestions;
