import type { Card } from "./Card.js";

declare global {
  interface Navigator {
    /**
     * Exclusive to iOS, iPadOS, and macOS devices.
    */
    readonly standalone: boolean;
  }

  interface Screen {
    readonly availLeft: number;
    readonly availTop: number;
  }

  var Prism: typeof import("prismjs");

  var theme_color: HTMLMetaElement;
  var scrollbar_styles: HTMLStyleElement;
  var theme_styles: HTMLStyleElement;

  var symbol_definitions: SVGSVGElement;
  var arrow_icon: SVGSymbolElement;
  var check_icon: SVGSymbolElement;
  var back_icon: SVGSymbolElement;
  var minimize_icon: SVGSymbolElement;
  var close_icon: SVGSymbolElement;
  var rename_icon: SVGSymbolElement;
  var undo_icon: SVGSymbolElement;
  var redo_icon: SVGSymbolElement;
  var install_icon: SVGSymbolElement;
  var refresh_icon: SVGSymbolElement;
  var github_icon: SVGSymbolElement;
}

export {};