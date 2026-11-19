import topics from './concierge.json';

export function previewAnswer(text: string) {
  const words = text.toLowerCase();
  const matches = topics.map(topic => ({
    topic,
    score: topic.terms.split(',').reduce((score, term) => score + (term && words.includes(term) ? term.length : 0), 0),
  })).sort((a, b) => b.score - a.score);
  return matches[0].score ? matches[0].topic : topics[topics.length - 1];
}
