/*
  Some fields (e.g. Receivers with Keys, subField Keys) tend to have a lot of bytes.
  This value sets a limit to the bytes displayed when the field is not expanded.
*/
export const bytesCutoff: number = 25;

/*
  mapping of the categories to a css color variable
  as of their latest definition in the structures/dxb.json
  from the datex-specifications
*/
export const CATEGORIES = ['purple', 'red', 'yellow', 'green', 'blue', 'dark_blue'];
export function getColor(s: string | undefined): string {
  if (!s) return 'var(--chart-1)';

  const index = CATEGORIES.indexOf(s);
  return index !== -1 ? `var(--chart-${index + 1})` : 'var(--chart-1)';
}
