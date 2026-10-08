import { Accelerator, AltKey, FigureKey, ShiftKey, SuperKey } from "./accelerator.ts";

export const appleDevice: boolean = /(macOS|Mac|iPhone|iPad|iPod)/i.test(navigator.userAgentData?.platform ?? navigator.platform);

export function toAccelerator(event: KeyboardEvent): Accelerator {
  const { metaKey, ctrlKey, shiftKey, altKey } = event;
  const key: string = event.key.toUpperCase();
  const superKey: boolean = appleDevice ? metaKey : ctrlKey;
  const figureKey: FigureKey = FigureKey.includes(key as FigureKey) ? key as FigureKey : (() => {
    throw new TypeError(`Key '${key}' is not a valid figure key`);
  })();
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
  const accelerator: Accelerator = Accelerator.includes(maybeAccelerator as Accelerator) ? maybeAccelerator as Accelerator : (() => {
    throw new TypeError(`Accelerator '${maybeAccelerator}' is not a valid accelerator`);
  })();

  return accelerator;
}

export type ShortcutCallback = (event: KeyboardEvent) => void;

export class Shortcut implements Disposable {
  private readonly listener: ShortcutCallback = event => {
    const accelerator: Accelerator = toAccelerator(event);
    if (accelerator !== this.accelerator) return;
    this.callback(event);
  };

  constructor(
    private readonly accelerator: Accelerator,
    private readonly callback: ShortcutCallback
  ) {
    document.addEventListener("keydown", this.listener, { once: true });
  }

  [Symbol.dispose](): void {
    document.removeEventListener("keydown", this.listener);
  }
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
