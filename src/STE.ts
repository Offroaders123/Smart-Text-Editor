import type Card from "./Card.js";
import type Editor from "./Editor.js";
import type { View } from "./Workspace.js";
import type { Orientation } from "./Workspace.js";

export interface SafeAreaInsets {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface EditorQuery {
  tab: HTMLButtonElement | null;
  container: NumTextElement | null;
  textarea: HTMLTextAreaElement | null;
  getName(section?: "base" | "extension"): string | null;
}

interface ResetSettingsOptions {
  confirm?: boolean;
}

/**
 * A global object with static properties that help with managing the state within Smart Text Editor.
*/
export class STE {
  /**
   * A namespace with properties that query the app's appearance.
  */
  static appearance = {
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
      return (window.matchMedia("(display-mode: fullscreen)").matches || (!window.screenY && !window.screenTop && STE.appearance.hiddenChrome) || (!window.screenY && !window.screenTop && STE.appearance.standalone));
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
      for (const editor of document.querySelectorAll<Editor | NumTextElement>("ste-editor, num-text")){
        if (!(editor.syntaxLanguage in Prism.languages)) continue;
        (state) ? editor.syntaxHighlight.enable() : editor.syntaxHighlight.disable();
      }
      STE.settings.syntaxHighlighting = state;
    }
  }

  /**
   * A namespace of properties that query the app's environment.
  */
  static environment = {
    /**
     * Checks if the app is running on a touch-supported device.
    */
    get touchDevice(): boolean {
      return ("ontouchstart" in window);
    },

    /**
     * Checks if the app is running on an Apple device.
    */
    get appleDevice(): boolean {
      return (/(macOS|Mac|iPhone|iPad|iPod)/i.test(navigator.userAgentData?.platform ?? navigator.platform));
    },

    /**
     * Checks if the app is running on a macOS device.
    */
    get macOSDevice(): boolean {
      return (/(macOS|Mac)/i.test(navigator.userAgentData?.platform ?? navigator.platform) && navigator.maxTouchPoints < 1);
    },

    /**
     * Checks if the app is running in a Firefox-based browser.
    */
    get mozillaBrowser(): boolean {
      return (CSS.supports("-moz-appearance: none"));
    }
  }

  /**
   * A namespace of properties that query the support of features in the app's current environment.
  */
  static support = {
    /**
     * Queries if the File System Access API is supported.
    */
    get fileSystem(): boolean {
      return ("showOpenFilePicker" in window);
    },

    /**
     * Queries if the File Handling API is supported.
    */
    get fileHandling(): boolean {
      return ("launchQueue" in window && "LaunchParams" in window);
    },

    /**
     * Queries if the Window Controls Overlay API is supported.
    */
    get windowControlsOverlay(): boolean {
      return ("windowControlsOverlay" in navigator);
    },

    /**
     * Queries if `document.execCommand()` calls are supported in `<textarea>` and `<input>` elements.
    */
    get editingCommands(): boolean {
      return (!STE.environment.mozillaBrowser);
    },

    /**
     * Queries if the Web Share API is supported.
    */
    get webSharing(): boolean {
      return ("share" in navigator);
    }
  }

  /**
   * Gets the current View layout.
  */
  static get view(): View {
    return document.body.getAttribute("data-view") as View | null ?? "code";
  }

  /**
   * Gets the state of whether the app is currently changing View layouts.
   * 
   * This has to do with the View layout transition.
  */
  static get viewChange(): boolean {
    return document.body.hasAttribute("data-view-change");
  }

  /**
   * Gets the current Orientation layout.
  */
  static get orientation(): Orientation {
    return document.body.getAttribute("data-orientation") as Orientation | null ?? "horizontal";
  }

  /**
   * Gets the state of whether the app is currently changing Orientation layouts.
   * 
   * This has to do with the Orientation layout transition.
  */
  static get orientationChange(): boolean {
    return document.body.hasAttribute("data-orientation-change");
  }

  /**
   * Gets the state of whether the Workspace is being resized with the Scaler handle.
  */
  static get scalingChange(): boolean {
    return document.body.hasAttribute("data-scaling-change");
  }

  /**
   * Checks if any Editors haven't been saved since their last edits.
  */
  static get unsavedWork(): boolean {
    return (!STE.appearance.parentWindow || (workspace_tabs.querySelectorAll(".tab:not([data-editor-change])[data-editor-unsaved]").length == 0));
  }

  /**
   * A list of known extensions that can be opened with Smart Text Editor.
  */
  static preapprovedExtensions = ["txt","html","css","js","php","json","webmanifest","bbmodel","xml","yaml","yml","dist","config","ini","md","markdown","mcmeta","lang","properties","uidx","material","h","fragment","vertex","fxh","hlsl","ihlsl","svg"] as const;

  /**
   * A reference to the currently opened Editor.
  */
  static activeEditor: Editor | null = null;

  /**
   * The identifier of the Editor to be used within the Preview.
   * 
   * When set to `null`, internally the value of `STE.previewEditor` will be pointed to `STE.activeEditor` when used.
  */
  static previewEditor: Editor | null = null;

  /**
   * An array of all windows opened during the current session.
   * 
   * When the top Smart Text Editor window is closed, all child windows will automatically be closed also.
  */
  static childWindows: Window[] = [];

  /**
   * A namespace of functions to work with the app's settings.
  */
  static settings = {
    get defaultOrientation(): Orientation | null {
      return localStorage.getItem("defaultOrientation") as Orientation | null;
    },

    set defaultOrientation(value) {
      if (value === null){
        localStorage.removeItem("defaultOrientation");
        return;
      }
      localStorage.setItem("defaultOrientation",value);
    },

    get syntaxHighlighting(): boolean | null {
      const value = localStorage.getItem("syntaxHighlighting");
      if (value === null) return value;
      return JSON.parse(value) === true;
    },

    set syntaxHighlighting(value) {
      if (value === null){
        localStorage.removeItem("syntaxHighlighting");
        return;
      }
      localStorage.setItem("syntaxHighlighting",`${value}`);
    },

    get automaticRefresh(): boolean | null {
      const value = localStorage.getItem("automaticRefresh");
      if (value === null) return value;
      return JSON.parse(value) === true;
    },

    set automaticRefresh(value) {
      if (value === null){
        localStorage.removeItem("automaticRefresh");
        return;
      }
      localStorage.setItem("automaticRefresh",`${value}`);
    },

    get previewBase(): string | null {
      return localStorage.getItem("previewBase");
    },

    set previewBase(value) {
      if (value === null){
        localStorage.removeItem("previewBase");
        return;
      }
      localStorage.setItem("previewBase",value);
    },

    /**
     * Removes all key-value pairs from the app's settings.
     * 
     * @param options Accepts an option to show the user a prompt to confirm that the settings should be reset.
    */
    reset({ confirm: showPrompt = false }: ResetSettingsOptions = {}): boolean {
      if (showPrompt){
        if (!confirm("Are you sure you would like to reset all settings?")) return false;
      }

      this.defaultOrientation = null;
      default_orientation_setting.select("horizontal");
      STE.appearance.setSyntaxHighlighting(false);

      this.syntaxHighlighting = null;
      syntax_highlighting_setting.checked = false;

      this.automaticRefresh = null;
      automatic_refresh_setting.checked = true;

      this.previewBase = null;
      preview_base_input.reset();

      if (showPrompt) reset_settings_card.open();
      return true;
    }
  }

  /**
   * A reference to the currently opened Dialog.
  */
  static activeDialog: Card | null = null;
  
  /**
   * A reference to the previously opened Dialog, if the active one has a back button.
  */
  static dialogPrevious: Card | null = null;
  
  /**
   * A reference to the currently opened Widget.
  */
  static activeWidget: Card | null = null;
  
  /**
   * The color the Color Picker Widget is currently set to.
  */
  static pickerColor: string | null = null;
  
  /**
   * A reference to the `BeforeInstallPrompt` event that was received when the Install App banner is shown, on Chromium browsers.
  */
  static installPrompt: BeforeInstallPromptEvent | null = null;
}

declare global {
  interface Window {
    STE: typeof STE;
  }
}

window.STE = STE;

export default STE;

// if (STE.appearance.parentWindow) document.documentElement.classList.add("startup-fade");
if (STE.appearance.appleHomeScreen) document.documentElement.classList.add("apple-home-screen");
if (STE.environment.touchDevice) document.documentElement.classList.add("touch-device");
if (STE.environment.appleDevice) document.documentElement.classList.add("apple-device");
if (STE.environment.macOSDevice) document.documentElement.classList.add("macOS-device");
if (STE.support.webSharing) document.documentElement.classList.add("web-sharing");