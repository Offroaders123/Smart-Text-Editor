import { Accelerator, AltKey, CmdKey, CtrlKey, FigureKey, ShiftKey } from "./accelerator.ts";

export const appleDevice: boolean = /(macOS|Mac|iPhone|iPad|iPod)/i.test(navigator.userAgentData?.platform ?? navigator.platform);

export function toAccelerator(event: KeyboardEvent): Accelerator {
  const { metaKey, ctrlKey, shiftKey, altKey } = event;
  const key: string = event.key.toUpperCase();
  const figureKey: FigureKey = key as FigureKey;
  const modifiers: [boolean, string][] = [
    [metaKey && appleDevice, CmdKey],
    [ctrlKey, CtrlKey],
    [altKey, AltKey],
    [shiftKey, ShiftKey]
  ];

  const parts: string[] = modifiers
    .filter(([flag]) => flag)
    .map(([_, label]) => label)
    .concat(figureKey);

  const accelerator: Accelerator = parts.join("+") as Accelerator;

  return accelerator;
}

declare global {
  interface Navigator {
    /** Not supported everywhere yet */
    readonly userAgentData?: NavigatorUserAgentData;
  }

  interface NavigatorUserAgentData {
    readonly platform: string;
  }
}
