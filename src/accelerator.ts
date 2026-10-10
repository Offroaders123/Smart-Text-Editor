export const CmdKey = "Cmd";
export type CmdKey = typeof CmdKey;

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

export const CmdFigureKey = FigureKey.map(figure => `${CmdKey}+${figure}` as const).sort();
export type CmdFigureKey = typeof CmdFigureKey[number];

export const CtrlFigureKey = FigureKey.map(figure => `${CtrlKey}+${figure}` as const).sort();
export type CtrlFigureKey = typeof CtrlFigureKey[number];

export const ShiftFigureKey = FigureKey.map(figure => `${ShiftKey}+${figure}` as const).sort();
export type ShiftFigureKey = typeof ShiftFigureKey[number];

export const AltFigureKey = FigureKey.map(figure => `${AltKey}+${figure}` as const).sort();
export type AltFigureKey = typeof AltFigureKey[number];

export const CmdShiftKey = FigureKey.map(figure => `${CmdKey}+${ShiftKey}+${figure}` as const).sort();
export type CmdShiftKey = typeof CmdShiftKey[number];

export const CtrlShiftKey = FigureKey.map(figure => `${CtrlKey}+${ShiftKey}+${figure}` as const).sort();
export type CtrlShiftKey = typeof CtrlShiftKey[number];

export const AltShiftKey = FigureKey.map(figure => `${AltKey}+${ShiftKey}+${figure}` as const).sort();
export type AltShiftKey = typeof AltShiftKey[number];

export const CmdAltFigureKey = FigureKey.map(figure => `${CmdKey}+${AltKey}+${figure}` as const).sort();
export type CmdAltFigureKey = typeof CmdAltFigureKey[number];

export const CtrlAltFigureKey = FigureKey.map(figure => `${CtrlKey}+${AltKey}+${figure}` as const).sort();
export type CtrlAltFigureKey = typeof CtrlAltFigureKey[number];

export const CmdAltShiftFigureKey = FigureKey.map(figure => `${CmdKey}+${AltKey}+${ShiftKey}+${figure}` as const).sort();
export type CmdAltShiftFigureKey = typeof CmdAltShiftFigureKey[number];

export const CtrlAltShiftFigureKey = FigureKey.map(figure => `${CtrlKey}+${AltKey}+${ShiftKey}+${figure}` as const).sort();
export type CtrlAltShiftFigureKey = typeof CtrlAltShiftFigureKey[number];

export const CmdCtrlAltShiftFigureKey = FigureKey.map(figure => `${CmdKey}+${CtrlKey}+${AltKey}+${ShiftKey}+${figure}` as const).sort();
export type CmdCtrlAltShiftFigureKey = typeof CmdCtrlAltShiftFigureKey[number];

export const Accelerator: Accelerator[] = [...CmdFigureKey, ...CtrlFigureKey, ...ShiftFigureKey, ...AltFigureKey, ...CmdShiftKey, ...CtrlShiftKey, ...AltShiftKey, ...CmdAltFigureKey, ...CtrlAltFigureKey, ...CmdAltShiftFigureKey, ...CtrlAltShiftFigureKey, ...CmdCtrlAltShiftFigureKey].sort();
export type Accelerator = CmdFigureKey | CtrlFigureKey | ShiftFigureKey | AltFigureKey | CmdShiftKey | CtrlShiftKey | AltShiftKey | CmdAltFigureKey | CtrlAltFigureKey | CmdAltShiftFigureKey | CtrlAltShiftFigureKey | CmdCtrlAltShiftFigureKey;
