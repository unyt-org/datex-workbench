import type { FieldDefinition, StructureDefinition } from '@unyt/speck';

export const dxbDefinition: StructureDefinition = await (
  await fetch(
    'https://raw.githubusercontent.com/unyt-org/datex-specification/refs/heads/main/assets/structures/dxb.json',
  )
).json();

/*
  mapping of the categories to a css color variable
  as of their imported definition in the structures/dxb.json from the datex-specifications

  latest categories were
  CATEGORIES = ['purple', 'red', 'yellow', 'green', 'blue', 'dark_blue'];
*/
const CATEGORIES = dxbDefinition.sections
  .map((section) => section.fields.map((field) => field.category))
  .flat()
  .filter((category, index, self) => self.indexOf(category) === index);

export function getColor(fieldDef: FieldDefinition | undefined): string {
  if (!fieldDef) return 'var(--chart-1)';

  const index = CATEGORIES.indexOf(fieldDef.category);
  return index !== -1 ? `var(--chart-${index + 1})` : 'var(--chart-1)';
}

/*
  Some fields (e.g. Receivers with Keys, subField Keys) tend to have a lot of bytes.
  This value sets a limit to the bytes displayed when the field is not expanded.

  value should be greater than 0, large values reduce compactness and readability
*/
export const bytesCutoff: number = 25;

/*
  in the BlockProtocolInfoView, Subfields are displayed as a table with the columns name value
  if showSubfieldID is set to true, the table also displays a column for the Subfield id
*/
export const showSubfieldId = false;
