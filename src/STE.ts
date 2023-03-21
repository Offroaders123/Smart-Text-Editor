type Card = import("./Card.js").default;
type View = import("./Workspace.js").View;
type Orientation = import("./Workspace.js").Orientation;

/**
 * A global object with static properties that help with managing the state within Smart Text Editor.
*/
class STE {
  /**
   * A namespace with properties that query the app's appearance.
  */
  static appearance = {
    /**
     * Checks whether the app window is the top-most window.
    */
    get parentWindow() {
      return (window.self == window.top);
    },

    /**
     * Checks whether the app window is in the standalone display mode.
    */
    get standalone() {
      return (window.matchMedia("(display-mode: standalone)").matches || navigator.standalone || !window.menubar.visible);
    },

    /**
     * Checks whether the app is running in standalone mode on iOS and iPadOS devices.
    */
    get appleHomeScreen() {
      // @ts-expect-error
      return (/(macOS|Mac|iPhone|iPad|iPod)/i.test(("userAgentData" in navigator) ? navigator.userAgentData.platform : navigator.platform) && "standalone" in navigator && navigator.standalone);
    },

    /**
     * Checks if the app takes up the entire real estate of the current window.
    */
    get hiddenChrome() {
      return (window.outerWidth == window.innerWidth && window.outerHeight == window.innerHeight);
    },

    /**
     * Checks whether the app is running in standalone mode with Window Controls Overlay enabled.
    */
    get windowControlsOverlay() {
      return navigator.windowControlsOverlay?.visible ?? false;
    },

    /**
     * Checks whether the app is in fullscreen.
    */
    get fullscreen() {
      return (window.matchMedia("(display-mode: fullscreen)").matches || (!window.screenY && !window.screenTop && STE.appearance.hiddenChrome) || (!window.screenY && !window.screenTop && STE.appearance.standalone));
    },

    /**
     * Gets the inset values for the screen Safe Area.
    */
    get safeAreaInsets() {
      function getSafeAreaInset(section: string){
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
    setSyntaxHighlighting(state: boolean){
      state = (state != undefined) ? state : (STE.settings.get("syntax-highlighting") != undefined);
      document.querySelectorAll("num-text").forEach(editor => {
        if (editor.syntaxLanguage in Prism.languages) (state) ? editor.syntaxHighlight.enable() : editor.syntaxHighlight.disable();
      });
      STE.settings.set("syntax-highlighting",String(state));
    }
  }

  /**
   * A namespace of properties that query the app's environment.
  */
  static environment = {
    /**
     * Checks whether the app is running over the File Prototcol.
    */
    get fileProtocol() {
      return (window.location.protocol == "file:");
    },

    /**
     * Checks if the app is running on a touch-supported device.
    */
    get touchDevice() {
      return ("ontouchstart" in window);
    },

    /**
     * Checks if the app is running on an Apple device.
    */
    get appleDevice() {
      // @ts-expect-error
      return (/(macOS|Mac|iPhone|iPad|iPod)/i.test(("userAgentData" in navigator) ? navigator.userAgentData.platform : navigator.platform));
    },

    /**
     * Checks if the app is running on a macOS device.
    */
    get macOSDevice() {
      // @ts-expect-error
      return (/(macOS|Mac)/i.test(("userAgentData" in navigator) ? navigator.userAgentData.platform : navigator.platform) && navigator.standalone == undefined);
    },

    /**
     * Checks if the app is running in a Firefox-based browser.
    */
    get mozillaBrowser() {
      return (CSS.supports("-moz-appearance: none"));
    }
  }

  /**
   * A namespace of properties that query the support of features in the app's current environment.
  */
  static support = {
    /**
     * Queries if Local Storage can be used on the current URL Protocol.
    */
    get localStorage() {
      return (window.location.protocol != "blob:") ? window.localStorage : null;
    },

    /**
     * Queries if the File System Access API is supported.
    */
    get fileSystem() {
      return ("showOpenFilePicker" in window);
    },

    /**
     * Queries if the File Handling API is supported.
    */
    get fileHandling() {
      return ("launchQueue" in window && "LaunchParams" in window);
    },

    /**
     * Queries if the Window Controls Overlay API is supported.
    */
    get windowControlsOverlay() {
      return ("windowControlsOverlay" in navigator);
    },

    /**
     * Queries if `document.execCommand()` calls are supported in `<textarea>` and `<input>` elements.
    */
    get editingCommands() {
      return (!STE.environment.mozillaBrowser);
    },

    /**
     * Queries if the Web Share API is supported.
    */
    get webSharing() {
      return ("share" in navigator);
    }
  }

  /**
   * Selects an Editor by it's identifier.
   * 
   * @param identifier - Defaults to the currently opened Editor.
  */
  static query(identifier: string | null = STE.activeEditor) {
    const tab = workspace_tabs.querySelector<HTMLButtonElement>(`.tab[data-editor-identifier="${identifier}"]`);
    const container = workspace_editors.querySelector<NumTextElement>(`.editor[data-editor-identifier="${identifier}"]`);
    const textarea = (container) ? container.editor : null;

    /**
     * Get the file name of the selected Editor.
     * 
     * @param section - The `"base"` flag provides the name before the extension, and the `"extension"` flag provides only the extension. If omitted, the full file name is returned.
    */
    function getName(section?: "base" | "extension"){
      if ((document.querySelectorAll(`[data-editor-identifier="${identifier}"]:not([data-editor-change])`).length === 0) && (identifier !== STE.activeEditor)) return null;
      let name: string | string[] = workspace_tabs.querySelector<HTMLSpanElement>(`.tab[data-editor-identifier="${identifier}"] [data-editor-name]`)!.innerText;
      if (!section || (!name.includes(".") && section === "base")) return name;
      if (section === "base"){
        name = name.split(".");
        name.pop();
        return name.join(".");
      }
      if (section === "extension"){
        if (!name.includes(".")) return "";
        return name.split(".").pop()!;
      }
      // I don't think this is used, I had to add this to streamline the type to remove 'undefined'
      return name;
    }

    return { tab, container, textarea, getName };
  }

  /**
   * Gets the current View layout.
  */
  static get view() {
    return document.body.getAttribute("data-view") as View | null ?? "code";
  }

  /**
   * Gets the state of whether the app is currently changing View layouts.
   * 
   * This has to do with the View layout transition.
  */
  static get viewChange() {
    return document.body.hasAttribute("data-view-change");
  }

  /**
   * Gets the current Orientation layout.
  */
  static get orientation() {
    return document.body.getAttribute("data-orientation") as Orientation | null ?? "horizontal";
  }

  /**
   * Gets the state of whether the app is currently changing Orientation layouts.
   * 
   * This has to do with the Orientation layout transition.
  */
  static get orientationChange() {
    return document.body.hasAttribute("data-orientation-change");
  }

  /**
   * Gets the state of whether the Workspace is being resized with the Scaler handle.
  */
  static get scalingChange() {
    return document.body.hasAttribute("data-scaling-change");
  }

  /**
   * Checks if any Editors haven't been saved since their last edits.
  */
  static get unsavedWork() {
    return (!STE.appearance.parentWindow || (workspace_tabs.querySelectorAll(".tab:not([data-editor-change])[data-editor-unsaved]").length == 0));
  }

  /**
   * A list of known extensions that can be opened with Smart Text Editor.
  */
  static preapprovedExtensions = ["txt","html","css","js","php","json","webmanifest","bbmodel","xml","yaml","yml","dist","config","ini","md","markdown","mcmeta","lang","properties","uidx","material","h","fragment","vertex","fxh","hlsl","ihlsl","svg"] as const;

  /**
   * The identifier of the currently opened Editor.
  */
  static activeEditor: string | null = null;

  /**
   * The identifier of the Editor to be used within the Preview.
   * 
   * The value can also be `"active-editor"`. If it is set to that, then references to `STE.previewEditor` will be pointed to `STE.activeEditor`.
  */
  static previewEditor = "active-editor";

  /**
   * An object that pairs an Editor identifier with it's `FileSystemFileHandle`, if it was opened from the file system directly.
  */
  static fileHandles: { [identifier: string]: FileSystemFileHandle; } = {};

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
    /**
     * A session-mirror of the app settings present in Local Storage.
    */
    entries: (JSON.parse(window.localStorage.getItem("settings") ?? "null") || {}) as { [setting: string]: string | undefined; },

    /**
     * Sets the given key and value to the app settings.
    */
    set(key: string, value: string) {
      if (!STE.support.localStorage) return;
      STE.settings.entries[key] = value;
      window.localStorage.setItem("settings",JSON.stringify(STE.settings.entries,null,"  "));
      return value;
    },

    /**
     * Removes the given key from the app settings.
    */
    remove(key: string) {
      if (!STE.support.localStorage) return;
      delete STE.settings.entries[key];
      window.localStorage.setItem("settings",JSON.stringify(STE.settings.entries,null,"  "));
      return true;
    },

    /**
     * Queries if a given key is present in the app settings.
    */
    has(key: string) {
      return (key in STE.settings.entries);
    },

    /**
     * Gets the value of a given key from the app settings.
    */
    get(key: string) {
      if (!STE.support.localStorage) return;
      if (!STE.settings.has(key)) return;
      return STE.settings.entries[key];
    },

    /**
     * Removes all key-value pairs from the app's settings.
     * 
     * @param options - Accepts an option to show the user a prompt to confirm that the settings should be reset.
    */
    reset({ confirm: showPrompt = false }: { confirm?: boolean; } = {}) {
      if (!STE.support.localStorage) return false;
      if (showPrompt){
        if (!confirm("Are you sure you would like to reset all settings?")) return false;
      }
      default_orientation_setting.select("horizontal");
      STE.appearance.setSyntaxHighlighting(false);
      syntax_highlighting_setting.checked = false;
      automatic_refresh_setting.checked = true;
      preview_base_input.reset();
      STE.settings.entries = {};
      window.localStorage.removeItem("settings");
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

if (STE.appearance.parentWindow) document.documentElement.classList.add("startup-fade");
if (STE.appearance.appleHomeScreen) document.documentElement.classList.add("apple-home-screen");
if (STE.environment.touchDevice) document.documentElement.classList.add("touch-device");
if (STE.environment.appleDevice) document.documentElement.classList.add("apple-device");
if (STE.environment.macOSDevice) document.documentElement.classList.add("macOS-device");
if (STE.support.webSharing) document.documentElement.classList.add("web-sharing");