export const MetaKey = "Meta";
export type MetaKey = typeof MetaKey;

export const CtrlKey = "Ctrl";
export type CtrlKey = typeof CtrlKey;

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

export const MetaFigureKey = FigureKey.map(figure => `${MetaKey}+${figure}` as const).sort();
export type MetaFigureKey = typeof MetaFigureKey[number];

export const CtrlFigureKey = FigureKey.map(figure => `${CtrlKey}+${figure}` as const).sort();
export type CtrlFigureKey = typeof CtrlFigureKey[number];

export const AltFigureKey = FigureKey.map(figure => `${AltKey}+${figure}` as const).sort();
export type AltFigureKey = typeof AltFigureKey[number];

export const MetaShiftKey = FigureKey.map(figure => `${MetaKey}+${ShiftKey}+${figure}` as const).sort();
export type MetaShiftKey = typeof MetaShiftKey[number];

export const CtrlShiftKey = FigureKey.map(figure => `${CtrlKey}+${ShiftKey}+${figure}` as const).sort();
export type CtrlShiftKey = typeof CtrlShiftKey[number];

export const AltShiftKey = FigureKey.map(figure => `${AltKey}+${ShiftKey}+${figure}` as const).sort();
export type AltShiftKey = typeof AltShiftKey[number];

export const MetaAltFigureKey = FigureKey.map(figure => `${MetaKey}+${AltKey}+${figure}` as const).sort();
export type MetaAltFigureKey = typeof MetaAltFigureKey[number];

export const CtrlAltFigureKey = FigureKey.map(figure => `${CtrlKey}+${AltKey}+${figure}` as const).sort();
export type CtrlAltFigureKey = typeof CtrlAltFigureKey[number];

export const MetaAltShiftFigureKey = FigureKey.map(figure => `${MetaKey}+${AltKey}+${ShiftKey}+${figure}` as const).sort();
export type MetaAltShiftFigureKey = typeof MetaAltShiftFigureKey[number];

export const CtrlAltShiftFigureKey = FigureKey.map(figure => `${CtrlKey}+${AltKey}+${ShiftKey}+${figure}` as const).sort();
export type CtrlAltShiftFigureKey = typeof CtrlAltShiftFigureKey[number];

export const MetaCtrlAltShiftFigureKey = FigureKey.map(figure => `${MetaKey}+${CtrlKey}+${AltKey}+${ShiftKey}+${figure}` as const).sort();
export type MetaCtrlAltShiftFigureKey = typeof MetaCtrlAltShiftFigureKey[number];

export const Accelerator: Accelerator[] = [...MetaFigureKey, ...CtrlFigureKey, ...AltFigureKey, ...MetaShiftKey, ...CtrlShiftKey, ...AltShiftKey, ...MetaAltFigureKey, ...CtrlAltFigureKey, ...MetaAltShiftFigureKey, ...CtrlAltShiftFigureKey, ...MetaCtrlAltShiftFigureKey].sort();
export type Accelerator = MetaFigureKey | CtrlFigureKey | AltFigureKey | MetaShiftKey | CtrlShiftKey | AltShiftKey | MetaAltFigureKey | CtrlAltFigureKey | MetaAltShiftFigureKey | CtrlAltShiftFigureKey | MetaCtrlAltShiftFigureKey;
