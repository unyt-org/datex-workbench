import { createHighlighter, type Highlighter, type ThemeRegistration } from 'shiki';
import datexGrammar from '../assets/datex.tmLanguage.json';
import datexDark from '../assets/datex-dark-color-theme.json';
import datexLight from '../assets/datex-light-color-theme.json';

let highlighter: Highlighter | undefined;

export async function useShikiHighlighter(): Promise<Highlighter> {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: [datexDark as ThemeRegistration, datexLight as ThemeRegistration],
      langs: [datexGrammar as never],
    });
  }

  return highlighter;
}
