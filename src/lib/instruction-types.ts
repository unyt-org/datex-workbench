import instructionTypes from './instructionTypes.json';

export const typeColors: Record<string, string> = {
    STRUCTURE: 'chart-2',
    OPERATION: 'chart-3',
    VALUE: 'chart-5',
    SHARED: 'chart-4',
    DEFAULT: 'chart-1',
};

export function getInstructionColor(name: string, light = false): string {
    const type = (instructionTypes as Record<string, string>)[name];
    const colorName = (type && type in typeColors) ? type : 'DEFAULT';
    return `var(--${typeColors[colorName]}${light ? '-light' : ''})`;
}
