import { settings } from "./settings.js";
import Prism from "./prism.js";

export interface SafeAreaInsets {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * A namespace with properties that query the app's appearance.
*/
export const appearance = {
  /**
   * Checks whether the app window is the top-most window.
  */
  get parentWindow(): boolean {
    return (window.self == window.top);
  },

  /**
   * Checks whether the app window is in the standalone display mode.
  */
  get standalone(): boolean {
    return (window.matchMedia("(display-mode: standalone)").matches || navigator.standalone || !window.menubar.visible);
  },

  /**
   * Checks whether the app is running in standalone mode on an iOS, iPadOS, or macOS device.
  */
  get appleHomeScreen(): boolean {
    return (/(macOS|Mac|iPhone|iPad|iPod)/i.test(navigator.userAgentData?.platform ?? navigator.platform) && navigator.standalone === true);
  },

  /**
   * Checks if the app takes up the entire real estate of the current window.
  */
  get hiddenChrome(): boolean {
    return (window.outerWidth == window.innerWidth && window.outerHeight == window.innerHeight);
  },

  /**
   * Checks whether the app is running in standalone mode with Window Controls Overlay enabled.
  */
  get windowControlsOverlay(): boolean {
    return navigator.windowControlsOverlay?.visible ?? false;
  },

  /**
   * Checks whether the app is in fullscreen.
  */
  get fullscreen(): boolean {
    return (window.matchMedia("(display-mode: fullscreen)").matches || (!window.screenY && !window.screenTop && appearance.hiddenChrome) || (!window.screenY && !window.screenTop && appearance.standalone));
  },

  /**
   * Gets the inset values for the screen Safe Area.
  */
  get safeAreaInsets(): SafeAreaInsets {
    function getSafeAreaInset(section: string): number {
      return parseInt(getComputedStyle(document.documentElement).getPropertyValue(`--safe-area-inset-${section}`),10);
    }
    return {
      left: getSafeAreaInset("left"),
      right: getSafeAreaInset("right"),
      top: getSafeAreaInset("top"),
      bottom: getSafeAreaInset("bottom"),
    };
  },

  /**
   * Enables or disables syntax highlighting for all Num Text elements.
  */
  setSyntaxHighlighting(state: boolean): void {
    for (const editor of document.querySelectorAll<NumTextElement>(".Editor, num-text")){
      if (!(editor.syntaxLanguage in Prism.languages)) continue;
      (state) ? editor.syntaxHighlight.enable() : editor.syntaxHighlight.disable();
    }
    settings.syntaxHighlighting = state;
  }
}
