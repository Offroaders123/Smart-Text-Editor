import { createEffect, createMemo } from "solid-js";
import { Header } from "./Header.js";
import { Main } from "./Main.js";
// import { appearance, setInstallPrompt, unsavedWork, childWindows, view, environment, activeDialog, activeEditor, activeWidget, support, settings } from "./app.js";
// import { closeCard, minimizeCard, openCard } from "./Card.js";
import { insertTemplate } from "./Tools.js";
import { close, createEditor, getNext, getPrevious, open, rename, setTabsVisibility } from "./Editor.js";
import { setView, setOrientation, createWindow, openFiles, saveFile, createDisplay, refreshPreview } from "./Workspace.js";

import type { Accessor, Setter, Signal } from "solid-js";

import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import Prism from "./prism.js";
// import { openCard } from "./Card.js";

import type { Editor } from "./Editor.js";
import type { View } from "./Workspace.js";
import type { Orientation } from "./Workspace.js";

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

/**
 * A namespace of properties that query the app's environment.
*/
export const environment = {
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
export const support = {
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
    return (!environment.mozillaBrowser);
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
export function view(): View {
  return document.body.getAttribute("data-view") as View | null ?? "code";
}

/**
 * Gets the state of whether the app is currently changing View layouts.
 * 
 * This has to do with the View layout transition.
*/
export function viewChange(): boolean {
  return document.body.hasAttribute("data-view-change");
}

/**
 * Gets the current Orientation layout.
*/
export function orientation(): Orientation {
  return document.body.getAttribute("data-orientation") as Orientation | null ?? "horizontal";
}

/**
 * Gets the state of whether the app is currently changing Orientation layouts.
 * 
 * This has to do with the Orientation layout transition.
*/
export function orientationChange(): boolean {
  return document.body.hasAttribute("data-orientation-change");
}

/**
 * Gets the state of whether the Workspace is being resized with the Scaler handle.
*/
export function scalingChange(): boolean {
  return document.body.hasAttribute("data-scaling-change");
}

/**
 * Checks if any Editors haven't been saved since their last edits.
*/
export function unsavedWork(): boolean {
  const workspace_tabs: HTMLDivElement = workspaceTabs()!;
  return (!appearance.parentWindow || (workspace_tabs.querySelectorAll(".tab:not([data-editor-change])[data-editor-unsaved]").length == 0));
}

/**
 * A list of known extensions that can be opened with Smart Text Editor.
*/
export const preapprovedExtensions = ["txt","html","css","js","php","json","webmanifest","bbmodel","xml","yaml","yml","dist","config","ini","md","markdown","mcmeta","lang","properties","uidx","material","h","fragment","vertex","fxh","hlsl","ihlsl","svg"] as const;

/**
 * The identifier of the currently opened Editor.
*/
export const [activeEditor, setActiveEditor] = createSignal<Editor | null>(null);

/**
 * The identifier of the Editor to be used within the Preview.
 * 
 * When set to `null`, internally the value of `previewEditor` will be pointed to `activeEditor` when used.
*/
export const [previewEditor, setPreviewEditor] = createSignal<Editor | null>(null);

/**
 * An array of all windows opened during the current session.
 * 
 * When the top Smart Text Editor window is closed, all child windows will automatically be closed also.
*/
export const childWindows: Window[] = [];

interface ResetSettingsOptions {
  confirm?: boolean;
}

/**
 * A namespace of functions to work with the app's settings.
*/
export const settings = {
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
    appearance.setSyntaxHighlighting(false);

    this.syntaxHighlighting = null;
    syntax_highlighting_setting.checked = false;

    this.automaticRefresh = null;
    automatic_refresh_setting.checked = true;

    this.previewBase = null;
    setPreviewBase(null);

    if (showPrompt) setActiveResetSettingsAlert(true);
    return true;
  }
}

export type CardID = DialogID | AlertID | WidgetID;

export type DialogID = "settings_card" | "theme_card" | "preview_base_card";

export type AlertID = "reset_settings_card" | "cleared_cache_card";

export type WidgetID = "replace_text_card" | "color_picker_card" | "json_formatter_card" | "uri_encoder_card" | "uuid_generator_card";

/**
 * The currently opened Dialog.
*/
export const [activeDialog, setActiveDialog] = createSignal<DialogID | null>(null);

export function toggleActiveDialog<T extends DialogID>(id: T): T | null {
  return setActiveDialog(() => activeDialog() !== id ? id : null);
}

/**
 * The previously-selected element before the current Dialog was opened.
*/
export const [dialogPrevious, setDialogPrevious] = createSignal<HTMLElement | null>(null);

/**
 * The currently opened Widget.
*/
export const [activeWidget, setActiveWidget] = createSignal<WidgetID | null>(null);

export function toggleActiveWidget<T extends WidgetID>(id: T): T | null {
  return setActiveWidget(() => activeWidget() !== id ? id : null);
}

/**
 * The currently minimized Widget.
*/
const [minimizeWidgetS, setMinimizeWidgetS] = createSignal<MinimizeHandler>([null, null]);

export { minimizeWidgetS as minimizeWidget, setMinimizeWidgetS as setMinimizeWidget };

export type MinimizeHandler = Signal<boolean> | [get: null, set: null];

export function setMinimizeHandler(handler: MinimizeHandler): void {
  setMinimizeWidgetS(handler);
  console.log("updating!", handler);
}

/**
 * (Shim?)
 * This should probably be data-driven with a single `Set<AlertID>` somehow.
 */
export const [activeResetSettingsAlert, setActiveResetSettingsAlert] = createSignal<boolean>(false);

/**
 * (Shim?)
 * This should probably be data-driven with a single `Set<AlertID>` somehow.
 */
export const [activeClearedCacheAlert, setActiveClearedCacheAlert] = createSignal<boolean>(false);

export const [previewBase, setPreviewBase] = createSignal<string | null>(settings.previewBase);

/**
 * The color the Color Picker Widget is currently set to.
*/
export const [pickerColor, setPickerColor] = createSignal<string | null>(null);

/**
 * A reference to the `BeforeInstallPrompt` event that was received when the Install App banner is shown, on Chromium browsers.
*/
export const [installPrompt, setInstallPrompt] = createSignal<BeforeInstallPromptEvent | null>(null);

export const cardBackdropShown = createMemo<boolean>(() => activeDialog() !== null);

export const [header, setHeader] = createSignal<HTMLElement | null>(null);

export const [viewMenu, setViewMenu] = createSignal<MenuDropElement | null>(null);

export const [previewMenu, setPreviewMenu] = createSignal<MenuDropElement | null>(null);

export const [workspace, setWorkspace] = createSignal<HTMLDivElement | null>(null);

export const [workspaceTabs, setWorkspaceTabs] = createSignal<HTMLDivElement | null>(null);

export const [minimizeChangeGLOBAL, setMinimizeChangeGLOBAL] = createSignal<string | null>(null);

export const [createEditorButton, setCreateEditorButton] = createSignal<HTMLButtonElement | null>(null);

export const [workspaceEditors, setWorkspaceEditors] = createSignal<HTMLDivElement | null>(null);

export const [scaler, setScaler] = createSignal<HTMLDivElement | null>(null);

export const [preview, setPreview] = createSignal<HTMLIFrameElement | null>(null);

export const [editors, setEditors] = createStore<{ [identifier: string]: Editor | undefined; }>({});

// if (appearance.parentWindow) document.documentElement.classList.add("startup-fade");
if (appearance.appleHomeScreen) document.documentElement.classList.add("apple-home-screen");
if (environment.touchDevice) document.documentElement.classList.add("touch-device");
if (environment.appleDevice) document.documentElement.classList.add("apple-device");
if (environment.macOSDevice) document.documentElement.classList.add("macOS-device");
if (support.webSharing) document.documentElement.classList.add("web-sharing");

export interface AppProps {
  setHeader: Setter<HTMLElement | null>;
  setViewMenu: Setter<MenuDropElement | null>;
  setPreviewMenu: Setter<MenuDropElement | null>;
  setWorkspace: Setter<HTMLDivElement | null>;
  setWorkspaceTabs: Setter<HTMLDivElement | null>;
  setCreateEditorButton: Setter<HTMLButtonElement | null>;
  setWorkspaceEditors: Setter<HTMLDivElement | null>;
  setScaler: Setter<HTMLDivElement | null>;
  setPreview: Setter<HTMLIFrameElement | null>;
  previewBase: Accessor<string | null>;
  setPreviewBase: Setter<string | null>;
}

export default function App(props: AppProps) {
  createEffect(() => {
const queryParameters = new URLSearchParams(window.location.search);

(async () => {
  if (window.location.href.includes("index.html")){
    history.pushState(null,"",window.location.href.replace(/index.html/,""));
  }

  if (!("serviceWorker" in navigator) || !appearance.parentWindow) return;
  if (import.meta.env.DEV) return;

  await navigator.serviceWorker.register("service-worker.js");
  if (navigator.serviceWorker.controller === null) return;

  navigator.serviceWorker.addEventListener("message",async event => {
    switch (event.data.action){
      case "clear-site-caches-complete": setActiveClearedCacheAlert(true); break;
      case "share-target": {
        for (const file of event.data.files as File[]){
          const { name } = file;
          const value = await file.text();
          createEditor({ name, value });
        }
        break;
      }
    }
  });

  document.documentElement.classList.add("service-worker-activated");

  if (queryParameters.get("share-target") !== null){
    navigator.serviceWorker.controller.postMessage({ action: "share-target" });
    removeQueryParameters(["share-target"]);
  }
})();

window.addEventListener("beforeinstallprompt",event => {
  event.preventDefault();
  setInstallPrompt(event);
  document.documentElement.classList.add("install-prompt-available");
  if (typeof theme_button === "undefined") return console.warn("Theme button not found");
  theme_button.childNodes[0]!.textContent = "Theme";
});

window.addEventListener("beforeunload",event => {
  if (unsavedWork()) return;
  if (import.meta.env.DEV) return;
  event.preventDefault();
  event.returnValue = "";
});

window.addEventListener("unload",() => {
  for (const childWindow of childWindows){
    childWindow.close();
  }
});

window.addEventListener("resize",() => {
  if (view() !== "preview"){
    setTabsVisibility();
  }
  if (view() === "split" && document.body.hasAttribute("data-scaling-active")){
    setView("split");
  }
});

window.addEventListener("blur",() => {
  if (!appearance.parentWindow) return;
  for (const menu of document.querySelectorAll<MenuDropElement>("menu-drop[data-open]")){
    menu.close();
  }
});

document.body.addEventListener("keydown",event => {
  const control = (event.ctrlKey && !environment.appleDevice);
  const command = (event.metaKey && environment.appleDevice);
  const shift = (event.shiftKey || ((event.key.toUpperCase() === event.key) && (event.key + event.key === String(Number(event.key) * 2))));
  const controlShift = (control && shift);
  const shiftCommand = (shift && command);
  const controlCommand = (event.ctrlKey && command);

  function pressed(key: string): boolean {
    return event.key.toLowerCase() === key.toLowerCase();
  }

  if (pressed("Escape")){
    event.preventDefault();
    if (event.repeat) return;
    if (activeDialog() && !document.activeElement?.matches("menu-drop[data-open]")) setActiveDialog(null);
  }
  if (((control || command) && !shift && pressed("n")) || ((controlShift || shiftCommand) && pressed("x"))){
    event.preventDefault();
    if (event.repeat) return;
    createEditor({ autoReplace: false });
  }
  if (((control || command) && pressed("w")) || ((controlShift || shiftCommand) && pressed("d"))){
    if (shift && pressed("w")) return window.close();
    event.preventDefault();
    if (event.repeat) return;
    /* Future feature: If an editor tab is focused, close that editor instead of only the active editor */
    close(activeEditor());
  }
  if (((controlShift || (event.ctrlKey && shift && !command && environment.appleDevice)) && pressed("Tab")) || ((controlShift || controlCommand) && (pressed("[") || pressed("{")))){
    event.preventDefault();
    if (event.repeat) return;
    open(getPrevious(activeEditor()));
  }
  if (((control || (event.ctrlKey && !command && environment.appleDevice)) && !shift && pressed("Tab")) || ((controlShift || controlCommand) && (pressed("]") || pressed("}")))){
    event.preventDefault();
    if (event.repeat) return;
    open(getNext(activeEditor()));
  }
  if (((controlShift || shiftCommand) && pressed("n")) || ((controlShift || shiftCommand) && pressed("c"))){
    event.preventDefault();
    if (event.repeat) return;
    createWindow();
  }
  if ((control || command) && !shift && pressed("o")){
    event.preventDefault();
    if (event.repeat) return;
    openFiles();
  }
  if ((controlShift || shiftCommand) && pressed("r")){
    event.preventDefault();
    if (event.repeat) return;
    rename(activeEditor());
  }
  if ((control || command) && !shift && pressed("s")){
    event.preventDefault();
    if (event.repeat) return;
    saveFile();
  }
  if ((controlShift || controlCommand) && (pressed("1") || pressed("!"))){
    event.preventDefault();
    if (event.repeat) return;
    setView("code");
  }
  if ((controlShift || controlCommand) && (pressed("2") || pressed("@"))){
    event.preventDefault();
    if (event.repeat) return;
    setView("split");
  }
  if ((controlShift || controlCommand) && (pressed("3") || pressed("#"))){
    event.preventDefault();
    if (event.repeat) return;
    setView("preview");
  }
  if ((controlShift || controlCommand) && (pressed("4") || pressed("$"))){
    event.preventDefault();
    if (event.repeat) return;
    setOrientation();
  }
  if ((controlShift || controlCommand) && (pressed("5") || pressed("%"))){
    event.preventDefault();
    if (event.repeat) return;
    createDisplay();
  }
  if ((controlShift || shiftCommand) && pressed("Enter")){
    event.preventDefault();
    if (event.repeat) return;
    refreshPreview({ force: true });
  }
  if ((controlShift || shiftCommand) && pressed("B")){
    event.preventDefault();
    if (event.repeat) return;
    toggleActiveDialog("preview_base_card");
  }
  if ((controlShift || shiftCommand) && pressed("f")){
    event.preventDefault();
    if (event.repeat) return;
    toggleActiveWidget("replace_text_card");
  }/*
  if ((controlShift || shiftCommand) && pressed("k")){
    event.preventDefault();
    if (event.repeat) return;
    toggleActiveWidget("color_picker_card");
  }*/
  if ((controlShift || shiftCommand) && pressed("g")){
    event.preventDefault();
    if (event.repeat) return;
    toggleActiveWidget("json_formatter_card");
  }
  if ((controlShift || shiftCommand) && pressed("y")){
    event.preventDefault();
    if (event.repeat) return;
    toggleActiveWidget("uri_encoder_card");
  }
  if ((controlShift || shiftCommand) && pressed("o")){
    event.preventDefault();
    if (event.repeat) return;
    toggleActiveWidget("uuid_generator_card");
  }
  if ((controlShift || shiftCommand) && pressed("h")){
    event.preventDefault();
    if (event.repeat) return;
    insertTemplate("html");
  }
  if ((controlShift || shiftCommand) && pressed("m")){
    event.preventDefault();
    const [minimizeWidget, setMinimizeWidget] = minimizeWidgetS();
    console.log(minimizeWidget, setMinimizeWidget);
    if (event.repeat || !activeWidget()) return;
    setMinimizeWidget!(!minimizeWidget!());
  }
  if ((control || command) && (pressed(",") || pressed("<"))){
    event.preventDefault();
    if (event.repeat) return;
    toggleActiveDialog("settings_card");
  }
},{ capture: true });

document.body.addEventListener("mousedown",event => {
  if (event.button !== 2) return;
  event.preventDefault();
  event.stopPropagation();
});

document.body.addEventListener("contextmenu",event => {
  event.preventDefault();
});

document.body.addEventListener("dragover",event => {
  event.preventDefault();
  if (event.dataTransfer === null || !(event.target instanceof Element)) return;
  event.dataTransfer.dropEffect = (event.target.matches("menu-drop, header, .Card") || event.target.closest("menu-drop, header, .Card")) ? "none" : "copy";
});

document.body.addEventListener("drop",event => {
  event.preventDefault();
  for (const menu of document.querySelectorAll<MenuDropElement>("menu-drop[data-open]")){
    menu.close();
  }
  if (event.dataTransfer === null) return;

  [...event.dataTransfer.items].forEach(async (item,index) => {
    switch (item.kind){
      case "file": {
        if (!support.fileSystem || !("getAsFileSystemHandle" in item)){
          const file = item.getAsFile();
          if (file === null) break;
          const { name } = file;
          const value = await file.text();
          createEditor({ name, value });
        } else {
          const handle = await item.getAsFileSystemHandle();
          if (!(handle instanceof FileSystemFileHandle)) break;
          const file = await handle.getFile();
          const { name } = file;
          const value = await file.text();
          createEditor({ name, value, handle });
        }
        break;
      }
      case "string": {
        if (index !== 0) break;
        const value = event.dataTransfer?.getData("text");
        if (value !== "") break;
        createEditor({ value });
        break;
      }
    }
  });
});

window.requestAnimationFrame(() => {
  createEditor({ autoCreated: true });
});

if (appearance.parentWindow){
  if (settings.defaultOrientation !== null){
    const value = settings.defaultOrientation;
    window.requestAnimationFrame(() => {
      default_orientation_setting.select(value);
    });
    setOrientation(value);
  }
  if (settings.syntaxHighlighting !== null){
    const state: boolean = settings.syntaxHighlighting;
    appearance.setSyntaxHighlighting(state);
    syntax_highlighting_setting.checked = state;
  }
  if (settings.automaticRefresh !== null){
    automatic_refresh_setting.checked = settings.automaticRefresh;
  }
  // window.setTimeout(() => {
  //   document.documentElement.classList.remove("startup-fade");
  // },50);
  Promise.all(["menu-drop","num-text"].map(tag => window.customElements.whenDefined(tag)))
    .then(async () => {
      // await new Promise(resolve => setTimeout(resolve,50));
      document.documentElement.classList.remove("startup-fade");
    });
}

if (support.fileHandling && support.fileSystem){
  window.launchQueue.setConsumer(async ({ files: handles }) => {
    for (const handle of handles){
      const file = await handle.getFile();
      const { name } = file;
      const value = await file.text();
      createEditor({ name, value, handle });
    }
    if (!environment.touchDevice){
      activeEditor()?.ref.focus({ preventScroll: true });
    }
  });
}

if (queryParameters.get("template")){
  insertTemplate("html");
  removeQueryParameters(["template"]);
}

if (queryParameters.get("settings")){
  setActiveDialog("settings_card");
  removeQueryParameters(["settings"]);
}

/**
 * Removes query parameters from the app's URL.
*/
function removeQueryParameters(entries: string[]): void {
  const parameters = new URLSearchParams(window.location.search);
  for (const entry of entries){
    parameters.delete(entry);
  }
  changeQueryParameters(parameters);
}

/**
 * Updates the app's URL query parameters to a new `URLSearchParams` object.
*/
function changeQueryParameters(parameters: URLSearchParams): void {
  let query = parameters.toString();
  if (query) query = "?" + query;
  const address = window.location.pathname + query;
  history.pushState(null,"",address);
}
  });

  return (
    <>
      <Header
        setHeader={props.setHeader}
        setViewMenu={props.setViewMenu}
        setPreviewMenu={props.setPreviewMenu}
      />
      <Main
        setWorkspace={props.setWorkspace}
        setWorkspaceTabs={props.setWorkspaceTabs}
        setCreateEditorButton={props.setCreateEditorButton}
        setWorkspaceEditors={props.setWorkspaceEditors}
        setScaler={props.setScaler}
        setPreview={props.setPreview}
        previewBase={props.previewBase}
        setPreviewBase={props.setPreviewBase}
      />
    </>
  );
}