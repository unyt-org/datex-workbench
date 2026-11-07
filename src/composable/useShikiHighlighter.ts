import { createHighlighter, type Highlighter } from 'shiki';
import datexGrammar from '../datex.tmLanguage.json';

let highlighter: Highlighter | undefined;

export async function useShikiHighlighter(): Promise<Highlighter> {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: [datexGrammar as never],
    });
  }

  return highlighter;
}
