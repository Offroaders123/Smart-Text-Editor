import { createEffect } from "solid-js";
import { Header } from "./Header.js";
import { Main } from "./Main.js";
import { appearance, setInstallPrompt, unsavedWork, childWindows, view, environment, activeDialog, activeEditor, activeWidget, support, settings } from "./STE.js";
import { closeCard, minimizeCard, openCard } from "./Card.js";
import { insertTemplate } from "./Tools.js";
import { close, createEditor, getNext, getPrevious, open, rename, setTabsVisibility } from "./Editor.js";
import { setView, setOrientation, createWindow, openFiles, saveFile, createDisplay, refreshPreview } from "./Workspace.js";

import type { Accessor, Setter } from "solid-js";

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
      case "clear-site-caches-complete": openCard(cleared_cache_card.id); break;
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
    if (activeDialog() && !document.activeElement?.matches("menu-drop[data-open]")) closeCard(activeDialog()!);
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
    openCard(preview_base_card.id);
  }
  if ((controlShift || shiftCommand) && pressed("f")){
    event.preventDefault();
    if (event.repeat) return;
    openCard(replace_text_card.id);
  }/*
  if ((controlShift || shiftCommand) && pressed("k")){
    event.preventDefault();
    if (event.repeat) return;
    openCard(color_picker_card.id);
  }*/
  if ((controlShift || shiftCommand) && pressed("g")){
    event.preventDefault();
    if (event.repeat) return;
    openCard(json_formatter_card.id);
  }
  if ((controlShift || shiftCommand) && pressed("y")){
    event.preventDefault();
    if (event.repeat) return;
    openCard(uri_encoder_card.id);
  }
  if ((controlShift || shiftCommand) && pressed("o")){
    event.preventDefault();
    if (event.repeat) return;
    openCard(uuid_generator_card.id);
  }
  if ((controlShift || shiftCommand) && pressed("h")){
    event.preventDefault();
    if (event.repeat) return;
    insertTemplate("html");
  }
  if ((controlShift || shiftCommand) && pressed("m")){
    event.preventDefault();
    if (event.repeat || !activeWidget()) return;
    if (activeWidget()){
      minimizeCard(activeWidget()!);
    }
  }
  if ((control || command) && (pressed(",") || pressed("<"))){
    event.preventDefault();
    if (event.repeat) return;
    openCard(settings_card.id);
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
  openCard(settings_card.id);
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