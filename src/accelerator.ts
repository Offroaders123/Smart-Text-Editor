export const SuperKey = ["Super", "Cmd", "Ctrl"] as const;
export type SuperKey = typeof SuperKey[number];

export const ShiftKey = "Shift";
export type ShiftKey = typeof ShiftKey;

export const AltKey = "Alt";
export type AltKey = typeof AltKey;

export const AlphabeticKey = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"] as const;
export type AlphabeticKey = typeof AlphabeticKey[number];

export const NumericKey = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;
export type NumericKey = typeof NumericKey[number];

export const FigureKey: FigureKey[] = [...AlphabeticKey, ...NumericKey];
export type FigureKey = AlphabeticKey | NumericKey;

export const SuperFigureKey = FigureKey.map(figure => SuperKey.map(Super => `${Super}+${figure}` as const)).flat(1).sort();
export type SuperFigureKey = typeof SuperFigureKey[number];

export const AltFigureKey = FigureKey.map(figure => `${AltKey}+${figure}` as const).sort();
export type AltFigureKey = typeof AltFigureKey[number];

export const SuperShiftKey = FigureKey.map(figure => SuperKey.map(Super => `${Super}+${ShiftKey}+${figure}` as const)).flat(1).sort();
export type SuperShiftKey = typeof SuperShiftKey[number];

export const AltShiftKey = FigureKey.map(figure => `${AltKey}+${ShiftKey}+${figure}` as const).sort();
export type AltShiftKey = typeof AltShiftKey[number];

export const SuperAltFigureKey = FigureKey.map(figure => SuperKey.map(Super => `${Super}+${AltKey}+${figure}` as const)).flat(1).sort();
export type SuperAltFigureKey = typeof SuperAltFigureKey[number];

export const SuperAltShiftFigureKey = FigureKey.map(figure => SuperKey.map(Super => `${Super}+${AltKey}+${ShiftKey}+${figure}` as const)).flat(1).sort();
export type SuperAltShiftFigureKey = typeof SuperAltShiftFigureKey[number];

export const Accelerator: Accelerator[] = [...SuperFigureKey, ...AltFigureKey, ...SuperShiftKey, ...AltShiftKey, ...SuperAltFigureKey, ...SuperAltShiftFigureKey].sort();
export type Accelerator = SuperFigureKey | AltFigureKey | SuperShiftKey | AltShiftKey | SuperAltFigureKey | SuperAltShiftFigureKey;
