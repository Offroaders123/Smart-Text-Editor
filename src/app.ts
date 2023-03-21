import type { Orientation } from "./Workspace.js";
import "./Card.js";
import Tools from "./Tools.js";
import { Editor, setEditorTabsVisibility } from "./Editor.js";
import { setView, setOrientation, createWindow, openFiles, saveFile, createDisplay, refreshPreview, setScaling, disableScaling } from "./Workspace.js";

for (const image of document.querySelectorAll("img")){
  image.draggable = false;
}

for (const numText of document.querySelectorAll("num-text")){
  applyEditingBehavior(numText);
}

for (const input of document.querySelectorAll<HTMLInputElement>("input:is([type='text'],[type='url'])")){
  applyEditingBehavior(input);
}

for (const checkbox of document.querySelectorAll<HTMLDivElement>(".checkbox")){
  const input = checkbox.querySelector<HTMLInputElement>("input[type='checkbox']")!;

  checkbox.addEventListener("click",() => input.click());
  checkbox.addEventListener("keydown",event => {
    if (!event.repeat && event.key == "Enter") input.click();
  });
  checkbox.addEventListener("keyup",event => {
    if (event.key == " ") input.click();
  });
  checkbox.tabIndex = 0;

  input.addEventListener("click",event => event.stopPropagation());
}

new ResizeObserver(() => {
  if (!STE.appearance.windowControlsOverlay) return;
  app_omnibox.style.setProperty("--device-pixel-ratio",window.devicePixelRatio.toFixed(2));
}).observe(app_omnibox);

for (const option of app_omnibox.querySelectorAll<HTMLButtonElement | HTMLAnchorElement>(".option")){
  option.tabIndex = -1;
  option.addEventListener("mousedown",event => event.preventDefault());
}

const queryParameters = new URLSearchParams(window.location.search);

await (async () => {
  if (STE.environment.fileProtocol) return;
  if (window.location.href.includes("index.html")){
    history.pushState(null,"",window.location.href.replace(/index.html/,""));
  }

  if (!("serviceWorker" in navigator) || !STE.appearance.parentWindow) return;
  await navigator.serviceWorker.register("service-worker.js");

  if (navigator.serviceWorker.controller === null) return;

  if (navigator.serviceWorker.controller.state === "activated"){
    activateManifest();
  }

  navigator.serviceWorker.addEventListener("message",async event => {
    switch (event.data.action){
      case "service-worker-activated": activateManifest(); break;
      case "clear-site-caches-complete": cleared_cache_card.open(); break;
      case "share-target": {
        for (const file of event.data.files as File[]){
          const { name } = file;
          const value = await file.text();
          new Editor({ name, value });
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

  function activateManifest(){
    document.querySelector<HTMLLinkElement>("link[rel='manifest']")!.href = "manifest.webmanifest";
  }
})();

window.addEventListener("beforeinstallprompt",event => {
  event.preventDefault();
  STE.installPrompt = event;
  document.documentElement.classList.add("install-prompt-available");
  theme_button.childNodes[0].textContent = "Theme";
});

window.addEventListener("beforeunload",event => {
  if (STE.unsavedWork) return;
  event.preventDefault();
  event.returnValue = "";
});

window.addEventListener("unload",() => {
  for (const window of STE.childWindows){
    window.close();
  }
});

window.addEventListener("resize",() => {
  if (STE.view !== "preview"){
    setEditorTabsVisibility();
  }
  if (STE.view === "split" && document.body.hasAttribute("data-scaling-active")){
    setView("split");
  }
});

window.addEventListener("blur",() => {
  if (!STE.appearance.parentWindow) return;
  for (const menu of document.querySelectorAll<MenuDropElement>("menu-drop[data-open]")){
    menu.close();
  }
});

document.body.addEventListener("keydown",event => {
  const control = (event.ctrlKey && !STE.environment.appleDevice);
  const command = (event.metaKey && STE.environment.appleDevice);
  const shift = (event.shiftKey || ((event.key.toUpperCase() === event.key) && (event.key + event.key === String(Number(event.key) * 2))));
  const controlShift = (control && shift);
  const shiftCommand = (shift && command);
  const controlCommand = (event.ctrlKey && command);

  function pressed(key: string){
    return event.key.toLowerCase() === key.toLowerCase();
  }

  if (pressed("Escape")){
    event.preventDefault();
    if (event.repeat) return;
    if (STE.activeDialog && !document.activeElement?.matches("menu-drop[data-open]")) STE.activeDialog.close();
  }
  if (((control || command) && !shift && pressed("n")) || ((controlShift || shiftCommand) && pressed("x"))){
    event.preventDefault();
    if (event.repeat) return;
    new Editor({ autoReplace: false });
  }
  if (((control || command) && pressed("w")) || ((controlShift || shiftCommand) && pressed("d"))){
    if (shift && pressed("w")) return window.close();
    event.preventDefault();
    if (event.repeat) return;
    /* Future feature: If an editor tab is focused, close that editor instead of only the active editor */
    if (STE.activeEditor !== null){
      Editor.close(STE.activeEditor);
    }
  }
  if (((controlShift || (event.ctrlKey && shift && !command && STE.environment.appleDevice)) && pressed("Tab")) || ((controlShift || controlCommand) && (pressed("[") || pressed("{")))){
    event.preventDefault();
    if (event.repeat) return;
    if (STE.activeEditor === null) return;
    const previous = Editor.getPrevious(STE.activeEditor);
    if (previous === null) return;
    Editor.open(previous);
  }
  if (((control || (event.ctrlKey && !command && STE.environment.appleDevice)) && !shift && pressed("Tab")) || ((controlShift || controlCommand) && (pressed("]") || pressed("}")))){
    event.preventDefault();
    if (event.repeat) return;
    if (STE.activeEditor === null) return;
    const next = Editor.getNext(STE.activeEditor);
    if (next === null) return;
    Editor.open(next);
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
    if (STE.activeEditor !== null){
      Editor.rename(STE.activeEditor);
    }
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
    preview_base_card.open();
  }
  if ((controlShift || shiftCommand) && pressed("f")){
    event.preventDefault();
    if (event.repeat) return;
    replace_text_card.open();
  }/*
  if ((controlShift || shiftCommand) && pressed("k")){
    event.preventDefault();
    if (event.repeat) return;
    color_picker_card.open();
  }*/
  if ((controlShift || shiftCommand) && pressed("g")){
    event.preventDefault();
    if (event.repeat) return;
    json_formatter_card.open();
  }
  if ((controlShift || shiftCommand) && pressed("y")){
    event.preventDefault();
    if (event.repeat) return;
    uri_encoder_card.open();
  }
  if ((controlShift || shiftCommand) && pressed("o")){
    event.preventDefault();
    if (event.repeat) return;
    uuid_generator_card.open();
  }
  if ((controlShift || shiftCommand) && pressed("h")){
    event.preventDefault();
    if (event.repeat) return;
    Tools.insertTemplate("html");
  }
  if ((controlShift || shiftCommand) && pressed("m")){
    event.preventDefault();
    if (event.repeat || !STE.activeWidget) return;
    if (STE.activeWidget){
      STE.activeWidget.minimize();
    }
  }
  if ((control || command) && (pressed(",") || pressed("<"))){
    event.preventDefault();
    if (event.repeat) return;
    settings_card.open();
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
  event.dataTransfer.dropEffect = (event.target.matches("menu-drop, header, .card") || event.target.closest("menu-drop, header, .card")) ? "none" : "copy";
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
        if (!STE.support.fileSystem || !("getAsFileSystemHandle")){
          const file = item.getAsFile();
          if (file === null) break;
          const { name } = file;
          const value = await file.text();
          new Editor({ name, value });
        } else {
          const handle = await item.getAsFileSystemHandle();
          if (!(handle instanceof FileSystemFileHandle)) break;
          const file = await handle.getFile();
          const { name } = file;
          const value = await file.text();
          const { identifier } = new Editor({ name, value });
          STE.fileHandles[identifier] = handle;
        }
        break;
      }
      case "string": {
        if (index !== 0) break;
        const value = event.dataTransfer?.getData("text");
        if (value !== "") break;
        new Editor({ value });
        break;
      }
    }
  });
});

for (const menu of app_menubar.querySelectorAll<MenuDropElement>("menu-drop")){
  menu.addEventListener("pointerenter",event => {
    if (event.pointerType !== "mouse") return;
    if (app_menubar.querySelectorAll("menu-drop:not([data-alternate])[data-open]").length === 0 || menu.matches("[data-alternate]") || menu.matches("[data-open]")) return;
    menu.opener.focus();
    for (const menu of app_menubar.querySelectorAll<MenuDropElement>("menu-drop[data-open]")){
      menu.close();
    }
    menu.open();
  });
}

workspace_tabs.addEventListener("keydown",event => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  if (!workspace_tabs.contains(document.activeElement) || !(document.activeElement instanceof HTMLElement)) return;

  const identifier = document.activeElement.getAttribute("data-editor-identifier");
  if (identifier === null) return;

  const previousEditor = Editor.getPrevious(identifier);
  const nextEditor = Editor.getNext(identifier);
  event.preventDefault();

  if (event.key === "ArrowLeft"){
    STE.query(previousEditor).tab?.focus();
  }
  if (event.key === "ArrowRight"){
    STE.query(nextEditor).tab?.focus();
  }
});

create_editor_button.addEventListener("keydown",event => {
  if (event.key !== "Enter") return;
  if (event.repeat){
    event.preventDefault();
  }
});

create_editor_button.addEventListener("mousedown",event => {
  event.preventDefault();
});

create_editor_button.addEventListener("click",() => {
  new Editor({ autoReplace: false });
});

scaler.addEventListener("mousedown",event => {
  if (event.button !== 0) return;
  if (STE.view !== "split") return;
  event.preventDefault();
  document.body.setAttribute("data-scaling-change","");
  document.addEventListener("mousemove",setScaling);
  document.addEventListener("mouseup",disableScaling);
});

scaler.addEventListener("touchstart",event => {
  if (STE.view !== "split" || event.touches.length !== 1) return;
  document.body.setAttribute("data-scaling-change","");
  document.addEventListener("touchmove",setScaling,{ passive: true });
  document.addEventListener("touchend",disableScaling,{ passive: true });
},{ passive: true });

card_backdrop.addEventListener("click",() => {
  if (STE.activeDialog === null) return;
  STE.activeDialog.close();
});

preview_base_input.placeholder = document.baseURI;

preview_base_input.setWidth = () => {
  preview_base_input.style.setProperty("--input-count",preview_base_input.value.length.toString());
};

preview_base_input.setValue = value => {
  preview_base_input.value = value;
  preview_base_input.setWidth();
};

preview_base_input.reset = () => {
  preview_base_input.setValue("");
  if (!STE.settings.has("preview-base")) return;
  STE.settings.remove("preview-base");
  refreshPreview({ force: true });
};

preview_base_input.style.setProperty("--placeholder-count",preview_base_input.placeholder.length.toString());

preview_base_input.addEventListener("input",() => {
  preview_base_input.setWidth();
});

preview_base_input.addEventListener("change",event => {
  if (!(event.target instanceof HTMLInputElement)) return;
  const empty = event.target.matches(":placeholder-shown");
  const valid = event.target.matches(":valid");

  if (empty || !valid){
    STE.settings.remove("preview-base");
  }
  if (!empty && valid){
    STE.settings.set("preview-base",event.target.value);
  }
  if (empty || valid){
    refreshPreview({ force: true });
  }
});

generator_output.addEventListener("click",() => {
  generator_output.select();
});

generator_output.addEventListener("keydown",() => {
  generator_output.click();
});

window.requestAnimationFrame(() => {
  new Editor({ autoCreated: true });
});

if (STE.appearance.parentWindow){
  if (STE.settings.get("default-orientation")){
    const value = STE.settings.get("default-orientation") as Orientation;
    window.requestAnimationFrame(() => {
      default_orientation_setting.select(value);
    });
    setOrientation(value);
  }
  if (STE.settings.get("syntax-highlighting") != undefined){
    const state = Boolean(STE.settings.get("syntax-highlighting")!);
    STE.appearance.setSyntaxHighlighting(state);
    syntax_highlighting_setting.checked = state;
  }
  if (STE.settings.get("automatic-refresh") != undefined){
    automatic_refresh_setting.checked = Boolean(STE.settings.get("automatic-refresh")!);
  }
  if (STE.settings.get("preview-base")){
    preview_base_input.setValue(STE.settings.get("preview-base")!);
  }
  window.setTimeout(() => {
    document.documentElement.classList.remove("startup-fade");
  },50);
}

if (STE.support.fileHandling && STE.support.fileSystem){
  window.launchQueue.setConsumer(async ({ files: handles }) => {
    for (const handle of handles){
      const file = await handle.getFile();
      const { name } = file;
      const value = await file.text();
      const { identifier } = new Editor({ name, value });
      STE.fileHandles[identifier] = handle;
    }
    if (!STE.environment.touchDevice){
      STE.query().container?.focus({ preventScroll: true });
    }
  });
}

if (queryParameters.get("template")){
  Tools.insertTemplate("html");
  removeQueryParameters(["template"]);
}

if (queryParameters.get("settings")){
  settings_card.open();
  removeQueryParameters(["settings"]);
}

/**
 * Gets a style property value for a given element.
*/
export function getElementStyle({ element, pseudo = null, property }: { element: Element; pseudo?: string | null; property: string; }){
  return window.getComputedStyle(element,pseudo).getPropertyValue(property);
}

/**
 * Applies the app's behavior defaults, like Drag and Drop handling, to `<input>` and `<num-text>` elements.
*/
export function applyEditingBehavior(element: HTMLInputElement | NumTextElement){
  const type = element.tagName.toLowerCase();

  (element as HTMLElement).addEventListener("dragover",event => {
    event.stopPropagation();
    if (event.dataTransfer === null) return;
    event.dataTransfer.dropEffect = "copy";
  });

  (element as HTMLElement).addEventListener("drop",event => {
    if (event.dataTransfer === null) return;
    if ([...event.dataTransfer.items][0].kind === "file") return;
    event.stopPropagation();
    for (const menu of document.querySelectorAll<MenuDropElement>("menu-drop[data-open]")){
      menu.close();
    }
  });

  if (type === "input"){
    element.spellcheck = false;
    // @ts-expect-error
    element.autocomplete = "off";
    element.autocapitalize = "none";
    element.setAttribute("autocorrect","off");
  }

  if (type === "num-text"){
    if (!(element instanceof NumTextElement)) return;
    element.colorScheme.set("dark");
    element.themes.remove("vanilla-appearance");
    const scrollbarStyles = document.createElement("style");
    scrollbarStyles.textContent = scrollbar_styles.textContent;
    element.shadowRoot?.insertBefore(scrollbarStyles,element.container);
  }
}

/**
 * Sets the title of the window.
*/
export function setTitle({ content = "", reset = false }: { content?: string; reset?: boolean; } | undefined = {}){
  document.title = `Smart Text Editor${(content && !reset) ? ` - ${content}` : ""}`;
}

/**
 * Removes query parameters from the app's URL.
*/
function removeQueryParameters(entries: string[]){
  const parameters = new URLSearchParams(window.location.search);
  for (const entry of entries){
    parameters.delete(entry);
  }
  changeQueryParameters(parameters);
}

/**
 * Updates the app's URL query parameters to a new `URLSearchParams` object.
*/
function changeQueryParameters(parameters: URLSearchParams){
  let query = parameters.toString();
  if (query) query = "?" + query;
  const address = window.location.pathname + query;
  history.pushState(null,"",address);
}

/**
 * Shows the PWA Install Prompt, if the `BeforeInstallPrompt` event was fired when the app first started.
*/
export async function showInstallPrompt(){
  if (STE.installPrompt === null) return;
  STE.installPrompt.prompt();
  const result = await STE.installPrompt.userChoice;
  if (result.outcome !== "accepted") return;
  document.documentElement.classList.remove("install-prompt-available");
  theme_button.childNodes[0].textContent = "Customize Theme";
}

/**
 * Clears the Service Worker cache, if the user confirms doing so.
*/
export function clearSiteCaches(){
  const hasConfirmed = confirm("Are you sure you would like to clear all app caches?\nSmart Text Editor will no longer work offline until an Internet connection is available.");
  if (hasConfirmed){
    navigator.serviceWorker.controller?.postMessage({ action: "clear-site-caches" });
  }
}

window.showInstallPrompt = showInstallPrompt;
window.clearSiteCaches = clearSiteCaches;

declare global {
  interface Window {
    showInstallPrompt: typeof showInstallPrompt;
    clearSiteCaches: typeof clearSiteCaches;
  }
}