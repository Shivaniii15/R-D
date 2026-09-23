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

function formatJournalBlock(journal: Journal): string {
  return `Date: ${new Date(journal.createdAt).toLocaleString()}
Title: ${journal.title}

${journal.body}`;
}

function buildJournalSection(journals: Journal[]): string {
  const sorted = [...journals].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  if (sorted.length === 1) {
    return formatJournalBlock(sorted[0]);
  }

  const labels = sorted.length === 2
    ? ['Earliest', 'Latest']
    : ['Earliest', 'Middle', 'Latest'];

  return sorted
    .map((journal, i) => `--- ${labels[i]} ---\n${formatJournalBlock(journal)}`)
    .join('\n\n');
}

function buildPrompt(journals: Journal[], type: InsightType): string {
  const count = journals.length;
  const entryWord = count === 1 ? 'journal entry' : `${count} journal entries`;
  const journalSection = buildJournalSection(journals);

  switch (type) {
    case 'general':
      return `You are a compassionate mental health assistant. A user has shared the following ${entryWord} with you${count > 1 ? ', ordered from earliest to latest' : ''}. Please provide warm, thoughtful insights about their emotional state${count > 1 ? ', how their mood or thoughts may have evolved across the entries,' : ''} and gentle suggestions for their wellbeing. Keep your response concise and supportive — around 3-4 short paragraphs.

${journalSection}`;

    case 'patterns':
      return `You are a compassionate mental health assistant specialising in identifying emotional patterns and triggers. Analyse the following ${entryWord}${count > 1 ? ', ordered from earliest to latest,' : ''} and:
1. Identify any recurring emotional patterns or themes across the ${entryWord}
2. Point out possible triggers for the emotions described
3. Gently highlight any thought patterns (e.g. all-or-nothing thinking, catastrophising) if present
${count > 1 ? '4. Note any shifts or changes in mood/thinking between entries\n5.' : '4.'} Offer a brief, supportive suggestion for working with these patterns

Keep your tone warm and non-judgmental. Around 3-4 short paragraphs.

${journalSection}`;

    case 'gratitude':
      return `You are a compassionate mental health assistant focused on gratitude and positive reframing. Based on the following ${entryWord}${count > 1 ? ', ordered from earliest to latest,' : ''}:
1. Find and highlight any positives or silver linings across the ${entryWord}, even small ones
2. Gently reframe any negative thoughts into more balanced perspectives
3. Suggest 2-3 things the user might feel grateful for based on their entries
${count > 1 ? '4. Acknowledge any positive progress or shifts between entries\n5.' : '4.'} End with an encouraging, uplifting message

Keep your tone warm, hopeful and genuine — not dismissive of their struggles. Around 3-4 short paragraphs.

${journalSection}`;
  }
}

export async function getJournalInsights(journals: Journal | Journal[], type: InsightType = 'general'): Promise<string> {
  const journalArray = Array.isArray(journals) ? journals : [journals];
  const prompt = buildPrompt(journalArray, type);

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