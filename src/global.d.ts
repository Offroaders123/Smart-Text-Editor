import type { Card } from "./Card.js";

declare global {
  interface Navigator {
    readonly standalone: boolean;
  }

  interface Screen {
    readonly availLeft: number;
    readonly availTop: number;
  }

  var Prism: typeof import("prismjs");
}

export {};