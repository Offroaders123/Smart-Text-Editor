class Editor {
  static appearance = {
    get parent_window() {
      return (window.self == window.top);
    },

    get standalone() {
      return (window.matchMedia("(display-mode: standalone)").matches || navigator.standalone || !window.menubar.visible);
    },

    get apple_home_screen() {
      // @ts-expect-error
      return (/(macOS|Mac|iPhone|iPad|iPod)/i.test(("userAgentData" in navigator) ? navigator.userAgentData.platform : navigator.platform) && "standalone" in navigator && navigator.standalone);
    },

    get hidden_chrome() {
      return (window.outerWidth == window.innerWidth && window.outerHeight == window.innerHeight);
    },

    get window_controls_overlay() {
      return ((("windowControlsOverlay" in navigator) ? navigator.windowControlsOverlay.visible : false) && Editor.appearance.standalone);
    },

    refresh_window_controls_overlay() {
      var visibility = Editor.appearance.window_controls_overlay, styling = document.documentElement.classList.contains("window-controls-overlay");
      if (visibility != styling) (visibility) ? document.documentElement.classList.add("window-controls-overlay") : document.documentElement.classList.remove("window-controls-overlay");
    },

    get fullscreen() {
      return (window.matchMedia("(display-mode: fullscreen)").matches || (!window.screenY && !window.screenTop && Editor.appearance.hidden_chrome) || (!window.screenY && !window.screenTop && Editor.appearance.standalone));
    },

    get safe_area_insets() {
      return {
        left: this._getSafeAreaInset("left"),
        right: this._getSafeAreaInset("right"),
        top: this._getSafeAreaInset("top"),
        bottom: this._getSafeAreaInset("bottom"),
      };
    },

    get titlebar_area_insets() {
      return {
        top: this._getTitlebarAreaInset("top"),
        width_left: this._getTitlebarAreaInset("width-left"),
        width_right: this._getTitlebarAreaInset("width-right"),
        height: this._getTitlebarAreaInset("height"),
      };
    },

    get device_pixel_ratio() {
      return window.devicePixelRatio.toFixed(2);
    },

    refresh_device_pixel_ratio() {
      var ratio = Editor.appearance.device_pixel_ratio, styling = this._getRootStyleProperty("--device-pixel-ratio");
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
    get file_protocol() {
      return (window.location.protocol == "file:");
    },

    get touch_device() {
      return ("ontouchstart" in window);
    },

    get apple_device() {
      // @ts-expect-error
      return (/(macOS|Mac|iPhone|iPad|iPod)/i.test(("userAgentData" in navigator) ? navigator.userAgentData.platform : navigator.platform));
    },

    get macOS_device() {
      // @ts-expect-error
      return (/(macOS|Mac)/i.test(("userAgentData" in navigator) ? navigator.userAgentData.platform : navigator.platform) && navigator.standalone == undefined);
    },

    get mozilla_browser() {
      return (CSS.supports("-moz-appearance: none"));
    }
  }

  static support = {
    get local_storage() {
      return (window.location.protocol != "blob:") ? window.localStorage : null;
    },

    get file_system() {
      return ("showOpenFilePicker" in window);
    },

    get file_handling() {
      return ("launchQueue" in window && "LaunchParams" in window);
    },

    get window_controls_overlay() {
      return ("windowControlsOverlay" in navigator);
    },

    get editing_commands() {
      return (!Editor.environment.mozilla_browser);
    },

    get web_sharing() {
      return ("share" in navigator);
    }
  }

  /**
   * @param { string | null } identifier
  */
  static query(identifier = Editor.active_editor) {
    const tab = /** @type { HTMLButtonElement } */ (workspace_tabs.querySelector(`.tab[data-editor-identifier="${identifier}"]`));
    const container = /** @type { NumTextElement } */ (workspace_editors.querySelector(`.editor[data-editor-identifier="${identifier}"]`));
    const textarea = (container) ? container.editor : null;

    /**
     * @param { "base" | "extension" } [section]
    */
    function getName(section){
      if ((document.querySelectorAll(`[data-editor-identifier="${identifier}"]:not([data-editor-change])`).length == 0) && (identifier != Editor.active_editor)) return null;
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

  static get view_change() {
    return (document.body.hasAttribute("data-view-change"));
  }

  static get orientation() {
    return document.body.getAttribute("data-orientation") ?? "horizontal";
  }

  static get orientation_change() {
    return (document.body.hasAttribute("data-orientation-change"));
  }

  static get scaling_change() {
    return (document.body.hasAttribute("data-scaling-change"));
  }

  static get unsaved_work() {
    return (!Editor.appearance.parent_window || (workspace_tabs.querySelectorAll(".tab:not([data-editor-change])[data-editor-unsaved]").length == 0));
  }

  static preapproved_extensions = ["txt","html","css","js","php","json","webmanifest","bbmodel","xml","yaml","yml","dist","config","ini","md","markdown","mcmeta","lang","properties","uidx","material","h","fragment","vertex","fxh","hlsl","ihlsl","svg"];
  /**
   * @type { string | null }
  */
  static active_editor = null;
  static preview_editor = "active-editor";
  /**
   * @type { { [identifier: string]: FileSystemFileHandle } }
  */
  static file_handles = {};
  /**
   * @type { Window[] }
  */
  static child_windows = [];

  static settings = {
    entries: JSON.parse(window.localStorage.getItem("settings") ?? "") || {},

    /**
     * @param { string } key
     * @param { string } value
    */
    set(key,value) {
      if (!Editor.support.local_storage) return;
      Editor.settings.entries[key] = value;
      window.localStorage.setItem("settings",JSON.stringify(Editor.settings.entries,null,"  "));
      return value;
    },

    /**
     * @param { string } key
    */
    remove(key) {
      if (!Editor.support.local_storage) return;
      delete Editor.settings.entries[key];
      window.localStorage.setItem("settings",JSON.stringify(Editor.settings.entries,null,"  "));
      return true;
    },

    /**
     * @param { string } key
    */
    has(key) {
      return (key in Editor.settings.entries);
    },

    /**
     * @param { string } key
    */
    get(key) {
      if (!Editor.support.local_storage) return;
      if (!Editor.settings.has(key)) return;
      return Editor.settings.entries[key];
    },

    reset({ confirm: showPrompt = false } = {}) {
      if (!Editor.support.local_storage) return false;
      if (showPrompt){
        if (!confirm("Are you sure you would like to reset all settings?")) return false;
      }
      default_orientation_setting.select("horizontal");
      setSyntaxHighlighting(false);
      syntax_highlighting_setting.checked = false;
      automatic_refresh_setting.checked = true;
      preview_base_input.reset();
      Editor.settings.entries = {};
      window.localStorage.removeItem("settings");
      if (showPrompt) reset_settings_card.open();
      return true;
    }
  }

  /**
   * @type { STECardElement | null }
  */
  static active_dialog = null;
  /**
   * @type { STECardElement | null }
  */
  static dialog_previous = null;
  /**
   * @type { STECardElement | null }
  */
  static active_widget = null;
  static picker_color = null;
  /**
   * @type { BeforeInstallPromptEvent | null }
  */
  static install_prompt = null;
}

if (Editor.appearance.parent_window) document.documentElement.classList.add("startup-fade");
if (Editor.appearance.apple_home_screen) document.documentElement.classList.add("apple-home-screen");
if (Editor.environment.touch_device) document.documentElement.classList.add("touch-device");
if (Editor.environment.apple_device) document.documentElement.classList.add("apple-device");
if (Editor.environment.macOS_device) document.documentElement.classList.add("macOS-device");
if (Editor.support.web_sharing) document.documentElement.classList.add("web-sharing");

Editor.appearance.refresh_window_controls_overlay();
Editor.appearance.refresh_device_pixel_ratio();