import { GEMINI_API_KEY } from '../config/gemini.config';
import { Journal } from '../types/journal.types';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function getJournalInsights(journal: Journal): Promise<string> {
  const prompt = `You are a compassionate mental health assistant. A user has shared the following journal entry with you. Please provide warm, thoughtful insights about their emotional state, patterns you notice, and gentle suggestions for their wellbeing. Keep your response concise and supportive — around 1-3 short paragraphs.

Journal Title: ${journal.title}
Date: ${new Date(journal.createdAt).toLocaleDateString()}

Journal Entry:
${journal.body}`;

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No insights available.';
}
