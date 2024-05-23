import { render } from "solid-js/web";
import { Header } from "./Header.js";
import { Main } from "./Main.js";
import { appearance, setInstallPrompt, unsavedWork, childWindows, view, environment, activeDialog, activeEditor, activeWidget, support, settings, previewBase, setPreviewBase, setPreview, setScaler, scaler, setWorkspace, setWorkspaceEditors, setWorkspaceTabs, workspaceTabs, setCreateEditorButton, createEditorButton } from "./STE.js";
import "./Card.js";
import { insertTemplate } from "./Tools.js";
import Editor from "./Editor.js";
import { setView, setOrientation, createWindow, openFiles, saveFile, createDisplay, refreshPreview, setScaling, disableScaling } from "./Workspace.js";

const root: HTMLDivElement = document.querySelector("#root")!;

render(() => (
  <>
    <Header/>
    <Main
      setWorkspace={setWorkspace}
      setWorkspaceTabs={setWorkspaceTabs}
      setCreateEditorButton={setCreateEditorButton}
      setWorkspaceEditors={setWorkspaceEditors}
      setScaler={setScaler}
      setPreview={setPreview}
      previewBase={previewBase}
      setPreviewBase={setPreviewBase}
    />
  </>
), root);

const queryParameters = new URLSearchParams(window.location.search);

(async () => {
  if (window.location.href.includes("index.html")){
    history.pushState(null,"",window.location.href.replace(/index.html/,""));
  }

  if (!("serviceWorker" in navigator) || !appearance.parentWindow) return;
  if (import.meta.env.DEV) return;

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

  function activateManifest(): void {
    document.querySelector<HTMLLinkElement>("link[rel='manifest']")!.href = "manifest.webmanifest";
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
    Editor.setTabsVisibility();
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
    if (activeDialog() && !document.activeElement?.matches("menu-drop[data-open]")) activeDialog()!.close();
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
    activeEditor()?.close();
  }
  if (((controlShift || (event.ctrlKey && shift && !command && environment.appleDevice)) && pressed("Tab")) || ((controlShift || controlCommand) && (pressed("[") || pressed("{")))){
    event.preventDefault();
    if (event.repeat) return;
    activeEditor()?.getPrevious()?.open();
  }
  if (((control || (event.ctrlKey && !command && environment.appleDevice)) && !shift && pressed("Tab")) || ((controlShift || controlCommand) && (pressed("]") || pressed("}")))){
    event.preventDefault();
    if (event.repeat) return;
    activeEditor()?.getNext()?.open();
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
    activeEditor()?.rename();
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
    insertTemplate("html");
  }
  if ((controlShift || shiftCommand) && pressed("m")){
    event.preventDefault();
    if (event.repeat || !activeWidget()) return;
    if (activeWidget()){
      activeWidget()!.minimize();
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
  event.dataTransfer.dropEffect = (event.target.matches("menu-drop, header, ste-card") || event.target.closest("menu-drop, header, ste-card")) ? "none" : "copy";
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
        if (!support.fileSystem || !("getAsFileSystemHandle")){
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
          new Editor({ name, value, handle });
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

for (const menu of app_menubar.querySelectorAll("menu-drop")){
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

workspaceTabs()!.addEventListener("keydown",event => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  if (!workspaceTabs()!.contains(document.activeElement) || !(document.activeElement instanceof HTMLElement)) return;

  const identifier = document.activeElement.getAttribute("data-editor-identifier");
  if (identifier === null) return;

  event.preventDefault();

  if (event.key === "ArrowLeft"){
    Editor.query(identifier)?.getPrevious()?.tab.focus();
  }
  if (event.key === "ArrowRight"){
    Editor.query(identifier)?.getNext()?.tab.focus();
  }
});

createEditorButton()!.addEventListener("keydown",event => {
  if (event.key !== "Enter") return;
  if (event.repeat){
    event.preventDefault();
  }
});

createEditorButton()!.addEventListener("mousedown",event => {
  event.preventDefault();
});

createEditorButton()!.addEventListener("click",() => {
  new Editor({ autoReplace: false });
});

scaler()!.addEventListener("mousedown",event => {
  if (event.button !== 0) return;
  if (view() !== "split") return;
  event.preventDefault();
  document.body.setAttribute("data-scaling-change","");
  document.addEventListener("mousemove",setScaling);
  document.addEventListener("mouseup",disableScaling);
});

scaler()!.addEventListener("touchstart",event => {
  if (view() !== "split" || event.touches.length !== 1) return;
  document.body.setAttribute("data-scaling-change","");
  document.addEventListener("touchmove",setScaling,{ passive: true });
  document.addEventListener("touchend",disableScaling,{ passive: true });
},{ passive: true });

window.requestAnimationFrame(() => {
  new Editor({ autoCreated: true });
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
  Promise.all(["menu-drop","num-text","ste-card"].map(tag => window.customElements.whenDefined(tag)))
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
      new Editor({ name, value, handle });
    }
    if (!environment.touchDevice){
      activeEditor()?.focus({ preventScroll: true });
    }
  });
}

if (queryParameters.get("template")){
  insertTemplate("html");
  removeQueryParameters(["template"]);
}

if (queryParameters.get("settings")){
  settings_card.open();
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