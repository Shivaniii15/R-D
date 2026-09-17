import { GEMINI_API_KEY } from '../config/gemini.config';
import { Journal } from '../types/journal.types';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

export type InsightType = 'general' | 'patterns' | 'gratitude';

export const INSIGHT_TYPES: { type: InsightType; label: string; description: string; emoji: string }[] = [
  {
    type: 'general',
    label: 'General Insights',
    description: 'Emotional state & wellbeing advice',
    emoji: '💭',
  },
  {
    type: 'patterns',
    label: 'Patterns & Triggers',
    description: 'Identify recurring themes & triggers',
    emoji: '🔍',
  },
  {
    type: 'gratitude',
    label: 'Gratitude & Reframing',
    description: 'Find positives & reframe your thoughts',
    emoji: '🌱',
  },
];

function buildPrompt(journal: Journal, type: InsightType): string {
  const base = `Journal Title: ${journal.title}
Date: ${new Date(journal.createdAt).toLocaleDateString()}

Journal Entry:
${journal.body}`;

  switch (type) {
    case 'general':
      return `You are a compassionate mental health assistant. A user has shared the following journal entry with you. Please provide warm, thoughtful insights about their emotional state, patterns you notice, and gentle suggestions for their wellbeing. Keep your response concise and supportive — around 3-4 short paragraphs.

${base}`;

    case 'patterns':
      return `You are a compassionate mental health assistant specialising in identifying emotional patterns and triggers. Analyse the following journal entry and:
1. Identify any recurring emotional patterns or themes you notice
2. Point out possible triggers for the emotions described
3. Gently highlight any thought patterns (e.g. all-or-nothing thinking, catastrophising) if present
4. Offer a brief, supportive suggestion for working with these patterns

Keep your tone warm and non-judgmental. Around 3-4 short paragraphs.

${base}`;

    case 'gratitude':
      return `You are a compassionate mental health assistant focused on gratitude and positive reframing. Based on the following journal entry:
1. Find and highlight any positives or silver linings in what the user has written, even small ones
2. Gently reframe any negative thoughts into more balanced perspectives
3. Suggest 2-3 things the user might feel grateful for based on their entry
4. End with an encouraging, uplifting message

Keep your tone warm, hopeful and genuine — not dismissive of their struggles. Around 3-4 short paragraphs.

${base}`;
  }
}

export async function getJournalInsights(journal: Journal, type: InsightType = 'general'): Promise<string> {
  const prompt = buildPrompt(journal, type);

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No insights available.';
}