/*
  Some fields (e.g. Receivers with Keys, subField Keys) tend to have a lot of bytes.
  This value sets a limit to the bytes displayed when the field is not expanded.

  value should be greater than 0, large values reduce compactness and readability
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

/*
  in the BlockProtocolInfoView, Subfields are displayed as a table with the columns name value
  if showSubfieldID is set to true, the table also displays a column for the Subfield id
*/
export const showSubfieldId = false;
