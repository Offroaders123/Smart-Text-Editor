import { Accelerator, AltKey, FigureKey, ShiftKey, SuperKey } from "./accelerator.ts";

export const appleDevice: boolean = /(macOS|Mac|iPhone|iPad|iPod)/i.test(navigator.userAgentData?.platform ?? navigator.platform);

export function toAccelerator(event: KeyboardEvent): Accelerator {
  const { metaKey, ctrlKey, shiftKey, altKey } = event;
  const key: string = event.key.toUpperCase();
  const superKey: boolean = appleDevice ? metaKey : ctrlKey;
  const figureKey: FigureKey = key as FigureKey;
  const modifiers: [boolean, string][] = [
    [superKey, SuperKey[0]],
    [altKey, AltKey],
    [shiftKey, ShiftKey]
  ];

  const parts: string[] = modifiers
    .filter(([flag]) => flag)
    .map(([_, label]) => label)
    .concat(figureKey);

  const maybeAccelerator: string = parts.join("+");
  const accelerator: Accelerator = maybeAccelerator as Accelerator;

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
