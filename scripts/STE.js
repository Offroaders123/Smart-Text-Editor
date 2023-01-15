class STE {
  static appearance = {
    get parentWindow() {
      return (window.self == window.top);
    },

    get standalone() {
      return (window.matchMedia("(display-mode: standalone)").matches || navigator.standalone || !window.menubar.visible);
    },

    get appleHomeScreen() {
      // @ts-expect-error
      return (/(macOS|Mac|iPhone|iPad|iPod)/i.test(("userAgentData" in navigator) ? navigator.userAgentData.platform : navigator.platform) && "standalone" in navigator && navigator.standalone);
    },

    get hiddenChrome() {
      return (window.outerWidth == window.innerWidth && window.outerHeight == window.innerHeight);
    },

    get windowControlsOverlay() {
      return ((("windowControlsOverlay" in navigator) ? navigator.windowControlsOverlay.visible : false) && STE.appearance.standalone);
    },

    refreshWindowControlsOverlay() {
      var visibility = STE.appearance.windowControlsOverlay, styling = document.documentElement.classList.contains("window-controls-overlay");
      if (visibility != styling) (visibility) ? document.documentElement.classList.add("window-controls-overlay") : document.documentElement.classList.remove("window-controls-overlay");
    },

    get fullscreen() {
      return (window.matchMedia("(display-mode: fullscreen)").matches || (!window.screenY && !window.screenTop && STE.appearance.hiddenChrome) || (!window.screenY && !window.screenTop && STE.appearance.standalone));
    },

    get safeAreaInsets() {
      return {
        left: this._getSafeAreaInset("left"),
        right: this._getSafeAreaInset("right"),
        top: this._getSafeAreaInset("top"),
        bottom: this._getSafeAreaInset("bottom"),
      };
    },

    get titleBarAreaInsets() {
      return {
        top: this._getTitlebarAreaInset("top"),
        width_left: this._getTitlebarAreaInset("width-left"),
        width_right: this._getTitlebarAreaInset("width-right"),
        height: this._getTitlebarAreaInset("height"),
      };
    },

    get devicePixelRatio() {
      return window.devicePixelRatio.toFixed(2);
    },

    refreshDevicePixelRatio() {
      var ratio = STE.appearance.devicePixelRatio, styling = this._getRootStyleProperty("--device-pixel-ratio");
      if (ratio != styling) document.documentElement.style.setProperty("--device-pixel-ratio",ratio);
    },

    /**
     * @param { string } section
    */
    _getSafeAreaInset(section){
      return parseInt(this._getRootStyleProperty(`--safe-area-inset-${section}`),10);
    },

    /**
     * @param { string } section
    */
    _getTitlebarAreaInset(section){
      var value = this._getRootStyleProperty(`--titlebar-area-inset-${section}`);
      if (value.includes("calc")) value = Function(`"use strict"; return (${value.replace(/calc/g,"").replace(/100vw/g,`${window.innerWidth}px`).replace(/px/g,"")})`)();
      return parseInt(value,10);
    },

    /**
     * @param { string } template
    */
    _getRootStyleProperty(template){
      return window.getComputedStyle(document.documentElement).getPropertyValue(template);
    }
  }

  static environment = {
    get fileProtocol() {
      return (window.location.protocol == "file:");
    },

    get touchDevice() {
      return ("ontouchstart" in window);
    },

    get appleDevice() {
      // @ts-expect-error
      return (/(macOS|Mac|iPhone|iPad|iPod)/i.test(("userAgentData" in navigator) ? navigator.userAgentData.platform : navigator.platform));
    },

    get macOSDevice() {
      // @ts-expect-error
      return (/(macOS|Mac)/i.test(("userAgentData" in navigator) ? navigator.userAgentData.platform : navigator.platform) && navigator.standalone == undefined);
    },

    get mozillaBrowser() {
      return (CSS.supports("-moz-appearance: none"));
    }
  }

  static support = {
    get localStorage() {
      return (window.location.protocol != "blob:") ? window.localStorage : null;
    },

    get fileSystem() {
      return ("showOpenFilePicker" in window);
    },

    get fileHandling() {
      return ("launchQueue" in window && "LaunchParams" in window);
    },

    get windowControlsOverlay() {
      return ("windowControlsOverlay" in navigator);
    },

    get editingCommands() {
      return (!STE.environment.mozillaBrowser);
    },

    get webSharing() {
      return ("share" in navigator);
    }
  }

  /**
   * @param { string | null } identifier
  */
  static query(identifier = STE.activeEditor) {
    const tab = /** @type { HTMLButtonElement } */ (workspace_tabs.querySelector(`.tab[data-editor-identifier="${identifier}"]`));
    const container = /** @type { NumTextElement } */ (workspace_editors.querySelector(`.editor[data-editor-identifier="${identifier}"]`));
    const textarea = (container) ? container.editor : null;

    /**
     * @param { "base" | "extension" } [section]
    */
    function getName(section){
      if ((document.querySelectorAll(`[data-editor-identifier="${identifier}"]:not([data-editor-change])`).length == 0) && (identifier != STE.activeEditor)) return null;
      /** @type { string | string[] } */
      let name = /** @type { HTMLSpanElement } */ (workspace_tabs.querySelector(`.tab[data-editor-identifier="${identifier}"] [data-editor-name]`)).innerText;
      if (!section || (!name.includes(".") && section == "base")) return name;
      if (section == "base"){
        name = name.split(".");
        name.pop();
        return name.join(".");
      }
      if (section == "extension"){
        if (!name.includes(".")) return "";
        return /** @type { string } */ (name.split(".").pop());
      }
      // I don't think this is used, I had to add this to streamline the type to remove 'undefined'
      return name;
    }

    return { tab, container, textarea, getName };
  }

  static get view() {
    return document.body.getAttribute("data-view") ?? "code";
  }

  static get viewChange() {
    return (document.body.hasAttribute("data-view-change"));
  }

  static get orientation() {
    return document.body.getAttribute("data-orientation") ?? "horizontal";
  }

  static get orientationChange() {
    return (document.body.hasAttribute("data-orientation-change"));
  }

  static get scalingChange() {
    return (document.body.hasAttribute("data-scaling-change"));
  }

  static get unsavedWork() {
    return (!STE.appearance.parentWindow || (workspace_tabs.querySelectorAll(".tab:not([data-editor-change])[data-editor-unsaved]").length == 0));
  }

  static preapprovedExtensions = ["txt","html","css","js","php","json","webmanifest","bbmodel","xml","yaml","yml","dist","config","ini","md","markdown","mcmeta","lang","properties","uidx","material","h","fragment","vertex","fxh","hlsl","ihlsl","svg"];
  
  /**
   * @type { string | null }
  */
  static activeEditor = null;
  
  static previewEditor = "active-editor";
  
  /**
   * @type { { [identifier: string]: FileSystemFileHandle } }
  */
  static fileHandles = {};
  
  /**
   * @type { Window[] }
  */
  static childWindows = [];

  static settings = {
    entries: JSON.parse(window.localStorage.getItem("settings") ?? "null") || {},

    /**
     * @param { string } key
     * @param { string } value
    */
    set(key,value) {
      if (!STE.support.localStorage) return;
      STE.settings.entries[key] = value;
      window.localStorage.setItem("settings",JSON.stringify(STE.settings.entries,null,"  "));
      return value;
    },

    /**
     * @param { string } key
    */
    remove(key) {
      if (!STE.support.localStorage) return;
      delete STE.settings.entries[key];
      window.localStorage.setItem("settings",JSON.stringify(STE.settings.entries,null,"  "));
      return true;
    },

    /**
     * @param { string } key
    */
    has(key) {
      return (key in STE.settings.entries);
    },

    /**
     * @param { string } key
    */
    get(key) {
      if (!STE.support.localStorage) return;
      if (!STE.settings.has(key)) return;
      return STE.settings.entries[key];
    },

    reset({ confirm: showPrompt = false } = {}) {
      if (!STE.support.localStorage) return false;
      if (showPrompt){
        if (!confirm("Are you sure you would like to reset all settings?")) return false;
      }
      default_orientation_setting.select("horizontal");
      setSyntaxHighlighting(false);
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
   * @type { STECardElement | null }
  */
  static activeDialog = null;
  
  /**
   * @type { STECardElement | null }
  */
  static dialogPrevious = null;
  
  /**
   * @type { STECardElement | null }
  */
  static activeWidget = null;
  
  static pickerColor = null;
  
  /**
   * @type { BeforeInstallPromptEvent | null }
  */
  static installPrompt = null;
}

if (STE.appearance.parentWindow) document.documentElement.classList.add("startup-fade");
if (STE.appearance.appleHomeScreen) document.documentElement.classList.add("apple-home-screen");
if (STE.environment.touchDevice) document.documentElement.classList.add("touch-device");
if (STE.environment.appleDevice) document.documentElement.classList.add("apple-device");
if (STE.environment.macOSDevice) document.documentElement.classList.add("macOS-device");
if (STE.support.webSharing) document.documentElement.classList.add("web-sharing");

STE.appearance.refreshWindowControlsOverlay();
STE.appearance.refreshDevicePixelRatio();